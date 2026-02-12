import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WorldType } from '@/types'

interface WorldlineRecord {
  id: string
  type: 'event_start' | 'choice' | 'event_complete'
  eventId: string
  title: string
  detail?: string
  meta?: Record<string, any>
  timestamp: number
}

export const useWorldStore = defineStore('world', () => {
  const currentWorld = ref<WorldType>('real')

  const isRealWorld = computed(() => currentWorld.value === 'real')
  const isChainWorld = computed(() => currentWorld.value === 'chain')

  const switchWorld = (world: WorldType) => {
    currentWorld.value = world
  }

  const toggleWorld = () => {
    currentWorld.value = currentWorld.value === 'real' ? 'chain' : 'real'
  }

  // 世界线事件记录
  const worldlineRecords = ref<WorldlineRecord[]>([])

  // 兼容旧API
  const worldlineEvents = computed(() => worldlineRecords.value.filter(r => r.type === 'event_start'))

  const recordEvent = (eventId: string, title: string) => {
    worldlineRecords.value.push({
      id: `evt_${Date.now()}`,
      type: 'event_start',
      eventId,
      title,
      timestamp: Date.now()
    })
  }

  const recordChoice = (eventId: string, eventTitle: string, choiceText: string) => {
    worldlineRecords.value.push({
      id: `choice_${Date.now()}`,
      type: 'choice',
      eventId,
      title: eventTitle,
      detail: choiceText,
      timestamp: Date.now()
    })
  }

  const recordEventComplete = (eventId: string, eventTitle: string, meta?: Record<string, any>) => {
    worldlineRecords.value.push({
      id: `complete_${Date.now()}`,
      type: 'event_complete',
      eventId,
      title: eventTitle,
      meta,
      timestamp: Date.now()
    })
  }

  return {
    currentWorld,
    isRealWorld,
    isChainWorld,
    switchWorld,
    toggleWorld,
    worldlineEvents,
    worldlineRecords,
    recordEvent,
    recordChoice,
    recordEventComplete
  }
})
