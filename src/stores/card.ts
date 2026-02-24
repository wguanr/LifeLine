import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Card, CardType, GameEvent, Item, User } from '@/types'
import { useEventStore } from './event'
import { useItemStore } from './item'
import { mockUsers } from '@/data/users'

// 卡片类型权重配置
const CARD_TYPE_WEIGHTS: Record<CardType, number> = {
  event: 60,   // 60% 事件卡片
  item: 20,    // 20% 物品卡片
  user: 20     // 20% 用户卡片
}

// 卡片队列长度
const QUEUE_SIZE = 5

export const useCardStore = defineStore('card', () => {
  // ==================== 状态 ====================
  
  const cardQueue = ref<Card[]>([])
  const currentIndex = ref(0)
  const isLoading = ref(false)
  const usedIds = ref<Set<string>>(new Set())
  
  // ==================== Getters ====================
  
  const currentCard = computed(() => {
    return cardQueue.value[currentIndex.value] ?? null
  })
  
  const hasNext = computed(() => {
    return currentIndex.value < cardQueue.value.length - 1
  })
  
  const hasPrev = computed(() => {
    return currentIndex.value > 0
  })
  
  // ==================== Actions ====================
  
  // 初始化卡片队列
  const initCardQueue = async () => {
    isLoading.value = true
    try {
      cardQueue.value = []
      currentIndex.value = 0
      usedIds.value.clear()
      
      // 保底机制：确保每轮至少有1张物品卡片和1张用户卡片
      const guaranteedTypes: CardType[] = ['item', 'user']
      const guaranteedCards: Card[] = []
      
      for (const type of guaranteedTypes) {
        const data = getCardData(type)
        if (data) {
          guaranteedCards.push({
            id: `card_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            type,
            data,
            weight: Math.random() * 100
          })
        }
      }
      
      // 生成剩余卡片（按权重随机）
      const remaining = QUEUE_SIZE - guaranteedCards.length
      const randomCards: Card[] = []
      for (let i = 0; i < remaining; i++) {
        const card = generateCard()
        if (card) {
          randomCards.push(card)
        }
      }
      
      // 混合并打乱顺序
      const allCards = [...guaranteedCards, ...randomCards]
      for (let i = allCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[allCards[i], allCards[j]] = [allCards[j], allCards[i]]
      }
      
      cardQueue.value = allCards
    } finally {
      isLoading.value = false
    }
  }
  
  // 生成单张卡片
  const generateCard = (): Card | null => {
    const type = selectCardType()
    const data = getCardData(type)
    
    if (!data) return null
    
    const card: Card = {
      id: `card_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      data,
      weight: Math.random() * 100
    }
    
    return card
  }
  
  // 根据权重选择卡片类型
  const selectCardType = (): CardType => {
    const total = Object.values(CARD_TYPE_WEIGHTS).reduce((a, b) => a + b, 0)
    let random = Math.random() * total
    
    for (const [type, weight] of Object.entries(CARD_TYPE_WEIGHTS)) {
      random -= weight
      if (random <= 0) {
        return type as CardType
      }
    }
    
    return 'event'
  }
  
  // 获取卡片数据
  const getCardData = (type: CardType): GameEvent | Item | User | null => {
    const eventStore = useEventStore()
    const itemStore = useItemStore()
    
    switch (type) {
      case 'event': {
        const available = eventStore.availableEvents.filter(e => !usedIds.value.has(e.id))
        if (available.length === 0) {
          // 如果没有可用事件，重置已使用列表
          usedIds.value.clear()
          return eventStore.availableEvents[0] ?? null
        }
        const event = available[Math.floor(Math.random() * available.length)]
        if (event) usedIds.value.add(event.id)
        return event ?? null
      }
      
      case 'item': {
        const available = itemStore.visibleItems.filter(i => !usedIds.value.has(i.id))
        if (available.length === 0) {
          usedIds.value.clear()
          return itemStore.visibleItems[0] ?? null
        }
        const item = available[Math.floor(Math.random() * available.length)]
        if (item) usedIds.value.add(item.id)
        return item ?? null
      }
      
      case 'user': {
        const available = mockUsers.filter(u => !usedIds.value.has(u.id))
        if (available.length === 0) {
          usedIds.value.clear()
          return mockUsers[0] ?? null
        }
        const user = available[Math.floor(Math.random() * available.length)]
        if (user) usedIds.value.add(user.id)
        return user ?? null
      }
      
      default:
        return null
    }
  }
  
  // 切换到下一张卡片
  const nextCard = () => {
    if (currentIndex.value < cardQueue.value.length - 1) {
      currentIndex.value++
      
      // 预加载：当滑动到倒数第2张时，加载更多
      if (currentIndex.value >= cardQueue.value.length - 2) {
        preloadCards()
      }
    }
  }
  
  // 切换到上一张卡片
  const prevCard = () => {
    if (currentIndex.value > 0) {
      currentIndex.value--
    }
  }
  
  // 预加载更多卡片
  const preloadCards = () => {
    const cardsToAdd = 3
    for (let i = 0; i < cardsToAdd; i++) {
      const card = generateCard()
      if (card) {
        cardQueue.value.push(card)
      }
    }
    
    // 清理过早的卡片，保持队列不会无限增长
    if (cardQueue.value.length > 20) {
      const removeCount = cardQueue.value.length - 15
      cardQueue.value.splice(0, removeCount)
      currentIndex.value = Math.max(0, currentIndex.value - removeCount)
    }
  }
  
  // 刷新卡片流
  const refreshCards = async () => {
    await initCardQueue()
  }
  
  // 移除指定卡片
  const removeCard = (cardId: string) => {
    const index = cardQueue.value.findIndex(c => c.id === cardId)
    if (index > -1) {
      cardQueue.value.splice(index, 1)
      if (currentIndex.value >= cardQueue.value.length) {
        currentIndex.value = Math.max(0, cardQueue.value.length - 1)
      }
    }
  }
  
  return {
    // 状态
    cardQueue,
    currentIndex,
    isLoading,
    
    // Getters
    currentCard,
    hasNext,
    hasPrev,
    
    // Actions
    initCardQueue,
    nextCard,
    prevCard,
    refreshCards,
    removeCard
  }
})
