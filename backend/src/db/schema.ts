import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

// ==================== 用户表 ====================

export const llUsers = sqliteTable('ll_users', {
  id: text('id').primaryKey(), // uuid
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  nickname: text('nickname').notNull(),
  avatar: text('avatar').notNull().default('🎭'),
  bio: text('bio').notNull().default(''),
  motto: text('motto').default(''),
  clearanceLevel: integer('clearance_level').notNull().default(0),

  // 钱包 (V4: CoreResources — 先用 v3 的三资源，后续扩展)
  walletTime: real('wallet_time').notNull().default(1000),
  walletEnergy: real('wallet_energy').notNull().default(100),
  walletReputation: real('wallet_reputation').notNull().default(0),

  // JSON 存储复杂结构
  tags: text('tags').notNull().default('[]'),             // UserTag[]
  inventory: text('inventory').notNull().default('[]'),    // UserItem[]
  history: text('history').notNull().default('{}'),        // User.history

  createdAt: integer('created_at').notNull(),
  lastActiveAt: integer('last_active_at').notNull(),
})

// ==================== 事件表 ====================

export const llEvents = sqliteTable('ll_events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  cover: text('cover').notNull().default(''),
  type: text('type').notNull().default('story'),           // story | social | challenge | craft | exploration | creation
  status: text('status').notNull().default('active'),      // active | upcoming | ended | draft

  // JSON 存储复杂结构
  requirements: text('requirements').notNull().default('{}'),
  entryFee: text('entry_fee').notNull().default('{}'),
  stages: text('stages').notNull().default('[]'),          // EventStage[]

  participantCount: integer('participant_count').notNull().default(0),
  createdAt: integer('created_at').notNull(),
})

// ==================== 物品表 ====================

export const llItems = sqliteTable('ll_items', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull().default('📦'),
  rarity: text('rarity').notNull().default('common'),
  category: text('category').notNull().default('collectible'),

  // JSON 存储
  mintCost: text('mint_cost').notNull().default('{}'),
  effects: text('effects').notNull().default('[]'),
  tags: text('tags').notNull().default('[]'),
  featureTags: text('feature_tags').notNull().default('[]'),

  story: text('story').notNull().default(''),
  image: text('image'),
  visible: integer('visible', { mode: 'boolean' }).notNull().default(true),
  stackable: integer('stackable', { mode: 'boolean' }).notNull().default(true),
  maxStack: integer('max_stack'),
  maxMint: integer('max_mint'),
  mintedCount: integer('minted_count').notNull().default(0),
  createdAt: integer('created_at').notNull(),
})

// ==================== 标签定义表 ====================

export const llTagDefinitions = sqliteTable('ll_tag_definitions', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(), // life | social | work | growth
})

// ==================== 用户选择记录表 ====================

export const llUserChoices = sqliteTable('ll_user_choices', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => llUsers.id),
  eventId: text('event_id').notNull().references(() => llEvents.id),
  stageId: text('stage_id').notNull(),
  choiceId: text('choice_id').notNull(),
  choiceText: text('choice_text').notNull(),
  resultText: text('result_text'),

  // 资源变动快照
  costSnapshot: text('cost_snapshot').notNull().default('{}'),
  rewardSnapshot: text('reward_snapshot').notNull().default('{}'),

  timestamp: integer('timestamp').notNull(),
})

// ==================== 世界状态表 ====================

export const llWorldState = sqliteTable('ll_world_state', {
  id: text('id').primaryKey(), // 'current' 或时间戳快照
  epoch: text('epoch').notNull().default('genesis'),       // 当前纪元
  epochStartedAt: integer('epoch_started_at').notNull(),

  // 世界维度 (V4 设计的五大维度)
  dimStability: real('dim_stability').notNull().default(0.5),
  dimProsperity: real('dim_prosperity').notNull().default(0.5),
  dimFreedom: real('dim_freedom').notNull().default(0.5),
  dimKnowledge: real('dim_knowledge').notNull().default(0.5),
  dimSolidarity: real('dim_solidarity').notNull().default(0.5),

  // 资源潮汐乘数
  tideMultiplier: text('tide_multiplier').notNull().default('{}'),

  updatedAt: integer('updated_at').notNull(),
})

// ==================== 社交关系表 ====================

export const llSocialRelations = sqliteTable('ll_social_relations', {
  fromUserId: text('from_user_id').notNull().references(() => llUsers.id),
  toUserId: text('to_user_id').notNull().references(() => llUsers.id),
  trustValue: real('trust_value').notNull().default(0.1),
  interactionCount: integer('interaction_count').notNull().default(0),
  lastInteractionAt: integer('last_interaction_at').notNull(),
  createdAt: integer('created_at').notNull(),
})

// ==================== 信息表 ====================

export const llInformation = sqliteTable('ll_information', {
  id: text('id').primaryKey(),
  tier: text('tier').notNull().default('public'),       // public | deep | core
  category: text('category').notNull(),                  // event_outcome | choice_distribution | item_hidden | world_precise | rumor
  targetId: text('target_id').notNull(),                 // 关联的事件/物品 ID
  title: text('title').notNull(),
  content: text('content').notNull(),
  unlockCost: real('unlock_cost').notNull().default(0),
  discoveredBy: text('discovered_by'),
  shareCount: integer('share_count').notNull().default(0),
  accuracy: real('accuracy').notNull().default(1.0),
  expiresAt: integer('expires_at'),
  createdAt: integer('created_at').notNull(),
})

// ==================== 信息访问记录表 ====================

export const llInformationAccess = sqliteTable('ll_information_access', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => llUsers.id),
  informationId: text('information_id').notNull().references(() => llInformation.id),
  method: text('method').notNull(),                      // self_unlock | shared | item_effect
  unlockedAt: integer('unlocked_at').notNull(),
})

// ==================== 世界历史快照表 ====================

export const llWorldSnapshots = sqliteTable('ll_world_snapshots', {
  id: text('id').primaryKey(),
  epoch: text('epoch').notNull(),
  dimStability: real('dim_stability').notNull(),
  dimProsperity: real('dim_prosperity').notNull(),
  dimFreedom: real('dim_freedom').notNull(),
  dimKnowledge: real('dim_knowledge').notNull(),
  dimSolidarity: real('dim_solidarity').notNull(),
  tideMultiplier: text('tide_multiplier').notNull().default('{}'),
  tickNumber: integer('tick_number').notNull(),
  significantEvent: text('significant_event'),           // 该 Tick 的重大事件描述
  createdAt: integer('created_at').notNull(),
})

// ==================== 事件遗产表 ====================

export const llEventLegacies = sqliteTable('ll_event_legacies', {
  id: text('id').primaryKey(),
  eventId: text('event_id').notNull().references(() => llEvents.id),
  legacyType: text('legacy_type').notNull(), // world_shift | unlock_event | spawn_item | tag_trend
  payload: text('payload').notNull().default('{}'),        // JSON: 具体影响数据
  createdAt: integer('created_at').notNull(),
})
