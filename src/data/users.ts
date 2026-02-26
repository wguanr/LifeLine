import type { User } from '@/types'

const now = Date.now()

export const mockUsers: User[] = [
  {
    id: 'u_xiaoxue',
    nickname: '学习者小雪',
    avatar: '📚',
    bio: '每天进步一点点，坚持就是胜利！正在学习编程和设计。',
    clearanceLevel: 2,
    tags: [
      { tagId: 'learner', weight: 45, actionCount: 8, lastActionTime: now - 3600000, source: 'event', acquiredAt: now - 604800000 },
      { tagId: 'persistent', weight: 38, actionCount: 6, lastActionTime: now - 7200000, source: 'event', acquiredAt: now - 432000000 },
      { tagId: 'techie', weight: 25, actionCount: 3, lastActionTime: now - 14400000, source: 'item', acquiredAt: now - 259200000 }
    ],
    wallet: { time: 500, energy: 80, reputation: 120 },
    inventory: [
      { itemId: 'notebook', quantity: 1, acquiredAt: now - 86400000, source: 'evt_study' },
      { itemId: 'coffee_coupon', quantity: 2, acquiredAt: now - 172800000, source: 'evt_cafe' }
    ],
    history: {
      completedEvents: ['evt_study_plan', 'evt_library'],
      currentEvents: ['evt_midnight_delivery'],
      achievements: ['first_choice', 'bookworm'],
      tagActions: [],
      archiveAccess: [],
      choiceHistory: [
        { eventId: 'evt_study_plan', choiceId: 'study_hard', timestamp: now - 86400000 },
        { eventId: 'evt_library', choiceId: 'borrow_book', timestamp: now - 43200000 }
      ]
    },
    createdAt: now - 1209600000,
    lastActiveAt: now - 1800000,
    lastActive: now - 1800000
  },
  {
    id: 'u_ajian',
    nickname: '健身达人阿健',
    avatar: '💪',
    bio: '生命在于运动！每天坚持锻炼，追求健康生活。',
    clearanceLevel: 3,
    tags: [
      { tagId: 'fitness_lover', weight: 55, actionCount: 12, lastActionTime: now - 1800000, source: 'event', acquiredAt: now - 2592000000 },
      { tagId: 'persistent', weight: 42, actionCount: 9, lastActionTime: now - 3600000, source: 'event', acquiredAt: now - 1728000000 },
      { tagId: 'foodie', weight: 20, actionCount: 3, lastActionTime: now - 86400000, source: 'event', acquiredAt: now - 864000000 }
    ],
    wallet: { time: 300, energy: 95, reputation: 200 },
    inventory: [
      { itemId: 'yoga_mat', quantity: 1, acquiredAt: now - 604800000, source: 'evt_fitness' },
      { itemId: 'protein_shake', quantity: 3, acquiredAt: now - 259200000, source: 'evt_gym' }
    ],
    history: {
      completedEvents: ['evt_morning_run', 'evt_gym_challenge', 'evt_diet_plan'],
      currentEvents: [],
      achievements: ['fitness_master', 'early_bird'],
      tagActions: [],
      archiveAccess: [],
      choiceHistory: [
        { eventId: 'evt_morning_run', choiceId: 'run_5km', timestamp: now - 172800000 },
        { eventId: 'evt_gym_challenge', choiceId: 'heavy_lift', timestamp: now - 86400000 },
        { eventId: 'evt_diet_plan', choiceId: 'healthy_meal', timestamp: now - 43200000 }
      ]
    },
    createdAt: now - 2592000000,
    lastActiveAt: now - 900000,
    lastActive: now - 900000
  },
  {
    id: 'u_xiaowang',
    nickname: '社交达人小王',
    avatar: '🎭',
    bio: '认识新朋友是最快乐的事！喜欢参加各种聚会和活动。',
    clearanceLevel: 2,
    tags: [
      { tagId: 'social_butterfly', weight: 50, actionCount: 10, lastActionTime: now - 7200000, source: 'event', acquiredAt: now - 1728000000 },
      { tagId: 'connector', weight: 35, actionCount: 7, lastActionTime: now - 14400000, source: 'event', acquiredAt: now - 1296000000 },
      { tagId: 'warmhearted', weight: 28, actionCount: 4, lastActionTime: now - 28800000, source: 'event', acquiredAt: now - 864000000 }
    ],
    wallet: { time: 400, energy: 70, reputation: 350 },
    inventory: [
      { itemId: 'party_hat', quantity: 1, acquiredAt: now - 432000000, source: 'evt_party' }
    ],
    history: {
      completedEvents: ['evt_party_night', 'evt_team_building', 'evt_karaoke'],
      currentEvents: ['evt_midnight_delivery'],
      achievements: ['social_star', 'party_king'],
      tagActions: [],
      archiveAccess: [],
      choiceHistory: [
        { eventId: 'evt_party_night', choiceId: 'dance_floor', timestamp: now - 259200000 },
        { eventId: 'evt_team_building', choiceId: 'lead_team', timestamp: now - 172800000 },
        { eventId: 'evt_karaoke', choiceId: 'sing_duet', timestamp: now - 86400000 }
      ]
    },
    createdAt: now - 1728000000,
    lastActiveAt: now - 3600000,
    lastActive: now - 3600000
  },
  {
    id: 'u_xiaoli',
    nickname: '生活家小李',
    avatar: '🌿',
    bio: '享受生活中的每一个小确幸。热爱旅行、美食和阅读。',
    clearanceLevel: 1,
    tags: [
      { tagId: 'traveler', weight: 40, actionCount: 7, lastActionTime: now - 43200000, source: 'event', acquiredAt: now - 2160000000 },
      { tagId: 'foodie', weight: 35, actionCount: 6, lastActionTime: now - 21600000, source: 'event', acquiredAt: now - 1728000000 },
      { tagId: 'minimalist', weight: 22, actionCount: 3, lastActionTime: now - 86400000, source: 'item', acquiredAt: now - 1296000000 }
    ],
    wallet: { time: 600, energy: 60, reputation: 150 },
    inventory: [
      { itemId: 'travel_backpack', quantity: 1, acquiredAt: now - 864000000, source: 'evt_travel' },
      { itemId: 'coffee_coupon', quantity: 1, acquiredAt: now - 432000000, source: 'evt_cafe' },
      { itemId: 'takeout_coupon', quantity: 2, acquiredAt: now - 172800000, source: 'evt_food' }
    ],
    history: {
      completedEvents: ['evt_weekend_trip', 'evt_food_tour'],
      currentEvents: [],
      achievements: ['wanderer'],
      tagActions: [],
      archiveAccess: [],
      choiceHistory: [
        { eventId: 'evt_weekend_trip', choiceId: 'explore_nature', timestamp: now - 604800000 },
        { eventId: 'evt_food_tour', choiceId: 'try_local', timestamp: now - 259200000 }
      ]
    },
    createdAt: now - 2160000000,
    lastActiveAt: now - 7200000,
    lastActive: now - 7200000
  },
  {
    id: 'u_xiaoxin',
    nickname: '新用户小新',
    avatar: '🌱',
    bio: '刚来到这个世界，一切都很新鲜！',
    clearanceLevel: 0,
    tags: [
      { tagId: 'explorer', weight: 15, actionCount: 2, lastActionTime: now - 3600000, source: 'event', acquiredAt: now - 172800000 }
    ],
    wallet: { time: 200, energy: 90, reputation: 10 },
    inventory: [],
    history: {
      completedEvents: [],
      currentEvents: ['evt_midnight_delivery'],
      achievements: [],
      tagActions: [],
      archiveAccess: [],
      choiceHistory: []
    },
    createdAt: now - 172800000,
    lastActiveAt: now - 600000,
    lastActive: now - 600000
  }
]
