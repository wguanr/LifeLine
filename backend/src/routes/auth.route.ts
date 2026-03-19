import { Router, Request, Response } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db, schema } from '../db/index.js'
import { signToken, authMiddleware } from '../middleware/auth.js'
import crypto from 'crypto'

const router = Router()

// ==================== 请求校验 ====================

const registerSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6位'),
  nickname: z.string().min(1, '昵称不能为空').max(20, '昵称最长20字'),
  avatar: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1, '密码不能为空'),
})

// ==================== 注册 ====================

router.post('/register', async (req: Request, res: Response) => {
  try {
    const body = registerSchema.parse(req.body)

    // 检查邮箱是否已注册
    const existing = await db.select()
      .from(schema.llUsers)
      .where(eq(schema.llUsers.email, body.email))
      .limit(1)

    if (existing.length > 0) {
      res.status(409).json({ error: '该邮箱已注册' })
      return
    }

    // 创建用户
    const userId = `u_${crypto.randomUUID().slice(0, 8)}`
    const passwordHash = await bcrypt.hash(body.password, 10)
    const now = Date.now()

    const defaultHistory = JSON.stringify({
      completedEvents: [],
      currentEvents: [],
      achievements: [],
      tagActions: [],
      archiveAccess: [],
      choiceHistory: [],
    })

    await db.insert(schema.llUsers).values({
      id: userId,
      email: body.email,
      passwordHash,
      nickname: body.nickname,
      avatar: body.avatar || '🎭',
      bio: '',
      clearanceLevel: 0,
      walletTime: 1000,
      walletEnergy: 100,
      walletReputation: 0,
      tags: '[]',
      inventory: '[]',
      history: defaultHistory,
      createdAt: now,
      lastActiveAt: now,
    })

    // 生成 token
    const token = signToken({ userId, email: body.email })

    res.status(201).json({
      token,
      user: {
        id: userId,
        email: body.email,
        nickname: body.nickname,
        avatar: body.avatar || '🎭',
        wallet: { time: 1000, energy: 100, reputation: 0 },
      },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message })
      return
    }
    console.error('注册失败:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// ==================== 登录 ====================

router.post('/login', async (req: Request, res: Response) => {
  try {
    const body = loginSchema.parse(req.body)

    // 查找用户
    const users = await db.select()
      .from(schema.llUsers)
      .where(eq(schema.llUsers.email, body.email))
      .limit(1)

    if (users.length === 0) {
      res.status(401).json({ error: '邮箱或密码错误' })
      return
    }

    const user = users[0]

    // 验证密码
    const valid = await bcrypt.compare(body.password, user.passwordHash)
    if (!valid) {
      res.status(401).json({ error: '邮箱或密码错误' })
      return
    }

    // 更新最后活跃时间
    await db.update(schema.llUsers)
      .set({ lastActiveAt: Date.now() })
      .where(eq(schema.llUsers.id, user.id))

    // 生成 token
    const token = signToken({ userId: user.id, email: user.email })

    res.json({
      token,
      user: formatUserResponse(user),
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message })
      return
    }
    console.error('登录失败:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// ==================== 获取当前用户信息 ====================

router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const users = await db.select()
      .from(schema.llUsers)
      .where(eq(schema.llUsers.id, req.user!.userId))
      .limit(1)

    if (users.length === 0) {
      res.status(404).json({ error: '用户不存在' })
      return
    }

    res.json({ user: formatUserResponse(users[0]) })
  } catch (err) {
    console.error('获取用户信息失败:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// ==================== 更新用户信息 ====================

const updateProfileSchema = z.object({
  nickname: z.string().min(1).max(20).optional(),
  avatar: z.string().optional(),
  bio: z.string().max(200).optional(),
  motto: z.string().max(100).optional(),
})

router.patch('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const body = updateProfileSchema.parse(req.body)

    await db.update(schema.llUsers)
      .set({
        ...body,
        lastActiveAt: Date.now(),
      })
      .where(eq(schema.llUsers.id, req.user!.userId))

    const users = await db.select()
      .from(schema.llUsers)
      .where(eq(schema.llUsers.id, req.user!.userId))
      .limit(1)

    res.json({ user: formatUserResponse(users[0]) })
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message })
      return
    }
    console.error('更新用户信息失败:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// ==================== 辅助函数 ====================

function formatUserResponse(user: typeof schema.llUsers.$inferSelect) {
  return {
    id: user.id,
    nickname: user.nickname,
    avatar: user.avatar,
    bio: user.bio,
    motto: user.motto,
    clearanceLevel: user.clearanceLevel,
    wallet: {
      time: user.walletTime,
      energy: user.walletEnergy,
      reputation: user.walletReputation,
    },
    tags: JSON.parse(user.tags),
    inventory: JSON.parse(user.inventory),
    history: JSON.parse(user.history),
    createdAt: user.createdAt,
    lastActiveAt: user.lastActiveAt,
  }
}

export default router
