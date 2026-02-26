import type { TagDefinition } from '@/types'
import { aigcTagDefinitions } from './aigc_tags'

const baseTagDefinitions: TagDefinition[] = [
  // 生活类
  { id: 'traveler', name: '旅行者', icon: '✈️', description: '热爱探索新地方', category: 'life' },
  { id: 'explorer', name: '探索者', icon: '🧭', description: '对未知充满好奇', category: 'life' },
  { id: 'minimalist', name: '极简主义', icon: '🎯', description: '追求简约生活', category: 'life' },
  { id: 'foodie', name: '美食家', icon: '🍜', description: '热爱美食', category: 'life' },
  { id: 'fitness_lover', name: '健身达人', icon: '💪', description: '热爱运动健身', category: 'life' },
  { id: 'adventurous', name: '冒险家', icon: '🏄', description: '勇于尝试新事物', category: 'life' },
  { id: 'reader', name: '阅读者', icon: '📖', description: '热爱阅读', category: 'life' },
  { id: 'animal_lover', name: '动物爱好者', icon: '🐾', description: '喜爱动物', category: 'life' },
  { id: 'sentimental', name: '感性', icon: '🌸', description: '感情丰富细腻', category: 'life' },

  // 社交类
  { id: 'social_butterfly', name: '社交达人', icon: '🦋', description: '善于社交', category: 'social' },
  { id: 'connector', name: '连接者', icon: '🔗', description: '善于建立人脉', category: 'social' },
  { id: 'kindhearted', name: '善良', icon: '💖', description: '乐于助人', category: 'social' },
  { id: 'warmhearted', name: '热心', icon: '🔥', description: '热情待人', category: 'social' },
  { id: 'helpful', name: '乐于助人', icon: '🤝', description: '喜欢帮助他人', category: 'social' },
  { id: 'generous', name: '慷慨', icon: '🎁', description: '乐于分享和给予', category: 'social' },
  { id: 'closer', name: '亲近者', icon: '💞', description: '善于拉近人际距离', category: 'social' },
  { id: 'family_first', name: '家庭至上', icon: '🏠', description: '重视家庭关系', category: 'social' },
  { id: 'open_minded', name: '开放包容', icon: '🌍', description: '包容不同观点', category: 'social' },

  // 工作类
  { id: 'workaholic', name: '工作狂', icon: '💼', description: '工作至上', category: 'work' },
  { id: 'work_life_balance', name: '平衡达人', icon: '⚖️', description: '工作生活平衡', category: 'work' },
  { id: 'negotiator', name: '谈判专家', icon: '🤝', description: '善于协商', category: 'work' },
  { id: 'techie', name: '技术控', icon: '💻', description: '热爱技术', category: 'work' },
  { id: 'reliable', name: '可靠', icon: '🛡️', description: '值得信赖', category: 'work' },
  { id: 'improviser', name: '即兴发挥', icon: '🎭', description: '善于随机应变', category: 'work' },

  // 成长类
  { id: 'learner', name: '学习者', icon: '📚', description: '热爱学习', category: 'growth' },
  { id: 'persistent', name: '坚持者', icon: '🏔️', description: '坚持不懈', category: 'growth' },
  { id: 'creative', name: '创造者', icon: '🎨', description: '富有创造力', category: 'growth' },
  { id: 'brave', name: '勇敢', icon: '🦁', description: '面对困难不退缩', category: 'growth' },
  { id: 'curious', name: '好奇心', icon: '🔍', description: '对世界充满好奇', category: 'growth' },
  { id: 'resilient', name: '坚韧', icon: '💎', description: '逆境中不屈不挠', category: 'growth' },
  { id: 'prepared', name: '有备无患', icon: '🎒', description: '做事有计划有准备', category: 'growth' },
  { id: 'cautious', name: '谨慎', icon: '🔒', description: '做事小心谨慎', category: 'growth' },
  { id: 'skeptic', name: '质疑者', icon: '🧐', description: '善于独立思考', category: 'growth' }
]

// 合并基础标签和AIGC标签
export const tagDefinitions: TagDefinition[] = [...baseTagDefinitions, ...aigcTagDefinitions]

export const getTagDefinition = (tagId: string): TagDefinition | undefined => {
  return tagDefinitions.find(t => t.id === tagId)
}
