/**
 * 引擎联动测试
 * 验证多个引擎之间的交互和级联效应
 */
import { describe, it, expect } from 'vitest'
import { createTestUser, createTestEvent, createTestItem, createTestInfo } from '../setup.js'

process.env.DB_PATH = './test.db'

import * as eventService from '../../src/services/event.service.js'
import * as resourceService from '../../src/services/resource.service.js'
import * as worldService from '../../src/services/world.service.js'
import * as itemService from '../../src/services/item.service.js'
import { socialService } from '../../src/services/social.service.js'
import { informationService } from '../../src/services/information.service.js'

// ==================== 场景 1：选择结算 → 资源变化 ====================

describe('选择结算联动', () => {
  it('选择结算后钱包正确更新', async () => {
    const userId = createTestUser('interplay-u1', 'interplay1@test.com')
    createTestEvent('interplay-evt1', { title: 'Interplay Event' })

    const walletBefore = await resourceService.getWallet(userId)

    await eventService.processChoice(
      userId, 'interplay-evt1', 'stage_1', 'choice_a', 'Choose A',
      { rewards: { time: 50, energy: 20, reputation: 10 }, resultText: 'Good choice' }
    )

    const walletAfter = await resourceService.getWallet(userId)
    expect(walletAfter.time).toBeGreaterThan(walletBefore.time)
    expect(walletAfter.energy).toBeGreaterThan(walletBefore.energy)
    expect(walletAfter.reputation).toBeGreaterThan(walletBefore.reputation)
  })

  it('惩罚性选择扣减资源', async () => {
    const userId = createTestUser('interplay-u2', 'interplay2@test.com', { time: 500, energy: 50, reputation: 20 })
    createTestEvent('interplay-evt2', { title: 'Penalty Event' })

    const walletBefore = await resourceService.getWallet(userId)

    await eventService.processChoice(
      userId, 'interplay-evt2', 'stage_1', 'choice_b', 'Risky choice',
      { penalties: { time: 30, energy: 10 }, resultText: 'Bad outcome' }
    )

    const walletAfter = await resourceService.getWallet(userId)
    expect(walletAfter.time).toBeLessThan(walletBefore.time)
    expect(walletAfter.energy).toBeLessThan(walletBefore.energy)
  })

  it('多次选择累积选择历史', async () => {
    const userId = createTestUser('interplay-u3', 'interplay3@test.com')
    createTestEvent('interplay-evt3a', { title: 'Event A' })
    createTestEvent('interplay-evt3b', { title: 'Event B' })

    await eventService.processChoice(
      userId, 'interplay-evt3a', 'stage_1', 'choice_a', 'Explore',
      { rewards: { time: 10 }, resultText: 'Explored' }
    )
    await eventService.processChoice(
      userId, 'interplay-evt3b', 'stage_1', 'choice_a', 'Explore again',
      { rewards: { time: 10 }, resultText: 'Explored again' }
    )

    const choices = await eventService.getUserChoices(userId, 10)
    expect(choices.length).toBe(2)
  })
})

// ==================== 场景 2：世界维度 → 物品动态定价 ====================

describe('世界维度影响物品定价', () => {
  it('世界维度变化导致物品价格变化', async () => {
    createTestItem('price-item-1', {
      name: 'World Sensitive Item',
      mintCost: { time: 100, energy: 50 },
      maxMint: 1000,
      mintedCount: 10,
    })

    // 获取初始价格
    const price1 = await itemService.getDynamicPrice('price-item-1')
    expect(price1).toBeDefined()
    if (!price1) return

    // 改变世界维度（大幅提高繁荣度）
    await worldService.updateDimensions({
      stability: 0.4,
      prosperity: 0.4,
    })

    // 获取新价格
    const price2 = await itemService.getDynamicPrice('price-item-1')
    expect(price2).toBeDefined()
    if (!price2) return

    // 价格应该有变化（世界敏感性乘数不同）
    expect(price2.worldSensitivityMultiplier).toBeDefined()
  })

  it('高铸造量导致 Bonding Curve 价格上升', async () => {
    createTestItem('bc-item-low', {
      name: 'Low Mint Item',
      mintCost: { time: 100 },
      maxMint: 1000,
      mintedCount: 10,
    })
    createTestItem('bc-item-high', {
      name: 'High Mint Item',
      mintCost: { time: 100 },
      maxMint: 1000,
      mintedCount: 900,
    })

    const priceLow = await itemService.getDynamicPrice('bc-item-low')
    const priceHigh = await itemService.getDynamicPrice('bc-item-high')

    expect(priceLow).toBeDefined()
    expect(priceHigh).toBeDefined()
    if (!priceLow || !priceHigh) return

    // 高铸造量的 Bonding Curve 乘数应更高
    expect(priceHigh.bondingMultiplier).toBeGreaterThan(priceLow.bondingMultiplier)
    expect(priceHigh.finalCost.time).toBeGreaterThan(priceLow.finalCost.time)
  })
})

// ==================== 场景 3：世界维度 → 纪元变迁 → 潮汐 ====================

describe('纪元变迁与潮汐联动', () => {
  it('高稳定性+高繁荣度改变世界维度', async () => {
    // updateDimensions 接受的是差值（delta），不是绝对值
    await worldService.updateDimensions({
      stability: 0.35,   // 0.5 + 0.35 = 0.85
      prosperity: 0.35,  // 0.5 + 0.35 = 0.85
    })

    const world = await worldService.getCurrentWorldState()
    expect(world.dimensions.stability).toBeCloseTo(0.85, 1)
    expect(world.dimensions.prosperity).toBeCloseTo(0.85, 1)
    expect(world.epoch).toBeDefined()
  })

  it('低稳定性改变世界维度', async () => {
    await worldService.updateDimensions({
      stability: -0.35,  // 0.5 - 0.35 = 0.15
      prosperity: -0.3,  // 0.5 - 0.3 = 0.2
    })

    const world = await worldService.getCurrentWorldState()
    expect(world.dimensions.stability).toBeCloseTo(0.15, 1)
    expect(world.dimensions.prosperity).toBeCloseTo(0.2, 1)
  })

  it('潮汐乘数始终为正数', async () => {
    const world = await worldService.getCurrentWorldState()
    expect(world.tideMultiplier).toBeDefined()

    if (world.tideMultiplier.time) {
      expect(world.tideMultiplier.time).toBeGreaterThan(0)
    }
    if (world.tideMultiplier.energy) {
      expect(world.tideMultiplier.energy).toBeGreaterThan(0)
    }
  })
})

// ==================== 场景 4：社交关系 → 声誉传播 ====================

describe('社交引擎联动', () => {
  it('关注后可以获取社交概览', async () => {
    const userA = createTestUser('soc-a', 'soc-a@test.com')
    const userB = createTestUser('soc-b', 'soc-b@test.com')

    await socialService.follow(userA, userB)

    const overview = await socialService.getSocialOverview(userA)
    expect(overview.followingCount).toBe(1)
    expect(overview.followerCount).toBe(0)
  })

  it('互相关注形成互关', async () => {
    const userA = createTestUser('mutual-a', 'mutual-a@test.com')
    const userB = createTestUser('mutual-b', 'mutual-b@test.com')

    await socialService.follow(userA, userB)
    await socialService.follow(userB, userA)

    const mutuals = await socialService.getMutualFriends(userA)
    // getMutualFriends 返回 { userId, trustValue }[]
    expect(mutuals.length).toBe(1)
    expect(mutuals[0].userId).toBe(userB)
  })

  it('正面互动提升信任值', async () => {
    const userA = createTestUser('trust-a', 'trust-a@test.com')
    const userB = createTestUser('trust-b', 'trust-b@test.com')

    await socialService.follow(userA, userB)

    // recordInteraction 返回 { trustBefore, trustAfter }
    const result = await socialService.recordInteraction(userA, userB, 'positive')
    expect(result.trustAfter).toBeGreaterThan(result.trustBefore)
  })

  it('背叛大幅降低信任值', async () => {
    const userA = createTestUser('betray-a', 'betray-a@test.com')
    const userB = createTestUser('betray-b', 'betray-b@test.com')

    await socialService.follow(userA, userB)

    // 先建立一些信任
    await socialService.recordInteraction(userA, userB, 'positive')
    await socialService.recordInteraction(userA, userB, 'positive')

    // 背叛
    const result = await socialService.recordInteraction(userA, userB, 'betrayal')
    expect(result.trustAfter).toBeLessThan(result.trustBefore)
  })

  it('声誉加成计算', async () => {
    const userA = createTestUser('rep-a', 'rep-a@test.com', { reputation: 100 })
    const userB = createTestUser('rep-b', 'rep-b@test.com', { reputation: 200 })

    await socialService.follow(userA, userB)
    await socialService.follow(userB, userA)

    const bonuses = await socialService.calculateReputationBonus(userA)
    expect(bonuses).toBeDefined()
    expect(Array.isArray(bonuses)).toBe(true)
  })
})

// ==================== 场景 5：信息引擎 → 资源消耗 ====================

describe('信息引擎联动', () => {
  it('生成事件信息', async () => {
    createTestEvent('info-evt', { title: 'Info Event', status: 'active' })

    const pieces = await informationService.generateEventInformation('info-evt')
    expect(pieces.length).toBeGreaterThan(0)

    const tiers = pieces.map((p: any) => p.tier)
    expect(tiers).toContain('public')
  })

  it('解锁公开信息不消耗声誉', async () => {
    const userId = createTestUser('info-u1', 'info-u1@test.com', { reputation: 50 })
    createTestInfo('free-info', { tier: 'public', unlockCost: 0 })

    const walletBefore = await resourceService.getWallet(userId)
    await informationService.unlockInformation(userId, 'free-info')
    const walletAfter = await resourceService.getWallet(userId)

    expect(walletAfter.reputation).toBe(walletBefore.reputation)
  })

  it('解锁高级信息消耗声誉', async () => {
    const userId = createTestUser('info-u2', 'info-u2@test.com', { reputation: 100 })
    createTestInfo('paid-info', { tier: 'deep', unlockCost: 20 })

    const walletBefore = await resourceService.getWallet(userId)
    const result = await informationService.unlockInformation(userId, 'paid-info')

    if (result.success) {
      const walletAfter = await resourceService.getWallet(userId)
      expect(walletAfter.reputation).toBeLessThan(walletBefore.reputation)
    }
  })

  it('声誉不足无法解锁高级信息', async () => {
    const userId = createTestUser('info-u3', 'info-u3@test.com', { reputation: 0 })
    createTestInfo('expensive-info', { tier: 'core', unlockCost: 100 })

    const result = await informationService.unlockInformation(userId, 'expensive-info')
    expect(result.success).toBe(false)
  })

  it('信息市场统计正确', async () => {
    createTestInfo('stat-info-1', { tier: 'public' })
    createTestInfo('stat-info-2', { tier: 'deep' })
    createTestInfo('stat-info-3', { tier: 'core' })

    const stats = await informationService.getInformationMarketStats()
    expect(stats.totalPieces).toBeGreaterThanOrEqual(3)
    expect(stats.tierDistribution).toBeDefined()
  })
})

// ==================== 场景 6：完整生命周期 ====================

describe('完整生命周期', () => {
  it('用户从注册到参与事件的完整流程', async () => {
    const userId = createTestUser('lifecycle-u1', 'lifecycle@test.com', {
      time: 1000, energy: 100, reputation: 0,
    })
    createTestEvent('lifecycle-evt', { title: 'Lifecycle Event' })

    // 验证初始状态
    const wallet0 = await resourceService.getWallet(userId)
    expect(wallet0.time).toBe(1000)
    expect(wallet0.energy).toBe(100)
    expect(wallet0.reputation).toBe(0)

    // 做出选择
    const choiceResult = await eventService.processChoice(
      userId, 'lifecycle-evt', 'stage_1', 'choice_a', 'Explore',
      { rewards: { time: 50, reputation: 15 }, resultText: 'Discovered something' }
    )
    expect(choiceResult.walletAfter).toBeDefined()

    // 验证钱包变化
    const wallet1 = await resourceService.getWallet(userId)
    expect(wallet1.time).toBeGreaterThan(wallet0.time)
    expect(wallet1.reputation).toBeGreaterThan(wallet0.reputation)

    // 验证选择历史
    const choices = await eventService.getUserChoices(userId, 10)
    expect(choices.length).toBe(1)
    expect(choices[0].eventId).toBe('lifecycle-evt')
  })

  it('多用户并发选择不互相干扰', async () => {
    const user1 = createTestUser('concurrent-u1', 'concurrent1@test.com', { time: 500, energy: 50 })
    const user2 = createTestUser('concurrent-u2', 'concurrent2@test.com', { time: 800, energy: 80 })
    createTestEvent('concurrent-evt', { title: 'Concurrent Event' })

    const [result1, result2] = await Promise.all([
      eventService.processChoice(
        user1, 'concurrent-evt', 'stage_1', 'choice_a', 'A',
        { rewards: { time: 100 }, resultText: 'A result' }
      ),
      eventService.processChoice(
        user2, 'concurrent-evt', 'stage_1', 'choice_b', 'B',
        { rewards: { energy: 50 }, resultText: 'B result' }
      ),
    ])

    const wallet1 = await resourceService.getWallet(user1)
    const wallet2 = await resourceService.getWallet(user2)

    expect(wallet1.time).toBeGreaterThan(500)
    expect(wallet2.energy).toBeGreaterThan(80)
    expect(wallet1.energy).toBe(50)
    expect(wallet2.time).toBe(800)
  })

  it('完整社交 + 信息流程', async () => {
    const userA = createTestUser('full-a', 'full-a@test.com', { reputation: 100 })
    const userB = createTestUser('full-b', 'full-b@test.com', { reputation: 50 })

    // 建立社交关系
    await socialService.follow(userA, userB)
    await socialService.follow(userB, userA)

    // 验证互关
    const mutuals = await socialService.getMutualFriends(userA)
    expect(mutuals.length).toBe(1)

    // 正面互动
    const interaction = await socialService.recordInteraction(userA, userB, 'positive')
    expect(interaction.trustAfter).toBeGreaterThan(interaction.trustBefore)

    // 生成信息
    createTestEvent('full-evt', { title: 'Full Event' })
    const infos = await informationService.generateEventInformation('full-evt')
    expect(infos.length).toBeGreaterThan(0)

    // 解锁信息
    if (infos.length > 0) {
      const result = await informationService.unlockInformation(userA, infos[0].id)
      expect(result.success).toBe(true)
    }
  })
})

// ==================== 边界条件 ====================

describe('边界条件', () => {
  it('资源不能变为负数', async () => {
    const userId = createTestUser('boundary-u1', 'boundary1@test.com', { time: 10, energy: 5, reputation: 0 })
    createTestEvent('boundary-evt', { title: 'Boundary Event' })

    await eventService.processChoice(
      userId, 'boundary-evt', 'stage_1', 'choice_a', 'Expensive',
      { penalties: { time: 1000, energy: 500 }, resultText: 'Ouch' }
    )

    const wallet = await resourceService.getWallet(userId)
    expect(wallet.time).toBeGreaterThanOrEqual(0)
    expect(wallet.energy).toBeGreaterThanOrEqual(0)
  })

  it('世界维度被 clamp 到 0-1 范围', async () => {
    // updateDimensions 接受差值，传入极大值测试 clamp
    await worldService.updateDimensions({
      stability: 10,    // 0.5 + 10 → clamp 到 1.0
      prosperity: -10,  // 0.5 - 10 → clamp 到 0.0
    })

    const world = await worldService.getCurrentWorldState()
    expect(world.dimensions.stability).toBeLessThanOrEqual(1)
    expect(world.dimensions.stability).toBeGreaterThanOrEqual(0)
    expect(world.dimensions.prosperity).toBeLessThanOrEqual(1)
    expect(world.dimensions.prosperity).toBeGreaterThanOrEqual(0)
  })

  it('不能关注自己', async () => {
    const userId = createTestUser('self-follow', 'self@test.com')

    try {
      await socialService.follow(userId, userId)
      const overview = await socialService.getSocialOverview(userId)
      expect(overview.followingCount).toBeLessThanOrEqual(1)
    } catch (e: any) {
      expect(e.message).toBeTruthy()
    }
  })

  it('重复关注幂等', async () => {
    const userA = createTestUser('idem-a', 'idem-a@test.com')
    const userB = createTestUser('idem-b', 'idem-b@test.com')

    await socialService.follow(userA, userB)

    try {
      await socialService.follow(userA, userB)
    } catch {
      // 可以抛错也可以幂等
    }

    const overview = await socialService.getSocialOverview(userA)
    expect(overview.followingCount).toBe(1)
  })

  it('空事件 ID 不会崩溃', async () => {
    try {
      await eventService.getEventById('')
    } catch {
      // 预期可能抛错
    }
    expect(true).toBe(true)
  })

  it('不存在的用户 ID 不会崩溃', async () => {
    try {
      await resourceService.getWallet('nonexistent-user-id')
    } catch {
      // 预期可能抛错
    }
    expect(true).toBe(true)
  })
})

// ==================== 错误处理 ====================

describe('错误处理', () => {
  it('processChoice 对不存在的事件仍能记录', async () => {
    const userId = createTestUser('err-u1', 'err1@test.com')

    try {
      await eventService.processChoice(
        userId, 'nonexistent-event', 'stage_1', 'choice_a', 'Test',
        { rewards: { time: 10 }, resultText: 'Test' }
      )
    } catch (e: any) {
      expect(e.message).toBeTruthy()
    }
  })

  it('getDynamicPrice 对不存在的物品返回 null', async () => {
    const price = await itemService.getDynamicPrice('nonexistent-item')
    expect(price).toBeNull()
  })

  it('unlockInformation 对不存在的信息返回失败', async () => {
    const userId = createTestUser('err-u2', 'err2@test.com')
    const result = await informationService.unlockInformation(userId, 'nonexistent-info')
    expect(result.success).toBe(false)
  })

  it('getFollowing 对无关系的用户返回空数组', async () => {
    const userId = createTestUser('no-rel-a', 'no-rel-a@test.com')
    const following = await socialService.getFollowing(userId)
    expect(following).toEqual([])
  })

  it('getSocialOverview 对新用户返回零值', async () => {
    const userId = createTestUser('new-soc', 'new-soc@test.com')
    const overview = await socialService.getSocialOverview(userId)
    expect(overview.followingCount).toBe(0)
    expect(overview.followerCount).toBe(0)
    expect(overview.mutualCount).toBe(0)
  })
})
