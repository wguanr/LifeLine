import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  EventResourcePool,
  UserEventInvestment,
  InvestmentRecord,
  InfluencerChoice,
  InfluencerInfo
} from '@/types'

/** 资源价值统一换算公式 */
export const costToValue = (cost: { time?: number; energy?: number; reputation?: number }): number => {
  return (cost.time ?? 0) + (cost.energy ?? 0) * 1.5 + (cost.reputation ?? 0) * 0.5
}

/** Influencer 识别阈值：投入占比 >= 2% */
const INFLUENCER_THRESHOLD = 0.02

export const useInfluencerStore = defineStore('influencer', () => {
  // ==================== 状态 ====================

  /** 事件资源池：eventId -> EventResourcePool */
  const resourcePools = ref<Record<string, EventResourcePool>>({})

  /** 当前用户关注的 Influencer 列表：userId[] */
  const followedInfluencers = ref<Set<string>>(new Set())

  // ==================== 持久化 ====================

  const saveState = () => {
    // 序列化 resourcePools
    uni.setStorageSync('choser_influencer_pools', JSON.stringify(resourcePools.value))
    uni.setStorageSync('choser_followed_influencers', JSON.stringify([...followedInfluencers.value]))
  }

  const loadState = () => {
    try {
      const pools = uni.getStorageSync('choser_influencer_pools')
      if (pools) resourcePools.value = JSON.parse(pools)
      const followed = uni.getStorageSync('choser_followed_influencers')
      if (followed) followedInfluencers.value = new Set(JSON.parse(followed))
    } catch (e) {
      // ignore
    }
  }

  loadState()

  // ==================== 资源池管理 ====================

  /** 确保事件资源池存在 */
  const ensurePool = (eventId: string): EventResourcePool => {
    if (!resourcePools.value[eventId]) {
      resourcePools.value[eventId] = {
        eventId,
        totalInvested: 0,
        participants: {}
      }
    }
    return resourcePools.value[eventId]
  }

  /** 确保用户在事件池中有记录 */
  const ensureParticipant = (
    eventId: string,
    userId: string,
    profile: { nickname: string; avatar: string; bio?: string; topTags?: Array<{ tagId: string; name: string; icon: string }> }
  ): UserEventInvestment => {
    const pool = ensurePool(eventId)
    if (!pool.participants[userId]) {
      pool.participants[userId] = {
        userId,
        nickname: profile.nickname,
        avatar: profile.avatar,
        bio: profile.bio,
        totalValue: 0,
        investments: [],
        choices: [],
        topTags: profile.topTags || []
      }
    }
    return pool.participants[userId]
  }

  /**
   * 记录用户在事件上的资源投入
   */
  const recordInvestment = (
    eventId: string,
    userId: string,
    profile: { nickname: string; avatar: string; bio?: string; topTags?: Array<{ tagId: string; name: string; icon: string }> },
    investment: InvestmentRecord
  ) => {
    const participant = ensureParticipant(eventId, userId, profile)
    participant.investments.push(investment)
    participant.totalValue += investment.value

    const pool = ensurePool(eventId)
    pool.totalInvested += investment.value

    saveState()
  }

  /**
   * 记录用户在事件中的选择
   */
  const recordParticipantChoice = (
    eventId: string,
    userId: string,
    profile: { nickname: string; avatar: string; bio?: string; topTags?: Array<{ tagId: string; name: string; icon: string }> },
    choice: InfluencerChoice
  ) => {
    const participant = ensureParticipant(eventId, userId, profile)
    participant.choices.push(choice)
    participant.currentStageId = choice.stageId

    saveState()
  }

  /**
   * 批量注入虚拟用户数据（用于模拟多用户场景）
   */
  const injectSimulatedData = (eventId: string, simUsers: Array<{
    userId: string
    nickname: string
    avatar: string
    bio?: string
    topTags: Array<{ tagId: string; name: string; icon: string }>
    investments: InvestmentRecord[]
    choices: InfluencerChoice[]
  }>) => {
    const pool = ensurePool(eventId)

    for (const sim of simUsers) {
      const totalValue = sim.investments.reduce((sum, inv) => sum + inv.value, 0)
      // 如果该用户已存在，先减去旧值避免重复累加
      const oldValue = pool.participants[sim.userId]?.totalValue || 0
      pool.totalInvested -= oldValue
      
      pool.participants[sim.userId] = {
        userId: sim.userId,
        nickname: sim.nickname,
        avatar: sim.avatar,
        bio: sim.bio,
        totalValue,
        investments: sim.investments,
        choices: sim.choices,
        topTags: sim.topTags,
        currentStageId: sim.choices.length > 0 ? sim.choices[sim.choices.length - 1].stageId : undefined
      }
      pool.totalInvested += totalValue
    }

    saveState()
  }

  // ==================== Influencer 识别 ====================

  /**
   * 获取某事件的所有 Influencer
   * 条件：投入占比 >= 2%
   */
  const getEventInfluencers = (eventId: string): InfluencerInfo[] => {
    const pool = resourcePools.value[eventId]
    if (!pool || pool.totalInvested === 0) return []

    const influencers: InfluencerInfo[] = []

    for (const [userId, participant] of Object.entries(pool.participants)) {
      const percent = participant.totalValue / pool.totalInvested
      if (percent >= INFLUENCER_THRESHOLD) {
        // 生成选择主张摘要
        const stance = generateStance(participant)

        influencers.push({
          userId,
          nickname: participant.nickname,
          avatar: participant.avatar,
          bio: participant.bio,
          investmentPercent: percent,
          totalInvested: participant.totalValue,
          topTags: participant.topTags,
          stance,
          choices: participant.choices,
          latestChoice: participant.choices.length > 0 ? participant.choices[participant.choices.length - 1] : undefined,
          followCount: 0 // 后续可扩展
        })
      }
    }

    // 按投入占比降序排列
    return influencers.sort((a, b) => b.investmentPercent - a.investmentPercent)
  }

  /**
   * 获取某事件中、当前阶段之前已做出选择的 Influencer
   * 用于在新阶段开始时向用户推荐
   */
  const getStageInfluencers = (eventId: string, currentStageId: string, excludeUserId?: string): InfluencerInfo[] => {
    const all = getEventInfluencers(eventId)
    return all.filter(inf => {
      // 排除当前用户自己
      if (excludeUserId && inf.userId === excludeUserId) return false
      // 只显示已经在当前阶段或之后做出选择的 Influencer
      // （即他们已经走到了当前阶段或更远）
      return inf.choices.length > 0
    })
  }

  /**
   * 生成用户的选择主张摘要
   */
  const generateStance = (participant: UserEventInvestment): string => {
    if (participant.choices.length === 0) return '尚未做出选择'

    const latestChoices = participant.choices.slice(-3)
    const stanceTexts = latestChoices.map(c => `"${c.choiceText}"`)

    if (latestChoices.length === 1) {
      return `主张：${stanceTexts[0]}`
    }
    return `最近主张：${stanceTexts.join(' → ')}`
  }

  // ==================== 关注系统 ====================

  const followInfluencer = (userId: string, _nickname?: string, _avatar?: string) => {
    followedInfluencers.value.add(userId)
    saveState()
  }

  const unfollowInfluencer = (userId: string) => {
    followedInfluencers.value.delete(userId)
    saveState()
  }

  const isFollowing = (userId: string): boolean => {
    return followedInfluencers.value.has(userId)
  }

  /** 获取已关注的 Influencer 在某事件中的最新选择 */
  const getFollowedInfluencerChoices = (eventId: string): Array<{
    influencer: InfluencerInfo
    latestChoice: InfluencerChoice
  }> => {
    const pool = resourcePools.value[eventId]
    if (!pool) return []

    const result: Array<{ influencer: InfluencerInfo; latestChoice: InfluencerChoice }> = []

    for (const userId of followedInfluencers.value) {
      const participant = pool.participants[userId]
      if (!participant || participant.choices.length === 0) continue

      const percent = pool.totalInvested > 0 ? participant.totalValue / pool.totalInvested : 0
      const latestChoice = participant.choices[participant.choices.length - 1]

      result.push({
        influencer: {
          userId,
          nickname: participant.nickname,
          avatar: participant.avatar,
          bio: participant.bio,
          investmentPercent: percent,
          totalInvested: participant.totalValue,
          topTags: participant.topTags,
          stance: generateStance(participant),
          choices: participant.choices,
          followCount: 0
        },
        latestChoice
      })
    }

    return result
  }

  // ==================== 统计信息 ====================

  /** 获取事件的资源池统计 */
  const getPoolStats = (eventId: string) => {
    const pool = resourcePools.value[eventId]
    if (!pool) return { totalInvested: 0, participantCount: 0, influencerCount: 0 }

    const participantCount = Object.keys(pool.participants).length
    const influencerCount = getEventInfluencers(eventId).length

    return {
      totalInvested: pool.totalInvested,
      participantCount,
      influencerCount
    }
  }

  /** 获取当前用户在某事件中的投入占比 */
  const getUserInvestmentPercent = (eventId: string, userId: string): number => {
    const pool = resourcePools.value[eventId]
    if (!pool || pool.totalInvested === 0) return 0
    const participant = pool.participants[userId]
    if (!participant) return 0
    return participant.totalValue / pool.totalInvested
  }

  return {
    resourcePools,
    followedInfluencers,
    ensurePool,
    ensureParticipant,
    recordInvestment,
    recordParticipantChoice,
    injectSimulatedData,
    getEventInfluencers,
    getStageInfluencers,
    getFollowedInfluencerChoices,
    followInfluencer,
    unfollowInfluencer,
    isFollowing,
    getPoolStats,
    getUserInvestmentPercent,
    costToValue
  }
})
