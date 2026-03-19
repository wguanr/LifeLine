/**
 * 测试用 Express app 工厂
 * 不启动真实服务器，只创建 app 实例供 supertest 使用
 */
import express from 'express'
import cors from 'cors'

export async function createTestApp() {
  const app = express()

  app.use(cors({ origin: '*', credentials: true }))
  app.use(express.json())

  app.get('/ping', (_req, res) => {
    res.json({ status: 'ok', service: 'LifeLine Backend (Test)' })
  })

  // 动态导入路由（确保使用 test.db）
  const { default: authRouter } = await import('../src/routes/auth.route.js')
  const { default: gameRouter } = await import('../src/routes/game.route.js')
  const { default: debugRouter } = await import('../src/routes/debug.route.js')
  const { default: socialRouter } = await import('../src/routes/social.route.js')
  const { default: informationRouter } = await import('../src/routes/information.route.js')

  app.use('/api/auth', authRouter)
  app.use('/api', gameRouter)
  app.use('/api/debug', debugRouter)
  app.use('/api/social', socialRouter)
  app.use('/api/info', informationRouter)

  return app
}
