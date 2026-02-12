import type { User } from '@/types'

const now = Date.now()

export const mockUsers: User[] = [
  {
    id: 'u_xiaoxue',
    nickname: '学习者小雪',
    avatar: '',
    bio: '每天进步一点点，坚持就是胜利！正在学习编程和设计。',
    clearanceLevel: 2,
    tags: [
      { tagId: 'learner', weight: 45, actionCount: 8, lastActionTime: now - 3600000, source: 'event', acquiredAt: now - 604800000 },
      { tagId: 'persistent', weight: 38, actionCount: 6, lastActionTime: now - 7200000, source: 'event', acquiredAt: now - 432000000 },
      { tagId: 'techie', weight: 25, actionCount: 3, lastActionTime: now - 14400000, source: 'item', acquiredAt: now - 259200000 }
    ],
    wallet: { time: 500, energy: 80, reputation: 120 },
    inventory: [],
    history: { completedEvents: [], currentEvents: [], achievements: ['first_choice'], tagActions: [], archiveAccess: [], choiceHistory: [] },
    createdAt: now - 1209600000,
    lastActiveAt: now - 1800000,
    lastActive: now - 1800000
  },
  {
    id: 'u_ajian',
    nickname: '健身达人阿健',
    avatar: '',
    bio: '生命在于运动！每天坚持锻炼，追求健康生活。',
    clearanceLevel: 3,
    tags: [
      { tagId: 'fitness_lover', weight: 55, actionCount: 12, lastActionTime: now - 1800000, source: 'event', acquiredAt: now - 2592000000 },
      { tagId: 'persistent', weight: 42, actionCount: 9, lastActionTime: now - 3600000, source: 'event', acquiredAt: now - 1728000000 },
      { tagId: 'foodie', weight: 20, actionCount: 3, lastActionTime: now - 86400000, source: 'event', acquiredAt: now - 864000000 }
    ],
    wallet: { time: 300, energy: 95, reputation: 200 },
    inventory: [],
    history: { completedEvents: [], currentEvents: [], achievements: ['fitness_master'], tagActions: [], archiveAccess: [], choiceHistory: [] },
    createdAt: now - 2592000000,
    lastActiveAt: now - 900000,
    lastActive: now - 900000
  },
  {
    id: 'u_xiaowang',
    nickname: '社交达人小王',
    avatar: '',
    bio: '认识新朋友是最快乐的事！喜欢参加各种聚会和活动。',
    clearanceLevel: 2,
    tags: [
      { tagId: 'social_butterfly', weight: 50, actionCount: 10, lastActionTime: now - 7200000, source: 'event', acquiredAt: now - 1728000000 },
      { tagId: 'connector', weight: 35, actionCount: 7, lastActionTime: now - 14400000, source: 'event', acquiredAt: now - 1296000000 },
      { tagId: 'warmhearted', weight: 28, actionCount: 4, lastActionTime: now - 28800000, source: 'event', acquiredAt: now - 864000000 }
    ],
    wallet: { time: 400, energy: 70, reputation: 350 },
    inventory: [],
    history: { completedEvents: [], currentEvents: [], achievements: ['social_star'], tagActions: [], archiveAccess: [], choiceHistory: [] },
    createdAt: now - 1728000000,
    lastActiveAt: now - 3600000,
    lastActive: now - 3600000
  },
  {
    id: 'u_xiaoli',
    nickname: '生活家小李',
    avatar: '',
    bio: '享受生活中的每一个小确幸。热爱旅行、美食和阅读。',
    clearanceLevel: 1,
    tags: [
      { tagId: 'traveler', weight: 40, actionCount: 7, lastActionTime: now - 43200000, source: 'event', acquiredAt: now - 2160000000 },
      { tagId: 'foodie', weight: 35, actionCount: 6, lastActionTime: now - 21600000, source: 'event', acquiredAt: now - 1728000000 },
      { tagId: 'minimalist', weight: 22, actionCount: 3, lastActionTime: now - 86400000, source: 'item', acquiredAt: now - 1296000000 }
    ],
    wallet: { time: 600, energy: 60, reputation: 150 },
    inventory: [],
    history: { completedEvents: [], currentEvents: [], achievements: [], tagActions: [], archiveAccess: [], choiceHistory: [] },
    createdAt: now - 2160000000,
    lastActiveAt: now - 7200000,
    lastActive: now - 7200000
  },
  {
    id: 'u_xiaoxin',
    nickname: '新用户小新',
    avatar: '',
    bio: '刚来到这个世界，一切都很新鲜！',
    clearanceLevel: 0,
    tags: [
      { tagId: 'explorer', weight: 15, actionCount: 2, lastActionTime: now - 3600000, source: 'event', acquiredAt: now - 172800000 }
    ],
    wallet: { time: 200, energy: 90, reputation: 10 },
    inventory: [],
    history: { completedEvents: [], currentEvents: [], achievements: [], tagActions: [], archiveAccess: [], choiceHistory: [] },
    createdAt: now - 172800000,
    lastActiveAt: now - 600000,
    lastActive: now - 600000
  }
]
