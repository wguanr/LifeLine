import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Item } from '@/types'
import { mockItems } from '@/data/items'
import { aigcItems } from '@/data/aigc_items'
import { generatedItems } from '@/data/generated_items'
import { itemApi, resourceApi, getToken } from '@/api'

export const useItemStore = defineStore('item', () => {
  const items = ref<Item[]>([])
  const isLoading = ref(false)
  /** 是否已连接后端 */
  const isOnline = ref(false)
  /** 用户背包 */
  const inventory = ref<Array<{ itemId: string; quantity: number; acquiredAt: number; source: string }>>([])

  const visibleItems = computed(() => {
    return items.value.filter(i => i.visible)
  })

  /**
   * 加载物品列表
   * 优先从后端 API 加载，失败时回退到本地 mock 数据
   */
  const loadItems = async () => {
    isLoading.value = true
    try {
      // 如果有 token，尝试从后端加载
      if (getToken()) {
        const res = await itemApi.getItems()
        if (res.data && res.data.items && res.data.items.length > 0) {
          items.value = res.data.items.map((i: any) => ({
            ...i,
            visible: i.visible !== false,
            createdAt: i.createdAt || Date.now(),
          })) as Item[]
          isOnline.value = true
          console.log(`[ItemStore] 从后端加载了 ${items.value.length} 个物品`)

          // 同时加载背包
          await loadInventory()
          return
        }
      }
    } catch (err) {
      console.warn('[ItemStore] 后端加载失败，回退到本地数据:', err)
    }

    // 回退：从本地 mock 数据加载
    try {
      const aigcNormalized = ([...aigcItems] as any[]).map(i => ({
        ...i,
        visible: i.visible !== false,
        createdAt: i.createdAt || Date.now()
      })) as Item[]
      const genNormalized = ([...generatedItems] as any[]).map(i => ({
        ...i,
        visible: i.visible !== false,
        createdAt: i.createdAt || Date.now()
      })) as Item[]
      items.value = [...mockItems, ...aigcNormalized, ...genNormalized]
      isOnline.value = false
      console.log(`[ItemStore] 从本地加载了 ${items.value.length} 个物品`)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 加载用户背包
   */
  const loadInventory = async () => {
    if (!getToken()) return
    try {
      const res = await resourceApi.getInventory()
      if (res.data) {
        inventory.value = res.data.inventory
      }
    } catch (err) {
      console.warn('[ItemStore] 加载背包失败:', err)
    }
  }

  const getItemById = (id: string) => {
    return items.value.find(i => i.id === id) || items.value.find(i => i.name === id)
  }

  const getItem = getItemById

  /**
   * 购买物品
   * 联网模式下调用后端购买接口（扣费 + 入包 + 标签更新）
   */
  const buyItem = async (itemId: string) => {
    if (!isOnline.value || !getToken()) {
      throw new Error('需要登录后才能购买')
    }

    const res = await itemApi.buyItem(itemId)
    if (res.error) {
      throw new Error(res.error)
    }

    // 更新本地背包
    if (res.data) {
      inventory.value = res.data.inventory
    }

    return res.data
  }

  /**
   * 检查用户是否拥有某物品
   */
  const hasItem = (itemId: string) => {
    return inventory.value.some(i => i.itemId === itemId && i.quantity > 0)
  }

  /**
   * 获取用户拥有的某物品数量
   */
  const getItemQuantity = (itemId: string) => {
    const item = inventory.value.find(i => i.itemId === itemId)
    return item ? item.quantity : 0
  }

  // AIGC 物品（来自现实世界新闻关联）
  const aigcItemList = computed(() => {
    return items.value.filter(i => i.id.startsWith('aigc_'))
  })

  return {
    items,
    isLoading,
    isOnline,
    inventory,
    visibleItems,
    aigcItemList,
    loadItems,
    loadInventory,
    getItemById,
    getItem,
    buyItem,
    hasItem,
    getItemQuantity
  }
})
