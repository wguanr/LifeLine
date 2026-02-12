import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GameEvent } from '@/types'
import { mockEvents } from '@/data/events'

export const useEventStore = defineStore('event', () => {
  const events = ref<GameEvent[]>([])
  const isLoading = ref(false)
  const activeEventIds = ref<Set<string>>(new Set())
  const completedEventIds = ref<Set<string>>(new Set())

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

  const startEvent = (eventId: string) => {
    activeEventIds.value.add(eventId)
  }

  const completeEvent = (eventId: string) => {
    activeEventIds.value.delete(eventId)
    completedEventIds.value.add(eventId)
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
