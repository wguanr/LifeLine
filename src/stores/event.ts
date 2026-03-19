import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GameEvent } from '@/types'
import { mockEvents } from '@/data/events'
import { aigcEvents } from '@/data/aigc_events'
import { generatedEvents } from '@/data/generated_events'
import { eventApi, getToken } from '@/api'

export const useEventStore = defineStore('event', () => {
  const events = ref<GameEvent[]>([])
  const isLoading = ref(false)
  const activeEventIds = ref<Set<string>>(new Set())
  const completedEventIds = ref<Set<string>>(new Set())
  /** 是否已连接后端 */
  const isOnline = ref(false)

  // 持久化事件状态（本地备份）
  const saveEventState = () => {
    uni.setStorageSync('choser_active_events', JSON.stringify([...activeEventIds.value]))
    uni.setStorageSync('choser_completed_events', JSON.stringify([...completedEventIds.value]))
  }

  const loadEventState = () => {
    try {
      const active = uni.getStorageSync('choser_active_events')
      const completed = uni.getStorageSync('choser_completed_events')
      if (active) activeEventIds.value = new Set(JSON.parse(active))
      if (completed) completedEventIds.value = new Set(JSON.parse(completed))
    } catch (e) {
      // ignore
    }
  }

  loadEventState()

  const availableEvents = computed(() => {
    return events.value.filter(e => e.status === 'active')
  })

  // AIGC 事件（来自现实世界新闻）
  const aigcEventList = computed(() => {
    return events.value.filter(e => e.id.startsWith('aigc_'))
  })

  // 原始事件（手工设计的）
  const originalEventList = computed(() => {
    return events.value.filter(e => !e.id.startsWith('aigc_'))
  })

  // 规范化AIGC事件数据格式，对齐到GameEvent类型
  const normalizeAigcEvent = (raw: any): GameEvent => {
    const stages = (raw.stages || []).map((s: any) => ({
      id: s.stageId || s.id,
      title: s.title || '',
      description: s.description || s.title || '',
      choices: (s.choices || []).map((c: any) => ({
        id: c.id,
        text: c.text,
        cost: c.cost || {},
        outcome: {
          nextStageId: c.outcome?.nextStageId,
          isEnding: c.outcome?.isEnding,
          resultText: c.outcome?.resultText || c.outcome?.description || '',
          rewards: normalizeRewards(c.outcome?.rewards || c.outcome),
          penalties: c.outcome?.penalties
        }
      }))
    }))
    return {
      ...raw,
      stages,
      status: raw.status || 'active',
      participantCount: raw.participantCount || 1000,
      createdAt: raw.createdAt || Date.now()
    } as GameEvent
  }

  // 规范化rewards中的tags格式
  const normalizeRewards = (outcome: any) => {
    if (!outcome) return undefined
    const rewards: any = { ...outcome }
    // 如果tags是 [{id, value}] 数组，转换为 Record<string, number>
    if (Array.isArray(rewards.tags)) {
      const tagMap: Record<string, number> = {}
      rewards.tags.forEach((t: any) => {
        if (typeof t === 'object' && t.id) {
          tagMap[t.id] = t.value || 1
        } else if (typeof t === 'string') {
          tagMap[t] = 1
        }
      })
      rewards.tags = tagMap
    }
    // 删除不属于rewards的字段
    delete rewards.description
    return (rewards.tags || rewards.items || rewards.time || rewards.energy || rewards.reputation)
      ? rewards : undefined
  }

  /**
   * 加载事件列表
   * 优先从后端 API 加载，失败时回退到本地 mock 数据
   */
  const loadEvents = async () => {
    isLoading.value = true
    try {
      // 如果有 token，尝试从后端加载
      if (getToken()) {
        const res = await eventApi.getEvents()
        if (res.data && res.data.events && res.data.events.length > 0) {
          // 后端返回的事件已经是标准格式，直接使用
          events.value = res.data.events.map((e: any) => ({
            ...e,
            status: e.status || 'active',
            participantCount: e.participantCount || 1000,
            createdAt: e.createdAt || Date.now(),
          })) as GameEvent[]
          isOnline.value = true
          console.log(`[EventStore] 从后端加载了 ${events.value.length} 个事件`)
          return
        }
      }
    } catch (err) {
      console.warn('[EventStore] 后端加载失败，回退到本地数据:', err)
    }

    // 回退：从本地 mock 数据加载
    try {
      const aigcNormalized = ([...aigcEvents] as any[]).map(normalizeAigcEvent)
      const genNormalized = ([...generatedEvents] as any[]).map(normalizeAigcEvent)
      events.value = [...mockEvents, ...aigcNormalized, ...genNormalized]
      isOnline.value = false
      console.log(`[EventStore] 从本地加载了 ${events.value.length} 个事件`)
    } finally {
      isLoading.value = false
    }
  }

  const getEventById = (id: string) => {
    return events.value.find(e => e.id === id)
  }

  /**
   * 开始事件
   * 联网模式下同步到后端
   */
  const startEvent = async (eventId: string) => {
    activeEventIds.value.add(eventId)
    saveEventState()

    if (isOnline.value && getToken()) {
      try {
        await eventApi.startEvent(eventId)
      } catch (err) {
        console.warn('[EventStore] 同步开始事件失败:', err)
      }
    }
  }

  /**
   * 完成事件
   * 联网模式下同步到后端
   */
  const completeEvent = async (eventId: string) => {
    activeEventIds.value.delete(eventId)
    completedEventIds.value.add(eventId)
    saveEventState()

    if (isOnline.value && getToken()) {
      try {
        await eventApi.completeEvent(eventId)
      } catch (err) {
        console.warn('[EventStore] 同步完成事件失败:', err)
      }
    }
  }

  const isEventActive = (eventId: string) => {
    return activeEventIds.value.has(eventId)
  }

  const isEventCompleted = (eventId: string) => {
    return completedEventIds.value.has(eventId)
  }

  /**
   * 记录选择并执行结算
   * 联网模式下调用后端非对称结算引擎
   */
  const recordChoice = async (data: {
    eventId: string
    stageId: string
    choiceId: string
    choiceText: string
    outcome?: {
      resultText?: string
      rewards?: any
      penalties?: any
    }
  }) => {
    if (isOnline.value && getToken()) {
      try {
        const res = await eventApi.recordChoice(data)
        if (res.data) {
          console.log('[EventStore] 选择已结算:', res.data)
          return res.data
        }
      } catch (err) {
        console.warn('[EventStore] 记录选择失败:', err)
      }
    }
    return null
  }

  return {
    events,
    isLoading,
    isOnline,
    availableEvents,
    aigcEventList,
    originalEventList,
    loadEvents,
    getEventById,
    startEvent,
    completeEvent,
    isEventActive,
    isEventCompleted,
    recordChoice,
    activeEventIds,
    completedEventIds
  }
})
