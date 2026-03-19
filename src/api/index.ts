/**
 * LifeLine API Client
 * 封装与后端 REST API 的通信
 * Phase 1: 完整的游戏数据 API
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001'

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

  /** 购买物品 */
  buyItem(itemId: string) {
    return request<{ ok: boolean; wallet: any; inventory: any[]; tags: any[] }>(
      'POST', `/api/items/${itemId}/buy`
    )
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
