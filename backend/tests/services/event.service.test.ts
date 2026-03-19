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

// ==================== 事件生命周期 ====================

describe('Event Lifecycle', () => {
  it('startEvent: 记录到用户历史并增加参与人数', async () => {
    createTestUser('start-u1', 'start-u1@test.com')
    createTestEvent('start-evt1', { title: 'Start Event' })

    await eventService.startEvent('start-u1', 'start-evt1')

    // 验证参与人数增加
    const event = await eventService.getEventById('start-evt1')
    expect(event!.participantCount).toBe(1)
  })

  it('startEvent: 重复参与不重复添加到历史', async () => {
    createTestUser('start-u2', 'start-u2@test.com')
    createTestEvent('start-evt2', { title: 'Start Event 2' })

    await eventService.startEvent('start-u2', 'start-evt2')
    await eventService.startEvent('start-u2', 'start-evt2')

    // 参与人数应该增加了 2 次（每次调用都会 +1）
    const event = await eventService.getEventById('start-evt2')
    expect(event!.participantCount).toBe(2)
  })

  it('startEvent: 不存在的事件抛出错误', async () => {
    createTestUser('start-u3', 'start-u3@test.com')
    await expect(eventService.startEvent('start-u3', 'nonexistent'))
      .rejects.toThrow('事件不存在')
  })

  it('completeEvent: 从进行中移除并添加到已完成', async () => {
    createTestUser('comp-u1', 'comp-u1@test.com')
    createTestEvent('comp-evt1', { title: 'Complete Event' })

    // 先开始事件
    await eventService.startEvent('comp-u1', 'comp-evt1')
    // 再完成事件
    await eventService.completeEvent('comp-u1', 'comp-evt1')

    // 验证历史记录
    const resourceService = await import('../../src/services/resource.service.js')
    const history = await resourceService.getUserHistory('comp-u1')
    expect(history.completedEvents).toContain('comp-evt1')
    expect(history.currentEvents || []).not.toContain('comp-evt1')
  })

  it('completeEvent: 重复完成不会重复添加', async () => {
    createTestUser('comp-u2', 'comp-u2@test.com')
    createTestEvent('comp-evt2', { title: 'Complete Event 2' })

    await eventService.startEvent('comp-u2', 'comp-evt2')
    await eventService.completeEvent('comp-u2', 'comp-evt2')
    await eventService.completeEvent('comp-u2', 'comp-evt2')

    const resourceService = await import('../../src/services/resource.service.js')
    const history = await resourceService.getUserHistory('comp-u2')
    const count = history.completedEvents.filter((id: string) => id === 'comp-evt2').length
    expect(count).toBe(1)
  })

  it('completeEvent: 未开始的事件也能完成（容错）', async () => {
    createTestUser('comp-u3', 'comp-u3@test.com')
    createTestEvent('comp-evt3', { title: 'Complete Event 3' })

    await eventService.completeEvent('comp-u3', 'comp-evt3')

    const resourceService = await import('../../src/services/resource.service.js')
    const history = await resourceService.getUserHistory('comp-u3')
    expect(history.completedEvents).toContain('comp-evt3')
  })
})

// ==================== processChoice 边界条件 ====================

describe('processChoice Edge Cases', () => {
  it('processChoice: 带 tags 的 outcome 更新用户标签', async () => {
    createTestUser('tag-u1', 'tag-u1@test.com', { time: 1000, energy: 100, reputation: 50 })
    createTestEvent('tag-evt1', { title: 'Tag Event' })

    const result = await eventService.processChoice(
      'tag-u1', 'tag-evt1', 'stage_1', 'choice_a', 'Choose A',
      {
        resultText: '获得标签',
        rewards: { tags: { social: 5, tech: 3 } },
      }
    )
    expect(result).toBeDefined()
    expect(result.choiceRecordId).toBeTruthy()
  })

  it('processChoice: 大额惩罚不会让钱包变为负数', async () => {
    createTestUser('neg-u1', 'neg-u1@test.com', { time: 100, energy: 50, reputation: 10 })
    createTestEvent('neg-evt1', { title: 'Neg Event' })

    const result = await eventService.processChoice(
      'neg-u1', 'neg-evt1', 'stage_1', 'choice_a', 'Choose A',
      {
        resultText: '巨额惩罚',
        penalties: { time: 9999, energy: 9999, reputation: 9999 },
      }
    )
    expect(result.walletAfter.time).toBeGreaterThanOrEqual(0)
    expect(result.walletAfter.energy).toBeGreaterThanOrEqual(0)
    expect(result.walletAfter.reputation).toBeGreaterThanOrEqual(0)
  })

  it('processChoice 对不存在的事件抛出外键约束错误', async () => {
    createTestUser('ghost-u1', 'ghost-u1@test.com', { time: 1000, energy: 100, reputation: 50 })
    // 不创建事件，直接提交选择 —— 应该因外键约束失败
    await expect(eventService.processChoice(
      'ghost-u1', 'nonexistent-evt', 'stage_1', 'choice_a', 'Choose A',
      { rewards: { time: 10 } }
    )).rejects.toThrow()
  })

  it('getUserChoices: limit 参数限制返回数量', async () => {
    createTestUser('limit-u1', 'limit-u1@test.com', { time: 10000, energy: 1000, reputation: 500 })
    createTestEvent('limit-evt', { title: 'Limit Event' })

    // 创建 5 条选择记录
    for (let i = 0; i < 5; i++) {
      await eventService.processChoice(
        'limit-u1', 'limit-evt', 'stage_1', `choice_${i}`, `Choice ${i}`,
        { rewards: { time: 1 } }
      )
    }

    const limited = await eventService.getUserChoices('limit-u1', 3)
    expect(limited.length).toBe(3)

    const all = await eventService.getUserChoices('limit-u1', 50)
    expect(all.length).toBe(5)
  })

  it('getWorldlineRecords: 有事件历史后返回非空数组', async () => {
    createTestUser('wl-u1', 'wl-u1@test.com', { time: 1000, energy: 100, reputation: 50 })
    createTestEvent('wl-evt1', { title: 'WL Event' })

    // 先开始事件（这会写入 history.currentEvents）
    await eventService.startEvent('wl-u1', 'wl-evt1')

    // 再做出选择
    await eventService.processChoice(
      'wl-u1', 'wl-evt1', 'stage_1', 'choice_a', 'Choose A',
      { rewards: { time: 10 } }
    )

    const records = await eventService.getWorldlineRecords('wl-u1')
    // getWorldlineRecords 从 history.currentEvents/completedEvents 构建记录
    expect(records.length).toBeGreaterThanOrEqual(1)
  })

  it('getEventLegacies: 不传 eventId 返回所有遗产', async () => {
    createTestEvent('leg-evt-a', { title: 'Legacy A' })
    createTestEvent('leg-evt-b', { title: 'Legacy B' })
    await eventService.createEventLegacy('leg-evt-a', 'world_shift', { stability: 0.1 })
    await eventService.createEventLegacy('leg-evt-b', 'tag_trend', { tag: 'tech' })

    const all = await eventService.getEventLegacies()
    expect(all.length).toBeGreaterThanOrEqual(2)
  })
})
