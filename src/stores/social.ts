/**
 * 社交引擎 Store
 * V4 Phase 3: 信任网络、声誉传播、圈子选择倾向
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { socialApi, getToken } from '@/api'

export interface SocialRelation {
  userId: string
  nickname: string
  avatar: string
  trustValue: number
  isMutual: boolean
  followedAt: number
}

export interface SocialOverview {
  followingCount: number
  followerCount: number
  mutualCount: number
  avgTrustGiven: number
  avgTrustReceived: number
}

export interface CircleTendency {
  eventId: string
  choices: Array<{
    choiceId: string
    choiceText: string
    count: number
    avgTrust: number
  }>
  totalVoters: number
}

export const useSocialStore = defineStore('social', () => {
  // ==================== 状态 ====================

  const following = ref<SocialRelation[]>([])
  const followers = ref<SocialRelation[]>([])
  const mutuals = ref<SocialRelation[]>([])
  const overview = ref<SocialOverview>({
    followingCount: 0,
    followerCount: 0,
    mutualCount: 0,
    avgTrustGiven: 0,
    avgTrustReceived: 0,
  })
  const reputationBonus = ref<any>(null)
  const isLoading = ref(false)
  const isOnline = ref(false)

  // ==================== Getters ====================

  /** 信任度最高的好友 */
  const topTrustedFriends = computed(() =>
    [...mutuals.value].sort((a, b) => b.trustValue - a.trustValue).slice(0, 5)
  )

  /** 社交网络健康度 (0-100) */
  const networkHealth = computed(() => {
    const o = overview.value
    if (o.followingCount === 0) return 0
    const mutualRatio = o.mutualCount / Math.max(o.followingCount, 1)
    const trustScore = (o.avgTrustGiven + o.avgTrustReceived) / 2
    return Math.round((mutualRatio * 50 + trustScore * 50) * 100) / 100
  })

  // ==================== Actions ====================

  /** 加载社交概览 */
  async function loadOverview() {
    if (!getToken()) return
    isLoading.value = true
    try {
      const res = await socialApi.getOverview()
      if (res.data) {
        overview.value = res.data as SocialOverview
        isOnline.value = true
      }
    } catch (err) {
      console.warn('[SocialStore] 加载概览失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  /** 加载关注列表 */
  async function loadFollowing() {
    if (!getToken()) return
    try {
      const res = await socialApi.getFollowing()
      if (res.data) {
        following.value = (res.data as any) || []
      }
    } catch (err) {
      console.warn('[SocialStore] 加载关注列表失败:', err)
    }
  }

  /** 加载粉丝列表 */
  async function loadFollowers() {
    if (!getToken()) return
    try {
      const res = await socialApi.getFollowers()
      if (res.data) {
        followers.value = (res.data as any) || []
      }
    } catch (err) {
      console.warn('[SocialStore] 加载粉丝列表失败:', err)
    }
  }

  /** 加载互关列表 */
  async function loadMutuals() {
    if (!getToken()) return
    try {
      const res = await socialApi.getMutuals()
      if (res.data) {
        mutuals.value = (res.data as any) || []
      }
    } catch (err) {
      console.warn('[SocialStore] 加载互关列表失败:', err)
    }
  }

  /** 加载全部社交数据 */
  async function loadAll() {
    await Promise.all([
      loadOverview(),
      loadFollowing(),
      loadFollowers(),
      loadMutuals(),
      loadReputationBonus(),
    ])
  }

  /** 关注用户 */
  async function follow(targetUserId: string) {
    const res = await socialApi.follow(targetUserId)
    if (res.data?.success) {
      await loadAll()
      return true
    }
    return false
  }

  /** 取消关注 */
  async function unfollow(targetUserId: string) {
    const res = await socialApi.unfollow(targetUserId)
    if (res.data?.success) {
      await loadAll()
      return true
    }
    return false
  }

  /** 记录互动 */
  async function interact(targetUserId: string, type: 'positive' | 'negative' | 'betrayal') {
    const res = await socialApi.interact(targetUserId, type)
    if (res.data?.success) {
      // 更新本地信任值
      const rel = following.value.find(f => f.userId === targetUserId)
        || mutuals.value.find(m => m.userId === targetUserId)
      if (rel && res.data.trustAfter !== undefined) {
        rel.trustValue = res.data.trustAfter
      }
      return res.data
    }
    return null
  }

  /** 获取社交圈声誉加成 */
  async function loadReputationBonus() {
    if (!getToken()) return
    try {
      const res = await socialApi.getReputationBonus()
      if (res.data) {
        reputationBonus.value = res.data
      }
    } catch (err) {
      console.warn('[SocialStore] 加载声誉加成失败:', err)
    }
  }

  /** 获取圈子选择倾向 */
  async function getCircleTendency(eventId: string): Promise<CircleTendency | null> {
    if (!getToken()) return null
    try {
      const res = await socialApi.getCircleTendency(eventId)
      return res.data as CircleTendency | null
    } catch {
      return null
    }
  }

  return {
    // 状态
    following,
    followers,
    mutuals,
    overview,
    reputationBonus,
    isLoading,
    isOnline,

    // Getters
    topTrustedFriends,
    networkHealth,

    // Actions
    loadOverview,
    loadFollowing,
    loadFollowers,
    loadMutuals,
    loadAll,
    follow,
    unfollow,
    interact,
    loadReputationBonus,
    getCircleTendency,
  }
})
