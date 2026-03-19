/**
 * 资源引擎 Service
 * 管理用户钱包（时间/精力/声誉）、标签权重、背包物品
 * V4 设计：CoreResources + 身份光谱 + 物品生态
 */

import { db, schema } from '../db/index.js'
import { eq } from 'drizzle-orm'

// ==================== 类型定义 ====================

export interface Wallet {
  time: number
  energy: number
  reputation: number
}

export interface UserTag {
  tagId: string
  weight: number
  actionCount: number
  lastActionTime: number
  source: 'event' | 'item' | 'system'
  acquiredAt: number
}

export interface UserItem {
  itemId: string
  quantity: number
  acquiredAt: number
  source: string
}

export interface TagAction {
  id: string
  tagId: string
  actionType: 'event_choice' | 'item_mint' | 'daily_check'
  cost: Record<string, number>
  weightChange: number
  timestamp: number
  sourceId: string
  sourceName: string
}

// ==================== 钱包操作 ====================

/**
 * 获取用户钱包
 */
export async function getWallet(userId: string): Promise<Wallet> {
  const rows = await db.select({
    time: schema.llUsers.walletTime,
    energy: schema.llUsers.walletEnergy,
    reputation: schema.llUsers.walletReputation,
  }).from(schema.llUsers).where(eq(schema.llUsers.id, userId)).limit(1)

  if (rows.length === 0) throw new Error('用户不存在')
  return { time: rows[0].time, energy: rows[0].energy, reputation: rows[0].reputation }
}

/**
 * 检查用户是否能支付指定费用
 */
export async function canAfford(userId: string, cost: Partial<Wallet>): Promise<boolean> {
  const wallet = await getWallet(userId)
  if (cost.time && wallet.time < cost.time) return false
  if (cost.energy && wallet.energy < cost.energy) return false
  if (cost.reputation && wallet.reputation < cost.reputation) return false
  return true
}

/**
 * 扣减用户资源（支付）
 * 返回扣减后的钱包
 */
export async function deductResources(userId: string, cost: Partial<Wallet>): Promise<Wallet> {
  const wallet = await getWallet(userId)

  const newTime = Math.max(0, wallet.time - (cost.time || 0))
  const newEnergy = Math.max(0, wallet.energy - (cost.energy || 0))
  const newReputation = Math.max(0, wallet.reputation - (cost.reputation || 0))

  await db.update(schema.llUsers).set({
    walletTime: newTime,
    walletEnergy: newEnergy,
    walletReputation: newReputation,
    lastActiveAt: Date.now(),
  }).where(eq(schema.llUsers.id, userId))

  return { time: newTime, energy: newEnergy, reputation: newReputation }
}

/**
 * 增加用户资源（奖励）
 */
export async function addResources(userId: string, reward: Partial<Wallet>): Promise<Wallet> {
  const wallet = await getWallet(userId)

  const newTime = wallet.time + (reward.time || 0)
  const newEnergy = wallet.energy + (reward.energy || 0)
  const newReputation = wallet.reputation + (reward.reputation || 0)

  await db.update(schema.llUsers).set({
    walletTime: newTime,
    walletEnergy: newEnergy,
    walletReputation: newReputation,
    lastActiveAt: Date.now(),
  }).where(eq(schema.llUsers.id, userId))

  return { time: newTime, energy: newEnergy, reputation: newReputation }
}

// ==================== 标签操作 ====================

/**
 * 获取用户标签列表
 */
export async function getUserTags(userId: string): Promise<UserTag[]> {
  const rows = await db.select({ tags: schema.llUsers.tags })
    .from(schema.llUsers).where(eq(schema.llUsers.id, userId)).limit(1)
  if (rows.length === 0) throw new Error('用户不存在')
  return JSON.parse(rows[0].tags) as UserTag[]
}

/**
 * V4 标签权重递减增长公式
 * 每次行动的权重增量随行动次数递减
 */
function calculateWeightIncrement(baseWeight: number, actionCount: number): number {
  const decayFactor = 1 / (1 + Math.log(1 + actionCount))
  return Math.round(baseWeight * decayFactor * 10) / 10
}

/**
 * 更新用户标签权重
 * 实现 V4 的身份光谱缓动演化
 */
export async function updateTagWeight(
  userId: string,
  tagId: string,
  baseWeight: number,
  source: 'event' | 'item' | 'system',
  sourceId: string,
  sourceName: string,
  cost?: Partial<Wallet>
): Promise<{ tags: UserTag[]; action: TagAction }> {
  const tags = await getUserTags(userId)
  const now = Date.now()

  let tag = tags.find(t => t.tagId === tagId)
  if (!tag) {
    tag = { tagId, weight: 0, actionCount: 0, lastActionTime: now, source, acquiredAt: now }
    tags.push(tag)
  }

  // 基础增量（递减）
  let weightIncrement = calculateWeightIncrement(baseWeight, tag.actionCount)

  // 成本加成：投入越多，增长越多
  if (cost) {
    const costBonus = ((cost.time ?? 0) / 30 + (cost.energy ?? 0) / 20) * 0.5
    weightIncrement += costBonus
  }

  // 里程碑加成
  if (tag.actionCount > 0 && tag.actionCount % 3 === 2) {
    weightIncrement += 2
  }

  tag.weight = Math.max(0, Math.min(100, tag.weight + weightIncrement))
  tag.actionCount += 1
  tag.lastActionTime = now

  // 创建行动记录
  const action: TagAction = {
    id: 'A' + now.toString(36),
    tagId,
    actionType: source === 'event' ? 'event_choice' : source === 'item' ? 'item_mint' : 'daily_check',
    cost: cost || {},
    weightChange: weightIncrement,
    timestamp: now,
    sourceId,
    sourceName,
  }

  // 保存到数据库
  await db.update(schema.llUsers).set({
    tags: JSON.stringify(tags),
    lastActiveAt: now,
  }).where(eq(schema.llUsers.id, userId))

  return { tags, action }
}

/**
 * 批量更新标签
 */
export async function updateTagWeights(
  userId: string,
  tagUpdates: Array<{ tagId: string; weight: number }>,
  source: 'event' | 'item' | 'system',
  sourceId: string,
  sourceName: string,
  cost?: Partial<Wallet>
): Promise<UserTag[]> {
  let tags: UserTag[] = []
  for (const update of tagUpdates) {
    const result = await updateTagWeight(userId, update.tagId, update.weight, source, sourceId, sourceName, cost)
    tags = result.tags
  }
  return tags
}

/**
 * 标签权重衰减（30天不活跃则衰减10%）
 */
export async function decayTagWeights(userId: string): Promise<UserTag[]> {
  const tags = await getUserTags(userId)
  const now = Date.now()
  const thirtyDays = 30 * 24 * 60 * 60 * 1000

  let changed = false
  for (const tag of tags) {
    if (now - tag.lastActionTime > thirtyDays) {
      tag.weight = Math.max(0, tag.weight * 0.9)
      changed = true
    }
  }

  if (changed) {
    await db.update(schema.llUsers).set({
      tags: JSON.stringify(tags),
    }).where(eq(schema.llUsers.id, userId))
  }

  return tags
}

// ==================== 背包操作 ====================

/**
 * 获取用户背包
 */
export async function getInventory(userId: string): Promise<UserItem[]> {
  const rows = await db.select({ inventory: schema.llUsers.inventory })
    .from(schema.llUsers).where(eq(schema.llUsers.id, userId)).limit(1)
  if (rows.length === 0) throw new Error('用户不存在')
  return JSON.parse(rows[0].inventory) as UserItem[]
}

/**
 * 添加物品到背包
 */
export async function addItem(userId: string, itemId: string, quantity: number, source: string): Promise<UserItem[]> {
  const inventory = await getInventory(userId)

  const existing = inventory.find(i => i.itemId === itemId)
  if (existing) {
    existing.quantity += quantity
  } else {
    inventory.push({ itemId, quantity, acquiredAt: Date.now(), source })
  }

  await db.update(schema.llUsers).set({
    inventory: JSON.stringify(inventory),
    lastActiveAt: Date.now(),
  }).where(eq(schema.llUsers.id, userId))

  return inventory
}

/**
 * 从背包移除物品
 */
export async function removeItem(userId: string, itemId: string, quantity: number = 1): Promise<UserItem[]> {
  const inventory = await getInventory(userId)

  const existing = inventory.find(i => i.itemId === itemId)
  if (!existing || existing.quantity < quantity) {
    throw new Error('物品不足')
  }

  existing.quantity -= quantity
  const newInventory = inventory.filter(i => i.quantity > 0)

  await db.update(schema.llUsers).set({
    inventory: JSON.stringify(newInventory),
    lastActiveAt: Date.now(),
  }).where(eq(schema.llUsers.id, userId))

  return newInventory
}

/**
 * 购买物品：扣费 + 入包 + 更新标签
 */
export async function buyItem(
  userId: string,
  itemDef: { id: string; name: string; mintCost: Partial<Wallet>; tags: string[] }
): Promise<{ wallet: Wallet; inventory: UserItem[]; tags: UserTag[] }> {
  // 1. 检查余额
  const affordable = await canAfford(userId, itemDef.mintCost)
  if (!affordable) throw new Error('资源不足')

  // 2. 扣费
  const wallet = await deductResources(userId, itemDef.mintCost)

  // 3. 入包
  const inventory = await addItem(userId, itemDef.id, 1, 'buy_' + itemDef.id)

  // 4. 更新标签
  const tags = await updateTagWeights(
    userId,
    itemDef.tags.map(tagId => ({ tagId, weight: 5 })),
    'item',
    itemDef.id,
    itemDef.name,
    itemDef.mintCost
  )

  return { wallet, inventory, tags }
}

// ==================== 用户历史记录 ====================

/**
 * 获取用户历史记录
 */
export async function getUserHistory(userId: string): Promise<any> {
  const rows = await db.select({ history: schema.llUsers.history })
    .from(schema.llUsers).where(eq(schema.llUsers.id, userId)).limit(1)
  if (rows.length === 0) throw new Error('用户不存在')
  return JSON.parse(rows[0].history)
}

/**
 * 更新用户历史记录
 */
export async function updateUserHistory(userId: string, history: any): Promise<void> {
  await db.update(schema.llUsers).set({
    history: JSON.stringify(history),
    lastActiveAt: Date.now(),
  }).where(eq(schema.llUsers.id, userId))
}
