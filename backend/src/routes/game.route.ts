import { Router, Request, Response } from 'express'
import { db, schema } from '../db/index.js'
import { eq } from 'drizzle-orm'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// ==================== 事件 API ====================

/**
 * GET /api/events — 获取所有活跃事件
 */
router.get('/events', async (_req: Request, res: Response) => {
  try {
    const events = await db.select().from(schema.llEvents)
      .where(eq(schema.llEvents.status, 'active'))

    const formatted = events.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description,
      cover: e.cover,
      type: e.type,
      status: e.status,
      requirements: JSON.parse(e.requirements),
      entryFee: JSON.parse(e.entryFee),
      stages: JSON.parse(e.stages),
      participantCount: e.participantCount,
      createdAt: e.createdAt,
    }))

    res.json({ events: formatted })
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
    const events = await db.select().from(schema.llEvents)
      .where(eq(schema.llEvents.id, req.params.id))
      .limit(1)

    if (events.length === 0) {
      res.status(404).json({ error: '事件不存在' })
      return
    }

    const e = events[0]
    res.json({
      event: {
        id: e.id,
        title: e.title,
        description: e.description,
        cover: e.cover,
        type: e.type,
        status: e.status,
        requirements: JSON.parse(e.requirements),
        entryFee: JSON.parse(e.entryFee),
        stages: JSON.parse(e.stages),
        participantCount: e.participantCount,
        createdAt: e.createdAt,
      },
    })
  } catch (err) {
    console.error('获取事件详情失败:', err)
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

// ==================== 世界状态 API ====================

/**
 * GET /api/world — 获取当前世界状态
 */
router.get('/world', async (_req: Request, res: Response) => {
  try {
    const states = await db.select().from(schema.llWorldState)
      .where(eq(schema.llWorldState.id, 'current'))
      .limit(1)

    if (states.length === 0) {
      // 返回默认世界状态
      res.json({
        world: {
          epoch: 'genesis',
          dimensions: {
            stability: 0.5,
            prosperity: 0.5,
            freedom: 0.5,
            knowledge: 0.5,
            solidarity: 0.5,
          },
          tideMultiplier: {},
        },
      })
      return
    }

    const w = states[0]
    res.json({
      world: {
        epoch: w.epoch,
        epochStartedAt: w.epochStartedAt,
        dimensions: {
          stability: w.dimStability,
          prosperity: w.dimProsperity,
          freedom: w.dimFreedom,
          knowledge: w.dimKnowledge,
          solidarity: w.dimSolidarity,
        },
        tideMultiplier: JSON.parse(w.tideMultiplier),
        updatedAt: w.updatedAt,
      },
    })
  } catch (err) {
    console.error('获取世界状态失败:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// ==================== 用户选择记录 API ====================

/**
 * POST /api/choices — 记录用户的事件选择
 */
router.post('/choices', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { eventId, stageId, choiceId, choiceText, resultText, cost, reward } = req.body
    const choiceRecordId = `choice_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`

    await db.insert(schema.llUserChoices).values({
      id: choiceRecordId,
      userId: req.user!.userId,
      eventId,
      stageId,
      choiceId,
      choiceText: choiceText || '',
      resultText: resultText || null,
      costSnapshot: JSON.stringify(cost || {}),
      rewardSnapshot: JSON.stringify(reward || {}),
      timestamp: Date.now(),
    })

    res.status(201).json({ id: choiceRecordId })
  } catch (err) {
    console.error('记录选择失败:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

export default router
