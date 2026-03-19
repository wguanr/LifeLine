/**
 * 世界 Tick 定时任务
 * V4 设计：定期更新世界维度、检查纪元变迁、调整资源潮汐
 * 
 * 每次 Tick 执行以下操作：
 * 1. 自然漂移：世界维度缓慢向均值回归（模拟自然恢复力）
 * 2. 玩家影响聚合：统计上一周期内所有玩家选择对世界的影响
 * 3. 纪元检查：根据新的维度值判断是否触发纪元变迁
 * 4. 潮汐更新：根据新维度重新计算资源获取乘数
 * 5. 黑天鹅检测：检查是否触发临界点事件
 */

import * as worldService from '../services/world.service.js'
import { db, schema } from '../db/index.js'
import { sql } from 'drizzle-orm'

// ==================== 配置 ====================

/** Tick 间隔（毫秒），默认 1 小时 */
export const TICK_INTERVAL = 60 * 60 * 1000

/** 自然回归速率：每次 Tick 维度向 0.5 回归的比例 */
const MEAN_REVERSION_RATE = 0.02

/** 玩家选择对世界维度的影响系数 */
const PLAYER_IMPACT_COEFFICIENT = 0.001

/** 黑天鹅临界阈值 */
const BLACK_SWAN_THRESHOLD = {
  /** 维度低于此值触发负面黑天鹅 */
  low: 0.1,
  /** 维度高于此值触发正面黑天鹅 */
  high: 0.9,
}

// ==================== Tick 逻辑 ====================

export interface TickResult {
  previousEpoch: string
  currentEpoch: string
  epochChanged: boolean
  dimensionChanges: worldService.WorldDimensions
  newDimensions: worldService.WorldDimensions
  tideMultiplier: worldService.TideMultiplier
  blackSwanTriggered: boolean
  blackSwanType?: string
  playerChoicesProcessed: number
  tickTimestamp: number
}

/**
 * 执行一次世界 Tick
 */
export async function executeWorldTick(): Promise<TickResult> {
  const now = Date.now()
  const currentState = await worldService.getCurrentWorldState()
  const previousEpoch = currentState.epoch

  // 1. 计算自然漂移（向均值 0.5 回归）
  const naturalDrift: Partial<worldService.WorldDimensions> = {
    stability: (0.5 - currentState.dimensions.stability) * MEAN_REVERSION_RATE,
    prosperity: (0.5 - currentState.dimensions.prosperity) * MEAN_REVERSION_RATE,
    freedom: (0.5 - currentState.dimensions.freedom) * MEAN_REVERSION_RATE,
    knowledge: (0.5 - currentState.dimensions.knowledge) * MEAN_REVERSION_RATE,
    solidarity: (0.5 - currentState.dimensions.solidarity) * MEAN_REVERSION_RATE,
  }

  // 2. 聚合玩家选择的影响
  const playerImpact = await aggregatePlayerImpact(currentState.updatedAt, now)

  // 3. 合并变化量
  const totalChanges: Partial<worldService.WorldDimensions> = {
    stability: (naturalDrift.stability || 0) + (playerImpact.stability || 0),
    prosperity: (naturalDrift.prosperity || 0) + (playerImpact.prosperity || 0),
    freedom: (naturalDrift.freedom || 0) + (playerImpact.freedom || 0),
    knowledge: (naturalDrift.knowledge || 0) + (playerImpact.knowledge || 0),
    solidarity: (naturalDrift.solidarity || 0) + (playerImpact.solidarity || 0),
  }

  // 4. 应用变化（这会自动检查纪元变迁和更新潮汐）
  const newState = await worldService.updateDimensions(totalChanges)

  // 5. 检测黑天鹅事件
  const blackSwan = detectBlackSwan(newState.dimensions)

  // 6. 如果触发黑天鹅，施加额外影响
  if (blackSwan.triggered) {
    await applyBlackSwanEffect(blackSwan.type!, newState.dimensions)
  }

  return {
    previousEpoch,
    currentEpoch: newState.epoch,
    epochChanged: newState.epoch !== previousEpoch,
    dimensionChanges: totalChanges as worldService.WorldDimensions,
    newDimensions: newState.dimensions,
    tideMultiplier: newState.tideMultiplier,
    blackSwanTriggered: blackSwan.triggered,
    blackSwanType: blackSwan.type,
    playerChoicesProcessed: playerImpact.choiceCount,
    tickTimestamp: now,
  }
}

// ==================== 玩家影响聚合 ====================

interface PlayerImpactResult extends Partial<worldService.WorldDimensions> {
  choiceCount: number
}

/**
 * 聚合指定时间段内所有玩家选择对世界维度的影响
 * 
 * 规则：
 * - 每个选择的 reward/cost 会映射到世界维度变化
 * - reputation 变化 → stability + solidarity
 * - energy 消耗 → knowledge (学习/努力)
 * - time 消耗 → prosperity (生产力)
 */
async function aggregatePlayerImpact(since: number, until: number): Promise<PlayerImpactResult> {
  const choices = await db.select().from(schema.llUserChoices)
    .where(sql`${schema.llUserChoices.timestamp} > ${since} AND ${schema.llUserChoices.timestamp} <= ${until}`)

  if (choices.length === 0) {
    return { choiceCount: 0 }
  }

  let stabilityDelta = 0
  let prosperityDelta = 0
  let freedomDelta = 0
  let knowledgeDelta = 0
  let solidarityDelta = 0

  for (const choice of choices) {
    const reward = JSON.parse(choice.rewardSnapshot) as Record<string, any>
    const cost = JSON.parse(choice.costSnapshot) as Record<string, any>

    // reputation 正向 → 稳定性和团结度上升
    const repGain = (reward.reputation || 0) - (cost.reputation || 0)
    stabilityDelta += repGain * PLAYER_IMPACT_COEFFICIENT
    solidarityDelta += repGain * PLAYER_IMPACT_COEFFICIENT * 0.5

    // energy 消耗 → 知识增长（努力学习）
    const energySpent = cost.energy || 0
    knowledgeDelta += energySpent * PLAYER_IMPACT_COEFFICIENT * 0.3

    // time 消耗 → 繁荣度增长（生产力）
    const timeSpent = cost.time || 0
    prosperityDelta += timeSpent * PLAYER_IMPACT_COEFFICIENT * 0.2

    // 自由度：选择多样性的体现（简化：每个选择微量增加自由度）
    freedomDelta += PLAYER_IMPACT_COEFFICIENT * 0.1
  }

  return {
    stability: stabilityDelta,
    prosperity: prosperityDelta,
    freedom: freedomDelta,
    knowledge: knowledgeDelta,
    solidarity: solidarityDelta,
    choiceCount: choices.length,
  }
}

// ==================== 黑天鹅检测 ====================

interface BlackSwanResult {
  triggered: boolean
  type?: string
}

function detectBlackSwan(d: worldService.WorldDimensions): BlackSwanResult {
  // 检查是否有维度达到极端值
  const dims = Object.entries(d) as [string, number][]

  for (const [name, value] of dims) {
    if (value <= BLACK_SWAN_THRESHOLD.low) {
      return { triggered: true, type: `${name}_collapse` }
    }
    if (value >= BLACK_SWAN_THRESHOLD.high) {
      return { triggered: true, type: `${name}_breakthrough` }
    }
  }

  return { triggered: false }
}

/**
 * 施加黑天鹅效果
 * 黑天鹅事件会对其他维度产生连锁反应
 */
async function applyBlackSwanEffect(type: string, currentDimensions: worldService.WorldDimensions): Promise<void> {
  const effects: Partial<worldService.WorldDimensions> = {}

  switch (type) {
    case 'stability_collapse':
      // 稳定性崩溃 → 繁荣度和团结度下降
      effects.prosperity = -0.1
      effects.solidarity = -0.05
      break
    case 'prosperity_collapse':
      // 繁荣度崩溃 → 稳定性和自由度下降
      effects.stability = -0.08
      effects.freedom = -0.05
      break
    case 'knowledge_breakthrough':
      // 知识突破 → 繁荣度和自由度上升
      effects.prosperity = 0.05
      effects.freedom = 0.05
      break
    case 'solidarity_breakthrough':
      // 团结突破 → 稳定性上升
      effects.stability = 0.08
      break
    case 'freedom_breakthrough':
      // 自由突破 → 知识上升，稳定性微降
      effects.knowledge = 0.05
      effects.stability = -0.03
      break
    default:
      // 未知类型，不做额外处理
      break
  }

  if (Object.keys(effects).length > 0) {
    await worldService.updateDimensions(effects)
  }
}

// ==================== 定时器管理 ====================

let tickTimer: ReturnType<typeof setInterval> | null = null
let tickHistory: TickResult[] = []

/**
 * 启动世界 Tick 定时器
 */
export function startWorldTick(intervalMs: number = TICK_INTERVAL): void {
  if (tickTimer) {
    console.log('[WorldTick] 定时器已在运行')
    return
  }

  console.log(`[WorldTick] 启动定时器，间隔 ${intervalMs / 1000}s`)

  tickTimer = setInterval(async () => {
    try {
      const result = await executeWorldTick()
      tickHistory.push(result)
      // 只保留最近 100 条记录
      if (tickHistory.length > 100) tickHistory = tickHistory.slice(-100)

      console.log(`[WorldTick] Tick 完成 | 纪元: ${result.currentEpoch} | 选择数: ${result.playerChoicesProcessed} | 黑天鹅: ${result.blackSwanTriggered}`)
      if (result.epochChanged) {
        console.log(`[WorldTick] *** 纪元变迁: ${result.previousEpoch} → ${result.currentEpoch} ***`)
      }
    } catch (err) {
      console.error('[WorldTick] Tick 执行失败:', err)
    }
  }, intervalMs)
}

/**
 * 停止世界 Tick 定时器
 */
export function stopWorldTick(): void {
  if (tickTimer) {
    clearInterval(tickTimer)
    tickTimer = null
    console.log('[WorldTick] 定时器已停止')
  }
}

/**
 * 获取 Tick 历史记录
 */
export function getTickHistory(): TickResult[] {
  return tickHistory
}
