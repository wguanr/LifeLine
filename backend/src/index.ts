import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRouter from './routes/auth.route.js'
import gameRouter from './routes/game.route.js'
import debugRouter from './routes/debug.route.js'
import { startWorldTick } from './jobs/world-tick.job.js'

dotenv.config()

const app = express()
const PORT = parseInt(process.env.PORT || '3001', 10)

// ==================== 中间件 ====================

app.use(cors({
  origin: '*',
  credentials: true,
}))
app.use(express.json())

// ==================== 健康检查 ====================

app.get('/ping', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'LifeLine Backend',
    version: '0.2.0',
    timestamp: new Date().toISOString(),
  })
})

// ==================== 路由挂载 ====================

app.use('/api/auth', authRouter)
app.use('/api', gameRouter)
app.use('/api/debug', debugRouter)

// ==================== 启动服务器 ====================

app.listen(PORT, '0.0.0.0', () => {
  // 启动世界 Tick 定时器（开发环境：每 5 分钟一次）
  const tickInterval = parseInt(process.env.WORLD_TICK_INTERVAL || '300000', 10)
  startWorldTick(tickInterval)

  console.log(`
╔══════════════════════════════════════════════╗
║   LifeLine Backend v0.2.0 (Phase 2)         ║
║   Running on http://0.0.0.0:${PORT}            ║
║                                              ║
║   Core API:                                  ║
║   POST /api/auth/register                    ║
║   POST /api/auth/login                       ║
║   GET  /api/events | /api/items | /api/world ║
║   POST /api/choices                          ║
║                                              ║
║   Phase 2 API:                               ║
║   GET  /api/debug/status                     ║
║   GET  /api/debug/items/prices               ║
║   POST /api/debug/world/tick                 ║
║   POST /api/debug/world/set-dimensions       ║
║   POST /api/debug/simulate-choice            ║
║   POST /api/debug/reset-user                 ║
║                                              ║
║   World Tick: every ${tickInterval / 1000}s                    ║
╚══════════════════════════════════════════════╝
  `)
})

export default app
