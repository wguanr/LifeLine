/**
 * LifeLine V4 — 信息引擎路由
 */

import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { informationService } from '../services/information.service.js'

const router = Router()

// ==================== 信息查询 ====================

/** GET /api/info/available — 获取可用信息列表 */
router.get('/available', authMiddleware, async (req, res) => {
  try {
    const infos = await informationService.getAvailableInformation(req.userId!)
    res.json(infos)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

/** GET /api/info/my — 获取已解锁的信息 */
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const infos = await informationService.getUserInformation(req.userId!)
    res.json(infos)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

/** GET /api/info/market — 信息市场统计 */
router.get('/market', async (_req, res) => {
  try {
    const stats = await informationService.getInformationMarketStats()
    res.json(stats)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// ==================== 信息操作 ====================

/** POST /api/info/generate/:eventId — 为事件生成信息 */
router.post('/generate/:eventId', async (req, res) => {
  try {
    const pieces = await informationService.generateEventInformation(req.params.eventId)
    res.json({ success: true, generated: pieces.length, pieces })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

/** POST /api/info/unlock — 解锁信息 */
router.post('/unlock', authMiddleware, async (req, res) => {
  try {
    const { informationId } = req.body
    if (!informationId) return res.status(400).json({ error: 'informationId required' })

    const result = await informationService.unlockInformation(req.userId!, informationId)
    res.json(result)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

/** POST /api/info/share — 分享信息给其他用户 */
router.post('/share', authMiddleware, async (req, res) => {
  try {
    const { informationId, targetUserId } = req.body
    if (!informationId || !targetUserId) {
      return res.status(400).json({ error: 'informationId and targetUserId required' })
    }

    const result = await informationService.shareInformation(req.userId!, informationId, targetUserId)
    res.json(result)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

/** POST /api/info/generate-rumor — 生成谣言（调试用） */
router.post('/generate-rumor', async (_req, res) => {
  try {
    const rumor = await informationService.generateRumor()
    res.json({ success: true, rumor: rumor || 'No rumor generated this time (random chance)' })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

export default router
