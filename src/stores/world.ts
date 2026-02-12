import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WorldType } from '@/types'

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
  const worldlineEvents = ref<Array<{ id: string; title: string; timestamp: number }>>([])

  const recordEvent = (eventId: string, title: string) => {
    worldlineEvents.value.push({
      id: eventId,
      title,
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
    recordEvent
  }
})
