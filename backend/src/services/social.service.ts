/**
 * LifeLine V4 — 社交引擎 (Social Engine)
 * 
 * 核心概念：
 * 1. 信任网络 (Trust Network)：玩家之间的信任值，建立慢、破坏快
 * 2. 声誉传播 (Reputation Propagation)：近朱者赤，社交圈影响标签权重
 * 3. 社交分红 (Social Dividend)：关注的人的成就给你微量回报
 * 4. 行为传染 (Behavioral Contagion)：圈子的选择倾向作为信息
 */

import { eq, and, or, desc, sql } from 'drizzle-orm'
import { db, schema } from '../db/index.js'

// ==================== 类型定义 ====================

export interface SocialRelation {
  fromUserId: string
  toUserId: string
  trustValue: number       // 0~1, 信任值
  interactionCount: number // 互动次数
  lastInteractionAt: number
  createdAt: number
}

export interface ReputationBonus {
  tagId: string
  bonus: number            // 来自社交圈的加成
  source: string           // 来源说明
}

export interface SocialDividend {
  fromUserId: string
  fromNickname: string
  type: 'achievement' | 'choice' | 'milestone'
  amount: { time: number; energy: number; reputation: number }
  description: string
  timestamp: number
}

export interface CircleTendency {
  eventId: string
  choiceDistribution: Record<string, { count: number; percentage: number }>
  sampleSize: number
  message: string
}

// ==================== 信任值常量 ====================

const TRUST_CONFIG = {
  /** 初始信任值（关注时） */
  initialTrust: 0.1,
  /** 每次正向互动增加的信任值 */
  positiveInteractionDelta: 0.05,
  /** 每次负向互动（背叛）减少的信任值 */
  betrayalDelta: -0.5,
  /** 信任值自然衰减率（每天） */
  dailyDecay: 0.002,
  /** 最大信任值 */
  maxTrust: 1.0,
  /** 最小信任值 */
  minTrust: 0.0,
  /** 解锁合作事件的信任阈值 */
  cooperationThreshold: 0.6,
  /** 声誉传播系数：社交圈对标签权重的影响比例 */
  reputationPropagationFactor: 0.15,
  /** 社交分红系数：关注者获得的收益比例 */
  dividendFactor: 0.03,
}

// ==================== 社交引擎 ====================

export class SocialService {

  // ---------- 关注 / 取消关注 ----------

  /**
   * 建立关注关系（单向）
   */
  async follow(fromUserId: string, toUserId: string): Promise<SocialRelation> {
    if (fromUserId === toUserId) throw new Error('不能关注自己')

    // 检查是否已关注
    const existing = await db.select()
      .from(schema.llSocialRelations)
      .where(and(
        eq(schema.llSocialRelations.fromUserId, fromUserId),
        eq(schema.llSocialRelations.toUserId, toUserId),
      ))
      .limit(1)

    if (existing.length > 0) {
      return this.rowToRelation(existing[0])
    }

    const now = Date.now()
    const row = {
      fromUserId,
      toUserId,
      trustValue: TRUST_CONFIG.initialTrust,
      interactionCount: 0,
      lastInteractionAt: now,
      createdAt: now,
    }

    await db.insert(schema.llSocialRelations).values(row)
    return row
  }

  /**
   * 取消关注
   */
  async unfollow(fromUserId: string, toUserId: string): Promise<void> {
    await db.delete(schema.llSocialRelations)
      .where(and(
        eq(schema.llSocialRelations.fromUserId, fromUserId),
        eq(schema.llSocialRelations.toUserId, toUserId),
      ))
  }

  // ---------- 信任值管理 ----------

  /**
   * 记录一次互动，更新信任值
   */
  async recordInteraction(
    fromUserId: string,
    toUserId: string,
    type: 'positive' | 'negative' | 'betrayal',
  ): Promise<{ trustBefore: number; trustAfter: number }> {
    const relations = await db.select()
      .from(schema.llSocialRelations)
      .where(and(
        eq(schema.llSocialRelations.fromUserId, fromUserId),
        eq(schema.llSocialRelations.toUserId, toUserId),
      ))
      .limit(1)

    if (relations.length === 0) {
      throw new Error('尚未关注该用户')
    }

    const rel = relations[0]
    const trustBefore = rel.trustValue
    let delta = 0

    switch (type) {
      case 'positive':
        delta = TRUST_CONFIG.positiveInteractionDelta
        break
      case 'negative':
        delta = -TRUST_CONFIG.positiveInteractionDelta * 2 // 负面影响是正面的2倍
        break
      case 'betrayal':
        delta = TRUST_CONFIG.betrayalDelta // 背叛直接扣一半
        break
    }

    const trustAfter = Math.max(
      TRUST_CONFIG.minTrust,
      Math.min(TRUST_CONFIG.maxTrust, trustBefore + delta),
    )

    await db.update(schema.llSocialRelations)
      .set({
        trustValue: trustAfter,
        interactionCount: rel.interactionCount + 1,
        lastInteractionAt: Date.now(),
      })
      .where(and(
        eq(schema.llSocialRelations.fromUserId, fromUserId),
        eq(schema.llSocialRelations.toUserId, toUserId),
      ))

    return { trustBefore, trustAfter }
  }

  /**
   * 信任值自然衰减（由 World Tick 调用）
   */
  async applyTrustDecay(): Promise<{ decayedCount: number }> {
    const allRelations = await db.select().from(schema.llSocialRelations)
    let decayedCount = 0

    for (const rel of allRelations) {
      const daysSinceInteraction = (Date.now() - rel.lastInteractionAt) / (1000 * 60 * 60 * 24)
      if (daysSinceInteraction > 1) {
        const decay = TRUST_CONFIG.dailyDecay * daysSinceInteraction
        const newTrust = Math.max(TRUST_CONFIG.minTrust, rel.trustValue - decay)
        if (newTrust !== rel.trustValue) {
          await db.update(schema.llSocialRelations)
            .set({ trustValue: newTrust })
            .where(and(
              eq(schema.llSocialRelations.fromUserId, rel.fromUserId),
              eq(schema.llSocialRelations.toUserId, rel.toUserId),
            ))
          decayedCount++
        }
      }
    }

    return { decayedCount }
  }

  // ---------- 社交查询 ----------

  /**
   * 获取用户的关注列表
   */
  async getFollowing(userId: string): Promise<SocialRelation[]> {
    const rows = await db.select()
      .from(schema.llSocialRelations)
      .where(eq(schema.llSocialRelations.fromUserId, userId))
      .orderBy(desc(schema.llSocialRelations.trustValue))

    return rows.map(r => this.rowToRelation(r))
  }

  /**
   * 获取用户的粉丝列表
   */
  async getFollowers(userId: string): Promise<SocialRelation[]> {
    const rows = await db.select()
      .from(schema.llSocialRelations)
      .where(eq(schema.llSocialRelations.toUserId, userId))
      .orderBy(desc(schema.llSocialRelations.trustValue))

    return rows.map(r => this.rowToRelation(r))
  }

  /**
   * 获取互相关注（好友）
   */
  async getMutualFriends(userId: string): Promise<Array<{ userId: string; trustValue: number }>> {
    const following = await this.getFollowing(userId)
    const followers = await this.getFollowers(userId)

    const followerSet = new Set(followers.map(f => f.fromUserId))
    return following
      .filter(f => followerSet.has(f.toUserId))
      .map(f => ({ userId: f.toUserId, trustValue: f.trustValue }))
  }

  // ---------- 声誉传播 ----------

  /**
   * 计算社交圈对用户标签权重的加成
   * "近朱者赤"：关注的人的标签权重会微量影响你的标签权重
   */
  async calculateReputationBonus(userId: string): Promise<ReputationBonus[]> {
    const following = await this.getFollowing(userId)
    if (following.length === 0) return []

    // 收集所有关注者的标签
    const tagBonusMap = new Map<string, { totalWeight: number; count: number; sources: string[] }>()

    for (const rel of following) {
      const users = await db.select()
        .from(schema.llUsers)
        .where(eq(schema.llUsers.id, rel.toUserId))
        .limit(1)

      if (users.length === 0) continue

      const userTags: Array<{ id: string; weight: number }> = JSON.parse(users[0].tags || '[]')

      for (const tag of userTags) {
        if (!tagBonusMap.has(tag.id)) {
          tagBonusMap.set(tag.id, { totalWeight: 0, count: 0, sources: [] })
        }
        const entry = tagBonusMap.get(tag.id)!
        // 加成 = 对方标签权重 × 信任值 × 传播系数
        const contribution = tag.weight * rel.trustValue * TRUST_CONFIG.reputationPropagationFactor
        entry.totalWeight += contribution
        entry.count++
        entry.sources.push(rel.toUserId)
      }
    }

    const bonuses: ReputationBonus[] = []
    for (const [tagId, data] of tagBonusMap) {
      const avgBonus = data.totalWeight / following.length
      if (avgBonus > 0.01) { // 只返回有意义的加成
        bonuses.push({
          tagId,
          bonus: Math.round(avgBonus * 1000) / 1000,
          source: `来自 ${data.count} 位关注者的影响`,
        })
      }
    }

    return bonuses.sort((a, b) => b.bonus - a.bonus)
  }

  // ---------- 社交分红 ----------

  /**
   * 当某用户完成成就时，给其粉丝发放社交分红
   */
  async distributeSocialDividend(
    achieverUserId: string,
    achieverNickname: string,
    achievementType: 'choice' | 'achievement' | 'milestone',
    baseReward: { time: number; energy: number; reputation: number },
    description: string,
  ): Promise<SocialDividend[]> {
    const followers = await this.getFollowers(achieverUserId)
    const dividends: SocialDividend[] = []

    for (const rel of followers) {
      // 分红 = 基础奖励 × 信任值 × 分红系数
      const factor = rel.trustValue * TRUST_CONFIG.dividendFactor
      const dividend: SocialDividend = {
        fromUserId: achieverUserId,
        fromNickname: achieverNickname,
        type: achievementType,
        amount: {
          time: Math.round(baseReward.time * factor * 10) / 10,
          energy: Math.round(baseReward.energy * factor * 10) / 10,
          reputation: Math.round(baseReward.reputation * factor * 10) / 10,
        },
        description,
        timestamp: Date.now(),
      }

      // 只有有意义的分红才发放
      if (dividend.amount.time > 0 || dividend.amount.energy > 0 || dividend.amount.reputation > 0) {
        // 更新粉丝的钱包
        const followerUsers = await db.select()
          .from(schema.llUsers)
          .where(eq(schema.llUsers.id, rel.fromUserId))
          .limit(1)

        if (followerUsers.length > 0) {
          const u = followerUsers[0]
          await db.update(schema.llUsers)
            .set({
              walletTime: u.walletTime + dividend.amount.time,
              walletEnergy: u.walletEnergy + dividend.amount.energy,
              walletReputation: u.walletReputation + dividend.amount.reputation,
            })
            .where(eq(schema.llUsers.id, rel.fromUserId))
        }

        dividends.push(dividend)
      }
    }

    return dividends
  }

  // ---------- 行为传染 ----------

  /**
   * 获取用户社交圈在某事件中的选择倾向
   * 需要足够的 INS（声誉）才能看到
   */
  async getCircleTendency(
    userId: string,
    eventId: string,
  ): Promise<CircleTendency | null> {
    const following = await this.getFollowing(userId)
    if (following.length === 0) return null

    const followingIds = following.map(f => f.toUserId)

    // 查询关注者在该事件中的选择
    const choices = await db.select()
      .from(schema.llUserChoices)
      .where(eq(schema.llUserChoices.eventId, eventId))

    const circleChoices = choices.filter(c => followingIds.includes(c.userId))
    if (circleChoices.length === 0) return null

    // 统计选择分布
    const distribution: Record<string, { count: number; percentage: number }> = {}
    for (const c of circleChoices) {
      const key = c.choiceText || c.choiceId
      if (!distribution[key]) {
        distribution[key] = { count: 0, percentage: 0 }
      }
      distribution[key].count++
    }

    // 计算百分比
    for (const key of Object.keys(distribution)) {
      distribution[key].percentage = Math.round(
        (distribution[key].count / circleChoices.length) * 100,
      )
    }

    // 找出最热门的选择
    const topChoice = Object.entries(distribution)
      .sort(([, a], [, b]) => b.count - a.count)[0]

    return {
      eventId,
      choiceDistribution: distribution,
      sampleSize: circleChoices.length,
      message: `你的圈子中 ${topChoice[1].percentage}% 的人选择了「${topChoice[0]}」`,
    }
  }

  // ---------- 社交网络统计 ----------

  /**
   * 获取用户的社交网络概览
   */
  async getSocialOverview(userId: string) {
    const following = await this.getFollowing(userId)
    const followers = await this.getFollowers(userId)
    const mutuals = await this.getMutualFriends(userId)
    const reputationBonuses = await this.calculateReputationBonus(userId)

    const avgTrustGiven = following.length > 0
      ? following.reduce((sum, f) => sum + f.trustValue, 0) / following.length
      : 0

    const avgTrustReceived = followers.length > 0
      ? followers.reduce((sum, f) => sum + f.trustValue, 0) / followers.length
      : 0

    // 高信任合作者（信任值 >= 阈值的互相关注）
    const cooperationPartners = mutuals.filter(
      m => m.trustValue >= TRUST_CONFIG.cooperationThreshold,
    )

    return {
      followingCount: following.length,
      followerCount: followers.length,
      mutualCount: mutuals.length,
      cooperationPartnerCount: cooperationPartners.length,
      avgTrustGiven: Math.round(avgTrustGiven * 1000) / 1000,
      avgTrustReceived: Math.round(avgTrustReceived * 1000) / 1000,
      reputationBonuses,
      topFollowing: following.slice(0, 5).map(f => ({
        userId: f.toUserId,
        trust: f.trustValue,
        interactions: f.interactionCount,
      })),
      cooperationPartners: cooperationPartners.map(p => ({
        userId: p.userId,
        trust: p.trustValue,
      })),
    }
  }

  // ---------- 工具方法 ----------

  private rowToRelation(row: any): SocialRelation {
    return {
      fromUserId: row.fromUserId,
      toUserId: row.toUserId,
      trustValue: row.trustValue,
      interactionCount: row.interactionCount,
      lastInteractionAt: row.lastInteractionAt,
      createdAt: row.createdAt,
    }
  }
}

export const socialService = new SocialService()
