/**
 * 公共格式化工具函数
 * 统一管理跨组件复用的格式化、映射、辅助方法
 */

import { getTagDefinition } from '@/data/tags'

// ==================== 数字格式化 ====================

/** 大数字缩写（万/亿） */
export const formatNumber = (n: number): string => {
  if (n >= 9950_0000) return (n / 1e8).toFixed(1).replace(/\.0$/, '') + '亿'
  if (n >= 1e4) return (n / 1e4).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '') + '万'
  return n.toString()
}

// ==================== 时间格式化 ====================

/** 相对时间文本（如"刚刚"、"3分钟前"） */
export const formatRelativeTime = (timestamp: number | undefined): string => {
  if (!timestamp) return '未知'
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  return '一周前'
}

/** 简短的选择时间格式化 */
export const formatChoiceTime = (timestamp: number): string => {
  if (!timestamp) return ''
  const diff = Date.now() - timestamp
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  const d = new Date(timestamp)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// ==================== 标签工具 ====================

/** 获取标签显示名称 */
export const getTagName = (tagId: string): string => {
  const def = getTagDefinition(tagId)
  return def?.name || tagId
}

/** 获取标签图标 */
export const getTagIcon = (tagId: string): string => {
  const def = getTagDefinition(tagId)
  return def?.icon || '🏷️'
}

// ==================== 稀有度 ====================

const RARITY_LABELS: Record<string, string> = {
  common: '普通',
  uncommon: '稀有',
  rare: '精良',
  epic: '史诗',
  legendary: '传说'
}

/** 稀有度中文标签 */
export const getRarityLabel = (rarity: string): string => {
  return RARITY_LABELS[rarity] || rarity
}

/** 稀有度排序权重 */
export const RARITY_ORDER: Record<string, number> = {
  legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1
}

// ==================== 事件类型/状态 ====================

const EVENT_TYPE_LABELS: Record<string, string> = {
  story: '生活', challenge: '挑战', craft: '制作',
  social: '社交', exploration: '探索', creation: '创造'
}

const EVENT_TYPE_ICONS: Record<string, string> = {
  story: '📖', challenge: '💼', craft: '🎯',
  social: '💬', exploration: '🔍', creation: '✨'
}

const EVENT_STATUS_LABELS: Record<string, string> = {
  upcoming: '即将开始', active: '进行中', ended: '已结束', draft: '草稿'
}

export const getEventTypeLabel = (type: string): string => EVENT_TYPE_LABELS[type] || '事件'
export const getEventTypeIcon = (type: string): string => EVENT_TYPE_ICONS[type] || '📅'
export const getEventStatusLabel = (status: string): string => EVENT_STATUS_LABELS[status] || status

// ==================== 效果图标 ====================

const EFFECT_ICONS: Record<string, string> = {
  energy: '⚡', time: '⏰', reputation: '⭐', attribute: '📊', unlock: '🔓'
}

export const getEffectIcon = (type: string): string => EFFECT_ICONS[type] || '✨'

// ==================== 成就定义 ====================

export const ACHIEVEMENT_DEFS: Record<string, { icon: string; name: string }> = {
  first_choice: { icon: '🎯', name: '初次抉择' },
  bookworm: { icon: '📖', name: '书虫' },
  early_adopter: { icon: '🌅', name: '先行者' },
  fitness_master: { icon: '🏋️', name: '健身大师' },
  early_bird: { icon: '🐦', name: '早起鸟' },
  iron_will: { icon: '🔥', name: '钢铁意志' },
  streak_7: { icon: '📅', name: '连续7天' },
  social_star: { icon: '⭐', name: '社交之星' },
  party_king: { icon: '👑', name: '派对之王' },
  wanderer: { icon: '🗺️', name: '漫游者' },
  collector: { icon: '💎', name: '收藏家' }
}

export const getAchievementIcon = (id: string): string => ACHIEVEMENT_DEFS[id]?.icon || '🏅'
export const getAchievementName = (id: string): string => ACHIEVEMENT_DEFS[id]?.name || id

// ==================== 标签格式标准化 ====================

/** 统一标签格式：兼容 string[], {id,value}[], {tagId: weight} 三种格式 */
export const normalizeTagIds = (tags: any): string[] => {
  if (!tags) return []
  if (Array.isArray(tags)) {
    return tags.map((t: any) => typeof t === 'string' ? t : t.id).filter(Boolean)
  }
  if (typeof tags === 'object') {
    return Object.keys(tags)
  }
  return []
}
