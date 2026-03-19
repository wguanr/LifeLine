/**
 * 调试/测试专用路由
 * Phase 2: 提供世界 Tick 触发、动态价格查询、引擎状态查看等调试接口
 * 
 * 注意：生产环境应禁用这些接口
 */

import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import * as itemService from '../services/item.service.js'
import * as worldService from '../services/world.service.js'
import * as eventService from '../services/event.service.js'
import * as resourceService from '../services/resource.service.js'
import * as worldTick from '../jobs/world-tick.job.js'
import { socialService } from '../services/social.service.js'
import { informationService } from '../services/information.service.js'
import { realtimeService } from '../services/realtime.service.js'

const router = Router()

// ==================== 物品动态价格 ====================

/**
 * GET /api/debug/items/prices — 获取所有物品的动态价格
 */
router.get('/items/prices', async (_req: Request, res: Response) => {
  try {
    const items = await itemService.getAllItemsWithPrices()
    res.json({
      count: items.length,
      items: items.map(i => ({
        id: i.id,
        name: i.name,
        icon: i.icon,
        rarity: i.rarity,
        dynamicPrice: i.dynamicPrice,
      })),
    })
  } catch (err) {
    console.error('获取动态价格失败:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

/**
 * GET /api/debug/items/:id/price — 获取单个物品的动态价格详情
 */
router.get('/items/:id/price', async (req: Request, res: Response) => {
  try {
    const price = await itemService.getDynamicPrice(req.params.id)
    if (!price) {
      res.status(404).json({ error: '物品不存在' })
      return
    }
    res.json({ itemId: req.params.id, price })
  } catch (err) {
    console.error('获取物品价格失败:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// ==================== 世界 Tick ====================

/**
 * POST /api/debug/world/tick — 手动触发一次世界 Tick
 */
router.post('/world/tick', async (_req: Request, res: Response) => {
  try {
    const result = await worldTick.executeWorldTick()
    res.json({
      message: 'Tick 执行成功',
      result,
    })
  } catch (err) {
    console.error('世界 Tick 失败:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

/**
 * GET /api/debug/world/tick-history — 获取 Tick 历史
 */
router.get('/world/tick-history', async (_req: Request, res: Response) => {
  try {
    const history = worldTick.getTickHistory()
    res.json({
      count: history.length,
      history: history.slice(-20), // 最近 20 条
    })
  } catch (err) {
    console.error('获取 Tick 历史失败:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

/**
 * POST /api/debug/world/set-dimensions — 直接设置世界维度（测试用）
 */
router.post('/world/set-dimensions', async (req: Request, res: Response) => {
  try {
    const { stability, prosperity, freedom, knowledge, solidarity } = req.body

    // 计算与当前值的差值
    const current = await worldService.getCurrentWorldState()
    const changes: Partial<worldService.WorldDimensions> = {}

    if (stability !== undefined) changes.stability = stability - current.dimensions.stability
    if (prosperity !== undefined) changes.prosperity = prosperity - current.dimensions.prosperity
    if (freedom !== undefined) changes.freedom = freedom - current.dimensions.freedom
    if (knowledge !== undefined) changes.knowledge = knowledge - current.dimensions.knowledge
    if (solidarity !== undefined) changes.solidarity = solidarity - current.dimensions.solidarity

    const newState = await worldService.updateDimensions(changes)
    res.json({
      message: '世界维度已更新',
      world: newState,
      epochInfo: worldService.getEpochInfo(newState.epoch),
    })
  } catch (err) {
    console.error('设置世界维度失败:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// ==================== 引擎状态总览 ====================

/**
 * GET /api/debug/status — 获取所有引擎的当前状态总览
 */
router.get('/status', async (_req: Request, res: Response) => {
  try {
    const worldState = await worldService.getCurrentWorldState()
    const epochInfo = worldService.getEpochInfo(worldState.epoch)
    const allEpochs = worldService.getAllEpochs()
    const tickHistory = worldTick.getTickHistory()
    const items = await itemService.getAllItemsWithPrices()

    // 统计物品价格分布
    const priceStats = {
      totalItems: items.length,
      avgBondingMultiplier: items.length > 0
        ? Math.round(items.reduce((s, i) => s + i.dynamicPrice.bondingMultiplier, 0) / items.length * 100) / 100
        : 0,
      avgWorldSensitivity: items.length > 0
        ? Math.round(items.reduce((s, i) => s + i.dynamicPrice.worldSensitivityMultiplier, 0) / items.length * 100) / 100
        : 0,
      trendDistribution: {
        rising: items.filter(i => i.dynamicPrice.trend === 'rising').length,
        stable: items.filter(i => i.dynamicPrice.trend === 'stable').length,
        falling: items.filter(i => i.dynamicPrice.trend === 'falling').length,
      },
    }

    res.json({
      world: {
        epoch: worldState.epoch,
        epochName: epochInfo.name,
        epochDescription: epochInfo.description,
        dimensions: worldState.dimensions,
        tideMultiplier: worldState.tideMultiplier,
        updatedAt: new Date(worldState.updatedAt).toISOString(),
      },
      allEpochs,
      tickStats: {
        totalTicks: tickHistory.length,
        lastTick: tickHistory.length > 0 ? tickHistory[tickHistory.length - 1] : null,
      },
      itemPriceStats: priceStats,
    })
  } catch (err) {
    console.error('获取引擎状态失败:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// ==================== 模拟选择（测试结算） ====================

/**
 * POST /api/debug/simulate-choice — 模拟一次选择结算（不实际写入）
 * 用于测试非对称结算的效果
 */
router.post('/simulate-choice', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { eventId, stageId, choiceId, choiceText, outcome } = req.body

    // 获取当前状态快照（不修改）
    const wallet = await resourceService.getWallet(req.user!.userId)
    const tags = await resourceService.getUserTags(req.user!.userId)
    const worldState = await worldService.getCurrentWorldState()

    // 计算结算预览（不实际执行）
    const eventDef = await eventService.getEventById(eventId)
    const eventTags = eventDef ? extractEventTagsFromDef(eventDef) : []

    // 身份乘数
    const identityMul = calculateIdentityMulPreview(tags, eventTags)
    const tideMul = worldState.tideMultiplier
    const epochBonus = getEpochBonusPreview(worldState.epoch)

    // 计算预期收益
    const rewards = outcome?.rewards || {}
    const penalties = outcome?.penalties || {}

    const preview = {
      currentWallet: wallet,
      currentTags: tags.map(t => ({ tagId: t.tagId, weight: t.weight })),
      worldState: {
        epoch: worldState.epoch,
        dimensions: worldState.dimensions,
        tideMultiplier: tideMul,
      },
      settlement: {
        identityMultiplier: Math.round(identityMul * 100) / 100,
        tideMultiplier: tideMul,
        epochBonus,
        estimatedRewards: {
          time: Math.round((rewards.time || 0) * identityMul * (tideMul.time || 1) * epochBonus),
          energy: Math.round((rewards.energy || 0) * identityMul * (tideMul.energy || 1) * epochBonus),
          reputation: Math.round((rewards.reputation || 0) * identityMul * (tideMul.reputation || 1) * epochBonus),
        },
        estimatedCosts: {
          time: Math.round((penalties.time || 0) / Math.sqrt(tideMul.time || 1)),
          energy: Math.round((penalties.energy || 0) / Math.sqrt(tideMul.energy || 1)),
          reputation: Math.round((penalties.reputation || 0) / Math.sqrt(tideMul.reputation || 1)),
        },
      },
      estimatedWalletAfter: {
        time: wallet.time
          - Math.round((penalties.time || 0) / Math.sqrt(tideMul.time || 1))
          + Math.round((rewards.time || 0) * identityMul * (tideMul.time || 1) * epochBonus),
        energy: wallet.energy
          - Math.round((penalties.energy || 0) / Math.sqrt(tideMul.energy || 1))
          + Math.round((rewards.energy || 0) * identityMul * (tideMul.energy || 1) * epochBonus),
        reputation: wallet.reputation
          - Math.round((penalties.reputation || 0) / Math.sqrt(tideMul.reputation || 1))
          + Math.round((rewards.reputation || 0) * identityMul * (tideMul.reputation || 1) * epochBonus),
      },
    }

    res.json({ preview })
  } catch (err: any) {
    console.error('模拟选择失败:', err)
    res.status(500).json({ error: err.message || '服务器内部错误' })
  }
})

// ==================== 用户状态重置（测试用） ====================

/**
 * POST /api/debug/reset-user — 重置当前用户的钱包和标签
 */
router.post('/reset-user', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { time = 1000, energy = 100, reputation = 0 } = req.body

    const { db, schema } = await import('../db/index.js')
    const { eq } = await import('drizzle-orm')

    await db.update(schema.llUsers).set({
      walletTime: time,
      walletEnergy: energy,
      walletReputation: reputation,
      tags: JSON.stringify([]),
      inventory: JSON.stringify([]),
      history: JSON.stringify({ currentEvents: [], completedEvents: [] }),
      lastActiveAt: Date.now(),
    }).where(eq(schema.llUsers.id, req.user!.userId))

    res.json({
      message: '用户状态已重置',
      wallet: { time, energy, reputation },
    })
  } catch (err) {
    console.error('重置用户失败:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// ==================== 辅助函数 ====================

function extractEventTagsFromDef(event: any): string[] {
  const tags: string[] = []
  if (event.stages) {
    for (const stage of event.stages) {
      if (stage.choices) {
        for (const choice of stage.choices) {
          if (choice.outcome?.tags) {
            tags.push(...Object.keys(choice.outcome.tags))
          }
        }
      }
    }
  }
  return [...new Set(tags)]
}

function calculateIdentityMulPreview(userTags: resourceService.UserTag[], eventTags: string[]): number {
  if (userTags.length === 0) return 1.0
  if (eventTags.length === 0) {
    const avgWeight = userTags.reduce((sum, t) => sum + t.weight, 0) / userTags.length
    return Math.max(0.8, Math.min(1.3, 0.9 + avgWeight / 200))
  }
  let matchScore = 0
  let matchCount = 0
  for (const eventTag of eventTags) {
    const userTag = userTags.find(t => t.tagId === eventTag)
    if (userTag) {
      matchCount++
      matchScore += Math.log(1 + userTag.weight) / Math.log(101)
    }
  }
  const matchRatio = eventTags.length > 0 ? matchCount / eventTags.length : 0
  const depthScore = matchCount > 0 ? matchScore / matchCount : 0
  const combinedScore = matchRatio * 0.6 + depthScore * 0.4
  return 0.7 + combinedScore * 1.1
}

function getEpochBonusPreview(epoch: string): number {
  const bonuses: Record<string, number> = {
    genesis: 1.0,
    golden_age: 1.2,
    turbulence: 0.85,
    enlightenment: 1.15,
    solidarity: 1.1,
    dark_age: 0.7,
  }
  return bonuses[epoch] ?? 1.0
}

// ==================== Phase 3: 社交/信息/实时状态 ====================

/**
 * GET /api/debug/phase3/status — Phase 3 引擎状态总览
 */
router.get('/phase3/status', async (_req: Request, res: Response) => {
  try {
    const wsStatus = realtimeService.getStatus()
    const infoMarket = await informationService.getInformationMarketStats()

    res.json({
      websocket: wsStatus,
      informationMarket: infoMarket,
      engines: ['social', 'information', 'realtime'],
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /api/debug/social/create-test-users — 创建测试用户用于社交测试
 */
router.post('/social/create-test-users', async (_req: Request, res: Response) => {
  try {
    const { db: database, schema: s } = await import('../db/index.js')
    const bcryptMod = await import('bcryptjs')
    const bcryptLib = bcryptMod.default || bcryptMod
    const crypto = await import('crypto')

    const testUsers = [
      { nickname: 'Alice', email: 'alice@test.com' },
      { nickname: 'Bob', email: 'bob@test.com' },
      { nickname: 'Charlie', email: 'charlie@test.com' },
    ]

    const created: any[] = []
    for (const u of testUsers) {
      const id = crypto.randomUUID()
      const hash = bcryptLib.hashSync('test123', 10)
      const now = Date.now()

      try {
        await database.insert(s.llUsers).values({
          id,
          email: u.email,
          passwordHash: hash,
          nickname: u.nickname,
          avatar: ['\ud83d\udc69', '\ud83d\udc68', '\ud83e\uddd1'][created.length % 3],
          bio: `Test user ${u.nickname}`,
          walletTime: 1000,
          walletEnergy: 100,
          walletReputation: 50,
          tags: JSON.stringify([
            { tagId: 'tech', weight: Math.random() * 50 + 10 },
            { tagId: 'social', weight: Math.random() * 30 + 5 },
          ]),
          inventory: '[]',
          history: '{}',
          createdAt: now,
          lastActiveAt: now,
        })
        created.push({ id, ...u })
      } catch (e: any) {
        // User may already exist
        const { eq } = await import('drizzle-orm')
        const existing = await database.select()
          .from(s.llUsers)
          .where(eq(s.llUsers.email, u.email))
          .limit(1)
        if (existing.length > 0) {
          created.push({ id: existing[0].id, ...u, note: 'already exists' })
        }
      }
    }

    res.json({ success: true, users: created })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /api/debug/social/setup-network — 在测试用户之间建立社交网络
 */
router.post('/social/setup-network', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { db: database, schema: s } = await import('../db/index.js')
    const { ne } = await import('drizzle-orm')

    const allUsers = await database.select()
      .from(s.llUsers)
      .limit(10)

    const currentUserId = req.user!.userId
    const otherUsers = allUsers.filter(u => u.id !== currentUserId)

    const results: any[] = []
    for (const other of otherUsers) {
      // Current user follows others
      const rel = await socialService.follow(currentUserId, other.id)
      results.push({ action: 'follow', from: currentUserId, to: other.id, trust: rel.trustValue })

      // Others follow current user back (mutual)
      const relBack = await socialService.follow(other.id, currentUserId)
      results.push({ action: 'follow_back', from: other.id, to: currentUserId, trust: relBack.trustValue })

      // Simulate some positive interactions
      for (let i = 0; i < 3; i++) {
        const interaction = await socialService.recordInteraction(currentUserId, other.id, 'positive')
        results.push({ action: 'interact', with: other.nickname, trust: interaction.trustAfter })
      }
    }

    res.json({ success: true, actions: results.length, results })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /api/debug/info/generate-all — 为所有活跃事件生成信息
 */
router.post('/info/generate-all', async (_req: Request, res: Response) => {
  try {
    const { db: database, schema: s } = await import('../db/index.js')
    const { eq } = await import('drizzle-orm')

    const events = await database.select()
      .from(s.llEvents)
      .where(eq(s.llEvents.status, 'active'))

    let totalGenerated = 0
    for (const event of events) {
      const pieces = await informationService.generateEventInformation(event.id)
      totalGenerated += pieces.length
    }

    res.json({ success: true, eventsProcessed: events.length, totalInfoGenerated: totalGenerated })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /api/debug/info/force-rumor — 强制生成谣言（跳过随机概率）
 */
router.post('/info/force-rumor', async (_req: Request, res: Response) => {
  try {
    // Call generateRumor multiple times until one is generated
    let rumor = null
    for (let i = 0; i < 20; i++) {
      rumor = await informationService.generateRumor()
      if (rumor) break
    }
    res.json({ success: !!rumor, rumor })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * GET /api/debug/world/snapshots — 获取世界历史快照
 */
router.get('/world/snapshots', async (_req: Request, res: Response) => {
  try {
    const { db: database, schema: s } = await import('../db/index.js')
    const { desc } = await import('drizzle-orm')

    const snapshots = await database.select()
      .from(s.llWorldSnapshots)
      .orderBy(desc(s.llWorldSnapshots.createdAt))
      .limit(50)

    res.json({ count: snapshots.length, snapshots })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
