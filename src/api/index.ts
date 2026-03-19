/**
 * LifeLine API Client
 * 封装与后端 REST API 的通信
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

// ==================== 游戏数据 API ====================

export const gameApi = {
  /** 获取所有活跃事件 */
  getEvents() {
    return request<{ events: any[] }>('GET', '/api/events')
  },

  /** 获取单个事件详情 */
  getEvent(id: string) {
    return request<{ event: any }>('GET', `/api/events/${id}`)
  },

  /** 获取所有可见物品 */
  getItems() {
    return request<{ items: any[] }>('GET', '/api/items')
  },

  /** 获取所有标签定义 */
  getTags() {
    return request<{ tags: any[] }>('GET', '/api/tags')
  },

  /** 获取当前世界状态 */
  getWorldState() {
    return request<{ world: any }>('GET', '/api/world')
  },

  /** 记录用户选择 */
  recordChoice(data: {
    eventId: string
    stageId: string
    choiceId: string
    choiceText: string
    resultText?: string
    cost?: any
    reward?: any
  }) {
    return request<{ id: string }>('POST', '/api/choices', data)
  },
}
