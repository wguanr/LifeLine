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

export interface EventChoice {
  id: string
  text: string
  cost?: { time?: number; energy?: number }
  outcome: {
    nextStageId?: string
    isEnding?: boolean
    rewards?: {
      time?: number
      energy?: number
      reputation?: number
      tags?: string[]
      items?: string[]
    }
    penalties?: {
      time?: number
      energy?: number
      reputation?: number
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
  type: 'story' | 'social' | 'challenge' | 'exploration' | 'creation'
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
  visible: boolean
  createdAt: number
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

export type WorldType = 'real' | 'chain'
