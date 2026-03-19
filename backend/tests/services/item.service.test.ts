/**
 * item.service 单元测试
 * 覆盖：Bonding Curve 动态定价、世界状态敏感性、动态购买
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { createTestUser, createTestItem, getTestSqlite } from '../setup.js'

let itemService: typeof import('../../src/services/item.service.js')

beforeEach(async () => {
  itemService = await import('../../src/services/item.service.js')
})

describe('Dynamic Pricing', () => {
  it('getDynamicPrice: 返回物品动态价格', async () => {
    createTestItem('price-1', { name: 'Priced Item', mintCost: { time: 10, energy: 5 } })
    const price = await itemService.getDynamicPrice('price-1')
    expect(price).toBeDefined()
    expect(price!.baseCost).toEqual({ time: 10, energy: 5 })
    expect(price!.bondingMultiplier).toBeGreaterThanOrEqual(1)
    expect(price!.worldSensitivityMultiplier).toBeGreaterThan(0)
    expect(price!.finalCost.time).toBeGreaterThanOrEqual(0)
    expect(price!.finalCost.energy).toBeGreaterThanOrEqual(0)
    expect(price!.scarcity).toBeGreaterThanOrEqual(0)
    expect(price!.scarcity).toBeLessThanOrEqual(1)
    expect(['rising', 'falling', 'stable']).toContain(price!.trend)
  })

  it('getDynamicPrice: 不存在的物品返回 null', async () => {
    const price = await itemService.getDynamicPrice('nonexistent')
    expect(price).toBeNull()
  })

  it('getDynamicPrice: 铸造量越高价格越高（Bonding Curve）', async () => {
    createTestItem('bc-low', { name: 'Low Supply', mintCost: { time: 100 }, mintedCount: 0, maxMint: 100, rarity: 'rare' })
    createTestItem('bc-high', { name: 'High Supply', mintCost: { time: 100 }, mintedCount: 80, maxMint: 100, rarity: 'rare' })
    const priceLow = await itemService.getDynamicPrice('bc-low')
    const priceHigh = await itemService.getDynamicPrice('bc-high')
    expect(priceHigh!.bondingMultiplier).toBeGreaterThan(priceLow!.bondingMultiplier)
    expect(priceHigh!.finalCost.time).toBeGreaterThan(priceLow!.finalCost.time)
  })

  it('getDynamicPrice: 稀有度越高 Bonding Curve 斜率越陡', async () => {
    createTestItem('rarity-c', { name: 'Common', mintCost: { time: 100 }, mintedCount: 50, maxMint: 100, rarity: 'common' })
    createTestItem('rarity-l', { name: 'Legendary', mintCost: { time: 100 }, mintedCount: 50, maxMint: 100, rarity: 'legendary' })
    const priceC = await itemService.getDynamicPrice('rarity-c')
    const priceL = await itemService.getDynamicPrice('rarity-l')
    expect(priceL!.bondingMultiplier).toBeGreaterThan(priceC!.bondingMultiplier)
  })

  it('getAllItemsWithPrices: 返回所有可见物品含价格', async () => {
    // 注意 setup 中 createTestItem 使用 visible=1 (true)
    createTestItem('ap-1', { name: 'Item A', mintCost: { time: 10 } })
    createTestItem('ap-2', { name: 'Item B', mintCost: { time: 20 } })
    const items = await itemService.getAllItemsWithPrices()
    expect(items.length).toBeGreaterThanOrEqual(2)
    for (const item of items) {
      expect(item.dynamicPrice).toBeDefined()
      expect(item.dynamicPrice.finalCost).toBeDefined()
    }
  })

  it('getAllItemsWithPrices: 无物品返回空数组', async () => {
    const items = await itemService.getAllItemsWithPrices()
    expect(items).toEqual([])
  })
})

describe('Buy Item Dynamic', () => {
  it('buyItemDynamic: 正常购买 — 扣费+入包+铸造计数增加', async () => {
    createTestUser('bid1', 'bid1@test.com', { time: 1000, energy: 200, reputation: 50 })
    createTestItem('buy-1', { name: 'Buyable', mintCost: { time: 10, energy: 5 }, tags: ['social'] })
    const result = await itemService.buyItemDynamic('bid1', 'buy-1')
    expect(result).toBeDefined()
    expect(result.wallet).toBeDefined()
    expect(result.wallet.time).toBeLessThan(1000) // 扣了钱
    expect(result.inventory.length).toBeGreaterThanOrEqual(1)
    expect(result.dynamicPrice).toBeDefined()
    expect(result.dynamicPrice.mintedCount).toBe(1) // 铸造计数增加
  })

  it('buyItemDynamic: 余额不足抛出错误', async () => {
    createTestUser('bid2', 'bid2@test.com', { time: 1, energy: 1, reputation: 0 })
    createTestItem('buy-2', { name: 'Expensive', mintCost: { time: 100, energy: 50 } })
    await expect(itemService.buyItemDynamic('bid2', 'buy-2')).rejects.toThrow()
  })

  it('buyItemDynamic: 不存在的物品抛出错误', async () => {
    createTestUser('bid3', 'bid3@test.com', { time: 1000, energy: 200, reputation: 50 })
    await expect(itemService.buyItemDynamic('bid3', 'nonexistent-item')).rejects.toThrow('物品不存在')
  })

  it('buyItemDynamic: 连续购买价格递增', async () => {
    createTestUser('bid4', 'bid4@test.com', { time: 10000, energy: 5000, reputation: 100 })
    createTestItem('buy-3', { name: 'Escalating', mintCost: { time: 100 }, rarity: 'rare', maxMint: 10, mintedCount: 0 })
    
    const r1 = await itemService.buyItemDynamic('bid4', 'buy-3')
    const price1 = r1.dynamicPrice.finalCost.time
    
    const r2 = await itemService.buyItemDynamic('bid4', 'buy-3')
    const price2 = r2.dynamicPrice.finalCost.time
    
    // 第二次购买后的价格应该更高（因为铸造量增加了）
    expect(price2).toBeGreaterThanOrEqual(price1)
  })
})
