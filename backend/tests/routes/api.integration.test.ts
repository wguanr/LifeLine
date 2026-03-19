/**
 * API 路由集成测试
 * 通过 supertest 模拟 HTTP 请求，覆盖所有主要 API 端点
 * 
 * 关键发现：大部分 API 返回的是包装对象 { events: [...] } 而非直接数组
 */
import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import { createTestEvent, createTestItem, createTestInfo } from '../setup.js'
import { createTestApp } from '../app.js'

let app: any

beforeAll(async () => {
  app = await createTestApp()
})

// ==================== Health Check ====================

describe('Health Check', () => {
  it('GET /ping: 返回 ok', async () => {
    const res = await request(app).get('/ping')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
})

// ==================== Auth Routes ====================

describe('Auth Routes', () => {
  it('POST /api/auth/register: 注册新用户', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'newuser@test.com', password: 'password123', nickname: 'NewUser' })

    expect(res.status).toBe(201)
    expect(res.body.token).toBeTruthy()
    expect(res.body.user).toBeDefined()
    expect(res.body.user.id).toBeTruthy()
  })

  it('POST /api/auth/register: 重复邮箱返回 409', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'dup@test.com', password: 'password123', nickname: 'Dup1' })

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'dup@test.com', password: 'password123', nickname: 'Dup2' })

    expect(res.status).toBe(409)
  })

  it('POST /api/auth/register: 缺少密码返回 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'missing@test.com', nickname: 'Missing' })

    expect(res.status).toBe(400)
  })

  it('POST /api/auth/register: 无效邮箱返回 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'password123', nickname: 'Bad' })

    expect(res.status).toBe(400)
  })

  it('POST /api/auth/register: 密码太短返回 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'short@test.com', password: '123', nickname: 'Short' })

    expect(res.status).toBe(400)
  })

  it('POST /api/auth/login: 正确凭据登录', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'login@test.com', password: 'password123', nickname: 'Login' })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeTruthy()
    expect(res.body.user).toBeDefined()
  })

  it('POST /api/auth/login: 错误密码返回 401', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'wrongpw@test.com', password: 'password123', nickname: 'WrongPW' })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrongpw@test.com', password: 'wrongpassword' })

    expect(res.status).toBe(401)
  })

  it('POST /api/auth/login: 不存在的用户返回 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'password123' })

    expect(res.status).toBe(401)
  })

  it('GET /api/auth/me: 有效 token 返回用户信息', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'me@test.com', password: 'password123', nickname: 'Me' })

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${reg.body.token}`)

    expect(res.status).toBe(200)
    expect(res.body.user).toBeDefined()
    expect(res.body.user.wallet).toBeDefined()
  })

  it('GET /api/auth/me: 无 token 返回 401', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })

  it('GET /api/auth/me: 无效 token 返回 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken123')

    expect(res.status).toBe(401)
  })

  it('PATCH /api/auth/me: 更新用户信息', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'update@test.com', password: 'password123', nickname: 'Before' })

    const res = await request(app)
      .patch('/api/auth/me')
      .set('Authorization', `Bearer ${reg.body.token}`)
      .send({ nickname: 'After', bio: 'Updated bio' })

    expect(res.status).toBe(200)
    expect(res.body.user.nickname).toBe('After')
    expect(res.body.user.bio).toBe('Updated bio')
  })
})

// ==================== Game Routes ====================

describe('Game Routes', () => {
  it('GET /api/events: 返回事件列表（包装在 events 字段中）', async () => {
    createTestEvent('api-evt-1', { title: 'API Event 1' })
    createTestEvent('api-evt-2', { title: 'API Event 2' })

    const res = await request(app).get('/api/events')
    expect(res.status).toBe(200)
    expect(res.body.events).toBeDefined()
    expect(Array.isArray(res.body.events)).toBe(true)
    expect(res.body.events.length).toBeGreaterThanOrEqual(2)
  })

  it('GET /api/events/:id: 返回指定事件', async () => {
    createTestEvent('api-evt-detail', { title: 'Detail Event' })

    const res = await request(app).get('/api/events/api-evt-detail')
    expect(res.status).toBe(200)
    expect(res.body.event).toBeDefined()
    expect(res.body.event.title).toBe('Detail Event')
  })

  it('GET /api/events/:id: 不存在的事件返回 404', async () => {
    const res = await request(app).get('/api/events/nonexistent-event-id')
    expect(res.status).toBe(404)
  })

  it('GET /api/items: 返回物品列表（包装在 items 字段中）', async () => {
    createTestItem('api-item-1', { name: 'API Item 1' })
    createTestItem('api-item-2', { name: 'API Item 2' })

    const res = await request(app).get('/api/items')
    expect(res.status).toBe(200)
    expect(res.body.items).toBeDefined()
    expect(Array.isArray(res.body.items)).toBe(true)
    expect(res.body.items.length).toBeGreaterThanOrEqual(2)
  })

  it('GET /api/world: 返回世界状态（包装在 world 字段中）', async () => {
    const res = await request(app).get('/api/world')
    expect(res.status).toBe(200)
    expect(res.body.world).toBeDefined()
    expect(res.body.world.epoch).toBeDefined()
    expect(res.body.world.dimensions).toBeDefined()
  })

  it('GET /api/tags: 返回标签列表（包装在 tags 字段中）', async () => {
    const res = await request(app).get('/api/tags')
    expect(res.status).toBe(200)
    expect(res.body.tags).toBeDefined()
    expect(Array.isArray(res.body.tags)).toBe(true)
  })

  it('POST /api/choices: 需要认证', async () => {
    const res = await request(app)
      .post('/api/choices')
      .send({ eventId: 'test', stageId: 'test', choiceId: 'test', choiceText: 'test' })

    expect(res.status).toBe(401)
  })

  it('POST /api/choices: 认证用户可以提交选择', async () => {
    createTestEvent('choice-evt', { title: 'Choice Event' })

    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'chooser@test.com', password: 'password123', nickname: 'Chooser' })

    const res = await request(app)
      .post('/api/choices')
      .set('Authorization', `Bearer ${reg.body.token}`)
      .send({
        eventId: 'choice-evt',
        stageId: 'stage_1',
        choiceId: 'choice_a',
        choiceText: 'Choose A',
        outcome: { rewards: { time: 10 }, resultText: 'Good choice' },
      })

    expect(res.status).toBe(201)
    expect(res.body.wallet).toBeDefined()
  })

  it('GET /api/choices: 认证用户获取选择历史', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'history@test.com', password: 'password123', nickname: 'History' })

    const res = await request(app)
      .get('/api/choices')
      .set('Authorization', `Bearer ${reg.body.token}`)

    expect(res.status).toBe(200)
    expect(res.body.choices).toBeDefined()
  })
})

// ==================== Wallet / Inventory Routes ====================

describe('Wallet & Inventory Routes', () => {
  it('GET /api/wallet: 需要认证', async () => {
    const res = await request(app).get('/api/wallet')
    expect(res.status).toBe(401)
  })

  it('GET /api/wallet: 返回用户钱包（包装在 wallet 字段中）', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'wallet@test.com', password: 'password123', nickname: 'Wallet' })

    const res = await request(app)
      .get('/api/wallet')
      .set('Authorization', `Bearer ${reg.body.token}`)

    expect(res.status).toBe(200)
    expect(res.body.wallet).toBeDefined()
    expect(res.body.wallet.time).toBeDefined()
    expect(res.body.wallet.energy).toBeDefined()
    expect(res.body.wallet.reputation).toBeDefined()
  })

  it('GET /api/inventory: 返回用户背包（包装在 inventory 字段中）', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'inv@test.com', password: 'password123', nickname: 'Inv' })

    const res = await request(app)
      .get('/api/inventory')
      .set('Authorization', `Bearer ${reg.body.token}`)

    expect(res.status).toBe(200)
    expect(res.body.inventory).toBeDefined()
    expect(Array.isArray(res.body.inventory)).toBe(true)
  })

  it('GET /api/user/tags: 返回用户标签', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'tags@test.com', password: 'password123', nickname: 'Tags' })

    const res = await request(app)
      .get('/api/user/tags')
      .set('Authorization', `Bearer ${reg.body.token}`)

    expect(res.status).toBe(200)
    expect(res.body.tags).toBeDefined()
  })
})

// ==================== Social Routes ====================

describe('Social Routes', () => {
  it('POST /api/social/follow: 需要认证', async () => {
    const res = await request(app)
      .post('/api/social/follow')
      .send({ targetUserId: 'someone' })

    expect(res.status).toBe(401)
  })

  it('POST /api/social/follow: 关注用户', async () => {
    const regA = await request(app)
      .post('/api/auth/register')
      .send({ email: 'soc-a@test.com', password: 'password123', nickname: 'SocA' })

    const regB = await request(app)
      .post('/api/auth/register')
      .send({ email: 'soc-b@test.com', password: 'password123', nickname: 'SocB' })

    const res = await request(app)
      .post('/api/social/follow')
      .set('Authorization', `Bearer ${regA.body.token}`)
      .send({ targetUserId: regB.body.user.id })

    expect(res.status).toBe(200)
  })

  it('GET /api/social/overview: 返回社交概览', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'soc-ov@test.com', password: 'password123', nickname: 'SocOV' })

    const res = await request(app)
      .get('/api/social/overview')
      .set('Authorization', `Bearer ${reg.body.token}`)

    expect(res.status).toBe(200)
    expect(res.body.followingCount).toBeDefined()
    expect(res.body.followerCount).toBeDefined()
  })

  it('POST /api/social/unfollow: 取消关注', async () => {
    const regA = await request(app)
      .post('/api/auth/register')
      .send({ email: 'soc-ufa@test.com', password: 'password123', nickname: 'SocUFA' })

    const regB = await request(app)
      .post('/api/auth/register')
      .send({ email: 'soc-uf-b@test.com', password: 'password123', nickname: 'SocUFB' })

    // 先关注
    await request(app)
      .post('/api/social/follow')
      .set('Authorization', `Bearer ${regA.body.token}`)
      .send({ targetUserId: regB.body.user.id })

    // 取消关注
    const res = await request(app)
      .post('/api/social/unfollow')
      .set('Authorization', `Bearer ${regA.body.token}`)
      .send({ targetUserId: regB.body.user.id })

    expect(res.status).toBe(200)
  })
})

// ==================== Information Routes ====================

describe('Information Routes', () => {
  it('GET /api/info/available: 需要认证', async () => {
    const res = await request(app).get('/api/info/available')
    expect(res.status).toBe(401)
  })

  it('GET /api/info/available: 返回可用信息', async () => {
    createTestInfo('api-info-avail', { tier: 'public' })

    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'info-avail@test.com', password: 'password123', nickname: 'InfoAvail' })

    const res = await request(app)
      .get('/api/info/available')
      .set('Authorization', `Bearer ${reg.body.token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('GET /api/info/market: 返回市场统计', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'info-mkt@test.com', password: 'password123', nickname: 'InfoMkt' })

    const res = await request(app)
      .get('/api/info/market')
      .set('Authorization', `Bearer ${reg.body.token}`)

    expect(res.status).toBe(200)
    expect(res.body.totalPieces).toBeDefined()
    expect(res.body.tierDistribution).toBeDefined()
  })

  it('POST /api/info/unlock: 解锁公开信息', async () => {
    createTestInfo('api-info-unlock', { tier: 'public', unlockCost: 0 })

    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'info-unlock@test.com', password: 'password123', nickname: 'InfoUnlock' })

    const res = await request(app)
      .post('/api/info/unlock')
      .set('Authorization', `Bearer ${reg.body.token}`)
      .send({ informationId: 'api-info-unlock' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('POST /api/info/unlock: 不存在的信息返回失败', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'info-noexist@test.com', password: 'password123', nickname: 'InfoNoExist' })

    const res = await request(app)
      .post('/api/info/unlock')
      .set('Authorization', `Bearer ${reg.body.token}`)
      .send({ informationId: 'nonexistent-info' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(false)
  })
})

// ==================== Debug Routes ====================

describe('Debug Routes', () => {
  it('GET /api/debug/status: 返回引擎状态', async () => {
    const res = await request(app).get('/api/debug/status')
    expect(res.status).toBe(200)
    expect(res.body.world).toBeDefined()
  })

  it('GET /api/debug/items/prices: 返回动态价格', async () => {
    createTestItem('debug-price-1', { name: 'Price Item' })

    const res = await request(app).get('/api/debug/items/prices')
    expect(res.status).toBe(200)
    // 可能是对象或数组，取决于实现
    expect(res.body).toBeDefined()
  })

  it('POST /api/debug/world/tick: 触发世界 Tick', async () => {
    const res = await request(app).post('/api/debug/world/tick')
    expect(res.status).toBe(200)
    expect(res.body).toBeDefined()
  })

  it('POST /api/debug/world/set-dimensions: 设置世界维度', async () => {
    const res = await request(app)
      .post('/api/debug/world/set-dimensions')
      .send({ stability: 0.8, prosperity: 0.7, freedom: 0.6, knowledge: 0.5, solidarity: 0.4 })

    expect(res.status).toBe(200)
  })

  it('GET /api/debug/phase3/status: 返回 Phase 3 状态', async () => {
    const res = await request(app).get('/api/debug/phase3/status')
    expect(res.status).toBe(200)
  })

  it('GET /api/world/epochs: 返回所有纪元定义', async () => {
    const res = await request(app).get('/api/world/epochs')
    expect(res.status).toBe(200)
    expect(res.body.epochs).toBeDefined()
  })

  it('GET /api/legacies: 返回事件遗产', async () => {
    const res = await request(app).get('/api/legacies')
    expect(res.status).toBe(200)
    expect(res.body.legacies).toBeDefined()
  })
})


// ==================== Game Routes - 补齐遗漏 ====================

describe('Game Routes - Extended', () => {
  it('GET /api/debug/items/:id/price: 返回单个物品动态价格', async () => {
    createTestItem('price-item-1', { name: 'Price Item', maxMint: 100, mintedCount: 5 })

    const res = await request(app).get('/api/debug/items/price-item-1/price')
    expect(res.status).toBe(200)
    expect(res.body.itemId).toBe('price-item-1')
    expect(res.body.price).toBeDefined()
    expect(res.body.price.finalCost).toBeDefined()
    expect(res.body.price.bondingMultiplier).toBeDefined()
  })

  it('GET /api/debug/items/:id/price: 不存在的物品返回 404', async () => {
    const res = await request(app).get('/api/debug/items/nonexistent-item/price')
    expect(res.status).toBe(404)
  })

  it('POST /api/items/:id/buy: 需要认证', async () => {
    const res = await request(app).post('/api/items/test-item/buy')
    expect(res.status).toBe(401)
  })

  it('POST /api/items/:id/buy: 认证用户可以购买物品', async () => {
    createTestItem('buy-item-1', { name: 'Buy Item', mintCost: { time: 10, energy: 5 }, maxMint: 100, mintedCount: 0 })

    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'buyer@test.com', password: 'password123', nickname: 'Buyer' })

    const res = await request(app)
      .post('/api/items/buy-item-1/buy')
      .set('Authorization', `Bearer ${reg.body.token}`)

    expect(res.status).toBe(200)
    expect(res.body.wallet).toBeDefined()
  })

  it('POST /api/events/:id/start: 需要认证', async () => {
    const res = await request(app).post('/api/events/test-evt/start')
    expect(res.status).toBe(401)
  })

  it('POST /api/events/:id/start: 认证用户可以开始事件', async () => {
    createTestEvent('start-api-evt', { title: 'Start API Event' })

    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'starter@test.com', password: 'password123', nickname: 'Starter' })

    const res = await request(app)
      .post('/api/events/start-api-evt/start')
      .set('Authorization', `Bearer ${reg.body.token}`)

    expect(res.status).toBe(200)
  })

  it('POST /api/events/:id/complete: 需要认证', async () => {
    const res = await request(app).post('/api/events/test-evt/complete')
    expect(res.status).toBe(401)
  })

  it('POST /api/events/:id/complete: 认证用户可以完成事件', async () => {
    createTestEvent('complete-api-evt', { title: 'Complete API Event' })

    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'completer@test.com', password: 'password123', nickname: 'Completer' })

    // 先开始
    await request(app)
      .post('/api/events/complete-api-evt/start')
      .set('Authorization', `Bearer ${reg.body.token}`)

    // 再完成
    const res = await request(app)
      .post('/api/events/complete-api-evt/complete')
      .set('Authorization', `Bearer ${reg.body.token}`)

    expect(res.status).toBe(200)
  })

  it('GET /api/worldline: 需要认证', async () => {
    const res = await request(app).get('/api/worldline')
    expect(res.status).toBe(401)
  })

  it('GET /api/worldline: 返回用户世界线', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'worldline@test.com', password: 'password123', nickname: 'Worldline' })

    const res = await request(app)
      .get('/api/worldline')
      .set('Authorization', `Bearer ${reg.body.token}`)

    expect(res.status).toBe(200)
    expect(res.body.records).toBeDefined()
    expect(Array.isArray(res.body.records)).toBe(true)
  })

  it('GET /api/user/history: 需要认证', async () => {
    const res = await request(app).get('/api/user/history')
    expect(res.status).toBe(401)
  })

  it('GET /api/user/history: 返回用户历史', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'uhist@test.com', password: 'password123', nickname: 'UHist' })

    const res = await request(app)
      .get('/api/user/history')
      .set('Authorization', `Bearer ${reg.body.token}`)

    expect(res.status).toBe(200)
    expect(res.body.history).toBeDefined()
  })

  it('GET /api/debug/world/snapshots: 返回世界快照', async () => {
    const res = await request(app).get('/api/debug/world/snapshots')
    expect(res.status).toBe(200)
    expect(res.body.snapshots).toBeDefined()
    expect(Array.isArray(res.body.snapshots)).toBe(true)
  })

  it('GET /api/debug/world/tick-history: 返回 Tick 历史', async () => {
    const res = await request(app).get('/api/debug/world/tick-history')
    expect(res.status).toBe(200)
    expect(res.body).toBeDefined()
  })
})

// ==================== Social Routes - 补齐遗漏 ====================

describe('Social Routes - Extended', () => {
  it('GET /api/social/following: 需要认证', async () => {
    const res = await request(app).get('/api/social/following')
    expect(res.status).toBe(401)
  })

  it('GET /api/social/following: 返回关注列表', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'soc-fing@test.com', password: 'password123', nickname: 'SocFing' })

    const res = await request(app)
      .get('/api/social/following')
      .set('Authorization', `Bearer ${reg.body.token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('GET /api/social/followers: 返回粉丝列表', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'soc-fers@test.com', password: 'password123', nickname: 'SocFers' })

    const res = await request(app)
      .get('/api/social/followers')
      .set('Authorization', `Bearer ${reg.body.token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('GET /api/social/mutuals: 返回互关列表', async () => {
    const regA = await request(app)
      .post('/api/auth/register')
      .send({ email: 'soc-mut-a@test.com', password: 'password123', nickname: 'SocMutA' })

    const regB = await request(app)
      .post('/api/auth/register')
      .send({ email: 'soc-mut-b@test.com', password: 'password123', nickname: 'SocMutB' })

    // 互关
    await request(app)
      .post('/api/social/follow')
      .set('Authorization', `Bearer ${regA.body.token}`)
      .send({ targetUserId: regB.body.user.id })

    await request(app)
      .post('/api/social/follow')
      .set('Authorization', `Bearer ${regB.body.token}`)
      .send({ targetUserId: regA.body.user.id })

    const res = await request(app)
      .get('/api/social/mutuals')
      .set('Authorization', `Bearer ${regA.body.token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThanOrEqual(1)
  })

  it('GET /api/social/circle-tendency/:eventId: 需要认证', async () => {
    const res = await request(app).get('/api/social/circle-tendency/some-event')
    expect(res.status).toBe(401)
  })

  it('GET /api/social/circle-tendency/:eventId: 无关注时返回 message', async () => {
    createTestEvent('ct-api-evt', { title: 'CT API Event' })

    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'soc-ct@test.com', password: 'password123', nickname: 'SocCT' })

    const res = await request(app)
      .get('/api/social/circle-tendency/ct-api-evt')
      .set('Authorization', `Bearer ${reg.body.token}`)

    expect(res.status).toBe(200)
    // 无数据时返回 { message: 'No data from your circle for this event' }
    expect(res.body.message).toBeDefined()
  })

  it('POST /api/social/interact: 需要认证', async () => {
    const res = await request(app)
      .post('/api/social/interact')
      .send({ targetUserId: 'someone', type: 'cooperate' })
    expect(res.status).toBe(401)
  })

  it('POST /api/social/interact: 记录互动并增加信任', async () => {
    const regA = await request(app)
      .post('/api/auth/register')
      .send({ email: 'soc-int-a@test.com', password: 'password123', nickname: 'SocIntA' })

    const regB = await request(app)
      .post('/api/auth/register')
      .send({ email: 'soc-int-b@test.com', password: 'password123', nickname: 'SocIntB' })

    // 先关注
    await request(app)
      .post('/api/social/follow')
      .set('Authorization', `Bearer ${regA.body.token}`)
      .send({ targetUserId: regB.body.user.id })

    // 记录互动（type 必须是 positive/negative/betrayal）
    const res = await request(app)
      .post('/api/social/interact')
      .set('Authorization', `Bearer ${regA.body.token}`)
      .send({ targetUserId: regB.body.user.id, type: 'positive' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('GET /api/social/reputation-bonus: 需要认证', async () => {
    const res = await request(app).get('/api/social/reputation-bonus')
    expect(res.status).toBe(401)
  })

  it('GET /api/social/reputation-bonus: 返回声誉加成数组', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'soc-rep@test.com', password: 'password123', nickname: 'SocRep' })

    const res = await request(app)
      .get('/api/social/reputation-bonus')
      .set('Authorization', `Bearer ${reg.body.token}`)

    expect(res.status).toBe(200)
    // 返回的是 ReputationBonus[] 数组
    expect(Array.isArray(res.body)).toBe(true)
  })
})

// ==================== Information Routes - 补齐遗漏 ====================

describe('Information Routes - Extended', () => {
  it('GET /api/info/my: 需要认证', async () => {
    const res = await request(app).get('/api/info/my')
    expect(res.status).toBe(401)
  })

  it('GET /api/info/my: 返回已解锁信息', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'info-my@test.com', password: 'password123', nickname: 'InfoMy' })

    const res = await request(app)
      .get('/api/info/my')
      .set('Authorization', `Bearer ${reg.body.token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('POST /api/info/share: 需要认证', async () => {
    const res = await request(app)
      .post('/api/info/share')
      .send({ informationId: 'test' })
    expect(res.status).toBe(401)
  })

  it('POST /api/info/share: 分享已解锁的信息给另一个用户', async () => {
    createTestInfo('share-info-1', { tier: 'public', unlockCost: 0 })

    const regA = await request(app)
      .post('/api/auth/register')
      .send({ email: 'info-share-a@test.com', password: 'password123', nickname: 'InfoShareA' })

    const regB = await request(app)
      .post('/api/auth/register')
      .send({ email: 'info-share-b@test.com', password: 'password123', nickname: 'InfoShareB' })

    // 先解锁
    await request(app)
      .post('/api/info/unlock')
      .set('Authorization', `Bearer ${regA.body.token}`)
      .send({ informationId: 'share-info-1' })

    // 分享给 B（需要 targetUserId）
    const res = await request(app)
      .post('/api/info/share')
      .set('Authorization', `Bearer ${regA.body.token}`)
      .send({ informationId: 'share-info-1', targetUserId: regB.body.user.id })

    expect(res.status).toBe(200)
  })

  it('POST /api/info/generate/:eventId: 为事件生成信息', async () => {
    createTestEvent('info-gen-evt', { title: 'Info Gen Event' })

    const res = await request(app)
      .post('/api/info/generate/info-gen-evt')

    expect(res.status).toBe(200)
    expect(res.body.generated).toBeDefined()
  })

  it('POST /api/info/generate-rumor: 生成谣言', async () => {
    createTestInfo('rumor-src', { tier: 'public', category: 'event_outcome', targetId: 'test-evt' })

    const res = await request(app).post('/api/info/generate-rumor')
    expect(res.status).toBe(200)
  })
})

// ==================== Debug Routes - 补齐遗漏 ====================

describe('Debug Routes - Extended', () => {
  it('POST /api/debug/simulate-choice: 需要认证', async () => {
    const res = await request(app)
      .post('/api/debug/simulate-choice')
      .send({ eventId: 'test', choiceId: 'test' })
    expect(res.status).toBe(401)
  })

  it('POST /api/debug/simulate-choice: 模拟选择结算', async () => {
    createTestEvent('sim-evt', { title: 'Sim Event' })

    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'sim@test.com', password: 'password123', nickname: 'Sim' })

    const res = await request(app)
      .post('/api/debug/simulate-choice')
      .set('Authorization', `Bearer ${reg.body.token}`)
      .send({
        eventId: 'sim-evt',
        choiceId: 'choice_a',
        outcome: { rewards: { time: 50, reputation: 10 }, penalties: { energy: 20 } },
      })

    expect(res.status).toBe(200)
    // 返回的是 { preview: { ... } }
    expect(res.body.preview).toBeDefined()
    expect(res.body.preview.currentWallet).toBeDefined()
    expect(res.body.preview.settlement).toBeDefined()
    expect(res.body.preview.estimatedWalletAfter).toBeDefined()
  })

  it('POST /api/debug/reset-user: 需要认证', async () => {
    const res = await request(app).post('/api/debug/reset-user')
    expect(res.status).toBe(401)
  })

  it('POST /api/debug/reset-user: 重置用户数据', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'reset@test.com', password: 'password123', nickname: 'Reset' })

    const res = await request(app)
      .post('/api/debug/reset-user')
      .set('Authorization', `Bearer ${reg.body.token}`)

    expect(res.status).toBe(200)
  })

  it('POST /api/debug/social/create-test-users: 创建测试用户', async () => {
    const res = await request(app).post('/api/debug/social/create-test-users')
    expect(res.status).toBe(200)
    expect(res.body.users).toBeDefined()
  })

  it('POST /api/debug/social/setup-network: 需要认证', async () => {
    const res = await request(app).post('/api/debug/social/setup-network')
    expect(res.status).toBe(401)
  })

  it('POST /api/debug/social/setup-network: 设置社交网络', async () => {
    // 先创建测试用户
    const created = await request(app).post('/api/debug/social/create-test-users')
    const users = created.body.users || []

    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'setup-net@test.com', password: 'password123', nickname: 'SetupNet' })

    const res = await request(app)
      .post('/api/debug/social/setup-network')
      .set('Authorization', `Bearer ${reg.body.token}`)

    expect(res.status).toBe(200)
  })

  it('POST /api/debug/info/generate-all: 生成所有事件信息', async () => {
    createTestEvent('gen-all-evt', { title: 'Gen All Event' })

    const res = await request(app).post('/api/debug/info/generate-all')
    expect(res.status).toBe(200)
  })

  it('POST /api/debug/info/force-rumor: 强制生成谣言', async () => {
    createTestInfo('force-rumor-src', { tier: 'public', category: 'event_outcome', targetId: 'test-evt' })

    const res = await request(app).post('/api/debug/info/force-rumor')
    expect(res.status).toBe(200)
  })
})
