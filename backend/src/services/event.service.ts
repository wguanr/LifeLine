/**
 * 事件引擎 Service
 * 管理事件的生命周期、选择结算、编年史记录
 * V4 设计：非对称结算 + 事件遗产 + 个人编年史
 */

import { db, schema } from '../db/index.js'
import { eq, desc } from 'drizzle-orm'
import * as resourceService from './resource.service.js'

// ==================== 类型定义 ====================

export interface ChoiceOutcome {
  walletChanges: resourceService.Wallet
  tagChanges: Array<{ tagId: string; weight: number }>
  itemRewards: Array<{ itemId: string; quantity: number }>
  resultText: string
}

export interface WorldlineRecord {
  id: string
  type: 'event_start' | 'choice' | 'event_complete'
  eventId: string
  title: string
  detail?: string
  meta?: Record<string, any>
  timestamp: number
}

// ==================== 事件查询 ====================

/**
 * 获取所有活跃事件
 */
export async function getActiveEvents() {
  const events = await db.select().from(schema.llEvents)
    .where(eq(schema.llEvents.status, 'active'))

  return events.map(formatEvent)
}

/**
 * 获取单个事件详情
 */
export async function getEventById(eventId: string) {
  const events = await db.select().from(schema.llEvents)
    .where(eq(schema.llEvents.id, eventId)).limit(1)

  if (events.length === 0) return null
  return formatEvent(events[0])
}

function formatEvent(e: any) {
  return {
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
  }
}

// ==================== 事件参与 ====================

/**
 * 开始参与事件
 * 记录到用户历史和世界线
 */
export async function startEvent(userId: string, eventId: string): Promise<void> {
  const event = await getEventById(eventId)
  if (!event) throw new Error('事件不存在')

  // 更新用户历史
  const history = await resourceService.getUserHistory(userId)
  if (!history.currentEvents) history.currentEvents = []
  if (!history.currentEvents.includes(eventId)) {
    history.currentEvents.push(eventId)
  }
  await resourceService.updateUserHistory(userId, history)

  // 增加参与人数
  await db.update(schema.llEvents).set({
    participantCount: event.participantCount + 1,
  }).where(eq(schema.llEvents.id, eventId))
}

/**
 * 处理事件选择 — V4 非对称结算
 * 根据用户身份光谱动态计算结算结果
 */
export async function processChoice(
  userId: string,
  eventId: string,
  stageId: string,
  choiceId: string,
  choiceText: string,
  outcome: {
    resultText?: string
    rewards?: {
      time?: number
      energy?: number
      reputation?: number
      tags?: Record<string, number>
      items?: string[]
    }
    penalties?: {
      time?: number
      energy?: number
      reputation?: number
    }
  }
): Promise<{
  choiceRecordId: string
  walletAfter: resourceService.Wallet
  tagsAfter: resourceService.UserTag[]
}> {
  const now = Date.now()

  // 1. 获取用户当前标签（身份光谱），用于非对称结算
  const userTags = await resourceService.getUserTags(userId)

  // 2. 计算资源变动
  let walletChanges: Partial<resourceService.Wallet> = {}

  // 扣减成本（penalties）
  if (outcome.penalties) {
    if (outcome.penalties.time) walletChanges.time = -(outcome.penalties.time)
    if (outcome.penalties.energy) walletChanges.energy = -(outcome.penalties.energy)
    if (outcome.penalties.reputation) walletChanges.reputation = -(outcome.penalties.reputation)
  }

  // 增加奖励（rewards）— 带身份加成
  if (outcome.rewards) {
    const identityMultiplier = calculateIdentityMultiplier(userTags, eventId)

    walletChanges.time = (walletChanges.time || 0) + Math.round((outcome.rewards.time || 0) * identityMultiplier)
    walletChanges.energy = (walletChanges.energy || 0) + Math.round((outcome.rewards.energy || 0) * identityMultiplier)
    walletChanges.reputation = (walletChanges.reputation || 0) + Math.round((outcome.rewards.reputation || 0) * identityMultiplier)
  }

  // 3. 应用资源变动
  let walletAfter: resourceService.Wallet
  const positive: Partial<resourceService.Wallet> = {}
  const negative: Partial<resourceService.Wallet> = {}

  if ((walletChanges.time || 0) > 0) positive.time = walletChanges.time!
  else if ((walletChanges.time || 0) < 0) negative.time = Math.abs(walletChanges.time!)

  if ((walletChanges.energy || 0) > 0) positive.energy = walletChanges.energy!
  else if ((walletChanges.energy || 0) < 0) negative.energy = Math.abs(walletChanges.energy!)

  if ((walletChanges.reputation || 0) > 0) positive.reputation = walletChanges.reputation!
  else if ((walletChanges.reputation || 0) < 0) negative.reputation = Math.abs(walletChanges.reputation!)

  if (Object.keys(negative).length > 0) {
    await resourceService.deductResources(userId, negative)
  }
  if (Object.keys(positive).length > 0) {
    await resourceService.addResources(userId, positive)
  }
  walletAfter = await resourceService.getWallet(userId)

  // 4. 更新标签
  let tagsAfter = userTags
  if (outcome.rewards?.tags) {
    const tagUpdates = Object.entries(outcome.rewards.tags).map(([tagId, weight]) => ({ tagId, weight }))
    tagsAfter = await resourceService.updateTagWeights(
      userId, tagUpdates, 'event', eventId, choiceText,
      outcome.penalties ? { time: outcome.penalties.time, energy: outcome.penalties.energy } : undefined
    )
  }

  // 5. 发放物品奖励
  if (outcome.rewards?.items) {
    for (const itemId of outcome.rewards.items) {
      await resourceService.addItem(userId, itemId, 1, `event_${eventId}`)
    }
  }

  // 6. 记录选择到数据库
  const choiceRecordId = `choice_${now}_${Math.random().toString(36).slice(2, 6)}`
  await db.insert(schema.llUserChoices).values({
    id: choiceRecordId,
    userId,
    eventId,
    stageId,
    choiceId,
    choiceText,
    resultText: outcome.resultText || null,
    costSnapshot: JSON.stringify(outcome.penalties || {}),
    rewardSnapshot: JSON.stringify(outcome.rewards || {}),
    timestamp: now,
  })

  return { choiceRecordId, walletAfter, tagsAfter }
}

/**
 * V4 非对称结算：身份加成乘数
 * 用户的标签越匹配事件主题，获得的奖励越多
 */
function calculateIdentityMultiplier(userTags: resourceService.UserTag[], eventId: string): number {
  // MVP 阶段简化实现：基于标签总权重给予 0.8~1.5 的乘数
  const totalWeight = userTags.reduce((sum, t) => sum + t.weight, 0)
  const avgWeight = userTags.length > 0 ? totalWeight / userTags.length : 0

  // 标签平均权重越高，乘数越大（代表用户身份越鲜明）
  return Math.max(0.8, Math.min(1.5, 0.8 + avgWeight / 100))
}

/**
 * 完成事件
 */
export async function completeEvent(userId: string, eventId: string): Promise<void> {
  const history = await resourceService.getUserHistory(userId)

  // 从进行中移除
  if (history.currentEvents) {
    history.currentEvents = history.currentEvents.filter((id: string) => id !== eventId)
  }

  // 添加到已完成
  if (!history.completedEvents) history.completedEvents = []
  if (!history.completedEvents.includes(eventId)) {
    history.completedEvents.push(eventId)
  }

  await resourceService.updateUserHistory(userId, history)
}

// ==================== 用户选择历史 ====================

/**
 * 获取用户的选择历史
 */
export async function getUserChoices(userId: string, limit: number = 50) {
  const choices = await db.select().from(schema.llUserChoices)
    .where(eq(schema.llUserChoices.userId, userId))
    .orderBy(desc(schema.llUserChoices.timestamp))
    .limit(limit)

  return choices.map(c => ({
    id: c.id,
    eventId: c.eventId,
    stageId: c.stageId,
    choiceId: c.choiceId,
    choiceText: c.choiceText,
    resultText: c.resultText,
    cost: JSON.parse(c.costSnapshot),
    reward: JSON.parse(c.rewardSnapshot),
    timestamp: c.timestamp,
  }))
}

// ==================== 世界线（编年史） ====================

/**
 * 获取用户的世界线记录
 * 从 user_choices + user history 聚合
 */
export async function getWorldlineRecords(userId: string): Promise<WorldlineRecord[]> {
  const choices = await db.select().from(schema.llUserChoices)
    .where(eq(schema.llUserChoices.userId, userId))
    .orderBy(schema.llUserChoices.timestamp)

  const history = await resourceService.getUserHistory(userId)
  const records: WorldlineRecord[] = []

  // 从 completedEvents 和 currentEvents 构建事件开始记录
  const allEventIds = new Set<string>([
    ...(history.completedEvents || []),
    ...(history.currentEvents || []),
  ])

  // 按事件分组选择记录
  const choicesByEvent = new Map<string, typeof choices>()
  for (const c of choices) {
    if (!choicesByEvent.has(c.eventId)) {
      choicesByEvent.set(c.eventId, [])
    }
    choicesByEvent.get(c.eventId)!.push(c)
  }

  // 构建世界线记录
  for (const eventId of allEventIds) {
    const eventChoices = choicesByEvent.get(eventId) || []
    const firstChoice = eventChoices[0]

    // 事件开始记录
    records.push({
      id: `evt_${eventId}`,
      type: 'event_start',
      eventId,
      title: eventId, // 前端会用事件ID查找标题
      timestamp: firstChoice ? firstChoice.timestamp - 1000 : Date.now(),
    })

    // 选择记录
    for (const c of eventChoices) {
      records.push({
        id: c.id,
        type: 'choice',
        eventId: c.eventId,
        title: c.eventId,
        detail: c.choiceText,
        meta: { resultText: c.resultText },
        timestamp: c.timestamp,
      })
    }

    // 事件完成记录
    if (history.completedEvents?.includes(eventId)) {
      const lastChoice = eventChoices[eventChoices.length - 1]
      records.push({
        id: `complete_${eventId}`,
        type: 'event_complete',
        eventId,
        title: eventId,
        timestamp: lastChoice ? lastChoice.timestamp + 1000 : Date.now(),
      })
    }
  }

  // 按时间排序
  records.sort((a, b) => a.timestamp - b.timestamp)
  return records
}

// ==================== 事件遗产 ====================

/**
 * 创建事件遗产（V4: 事件结束后对世界的永久影响）
 */
export async function createEventLegacy(
  eventId: string,
  legacyType: 'world_shift' | 'unlock_event' | 'spawn_item' | 'tag_trend',
  payload: Record<string, any>
): Promise<string> {
  const id = `legacy_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`

  await db.insert(schema.llEventLegacies).values({
    id,
    eventId,
    legacyType,
    payload: JSON.stringify(payload),
    createdAt: Date.now(),
  })

  return id
}

/**
 * 获取事件遗产列表
 */
export async function getEventLegacies(eventId?: string) {
  if (eventId) {
    const legacies = await db.select().from(schema.llEventLegacies)
      .where(eq(schema.llEventLegacies.eventId, eventId))
    return legacies.map(l => ({
      ...l,
      payload: JSON.parse(l.payload),
    }))
  }

  const legacies = await db.select().from(schema.llEventLegacies)
    .orderBy(desc(schema.llEventLegacies.createdAt))
    .limit(100)
  return legacies.map(l => ({
    ...l,
    payload: JSON.parse(l.payload),
  }))
}
