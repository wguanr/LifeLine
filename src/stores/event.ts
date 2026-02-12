import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GameEvent } from '@/types'
import { mockEvents } from '@/data/events'

export const useEventStore = defineStore('event', () => {
  const events = ref<GameEvent[]>([])
  const isLoading = ref(false)

  const availableEvents = computed(() => {
    return events.value.filter(e => e.status === 'active')
  })

  const loadEvents = async () => {
    isLoading.value = true
    try {
      events.value = mockEvents
    } finally {
      isLoading.value = false
    }
  }

  const getEventById = (id: string) => {
    return events.value.find(e => e.id === id)
  }

  return {
    events,
    isLoading,
    availableEvents,
    loadEvents,
    getEventById
  }
})
