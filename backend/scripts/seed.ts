/**
 * LifeLine 数据种子脚本
 * 将前端 src/data/ 下的 mock 数据导入到 SQLite 数据库
 *
 * 用法: cd backend && pnpm seed
 */
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '../src/db/schema.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.resolve(__dirname, '../lifeline.db')

// 连接数据库
const sqlite = new Database(DB_PATH)
sqlite.pragma('journal_mode = WAL')
const db = drizzle(sqlite, { schema })

// ==================== 辅助函数 ====================

/**
 * 从 TypeScript 数据文件中提取 JSON 数组
 * 简单的方法：用正则提取数组内容，然后用 eval 解析
 * 更安全的方法：直接用 tsx 导入，但这里为了简洁用文本解析
 */
function extractArrayFromTS(filePath: string, varName: string): any[] {
  const content = fs.readFileSync(filePath, 'utf-8')

  // 替换 TypeScript 特有语法
  let cleaned = content
    // 移除 import 语句
    .replace(/^import\s+.*$/gm, '')
    // 移除 export 关键字
    .replace(/^export\s+/gm, '')
    // 替换 Date.now() 为当前时间戳
    .replace(/Date\.now\(\)/g, String(Date.now()))
    // 替换 Date.now() - xxx 表达式
    .replace(/Date\.now\(\)\s*-\s*(\d+)/g, (_, offset) => String(Date.now() - parseInt(offset)))

  // 提取变量赋值
  const regex = new RegExp(`(?:const|let|var)\\s+${varName}[^=]*=\\s*`)
  const match = cleaned.match(regex)
  if (!match) {
    console.warn(`  未找到变量 ${varName}，跳过`)
    return []
  }

  const startIdx = cleaned.indexOf(match[0]) + match[0].length
  // 找到数组的开始和结束
  let bracketCount = 0
  let endIdx = startIdx
  let started = false

  for (let i = startIdx; i < cleaned.length; i++) {
    if (cleaned[i] === '[') {
      bracketCount++
      started = true
    } else if (cleaned[i] === ']') {
      bracketCount--
      if (started && bracketCount === 0) {
        endIdx = i + 1
        break
      }
    }
  }

  const arrayStr = cleaned.slice(startIdx, endIdx)

  try {
    // 使用 Function 构造器来安全地解析（比 eval 略安全）
    const fn = new Function(`return ${arrayStr}`)
    return fn()
  } catch (err) {
    console.warn(`  解析 ${varName} 失败:`, (err as Error).message)
    return []
  }
}

// ==================== 种子数据 ====================

const DATA_DIR = path.resolve(__dirname, '../../src/data')

async function seedTags() {
  console.log('📌 导入标签定义...')

  const baseTags = extractArrayFromTS(path.join(DATA_DIR, 'tags.ts'), 'baseTagDefinitions')
  const aigcTags = extractArrayFromTS(path.join(DATA_DIR, 'aigc_tags.ts'), 'aigcTagDefinitions')
  const allTags = [...baseTags, ...aigcTags]

  let count = 0
  for (const tag of allTags) {
    try {
      await db.insert(schema.llTagDefinitions).values({
        id: tag.id,
        name: tag.name,
        icon: tag.icon,
        description: tag.description,
        category: tag.category,
      }).onConflictDoNothing()
      count++
    } catch (err) {
      // 忽略重复
    }
  }
  console.log(`  ✅ 导入 ${count} 个标签定义`)
}

async function seedEvents() {
  console.log('🎭 导入事件...')

  const mockEvents = extractArrayFromTS(path.join(DATA_DIR, 'events.ts'), 'mockEvents')
  const aigcEvents = extractArrayFromTS(path.join(DATA_DIR, 'aigc_events.ts'), 'aigcEvents')
  const generatedEvents = extractArrayFromTS(path.join(DATA_DIR, 'generated_events.ts'), 'generatedEvents')
  const allEvents = [...mockEvents, ...aigcEvents, ...generatedEvents]

  let count = 0
  for (const evt of allEvents) {
    try {
      await db.insert(schema.llEvents).values({
        id: evt.id,
        title: evt.title,
        description: evt.description,
        cover: evt.cover || '',
        type: evt.type || 'story',
        status: evt.status || 'active',
        requirements: JSON.stringify(evt.requirements || {}),
        entryFee: JSON.stringify(evt.entryFee || {}),
        stages: JSON.stringify(evt.stages || []),
        participantCount: evt.participantCount || 0,
        createdAt: evt.createdAt || Date.now(),
      }).onConflictDoNothing()
      count++
    } catch (err) {
      // 忽略重复
    }
  }
  console.log(`  ✅ 导入 ${count} 个事件`)
}

async function seedItems() {
  console.log('📦 导入物品...')

  const mockItems = extractArrayFromTS(path.join(DATA_DIR, 'items.ts'), 'mockItems')
  const aigcItems = extractArrayFromTS(path.join(DATA_DIR, 'aigc_items.ts'), 'aigcItems')
  const generatedItems = extractArrayFromTS(path.join(DATA_DIR, 'generated_items.ts'), 'generatedItems')
  const allItems = [...mockItems, ...aigcItems, ...generatedItems]

  let count = 0
  for (const item of allItems) {
    try {
      await db.insert(schema.llItems).values({
        id: item.id,
        name: item.name,
        description: item.description,
        icon: item.icon || '📦',
        rarity: item.rarity || 'common',
        category: item.category || 'collectible',
        mintCost: JSON.stringify(item.mintCost || {}),
        effects: JSON.stringify(item.effects || []),
        tags: JSON.stringify(item.tags || []),
        featureTags: JSON.stringify(item.featureTags || []),
        story: item.story || '',
        image: item.image || null,
        visible: item.visible !== false,
        stackable: item.stackable !== false,
        maxStack: item.maxStack || null,
        maxMint: item.maxMint || null,
        mintedCount: item.mintedCount || 0,
        createdAt: item.createdAt || Date.now(),
      }).onConflictDoNothing()
      count++
    } catch (err) {
      // 忽略重复
    }
  }
  console.log(`  ✅ 导入 ${count} 个物品`)
}

async function seedWorldState() {
  console.log('🌍 初始化世界状态...')

  const now = Date.now()
  await db.insert(schema.llWorldState).values({
    id: 'current',
    epoch: 'genesis',
    epochStartedAt: now,
    dimStability: 0.5,
    dimProsperity: 0.5,
    dimFreedom: 0.5,
    dimKnowledge: 0.5,
    dimSolidarity: 0.5,
    tideMultiplier: JSON.stringify({
      time: 1.0,
      energy: 1.0,
      reputation: 1.0,
    }),
    updatedAt: now,
  }).onConflictDoNothing()

  console.log('  ✅ 世界状态初始化完成')
}

// ==================== 主函数 ====================

async function main() {
  console.log('╔══════════════════════════════════════════╗')
  console.log('║   LifeLine 数据种子脚本                  ║')
  console.log('╚══════════════════════════════════════════╝')
  console.log(`数据库: ${DB_PATH}`)
  console.log(`数据源: ${DATA_DIR}`)
  console.log('')

  await seedTags()
  await seedEvents()
  await seedItems()
  await seedWorldState()

  console.log('')
  console.log('🎉 数据种子导入完成！')

  sqlite.close()
}

main().catch(err => {
  console.error('种子脚本执行失败:', err)
  process.exit(1)
})
