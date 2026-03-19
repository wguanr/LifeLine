/**
 * information.service 单元测试
 * 覆盖：信息生成、解锁、分享、谣言、市场统计
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { createTestUser, createTestEvent, createTestInfo } from '../setup.js'

let informationService: typeof import('../../src/services/information.service.js')

beforeEach(async () => {
  informationService = await import('../../src/services/information.service.js')
})

// ==================== 信息生成 ====================

describe('Information Generation', () => {
  it('generateEventInformation: 为事件生成三层信息', async () => {
    createTestEvent('info-evt-1', { title: 'Test Event for Info' })

    const pieces = await informationService.informationService.generateEventInformation('info-evt-1')

    expect(pieces.length).toBeGreaterThanOrEqual(2) // 至少 public + core
    // 检查 public tier
    const publicPiece = pieces.find(p => p.tier === 'public')
    expect(publicPiece).toBeDefined()
    expect(publicPiece!.unlockCost).toBe(0)
    expect(publicPiece!.accuracy).toBe(1.0)

    // 检查 core tier
    const corePiece = pieces.find(p => p.tier === 'core')
    expect(corePiece).toBeDefined()
    expect(corePiece!.unlockCost).toBeGreaterThan(0)
  })

  it('generateEventInformation: 不存在的事件返回空', async () => {
    const pieces = await informationService.informationService.generateEventInformation('nonexistent')
    expect(pieces).toEqual([])
  })

  it('generateEventInformation: 重复生成不会创建重复记录', async () => {
    createTestEvent('info-evt-dup', { title: 'Dup Event' })

    const pieces1 = await informationService.informationService.generateEventInformation('info-evt-dup')
    const pieces2 = await informationService.informationService.generateEventInformation('info-evt-dup')

    expect(pieces1.length).toBe(pieces2.length)
  })
})

// ==================== 信息解锁 ====================

describe('Information Unlock', () => {
  it('unlockInformation: 解锁 public 信息（免费）', async () => {
    createTestUser('unlock-u1', 'unlocku1@test.com', { reputation: 100 })
    createTestInfo('info-pub-1', { tier: 'public', unlockCost: 0 })

    const result = await informationService.informationService.unlockInformation('unlock-u1', 'info-pub-1')

    expect(result.success).toBe(true)
    expect(result.costPaid).toBe(0)
    expect(result.info).toBeDefined()
  })

  it('unlockInformation: 解锁 deep 信息（消耗声誉）', async () => {
    createTestUser('unlock-u2', 'unlocku2@test.com', { reputation: 100 })
    createTestInfo('info-deep-1', { tier: 'deep', unlockCost: 10 })

    const result = await informationService.informationService.unlockInformation('unlock-u2', 'info-deep-1')

    expect(result.success).toBe(true)
    expect(result.costPaid).toBe(10)
  })

  it('unlockInformation: 解锁 core 信息（消耗大量声誉）', async () => {
    createTestUser('unlock-u3', 'unlocku3@test.com', { reputation: 100 })
    createTestInfo('info-core-1', { tier: 'core', unlockCost: 50 })

    const result = await informationService.informationService.unlockInformation('unlock-u3', 'info-core-1')

    expect(result.success).toBe(true)
    expect(result.costPaid).toBe(50)
  })

  it('unlockInformation: 声誉不足时失败', async () => {
    createTestUser('unlock-u4', 'unlocku4@test.com', { reputation: 5 })
    createTestInfo('info-expensive', { tier: 'core', unlockCost: 50 })

    const result = await informationService.informationService.unlockInformation('unlock-u4', 'info-expensive')

    expect(result.success).toBe(false)
    expect(result.error).toContain('Insufficient reputation')
  })

  it('unlockInformation: 重复解锁不扣费', async () => {
    createTestUser('unlock-u5', 'unlocku5@test.com', { reputation: 100 })
    createTestInfo('info-repeat', { tier: 'deep', unlockCost: 10 })

    await informationService.informationService.unlockInformation('unlock-u5', 'info-repeat')
    const result = await informationService.informationService.unlockInformation('unlock-u5', 'info-repeat')

    expect(result.success).toBe(true)
    expect(result.costPaid).toBe(0) // 不再扣费
  })

  it('unlockInformation: 不存在的信息返回失败', async () => {
    createTestUser('unlock-u6', 'unlocku6@test.com', { reputation: 100 })

    const result = await informationService.informationService.unlockInformation('unlock-u6', 'nonexistent')

    expect(result.success).toBe(false)
    expect(result.error).toContain('not found')
  })

  it('unlockInformation: 过期信息无法解锁', async () => {
    createTestUser('unlock-u7', 'unlocku7@test.com', { reputation: 100 })
    // 创建一个已过期的信息
    const { getTestSqlite } = await import('../setup.js')
    const sqlite = getTestSqlite()
    const pastTime = Date.now() - 1000
    sqlite.exec(`
      INSERT INTO ll_information (id, tier, category, target_id, title, content, unlock_cost, accuracy, expires_at, created_at)
      VALUES ('info-expired', 'deep', 'event_outcome', 'test', 'Expired Info', 'content', 10, 0.9, ${pastTime}, ${Date.now() - 10000})
    `)

    const result = await informationService.informationService.unlockInformation('unlock-u7', 'info-expired')

    expect(result.success).toBe(false)
    expect(result.error).toContain('expired')
  })
})

// ==================== 信息分享 ====================

describe('Information Sharing', () => {
  it('shareInformation: 成功分享给另一个用户', async () => {
    createTestUser('share-a', 'sharea@test.com', { reputation: 100 })
    createTestUser('share-b', 'shareb@test.com', { reputation: 10 })
    createTestInfo('info-share-1', { tier: 'deep', unlockCost: 10 })

    // 先解锁
    await informationService.informationService.unlockInformation('share-a', 'info-share-1')

    // 分享
    const result = await informationService.informationService.shareInformation('share-a', 'info-share-1', 'share-b')

    expect(result.success).toBe(true)
    expect(result.reputationEarned).toBeGreaterThan(0)
  })

  it('shareInformation: 未解锁的信息无法分享', async () => {
    createTestUser('share-c', 'sharec@test.com')
    createTestUser('share-d', 'shared@test.com')
    createTestInfo('info-share-2', { tier: 'deep', unlockCost: 10 })

    const result = await informationService.informationService.shareInformation('share-c', 'info-share-2', 'share-d')

    expect(result.success).toBe(false)
    expect(result.error).toContain('not unlocked')
  })

  it('shareInformation: 目标已拥有时失败', async () => {
    createTestUser('share-e', 'sharee@test.com', { reputation: 100 })
    createTestUser('share-f', 'sharef@test.com', { reputation: 100 })
    createTestInfo('info-share-3', { tier: 'deep', unlockCost: 10 })

    // 两人都解锁
    await informationService.informationService.unlockInformation('share-e', 'info-share-3')
    await informationService.informationService.unlockInformation('share-f', 'info-share-3')

    const result = await informationService.informationService.shareInformation('share-e', 'info-share-3', 'share-f')

    expect(result.success).toBe(false)
    expect(result.error).toContain('already has')
  })

  it('shareInformation: 分享奖励随次数衰减', async () => {
    createTestUser('share-g', 'shareg@test.com', { reputation: 100 })
    createTestUser('share-h', 'shareh@test.com')
    createTestUser('share-i', 'sharei@test.com')
    createTestInfo('info-share-4', { tier: 'deep', unlockCost: 10 })

    await informationService.informationService.unlockInformation('share-g', 'info-share-4')

    const result1 = await informationService.informationService.shareInformation('share-g', 'info-share-4', 'share-h')
    const result2 = await informationService.informationService.shareInformation('share-g', 'info-share-4', 'share-i')

    // 第二次分享的奖励应该更少
    expect(result2.reputationEarned!).toBeLessThanOrEqual(result1.reputationEarned!)
  })
})

// ==================== 用户信息查询 ====================

describe('User Information Queries', () => {
  it('getUserInformation: 返回用户已解锁的信息', async () => {
    createTestUser('qi-a', 'qia@test.com', { reputation: 100 })
    createTestInfo('qi-info-1', { tier: 'public', unlockCost: 0 })
    createTestInfo('qi-info-2', { tier: 'deep', unlockCost: 10 })

    await informationService.informationService.unlockInformation('qi-a', 'qi-info-1')
    await informationService.informationService.unlockInformation('qi-a', 'qi-info-2')

    const infos = await informationService.informationService.getUserInformation('qi-a')
    expect(infos.length).toBe(2)
  })

  it('getAvailableInformation: 返回未解锁的信息', async () => {
    createTestUser('qi-b', 'qib@test.com', { reputation: 100 })
    createTestInfo('qi-info-3', { tier: 'public', unlockCost: 0 })
    createTestInfo('qi-info-4', { tier: 'deep', unlockCost: 10 })

    // 只解锁一个
    await informationService.informationService.unlockInformation('qi-b', 'qi-info-3')

    const available = await informationService.informationService.getAvailableInformation('qi-b')
    expect(available.length).toBe(1) // 只剩一个未解锁
    expect(available[0].id).toBe('qi-info-4')
    // 非 public 的内容应该被隐藏
    expect(available[0].content).toContain('Locked')
  })
})

// ==================== 谣言生成 ====================

describe('Rumor Generation', () => {
  it('generateRumor: 生成谣言（概率性）', async () => {
    createTestEvent('rumor-evt', { title: 'Rumor Event', status: 'active' })

    // 多次尝试，至少有一次成功
    let generated = false
    for (let i = 0; i < 100; i++) {
      const rumor = await informationService.informationService.generateRumor()
      if (rumor) {
        generated = true
        expect(rumor.id).toMatch(/^rumor_/)
        expect(rumor.content).toBeTruthy()
        expect(rumor.confidence).toBeGreaterThan(0)
        expect(rumor.confidence).toBeLessThanOrEqual(1)
        break
      }
    }
    // 100 次尝试中至少应该有一次成功（概率 1 - 0.85^100 ≈ 99.9999%）
    expect(generated).toBe(true)
  })
})

// ==================== 市场统计 ====================

describe('Market Stats', () => {
  it('getInformationMarketStats: 返回市场统计', async () => {
    createTestInfo('ms-1', { tier: 'public' })
    createTestInfo('ms-2', { tier: 'deep' })
    createTestInfo('ms-3', { tier: 'core' })

    const stats = await informationService.informationService.getInformationMarketStats()

    expect(stats.totalPieces).toBe(3)
    expect(stats.tierDistribution.public).toBe(1)
    expect(stats.tierDistribution.deep).toBe(1)
    expect(stats.tierDistribution.core).toBe(1)
    expect(stats.avgAccuracy).toBeGreaterThan(0)
  })

  it('getInformationMarketStats: 空市场', async () => {
    const stats = await informationService.informationService.getInformationMarketStats()

    expect(stats.totalPieces).toBe(0)
    expect(stats.avgAccuracy).toBe(0)
  })
})
