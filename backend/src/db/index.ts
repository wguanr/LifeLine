import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema.js'
import dotenv from 'dotenv'

dotenv.config()

const dbPath = process.env.DB_PATH || './lifeline.db'
const sqlite = new Database(dbPath)

// 启用 WAL 模式以获得更好的并发性能
sqlite.pragma('journal_mode = WAL')

export const db = drizzle(sqlite, { schema })
export { schema }
export default db
