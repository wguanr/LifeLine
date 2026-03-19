/**
 * 游戏核心 API 路由
 * Phase 1: 接入 Service 层，提供完整的游戏数据 API
 */

import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import * as eventService from '../services/event.service.js'
import * as resourceService from '../services/resource.service.js'
import * as worldService from '../services/world.service.js'
import { db, schema } from '../db/index.js'
import { eq } from 'drizzle-orm'

const router = Router()

// ==================== 事件 API ====================

/**
 * GET /api/events — 获取所有活跃事件
 */
router.get('/events', async (_req: Request, res: Response) => {
  try {
    const events = await eventService.getActiveEvents()
    res.json({ events })
  } catch (err) {
    console.error('获取事件列表失败:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

/**
 * GET /api/events/:id — 获取单个事件详情
 */
router.get('/events/:id', async (req: Request, res: Response) => {
  try {
    const event = await eventService.getEventById(req.params.id)
    if (!event) {
      res.status(404).json({ error: '事件不存在' })
      return
    }
    res.json({ event })
  } catch (err) {
    console.error('获取事件详情失败:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

/**
 * POST /api/events/:id/start — 开始参与事件
 */
router.post('/events/:id/start', authMiddleware, async (req: Request, res: Response) => {
  try {
    await eventService.startEvent(req.user!.userId, req.params.id)
    res.json({ ok: true })
  } catch (err: any) {
    console.error('开始事件失败:', err)
    res.status(400).json({ error: err.message || '操作失败' })
  }
})

/**
 * POST /api/events/:id/complete — 完成事件
 */
router.post('/events/:id/complete', authMiddleware, async (req: Request, res: Response) => {
  try {
    await eventService.completeEvent(req.user!.userId, req.params.id)
    res.json({ ok: true })
  } catch (err: any) {
    console.error('完成事件失败:', err)
    res.status(400).json({ error: err.message || '操作失败' })
  }
})

// ==================== 选择 API（升级版） ====================

/**
 * POST /api/choices — 记录用户选择并执行非对称结算
 */
router.post('/choices', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { eventId, stageId, choiceId, choiceText, outcome } = req.body

    // 兼容旧格式：如果没有 outcome 字段，从 resultText/cost/reward 构建
    const resolvedOutcome = outcome || {
      resultText: req.body.resultText,
      rewards: req.body.reward,
      penalties: req.body.cost,
    }

    const result = await eventService.processChoice(
      req.user!.userId,
      eventId,
      stageId,
      choiceId,
      choiceText || '',
      resolvedOutcome
    )

    res.status(201).json({
      id: result.choiceRecordId,
      wallet: result.walletAfter,
      tags: result.tagsAfter,
    })
  } catch (err: any) {
    console.error('记录选择失败:', err)
    res.status(500).json({ error: err.message || '服务器内部错误' })
  }
})

/**
 * GET /api/choices — 获取当前用户的选择历史
 */
router.get('/choices', authMiddleware, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50
    const choices = await eventService.getUserChoices(req.user!.userId, limit)
    res.json({ choices })
  } catch (err) {
    console.error('获取选择历史失败:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// ==================== 物品 API ====================

/**
 * GET /api/items — 获取所有可见物品
 */
router.get('/items', async (_req: Request, res: Response) => {
  try {
    const items = await db.select().from(schema.llItems)
      .where(eq(schema.llItems.visible, true))

    const formatted = items.map(i => ({
      id: i.id,
      name: i.name,
      description: i.description,
      icon: i.icon,
      rarity: i.rarity,
      category: i.category,
      mintCost: JSON.parse(i.mintCost),
      effects: JSON.parse(i.effects),
      tags: JSON.parse(i.tags),
      featureTags: JSON.parse(i.featureTags),
      story: i.story,
      image: i.image,
      visible: i.visible,
      stackable: i.stackable,
      maxStack: i.maxStack,
      maxMint: i.maxMint,
      mintedCount: i.mintedCount,
      createdAt: i.createdAt,
    }))

    res.json({ items: formatted })
  } catch (err) {
    console.error('获取物品列表失败:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

/**
 * POST /api/items/:id/buy — 购买物品
 */
router.post('/items/:id/buy', authMiddleware, async (req: Request, res: Response) => {
  try {
    const itemId = req.params.id

    // 从数据库获取物品定义
    const items = await db.select().from(schema.llItems)
      .where(eq(schema.llItems.id, itemId)).limit(1)

    if (items.length === 0) {
      res.status(404).json({ error: '物品不存在' })
      return
    }

    const item = items[0]
    const result = await resourceService.buyItem(req.user!.userId, {
      id: item.id,
      name: item.name,
      mintCost: JSON.parse(item.mintCost),
      tags: JSON.parse(item.tags),
    })

    // 更新铸造计数
    await db.update(schema.llItems).set({
      mintedCount: item.mintedCount + 1,
    }).where(eq(schema.llItems.id, itemId))

    res.json({
      ok: true,
      wallet: result.wallet,
      inventory: result.inventory,
      tags: result.tags,
    })
  } catch (err: any) {
    console.error('购买物品失败:', err)
    res.status(400).json({ error: err.message || '购买失败' })
  }
})

// ==================== 标签定义 API ====================

/**
 * GET /api/tags — 获取所有标签定义
 */
router.get('/tags', async (_req: Request, res: Response) => {
  try {
    const tags = await db.select().from(schema.llTagDefinitions)
    res.json({ tags })
  } catch (err) {
    console.error('获取标签列表失败:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// ==================== 用户资源 API ====================

/**
 * GET /api/wallet — 获取当前用户钱包
 */
router.get('/wallet', authMiddleware, async (req: Request, res: Response) => {
  try {
    const wallet = await resourceService.getWallet(req.user!.userId)
    res.json({ wallet })
  } catch (err) {
    console.error('获取钱包失败:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

/**
 * GET /api/user/tags — 获取当前用户的标签（身份光谱）
 */
router.get('/user/tags', authMiddleware, async (req: Request, res: Response) => {
  try {
    const tags = await resourceService.getUserTags(req.user!.userId)
    res.json({ tags })
  } catch (err) {
    console.error('获取用户标签失败:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

/**
 * GET /api/inventory — 获取当前用户背包
 */
router.get('/inventory', authMiddleware, async (req: Request, res: Response) => {
  try {
    const inventory = await resourceService.getInventory(req.user!.userId)
    res.json({ inventory })
  } catch (err) {
    console.error('获取背包失败:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

/**
 * GET /api/user/history — 获取当前用户历史记录
 */
router.get('/user/history', authMiddleware, async (req: Request, res: Response) => {
  try {
    const history = await resourceService.getUserHistory(req.user!.userId)
    res.json({ history })
  } catch (err) {
    console.error('获取用户历史失败:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// ==================== 世界状态 API ====================

/**
 * GET /api/world — 获取当前世界状态
 */
router.get('/world', async (_req: Request, res: Response) => {
  try {
    const world = await worldService.getCurrentWorldState()
    const epochInfo = worldService.getEpochInfo(world.epoch)
    res.json({
      world: {
        ...world,
        epochName: epochInfo.name,
        epochDescription: epochInfo.description,
      },
    })
  } catch (err) {
    console.error('获取世界状态失败:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

/**
 * GET /api/world/epochs — 获取所有纪元定义
 */
router.get('/world/epochs', async (_req: Request, res: Response) => {
  try {
    const epochs = worldService.getAllEpochs()
    res.json({ epochs })
  } catch (err) {
    console.error('获取纪元列表失败:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// ==================== 世界线 API ====================

/**
 * GET /api/worldline — 获取当前用户的世界线记录
 */
router.get('/worldline', authMiddleware, async (req: Request, res: Response) => {
  try {
    const records = await eventService.getWorldlineRecords(req.user!.userId)
    res.json({ records })
  } catch (err) {
    console.error('获取世界线失败:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// ==================== 事件遗产 API ====================

/**
 * GET /api/legacies — 获取事件遗产列表
 */
router.get('/legacies', async (req: Request, res: Response) => {
  try {
    const eventId = req.query.eventId as string | undefined
    const legacies = await eventService.getEventLegacies(eventId)
    res.json({ legacies })
  } catch (err) {
    console.error('获取事件遗产失败:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

export default router
