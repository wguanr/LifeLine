import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRouter from './routes/auth.route.js'
import gameRouter from './routes/game.route.js'

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
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  })
})

// ==================== 路由挂载 ====================

app.use('/api/auth', authRouter)
app.use('/api', gameRouter)

// ==================== 启动服务器 ====================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════╗
║   LifeLine Backend v0.1.0                ║
║   Running on http://0.0.0.0:${PORT}        ║
║                                          ║
║   API Routes:                            ║
║   POST /api/auth/register                ║
║   POST /api/auth/login                   ║
║   GET  /api/auth/me                      ║
║   PATCH /api/auth/me                     ║
║   GET  /api/events                       ║
║   GET  /api/events/:id                   ║
║   GET  /api/items                        ║
║   GET  /api/tags                         ║
║   GET  /api/world                        ║
║   POST /api/choices                      ║
╚══════════════════════════════════════════╝
  `)
})

export default app
