import type { TagDefinition } from '@/types'

export const tagDefinitions: TagDefinition[] = [
  // 生活类
  { id: 'traveler', name: '旅行者', icon: '✈️', description: '热爱探索新地方', category: 'life' },
  { id: 'explorer', name: '探索者', icon: '🧭', description: '对未知充满好奇', category: 'life' },
  { id: 'minimalist', name: '极简主义', icon: '🎯', description: '追求简约生活', category: 'life' },
  { id: 'foodie', name: '美食家', icon: '🍜', description: '热爱美食', category: 'life' },
  { id: 'fitness_lover', name: '健身达人', icon: '💪', description: '热爱运动健身', category: 'life' },

  // 社交类
  { id: 'social_butterfly', name: '社交达人', icon: '🦋', description: '善于社交', category: 'social' },
  { id: 'connector', name: '连接者', icon: '🔗', description: '善于建立人脉', category: 'social' },
  { id: 'kindhearted', name: '善良', icon: '💖', description: '乐于助人', category: 'social' },
  { id: 'warmhearted', name: '热心', icon: '🔥', description: '热情待人', category: 'social' },
  { id: 'helpful', name: '乐于助人', icon: '🤝', description: '喜欢帮助他人', category: 'social' },

  // 工作类
  { id: 'workaholic', name: '工作狂', icon: '💼', description: '工作至上', category: 'work' },
  { id: 'work_life_balance', name: '平衡达人', icon: '⚖️', description: '工作生活平衡', category: 'work' },
  { id: 'negotiator', name: '谈判专家', icon: '🤝', description: '善于协商', category: 'work' },
  { id: 'techie', name: '技术控', icon: '💻', description: '热爱技术', category: 'work' },

  // 成长类
  { id: 'learner', name: '学习者', icon: '📚', description: '热爱学习', category: 'growth' },
  { id: 'persistent', name: '坚持者', icon: '🏔️', description: '坚持不懈', category: 'growth' },
  { id: 'creative', name: '创造者', icon: '🎨', description: '富有创造力', category: 'growth' }
]

export const getTagDefinition = (tagId: string): TagDefinition | undefined => {
  return tagDefinitions.find(t => t.id === tagId)
}
