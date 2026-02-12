import type { Item } from '@/types'

export const mockItems: Item[] = [
  {
    id: 'item_coffee_coupon',
    name: '咖啡券',
    description: '一张精品咖啡兑换券，可以在任意咖啡店使用。',
    icon: '☕',
    rarity: 'common',
    category: 'consumable',
    mintCost: { time: 10 },
    effects: [{ type: 'energy', value: 10, description: '恢复10点精力' }],
    tags: ['foodie'],
    visible: true,
    createdAt: Date.now() - 86400000
  },
  {
    id: 'item_takeout_coupon',
    name: '外卖红包',
    description: '一个外卖平台的优惠红包，点外卖时可以抵扣。',
    icon: '🎁',
    rarity: 'common',
    category: 'consumable',
    mintCost: { time: 5 },
    effects: [{ type: 'energy', value: 5, description: '恢复5点精力' }],
    tags: ['foodie'],
    visible: true,
    createdAt: Date.now() - 172800000
  },
  {
    id: 'item_yoga_mat',
    name: '瑜伽垫',
    description: '一块高品质瑜伽垫，适合在家锻炼使用。',
    icon: '🧘',
    rarity: 'uncommon',
    category: 'equipment',
    mintCost: { time: 30, energy: 10 },
    effects: [{ type: 'energy', value: 15, description: '每日恢复15点精力' }],
    tags: ['fitness_lover'],
    visible: true,
    createdAt: Date.now() - 259200000
  },
  {
    id: 'item_notebook',
    name: '简约笔记本',
    description: '一本设计精美的笔记本，适合记录灵感和计划。',
    icon: '📓',
    rarity: 'common',
    category: 'equipment',
    mintCost: { time: 15 },
    effects: [{ type: 'time', value: 20, description: '提升时间管理效率' }],
    tags: ['minimalist', 'learner'],
    visible: true,
    createdAt: Date.now() - 345600000
  },
  {
    id: 'item_travel_bag',
    name: '旅行背包',
    description: '一个轻便耐用的旅行背包，适合短途旅行。',
    icon: '🎒',
    rarity: 'uncommon',
    category: 'equipment',
    mintCost: { time: 45, energy: 15 },
    effects: [{ type: 'time', value: 30, description: '旅行时节省时间' }],
    tags: ['traveler', 'explorer'],
    visible: true,
    createdAt: Date.now() - 432000000
  },
  {
    id: 'item_activity_coupon',
    name: '亲子活动券',
    description: '一张亲子教育机构的活动体验券。',
    icon: '🎪',
    rarity: 'rare',
    category: 'consumable',
    mintCost: { time: 120, energy: 20 },
    effects: [{ type: 'reputation', value: 25, description: '获得25社交积分' }],
    tags: ['kindhearted', 'warmhearted'],
    visible: true,
    createdAt: Date.now() - 518400000
  },
  {
    id: 'item_plant_pot',
    name: '绿植盆栽',
    description: '一盆精心培育的小绿植，放在桌上能让心情变好。',
    icon: '🌱',
    rarity: 'common',
    category: 'collectible',
    mintCost: { time: 20 },
    effects: [{ type: 'energy', value: 8, description: '每日恢复8点精力' }],
    tags: ['minimalist'],
    visible: true,
    createdAt: Date.now() - 604800000
  }
]
