/**
 * social.service 单元测试
 * 覆盖：关注/取关、信任值管理、声誉传播、社交分红、行为传染、社交概览
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { createTestUser, createTestEvent, createTestRelation } from '../setup.js'

let socialService: typeof import('../../src/services/social.service.js')

beforeEach(async () => {
  socialService = await import('../../src/services/social.service.js')
})

// ==================== 关注 / 取消关注 ====================

describe('Follow / Unfollow', () => {
  it('follow: 建立关注关系', async () => {
    createTestUser('u-a', 'a@test.com')
    createTestUser('u-b', 'b@test.com')

    const rel = await socialService.socialService.follow('u-a', 'u-b')
    expect(rel).toBeDefined()
    expect(rel.fromUserId).toBe('u-a')
    expect(rel.toUserId).toBe('u-b')
    expect(rel.trustValue).toBe(0.1) // 初始信任值
  })

  it('follow: 不能关注自己', async () => {
    createTestUser('u-self', 'self@test.com')
    await expect(socialService.socialService.follow('u-self', 'u-self'))
      .rejects.toThrow('不能关注自己')
  })

  it('follow: 重复关注返回已有关系', async () => {
    createTestUser('u-c', 'c@test.com')
    createTestUser('u-d', 'd@test.com')

    const rel1 = await socialService.socialService.follow('u-c', 'u-d')
    const rel2 = await socialService.socialService.follow('u-c', 'u-d')
    expect(rel2.trustValue).toBe(rel1.trustValue)
  })

  it('unfollow: 取消关注', async () => {
    createTestUser('u-e', 'e@test.com')
    createTestUser('u-f', 'f@test.com')

    await socialService.socialService.follow('u-e', 'u-f')
    await socialService.socialService.unfollow('u-e', 'u-f')

    const following = await socialService.socialService.getFollowing('u-e')
    expect(following.length).toBe(0)
  })

  it('unfollow: 取消不存在的关注不报错', async () => {
    await expect(socialService.socialService.unfollow('nonexist-1', 'nonexist-2'))
      .resolves.not.toThrow()
  })
})

// ==================== 信任值管理 ====================

describe('Trust Management', () => {
  it('recordInteraction positive: 增加信任值', async () => {
    createTestUser('t-a', 'ta@test.com')
    createTestUser('t-b', 'tb@test.com')

    await socialService.socialService.follow('t-a', 't-b')
    const result = await socialService.socialService.recordInteraction('t-a', 't-b', 'positive')

    expect(result.trustBefore).toBe(0.1)
    expect(result.trustAfter).toBeGreaterThan(result.trustBefore)
    expect(result.trustAfter).toBeCloseTo(0.15, 2) // 0.1 + 0.05
  })

  it('recordInteraction negative: 减少信任值', async () => {
    createTestUser('t-c', 'tc@test.com')
    createTestUser('t-d', 'td@test.com')

    await socialService.socialService.follow('t-c', 't-d')
    // 先增加几次
    await socialService.socialService.recordInteraction('t-c', 't-d', 'positive')
    await socialService.socialService.recordInteraction('t-c', 't-d', 'positive')
    const result = await socialService.socialService.recordInteraction('t-c', 't-d', 'negative')

    expect(result.trustAfter).toBeLessThan(result.trustBefore)
  })

  it('recordInteraction betrayal: 大幅降低信任值', async () => {
    createTestUser('t-e', 'te@test.com')
    createTestUser('t-f', 'tf@test.com')

    await socialService.socialService.follow('t-e', 't-f')
    // 先建立一些信任
    for (let i = 0; i < 5; i++) {
      await socialService.socialService.recordInteraction('t-e', 't-f', 'positive')
    }
    const result = await socialService.socialService.recordInteraction('t-e', 't-f', 'betrayal')

    expect(result.trustAfter).toBeLessThan(result.trustBefore)
    expect(result.trustBefore - result.trustAfter).toBeGreaterThanOrEqual(0.3) // 背叛扣至少 0.5（但不低于0）
  })

  it('recordInteraction: 信任值不超过 1.0', async () => {
    createTestUser('t-g', 'tg@test.com')
    createTestUser('t-h', 'th@test.com')

    await socialService.socialService.follow('t-g', 't-h')
    // 大量正向互动
    for (let i = 0; i < 30; i++) {
      await socialService.socialService.recordInteraction('t-g', 't-h', 'positive')
    }
    const following = await socialService.socialService.getFollowing('t-g')
    expect(following[0].trustValue).toBeLessThanOrEqual(1.0)
  })

  it('recordInteraction: 信任值不低于 0.0', async () => {
    createTestUser('t-i', 'ti@test.com')
    createTestUser('t-j', 'tj@test.com')

    await socialService.socialService.follow('t-i', 't-j')
    await socialService.socialService.recordInteraction('t-i', 't-j', 'betrayal')
    await socialService.socialService.recordInteraction('t-i', 't-j', 'betrayal')

    const following = await socialService.socialService.getFollowing('t-i')
    expect(following[0].trustValue).toBeGreaterThanOrEqual(0.0)
  })

  it('recordInteraction: 未关注时抛出错误', async () => {
    createTestUser('t-k', 'tk@test.com')
    createTestUser('t-l', 'tl@test.com')

    await expect(socialService.socialService.recordInteraction('t-k', 't-l', 'positive'))
      .rejects.toThrow('尚未关注该用户')
  })
})

// ==================== 社交查询 ====================

describe('Social Queries', () => {
  it('getFollowing: 返回关注列表', async () => {
    createTestUser('q-a', 'qa@test.com')
    createTestUser('q-b', 'qb@test.com')
    createTestUser('q-c', 'qc@test.com')

    await socialService.socialService.follow('q-a', 'q-b')
    await socialService.socialService.follow('q-a', 'q-c')

    const following = await socialService.socialService.getFollowing('q-a')
    expect(following.length).toBe(2)
  })

  it('getFollowers: 返回粉丝列表', async () => {
    createTestUser('q-d', 'qd@test.com')
    createTestUser('q-e', 'qe@test.com')
    createTestUser('q-f', 'qf@test.com')

    await socialService.socialService.follow('q-e', 'q-d')
    await socialService.socialService.follow('q-f', 'q-d')

    const followers = await socialService.socialService.getFollowers('q-d')
    expect(followers.length).toBe(2)
  })

  it('getMutualFriends: 返回互相关注', async () => {
    createTestUser('m-a', 'ma@test.com')
    createTestUser('m-b', 'mb@test.com')
    createTestUser('m-c', 'mc@test.com')

    // a <-> b 互关
    await socialService.socialService.follow('m-a', 'm-b')
    await socialService.socialService.follow('m-b', 'm-a')
    // a -> c 单向
    await socialService.socialService.follow('m-a', 'm-c')

    const mutuals = await socialService.socialService.getMutualFriends('m-a')
    expect(mutuals.length).toBe(1)
    expect(mutuals[0].userId).toBe('m-b')
  })

  it('getMutualFriends: 无互关返回空', async () => {
    createTestUser('m-d', 'md@test.com')
    createTestUser('m-e', 'me@test.com')

    await socialService.socialService.follow('m-d', 'm-e')

    const mutuals = await socialService.socialService.getMutualFriends('m-d')
    expect(mutuals.length).toBe(0)
  })
})

// ==================== 声誉传播 ====================

describe('Reputation Propagation', () => {
  it('calculateReputationBonus: 无关注时返回空', async () => {
    createTestUser('rp-a', 'rpa@test.com')
    const bonuses = await socialService.socialService.calculateReputationBonus('rp-a')
    expect(bonuses).toEqual([])
  })

  it('calculateReputationBonus: 关注有标签的人获得加成', async () => {
    createTestUser('rp-b', 'rpb@test.com')
    createTestUser('rp-c', 'rpc@test.com', {
      tags: JSON.stringify([{ id: 'social', weight: 5.0 }, { id: 'tech', weight: 3.0 }]),
    })

    await socialService.socialService.follow('rp-b', 'rp-c')
    // 增加信任值
    for (let i = 0; i < 10; i++) {
      await socialService.socialService.recordInteraction('rp-b', 'rp-c', 'positive')
    }

    const bonuses = await socialService.socialService.calculateReputationBonus('rp-b')
    expect(bonuses.length).toBeGreaterThan(0)
    // 加成应该是正数
    for (const b of bonuses) {
      expect(b.bonus).toBeGreaterThan(0)
    }
  })
})

// ==================== 社交分红 ====================

describe('Social Dividend', () => {
  it('distributeSocialDividend: 给粉丝发放分红', async () => {
    createTestUser('sd-star', 'sdstar@test.com', { time: 1000, energy: 100, reputation: 50 })
    createTestUser('sd-fan1', 'sdfan1@test.com', { time: 500, energy: 50, reputation: 10 })
    createTestUser('sd-fan2', 'sdfan2@test.com', { time: 500, energy: 50, reputation: 10 })

    // 粉丝关注明星
    await socialService.socialService.follow('sd-fan1', 'sd-star')
    await socialService.socialService.follow('sd-fan2', 'sd-star')

    // 增加信任值使分红有意义
    for (let i = 0; i < 15; i++) {
      await socialService.socialService.recordInteraction('sd-fan1', 'sd-star', 'positive')
      await socialService.socialService.recordInteraction('sd-fan2', 'sd-star', 'positive')
    }

    const dividends = await socialService.socialService.distributeSocialDividend(
      'sd-star', 'Star Player', 'achievement',
      { time: 100, energy: 50, reputation: 30 },
      'Completed a major quest',
    )

    expect(dividends.length).toBeGreaterThan(0)
    for (const d of dividends) {
      expect(d.fromUserId).toBe('sd-star')
      expect(d.type).toBe('achievement')
      // 分红应该是小额的
      expect(d.amount.time).toBeGreaterThanOrEqual(0)
      expect(d.amount.time).toBeLessThan(100) // 不超过原始奖励
    }
  })

  it('distributeSocialDividend: 无粉丝时返回空', async () => {
    createTestUser('sd-lonely', 'sdlonely@test.com')

    const dividends = await socialService.socialService.distributeSocialDividend(
      'sd-lonely', 'Lonely Player', 'choice',
      { time: 50, energy: 20, reputation: 10 },
      'Made a choice',
    )

    expect(dividends).toEqual([])
  })
})

// ==================== 社交概览 ====================

describe('Social Overview', () => {
  it('getSocialOverview: 返回完整概览', async () => {
    createTestUser('ov-a', 'ova@test.com')
    createTestUser('ov-b', 'ovb@test.com')
    createTestUser('ov-c', 'ovc@test.com')

    await socialService.socialService.follow('ov-a', 'ov-b')
    await socialService.socialService.follow('ov-a', 'ov-c')
    await socialService.socialService.follow('ov-b', 'ov-a') // 互关

    const overview = await socialService.socialService.getSocialOverview('ov-a')

    expect(overview.followingCount).toBe(2)
    expect(overview.followerCount).toBe(1)
    expect(overview.mutualCount).toBe(1)
    expect(overview.avgTrustGiven).toBeGreaterThan(0)
    expect(overview.avgTrustReceived).toBeGreaterThan(0)
    expect(overview.topFollowing).toBeDefined()
    expect(Array.isArray(overview.reputationBonuses)).toBe(true)
  })

  it('getSocialOverview: 无社交关系', async () => {
    createTestUser('ov-d', 'ovd@test.com')

    const overview = await socialService.socialService.getSocialOverview('ov-d')

    expect(overview.followingCount).toBe(0)
    expect(overview.followerCount).toBe(0)
    expect(overview.mutualCount).toBe(0)
    expect(overview.avgTrustGiven).toBe(0)
    expect(overview.avgTrustReceived).toBe(0)
  })
})

// ==================== 信任衰减 ====================

describe('Trust Decay', () => {
  it('applyTrustDecay: 衰减长时间未互动的关系', async () => {
    createTestUser('dc-a', 'dca@test.com')
    createTestUser('dc-b', 'dcb@test.com')

    // 手动创建一个"很久以前"的关系
    createTestRelation('dc-a', 'dc-b', {
      trustValue: 0.5,
      interactionCount: 10,
    })

    // 修改 lastInteractionAt 为 10 天前
    const { getTestSqlite } = await import('../setup.js')
    const sqlite = getTestSqlite()
    const tenDaysAgo = Date.now() - 10 * 24 * 60 * 60 * 1000
    sqlite.exec(`UPDATE ll_social_relations SET last_interaction_at = ${tenDaysAgo} WHERE from_user_id = 'dc-a' AND to_user_id = 'dc-b'`)

    const result = await socialService.socialService.applyTrustDecay()
    expect(result.decayedCount).toBeGreaterThanOrEqual(1)

    // 验证信任值确实降低了
    const following = await socialService.socialService.getFollowing('dc-a')
    expect(following[0].trustValue).toBeLessThan(0.5)
  })
})
