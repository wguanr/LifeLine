import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Item } from '@/types'
import { mockItems } from '@/data/items'

export const useItemStore = defineStore('item', () => {
  const items = ref<Item[]>([])
  const isLoading = ref(false)

  const visibleItems = computed(() => {
    return items.value.filter(i => i.visible)
  })

  const loadItems = async () => {
    isLoading.value = true
    try {
      items.value = mockItems
    } finally {
      isLoading.value = false
    }
  }

  const getItemById = (id: string) => {
    return items.value.find(i => i.id === id)
  }

  return {
    items,
    isLoading,
    visibleItems,
    loadItems,
    getItemById
  }
})
