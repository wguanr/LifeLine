import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Item } from '@/types'
import { mockItems } from '@/data/items'
import { aigcItems } from '@/data/aigc_items'

export const useItemStore = defineStore('item', () => {
  const items = ref<Item[]>([])
  const isLoading = ref(false)

  const visibleItems = computed(() => {
    return items.value.filter(i => i.visible)
  })

  const loadItems = async () => {
    isLoading.value = true
    try {
      // 合并原始物品和AIGC物品
      const aigcNormalized = (aigcItems as any[]).map(i => ({
        ...i,
        visible: i.visible !== false,
        createdAt: i.createdAt || Date.now()
      })) as Item[]
      items.value = [...mockItems, ...aigcNormalized]
    } finally {
      isLoading.value = false
    }
  }

  const getItemById = (id: string) => {
    return items.value.find(i => i.id === id)
  }

  const getItem = getItemById

  // AIGC 物品（来自现实世界新闻关联）
  const aigcItemList = computed(() => {
    return items.value.filter(i => i.id.startsWith('aigc_'))
  })

  return {
    items,
    isLoading,
    visibleItems,
    aigcItemList,
    loadItems,
    getItemById,
    getItem
  }
})
