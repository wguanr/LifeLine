/**
 * 测试全局 setup
 * - 使用独立的 test.db 隔离测试数据
 * - 通过 drizzle ORM 共享同一连接（与 Service 层一致）
 * - 每次测试前清空所有表
 */
import { beforeAll, afterAll, beforeEach } from 'vitest'
import fs from 'fs'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { sql } from 'drizzle-orm'

// 设置测试环境变量（必须在 import db 之前）
process.env.DB_PATH = './test.db'
process.env.JWT_SECRET = 'test-secret-key-for-testing'

// 清理旧的测试数据库（在模块加载前）
try { fs.unlinkSync('./test.db') } catch {}
try { fs.unlinkSync('./test.db-wal') } catch {}
try { fs.unlinkSync('./test.db-shm') } catch {}

// 创建 SQLite 连接（与 db/index.ts 使用相同的 test.db）
const sqlite = new Database('./test.db')
sqlite.pragma('journal_mode = WAL')

// 导入 schema 并创建 drizzle 实例
import * as schema from '../src/db/schema.js'

// 用 raw SQL 创建表（因为 drizzle-kit push 需要 CLI）
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS ll_users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    nickname TEXT NOT NULL,
    avatar TEXT NOT NULL DEFAULT '🎭',
    bio TEXT NOT NULL DEFAULT '',
    motto TEXT DEFAULT '',
    clearance_level INTEGER NOT NULL DEFAULT 0,
    wallet_time REAL NOT NULL DEFAULT 1000,
    wallet_energy REAL NOT NULL DEFAULT 100,
    wallet_reputation REAL NOT NULL DEFAULT 0,
    tags TEXT NOT NULL DEFAULT '[]',
    inventory TEXT NOT NULL DEFAULT '[]',
    history TEXT NOT NULL DEFAULT '{}',
    created_at INTEGER NOT NULL,
    last_active_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ll_events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    cover TEXT NOT NULL DEFAULT '',
    type TEXT NOT NULL DEFAULT 'story',
    status TEXT NOT NULL DEFAULT 'active',
    requirements TEXT NOT NULL DEFAULT '{}',
    entry_fee TEXT NOT NULL DEFAULT '{}',
    stages TEXT NOT NULL DEFAULT '[]',
    participant_count INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ll_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    icon TEXT NOT NULL DEFAULT '📦',
    rarity TEXT NOT NULL DEFAULT 'common',
    category TEXT NOT NULL DEFAULT 'collectible',
    mint_cost TEXT NOT NULL DEFAULT '{}',
    effects TEXT NOT NULL DEFAULT '[]',
    tags TEXT NOT NULL DEFAULT '[]',
    feature_tags TEXT NOT NULL DEFAULT '[]',
    story TEXT NOT NULL DEFAULT '',
    image TEXT,
    visible INTEGER NOT NULL DEFAULT 1,
    stackable INTEGER NOT NULL DEFAULT 1,
    max_stack INTEGER,
    max_mint INTEGER,
    minted_count INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ll_tag_definitions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ll_user_choices (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES ll_users(id),
    event_id TEXT NOT NULL REFERENCES ll_events(id),
    stage_id TEXT NOT NULL,
    choice_id TEXT NOT NULL,
    choice_text TEXT NOT NULL,
    result_text TEXT,
    cost_snapshot TEXT NOT NULL DEFAULT '{}',
    reward_snapshot TEXT NOT NULL DEFAULT '{}',
    timestamp INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ll_world_state (
    id TEXT PRIMARY KEY,
    epoch TEXT NOT NULL DEFAULT 'genesis',
    epoch_started_at INTEGER NOT NULL,
    dim_stability REAL NOT NULL DEFAULT 0.5,
    dim_prosperity REAL NOT NULL DEFAULT 0.5,
    dim_freedom REAL NOT NULL DEFAULT 0.5,
    dim_knowledge REAL NOT NULL DEFAULT 0.5,
    dim_solidarity REAL NOT NULL DEFAULT 0.5,
    tide_multiplier TEXT NOT NULL DEFAULT '{}',
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ll_social_relations (
    from_user_id TEXT NOT NULL REFERENCES ll_users(id),
    to_user_id TEXT NOT NULL REFERENCES ll_users(id),
    trust_value REAL NOT NULL DEFAULT 0.1,
    interaction_count INTEGER NOT NULL DEFAULT 0,
    last_interaction_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ll_information (
    id TEXT PRIMARY KEY,
    tier TEXT NOT NULL DEFAULT 'public',
    category TEXT NOT NULL,
    target_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    unlock_cost REAL NOT NULL DEFAULT 0,
    discovered_by TEXT,
    share_count INTEGER NOT NULL DEFAULT 0,
    accuracy REAL NOT NULL DEFAULT 1.0,
    expires_at INTEGER,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ll_information_access (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES ll_users(id),
    information_id TEXT NOT NULL REFERENCES ll_information(id),
    method TEXT NOT NULL,
    unlocked_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ll_world_snapshots (
    id TEXT PRIMARY KEY,
    epoch TEXT NOT NULL,
    dim_stability REAL NOT NULL,
    dim_prosperity REAL NOT NULL,
    dim_freedom REAL NOT NULL,
    dim_knowledge REAL NOT NULL,
    dim_solidarity REAL NOT NULL,
    tide_multiplier TEXT NOT NULL DEFAULT '{}',
    tick_number INTEGER NOT NULL,
    significant_event TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ll_event_legacies (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL REFERENCES ll_events(id),
    legacy_type TEXT NOT NULL,
    payload TEXT NOT NULL DEFAULT '{}',
    created_at INTEGER NOT NULL
  );
`)

// 所有表名列表（用于清空）
const ALL_TABLES = [
  'll_information_access', 'll_information', 'll_social_relations',
  'll_event_legacies', 'll_user_choices', 'll_world_snapshots',
  'll_items', 'll_events', 'll_tag_definitions',
  'll_world_state', 'll_users'
]

beforeEach(() => {
  // 清空所有表（保持表结构）
  for (const table of ALL_TABLES) {
    sqlite.exec(`DELETE FROM ${table}`)
  }

  // 插入默认世界状态
  const now = Date.now()
  sqlite.exec(`
    INSERT INTO ll_world_state (id, epoch, epoch_started_at, dim_stability, dim_prosperity, dim_freedom, dim_knowledge, dim_solidarity, tide_multiplier, updated_at)
    VALUES ('current', 'genesis', ${now}, 0.5, 0.5, 0.5, 0.5, 0.5, '{"time":1.0,"energy":1.0,"reputation":1.0}', ${now})
  `)
})

afterAll(() => {
  sqlite.close()
  try { fs.unlinkSync('./test.db') } catch {}
  try { fs.unlinkSync('./test.db-wal') } catch {}
  try { fs.unlinkSync('./test.db-shm') } catch {}
})

// ==================== 辅助函数 ====================

export function getTestSqlite() { return sqlite }

/**
 * 创建测试用户（直接用 raw SQL 写入同一个 test.db）
 */
export function createTestUser(id: string = 'test-user-1', email: string = 'test@test.com', opts: any = {}) {
  const bcrypt = require('bcryptjs')
  const hash = bcrypt.hashSync(opts.password || 'password123', 10)
  const now = Date.now()
  sqlite.exec(`
    INSERT OR IGNORE INTO ll_users (id, email, password_hash, nickname, avatar, bio, wallet_time, wallet_energy, wallet_reputation, tags, inventory, history, created_at, last_active_at)
    VALUES ('${id}', '${email}', '${hash}', '${opts.nickname || 'TestUser'}', '🎭', '', ${opts.time ?? 1000}, ${opts.energy ?? 100}, ${opts.reputation ?? 50}, '${opts.tags || '[]'}', '${opts.inventory || '[]'}', '{}', ${now}, ${now})
  `)
  return id
}

/**
 * 创建测试事件
 */
export function createTestEvent(id: string = 'test-event-1', opts: any = {}) {
  const now = Date.now()
  const title = opts.title || 'Test Event'
  const stages = opts.stages || '[{"id":"stage_1","title":"Stage 1","choices":[{"id":"choice_a","text":"Choose A"},{"id":"choice_b","text":"Choose B"}]}]'
  sqlite.exec(`
    INSERT OR IGNORE INTO ll_events (id, title, description, type, status, stages, created_at)
    VALUES ('${id}', '${title}', '${opts.description || 'A test event'}', '${opts.type || 'story'}', '${opts.status || 'active'}', '${stages}', ${now})
  `)
  return id
}

/**
 * 创建测试物品
 */
export function createTestItem(id: string = 'test-item-1', opts: any = {}) {
  const now = Date.now()
  const mintCost = JSON.stringify(opts.mintCost || { time: 10, energy: 5 })
  const tags = JSON.stringify(opts.tags || ['test_tag'])
  sqlite.exec(`
    INSERT OR IGNORE INTO ll_items (id, name, description, icon, rarity, category, mint_cost, tags, feature_tags, visible, stackable, story, max_mint, minted_count, created_at)
    VALUES ('${id}', '${opts.name || 'Test Item'}', '${opts.description || 'A test item'}', '${opts.icon || '🧪'}', '${opts.rarity || 'common'}', '${opts.category || 'collectible'}', '${mintCost}', '${tags}', '[]', ${opts.visible ?? 1}, ${opts.stackable ?? 1}, '', ${opts.maxMint ?? 100}, ${opts.mintedCount ?? 0}, ${now})
  `)
  return id
}

/**
 * 创建测试信息
 */
export function createTestInfo(id: string = 'test-info-1', opts: any = {}) {
  const now = Date.now()
  sqlite.exec(`
    INSERT OR IGNORE INTO ll_information (id, tier, category, target_id, title, content, unlock_cost, accuracy, created_at)
    VALUES ('${id}', '${opts.tier || 'public'}', '${opts.category || 'event_outcome'}', '${opts.targetId || 'test-event-1'}', '${opts.title || 'Test Info'}', '${opts.content || 'Test content'}', ${opts.unlockCost ?? 0}, ${opts.accuracy ?? 1.0}, ${now})
  `)
  return id
}

/**
 * 创建测试社交关系
 */
export function createTestRelation(fromId: string, toId: string, opts: any = {}) {
  const now = Date.now()
  sqlite.exec(`
    INSERT OR IGNORE INTO ll_social_relations (from_user_id, to_user_id, trust_value, interaction_count, last_interaction_at, created_at)
    VALUES ('${fromId}', '${toId}', ${opts.trustValue ?? 0.1}, ${opts.interactionCount ?? 0}, ${now}, ${now})
  `)
}
