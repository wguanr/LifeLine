/**
 * 世界引擎 Service
 * 管理世界状态维度、纪元变迁、资源潮汐
 * V4 设计：五维世界 + 纪元系统 + 潮汐自调节
 */

import { db, schema } from '../db/index.js'
import { eq } from 'drizzle-orm'

// ==================== 类型定义 ====================

export interface WorldDimensions {
  stability: number    // 稳定性 [0, 1]
  prosperity: number   // 繁荣度 [0, 1]
  freedom: number      // 自由度 [0, 1]
  knowledge: number    // 知识水平 [0, 1]
  solidarity: number   // 团结度 [0, 1]
}

export interface TideMultiplier {
  time: number         // 时间资源乘数
  energy: number       // 精力资源乘数
  reputation: number   // 声誉资源乘数
}

export interface WorldState {
  epoch: string
  epochStartedAt: number
  dimensions: WorldDimensions
  tideMultiplier: TideMultiplier
  updatedAt: number
}

// ==================== 纪元定义 ====================

const EPOCH_THRESHOLDS: Record<string, {
  name: string
  condition: (d: WorldDimensions) => boolean
  description: string
}> = {
  genesis: {
    name: '创世纪',
    condition: () => true, // 默认纪元
    description: '世界初生，一切皆有可能。',
  },
  golden_age: {
    name: '黄金时代',
    condition: (d) => d.prosperity > 0.7 && d.stability > 0.6,
    description: '经济繁荣，社会稳定，人们享受着和平的红利。',
  },
  turbulence: {
    name: '动荡时代',
    condition: (d) => d.stability < 0.3,
    description: '社会动荡不安，变革的风暴正在酝酿。',
  },
  enlightenment: {
    name: '启蒙时代',
    condition: (d) => d.knowledge > 0.7 && d.freedom > 0.6,
    description: '知识爆发，思想自由，新的发现层出不穷。',
  },
  solidarity: {
    name: '大团结时代',
    condition: (d) => d.solidarity > 0.7 && d.freedom > 0.5,
    description: '人们团结一心，共同面对挑战。',
  },
  dark_age: {
    name: '至暗时刻',
    condition: (d) => d.prosperity < 0.2 && d.stability < 0.3,
    description: '经济崩溃，社会瓦解，但黎明终将到来。',
  },
}

// ==================== 世界状态查询 ====================

/**
 * 获取当前世界状态
 */
export async function getCurrentWorldState(): Promise<WorldState> {
  const states = await db.select().from(schema.llWorldState)
    .where(eq(schema.llWorldState.id, 'current')).limit(1)

  if (states.length === 0) {
    // 返回默认状态
    return {
      epoch: 'genesis',
      epochStartedAt: Date.now(),
      dimensions: {
        stability: 0.5,
        prosperity: 0.5,
        freedom: 0.5,
        knowledge: 0.5,
        solidarity: 0.5,
      },
      tideMultiplier: { time: 1.0, energy: 1.0, reputation: 1.0 },
      updatedAt: Date.now(),
    }
  }

  const w = states[0]
  return {
    epoch: w.epoch,
    epochStartedAt: w.epochStartedAt,
    dimensions: {
      stability: w.dimStability,
      prosperity: w.dimProsperity,
      freedom: w.dimFreedom,
      knowledge: w.dimKnowledge,
      solidarity: w.dimSolidarity,
    },
    tideMultiplier: JSON.parse(w.tideMultiplier) as TideMultiplier,
    updatedAt: w.updatedAt,
  }
}

// ==================== 世界状态更新 ====================

/**
 * 更新世界维度
 * 由事件结算或定时任务调用
 */
export async function updateDimensions(
  changes: Partial<WorldDimensions>
): Promise<WorldState> {
  const current = await getCurrentWorldState()
  const now = Date.now()

  // 应用变化，限制在 [0, 1] 范围内
  const newDimensions: WorldDimensions = {
    stability: clamp(current.dimensions.stability + (changes.stability || 0)),
    prosperity: clamp(current.dimensions.prosperity + (changes.prosperity || 0)),
    freedom: clamp(current.dimensions.freedom + (changes.freedom || 0)),
    knowledge: clamp(current.dimensions.knowledge + (changes.knowledge || 0)),
    solidarity: clamp(current.dimensions.solidarity + (changes.solidarity || 0)),
  }

  // 检查纪元变迁
  const newEpoch = evaluateEpoch(newDimensions)
  const epochChanged = newEpoch !== current.epoch

  // 计算资源潮汐
  const newTide = calculateTide(newDimensions)

  // 保存到数据库
  const updateData = {
    epoch: newEpoch,
    epochStartedAt: epochChanged ? now : current.epochStartedAt,
    dimStability: newDimensions.stability,
    dimProsperity: newDimensions.prosperity,
    dimFreedom: newDimensions.freedom,
    dimKnowledge: newDimensions.knowledge,
    dimSolidarity: newDimensions.solidarity,
    tideMultiplier: JSON.stringify(newTide),
    updatedAt: now,
  }

  // upsert
  const existing = await db.select({ id: schema.llWorldState.id })
    .from(schema.llWorldState).where(eq(schema.llWorldState.id, 'current')).limit(1)

  if (existing.length === 0) {
    await db.insert(schema.llWorldState).values({ id: 'current', ...updateData })
  } else {
    await db.update(schema.llWorldState).set(updateData)
      .where(eq(schema.llWorldState.id, 'current'))
  }

  return {
    epoch: newEpoch,
    epochStartedAt: epochChanged ? now : current.epochStartedAt,
    dimensions: newDimensions,
    tideMultiplier: newTide,
    updatedAt: now,
  }
}

/**
 * 评估当前应处于哪个纪元
 * 优先匹配最特殊的纪元
 */
function evaluateEpoch(d: WorldDimensions): string {
  // 按优先级检查（越极端的越优先）
  if (EPOCH_THRESHOLDS.dark_age.condition(d)) return 'dark_age'
  if (EPOCH_THRESHOLDS.golden_age.condition(d)) return 'golden_age'
  if (EPOCH_THRESHOLDS.enlightenment.condition(d)) return 'enlightenment'
  if (EPOCH_THRESHOLDS.solidarity.condition(d)) return 'solidarity'
  if (EPOCH_THRESHOLDS.turbulence.condition(d)) return 'turbulence'
  return 'genesis'
}

/**
 * V4 资源潮汐：根据世界维度计算资源获取乘数
 * 繁荣度高 → 时间充裕（time 乘数高）
 * 稳定性高 → 精力充沛（energy 乘数高）
 * 团结度高 → 声誉易得（reputation 乘数高）
 */
function calculateTide(d: WorldDimensions): TideMultiplier {
  return {
    time: 0.5 + d.prosperity,        // [0.5, 1.5]
    energy: 0.5 + d.stability,       // [0.5, 1.5]
    reputation: 0.5 + d.solidarity,  // [0.5, 1.5]
  }
}

/**
 * 获取纪元信息
 */
export function getEpochInfo(epochId: string) {
  return EPOCH_THRESHOLDS[epochId] || EPOCH_THRESHOLDS.genesis
}

/**
 * 获取所有纪元定义
 */
export function getAllEpochs() {
  return Object.entries(EPOCH_THRESHOLDS).map(([id, info]) => ({
    id,
    name: info.name,
    description: info.description,
  }))
}

// ==================== 工具函数 ====================

function clamp(value: number, min: number = 0, max: number = 1): number {
  return Math.max(min, Math.min(max, value))
}
