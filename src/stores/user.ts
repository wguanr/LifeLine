import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, UserTag, UserItem, UserWallet, TagAction } from '@/types'
import { getTagDefinition } from '@/data/tags'
import { mockItems } from '@/data/items'
import { authApi, getToken, setToken, clearToken } from '@/api/index'

/** 标签可信度数据结构 */
export interface TagCredibility {
  tagId: string
  name: string
  icon: string
  category: string
  credibility: number
  /** 来源明细：事件贡献 + 物品贡献 */
  fromActions: number
  fromItems: number
}

export const useUserStore = defineStore('user', () => {
  // ==================== 状态 ====================
  
  const user = ref<User | null>(null)
  const isLoggedIn = computed(() => !!user.value)
  /** 是否已连接后端（有 token） */
  const isOnline = computed(() => !!getToken())
  
  // ==================== Getters ====================
  
  // 真实世界钱包：时间、精力、社交积分
  const wallet = computed(() => user.value?.wallet ?? { time: 0, energy: 0, reputation: 0 })
  
  // 用户标签（带权重）
  const tags = computed(() => user.value?.tags ?? [])
  
  // 获取 Top N 标签（按权重排序）
  const topTags = computed(() => {
    return [...tags.value].sort((a, b) => b.weight - a.weight)
  })
  
  // 获取分类标签
  const tagsByCategory = computed(() => {
    const result: Record<string, UserTag[]> = {
      life: [],
      social: [],
      work: [],
      growth: []
    }
    tags.value.forEach(tag => {
      const def = getTagDefinition(tag.tagId)
      if (def) {
        result[def.category].push(tag)
      }
    })
    // 每个分类按权重排序
    Object.keys(result).forEach(key => {
      result[key].sort((a, b) => b.weight - a.weight)
    })
    return result
  })
  
  const inventory = computed(() => user.value?.inventory ?? [])
  const tagActions = computed(() => user.value?.history.tagActions ?? [])

  // ==================== 标签可信度画像系统 ====================

  /** 将货币成本换算为单一价值分数 */
  const costToValue = (cost: { time?: number; energy?: number; reputation?: number }): number => {
    return (cost.time ?? 0) + (cost.energy ?? 0) * 1.5 + (cost.reputation ?? 0) * 0.5
  }

  /**
   * 所有标签的可信度（含明细），按可信度降序
   */
  const allTagCredibilities = computed<TagCredibility[]>(() => {
    const credMap = new Map<string, { fromActions: number; fromItems: number }>()

    const ensureTag = (tagId: string) => {
      if (!credMap.has(tagId)) {
        credMap.set(tagId, { fromActions: 0, fromItems: 0 })
      }
      return credMap.get(tagId)!
    }

    // 来源1: tagActions 历史
    for (const action of tagActions.value) {
      const entry = ensureTag(action.tagId)
      entry.fromActions += costToValue(action.cost)
    }

    // 来源2: 用户持有的 item
    for (const userItem of inventory.value) {
      const itemDef = mockItems.find(i => i.id === userItem.itemId)
      if (!itemDef) continue
      const itemValue = costToValue(itemDef.mintCost) * userItem.quantity
      for (const tagId of itemDef.tags) {
        const entry = ensureTag(tagId)
        entry.fromItems += itemValue
      }
    }

    // 组装结果
    const result: TagCredibility[] = []
    for (const [tagId, scores] of credMap) {
      const def = getTagDefinition(tagId)
      if (!def) continue
      result.push({
        tagId,
        name: def.name,
        icon: def.icon,
        category: def.category,
        credibility: Math.round(scores.fromActions + scores.fromItems),
        fromActions: Math.round(scores.fromActions),
        fromItems: Math.round(scores.fromItems)
      })
    }

    return result.sort((a, b) => b.credibility - a.credibility)
  })

  /**
   * 可信标签画像：仅包含可信度 > 50 的标签
   */
  const credibleTags = computed<TagCredibility[]>(() => {
    return allTagCredibilities.value.filter(t => t.credibility > 50)
  })
  
  // 检查用户是否拥有特定标签
  const hasTag = (tagId: string) => {
    return tags.value.some(t => t.tagId === tagId)
  }
  
  // 获取标签权重
  const getTagWeight = (tagId: string): number => {
    const tag = tags.value.find(t => t.tagId === tagId)
    return tag?.weight ?? 0
  }
  
  // 检查用户是否拥有特定物品
  const hasItem = (itemId: string) => {
    return inventory.value.some(i => i.itemId === itemId)
  }
  
  // 检查用户是否满足事件要求
  const meetsRequirements = (requirements: {
    tags?: string[]
    minTagWeight?: number
    items?: string[]
    minTime?: number
    minReputation?: number
  }) => {
    if (!user.value) return false
    
    if (requirements.tags?.length) {
      const minWeight = requirements.minTagWeight ?? 0
      if (!requirements.tags.every(tagId => getTagWeight(tagId) >= minWeight)) {
        return false
      }
    }
    
    if (requirements.items?.length) {
      if (!requirements.items.every(itemId => hasItem(itemId))) {
        return false
      }
    }
    
    if (requirements.minTime && wallet.value.time < requirements.minTime) {
      return false
    }
    
    if (requirements.minReputation && wallet.value.reputation < requirements.minReputation) {
      return false
    }
    
    return true
  }
  
  // 检查用户是否能支付费用
  const canAfford = (cost: { time?: number; energy?: number }) => {
    if (!user.value) return false
    if (cost.time && wallet.value.time < cost.time) return false
    if (cost.energy && wallet.value.energy < cost.energy) return false
    return true
  }
  
  // ==================== 后端 API 集成 ====================

  /**
   * 从 API 响应设置用户数据
   * 由登录/注册页面调用
   */
  const setUserFromApi = (apiUser: any) => {
    user.value = {
      id: apiUser.id,
      nickname: apiUser.nickname,
      avatar: apiUser.avatar || '',
      bio: apiUser.bio || '',
      motto: apiUser.motto || '',
      clearanceLevel: apiUser.clearanceLevel ?? 0,
      tags: apiUser.tags || [],
      wallet: apiUser.wallet || { time: 1000, energy: 100, reputation: 0 },
      inventory: apiUser.inventory || [],
      history: apiUser.history || {
        completedEvents: [],
        currentEvents: [],
        achievements: [],
        tagActions: [],
        archiveAccess: [],
        choiceHistory: [],
      },
      createdAt: apiUser.createdAt || Date.now(),
      lastActiveAt: apiUser.lastActiveAt || Date.now(),
    }
    // 同时保存到本地存储作为缓存
    saveUser()
  }

  /**
   * 尝试从后端恢复登录状态
   * 在 App 启动时调用
   */
  const tryRestoreSession = async (): Promise<boolean> => {
    const token = getToken()
    if (!token) return false

    try {
      const res = await authApi.getMe()
      if (res.error || !res.data) {
        // Token 过期或无效，清除
        clearToken()
        return false
      }
      setUserFromApi(res.data.user)
      return true
    } catch {
      return false
    }
  }

  /**
   * 登出
   */
  const logout = () => {
    clearToken()
    user.value = null
    uni.removeStorageSync('choser_user_v2')
    uni.navigateTo({ url: '/pages/login/login' })
  }

  // ==================== 初始化（兼容模式） ====================
  
  // 版本号
  const DATA_VERSION = 'v4_mega_wallet'
  
  /**
   * 初始化用户
   * 优先尝试从后端恢复，失败则回退到本地存储
   */
  const initUser = async () => {
    // 1. 尝试从后端恢复
    const restored = await tryRestoreSession()
    if (restored) {
      console.log('[UserStore] 从后端恢复登录状态成功')
      return
    }

    // 2. 回退到本地存储（兼容旧版本）
    console.log('[UserStore] 未登录后端，使用本地存储模式')
    const storedVersion = uni.getStorageSync('choser_data_version')
    if (storedVersion !== DATA_VERSION) {
      uni.removeStorageSync('choser_user_v2')
      uni.setStorageSync('choser_data_version', DATA_VERSION)
      createNewUser()
      return
    }
    
    const stored = uni.getStorageSync('choser_user_v2')
    if (stored) {
      try {
        user.value = JSON.parse(stored)
        if (user.value) {
          user.value.wallet = {
            time: 99999999,
            energy: 99999999,
            reputation: 99999999
          }
          saveUser()
        }
      } catch (e) {
        createNewUser()
      }
    } else {
      createNewUser()
    }
  }
  
  // 创建新用户（本地模式）
  const createNewUser = () => {
    const id = 'U' + Date.now().toString(36).toUpperCase()
    const now = Date.now()
    
    const initialTags: UserTag[] = [
      { tagId: 'traveler', weight: 35, actionCount: 5, lastActionTime: now - 2 * 60 * 60 * 1000, source: 'event', acquiredAt: now - 7 * 24 * 60 * 60 * 1000 },
      { tagId: 'explorer', weight: 28, actionCount: 4, lastActionTime: now - 5 * 60 * 60 * 1000, source: 'event', acquiredAt: now - 5 * 24 * 60 * 60 * 1000 },
      { tagId: 'minimalist', weight: 22, actionCount: 3, lastActionTime: now - 12 * 60 * 60 * 1000, source: 'item', acquiredAt: now - 3 * 24 * 60 * 60 * 1000 },
      { tagId: 'foodie', weight: 18, actionCount: 2, lastActionTime: now - 24 * 60 * 60 * 1000, source: 'event', acquiredAt: now - 2 * 24 * 60 * 60 * 1000 },
      { tagId: 'helpful', weight: 15, actionCount: 2, lastActionTime: now - 36 * 60 * 60 * 1000, source: 'event', acquiredAt: now - 4 * 24 * 60 * 60 * 1000 },
      { tagId: 'learner', weight: 12, actionCount: 1, lastActionTime: now - 48 * 60 * 60 * 1000, source: 'event', acquiredAt: now - 6 * 24 * 60 * 60 * 1000 },
    ]
    
    const initialInventory: UserItem[] = [
      { itemId: 'item_travel_bag', quantity: 1, acquiredAt: now - 5 * 24 * 60 * 60 * 1000, source: 'evt_travel_plan' },
      { itemId: 'item_coffee_coupon', quantity: 3, acquiredAt: now - 2 * 24 * 60 * 60 * 1000, source: 'evt_coffee_encounter' },
      { itemId: 'item_takeout_coupon', quantity: 2, acquiredAt: now - 1 * 24 * 60 * 60 * 1000, source: 'daily_reward' },
      { itemId: 'item_yoga_mat', quantity: 1, acquiredAt: now - 3 * 24 * 60 * 60 * 1000, source: 'evt_health_challenge' },
      { itemId: 'item_notebook', quantity: 1, acquiredAt: now - 4 * 24 * 60 * 60 * 1000, source: 'evt_skill_learning' },
    ]
    
    const initialTagActions: TagAction[] = [
      { id: 'A1', tagId: 'traveler', actionType: 'event_choice', cost: { time: 60, energy: 20 }, weightChange: 12, timestamp: now - 2 * 60 * 60 * 1000, sourceId: 'evt_travel_plan', sourceName: '周末旅行计划' },
      { id: 'A2', tagId: 'explorer', actionType: 'event_choice', cost: { time: 30, energy: 15 }, weightChange: 9, timestamp: now - 5 * 60 * 60 * 1000, sourceId: 'evt_new_place', sourceName: '探索新地方' },
      { id: 'A3', tagId: 'minimalist', actionType: 'item_mint', cost: { time: 15 }, weightChange: 7, timestamp: now - 12 * 60 * 60 * 1000, sourceId: 'item_notebook', sourceName: '简约笔记本' },
      { id: 'A4', tagId: 'foodie', actionType: 'event_choice', cost: { time: 45, energy: 10 }, weightChange: 8, timestamp: now - 24 * 60 * 60 * 1000, sourceId: 'evt_food_explore', sourceName: '美食探店' },
      { id: 'A5', tagId: 'helpful', actionType: 'event_choice', cost: { energy: 25 }, weightChange: 10, timestamp: now - 36 * 60 * 60 * 1000, sourceId: 'evt_subway_seat', sourceName: '地铁让座' },
      { id: 'A6', tagId: 'learner', actionType: 'event_choice', cost: { time: 90, energy: 30 }, weightChange: 6, timestamp: now - 48 * 60 * 60 * 1000, sourceId: 'evt_skill_learning', sourceName: '新技能学习' },
      { id: 'A7', tagId: 'traveler', actionType: 'event_choice', cost: { time: 120, energy: 40 }, weightChange: 15, timestamp: now - 72 * 60 * 60 * 1000, sourceId: 'evt_weekend_trip', sourceName: '周末短途游' },
      { id: 'A8', tagId: 'explorer', actionType: 'item_mint', cost: { time: 20 }, weightChange: 5, timestamp: now - 96 * 60 * 60 * 1000, sourceId: 'item_travel_bag', sourceName: '旅行背包' },
    ]
    
    user.value = {
      id,
      nickname: '探索者' + id.slice(-4),
      avatar: '',
      bio: '热爱生活，享受每一次新的体验。在这个世界里寻找属于自己的故事。',
      clearanceLevel: 2 as const,
      tags: initialTags,
      wallet: { time: 99999999, energy: 99999999, reputation: 99999999 },
      inventory: initialInventory,
      history: {
        completedEvents: ['evt_coffee_encounter', 'evt_subway_seat', 'evt_food_explore'],
        currentEvents: ['evt_skill_learning', 'evt_travel_plan'],
        achievements: ['first_choice', 'helper_badge'],
        tagActions: initialTagActions,
        archiveAccess: [],
        choiceHistory: [
          { eventId: 'evt_coffee_encounter', choiceId: 'greet', timestamp: now - 48 * 60 * 60 * 1000 },
          { eventId: 'evt_subway_seat', choiceId: 'give_seat', timestamp: now - 36 * 60 * 60 * 1000 },
          { eventId: 'evt_food_explore', choiceId: 'try_new', timestamp: now - 24 * 60 * 60 * 1000 },
        ]
      },
      createdAt: now - 14 * 24 * 60 * 60 * 1000,
      lastActiveAt: now
    }
    saveUser()
  }
  
  // 保存用户数据到本地存储
  const saveUser = () => {
    if (user.value) {
      user.value.lastActiveAt = Date.now()
      uni.setStorageSync('choser_user_v2', JSON.stringify(user.value))
    }
  }
  
  // 更新昵称
  const updateNickname = (nickname: string) => {
    if (user.value) {
      user.value.nickname = nickname
      saveUser()
      // 如果在线模式，同步到后端
      if (isOnline.value) {
        authApi.updateMe({ nickname }).catch(() => {})
      }
    }
  }
  
  // ==================== 标签系统 ====================
  
  const calculateWeightIncrement = (baseWeight: number, actionCount: number): number => {
    const decayFactor = 1 / (1 + Math.log(1 + actionCount))
    return Math.round(baseWeight * decayFactor * 10) / 10
  }
  
  const updateTagWeight = (
    tagId: string,
    baseWeight: number,
    source: 'event' | 'item' | 'system',
    sourceId: string,
    sourceName: string,
    cost?: { time?: number; energy?: number; reputation?: number }
  ) => {
    if (!user.value) return
    
    const now = Date.now()
    let tag = user.value.tags.find(t => t.tagId === tagId)
    
    if (!tag) {
      tag = { tagId, weight: 0, actionCount: 0, lastActionTime: now, source, acquiredAt: now }
      user.value.tags.push(tag)
    }
    
    let weightIncrement = calculateWeightIncrement(baseWeight, tag.actionCount)
    
    if (cost) {
      const costBonus = ((cost.time ?? 0) / 30 + (cost.energy ?? 0) / 20) * 0.5
      weightIncrement += costBonus
    }
    
    if (tag.actionCount > 0 && tag.actionCount % 3 === 2) {
      weightIncrement += 2
    }
    
    tag.weight = Math.max(0, Math.min(100, tag.weight + weightIncrement))
    tag.actionCount += 1
    tag.lastActionTime = now
    
    const action: TagAction = {
      id: 'A' + now.toString(36),
      tagId,
      actionType: source === 'event' ? 'event_choice' : source === 'item' ? 'item_mint' : 'daily_check',
      cost: cost ?? {},
      weightChange: weightIncrement,
      timestamp: now,
      sourceId,
      sourceName
    }
    user.value.history.tagActions.push(action)
    
    if (user.value.history.tagActions.length > 100) {
      user.value.history.tagActions = user.value.history.tagActions.slice(-100)
    }
    
    saveUser()
  }
  
  const updateTagWeights = (
    tagUpdates: Array<{ tagId: string; weight: number }>,
    source: 'event' | 'item' | 'system',
    sourceId: string,
    sourceName: string,
    cost?: { time?: number; energy?: number; reputation?: number }
  ) => {
    tagUpdates.forEach(update => {
      updateTagWeight(update.tagId, update.weight, source, sourceId, sourceName, cost)
    })
  }
  
  const decreaseTagWeight = (tagId: string, amount: number) => {
    if (!user.value) return
    const tag = user.value.tags.find(t => t.tagId === tagId)
    if (tag) {
      tag.weight = Math.max(0, tag.weight - amount)
      saveUser()
    }
  }
  
  const decayTagWeights = () => {
    if (!user.value) return
    const now = Date.now()
    const thirtyDays = 30 * 24 * 60 * 60 * 1000
    
    user.value.tags.forEach(tag => {
      if (now - tag.lastActionTime > thirtyDays) {
        tag.weight = Math.max(0, tag.weight * 0.9)
      }
    })
    saveUser()
  }
  
  // ==================== 钱包操作 ====================
  
  const updateWallet = (changes: Partial<UserWallet>) => {
    if (user.value) {
      if (changes.time !== undefined) {
        user.value.wallet.time = Math.max(0, user.value.wallet.time + changes.time)
      }
      if (changes.energy !== undefined) {
        user.value.wallet.energy = Math.max(0, user.value.wallet.energy + changes.energy)
      }
      if (changes.reputation !== undefined) {
        user.value.wallet.reputation = Math.max(0, user.value.wallet.reputation + changes.reputation)
      }
      saveUser()
    }
  }
  
  const pay = (cost: { time?: number; energy?: number; reputation?: number }) => {
    if (!canAfford(cost)) return false
    updateWallet({
      time: cost.time ? -cost.time : 0,
      energy: cost.energy ? -cost.energy : 0,
      reputation: cost.reputation ? -cost.reputation : 0
    })
    return true
  }
  
  // ==================== 物品操作 ====================
  
  const addItem = (item: UserItem) => {
    if (user.value) {
      const existing = user.value.inventory.find(i => i.itemId === item.itemId)
      if (existing) {
        existing.quantity += item.quantity
      } else {
        user.value.inventory.push(item)
      }
      saveUser()
    }
  }
  
  const buyItem = (itemDef: { id: string; name: string; mintCost: { time?: number; energy?: number }; tags: string[] }) => {
    if (!user.value) return false
    if (!canAfford(itemDef.mintCost)) return false
    pay(itemDef.mintCost)
    addItem({ itemId: itemDef.id, quantity: 1, acquiredAt: Date.now(), source: 'buy_' + itemDef.id })
    for (const tagId of itemDef.tags) {
      updateTagWeight(tagId, 5, 'item', itemDef.id, itemDef.name, itemDef.mintCost)
    }
    return true
  }

  const removeItem = (itemId: string, quantity: number = 1) => {
    if (user.value) {
      const existing = user.value.inventory.find(i => i.itemId === itemId)
      if (existing) {
        existing.quantity -= quantity
        if (existing.quantity <= 0) {
          user.value.inventory = user.value.inventory.filter(i => i.itemId !== itemId)
        }
        saveUser()
      }
    }
  }
  
  // ==================== 事件记录 ====================
  
  const completeEvent = (eventId: string) => {
    if (user.value) {
      if (!user.value.history.completedEvents.includes(eventId)) {
        user.value.history.completedEvents.push(eventId)
      }
      user.value.history.currentEvents = user.value.history.currentEvents.filter(id => id !== eventId)
      saveUser()
    }
  }
  
  const startEvent = (eventId: string) => {
    if (user.value) {
      if (!user.value.history.currentEvents.includes(eventId)) {
        user.value.history.currentEvents.push(eventId)
        saveUser()
      }
    }
  }
  
  // currentUser 计算属性
  const currentUser = computed(() => user.value ?? {
    id: '',
    nickname: '未登录',
    avatar: '',
    bio: '',
    clearanceLevel: 0 as const,
    tags: [],
    wallet: { time: 0, energy: 0, reputation: 0 },
    inventory: [],
    history: {
      completedEvents: [],
      currentEvents: [],
      achievements: [],
      tagActions: [],
      archiveAccess: [],
      choiceHistory: []
    },
    createdAt: 0,
    lastActiveAt: 0
  })
  
  return {
    // 状态
    user,
    isLoggedIn,
    isOnline,
    currentUser,
    
    // Getters
    wallet,
    tags,
    topTags,
    tagsByCategory,
    inventory,
    tagActions,
    allTagCredibilities,
    credibleTags,
    costToValue,
    hasTag,
    getTagWeight,
    hasItem,
    meetsRequirements,
    canAfford,
    
    // Actions - 认证
    setUserFromApi,
    tryRestoreSession,
    logout,
    
    // Actions - 初始化
    initUser,
    saveUser,
    updateNickname,
    
    // 标签系统
    updateTagWeight,
    updateTagWeights,
    decreaseTagWeight,
    decayTagWeights,
    
    // 钱包
    updateWallet,
    pay,
    
    // 物品
    addItem,
    buyItem,
    removeItem,
    
    // 事件
    completeEvent,
    startEvent
  }
})
