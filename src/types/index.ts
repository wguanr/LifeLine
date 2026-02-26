// ==================== 用户相关 ====================

export interface UserWallet {
  time: number
  energy: number
  reputation: number
}

export interface UserTag {
  tagId: string
  weight: number
  actionCount: number
  lastActionTime: number
  source: string
  acquiredAt: number
}

export interface UserItem {
  itemId: string
  quantity: number
  acquiredAt: number
  source: string
}

export interface TagAction {
  id: string
  tagId: string
  actionType: 'event_choice' | 'item_mint' | 'daily_check'
  cost: { time?: number; energy?: number; reputation?: number }
  weightChange: number
  timestamp: number
  sourceId: string
  sourceName: string
}

export interface User {
  id: string
  nickname: string
  avatar: string
  bio: string
  clearanceLevel: 0 | 1 | 2 | 3 | 4 | 5
  tags: UserTag[]
  wallet: UserWallet
  inventory: UserItem[]
  history: {
    completedEvents: string[]
    currentEvents: string[]
    achievements: string[]
    tagActions: TagAction[]
    archiveAccess: string[]
    choiceHistory: Array<{ eventId: string; choiceId: string; timestamp: number }>
  }
  createdAt: number
  lastActiveAt: number
  lastActive?: number
}

// ==================== 事件相关 ====================

export interface ClaimableItem {
  /** 物品ID */
  itemId: string
  /** 领取提示文字 */
  promptText?: string
  /** 领取数量，默认1 */
  quantity?: number
  /** 是否必须领取（false则可跳过），默认false */
  required?: boolean
}

export interface EventChoice {
  id: string
  text: string
  cost?: { time?: number; energy?: number }
  /** 隐藏选项：需要持有特定物品才可见 */
  requiresItems?: string[]
  /** 是否为隐藏选项（默认false，设为true时需满足requiresItems条件才显示） */
  hidden?: boolean
  /** 隐藏选项解锁时的提示文字 */
  hiddenHint?: string
  outcome: {
    nextStageId?: string
    isEnding?: boolean
    /** 阶段结束后可领取的物品（弹出领取界面） */
    claimableItems?: ClaimableItem[]
    rewards?: {
      time?: number
      energy?: number
      reputation?: number
      tags?: Record<string, number> | string[]
      items?: string[]
    }
    penalties?: {
      time?: number
      energy?: number
      reputation?: number
      tags?: Record<string, number>
    }
    resultText: string
  }
}

export interface EventStage {
  id: string
  title: string
  description: string
  choices: EventChoice[]
}

export interface GameEvent {
  id: string
  title: string
  description: string
  cover: string
  type: 'story' | 'social' | 'challenge' | 'craft' | 'exploration' | 'creation'
  status: 'active' | 'upcoming' | 'ended' | 'draft'
  requirements: {
    tags?: string[]
    minTagWeight?: number
    items?: string[]
    minTime?: number
    minReputation?: number
  }
  entryFee: { time?: number; energy?: number }
  stages: EventStage[]
  participantCount: number
  createdAt: number
}

// ==================== 物品相关 ====================

export interface Item {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  category: 'consumable' | 'equipment' | 'collectible' | 'material'
  mintCost: { time?: number; energy?: number }
  effects: Array<{
    type: string
    value: number
    description: string
  }>
  tags: string[]
  /** 展示在卡片上的特性标签（3-5个） */
  featureTags: string[]
  /** 物品的事件故事 */
  story: string
  visible: boolean
  createdAt: number
  /** 是否可叠加购买（默认true），为false时已拥有则不可再买 */
  stackable?: boolean
  /** 最大叠加数量（仅stackable时有效） */
  maxStack?: number
  /** 铸造上限 */
  maxMint?: number
  /** 已铸造数量 */
  mintedCount?: number
}

// ==================== 卡片相关 ====================

export type CardType = 'event' | 'item' | 'user'

export interface Card {
  id: string
  type: CardType
  data: GameEvent | Item | User
  weight: number
}

// ==================== 标签定义 ====================

export interface TagDefinition {
  id: string
  name: string
  icon: string
  description: string
  category: 'life' | 'social' | 'work' | 'growth'
}

// ==================== 世界相关 ====================

export type EventOutcome = EventChoice['outcome']

export type WorldType = 'real' | 'chain'
