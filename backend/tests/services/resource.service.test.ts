/**
 * resource.service 单元测试
 * 覆盖：钱包CRUD、标签权重更新/衰减、背包管理、购买流程
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { createTestUser, createTestItem } from '../setup.js'

// 延迟导入，确保 DB_PATH 已设置
let resourceService: typeof import('../../src/services/resource.service.js')

beforeEach(async () => {
  resourceService = await import('../../src/services/resource.service.js')
})

// ==================== 钱包操作 ====================

describe('Wallet Operations', () => {
  it('getWallet: 返回正确的初始钱包', async () => {
    createTestUser('u1', 'u1@test.com', { time: 1000, energy: 100, reputation: 50 })
    const wallet = await resourceService.getWallet('u1')
    expect(wallet).toEqual({ time: 1000, energy: 100, reputation: 50 })
  })

  it('getWallet: 不存在的用户抛出错误', async () => {
    await expect(resourceService.getWallet('nonexistent')).rejects.toThrow('用户不存在')
  })

  it('canAfford: 余额充足返回 true', async () => {
    createTestUser('u2', 'u2@test.com', { time: 500, energy: 50, reputation: 10 })
    const result = await resourceService.canAfford('u2', { time: 100, energy: 30 })
    expect(result).toBe(true)
  })

  it('canAfford: 余额不足返回 false', async () => {
    createTestUser('u3', 'u3@test.com', { time: 50, energy: 10, reputation: 0 })
    const result = await resourceService.canAfford('u3', { time: 100 })
    expect(result).toBe(false)
  })

  it('canAfford: 边界值 — 刚好够用返回 true', async () => {
    createTestUser('u4', 'u4@test.com', { time: 100, energy: 50, reputation: 0 })
    const result = await resourceService.canAfford('u4', { time: 100, energy: 50 })
    expect(result).toBe(true)
  })

  it('canAfford: 部分资源不足返回 false', async () => {
    createTestUser('u5', 'u5@test.com', { time: 1000, energy: 5, reputation: 0 })
    const result = await resourceService.canAfford('u5', { time: 10, energy: 10 })
    expect(result).toBe(false)
  })

  it('deductResources: 正常扣除', async () => {
    createTestUser('u6', 'u6@test.com', { time: 500, energy: 80, reputation: 20 })
    const wallet = await resourceService.deductResources('u6', { time: 100, energy: 30, reputation: 5 })
    expect(wallet).toEqual({ time: 400, energy: 50, reputation: 15 })
    // 验证数据库持久化
    const check = await resourceService.getWallet('u6')
    expect(check).toEqual({ time: 400, energy: 50, reputation: 15 })
  })

  it('deductResources: 扣除超过余额时钱包归零（不为负）', async () => {
    createTestUser('u7', 'u7@test.com', { time: 50, energy: 10, reputation: 0 })
    const wallet = await resourceService.deductResources('u7', { time: 100, energy: 20 })
    expect(wallet.time).toBe(0)
    expect(wallet.energy).toBe(0)
  })

  it('addResources: 正常增加', async () => {
    createTestUser('u8', 'u8@test.com', { time: 100, energy: 50, reputation: 0 })
    const wallet = await resourceService.addResources('u8', { time: 200, energy: 30, reputation: 10 })
    expect(wallet).toEqual({ time: 300, energy: 80, reputation: 10 })
  })

  it('addResources: 只增加部分资源', async () => {
    createTestUser('u9', 'u9@test.com', { time: 100, energy: 50, reputation: 0 })
    const wallet = await resourceService.addResources('u9', { reputation: 25 })
    expect(wallet).toEqual({ time: 100, energy: 50, reputation: 25 })
  })
})

// ==================== 标签操作 ====================

describe('Tag Operations', () => {
  it('getUserTags: 新用户返回空数组', async () => {
    createTestUser('t1', 't1@test.com')
    const tags = await resourceService.getUserTags('t1')
    expect(tags).toEqual([])
  })

  it('getUserTags: 有标签的用户返回正确数据', async () => {
    const existingTags = JSON.stringify([{ tagId: 'social', weight: 10, actionCount: 2, lastActionTime: Date.now(), source: 'event', acquiredAt: Date.now() }])
    createTestUser('t2', 't2@test.com', { tags: existingTags })
    const tags = await resourceService.getUserTags('t2')
    expect(tags).toHaveLength(1)
    expect(tags[0].tagId).toBe('social')
    expect(tags[0].weight).toBe(10)
  })

  it('updateTagWeight: 新标签首次添加', async () => {
    createTestUser('t3', 't3@test.com')
    const result = await resourceService.updateTagWeight('t3', 'adventure', 10, 'event', 'evt1', 'Test Event')
    expect(result.tags).toHaveLength(1)
    expect(result.tags[0].tagId).toBe('adventure')
    expect(result.tags[0].weight).toBeGreaterThan(0)
    expect(result.tags[0].actionCount).toBe(1)
    expect(result.action.tagId).toBe('adventure')
    expect(result.action.weightChange).toBeGreaterThan(0)
  })

  it('updateTagWeight: 已有标签累加（递减增长）', async () => {
    createTestUser('t4', 't4@test.com')
    const r1 = await resourceService.updateTagWeight('t4', 'social', 10, 'event', 'evt1', 'Event 1')
    const firstWeight = r1.tags[0].weight
    const r2 = await resourceService.updateTagWeight('t4', 'social', 10, 'event', 'evt2', 'Event 2')
    const secondWeight = r2.tags[0].weight
    // 第二次增量应小于第一次（递减增长）
    const increment1 = firstWeight
    const increment2 = secondWeight - firstWeight
    expect(increment2).toBeLessThan(increment1)
  })

  it('updateTagWeight: 权重不超过 100', async () => {
    const existingTags = JSON.stringify([{ tagId: 'maxed', weight: 99, actionCount: 0, lastActionTime: Date.now(), source: 'event', acquiredAt: Date.now() }])
    createTestUser('t5', 't5@test.com', { tags: existingTags })
    const result = await resourceService.updateTagWeight('t5', 'maxed', 50, 'event', 'evt1', 'Test')
    expect(result.tags[0].weight).toBeLessThanOrEqual(100)
  })

  it('updateTagWeights: 批量更新多个标签', async () => {
    createTestUser('t6', 't6@test.com')
    const tags = await resourceService.updateTagWeights(
      't6',
      [{ tagId: 'social', weight: 10 }, { tagId: 'tech', weight: 8 }, { tagId: 'art', weight: 5 }],
      'event', 'evt1', 'Multi Event'
    )
    expect(tags).toHaveLength(3)
    const tagIds = tags.map(t => t.tagId)
    expect(tagIds).toContain('social')
    expect(tagIds).toContain('tech')
    expect(tagIds).toContain('art')
  })

  it('decayTagWeights: 30天内不衰减', async () => {
    const recentTags = JSON.stringify([{ tagId: 'active', weight: 50, actionCount: 5, lastActionTime: Date.now(), source: 'event', acquiredAt: Date.now() }])
    createTestUser('t7', 't7@test.com', { tags: recentTags })
    const tags = await resourceService.decayTagWeights('t7')
    expect(tags[0].weight).toBe(50) // 不变
  })

  it('decayTagWeights: 超过30天衰减10%', async () => {
    const oldTime = Date.now() - 31 * 24 * 60 * 60 * 1000
    const oldTags = JSON.stringify([{ tagId: 'stale', weight: 50, actionCount: 5, lastActionTime: oldTime, source: 'event', acquiredAt: oldTime }])
    createTestUser('t8', 't8@test.com', { tags: oldTags })
    const tags = await resourceService.decayTagWeights('t8')
    expect(tags[0].weight).toBe(45) // 50 * 0.9
  })
})

// ==================== 背包操作 ====================

describe('Inventory Operations', () => {
  it('getInventory: 空背包', async () => {
    createTestUser('i1', 'i1@test.com')
    const inv = await resourceService.getInventory('i1')
    expect(inv).toEqual([])
  })

  it('addItem: 添加新物品', async () => {
    createTestUser('i2', 'i2@test.com')
    const inv = await resourceService.addItem('i2', 'item_sword', 1, 'quest')
    expect(inv).toHaveLength(1)
    expect(inv[0].itemId).toBe('item_sword')
    expect(inv[0].quantity).toBe(1)
    expect(inv[0].source).toBe('quest')
  })

  it('addItem: 已有物品叠加数量', async () => {
    createTestUser('i3', 'i3@test.com')
    await resourceService.addItem('i3', 'item_potion', 3, 'buy')
    const inv = await resourceService.addItem('i3', 'item_potion', 2, 'buy')
    expect(inv).toHaveLength(1)
    expect(inv[0].quantity).toBe(5)
  })

  it('addItem: 多种物品共存', async () => {
    createTestUser('i4', 'i4@test.com')
    await resourceService.addItem('i4', 'item_a', 1, 'quest')
    await resourceService.addItem('i4', 'item_b', 2, 'buy')
    const inv = await resourceService.getInventory('i4')
    expect(inv).toHaveLength(2)
  })

  it('removeItem: 正常移除', async () => {
    createTestUser('i5', 'i5@test.com')
    await resourceService.addItem('i5', 'item_x', 5, 'test')
    const inv = await resourceService.removeItem('i5', 'item_x', 3)
    const remaining = inv.find(i => i.itemId === 'item_x')
    expect(remaining?.quantity).toBe(2)
  })

  it('removeItem: 移除全部后物品消失', async () => {
    createTestUser('i6', 'i6@test.com')
    await resourceService.addItem('i6', 'item_y', 2, 'test')
    const inv = await resourceService.removeItem('i6', 'item_y', 2)
    expect(inv.find(i => i.itemId === 'item_y')).toBeUndefined()
  })

  it('removeItem: 数量不足抛出错误', async () => {
    createTestUser('i7', 'i7@test.com')
    await resourceService.addItem('i7', 'item_z', 1, 'test')
    await expect(resourceService.removeItem('i7', 'item_z', 5)).rejects.toThrow('物品不足')
  })

  it('removeItem: 不存在的物品抛出错误', async () => {
    createTestUser('i8', 'i8@test.com')
    await expect(resourceService.removeItem('i8', 'nonexistent', 1)).rejects.toThrow('物品不足')
  })
})

// ==================== 购买流程 ====================

describe('Buy Item Flow', () => {
  it('buyItem: 正常购买 — 扣费+入包+标签更新', async () => {
    createTestUser('b1', 'b1@test.com', { time: 500, energy: 100, reputation: 50 })
    const result = await resourceService.buyItem('b1', {
      id: 'item_coffee',
      name: 'Coffee',
      mintCost: { time: 10, energy: 5 },
      tags: ['social', 'daily'],
    })
    // 钱包扣费
    expect(result.wallet.time).toBe(490)
    expect(result.wallet.energy).toBe(95)
    // 背包入包
    expect(result.inventory.find(i => i.itemId === 'item_coffee')?.quantity).toBe(1)
    // 标签更新
    expect(result.tags.length).toBeGreaterThanOrEqual(2)
    const socialTag = result.tags.find(t => t.tagId === 'social')
    expect(socialTag).toBeDefined()
    expect(socialTag!.weight).toBeGreaterThan(0)
  })

  it('buyItem: 余额不足抛出错误', async () => {
    createTestUser('b2', 'b2@test.com', { time: 5, energy: 2, reputation: 0 })
    await expect(resourceService.buyItem('b2', {
      id: 'item_expensive',
      name: 'Expensive',
      mintCost: { time: 100, energy: 50 },
      tags: ['luxury'],
    })).rejects.toThrow('资源不足')
  })

  it('buyItem: 重复购买叠加数量', async () => {
    createTestUser('b3', 'b3@test.com', { time: 1000, energy: 200, reputation: 50 })
    await resourceService.buyItem('b3', { id: 'item_tea', name: 'Tea', mintCost: { time: 5 }, tags: ['daily'] })
    const result = await resourceService.buyItem('b3', { id: 'item_tea', name: 'Tea', mintCost: { time: 5 }, tags: ['daily'] })
    expect(result.inventory.find(i => i.itemId === 'item_tea')?.quantity).toBe(2)
  })
})

// ==================== 用户历史 ====================

describe('User History', () => {
  it('getUserHistory: 新用户返回空对象', async () => {
    createTestUser('h1', 'h1@test.com')
    const history = await resourceService.getUserHistory('h1')
    expect(history).toEqual({})
  })

  it('updateUserHistory: 保存并读取', async () => {
    createTestUser('h2', 'h2@test.com')
    const data = { completedEvents: ['evt1', 'evt2'], achievements: ['first_choice'] }
    await resourceService.updateUserHistory('h2', data)
    const history = await resourceService.getUserHistory('h2')
    expect(history.completedEvents).toEqual(['evt1', 'evt2'])
    expect(history.achievements).toEqual(['first_choice'])
  })
})
