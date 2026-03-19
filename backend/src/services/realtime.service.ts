/**
 * LifeLine V4 — 实时通信引擎 (Realtime Engine)
 * 
 * 核心概念：
 * 1. WebSocket 连接管理：玩家上线/下线追踪
 * 2. 集体事件状态推送：事件选择分布实时更新
 * 3. 世界状态广播：纪元变迁、黑天鹅事件等重大变化
 * 4. 涟漪通知：你的选择产生的因果链回声
 */

import { WebSocketServer, WebSocket } from 'ws'
import type { Server } from 'http'

// ==================== 消息类型 ====================

export type WsMessageType =
  | 'world_tick'           // 世界 Tick 更新
  | 'epoch_change'         // 纪元变迁
  | 'black_swan'           // 黑天鹅事件
  | 'choice_update'        // 事件选择分布更新
  | 'ripple'               // 涟漪通知（你的选择产生了影响）
  | 'social_dividend'      // 社交分红通知
  | 'rumor'                // 新谣言
  | 'information_shared'   // 有人分享了信息给你
  | 'trust_change'         // 信任值变化
  | 'player_count'         // 在线玩家数更新

export interface WsMessage {
  type: WsMessageType
  payload: any
  timestamp: number
}

// ==================== 连接管理 ====================

interface ConnectedClient {
  ws: WebSocket
  userId: string | null
  connectedAt: number
}

class RealtimeService {
  private wss: WebSocketServer | null = null
  private clients: Map<string, ConnectedClient> = new Map()
  private clientIdCounter = 0

  /**
   * 初始化 WebSocket 服务器，附加到 HTTP server
   */
  init(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' })

    this.wss.on('connection', (ws, req) => {
      const clientId = `client_${++this.clientIdCounter}`
      const client: ConnectedClient = {
        ws,
        userId: null,
        connectedAt: Date.now(),
      }
      this.clients.set(clientId, client)

      console.log(`[WS] Client connected: ${clientId} (total: ${this.clients.size})`)
      this.broadcastPlayerCount()

      // Handle incoming messages (auth, subscribe)
      ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString())
          this.handleClientMessage(clientId, msg)
        } catch (e) {
          // Ignore malformed messages
        }
      })

      ws.on('close', () => {
        this.clients.delete(clientId)
        console.log(`[WS] Client disconnected: ${clientId} (total: ${this.clients.size})`)
        this.broadcastPlayerCount()
      })

      ws.on('error', () => {
        this.clients.delete(clientId)
      })

      // Send welcome message
      this.sendTo(clientId, {
        type: 'player_count',
        payload: { online: this.clients.size },
        timestamp: Date.now(),
      })
    })

    console.log('[WS] WebSocket server initialized on /ws')
  }

  /**
   * 处理客户端消息
   */
  private handleClientMessage(clientId: string, msg: any) {
    const client = this.clients.get(clientId)
    if (!client) return

    switch (msg.type) {
      case 'auth':
        // 客户端发送 userId 进行身份绑定
        client.userId = msg.userId
        console.log(`[WS] Client ${clientId} authenticated as user ${msg.userId}`)
        break
    }
  }

  // ---------- 发送方法 ----------

  /**
   * 发送消息给指定客户端
   */
  private sendTo(clientId: string, message: WsMessage) {
    const client = this.clients.get(clientId)
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message))
    }
  }

  /**
   * 发送消息给指定用户（可能有多个连接）
   */
  sendToUser(userId: string, message: WsMessage) {
    for (const [, client] of this.clients) {
      if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message))
      }
    }
  }

  /**
   * 广播消息给所有连接的客户端
   */
  broadcast(message: WsMessage) {
    const data = JSON.stringify(message)
    for (const [, client] of this.clients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data)
      }
    }
  }

  // ---------- 业务广播方法 ----------

  /**
   * 广播世界 Tick 更新
   */
  broadcastWorldTick(worldState: any) {
    this.broadcast({
      type: 'world_tick',
      payload: worldState,
      timestamp: Date.now(),
    })
  }

  /**
   * 广播纪元变迁
   */
  broadcastEpochChange(oldEpoch: string, newEpoch: string, trigger: string) {
    this.broadcast({
      type: 'epoch_change',
      payload: { oldEpoch, newEpoch, trigger },
      timestamp: Date.now(),
    })
  }

  /**
   * 广播黑天鹅事件
   */
  broadcastBlackSwan(description: string, effects: any) {
    this.broadcast({
      type: 'black_swan',
      payload: { description, effects },
      timestamp: Date.now(),
    })
  }

  /**
   * 广播事件选择分布更新
   */
  broadcastChoiceUpdate(eventId: string, distribution: Record<string, number>, totalChoices: number) {
    this.broadcast({
      type: 'choice_update',
      payload: { eventId, distribution, totalChoices },
      timestamp: Date.now(),
    })
  }

  /**
   * 发送涟漪通知给特定用户
   */
  sendRipple(userId: string, ripple: {
    sourceChoice: string
    effects: Array<{ type: string; description: string; magnitude: number }>
    message: string
  }) {
    this.sendToUser(userId, {
      type: 'ripple',
      payload: ripple,
      timestamp: Date.now(),
    })
  }

  /**
   * 发送社交分红通知
   */
  sendSocialDividendNotification(userId: string, dividend: {
    fromNickname: string
    amount: { time: number; energy: number; reputation: number }
    description: string
  }) {
    this.sendToUser(userId, {
      type: 'social_dividend',
      payload: dividend,
      timestamp: Date.now(),
    })
  }

  /**
   * 广播新谣言
   */
  broadcastRumor(rumor: { id: string; content: string; confidence: number }) {
    this.broadcast({
      type: 'rumor',
      payload: rumor,
      timestamp: Date.now(),
    })
  }

  /**
   * 发送信息分享通知
   */
  sendInformationSharedNotification(userId: string, info: {
    fromNickname: string
    infoTitle: string
    infoTier: string
  }) {
    this.sendToUser(userId, {
      type: 'information_shared',
      payload: info,
      timestamp: Date.now(),
    })
  }

  /**
   * 发送信任值变化通知
   */
  sendTrustChangeNotification(userId: string, change: {
    fromNickname: string
    oldTrust: number
    newTrust: number
    reason: string
  }) {
    this.sendToUser(userId, {
      type: 'trust_change',
      payload: change,
      timestamp: Date.now(),
    })
  }

  /**
   * 广播在线玩家数
   */
  private broadcastPlayerCount() {
    this.broadcast({
      type: 'player_count',
      payload: { online: this.clients.size },
      timestamp: Date.now(),
    })
  }

  // ---------- 状态查询 ----------

  getStatus() {
    const authenticatedCount = Array.from(this.clients.values())
      .filter(c => c.userId !== null).length

    return {
      totalConnections: this.clients.size,
      authenticatedConnections: authenticatedCount,
      anonymousConnections: this.clients.size - authenticatedCount,
    }
  }
}

export const realtimeService = new RealtimeService()
