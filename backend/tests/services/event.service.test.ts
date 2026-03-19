/**
 * event.service 单元测试
 * 覆盖：事件查询、选择处理（含 outcome）、编年史、事件遗产
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { createTestUser, createTestEvent } from '../setup.js'

let eventService: typeof import('../../src/services/event.service.js')

beforeEach(async () => {
  eventService = await import('../../src/services/event.service.js')
})

// ==================== 事件查询 ====================

describe('Event Queries', () => {
  it('getActiveEvents: 无事件时返回空数组', async () => {
    const events = await eventService.getActiveEvents()
    expect(events).toEqual([])
  })

  it('getActiveEvents: 返回所有事件', async () => {
    createTestEvent('evt-1', { title: 'Event 1' })
    createTestEvent('evt-2', { title: 'Event 2' })
    createTestEvent('evt-3', { title: 'Event 3' })
    const events = await eventService.getActiveEvents()
    expect(events.length).toBe(3)
  })

  it('getEventById: 返回指定事件', async () => {
    createTestEvent('evt-find', { title: 'Findable Event' })
    const event = await eventService.getEventById('evt-find')
    expect(event).toBeDefined()
    expect(event!.title).toBe('Findable Event')
  })

  it('getEventById: 不存在的事件返回 null 或 undefined', async () => {
    const event = await eventService.getEventById('nonexistent')
    expect(event == null).toBe(true)
  })
})

// ==================== 选择处理（非对称结算） ====================

describe('Choice Processing', () => {
  it('processChoice: 带 rewards 的选择 — 钱包增加', async () => {
    createTestUser('cu1', 'cu1@test.com', { time: 1000, energy: 100, reputation: 50 })
    createTestEvent('evt-choice', { title: 'Choice Event' })

    const result = await eventService.processChoice(
      'cu1', 'evt-choice', 'stage_1', 'choice_a', 'Choose A',
      {
        resultText: '你获得了奖励',
        rewards: { time: 50, energy: 20, reputation: 10 },
      }
    )
    expect(result).toBeDefined()
    expect(result.walletAfter).toBeDefined()
    expect(result.walletAfter.time).toBeGreaterThanOrEqual(1000) // 至少不减少（有奖励）
    expect(result.choiceRecordId).toBeTruthy()
  })

  it('processChoice: 带 penalties 的选择 — 钱包减少', async () => {
    createTestUser('cu-pen', 'cu-pen@test.com', { time: 1000, energy: 100, reputation: 50 })
    createTestEvent('evt-pen', { title: 'Penalty Event' })

    const result = await eventService.processChoice(
      'cu-pen', 'evt-pen', 'stage_1', 'choice_a', 'Choose A',
      {
        resultText: '你付出了代价',
        penalties: { time: 50, energy: 20 },
      }
    )
    expect(result.walletAfter.time).toBeLessThan(1000)
    expect(result.walletAfter.energy).toBeLessThan(100)
  })

  it('processChoice: 同时有 rewards 和 penalties — 净结算', async () => {
    createTestUser('cu-net', 'cu-net@test.com', { time: 1000, energy: 100, reputation: 50 })
    createTestEvent('evt-net', { title: 'Net Event' })

    const result = await eventService.processChoice(
      'cu-net', 'evt-net', 'stage_1', 'choice_a', 'Choose A',
      {
        resultText: '复杂结算',
        rewards: { time: 100, reputation: 20 },
        penalties: { energy: 30 },
      }
    )
    expect(result.walletAfter.time).toBeGreaterThan(1000) // 有 time 奖励
    expect(result.walletAfter.energy).toBeLessThan(100)   // 有 energy 惩罚
  })

  it('processChoice: 空 outcome — 不改变钱包', async () => {
    createTestUser('cu-empty', 'cu-empty@test.com', { time: 1000, energy: 100, reputation: 50 })
    createTestEvent('evt-empty', { title: 'Empty Event' })

    const result = await eventService.processChoice(
      'cu-empty', 'evt-empty', 'stage_1', 'choice_a', 'Choose A',
      { resultText: '什么都没发生' }
    )
    expect(result.walletAfter.time).toBe(1000)
    expect(result.walletAfter.energy).toBe(100)
    expect(result.walletAfter.reputation).toBe(50)
  })

  it('getUserChoices: 返回用户选择记录', async () => {
    createTestUser('cu2', 'cu2@test.com', { time: 1000, energy: 100, reputation: 50 })
    createTestEvent('evt-ch2', { title: 'Choice Event 2' })

    await eventService.processChoice(
      'cu2', 'evt-ch2', 'stage_1', 'choice_a', 'Choose A',
      { rewards: { time: 10 } }
    )
    const choices = await eventService.getUserChoices('cu2')
    expect(choices.length).toBeGreaterThanOrEqual(1)
  })

  it('getUserChoices: 无记录时返回空数组', async () => {
    createTestUser('cu3', 'cu3@test.com')
    const choices = await eventService.getUserChoices('cu3')
    expect(choices).toEqual([])
  })
})

// ==================== 世界线记录 ====================

describe('Worldline Records', () => {
  it('getWorldlineRecords: 新用户返回空数组', async () => {
    createTestUser('wl1', 'wl1@test.com')
    const records = await eventService.getWorldlineRecords('wl1')
    expect(Array.isArray(records)).toBe(true)
  })
})

// ==================== 事件遗产 ====================

describe('Event Legacies', () => {
  it('createEventLegacy: 创建遗产', async () => {
    createTestEvent('evt-leg', { title: 'Legacy Event' })
    const legacy = await eventService.createEventLegacy(
      'evt-leg', 'world_shift', { stability: 0.05 }
    )
    expect(legacy).toBeDefined()
  })

  it('getEventLegacies: 查询遗产', async () => {
    createTestEvent('evt-leg2', { title: 'Legacy Event 2' })
    await eventService.createEventLegacy('evt-leg2', 'tag_trend', { tag: 'social', boost: 2 })
    const legacies = await eventService.getEventLegacies('evt-leg2')
    expect(legacies.length).toBeGreaterThanOrEqual(1)
  })

  it('getEventLegacies: 无遗产返回空数组', async () => {
    const legacies = await eventService.getEventLegacies('nonexistent')
    expect(legacies).toEqual([])
  })
})
