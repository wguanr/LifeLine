/**
 * 信息引擎 Store
 * V4 Phase 3: 信息分层、信息市场、谣言系统
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { infoApi, getToken } from '@/api'

export interface InfoPiece {
  id: string
  eventId: string
  tier: 'public' | 'deep' | 'core'
  content: string
  accuracy: number
  unlockCost: number
  isUnlocked: boolean
  unlockedAt?: number
  sharedBy?: string
}

export interface InfoMarketStats {
  totalPieces: number
  tierDistribution: { public: number; deep: number; core: number }
  avgAccuracy: number
  activeRumors: number
}

export const useInformationStore = defineStore('information', () => {
  // ==================== 状态 ====================

  const availableInfo = ref<InfoPiece[]>([])
  const myInfo = ref<InfoPiece[]>([])
  const marketStats = ref<InfoMarketStats>({
    totalPieces: 0,
    tierDistribution: { public: 0, deep: 0, core: 0 },
    avgAccuracy: 0,
    activeRumors: 0,
  })
  const isLoading = ref(false)
  const isOnline = ref(false)

  // ==================== Getters ====================

  /** 按层级分组的可用信息 */
  const infoByTier = computed(() => {
    const result: Record<string, InfoPiece[]> = { public: [], deep: [], core: [] }
    for (const info of availableInfo.value) {
      if (result[info.tier]) {
        result[info.tier].push(info)
      }
    }
    return result
  })

  /** 已解锁的核心信息数量 */
  const unlockedCoreCount = computed(() =>
    myInfo.value.filter(i => i.tier === 'core').length
  )

  /** 信息覆盖率 (已解锁 / 总数) */
  const coverageRate = computed(() => {
    if (marketStats.value.totalPieces === 0) return 0
    return Math.round((myInfo.value.length / marketStats.value.totalPieces) * 100)
  })

  /** 按事件分组的信息 */
  const infoByEvent = computed(() => {
    const map = new Map<string, InfoPiece[]>()
    for (const info of availableInfo.value) {
      if (!map.has(info.eventId)) {
        map.set(info.eventId, [])
      }
      map.get(info.eventId)!.push(info)
    }
    return map
  })

  // ==================== Actions ====================

  /** 加载可用信息 */
  async function loadAvailable() {
    if (!getToken()) return
    isLoading.value = true
    try {
      const res = await infoApi.getAvailable()
      if (res.data) {
        availableInfo.value = (res.data as any) || []
        isOnline.value = true
      }
    } catch (err) {
      console.warn('[InfoStore] 加载可用信息失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  /** 加载已解锁信息 */
  async function loadMyInfo() {
    if (!getToken()) return
    try {
      const res = await infoApi.getMyInfo()
      if (res.data) {
        myInfo.value = (res.data as any) || []
      }
    } catch (err) {
      console.warn('[InfoStore] 加载已解锁信息失败:', err)
    }
  }

  /** 加载市场统计 */
  async function loadMarketStats() {
    try {
      const res = await infoApi.getMarketStats()
      if (res.data) {
        marketStats.value = res.data as InfoMarketStats
      }
    } catch (err) {
      console.warn('[InfoStore] 加载市场统计失败:', err)
    }
  }

  /** 加载全部信息数据 */
  async function loadAll() {
    await Promise.all([
      loadAvailable(),
      loadMyInfo(),
      loadMarketStats(),
    ])
  }

  /** 解锁信息 */
  async function unlock(informationId: string) {
    const res = await infoApi.unlock(informationId)
    if (res.data) {
      // 刷新列表
      await Promise.all([loadAvailable(), loadMyInfo()])
      return res.data
    }
    return null
  }

  /** 分享信息 */
  async function share(informationId: string, targetUserId: string) {
    const res = await infoApi.share(informationId, targetUserId)
    return res.data
  }

  /** 获取事件相关信息 */
  function getEventInfo(eventId: string): InfoPiece[] {
    return availableInfo.value.filter(i => i.eventId === eventId)
  }

  /** 获取事件的已解锁信息 */
  function getEventUnlockedInfo(eventId: string): InfoPiece[] {
    return myInfo.value.filter(i => i.eventId === eventId)
  }

  return {
    // 状态
    availableInfo,
    myInfo,
    marketStats,
    isLoading,
    isOnline,

    // Getters
    infoByTier,
    unlockedCoreCount,
    coverageRate,
    infoByEvent,

    // Actions
    loadAvailable,
    loadMyInfo,
    loadMarketStats,
    loadAll,
    unlock,
    share,
    getEventInfo,
    getEventUnlockedInfo,
  }
})
