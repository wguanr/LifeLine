import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GameEvent } from '@/types'
import { mockEvents } from '@/data/events'
import { aigcEvents } from '@/data/aigc_events'

export const useEventStore = defineStore('event', () => {
  const events = ref<GameEvent[]>([])
  const isLoading = ref(false)
  const activeEventIds = ref<Set<string>>(new Set())
  const completedEventIds = ref<Set<string>>(new Set())

  // 持久化事件状态
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

  const loadEvents = async () => {
    isLoading.value = true
    try {
      // 合并原始事件和AIGC事件（规范化格式）
      const aigcNormalized = (aigcEvents as any[]).map(normalizeAigcEvent)
      events.value = [...mockEvents, ...aigcNormalized]
    } finally {
      isLoading.value = false
    }
  }

  const getEventById = (id: string) => {
    return events.value.find(e => e.id === id)
  }

  const startEvent = (eventId: string) => {
    activeEventIds.value.add(eventId)
    saveEventState()
  }

  const completeEvent = (eventId: string) => {
    activeEventIds.value.delete(eventId)
    completedEventIds.value.add(eventId)
    saveEventState()
  }

  const isEventActive = (eventId: string) => {
    return activeEventIds.value.has(eventId)
  }

  const isEventCompleted = (eventId: string) => {
    return completedEventIds.value.has(eventId)
  }

  return {
    events,
    isLoading,
    availableEvents,
    aigcEventList,
    originalEventList,
    loadEvents,
    getEventById,
    startEvent,
    completeEvent,
    isEventActive,
    isEventCompleted,
    activeEventIds,
    completedEventIds
  }
})
