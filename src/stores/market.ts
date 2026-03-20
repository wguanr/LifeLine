/**
 * 物品市场 Store
 * V4 Phase 2: Bonding Curve 动态定价 + 世界状态敏感性
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { marketApi, getToken } from '@/api'

export interface DynamicPrice {
  baseCost: { time?: number; energy?: number }
  bondingMultiplier: number
  worldSensitivityMultiplier: number
  finalCost: { time: number; energy: number }
  trend: 'rising' | 'falling' | 'stable'
  mintedCount: number
  maxMint: number
  scarcity: number
}

export interface MarketItem {
  id: string
  name: string
  description: string
  icon: string
  rarity: string
  category: string
  tags: string[]
  featureTags: string[]
  story: string | null
  image: string | null
  stackable: boolean
  maxStack: number
  maxMint: number
  mintedCount: number
  dynamicPrice: DynamicPrice
}

export const useMarketStore = defineStore('market', () => {
  // ==================== 状态 ====================

  const items = ref<MarketItem[]>([])
  const isLoading = ref(false)
  const isOnline = ref(false)
  const selectedRarity = ref<string>('all')
  const selectedTrend = ref<string>('all')
  const sortBy = ref<'price_asc' | 'price_desc' | 'scarcity' | 'name'>('price_asc')

  // ==================== Getters ====================

  /** 按稀有度分组 */
  const itemsByRarity = computed(() => {
    const map: Record<string, MarketItem[]> = {}
    for (const item of items.value) {
      if (!map[item.rarity]) map[item.rarity] = []
      map[item.rarity].push(item)
    }
    return map
  })

  /** 稀有度统计 */
  const rarityStats = computed(() => {
    const stats: Record<string, number> = {}
    for (const item of items.value) {
      stats[item.rarity] = (stats[item.rarity] || 0) + 1
    }
    return stats
  })

  /** 趋势统计 */
  const trendStats = computed(() => ({
    rising: items.value.filter(i => i.dynamicPrice.trend === 'rising').length,
    stable: items.value.filter(i => i.dynamicPrice.trend === 'stable').length,
    falling: items.value.filter(i => i.dynamicPrice.trend === 'falling').length,
  }))

  /** 过滤和排序后的物品 */
  const filteredItems = computed(() => {
    let result = [...items.value]

    // 稀有度过滤
    if (selectedRarity.value !== 'all') {
      result = result.filter(i => i.rarity === selectedRarity.value)
    }

    // 趋势过滤
    if (selectedTrend.value !== 'all') {
      result = result.filter(i => i.dynamicPrice.trend === selectedTrend.value)
    }

    // 排序
    switch (sortBy.value) {
      case 'price_asc':
        result.sort((a, b) => a.dynamicPrice.finalCost.time - b.dynamicPrice.finalCost.time)
        break
      case 'price_desc':
        result.sort((a, b) => b.dynamicPrice.finalCost.time - a.dynamicPrice.finalCost.time)
        break
      case 'scarcity':
        result.sort((a, b) => b.dynamicPrice.scarcity - a.dynamicPrice.scarcity)
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return result
  })

  /** 市场平均 Bonding 乘数 */
  const avgBondingMultiplier = computed(() => {
    if (items.value.length === 0) return 1
    return Math.round(
      items.value.reduce((s, i) => s + i.dynamicPrice.bondingMultiplier, 0) / items.value.length * 100
    ) / 100
  })

  /** 市场平均世界敏感性乘数 */
  const avgWorldSensitivity = computed(() => {
    if (items.value.length === 0) return 1
    return Math.round(
      items.value.reduce((s, i) => s + i.dynamicPrice.worldSensitivityMultiplier, 0) / items.value.length * 100
    ) / 100
  })

  // ==================== Actions ====================

  /** 加载市场数据 */
  async function loadMarket() {
    isLoading.value = true
    try {
      const res = await marketApi.getMarketItems()
      if (res.data) {
        items.value = res.data.items
        isOnline.value = true
      }
    } catch (err) {
      console.warn('[MarketStore] 加载市场失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  /** 使用动态价格购买物品 */
  async function buyItem(itemId: string) {
    if (!getToken()) return null
    try {
      const res = await marketApi.buyItemDynamic(itemId)
      if (res.data?.ok) {
        // 刷新市场数据（价格会变化）
        await loadMarket()
        return res.data
      }
      return null
    } catch (err) {
      console.warn('[MarketStore] 购买失败:', err)
      return null
    }
  }

  /** 获取单个物品的最新价格 */
  async function refreshItemPrice(itemId: string) {
    try {
      const res = await marketApi.getItemPrice(itemId)
      if (res.data) {
        const item = items.value.find(i => i.id === itemId)
        if (item) {
          item.dynamicPrice = res.data as DynamicPrice
        }
        return res.data
      }
    } catch (err) {
      console.warn('[MarketStore] 刷新价格失败:', err)
    }
    return null
  }

  return {
    // 状态
    items,
    isLoading,
    isOnline,
    selectedRarity,
    selectedTrend,
    sortBy,

    // Getters
    itemsByRarity,
    rarityStats,
    trendStats,
    filteredItems,
    avgBondingMultiplier,
    avgWorldSensitivity,

    // Actions
    loadMarket,
    buyItem,
    refreshItemPrice,
  }
})
