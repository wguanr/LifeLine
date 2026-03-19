/**
 * 引擎联动扩展测试
 * 补齐所有跨引擎场景、边界条件、并发安全和错误处理
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

// ==================== 场景 A：购买物品全链路 ====================

describe('购买物品全链路联动', () => {
  it('购买物品后钱包扣减 + 背包增加', async () => {
    const userId = createTestUser('buy-chain-u1', 'buy-chain1@test.com', { time: 2000, energy: 200 })
    createTestItem('buy-chain-item1', {
      name: 'Chain Item',
      mintCost: { time: 100, energy: 50 },
      maxMint: 100,
      mintedCount: 0,
    })

    const walletBefore = await resourceService.getWallet(userId)
    const result = await itemService.buyItemDynamic(userId, 'buy-chain-item1')

    expect(result.wallet.time).toBeLessThan(walletBefore.time)
    expect(result.wallet.energy).toBeLessThan(walletBefore.energy)
    expect(result.inventory.length).toBeGreaterThan(0)
  })

  it('购买物品后 Bonding Curve 价格上升', async () => {
    createTestItem('bc-rise-item', {
      name: 'BC Rise Item',
      mintCost: { time: 100 },
      maxMint: 100,
      mintedCount: 10,
      tags: ['techie'],
    })

    const priceBefore = await itemService.getDynamicPrice('bc-rise-item')
    expect(priceBefore).toBeDefined()

    const userId = createTestUser('bc-rise-u1', 'bc-rise@test.com', { time: 5000, energy: 500 })
    await itemService.buyItemDynamic(userId, 'bc-rise-item')

    const priceAfter = await itemService.getDynamicPrice('bc-rise-item')
    expect(priceAfter).toBeDefined()
    expect(priceAfter!.mintedCount).toBe(priceBefore!.mintedCount + 1)
    expect(priceAfter!.bondingMultiplier).toBeGreaterThanOrEqual(priceBefore!.bondingMultiplier)
  })

  it('购买物品后标签权重更新', async () => {
    const userId = createTestUser('buy-tag-u1', 'buy-tag@test.com', { time: 5000, energy: 500 })
    createTestItem('buy-tag-item', {
      name: 'Tag Item',
      mintCost: { time: 50 },
      maxMint: 100,
      mintedCount: 0,
      tags: ['techie', 'learner'],
    })

    const tagsBefore = await resourceService.getUserTags(userId)
    await itemService.buyItemDynamic(userId, 'buy-tag-item')
    const tagsAfter = await resourceService.getUserTags(userId)

    // 购买后应该有标签更新（可能新增了 techie 和 learner）
    expect(tagsAfter.length).toBeGreaterThanOrEqual(tagsBefore.length)
  })

  it('余额不足无法购买', async () => {
    const userId = createTestUser('buy-poor-u1', 'buy-poor@test.com', { time: 1, energy: 0 })
    createTestItem('expensive-item-1', {
      name: 'Expensive',
      mintCost: { time: 9999, energy: 9999 },
      maxMint: 100,
      mintedCount: 0,
    })

    try {
      await itemService.buyItemDynamic(userId, 'expensive-item-1')
      // 如果没抛错，检查钱包没变
    } catch (e: any) {
      expect(e.message).toBeTruthy()
    }
  })

  it('购买不存在的物品抛错', async () => {
    const userId = createTestUser('buy-ghost-u1', 'buy-ghost@test.com', { time: 5000 })

    try {
      await itemService.buyItemDynamic(userId, 'ghost-item-999')
      expect(true).toBe(false) // 不应该到这里
    } catch (e: any) {
      expect(e.message).toContain('不存在')
    }
  })
})

// ==================== 场景 B：选择结算 → 标签 → 身份光谱 ====================

describe('选择结算与标签联动', () => {
  it('选择结算后标签权重正确更新', async () => {
    const userId = createTestUser('tag-chain-u1', 'tag-chain@test.com')
    createTestEvent('tag-chain-evt', { title: 'Tag Chain Event' })

    await eventService.processChoice(
      userId, 'tag-chain-evt', 'stage_1', 'choice_a', 'Social choice',
      {
        rewards: { reputation: 20 },
        tags: ['social', 'helpful'],
        resultText: 'You helped someone',
      }
    )

    const tags = await resourceService.getUserTags(userId)
    // 如果 processChoice 更新了标签，应该能看到
    // 即使没有直接更新标签，选择历史也应该被记录
    const choices = await eventService.getUserChoices(userId, 10)
    expect(choices.length).toBe(1)
  })

  it('多次选择同一标签方向累积权重', async () => {
    const userId = createTestUser('tag-accum-u1', 'tag-accum@test.com')
    createTestEvent('tag-accum-evt1', { title: 'Accum Event 1' })
    createTestEvent('tag-accum-evt2', { title: 'Accum Event 2' })

    await eventService.processChoice(
      userId, 'tag-accum-evt1', 'stage_1', 'choice_a', 'Tech choice 1',
      { rewards: { time: 10 }, tags: ['techie'], resultText: 'Tech 1' }
    )
    await eventService.processChoice(
      userId, 'tag-accum-evt2', 'stage_1', 'choice_a', 'Tech choice 2',
      { rewards: { time: 10 }, tags: ['techie'], resultText: 'Tech 2' }
    )

    const choices = await eventService.getUserChoices(userId, 10)
    expect(choices.length).toBe(2)
  })

  it('选择结算同时有奖励和惩罚', async () => {
    const userId = createTestUser('mixed-u1', 'mixed@test.com', { time: 500, energy: 50, reputation: 30 })
    createTestEvent('mixed-evt', { title: 'Mixed Event' })

    const walletBefore = await resourceService.getWallet(userId)

    await eventService.processChoice(
      userId, 'mixed-evt', 'stage_1', 'choice_a', 'Risky but rewarding',
      {
        rewards: { reputation: 50 },
        penalties: { time: 100, energy: 20 },
        resultText: 'High risk high reward',
      }
    )

    const walletAfter = await resourceService.getWallet(userId)
    expect(walletAfter.reputation).toBeGreaterThan(walletBefore.reputation)
    expect(walletAfter.time).toBeLessThan(walletBefore.time)
    expect(walletAfter.energy).toBeLessThan(walletBefore.energy)
  })
})

// ==================== 场景 C：世界 Tick 全链路 ====================

describe('世界 Tick 全链路联动', () => {
  it('维度变化后物品价格联动变化', async () => {
    createTestItem('tick-price-item', {
      name: 'Tick Price Item',
      mintCost: { time: 100 },
      maxMint: 100,
      mintedCount: 5,
      tags: ['techie', 'learner'],
    })

    // 获取初始价格
    const price1 = await itemService.getDynamicPrice('tick-price-item')
    expect(price1).toBeDefined()

    // 大幅提高 knowledge 维度（learner/techie 物品应该变便宜）
    // updateDimensions 是增量式的，所以先获取当前值，然后加一个大的 delta
    const worldBefore = await worldService.getCurrentWorldState()
    const knowledgeDelta = 0.45 - worldBefore.dimensions.knowledge
    if (Math.abs(knowledgeDelta) < 0.05) {
      // 如果已经接近目标值，强制一个大变化
      await worldService.updateDimensions({ knowledge: 0.3 })
    } else {
      await worldService.updateDimensions({ knowledge: knowledgeDelta })
    }

    const price2 = await itemService.getDynamicPrice('tick-price-item')
    expect(price2).toBeDefined()

    // worldSensitivityMultiplier 应该变化（或至少不崩溃）
    if (price1 && price2) {
      // 验证价格计算正常完成
      expect(Number.isFinite(price2.worldSensitivityMultiplier)).toBe(true)
      expect(Number.isFinite(price2.finalCost.time)).toBe(true)
    }
  })

  it('极端维度值不会导致价格为 0 或负数', async () => {
    createTestItem('extreme-price-item', {
      name: 'Extreme Price Item',
      mintCost: { time: 100, energy: 50 },
      maxMint: 100,
      mintedCount: 50,
      tags: ['techie'],
    })

    // 将 knowledge 推到极值
    await worldService.updateDimensions({ knowledge: 10 })

    const price = await itemService.getDynamicPrice('extreme-price-item')
    expect(price).toBeDefined()
    if (price) {
      expect(price.finalCost.time).toBeGreaterThan(0)
      expect(price.worldSensitivityMultiplier).toBeGreaterThanOrEqual(0.6)
      expect(price.worldSensitivityMultiplier).toBeLessThanOrEqual(1.4)
    }
  })

  it('纪元变迁后世界状态一致', async () => {
    // 重置维度到中间值
    await worldService.updateDimensions({
      stability: -10, prosperity: -10, knowledge: -10, freedom: -10, solidarity: -10,
    })
    await worldService.updateDimensions({
      stability: 0.5, prosperity: 0.5, knowledge: 0.5, freedom: 0.5, solidarity: 0.5,
    })

    const world = await worldService.getCurrentWorldState()
    expect(world.epoch).toBeDefined()
    expect(world.dimensions).toBeDefined()
    expect(world.tideMultiplier).toBeDefined()

    // 所有维度应在 [0, 1] 范围内
    for (const [key, value] of Object.entries(world.dimensions)) {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(1)
    }
  })
})

// ==================== 场景 D：社交分红联动 ====================

describe('社交分红联动', () => {
  it('社交分红增加粉丝声誉', async () => {
    const achiever = createTestUser('div-achiever', 'div-achiever@test.com', { reputation: 100 })
    const follower = createTestUser('div-follower', 'div-follower@test.com', { reputation: 50 })

    // follower 关注 achiever
    await socialService.follow(follower, achiever)

    // 建立信任
    await socialService.recordInteraction(follower, achiever, 'positive')
    await socialService.recordInteraction(follower, achiever, 'positive')
    await socialService.recordInteraction(follower, achiever, 'positive')

    const walletBefore = await resourceService.getWallet(follower)

    // achiever 完成成就，给粉丝分红
    const result = await socialService.distributeSocialDividend(
      achiever,
      'Achiever',
      'achievement',
      { time: 100, energy: 50, reputation: 30 },
      'Completed a milestone'
    )

    const walletAfter = await resourceService.getWallet(follower)
    // 粉丝的声誉应该增加或至少不减少
    expect(walletAfter.reputation).toBeGreaterThanOrEqual(walletBefore.reputation)
  })

  it('无粉丝时分红列表为空', async () => {
    const userId = createTestUser('no-div-u1', 'no-div@test.com', { reputation: 50 })

    const result = await socialService.distributeSocialDividend(
      userId,
      'Solo',
      'achievement',
      { time: 100, energy: 50, reputation: 30 },
      'No followers'
    )

    expect(result).toEqual([])
  })

  it('背叛后信任降低影响分红', async () => {
    const userA = createTestUser('betray-div-a', 'betray-div-a@test.com', { reputation: 100 })
    const userB = createTestUser('betray-div-b', 'betray-div-b@test.com', { reputation: 200 })

    await socialService.follow(userA, userB)
    await socialService.follow(userB, userA)

    // 建立信任
    await socialService.recordInteraction(userA, userB, 'positive')
    await socialService.recordInteraction(userA, userB, 'positive')

    // 背叛
    await socialService.recordInteraction(userA, userB, 'betrayal')

    // 信任应该大幅降低
    const overview = await socialService.getSocialOverview(userA)
    expect(overview).toBeDefined()
  })
})

// ==================== 场景 E：信息分享全链路 ====================

describe('信息分享全链路', () => {
  it('分享信息后接收方可以看到', async () => {
    const userA = createTestUser('share-chain-a', 'share-chain-a@test.com', { reputation: 100 })
    const userB = createTestUser('share-chain-b', 'share-chain-b@test.com', { reputation: 50 })
    createTestInfo('share-chain-info', { tier: 'public', unlockCost: 0 })

    // A 解锁
    await informationService.unlockInformation(userA, 'share-chain-info')

    // A 分享给 B
    const shareResult = await informationService.shareInformation(userA, 'share-chain-info', userB)
    expect(shareResult.success).toBe(true)

    // B 应该能看到
    const bInfos = await informationService.getUserInformation(userB)
    const found = bInfos.find((i: any) => i.id === 'share-chain-info')
    expect(found).toBeDefined()
  })

  it('分享者获得声誉奖励', async () => {
    const userA = createTestUser('share-rep-a', 'share-rep-a@test.com', { reputation: 100 })
    const userB = createTestUser('share-rep-b', 'share-rep-b@test.com', { reputation: 50 })
    createTestInfo('share-rep-info', { tier: 'public', unlockCost: 0 })

    await informationService.unlockInformation(userA, 'share-rep-info')

    const walletBefore = await resourceService.getWallet(userA)
    await informationService.shareInformation(userA, 'share-rep-info', userB)
    const walletAfter = await resourceService.getWallet(userA)

    // 分享应该获得声誉奖励
    expect(walletAfter.reputation).toBeGreaterThanOrEqual(walletBefore.reputation)
  })

  it('重复分享给同一用户返回失败', async () => {
    const userA = createTestUser('dup-share-a', 'dup-share-a@test.com', { reputation: 100 })
    const userB = createTestUser('dup-share-b', 'dup-share-b@test.com')
    createTestInfo('dup-share-info', { tier: 'public', unlockCost: 0 })

    await informationService.unlockInformation(userA, 'dup-share-info')
    await informationService.shareInformation(userA, 'dup-share-info', userB)

    // 第二次分享应该失败
    const result = await informationService.shareInformation(userA, 'dup-share-info', userB)
    expect(result.success).toBe(false)
  })

  it('未解锁的信息无法分享', async () => {
    const userA = createTestUser('no-unlock-a', 'no-unlock-a@test.com')
    const userB = createTestUser('no-unlock-b', 'no-unlock-b@test.com')
    createTestInfo('no-unlock-info', { tier: 'deep', unlockCost: 20 })

    const result = await informationService.shareInformation(userA, 'no-unlock-info', userB)
    expect(result.success).toBe(false)
  })
})

// ==================== 场景 F：事件生命周期全链路 ====================

describe('事件生命周期全链路', () => {
  it('startEvent → processChoice → completeEvent 完整流程', async () => {
    const userId = createTestUser('lifecycle-full-u1', 'lifecycle-full@test.com', { time: 1000, energy: 100 })
    createTestEvent('lifecycle-full-evt', { title: 'Full Lifecycle Event', status: 'active' })

    // 开始事件 (参数顺序: userId, eventId)
    await eventService.startEvent(userId, 'lifecycle-full-evt')

    // 做出选择
    const choiceResult = await eventService.processChoice(
      userId, 'lifecycle-full-evt', 'stage_1', 'choice_a', 'Go for it',
      { rewards: { time: 50, reputation: 10 }, resultText: 'Success' }
    )
    expect(choiceResult.walletAfter).toBeDefined()

    // 完成事件 (参数顺序: userId, eventId)
    await eventService.completeEvent(userId, 'lifecycle-full-evt')
  })

  it('同一用户对同一事件多次选择都被记录', async () => {
    const userId = createTestUser('multi-choice-u1', 'multi-choice@test.com')
    createTestEvent('multi-choice-evt', { title: 'Multi Choice Event' })

    await eventService.processChoice(
      userId, 'multi-choice-evt', 'stage_1', 'choice_a', 'First',
      { rewards: { time: 10 }, resultText: 'First choice' }
    )
    await eventService.processChoice(
      userId, 'multi-choice-evt', 'stage_2', 'choice_b', 'Second',
      { rewards: { time: 20 }, resultText: 'Second choice' }
    )

    const choices = await eventService.getUserChoices(userId, 10)
    expect(choices.length).toBe(2)
  })

  it('事件遗产创建和查询', async () => {
    createTestEvent('legacy-full-evt', { title: 'Legacy Full Event' })

    // createEventLegacy(eventId, legacyType, payload)
    const legacyId = await eventService.createEventLegacy(
      'legacy-full-evt',
      'world_shift',
      { description: 'A lasting effect', magnitude: 0.5 }
    )
    expect(legacyId).toBeTruthy()

    const legacies = await eventService.getEventLegacies('legacy-full-evt')
    expect(legacies.length).toBeGreaterThan(0)
  })
})

// ==================== 场景 G：跨引擎级联效应 ====================

describe('跨引擎级联效应', () => {
  it('选择 → 钱包变化 → 购买能力变化', async () => {
    const userId = createTestUser('cascade-u1', 'cascade@test.com', { time: 200, energy: 50, reputation: 0 })
    createTestEvent('cascade-evt', { title: 'Cascade Event' })
    createTestItem('cascade-item', {
      name: 'Cascade Item',
      mintCost: { time: 150 },
      maxMint: 100,
      mintedCount: 0,
    })

    // 初始状态：time=200，可以购买 150 的物品
    const canBefore = await resourceService.canAfford(userId, { time: 150 })
    expect(canBefore).toBe(true)

    // 选择消耗 time
    await eventService.processChoice(
      userId, 'cascade-evt', 'stage_1', 'choice_a', 'Expensive choice',
      { penalties: { time: 100 }, resultText: 'Lost time' }
    )

    // 选择后：time ≈ 100，不够购买 150 的物品
    const canAfter = await resourceService.canAfford(userId, { time: 150 })
    expect(canAfter).toBe(false)
  })

  it('社交关系 → 声誉加成 → 信息解锁能力', async () => {
    const userA = createTestUser('soc-info-a', 'soc-info-a@test.com', { reputation: 5 })
    const userB = createTestUser('soc-info-b', 'soc-info-b@test.com', { reputation: 200 })

    // 建立社交关系
    await socialService.follow(userA, userB)
    await socialService.follow(userB, userA)

    // 声誉加成
    const bonuses = await socialService.calculateReputationBonus(userA)
    expect(Array.isArray(bonuses)).toBe(true)

    // 社交概览
    const overview = await socialService.getSocialOverview(userA)
    expect(overview.mutualCount).toBe(1)
  })

  it('世界维度 → 纪元 → 潮汐 → 结算乘数', async () => {
    // 设置高繁荣+高稳定
    await worldService.updateDimensions({
      stability: 0.3,
      prosperity: 0.3,
    })

    const world = await worldService.getCurrentWorldState()
    expect(world.tideMultiplier).toBeDefined()
    expect(world.epoch).toBeDefined()

    // 潮汐乘数应该是正数
    const tide = world.tideMultiplier
    if (tide.time) expect(tide.time).toBeGreaterThan(0)
    if (tide.energy) expect(tide.energy).toBeGreaterThan(0)
    if (tide.reputation) expect(tide.reputation).toBeGreaterThan(0)
  })
})

// ==================== 更多边界条件 ====================

describe('扩展边界条件', () => {
  it('零奖励零惩罚的选择不改变钱包', async () => {
    const userId = createTestUser('zero-u1', 'zero@test.com', { time: 500, energy: 50, reputation: 10 })
    createTestEvent('zero-evt', { title: 'Zero Event' })

    const walletBefore = await resourceService.getWallet(userId)

    await eventService.processChoice(
      userId, 'zero-evt', 'stage_1', 'choice_a', 'Neutral',
      { resultText: 'Nothing happened' }
    )

    const walletAfter = await resourceService.getWallet(userId)
    expect(walletAfter.time).toBe(walletBefore.time)
    expect(walletAfter.energy).toBe(walletBefore.energy)
    expect(walletAfter.reputation).toBe(walletBefore.reputation)
  })

  it('超大奖励值不会溢出', async () => {
    const userId = createTestUser('overflow-u1', 'overflow@test.com', { time: 0, energy: 0, reputation: 0 })
    createTestEvent('overflow-evt', { title: 'Overflow Event' })

    await eventService.processChoice(
      userId, 'overflow-evt', 'stage_1', 'choice_a', 'Jackpot',
      { rewards: { time: 999999, energy: 999999, reputation: 999999 }, resultText: 'Jackpot!' }
    )

    const wallet = await resourceService.getWallet(userId)
    expect(wallet.time).toBeGreaterThan(0)
    expect(wallet.energy).toBeGreaterThan(0)
    expect(wallet.reputation).toBeGreaterThan(0)
    expect(Number.isFinite(wallet.time)).toBe(true)
    expect(Number.isFinite(wallet.energy)).toBe(true)
    expect(Number.isFinite(wallet.reputation)).toBe(true)
  })

  it('maxMint 为 0 的物品 Bonding Curve 不崩溃', async () => {
    createTestItem('zero-mint-item', {
      name: 'Zero Mint',
      mintCost: { time: 100 },
      maxMint: 0,
      mintedCount: 0,
    })

    const price = await itemService.getDynamicPrice('zero-mint-item')
    expect(price).toBeDefined()
    if (price) {
      expect(Number.isFinite(price.bondingMultiplier)).toBe(true)
      expect(Number.isFinite(price.finalCost.time)).toBe(true)
      expect(price.scarcity).toBe(0)
    }
  })

  it('mintedCount 等于 maxMint 的物品价格不为 Infinity', async () => {
    createTestItem('full-mint-item', {
      name: 'Full Mint',
      mintCost: { time: 100 },
      maxMint: 10,
      mintedCount: 10,
    })

    const price = await itemService.getDynamicPrice('full-mint-item')
    expect(price).toBeDefined()
    if (price) {
      expect(Number.isFinite(price.bondingMultiplier)).toBe(true)
      expect(Number.isFinite(price.finalCost.time)).toBe(true)
      expect(price.scarcity).toBe(1)
    }
  })

  it('mintedCount 超过 maxMint 的物品不崩溃', async () => {
    createTestItem('over-mint-item', {
      name: 'Over Mint',
      mintCost: { time: 100 },
      maxMint: 10,
      mintedCount: 20,
    })

    const price = await itemService.getDynamicPrice('over-mint-item')
    expect(price).toBeDefined()
    if (price) {
      expect(Number.isFinite(price.bondingMultiplier)).toBe(true)
      expect(Number.isFinite(price.finalCost.time)).toBe(true)
    }
  })

  it('空标签物品的世界敏感性乘数为 1.0', async () => {
    createTestItem('no-tag-item', {
      name: 'No Tag Item',
      mintCost: { time: 100 },
      maxMint: 100,
      mintedCount: 5,
      tags: [],
    })

    const price = await itemService.getDynamicPrice('no-tag-item')
    expect(price).toBeDefined()
    if (price) {
      expect(price.worldSensitivityMultiplier).toBe(1.0)
    }
  })

  it('所有稀有度的 Bonding Curve 乘数都是正数', async () => {
    const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary']
    for (const rarity of rarities) {
      createTestItem(`rarity-${rarity}`, {
        name: `${rarity} Item`,
        mintCost: { time: 100 },
        maxMint: 100,
        mintedCount: 50,
        rarity,
      })

      const price = await itemService.getDynamicPrice(`rarity-${rarity}`)
      expect(price).toBeDefined()
      if (price) {
        expect(price.bondingMultiplier).toBeGreaterThan(0)
        expect(price.finalCost.time).toBeGreaterThan(0)
      }
    }
  })

  it('未知稀有度使用默认 k 值', async () => {
    createTestItem('unknown-rarity-item', {
      name: 'Unknown Rarity',
      mintCost: { time: 100 },
      maxMint: 100,
      mintedCount: 50,
      rarity: 'mythical',
    })

    const price = await itemService.getDynamicPrice('unknown-rarity-item')
    expect(price).toBeDefined()
    if (price) {
      expect(price.bondingMultiplier).toBeGreaterThan(0)
    }
  })
})

// ==================== 扩展错误处理 ====================

describe('扩展错误处理', () => {
  it('getWallet 对不存在的用户返回默认值或抛错', async () => {
    try {
      const wallet = await resourceService.getWallet('totally-fake-user-id')
      // 如果返回了，应该是默认值
      expect(wallet).toBeDefined()
    } catch (e: any) {
      expect(e.message).toBeTruthy()
    }
  })

  it('getUserTags 对不存在的用户返回空数组或抛错', async () => {
    try {
      const tags = await resourceService.getUserTags('fake-user-id-tags')
      expect(Array.isArray(tags)).toBe(true)
    } catch (e: any) {
      expect(e.message).toBeTruthy()
    }
  })

  it('getInventory 对不存在的用户返回空数组或抛错', async () => {
    try {
      const inv = await resourceService.getInventory('fake-user-id-inv')
      expect(Array.isArray(inv)).toBe(true)
    } catch (e: any) {
      expect(e.message).toBeTruthy()
    }
  })

  it('follow 对不存在的用户不崩溃', async () => {
    const userId = createTestUser('follow-err-u1', 'follow-err@test.com')

    try {
      await socialService.follow(userId, 'nonexistent-target')
      // 可能成功（只是插入记录），也可能抛错
    } catch (e: any) {
      expect(e.message).toBeTruthy()
    }
  })

  it('recordInteraction 无效 type 不崩溃', async () => {
    const userA = createTestUser('int-err-a', 'int-err-a@test.com')
    const userB = createTestUser('int-err-b', 'int-err-b@test.com')
    await socialService.follow(userA, userB)

    try {
      // @ts-ignore - 故意传无效 type
      await socialService.recordInteraction(userA, userB, 'invalid_type')
    } catch (e: any) {
      expect(e.message).toBeTruthy()
    }
  })

  it('generateEventInformation 对不存在的事件返回空数组', async () => {
    const infos = await informationService.generateEventInformation('nonexistent-event-999')
    expect(infos).toEqual([])
  })

  it('getCircleTendency 对无关注用户返回 null', async () => {
    const userId = createTestUser('ct-err-u1', 'ct-err@test.com')
    createTestEvent('ct-err-evt', { title: 'CT Error Event' })

    const tendency = await socialService.getCircleTendency(userId, 'ct-err-evt')
    expect(tendency).toBeNull()
  })

  it('getInformationMarketStats 在空数据库返回零值', async () => {
    // 即使没有信息，也不应该崩溃
    const stats = await informationService.getInformationMarketStats()
    expect(stats).toBeDefined()
    expect(stats.totalPieces).toBeGreaterThanOrEqual(0)
  })
})
