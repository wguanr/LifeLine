import { eq, and, desc } from 'drizzle-orm'
import { db, schema } from '../db/index.js'
import crypto from 'crypto'

export type InformationTier = 'public' | 'deep' | 'core'

export interface InformationPiece {
  id: string
  tier: InformationTier
  category: string
  targetId: string
  title: string
  content: string
  unlockCost: number
  discoveredBy: string | null
  shareCount: number
  accuracy: number
  expiresAt: number | null
  createdAt: number
}

export interface Rumor {
  id: string
  content: string
  hintEventId: string | null
  isTrue: boolean
  confidence: number
  revealedAt: number | null
  createdAt: number
}

const INFO_CONFIG = {
  deepTierBaseCost: 10,
  coreTierBaseCost: 50,
  shareReputationReward: 5,
  shareDecayFactor: 0.8,
  rumorGenerationChance: 0.15,
  rumorTruthChance: 0.6,
  defaultTTL: 7 * 24 * 60 * 60 * 1000,
}

export class InformationService {

  async generateEventInformation(eventId: string): Promise<InformationPiece[]> {
    const events = await db.select()
      .from(schema.llEvents)
      .where(eq(schema.llEvents.id, eventId))
      .limit(1)

    if (events.length === 0) return []
    const event = events[0]
    const now = Date.now()
    const pieces: InformationPiece[] = []

    // Public tier: basic event info (always visible)
    pieces.push({
      id: `info_${eventId}_pub`,
      tier: 'public',
      category: 'event_outcome',
      targetId: eventId,
      title: `${event.title} - 基础情报`,
      content: `事件「${event.title}」正在进行中。${event.description}`,
      unlockCost: 0,
      discoveredBy: null,
      shareCount: 0,
      accuracy: 1.0,
      expiresAt: null,
      createdAt: now,
    })

    // Deep tier: choice distribution
    const choices = await db.select()
      .from(schema.llUserChoices)
      .where(eq(schema.llUserChoices.eventId, eventId))

    if (choices.length > 0) {
      const dist: Record<string, number> = {}
      for (const c of choices) {
        const key = c.choiceText || c.choiceId
        dist[key] = (dist[key] || 0) + 1
      }
      const distStr = Object.entries(dist)
        .map(([k, v]) => `${k}: ${Math.round((v / choices.length) * 100)}%`)
        .join(', ')

      pieces.push({
        id: `info_${eventId}_deep`,
        tier: 'deep',
        category: 'choice_distribution',
        targetId: eventId,
        title: `${event.title} - 选择分布`,
        content: `当前玩家选择分布: ${distStr} (样本量: ${choices.length})`,
        unlockCost: INFO_CONFIG.deepTierBaseCost,
        discoveredBy: null,
        shareCount: 0,
        accuracy: 0.95,
        expiresAt: now + INFO_CONFIG.defaultTTL,
        createdAt: now,
      })
    }

    // Core tier: predicted outcome
    pieces.push({
      id: `info_${eventId}_core`,
      tier: 'core',
      category: 'event_outcome',
      targetId: eventId,
      title: `${event.title} - 核心预测`,
      content: `基于当前世界状态和玩家行为模式分析，该事件最可能的走向是...（需要核心权限解锁）`,
      unlockCost: INFO_CONFIG.coreTierBaseCost,
      discoveredBy: null,
      shareCount: 0,
      accuracy: 0.75,
      expiresAt: now + INFO_CONFIG.defaultTTL / 2,
      createdAt: now,
    })

    // Save to DB
    for (const piece of pieces) {
      const existing = await db.select()
        .from(schema.llInformation)
        .where(eq(schema.llInformation.id, piece.id))
        .limit(1)

      if (existing.length === 0) {
        await db.insert(schema.llInformation).values({
          id: piece.id,
          tier: piece.tier,
          category: piece.category,
          targetId: piece.targetId,
          title: piece.title,
          content: piece.content,
          unlockCost: piece.unlockCost,
          discoveredBy: piece.discoveredBy,
          shareCount: piece.shareCount,
          accuracy: piece.accuracy,
          expiresAt: piece.expiresAt,
          createdAt: piece.createdAt,
        })
      }
    }

    return pieces
  }

  async unlockInformation(
    userId: string,
    informationId: string,
  ): Promise<{ success: boolean; info?: InformationPiece; costPaid?: number; error?: string }> {
    const infos = await db.select()
      .from(schema.llInformation)
      .where(eq(schema.llInformation.id, informationId))
      .limit(1)

    if (infos.length === 0) {
      return { success: false, error: 'Information not found' }
    }

    const info = infos[0]

    // Check if already unlocked
    const existing = await db.select()
      .from(schema.llInformationAccess)
      .where(and(
        eq(schema.llInformationAccess.userId, userId),
        eq(schema.llInformationAccess.informationId, informationId),
      ))
      .limit(1)

    if (existing.length > 0) {
      return { success: true, info: this.rowToInfo(info), costPaid: 0 }
    }

    // Check expiry
    if (info.expiresAt && info.expiresAt < Date.now()) {
      return { success: false, error: 'Information has expired' }
    }

    // Public tier is free
    if (info.tier === 'public') {
      await this.grantAccess(userId, informationId, 'self_unlock')
      return { success: true, info: this.rowToInfo(info), costPaid: 0 }
    }

    // Check reputation cost
    const users = await db.select()
      .from(schema.llUsers)
      .where(eq(schema.llUsers.id, userId))
      .limit(1)

    if (users.length === 0) {
      return { success: false, error: 'User not found' }
    }

    const user = users[0]
    const cost = info.unlockCost

    if (user.walletReputation < cost) {
      return { success: false, error: `Insufficient reputation. Need ${cost}, have ${user.walletReputation}` }
    }

    // Deduct cost and grant access
    await db.update(schema.llUsers)
      .set({ walletReputation: user.walletReputation - cost })
      .where(eq(schema.llUsers.id, userId))

    await this.grantAccess(userId, informationId, 'self_unlock')

    // Mark first discoverer
    if (!info.discoveredBy) {
      await db.update(schema.llInformation)
        .set({ discoveredBy: userId })
        .where(eq(schema.llInformation.id, informationId))
    }

    return { success: true, info: this.rowToInfo(info), costPaid: cost }
  }

  async shareInformation(
    sharerId: string,
    informationId: string,
    targetUserId: string,
  ): Promise<{ success: boolean; reputationEarned?: number; error?: string }> {
    // Check sharer has access
    const sharerAccess = await db.select()
      .from(schema.llInformationAccess)
      .where(and(
        eq(schema.llInformationAccess.userId, sharerId),
        eq(schema.llInformationAccess.informationId, informationId),
      ))
      .limit(1)

    if (sharerAccess.length === 0) {
      return { success: false, error: 'You have not unlocked this information' }
    }

    // Check target does not already have it
    const targetAccess = await db.select()
      .from(schema.llInformationAccess)
      .where(and(
        eq(schema.llInformationAccess.userId, targetUserId),
        eq(schema.llInformationAccess.informationId, informationId),
      ))
      .limit(1)

    if (targetAccess.length > 0) {
      return { success: false, error: 'Target already has this information' }
    }

    // Grant access to target
    await this.grantAccess(targetUserId, informationId, 'shared')

    // Increment share count
    const infos = await db.select()
      .from(schema.llInformation)
      .where(eq(schema.llInformation.id, informationId))
      .limit(1)

    if (infos.length > 0) {
      await db.update(schema.llInformation)
        .set({ shareCount: infos[0].shareCount + 1 })
        .where(eq(schema.llInformation.id, informationId))
    }

    // Reward sharer with reputation (decays with share count)
    const shareCount = infos.length > 0 ? infos[0].shareCount : 0
    const reward = Math.round(
      INFO_CONFIG.shareReputationReward * Math.pow(INFO_CONFIG.shareDecayFactor, shareCount) * 10,
    ) / 10

    if (reward > 0) {
      const sharerUsers = await db.select()
        .from(schema.llUsers)
        .where(eq(schema.llUsers.id, sharerId))
        .limit(1)

      if (sharerUsers.length > 0) {
        await db.update(schema.llUsers)
          .set({ walletReputation: sharerUsers[0].walletReputation + reward })
          .where(eq(schema.llUsers.id, sharerId))
      }
    }

    return { success: true, reputationEarned: reward }
  }

  async generateRumor(): Promise<Rumor | null> {
    if (Math.random() > INFO_CONFIG.rumorGenerationChance) return null

    const events = await db.select()
      .from(schema.llEvents)
      .where(eq(schema.llEvents.status, 'active'))

    const isTrue = Math.random() < INFO_CONFIG.rumorTruthChance
    const now = Date.now()

    const rumorTemplates = [
      { content: 'There are whispers of a major economic shift on the horizon...', category: 'world' },
      { content: 'An insider suggests a rare item may appear in the next cycle...', category: 'item' },
      { content: 'Sources indicate a new event chain is about to unfold...', category: 'event' },
      { content: 'The balance of power may be shifting sooner than expected...', category: 'world' },
      { content: 'A hidden path has been discovered by a few astute observers...', category: 'event' },
    ]

    const template = rumorTemplates[Math.floor(Math.random() * rumorTemplates.length)]
    const targetEvent = events.length > 0
      ? events[Math.floor(Math.random() * events.length)]
      : null

    const rumor: Rumor = {
      id: `rumor_${crypto.randomUUID().slice(0, 8)}`,
      content: template.content,
      hintEventId: targetEvent?.id || null,
      isTrue,
      confidence: isTrue
        ? 0.5 + Math.random() * 0.4
        : 0.2 + Math.random() * 0.5,
      revealedAt: now + INFO_CONFIG.defaultTTL,
      createdAt: now,
    }

    // Save as information piece
    await db.insert(schema.llInformation).values({
      id: rumor.id,
      tier: 'deep',
      category: 'rumor',
      targetId: rumor.hintEventId || 'world',
      title: 'Rumor',
      content: rumor.content,
      unlockCost: INFO_CONFIG.deepTierBaseCost,
      discoveredBy: null,
      shareCount: 0,
      accuracy: rumor.confidence,
      expiresAt: rumor.revealedAt,
      createdAt: rumor.createdAt,
    })

    return rumor
  }

  async getUserInformation(userId: string): Promise<InformationPiece[]> {
    const accesses = await db.select()
      .from(schema.llInformationAccess)
      .where(eq(schema.llInformationAccess.userId, userId))
      .orderBy(desc(schema.llInformationAccess.unlockedAt))

    const infos: InformationPiece[] = []
    for (const access of accesses) {
      const rows = await db.select()
        .from(schema.llInformation)
        .where(eq(schema.llInformation.id, access.informationId))
        .limit(1)

      if (rows.length > 0) {
        infos.push(this.rowToInfo(rows[0]))
      }
    }

    return infos
  }

  async getAvailableInformation(userId: string): Promise<InformationPiece[]> {
    const allInfo = await db.select()
      .from(schema.llInformation)
      .orderBy(desc(schema.llInformation.createdAt))

    const userAccess = await db.select()
      .from(schema.llInformationAccess)
      .where(eq(schema.llInformationAccess.userId, userId))

    const unlockedIds = new Set(userAccess.map(a => a.informationId))
    const now = Date.now()

    return allInfo
      .filter(i => !unlockedIds.has(i.id))
      .filter(i => !i.expiresAt || i.expiresAt > now)
      .map(i => ({
        ...this.rowToInfo(i),
        content: i.tier === 'public' ? i.content : '[Locked - requires reputation to unlock]',
      }))
  }

  async getInformationMarketStats() {
    const allInfo = await db.select().from(schema.llInformation)
    const now = Date.now()
    const active = allInfo.filter(i => !i.expiresAt || i.expiresAt > now)

    const tierCounts = { public: 0, deep: 0, core: 0 }
    let totalShares = 0

    for (const info of active) {
      tierCounts[info.tier as InformationTier] = (tierCounts[info.tier as InformationTier] || 0) + 1
      totalShares += info.shareCount
    }

    const rumors = active.filter(i => i.category === 'rumor')

    return {
      totalPieces: active.length,
      tierDistribution: tierCounts,
      totalShares,
      activeRumors: rumors.length,
      avgAccuracy: active.length > 0
        ? Math.round(active.reduce((s, i) => s + i.accuracy, 0) / active.length * 100) / 100
        : 0,
    }
  }

  // ---------- Private helpers ----------

  private async grantAccess(userId: string, informationId: string, method: string) {
    await db.insert(schema.llInformationAccess).values({
      id: `ia_${crypto.randomUUID().slice(0, 8)}`,
      userId,
      informationId,
      method,
      unlockedAt: Date.now(),
    })
  }

  private rowToInfo(row: any): InformationPiece {
    return {
      id: row.id,
      tier: row.tier,
      category: row.category,
      targetId: row.targetId,
      title: row.title,
      content: row.content,
      unlockCost: row.unlockCost,
      discoveredBy: row.discoveredBy,
      shareCount: row.shareCount,
      accuracy: row.accuracy,
      expiresAt: row.expiresAt,
      createdAt: row.createdAt,
    }
  }
}

export const informationService = new InformationService()
