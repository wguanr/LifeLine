/**
 * LifeLine V4 — 社交引擎路由
 */

import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { socialService } from '../services/social.service.js'

const router = Router()

// ==================== 关注管理 ====================

/** POST /api/social/follow — 关注用户 */
router.post('/follow', authMiddleware, async (req, res) => {
  try {
    const { targetUserId } = req.body
    if (!targetUserId) return res.status(400).json({ error: 'targetUserId required' })

    const relation = await socialService.follow(req.userId!, targetUserId)
    res.json({ success: true, relation })
  } catch (e: any) {
    res.status(400).json({ error: e.message })
  }
})

/** POST /api/social/unfollow — 取消关注 */
router.post('/unfollow', authMiddleware, async (req, res) => {
  try {
    const { targetUserId } = req.body
    if (!targetUserId) return res.status(400).json({ error: 'targetUserId required' })

    await socialService.unfollow(req.userId!, targetUserId)
    res.json({ success: true })
  } catch (e: any) {
    res.status(400).json({ error: e.message })
  }
})

// ==================== 社交查询 ====================

/** GET /api/social/following — 获取关注列表 */
router.get('/following', authMiddleware, async (req, res) => {
  try {
    const following = await socialService.getFollowing(req.userId!)
    res.json(following)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

/** GET /api/social/followers — 获取粉丝列表 */
router.get('/followers', authMiddleware, async (req, res) => {
  try {
    const followers = await socialService.getFollowers(req.userId!)
    res.json(followers)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

/** GET /api/social/mutuals — 获取互相关注 */
router.get('/mutuals', authMiddleware, async (req, res) => {
  try {
    const mutuals = await socialService.getMutualFriends(req.userId!)
    res.json(mutuals)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

/** GET /api/social/overview — 社交网络概览 */
router.get('/overview', authMiddleware, async (req, res) => {
  try {
    const overview = await socialService.getSocialOverview(req.userId!)
    res.json(overview)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// ==================== 信任与互动 ====================

/** POST /api/social/interact — 记录互动 */
router.post('/interact', authMiddleware, async (req, res) => {
  try {
    const { targetUserId, type } = req.body
    if (!targetUserId || !type) {
      return res.status(400).json({ error: 'targetUserId and type required' })
    }
    if (!['positive', 'negative', 'betrayal'].includes(type)) {
      return res.status(400).json({ error: 'type must be positive, negative, or betrayal' })
    }

    const result = await socialService.recordInteraction(req.userId!, targetUserId, type)
    res.json({ success: true, ...result })
  } catch (e: any) {
    res.status(400).json({ error: e.message })
  }
})

/** GET /api/social/reputation-bonus — 获取社交圈声誉加成 */
router.get('/reputation-bonus', authMiddleware, async (req, res) => {
  try {
    const bonuses = await socialService.calculateReputationBonus(req.userId!)
    res.json(bonuses)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

/** GET /api/social/circle-tendency/:eventId — 获取圈子选择倾向 */
router.get('/circle-tendency/:eventId', authMiddleware, async (req, res) => {
  try {
    const tendency = await socialService.getCircleTendency(req.userId!, req.params.eventId)
    res.json(tendency || { message: 'No data from your circle for this event' })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

export default router
