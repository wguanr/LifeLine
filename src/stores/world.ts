import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WorldType } from '@/types'
import { worldApi, worldlineApi, getToken } from '@/api'

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

/** 世界状态维度 */
export interface WorldDimensions {
  stability: number
  prosperity: number
  freedom: number
  knowledge: number
  solidarity: number
}

/** 资源潮汐乘数 */
export interface TideMultiplier {
  time: number
  energy: number
  reputation: number
}

export const useWorldStore = defineStore('world', () => {
  const currentWorld = ref<WorldType>('real')
  /** 是否已连接后端 */
  const isOnline = ref(false)

  const isRealWorld = computed(() => currentWorld.value === 'real')
  const isChainWorld = computed(() => currentWorld.value === 'chain')

  const switchWorld = (world: WorldType) => {
    currentWorld.value = world
  }

  const toggleWorld = () => {
    currentWorld.value = currentWorld.value === 'real' ? 'chain' : 'real'
  }

  // ==================== 世界状态 ====================

  const worldEpoch = ref('genesis')
  const worldEpochName = ref('创世纪')
  const worldEpochDescription = ref('世界初生，一切皆有可能。')
  const worldDimensions = ref<WorldDimensions>({
    stability: 0.5,
    prosperity: 0.5,
    freedom: 0.5,
    knowledge: 0.5,
    solidarity: 0.5,
  })
  const tideMultiplier = ref<TideMultiplier>({
    time: 1.0,
    energy: 1.0,
    reputation: 1.0,
  })

  /**
   * 从后端加载世界状态
   */
  const loadWorldState = async () => {
    try {
      const res = await worldApi.getWorldState()
      if (res.data && res.data.world) {
        const w = res.data.world
        worldEpoch.value = w.epoch || 'genesis'
        worldEpochName.value = w.epochName || '创世纪'
        worldEpochDescription.value = w.epochDescription || ''
        if (w.dimensions) {
          worldDimensions.value = w.dimensions
        }
        if (w.tideMultiplier) {
          tideMultiplier.value = w.tideMultiplier
        }
        isOnline.value = true
        console.log(`[WorldStore] 世界状态已加载: ${worldEpochName.value}`)
      }
    } catch (err) {
      console.warn('[WorldStore] 加载世界状态失败:', err)
    }
  }

  // ==================== 世界线记录 ====================

  const worldlineRecords = ref<WorldlineRecord[]>([])

  // 持久化（本地备份）
  const saveWorldline = () => {
    uni.setStorageSync('choser_worldline', JSON.stringify(worldlineRecords.value))
  }

  const loadWorldlineLocal = () => {
    const stored = uni.getStorageSync('choser_worldline')
    if (stored) {
      try {
        worldlineRecords.value = JSON.parse(stored)
      } catch (e) {
        worldlineRecords.value = []
      }
    }
  }

  /**
   * 从后端加载世界线记录
   * 如果后端有数据则使用后端数据，否则保留本地数据
   */
  const loadWorldlineFromApi = async () => {
    if (!getToken()) {
      loadWorldlineLocal()
      return
    }

    try {
      const res = await worldlineApi.getRecords()
      if (res.data && res.data.records && res.data.records.length > 0) {
        worldlineRecords.value = res.data.records
        saveWorldline() // 同步到本地
        console.log(`[WorldStore] 从后端加载了 ${worldlineRecords.value.length} 条世界线记录`)
        return
      }
    } catch (err) {
      console.warn('[WorldStore] 从后端加载世界线失败:', err)
    }

    // 回退到本地
    loadWorldlineLocal()
  }

  // 初始化时加载本地数据
  loadWorldlineLocal()

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

  /**
   * 初始化：加载世界状态和世界线
   */
  const initWorld = async () => {
    await loadWorldState()
    await loadWorldlineFromApi()
  }

  return {
    currentWorld,
    isRealWorld,
    isChainWorld,
    isOnline,
    switchWorld,
    toggleWorld,
    // 世界状态
    worldEpoch,
    worldEpochName,
    worldEpochDescription,
    worldDimensions,
    tideMultiplier,
    loadWorldState,
    // 世界线
    worldlineEvents,
    worldlineRecords,
    worldlineBranches,
    recordEvent,
    recordChoice,
    recordEventComplete,
    seedDemoData,
    // 初始化
    initWorld,
    loadWorldlineFromApi,
  }
})
