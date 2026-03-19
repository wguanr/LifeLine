import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import authRouter from './routes/auth.route.js'
import gameRouter from './routes/game.route.js'
import debugRouter from './routes/debug.route.js'
import socialRouter from './routes/social.route.js'
import informationRouter from './routes/information.route.js'
import { startWorldTick } from './jobs/world-tick.job.js'
import { realtimeService } from './services/realtime.service.js'

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
    version: '0.3.0',
    timestamp: new Date().toISOString(),
    websocket: realtimeService.getStatus(),
  })
})

// ==================== 路由挂载 ====================

app.use('/api/auth', authRouter)
app.use('/api', gameRouter)
app.use('/api/debug', debugRouter)
app.use('/api/social', socialRouter)
app.use('/api/info', informationRouter)

// ==================== 创建 HTTP Server + WebSocket ====================

const server = createServer(app)
realtimeService.init(server)

// ==================== 启动服务器 ====================

server.listen(PORT, '0.0.0.0', () => {
  // 启动世界 Tick 定时器（开发环境：每 5 分钟一次）
  const tickInterval = parseInt(process.env.WORLD_TICK_INTERVAL || '300000', 10)
  startWorldTick(tickInterval)

  console.log(`
+==================================================+
|   LifeLine Backend v0.3.0 (Phase 3 - GA)         |
|   Running on http://0.0.0.0:${PORT}                 |
|   WebSocket on ws://0.0.0.0:${PORT}/ws               |
|                                                    |
|   Core API:                                        |
|   POST /api/auth/register | /api/auth/login        |
|   GET  /api/events | /api/items | /api/world       |
|   POST /api/choices                                |
|                                                    |
|   Phase 2 API:                                     |
|   GET  /api/debug/status                           |
|   GET  /api/debug/items/prices                     |
|   POST /api/debug/world/tick                       |
|                                                    |
|   Phase 3 API:                                     |
|   POST /api/social/follow | /api/social/unfollow   |
|   GET  /api/social/overview                        |
|   GET  /api/info/available | /api/info/market       |
|   POST /api/info/unlock | /api/info/share           |
|   GET  /api/debug/phase3/status                    |
|   POST /api/debug/social/create-test-users          |
|   POST /api/debug/social/setup-network              |
|   POST /api/debug/info/generate-all                 |
|   GET  /api/debug/world/snapshots                  |
|                                                    |
|   World Tick: every ${tickInterval / 1000}s                         |
+==================================================+
  `)
})

export default app
