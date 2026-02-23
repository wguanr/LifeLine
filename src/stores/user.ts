import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, UserTag, UserItem, UserWallet, TagAction } from '@/types'
import { getTagDefinition } from '@/data/tags'
import { mockItems } from '@/data/items'

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

  /**
   * 标签可信度（credibility）计算
   * 
   * 可信度 = 该标签关联的所有行为的「货币投入价值」之和
   * 货币投入价值 = time + energy * 1.5 + reputation * 0.5
   * 
   * 来源1: tagActions 历史（事件选择产生）
   * 来源2: 用户持有的 item 对应标签（按 item 的 mintCost 计算）
   * 
   * 仅返回可信度 > 50 的标签
   */
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

    // 来源1: tagActions 历史 — 每条行为的 cost 换算为价值
    for (const action of tagActions.value) {
      const entry = ensureTag(action.tagId)
      entry.fromActions += costToValue(action.cost)
    }

    // 来源2: 用户持有的 item — 按 item 定义的 mintCost × 持有数量
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
    
    // 检查标签
    if (requirements.tags?.length) {
      const minWeight = requirements.minTagWeight ?? 0
      if (!requirements.tags.every(tagId => getTagWeight(tagId) >= minWeight)) {
        return false
      }
    }
    
    // 检查物品
    if (requirements.items?.length) {
      if (!requirements.items.every(itemId => hasItem(itemId))) {
        return false
      }
    }
    
    // 检查时间
    if (requirements.minTime && wallet.value.time < requirements.minTime) {
      return false
    }
    
    // 检查社交积分
    if (requirements.minReputation && wallet.value.reputation < requirements.minReputation) {
      return false
    }
    
    return true
  }
  
  // 检查用户是否能支付费用（时间和精力）
  const canAfford = (cost: { time?: number; energy?: number }) => {
    if (!user.value) return false
    if (cost.time && wallet.value.time < cost.time) return false
    if (cost.energy && wallet.value.energy < cost.energy) return false
    return true
  }
  
  // ==================== Actions ====================
  
  // 版本号 - 修改此值会强制重置用户数据
  const DATA_VERSION = 'v3_max_wallet'
  
  // 初始化用户
  const initUser = () => {
    // 检查版本号，如果版本不匹配则清除旧数据
    const storedVersion = uni.getStorageSync('choser_data_version')
    if (storedVersion !== DATA_VERSION) {
      // 清除旧数据
      uni.removeStorageSync('choser_user_v2')
      uni.setStorageSync('choser_data_version', DATA_VERSION)
      createNewUser()
      return
    }
    
    const stored = uni.getStorageSync('choser_user_v2')
    if (stored) {
      try {
        user.value = JSON.parse(stored)
        // 强制更新钱包数据为最大值
        if (user.value) {
          user.value.wallet = {
            time: 9999,
            energy: 9999,
            reputation: 9999
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
  
  // 创建新用户（带丰富的初始数据）
  const createNewUser = () => {
    const id = 'U' + Date.now().toString(36).toUpperCase()
    const now = Date.now()
    
    // 初始标签数据
    const initialTags: UserTag[] = [
      {
        tagId: 'traveler',
        weight: 35,
        actionCount: 5,
        lastActionTime: now - 2 * 60 * 60 * 1000,
        source: 'event',
        acquiredAt: now - 7 * 24 * 60 * 60 * 1000
      },
      {
        tagId: 'explorer',
        weight: 28,
        actionCount: 4,
        lastActionTime: now - 5 * 60 * 60 * 1000,
        source: 'event',
        acquiredAt: now - 5 * 24 * 60 * 60 * 1000
      },
      {
        tagId: 'minimalist',
        weight: 22,
        actionCount: 3,
        lastActionTime: now - 12 * 60 * 60 * 1000,
        source: 'item',
        acquiredAt: now - 3 * 24 * 60 * 60 * 1000
      },
      {
        tagId: 'foodie',
        weight: 18,
        actionCount: 2,
        lastActionTime: now - 24 * 60 * 60 * 1000,
        source: 'event',
        acquiredAt: now - 2 * 24 * 60 * 60 * 1000
      },
      {
        tagId: 'helpful',
        weight: 15,
        actionCount: 2,
        lastActionTime: now - 36 * 60 * 60 * 1000,
        source: 'event',
        acquiredAt: now - 4 * 24 * 60 * 60 * 1000
      },
      {
        tagId: 'learner',
        weight: 12,
        actionCount: 1,
        lastActionTime: now - 48 * 60 * 60 * 1000,
        source: 'event',
        acquiredAt: now - 6 * 24 * 60 * 60 * 1000
      }
    ]
    
    // 初始背包物品
    const initialInventory: UserItem[] = [
      {
        itemId: 'item_travel_bag',
        quantity: 1,
        acquiredAt: now - 5 * 24 * 60 * 60 * 1000,
        source: 'evt_travel_plan'
      },
      {
        itemId: 'item_coffee_coupon',
        quantity: 3,
        acquiredAt: now - 2 * 24 * 60 * 60 * 1000,
        source: 'evt_coffee_encounter'
      },
      {
        itemId: 'item_takeout_coupon',
        quantity: 2,
        acquiredAt: now - 1 * 24 * 60 * 60 * 1000,
        source: 'daily_reward'
      },
      {
        itemId: 'item_yoga_mat',
        quantity: 1,
        acquiredAt: now - 3 * 24 * 60 * 60 * 1000,
        source: 'evt_health_challenge'
      },
      {
        itemId: 'item_notebook',
        quantity: 1,
        acquiredAt: now - 4 * 24 * 60 * 60 * 1000,
        source: 'evt_skill_learning'
      }
    ]
    
    // 初始行为记录
    const initialTagActions: TagAction[] = [
      {
        id: 'A1',
        tagId: 'traveler',
        actionType: 'event_choice',
        cost: { time: 60, energy: 20 },
        weightChange: 12,
        timestamp: now - 2 * 60 * 60 * 1000,
        sourceId: 'evt_travel_plan',
        sourceName: '周末旅行计划'
      },
      {
        id: 'A2',
        tagId: 'explorer',
        actionType: 'event_choice',
        cost: { time: 30, energy: 15 },
        weightChange: 9,
        timestamp: now - 5 * 60 * 60 * 1000,
        sourceId: 'evt_new_place',
        sourceName: '探索新地方'
      },
      {
        id: 'A3',
        tagId: 'minimalist',
        actionType: 'item_mint',
        cost: { time: 15 },
        weightChange: 7,
        timestamp: now - 12 * 60 * 60 * 1000,
        sourceId: 'item_notebook',
        sourceName: '简约笔记本'
      },
      {
        id: 'A4',
        tagId: 'foodie',
        actionType: 'event_choice',
        cost: { time: 45, energy: 10 },
        weightChange: 8,
        timestamp: now - 24 * 60 * 60 * 1000,
        sourceId: 'evt_food_explore',
        sourceName: '美食探店'
      },
      {
        id: 'A5',
        tagId: 'helpful',
        actionType: 'event_choice',
        cost: { energy: 25 },
        weightChange: 10,
        timestamp: now - 36 * 60 * 60 * 1000,
        sourceId: 'evt_subway_seat',
        sourceName: '地铁让座'
      },
      {
        id: 'A6',
        tagId: 'learner',
        actionType: 'event_choice',
        cost: { time: 90, energy: 30 },
        weightChange: 6,
        timestamp: now - 48 * 60 * 60 * 1000,
        sourceId: 'evt_skill_learning',
        sourceName: '新技能学习'
      },
      {
        id: 'A7',
        tagId: 'traveler',
        actionType: 'event_choice',
        cost: { time: 120, energy: 40 },
        weightChange: 15,
        timestamp: now - 72 * 60 * 60 * 1000,
        sourceId: 'evt_weekend_trip',
        sourceName: '周末短途游'
      },
      {
        id: 'A8',
        tagId: 'explorer',
        actionType: 'item_mint',
        cost: { time: 20 },
        weightChange: 5,
        timestamp: now - 96 * 60 * 60 * 1000,
        sourceId: 'item_travel_bag',
        sourceName: '旅行背包'
      }
    ]
    
    user.value = {
      id,
      nickname: '探索者' + id.slice(-4),
      avatar: '',
      bio: '热爱生活，享受每一次新的体验。在这个世界里寻找属于自己的故事。',
      clearanceLevel: 2 as const,  // 初始密级：秘密
      tags: initialTags,
      wallet: {
        time: 9999,      // 初始可支配时间（分钟）- 拉满
        energy: 9999,    // 初始精力值 - 拉满
        reputation: 9999 // 初始社交积分 - 拉满
      },
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
          { eventId: 'evt_food_explore', choiceId: 'try_new', timestamp: now - 24 * 60 * 60 * 1000 }
        ]
      },
      createdAt: now - 14 * 24 * 60 * 60 * 1000, // 14天前注册
      lastActiveAt: now
    }
    saveUser()
  }
  
  // 保存用户数据
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
    }
  }
  
  // ==================== 标签可信度系统 ====================
  
  /**
   * 计算权重增量（考虑衰减）
   * 公式：增量 = 基础权重 × (1 / (1 + ln(1 + 行为次数)))
   */
  const calculateWeightIncrement = (baseWeight: number, actionCount: number): number => {
    const decayFactor = 1 / (1 + Math.log(1 + actionCount))
    return Math.round(baseWeight * decayFactor * 10) / 10
  }
  
  /**
   * 更新标签权重（核心方法）
   * @param tagId 标签ID
   * @param baseWeight 基础权重变化
   * @param source 来源类型
   * @param sourceId 来源ID
   * @param sourceName 来源名称
   * @param cost 付费成本（影响权重计算）
   */
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
    
    // 如果标签不存在，创建新标签
    if (!tag) {
      tag = {
        tagId,
        weight: 0,
        actionCount: 0,
        lastActionTime: now,
        source,
        acquiredAt: now
      }
      user.value.tags.push(tag)
    }
    
    // 计算实际权重增量
    let weightIncrement = calculateWeightIncrement(baseWeight, tag.actionCount)
    
    // 付费成本加成：消耗越多，权重增加越多
    if (cost) {
      const costBonus = ((cost.time ?? 0) / 30 + (cost.energy ?? 0) / 20) * 0.5
      weightIncrement += costBonus
    }
    
    // 一致性奖励：连续3次相同标签行为
    if (tag.actionCount > 0 && tag.actionCount % 3 === 2) {
      weightIncrement += 2
    }
    
    // 更新标签
    tag.weight = Math.max(0, Math.min(100, tag.weight + weightIncrement))
    tag.actionCount += 1
    tag.lastActionTime = now
    
    // 记录行为
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
    
    // 限制行为记录数量（保留最近100条）
    if (user.value.history.tagActions.length > 100) {
      user.value.history.tagActions = user.value.history.tagActions.slice(-100)
    }
    
    saveUser()
  }
  
  /**
   * 批量更新标签权重
   */
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
  
  /**
   * 减少标签权重（惩罚）
   */
  const decreaseTagWeight = (tagId: string, amount: number) => {
    if (!user.value) return
    const tag = user.value.tags.find(t => t.tagId === tagId)
    if (tag) {
      tag.weight = Math.max(0, tag.weight - amount)
      saveUser()
    }
  }
  
  /**
   * 标签权重衰减（定期调用）
   * 30天未有相关行为，权重衰减10%
   */
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
  
  // 更新钱包（时间、精力、社交积分）
  const updateWallet = (changes: Partial<UserWallet>) => {
    if (user.value) {
      if (changes.time !== undefined) {
        user.value.wallet.time = Math.max(0, user.value.wallet.time + changes.time)
      }
      if (changes.energy !== undefined) {
        user.value.wallet.energy = Math.max(0, Math.min(100, user.value.wallet.energy + changes.energy))
      }
      if (changes.reputation !== undefined) {
        user.value.wallet.reputation = Math.max(0, user.value.wallet.reputation + changes.reputation)
      }
      saveUser()
    }
  }
  
  // 支付费用（时间、精力、社交积分）
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
  
  // 添加物品
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
  
    /**
   * 买入物品（核心交互）
   * 扣除 mintCost，添加物品到背包，记录标签行为
   * 支持多次购买，每次都产生标签贡献
   */
  const buyItem = (itemDef: { id: string; name: string; mintCost: { time?: number; energy?: number }; tags: string[] }) => {
    if (!user.value) return false
    // 检查是否能支付
    if (!canAfford(itemDef.mintCost)) {
      return false
    }
    // 扣除货币
    pay(itemDef.mintCost)
    // 添加物品
    addItem({
      itemId: itemDef.id,
      quantity: 1,
      acquiredAt: Date.now(),
      source: 'buy_' + itemDef.id
    })
    // 记录标签行为（每次买入都产生标签贡献，类似事件参与）
    for (const tagId of itemDef.tags) {
      updateTagWeight(tagId, 5, 'item', itemDef.id, itemDef.name, itemDef.mintCost)
    }
    return true
  }

    // 移除物品
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
  
  // 记录完成的事件
  const completeEvent = (eventId: string) => {
    if (user.value) {
      if (!user.value.history.completedEvents.includes(eventId)) {
        user.value.history.completedEvents.push(eventId)
      }
      user.value.history.currentEvents = user.value.history.currentEvents.filter(id => id !== eventId)
      saveUser()
    }
  }
  
  // 开始事件
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
    
    // Actions
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
