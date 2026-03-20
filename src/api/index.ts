/**
 * LifeLine API Client
 * 封装与后端 REST API 的通信
 * Phase 3: 完整的游戏数据 API（含社交、信息、市场、结算预览）
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001'
const WS_BASE = (import.meta.env.VITE_WS_BASE || 'ws://localhost:3001') + '/ws'

// ==================== Token 管理 ====================

let _token: string | null = null

export function getToken(): string | null {
  if (_token) return _token
  try {
    _token = uni.getStorageSync('ll_token') || null
  } catch {
    _token = null
  }
  return _token
}

export function setToken(token: string) {
  _token = token
  uni.setStorageSync('ll_token', token)
}

export function clearToken() {
  _token = null
  uni.removeStorageSync('ll_token')
}

// ==================== 请求封装 ====================

interface ApiResponse<T = any> {
  data: T | null
  error: string | null
  status: number
}

async function request<T = any>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: any
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${path}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    const data = await res.json()

    if (!res.ok) {
      return { data: null, error: data.error || '请求失败', status: res.status }
    }

    return { data, error: null, status: res.status }
  } catch (err) {
    console.error(`API ${method} ${path} 失败:`, err)
    return { data: null, error: '网络连接失败', status: 0 }
  }
}

// ==================== 认证 API ====================

export const authApi = {
  /** 注册 */
  register(email: string, password: string, nickname: string, avatar?: string) {
    return request<{ token: string; user: any }>('POST', '/api/auth/register', {
      email, password, nickname, avatar,
    })
  },

  /** 登录 */
  login(email: string, password: string) {
    return request<{ token: string; user: any }>('POST', '/api/auth/login', {
      email, password,
    })
  },

  /** 获取当前用户信息 */
  getMe() {
    return request<{ user: any }>('GET', '/api/auth/me')
  },

  /** 更新用户信息 */
  updateMe(data: { nickname?: string; avatar?: string; bio?: string; motto?: string }) {
    return request<{ user: any }>('PATCH', '/api/auth/me', data)
  },
}

// ==================== 事件 API ====================

export const eventApi = {
  /** 获取所有活跃事件 */
  getEvents() {
    return request<{ events: any[] }>('GET', '/api/events')
  },

  /** 获取单个事件详情 */
  getEvent(id: string) {
    return request<{ event: any }>('GET', `/api/events/${id}`)
  },

  /** 开始参与事件 */
  startEvent(eventId: string) {
    return request<{ ok: boolean }>('POST', `/api/events/${eventId}/start`)
  },

  /** 完成事件 */
  completeEvent(eventId: string) {
    return request<{ ok: boolean }>('POST', `/api/events/${eventId}/complete`)
  },

  /** 记录用户选择（带非对称结算） */
  recordChoice(data: {
    eventId: string
    stageId: string
    choiceId: string
    choiceText: string
    outcome?: {
      resultText?: string
      rewards?: any
      penalties?: any
    }
    // 兼容旧格式
    resultText?: string
    cost?: any
    reward?: any
  }) {
    return request<{ id: string; wallet: any; tags: any[] }>('POST', '/api/choices', data)
  },

  /** 获取当前用户的选择历史 */
  getChoices(limit?: number) {
    const query = limit ? `?limit=${limit}` : ''
    return request<{ choices: any[] }>('GET', `/api/choices${query}`)
  },
}

// ==================== 物品 API ====================

export const itemApi = {
  /** 获取所有可见物品 */
  getItems() {
    return request<{ items: any[] }>('GET', '/api/items')
  },

  /** 购买物品（固定价格） */
  buyItem(itemId: string) {
    return request<{ ok: boolean; wallet: any; inventory: any[]; tags: any[] }>(
      'POST', `/api/items/${itemId}/buy`
    )
  },
}

// ==================== 物品市场 API（Bonding Curve 动态定价） ====================

export const marketApi = {
  /** 获取物品市场列表（含动态价格） */
  getMarketItems() {
    return request<{
      count: number
      items: Array<{
        id: string
        name: string
        description: string
        icon: string
        rarity: string
        category: string
        tags: string[]
        featureTags: string[]
        story: string | null
        image: string | null
        stackable: boolean
        maxStack: number
        maxMint: number
        mintedCount: number
        dynamicPrice: {
          baseCost: { time?: number; energy?: number }
          bondingMultiplier: number
          worldSensitivityMultiplier: number
          finalCost: { time: number; energy: number }
          trend: 'rising' | 'falling' | 'stable'
          mintedCount: number
          maxMint: number
          scarcity: number
        }
      }>
    }>('GET', '/api/items/market')
  },

  /** 获取单个物品的动态价格 */
  getItemPrice(itemId: string) {
    return request<{
      baseCost: { time?: number; energy?: number }
      bondingMultiplier: number
      worldSensitivityMultiplier: number
      finalCost: { time: number; energy: number }
      trend: 'rising' | 'falling' | 'stable'
      mintedCount: number
      maxMint: number
      scarcity: number
    }>('GET', `/api/items/${itemId}/price`)
  },

  /** 使用动态价格购买物品 */
  buyItemDynamic(itemId: string) {
    return request<{
      ok: boolean
      wallet: any
      inventory: any[]
      tags: any[]
      dynamicPrice: any
    }>('POST', `/api/items/${itemId}/buy-dynamic`)
  },
}

// ==================== 结算预览 API ====================

export const settlementApi = {
  /** 预览非对称结算结果（不实际执行） */
  preview(data: {
    eventId: string
    outcome?: {
      rewards?: { time?: number; energy?: number; reputation?: number; tags?: Record<string, number> }
      penalties?: { time?: number; energy?: number; reputation?: number }
    }
  }) {
    return request<{
      settlement: {
        identityMultiplier: number
        tideMultiplier: { time: number; energy: number; reputation: number }
        epochBonus: number
        epoch: string
        estimatedRewards: { time: number; energy: number; reputation: number }
        estimatedCosts: { time: number; energy: number; reputation: number }
      }
    }>('POST', '/api/settlement/preview', data)
  },
}

// ==================== 用户资源 API ====================

export const resourceApi = {
  /** 获取当前用户钱包 */
  getWallet() {
    return request<{ wallet: any }>('GET', '/api/wallet')
  },

  /** 获取当前用户标签（身份光谱） */
  getUserTags() {
    return request<{ tags: any[] }>('GET', '/api/user/tags')
  },

  /** 获取当前用户背包 */
  getInventory() {
    return request<{ inventory: any[] }>('GET', '/api/inventory')
  },

  /** 获取当前用户历史记录 */
  getUserHistory() {
    return request<{ history: any }>('GET', '/api/user/history')
  },
}

// ==================== 世界 API ====================

export const worldApi = {
  /** 获取当前世界状态 */
  getWorldState() {
    return request<{ world: any }>('GET', '/api/world')
  },

  /** 获取所有纪元定义 */
  getEpochs() {
    return request<{ epochs: any[] }>('GET', '/api/world/epochs')
  },

  /** 获取世界历史快照 */
  getSnapshots() {
    return request<{ count: number; snapshots: any[] }>('GET', '/api/debug/world/snapshots')
  },
}

// ==================== 世界线 API ====================

export const worldlineApi = {
  /** 获取当前用户的世界线记录 */
  getRecords() {
    return request<{ records: any[] }>('GET', '/api/worldline')
  },
}

// ==================== 事件遗产 API ====================

export const legacyApi = {
  /** 获取事件遗产列表 */
  getLegacies(eventId?: string) {
    const query = eventId ? `?eventId=${eventId}` : ''
    return request<{ legacies: any[] }>('GET', `/api/legacies${query}`)
  },
}

// ==================== 社交引擎 API ====================

export const socialApi = {
  /** 关注用户 */
  follow(targetUserId: string) {
    return request<{ success: boolean; relation: any }>('POST', '/api/social/follow', { targetUserId })
  },

  /** 取消关注 */
  unfollow(targetUserId: string) {
    return request<{ success: boolean }>('POST', '/api/social/unfollow', { targetUserId })
  },

  /** 获取关注列表 */
  getFollowing() {
    return request<any[]>('GET', '/api/social/following')
  },

  /** 获取粉丝列表 */
  getFollowers() {
    return request<any[]>('GET', '/api/social/followers')
  },

  /** 获取互相关注 */
  getMutuals() {
    return request<any[]>('GET', '/api/social/mutuals')
  },

  /** 获取社交网络概览 */
  getOverview() {
    return request<{
      followingCount: number
      followerCount: number
      mutualCount: number
      avgTrustGiven: number
      avgTrustReceived: number
    }>('GET', '/api/social/overview')
  },

  /** 记录互动 */
  interact(targetUserId: string, type: 'positive' | 'negative' | 'betrayal') {
    return request<{ success: boolean; trustAfter: number }>('POST', '/api/social/interact', { targetUserId, type })
  },

  /** 获取社交圈声誉加成 */
  getReputationBonus() {
    return request<any>('GET', '/api/social/reputation-bonus')
  },

  /** 获取圈子选择倾向 */
  getCircleTendency(eventId: string) {
    return request<any>('GET', `/api/social/circle-tendency/${eventId}`)
  },
}

// ==================== 信息引擎 API ====================

export const infoApi = {
  /** 获取可用信息列表 */
  getAvailable() {
    return request<any[]>('GET', '/api/info/available')
  },

  /** 获取已解锁的信息 */
  getMyInfo() {
    return request<any[]>('GET', '/api/info/my')
  },

  /** 获取信息市场统计 */
  getMarketStats() {
    return request<{
      totalPieces: number
      tierDistribution: { public: number; deep: number; core: number }
      avgAccuracy: number
      activeRumors: number
    }>('GET', '/api/info/market')
  },

  /** 为事件生成信息 */
  generateEventInfo(eventId: string) {
    return request<{ success: boolean; generated: number; pieces: any[] }>('POST', `/api/info/generate/${eventId}`)
  },

  /** 解锁信息 */
  unlock(informationId: string) {
    return request<any>('POST', '/api/info/unlock', { informationId })
  },

  /** 分享信息给其他用户 */
  share(informationId: string, targetUserId: string) {
    return request<any>('POST', '/api/info/share', { informationId, targetUserId })
  },

  /** 生成谣言 */
  generateRumor() {
    return request<{ success: boolean; rumor: any }>('POST', '/api/info/generate-rumor')
  },
}

// ==================== WebSocket 客户端 ====================

export interface WsMessage {
  type: string
  payload: any
  timestamp?: number
}

type WsCallback = (msg: WsMessage) => void

class WebSocketClient {
  private ws: WebSocket | null = null
  private listeners: Map<string, Set<WsCallback>> = new Map()
  private globalListeners: Set<WsCallback> = new Set()
  private reconnectTimer: any = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private _isConnected = false

  get isConnected(): boolean {
    return this._isConnected
  }

  connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return
    }

    try {
      this.ws = new WebSocket(WS_BASE)

      this.ws.onopen = () => {
        this._isConnected = true
        this.reconnectAttempts = 0
        this.emit({ type: 'system', payload: 'Connected', timestamp: Date.now() })
      }

      this.ws.onmessage = (event) => {
        try {
          const msg: WsMessage = JSON.parse(event.data)
          if (!msg.timestamp) msg.timestamp = Date.now()
          this.emit(msg)
        } catch {
          // Ignore parse errors
        }
      }

      this.ws.onclose = () => {
        this._isConnected = false
        this.emit({ type: 'system', payload: 'Disconnected', timestamp: Date.now() })
        this.scheduleReconnect()
      }

      this.ws.onerror = () => {
        this._isConnected = false
      }
    } catch {
      this._isConnected = false
      this.scheduleReconnect()
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.reconnectAttempts = this.maxReconnectAttempts // Prevent reconnect
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this._isConnected = false
  }

  /** 监听特定类型的消息 */
  on(type: string, callback: WsCallback): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(callback)
    return () => this.listeners.get(type)?.delete(callback)
  }

  /** 监听所有消息 */
  onAny(callback: WsCallback): () => void {
    this.globalListeners.add(callback)
    return () => this.globalListeners.delete(callback)
  }

  /** 发送消息 */
  send(msg: WsMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg))
    }
  }

  private emit(msg: WsMessage): void {
    // 通知全局监听器
    for (const cb of this.globalListeners) {
      try { cb(msg) } catch { /* ignore */ }
    }
    // 通知特定类型监听器
    const typeListeners = this.listeners.get(msg.type)
    if (typeListeners) {
      for (const cb of typeListeners) {
        try { cb(msg) } catch { /* ignore */ }
      }
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
    this.reconnectAttempts++
    this.reconnectTimer = setTimeout(() => this.connect(), delay)
  }
}

/** 全局 WebSocket 客户端单例 */
export const wsClient = new WebSocketClient()

// ==================== 兼容旧的 gameApi ====================

export const gameApi = {
  getEvents: eventApi.getEvents,
  getEvent: eventApi.getEvent,
  getItems: itemApi.getItems,
  getTags() {
    return request<{ tags: any[] }>('GET', '/api/tags')
  },
  getWorldState: worldApi.getWorldState,
  recordChoice: eventApi.recordChoice,
}
