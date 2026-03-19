/**
 * world.service 单元测试
 * 覆盖：世界状态获取、维度更新、纪元变迁、纪元信息查询
 */
import { describe, it, expect, beforeEach } from 'vitest'

let worldService: typeof import('../../src/services/world.service.js')

beforeEach(async () => {
  worldService = await import('../../src/services/world.service.js')
})

describe('World State', () => {
  it('getCurrentWorldState: 返回默认创世纪状态', async () => {
    const state = await worldService.getCurrentWorldState()
    expect(state).toBeDefined()
    expect(state.epoch).toBe('genesis')
    expect(state.dimensions.stability).toBeCloseTo(0.5, 1)
    expect(state.dimensions.prosperity).toBeCloseTo(0.5, 1)
    expect(state.dimensions.freedom).toBeCloseTo(0.5, 1)
    expect(state.dimensions.knowledge).toBeCloseTo(0.5, 1)
    expect(state.dimensions.solidarity).toBeCloseTo(0.5, 1)
    expect(state.tideMultiplier).toBeDefined()
    expect(state.tideMultiplier.time).toBeDefined()
  })

  it('updateDimensions: 正常更新维度', async () => {
    const result = await worldService.updateDimensions({
      stability: 0.1,
      prosperity: 0.05,
      freedom: -0.1,
    })
    expect(result).toBeDefined()
    expect(result.dimensions.stability).toBeCloseTo(0.6, 1)
    expect(result.dimensions.prosperity).toBeCloseTo(0.55, 1)
    expect(result.dimensions.freedom).toBeCloseTo(0.4, 1)
    // 未更新的维度不变
    expect(result.dimensions.knowledge).toBeCloseTo(0.5, 1)
    expect(result.dimensions.solidarity).toBeCloseTo(0.5, 1)
  })

  it('updateDimensions: 维度不超过 1', async () => {
    const result = await worldService.updateDimensions({ stability: 0.8 })
    expect(result.dimensions.stability).toBeLessThanOrEqual(1)
    expect(result.dimensions.stability).toBeCloseTo(1.0, 1)
  })

  it('updateDimensions: 维度不低于 0', async () => {
    const result = await worldService.updateDimensions({ stability: -0.9 })
    expect(result.dimensions.stability).toBeGreaterThanOrEqual(0)
    expect(result.dimensions.stability).toBeCloseTo(0, 1)
  })

  it('updateDimensions: 持久化到数据库', async () => {
    await worldService.updateDimensions({ stability: 0.2, prosperity: -0.1 })
    const state = await worldService.getCurrentWorldState()
    expect(state.dimensions.stability).toBeCloseTo(0.7, 1)
    expect(state.dimensions.prosperity).toBeCloseTo(0.4, 1)
  })

  it('updateDimensions: 空更新不改变状态', async () => {
    const before = await worldService.getCurrentWorldState()
    const after = await worldService.updateDimensions({})
    expect(after.dimensions.stability).toBeCloseTo(before.dimensions.stability, 5)
    expect(after.dimensions.prosperity).toBeCloseTo(before.dimensions.prosperity, 5)
  })

  it('updateDimensions: 触发纪元变迁 — 黄金时代', async () => {
    const result = await worldService.updateDimensions({
      stability: 0.2,
      prosperity: 0.3,
    })
    // stability = 0.7, prosperity = 0.8 → golden_age 条件: prosperity > 0.7 && stability > 0.6
    expect(result.epoch).toBe('golden_age')
  })

  it('updateDimensions: 触发纪元变迁 — 动荡时代', async () => {
    const result = await worldService.updateDimensions({
      stability: -0.3,
      prosperity: -0.4,
    })
    // stability = 0.2, prosperity = 0.1 → dark_age 条件: prosperity < 0.2 && stability < 0.3
    expect(result.epoch).toBe('dark_age')
  })

  it('updateDimensions: 触发纪元变迁 — 启蒙时代', async () => {
    const result = await worldService.updateDimensions({
      knowledge: 0.3,
      freedom: 0.2,
    })
    // knowledge = 0.8, freedom = 0.7 → enlightenment 条件: knowledge > 0.7 && freedom > 0.6
    expect(result.epoch).toBe('enlightenment')
  })

  it('updateDimensions: 潮汐乘数随维度变化', async () => {
    const result = await worldService.updateDimensions({
      prosperity: 0.3,
      stability: 0.2,
      solidarity: 0.4,
    })
    // time = 0.5 + prosperity(0.8) = 1.3
    expect(result.tideMultiplier.time).toBeCloseTo(1.3, 1)
    // energy = 0.5 + stability(0.7) = 1.2
    expect(result.tideMultiplier.energy).toBeCloseTo(1.2, 1)
    // reputation = 0.5 + solidarity(0.9) = 1.4
    expect(result.tideMultiplier.reputation).toBeCloseTo(1.4, 1)
  })
})

describe('Epoch Info', () => {
  it('getEpochInfo: 返回创世纪信息', () => {
    const info = worldService.getEpochInfo('genesis')
    expect(info).toBeDefined()
    expect(info.name).toBe('创世纪')
    expect(info.description).toBeTruthy()
  })

  it('getEpochInfo: 返回黄金时代信息', () => {
    const info = worldService.getEpochInfo('golden_age')
    expect(info).toBeDefined()
    expect(info.name).toBe('黄金时代')
  })

  it('getEpochInfo: 不存在的纪元回退到创世纪', () => {
    const info = worldService.getEpochInfo('nonexistent')
    expect(info).toBeDefined()
    expect(info.name).toBe('创世纪')
  })

  it('getAllEpochs: 返回所有纪元列表', () => {
    const epochs = worldService.getAllEpochs()
    expect(Array.isArray(epochs)).toBe(true)
    expect(epochs.length).toBeGreaterThanOrEqual(5) // genesis, golden_age, turbulence, enlightenment, solidarity, dark_age
    const ids = epochs.map(e => e.id)
    expect(ids).toContain('genesis')
    expect(ids).toContain('golden_age')
    expect(ids).toContain('dark_age')
  })
})
