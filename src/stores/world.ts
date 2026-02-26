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

/** 聚合后的世界线节点：一个事件 = 一个分支 */
export interface WorldlineBranch {
  eventId: string
  eventTitle: string
  eventType: string
  startTime: number
  endTime?: number
  completed: boolean
  /** 该事件中用户做出的所有选择 */
  choices: Array<{
    id: string
    text: string
    resultText?: string
    timestamp: number
  }>
  /** 事件完成时的结局摘要 */
  endingSummary?: string
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

  // 世界线事件记录（原始记录）
  const worldlineRecords = ref<WorldlineRecord[]>([])

  // 持久化
  const saveWorldline = () => {
    uni.setStorageSync('choser_worldline', JSON.stringify(worldlineRecords.value))
  }

  const loadWorldline = () => {
    const stored = uni.getStorageSync('choser_worldline')
    if (stored) {
      try {
        worldlineRecords.value = JSON.parse(stored)
      } catch (e) {
        worldlineRecords.value = []
      }
    }
  }

  // 初始化时加载
  loadWorldline()

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
    saveWorldline()
  }

  const recordChoice = (eventId: string, eventTitle: string, choiceText: string, resultText?: string) => {
    worldlineRecords.value.push({
      id: `choice_${Date.now()}`,
      type: 'choice',
      eventId,
      title: eventTitle,
      detail: choiceText,
      meta: resultText ? { resultText } : undefined,
      timestamp: Date.now()
    })
    saveWorldline()
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
    saveWorldline()
  }

  /**
   * 聚合后的世界线分支列表
   * 每个事件聚合为一个分支节点，包含该事件的所有选择和结局
   * 按时间倒序排列（最新的在前）
   */
  const worldlineBranches = computed<WorldlineBranch[]>(() => {
    const branchMap = new Map<string, WorldlineBranch>()

    // 按时间正序遍历所有记录
    const sorted = [...worldlineRecords.value].sort((a, b) => a.timestamp - b.timestamp)

    for (const record of sorted) {
      if (!branchMap.has(record.eventId)) {
        branchMap.set(record.eventId, {
          eventId: record.eventId,
          eventTitle: record.title,
          eventType: record.meta?.eventType || 'story',
          startTime: record.timestamp,
          completed: false,
          choices: []
        })
      }

      const branch = branchMap.get(record.eventId)!

      if (record.type === 'choice') {
        branch.choices.push({
          id: record.id,
          text: record.detail || '',
          resultText: record.meta?.resultText,
          timestamp: record.timestamp
        })
      }

      if (record.type === 'event_complete') {
        branch.completed = true
        branch.endTime = record.timestamp
        branch.endingSummary = record.meta?.endingSummary || record.detail
      }
    }

    // 按开始时间倒序
    return Array.from(branchMap.values()).sort((a, b) => b.startTime - a.startTime)
  })

  /** 添加模拟数据用于展示 */
  const seedDemoData = () => {
    if (worldlineRecords.value.length > 0) return

    const now = Date.now()

    // 事件1：咖啡店偶遇 - 已完成
    worldlineRecords.value.push(
      {
        id: 'evt_demo_1',
        type: 'event_start',
        eventId: 'evt_coffee_encounter',
        title: '咖啡店偶遇',
        meta: { eventType: 'social' },
        timestamp: now - 7200000
      },
      {
        id: 'choice_demo_1a',
        type: 'choice',
        eventId: 'evt_coffee_encounter',
        title: '咖啡店偶遇',
        detail: '👋 主动上前打招呼',
        meta: { resultText: '"哇！真的是你！"老同学惊喜地站起来，热情地和你拥抱。' },
        timestamp: now - 7100000
      },
      {
        id: 'choice_demo_1b',
        type: 'choice',
        eventId: 'evt_coffee_encounter',
        title: '咖啡店偶遇',
        detail: '📲 交换联系方式，约下次聚会',
        meta: { resultText: '你们加了微信，约好下周一起吃饭。说不定这是一个新的职业机会！' },
        timestamp: now - 7000000
      },
      {
        id: 'complete_demo_1',
        type: 'event_complete',
        eventId: 'evt_coffee_encounter',
        title: '咖啡店偶遇',
        meta: { endingSummary: '你重新联系上了老同学，获得了一个潜在的职业机会。' },
        timestamp: now - 6900000
      }
    )

    // 事件2：暴雨突袭 - 已完成
    worldlineRecords.value.push(
      {
        id: 'evt_demo_2',
        type: 'event_start',
        eventId: 'evt_rainy_day',
        title: '暴雨突袭',
        meta: { eventType: 'story' },
        timestamp: now - 5400000
      },
      {
        id: 'choice_demo_2a',
        type: 'choice',
        eventId: 'evt_rainy_day',
        title: '暴雨突袭',
        detail: '📚 躲进书店等雨停',
        meta: { resultText: '你推开书店的门，铃铛叮当响了一声。店里很安静，飘着咖啡和旧书的味道。' },
        timestamp: now - 5300000
      },
      {
        id: 'choice_demo_2b',
        type: 'choice',
        eventId: 'evt_rainy_day',
        title: '暴雨突袭',
        detail: '📖 坐下来，安静地读一会儿',
        meta: { resultText: '"真正重要的东西，用眼睛是看不见的。"你读完最后一页，雨也停了。老爷爷说："这本书送你了。"' },
        timestamp: now - 5200000
      },
      {
        id: 'complete_demo_2',
        type: 'event_complete',
        eventId: 'evt_rainy_day',
        title: '暴雨突袭',
        meta: { endingSummary: '你在书店度过了一个美好的雨天，收获了一本《小王子》。' },
        timestamp: now - 5100000
      }
    )

    // 事件3：流浪猫 - 已完成
    worldlineRecords.value.push(
      {
        id: 'evt_demo_3',
        type: 'event_start',
        eventId: 'evt_stray_cat',
        title: '流浪猫',
        meta: { eventType: 'social' },
        timestamp: now - 3600000
      },
      {
        id: 'choice_demo_3a',
        type: 'choice',
        eventId: 'evt_stray_cat',
        title: '流浪猫',
        detail: '🐟 去便利店买罐猫粮喂它',
        meta: { resultText: '你买了一罐金枪鱼猫粮。橘猫吃得狼吞虎咽，吃完还舔了舔你的手。' },
        timestamp: now - 3500000
      },
      {
        id: 'choice_demo_3b',
        type: 'choice',
        eventId: 'evt_stray_cat',
        title: '流浪猫',
        detail: '🐱 好吧，你赢了，跟我回家',
        meta: { resultText: '你给它取名"橘座"。带去宠物医院检查，医生说它很健康，就是太胖了。' },
        timestamp: now - 3400000
      },
      {
        id: 'complete_demo_3',
        type: 'event_complete',
        eventId: 'evt_stray_cat',
        title: '流浪猫',
        meta: { endingSummary: '橘座成了你最忠实的室友，每次加班它都陪着你。' },
        timestamp: now - 3300000
      }
    )

    // 事件4：加班请求 - 进行中
    worldlineRecords.value.push(
      {
        id: 'evt_demo_4',
        type: 'event_start',
        eventId: 'evt_overtime_request',
        title: '加班请求',
        meta: { eventType: 'challenge' },
        timestamp: now - 1800000
      },
      {
        id: 'choice_demo_4a',
        type: 'choice',
        eventId: 'evt_overtime_request',
        title: '加班请求',
        detail: '🤝 提议明天一早来加班完成',
        meta: { resultText: '"老板，我可以明天早上7点来，保证中午前完成，您看行吗？"' },
        timestamp: now - 1700000
      }
    )

    // 事件5：旧照片 - 进行中
    worldlineRecords.value.push(
      {
        id: 'evt_demo_5',
        type: 'event_start',
        eventId: 'evt_old_photo',
        title: '旧照片',
        meta: { eventType: 'story' },
        timestamp: now - 600000
      }
    )
  }

  return {
    currentWorld,
    isRealWorld,
    isChainWorld,
    switchWorld,
    toggleWorld,
    worldlineEvents,
    worldlineRecords,
    worldlineBranches,
    recordEvent,
    recordChoice,
    recordEventComplete,
    seedDemoData
  }
})
