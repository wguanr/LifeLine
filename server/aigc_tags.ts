/**
 * AIGC 建议的新标签定义
 * 用于扩展用户画像维度以覆盖现实事件主题
 * Generated at: 2026-02-24 05:17:40
 */

import type { TagDefinition } from '@/types'

export const aigcTagDefinitions: TagDefinition[] = [
  {
    "id": "trade_war_aware",
    "name": "贸易战关注者",
    "icon": "🌐",
    "description": "关注全球贸易战及其影响，理解国际经济形势变化",
    "category": "growth"
  },
  {
    "id": "ai_enthusiast",
    "name": "人工智能爱好者",
    "icon": "🤖",
    "description": "对人工智能技术及其发展充满热情和关注",
    "category": "work"
  },
  {
    "id": "tech_innovator",
    "name": "技术创新者",
    "icon": "🚀",
    "description": "积极推动和应用前沿技术创新",
    "category": "work"
  },
  {
    "id": "conflict_aware",
    "name": "冲突关注者",
    "icon": "⚔️",
    "description": "关注战争冲突及其社会影响的用户",
    "category": "social"
  },
  {
    "id": "religious_leader",
    "name": "宗教领袖",
    "icon": "⛪",
    "description": "关注宗教事务，具备宗教领袖特质的用户",
    "category": "social"
  },
  {
    "id": "conflict_affected",
    "name": "冲突受影响者",
    "icon": "⚔️",
    "description": "经历或关注军事冲突和战争事件的用户",
    "category": "social"
  }
]

export default aigcTagDefinitions
