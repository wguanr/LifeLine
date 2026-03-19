/**
 * 物品引擎 Service
 * V4 设计：Bonding Curve 动态定价 + 世界状态敏感性 + 物品生态位
 */

import { db, schema } from '../db/index.js'
import { eq } from 'drizzle-orm'
import * as worldService from './world.service.js'

// ==================== 类型定义 ====================

export interface DynamicPrice {
  /** 基础价格（来自物品定义） */
  baseCost: { time?: number; energy?: number }
  /** Bonding Curve 乘数（基于铸造量） */
  bondingMultiplier: number
  /** 世界状态敏感性乘数 */
  worldSensitivityMultiplier: number
  /** 最终价格 */
  finalCost: { time: number; energy: number }
  /** 价格趋势：rising / falling / stable */
  trend: 'rising' | 'falling' | 'stable'
  /** 当前铸造量 */
  mintedCount: number
  /** 最大铸造量 */
  maxMint: number
  /** 稀缺度 [0, 1]，mintedCount / maxMint */
  scarcity: number
}

export interface ItemWithPrice {
  id: string
  name: string
  description: string
  icon: string
  rarity: string
  category: string
  tags: string[]
  featureTags: string[]
  story: string | null
  image: string | null
  visible: boolean
  stackable: boolean
  maxStack: number
  maxMint: number
  mintedCount: number
  createdAt: number
  /** 动态价格信息 */
  dynamicPrice: DynamicPrice
}

// ==================== Bonding Curve ====================

/**
 * V4 Bonding Curve 定价公式
 * 
 * price = baseCost * bondingMultiplier * worldSensitivityMultiplier
 * 
 * bondingMultiplier = 1 + k * (mintedCount / maxMint)^2
 *   - k 由稀有度决定：common=0.5, uncommon=1.0, rare=2.0, epic=3.0, legendary=5.0
 *   - 铸造越多，价格越高（二次曲线）
 * 
 * worldSensitivityMultiplier 基于物品标签与世界维度的关联：
 *   - 繁荣度高 → 消费品便宜（生活类物品）
 *   - 知识水平高 → 学习类物品便宜
 *   - 稳定性低 → 冒险类物品涨价
 */

const RARITY_K: Record<string, number> = {
  common: 0.5,
  uncommon: 1.0,
  rare: 2.0,
  epic: 3.0,
  legendary: 5.0,
}

/** 物品标签 → 世界维度的映射关系 */
const TAG_DIMENSION_MAP: Record<string, { dimension: keyof worldService.WorldDimensions; effect: 'discount' | 'premium' }> = {
  // 繁荣度高 → 生活消费品打折
  foodie: { dimension: 'prosperity', effect: 'discount' },
  minimalist: { dimension: 'prosperity', effect: 'discount' },
  traveler: { dimension: 'prosperity', effect: 'discount' },
  // 知识水平高 → 学习类打折
  learner: { dimension: 'knowledge', effect: 'discount' },
  techie: { dimension: 'knowledge', effect: 'discount' },
  reader: { dimension: 'knowledge', effect: 'discount' },
  // 稳定性低 → 冒险类涨价
  explorer: { dimension: 'stability', effect: 'premium' },
  adventurer: { dimension: 'stability', effect: 'premium' },
  // 自由度高 → 创意类打折
  creative: { dimension: 'freedom', effect: 'discount' },
  artist: { dimension: 'freedom', effect: 'discount' },
  // 团结度高 → 社交类打折
  social: { dimension: 'solidarity', effect: 'discount' },
  helpful: { dimension: 'solidarity', effect: 'discount' },
}

/**
 * 计算 Bonding Curve 乘数
 */
function calculateBondingMultiplier(mintedCount: number, maxMint: number, rarity: string): number {
  const k = RARITY_K[rarity] ?? 1.0
  const ratio = maxMint > 0 ? mintedCount / maxMint : 0
  return 1 + k * ratio * ratio
}

/**
 * 计算世界状态敏感性乘数
 * 返回 [0.6, 1.4] 范围的乘数
 */
function calculateWorldSensitivityMultiplier(
  itemTags: string[],
  dimensions: worldService.WorldDimensions
): number {
  if (itemTags.length === 0) return 1.0

  let totalEffect = 0
  let matchCount = 0

  for (const tag of itemTags) {
    const mapping = TAG_DIMENSION_MAP[tag]
    if (!mapping) continue

    const dimValue = dimensions[mapping.dimension]
    matchCount++

    if (mapping.effect === 'discount') {
      // 维度值越高，折扣越大（乘数越小）
      totalEffect += -(dimValue - 0.5) * 0.8  // [-0.4, 0.4]
    } else {
      // premium: 维度值越低，价格越高
      totalEffect += (0.5 - dimValue) * 0.8    // [-0.4, 0.4]
    }
  }

  if (matchCount === 0) return 1.0
  const avgEffect = totalEffect / matchCount
  return Math.max(0.6, Math.min(1.4, 1.0 + avgEffect))
}

/**
 * 判断价格趋势
 */
function calculateTrend(bondingMul: number, worldMul: number): 'rising' | 'falling' | 'stable' {
  const combined = bondingMul * worldMul
  if (combined > 1.15) return 'rising'
  if (combined < 0.85) return 'falling'
  return 'stable'
}

// ==================== 公开 API ====================

/**
 * 获取物品的动态价格
 */
export async function getDynamicPrice(itemId: string): Promise<DynamicPrice | null> {
  const items = await db.select().from(schema.llItems)
    .where(eq(schema.llItems.id, itemId)).limit(1)

  if (items.length === 0) return null

  const item = items[0]
  const baseCost = JSON.parse(item.mintCost) as { time?: number; energy?: number }
  const tags = JSON.parse(item.tags) as string[]
  const worldState = await worldService.getCurrentWorldState()

  const bondingMultiplier = calculateBondingMultiplier(item.mintedCount, item.maxMint, item.rarity)
  const worldSensitivityMultiplier = calculateWorldSensitivityMultiplier(tags, worldState.dimensions)

  const finalMultiplier = bondingMultiplier * worldSensitivityMultiplier
  const finalCost = {
    time: Math.round((baseCost.time || 0) * finalMultiplier),
    energy: Math.round((baseCost.energy || 0) * finalMultiplier),
  }

  return {
    baseCost,
    bondingMultiplier: Math.round(bondingMultiplier * 100) / 100,
    worldSensitivityMultiplier: Math.round(worldSensitivityMultiplier * 100) / 100,
    finalCost,
    trend: calculateTrend(bondingMultiplier, worldSensitivityMultiplier),
    mintedCount: item.mintedCount,
    maxMint: item.maxMint,
    scarcity: item.maxMint > 0 ? Math.round((item.mintedCount / item.maxMint) * 100) / 100 : 0,
  }
}

/**
 * 获取所有物品及其动态价格
 */
export async function getAllItemsWithPrices(): Promise<ItemWithPrice[]> {
  const items = await db.select().from(schema.llItems)
    .where(eq(schema.llItems.visible, true))

  const worldState = await worldService.getCurrentWorldState()
  const result: ItemWithPrice[] = []

  for (const item of items) {
    const baseCost = JSON.parse(item.mintCost) as { time?: number; energy?: number }
    const tags = JSON.parse(item.tags) as string[]
    const featureTags = JSON.parse(item.featureTags) as string[]

    const bondingMultiplier = calculateBondingMultiplier(item.mintedCount, item.maxMint, item.rarity)
    const worldSensitivityMultiplier = calculateWorldSensitivityMultiplier(tags, worldState.dimensions)

    const finalMultiplier = bondingMultiplier * worldSensitivityMultiplier
    const finalCost = {
      time: Math.round((baseCost.time || 0) * finalMultiplier),
      energy: Math.round((baseCost.energy || 0) * finalMultiplier),
    }

    result.push({
      id: item.id,
      name: item.name,
      description: item.description,
      icon: item.icon,
      rarity: item.rarity,
      category: item.category,
      tags,
      featureTags,
      story: item.story,
      image: item.image,
      visible: item.visible,
      stackable: item.stackable,
      maxStack: item.maxStack,
      maxMint: item.maxMint,
      mintedCount: item.mintedCount,
      createdAt: item.createdAt,
      dynamicPrice: {
        baseCost,
        bondingMultiplier: Math.round(bondingMultiplier * 100) / 100,
        worldSensitivityMultiplier: Math.round(worldSensitivityMultiplier * 100) / 100,
        finalCost,
        trend: calculateTrend(bondingMultiplier, worldSensitivityMultiplier),
        mintedCount: item.mintedCount,
        maxMint: item.maxMint,
        scarcity: item.maxMint > 0 ? Math.round((item.mintedCount / item.maxMint) * 100) / 100 : 0,
      },
    })
  }

  return result
}

/**
 * 使用动态价格购买物品
 * 替代 resource.service 中的固定价格购买
 */
export async function buyItemDynamic(
  userId: string,
  itemId: string
): Promise<{
  wallet: { time: number; energy: number; reputation: number }
  inventory: any[]
  tags: any[]
  dynamicPrice: DynamicPrice
}> {
  const price = await getDynamicPrice(itemId)
  if (!price) throw new Error('物品不存在')

  // 从数据库获取物品定义
  const items = await db.select().from(schema.llItems)
    .where(eq(schema.llItems.id, itemId)).limit(1)
  const item = items[0]
  const tags = JSON.parse(item.tags) as string[]

  // 使用 resource.service 的 buyItem，但传入动态价格
  const { buyItem } = await import('./resource.service.js')
  const result = await buyItem(userId, {
    id: item.id,
    name: item.name,
    mintCost: price.finalCost,
    tags,
  })

  // 更新铸造计数
  await db.update(schema.llItems).set({
    mintedCount: item.mintedCount + 1,
  }).where(eq(schema.llItems.id, itemId))

  // 重新计算价格（铸造后）
  const newPrice = await getDynamicPrice(itemId)

  return {
    wallet: result.wallet,
    inventory: result.inventory,
    tags: result.tags,
    dynamicPrice: newPrice!,
  }
}
