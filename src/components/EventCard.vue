<template>
  <view class="event-card">
    <!-- 顶部装饰条 -->
    <view class="card-accent" :class="event.type" />
    
    <!-- 内容区 -->
    <view class="card-content">
      <!-- 顶部信息 -->
      <view class="card-header">
        <view class="event-type" :class="event.type">
          <text class="type-icon">{{ getTypeIcon(event.type) }}</text>
          <text class="type-text">{{ getTypeName(event.type) }}</text>
        </view>
        <view class="event-status" :class="event.status">
          {{ getStatusText(event.status) }}
        </view>
      </view>
      
      <!-- 主体内容区 -->
      <view class="card-body">
        <template v-if="mode === 'preview'">
          <text class="event-title">{{ event.title }}</text>
          <text class="event-desc">{{ event.description }}</text>
        </template>
        
        <template v-else-if="mode === 'playing'">
          <text class="stage-title">{{ currentStage?.title }}</text>
          <text class="stage-desc">{{ currentStage?.description }}</text>
        </template>
        
        <template v-else-if="mode === 'result'">
          <text class="result-title">选择结果</text>
          <text class="result-desc">{{ lastResult?.resultText }}</text>
        </template>
      </view>
      
      <!-- 底部操作区 -->
      <view class="card-footer">
        <template v-if="mode === 'preview'">
          <view class="footer-info">
            <view class="entry-fee" v-if="hasEntryFee">
              <view class="fee-label">额定消耗</view>
              <view class="fee-items">
                <view v-if="event.entryFee?.time" class="fee-item time">
                  <text class="fee-icon">⏰</text>
                  <text class="fee-value">{{ event.entryFee.time }}分钟</text>
                </view>
                <view v-if="event.entryFee?.energy" class="fee-item energy">
                  <text class="fee-icon">⚡</text>
                  <text class="fee-value">{{ event.entryFee.energy }}</text>
                </view>
              </view>
            </view>
            <view v-else class="entry-fee free">
              <text class="free-label">随时参与</text>
            </view>
            
            <view class="participants">
              <text class="participants-icon">👥</text>
              <text class="participants-count">{{ formatNumber(event.participantCount || 0) }}</text>
            </view>
          </view>
          
          <button 
            class="action-btn" 
            :class="btnClasses"
            :disabled="!canJoin || !canAffordCurrent"
            @click.stop="handleTapJoin"
          >
            <!-- 涟漪效果层 -->
            <view class="ripple-container">
              <view 
                v-for="ripple in ripples" 
                :key="ripple.id" 
                class="ripple"
                :style="{ left: ripple.x + 'px', top: ripple.y + 'px' }"
              />
            </view>
            
            <!-- 按钮内容 -->
            <template v-if="!canJoin">条件不足</template>
            <template v-else-if="!canAffordCurrent">资源不足</template>
            <template v-else-if="hasEntryFee && multiplier > 0">
              <view class="btn-content">
                <view class="btn-multiplier-row">
                  <text class="btn-multiplier" :class="'level-' + Math.min(multiplier, 5)">×{{ multiplier }}</text>
                  <text class="btn-label">倍投入</text>
                </view>
                <text class="btn-cost-text">
                  {{ costSummary }}
                </text>
              </view>
              <!-- 倒计时进度条 -->
              <view class="btn-timer-bar" v-if="isCountingDown">
                <view class="timer-fill" :style="{ width: timerProgress + '%' }" />
              </view>
            </template>
            <template v-else>
              <text class="btn-text-default">参与事件</text>
            </template>
          </button>
        </template>
        
        <template v-else-if="mode === 'playing'">
          <view class="options-list">
            <view 
              v-for="choice in currentStage?.choices" 
              :key="choice.id"
              class="option-item"
              :class="{ disabled: !canAffordChoice(choice) }"
              @click="handleSelectChoice(choice)"
            >
              <view class="option-main">
                <text class="option-text">{{ choice.text }}</text>
                <view class="option-cost" v-if="choice.cost">
                  <text v-if="choice.cost.time" class="cost-tag time">⏰ {{ choice.cost.time }}</text>
                  <text v-if="choice.cost.energy" class="cost-tag energy">⚡ {{ choice.cost.energy }}</text>
                </view>
              </view>
              <text class="option-arrow">→</text>
            </view>
          </view>
          
          <view class="progress-dots">
            <view 
              v-for="(stage, idx) in event.stages" 
              :key="stage.id"
              class="dot"
              :class="{ active: idx === currentStageIndex, completed: idx < currentStageIndex }"
            />
          </view>
        </template>
        
        <template v-else-if="mode === 'result'">
          <view class="result-rewards" v-if="lastResult?.rewards">
            <view class="rewards-header">
              <text class="rewards-title">✨ 获得奖励</text>
            </view>
            <view class="rewards-grid">
              <view v-if="lastResult.rewards.tags && typeof lastResult.rewards.tags === 'object' && !Array.isArray(lastResult.rewards.tags)" class="reward-tag" v-for="tag in Object.keys(lastResult.rewards.tags)" :key="tag">
                <text class="tag-icon">{{ getTagIcon(tag) }}</text>
                <text class="tag-name">{{ getTagDisplayName(tag) }}</text>
              </view>
              <view v-if="lastResult.rewards.items" class="reward-item" v-for="itemId in lastResult.rewards.items" :key="itemId">
                <text class="item-icon">🎁</text>
                <text class="item-name">{{ getItemName(itemId) }}</text>
              </view>
            </view>
          </view>
          
          <view class="result-penalties" v-if="lastResult?.penalties">
            <view class="penalties-header">
              <text class="penalties-title">⚠️ 代价</text>
            </view>
            <view class="penalties-grid">
              <view v-if="lastResult.penalties.tags" class="penalty-tag" v-for="tag in Object.keys(lastResult.penalties.tags)" :key="tag">
                <text class="tag-icon">{{ getTagIcon(tag) }}</text>
                <text class="tag-name">{{ getTagDisplayName(tag) }}</text>
              </view>
            </view>
          </view>
          
          <button class="action-btn" @click="handleContinue">
            {{ hasNextStage ? '继续' : '完成' }}
          </button>
        </template>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, reactive } from 'vue'
import { useEventStore } from '@/stores/event'
import { useUserStore } from '@/stores/user'
import { useItemStore } from '@/stores/item'
import { useWorldStore } from '@/stores/world'
import { getTagDefinition } from '@/data/tags'
import type { GameEvent, EventStage, EventChoice, EventOutcome } from '@/types'

const props = defineProps<{
  event: GameEvent
}>()

const emit = defineEmits<{
  (e: 'stateChange', state: string): void
}>()

const eventStore = useEventStore()
const userStore = useUserStore()
const itemStore = useItemStore()
const worldStore = useWorldStore()

const mode = ref<'preview' | 'playing' | 'result'>('preview')
const currentStageIndex = ref(0)
const lastResult = ref<EventOutcome | null>(null)
const nextStageId = ref<string | null>(null)

// ========== 快节奏多倍投入 ==========
const multiplier = ref(0)
const maxMultiplier = 10
const CONFIRM_DELAY = 2000
const TIMER_INTERVAL = 50
let confirmTimer: ReturnType<typeof setTimeout> | null = null
let progressTimer: ReturnType<typeof setInterval> | null = null
const timerProgress = ref(100)
const isCountingDown = ref(false)

// ========== 按钮交互效果 ==========
const tapAnimKey = ref(0)
const ripples = reactive<Array<{ id: number; x: number; y: number }>>([])
let rippleId = 0

const btnClasses = computed(() => ({
  disabled: !canJoin.value || !canAffordCurrent.value,
  'is-tapping': multiplier.value > 0 && hasEntryFee.value,
  'level-1': multiplier.value === 1,
  'level-2': multiplier.value === 2,
  'level-3': multiplier.value === 3,
  'level-high': multiplier.value >= 4,
  [`tap-${tapAnimKey.value % 2}`]: multiplier.value > 0,
}))

// ========== 计算属性 ==========
const currentStage = computed((): EventStage | undefined => {
  return props.event.stages[currentStageIndex.value]
})

const hasEntryFee = computed(() => {
  return props.event.entryFee && (props.event.entryFee.time || props.event.entryFee.energy)
})

const hasNextStage = computed(() => {
  if (nextStageId.value) {
    return props.event.stages.some(s => s.id === nextStageId.value)
  }
  return currentStageIndex.value < props.event.stages.length - 1
})

const canJoin = computed(() => {
  if (props.event.requirements && !userStore.meetsRequirements(props.event.requirements)) {
    return false
  }
  if (props.event.entryFee && !userStore.canAfford(props.event.entryFee)) {
    return false
  }
  return props.event.status === 'active'
})

const canAffordChoice = (choice: EventChoice): boolean => {
  if (!choice.cost) return true
  return userStore.canAfford(choice.cost)
}

const totalCost = computed(() => {
  const fee = props.event.entryFee
  if (!fee) return { time: 0, energy: 0 }
  const m = Math.max(multiplier.value, 1)
  return {
    time: (fee.time || 0) * m,
    energy: (fee.energy || 0) * m
  }
})

const canAffordCurrent = computed(() => {
  if (!hasEntryFee.value) return true
  if (multiplier.value === 0) return true
  return userStore.canAfford(totalCost.value)
})

const canAffordNext = computed(() => {
  const fee = props.event.entryFee
  if (!fee) return true
  if (multiplier.value >= maxMultiplier) return false
  const nextCost = {
    time: (fee.time || 0) * (multiplier.value + 1),
    energy: (fee.energy || 0) * (multiplier.value + 1)
  }
  return userStore.canAfford(nextCost)
})

const costSummary = computed(() => {
  const parts: string[] = []
  if (totalCost.value.time) parts.push(`⏰${totalCost.value.time}`)
  if (totalCost.value.energy) parts.push(`⚡${totalCost.value.energy}`)
  return parts.join(' ')
})

// ========== 计时器管理 ==========
const clearTimers = () => {
  if (confirmTimer) {
    clearTimeout(confirmTimer)
    confirmTimer = null
  }
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
  isCountingDown.value = false
}

const startConfirmCountdown = () => {
  clearTimers()
  timerProgress.value = 100
  isCountingDown.value = true
  
  const startTime = Date.now()
  
  progressTimer = setInterval(() => {
    const elapsed = Date.now() - startTime
    timerProgress.value = Math.max(0, 100 - (elapsed / CONFIRM_DELAY) * 100)
  }, TIMER_INTERVAL)
  
  confirmTimer = setTimeout(() => {
    clearTimers()
    confirmJoin()
  }, CONFIRM_DELAY)
}

// ========== 涟漪效果 ==========
const addRipple = () => {
  const id = ++rippleId
  // 随机位置模拟点击涟漪
  const x = 30 + Math.random() * 140
  const y = 10 + Math.random() * 30
  ripples.push({ id, x, y })
  
  setTimeout(() => {
    const idx = ripples.findIndex(r => r.id === id)
    if (idx !== -1) ripples.splice(idx, 1)
  }, 600)
}

// ========== 核心交互 ==========
const handleTapJoin = () => {
  if (!canJoin.value) return
  
  // 无入场费的事件，直接参与
  if (!hasEntryFee.value) {
    multiplier.value = 1
    confirmJoin()
    return
  }
  
  // 有入场费的事件，每次点击追加一倍
  if (canAffordNext.value || multiplier.value === 0) {
    multiplier.value++
    tapAnimKey.value++
    addRipple()
    
    // 触发震动反馈（如果支持）
    try {
      if (navigator && navigator.vibrate) {
        navigator.vibrate(multiplier.value > 3 ? [30, 20, 30] : 15)
      }
    } catch (e) {}
    
    // 重置倒计时
    startConfirmCountdown()
  }
}

const confirmJoin = () => {
  if (!canJoin.value || !canAffordCurrent.value) return
  
  const finalMultiplier = Math.max(multiplier.value, 1)
  
  // 支付费用
  if (props.event.entryFee && hasEntryFee.value) {
    userStore.pay(totalCost.value)
  }
  
  eventStore.startEvent(props.event.id)
  
  // 同步到世界线
  worldStore.recordEvent(
    props.event.id, 
    props.event.title + (finalMultiplier > 1 ? ` (${finalMultiplier}倍投入)` : '')
  )
  
  mode.value = 'playing'
  currentStageIndex.value = 0
  multiplier.value = 0
  
  emit('stateChange', 'playing')
}

// ========== 辅助函数 ==========
const getTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    story: '📖', challenge: '💼', craft: '🎯', social: '💬', exploration: '🔍', creation: '✨'
  }
  return icons[type] || '📅'
}

const getTypeName = (type: string): string => {
  const names: Record<string, string> = {
    story: '生活', challenge: '挑战', craft: '制作', social: '社交', exploration: '探索', creation: '创造'
  }
  return names[type] || '事件'
}

const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    upcoming: '即将开始', active: '进行中', ended: '已结束'
  }
  return texts[status] || status
}

const formatNumber = (num: number): string => {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num.toString()
}

const getItemName = (itemId: string): string => {
  const item = itemStore.getItem(itemId)
  return item?.name || itemId
}

const getTagDisplayName = (tagId: string): string => {
  const def = getTagDefinition(tagId)
  return def?.name || tagId
}

const getTagIcon = (tagId: string): string => {
  const def = getTagDefinition(tagId)
  return def?.icon || '🏷️'
}

// ========== 选项选择 ==========
const handleSelectChoice = (choice: EventChoice) => {
  if (!canAffordChoice(choice)) {
    uni.showToast({ title: '时间或精力不足', icon: 'none' })
    return
  }
  
  if (choice.cost) {
    userStore.pay(choice.cost)
  }
  
  const result = choice.outcome
  lastResult.value = result
  nextStageId.value = result.nextStageId || null
  
  if (result.rewards) {
    if (result.rewards.time) userStore.updateWallet({ time: result.rewards.time })
    if (result.rewards.energy) userStore.updateWallet({ energy: result.rewards.energy })
    if (result.rewards.reputation) userStore.updateWallet({ reputation: result.rewards.reputation })
    
    if (result.rewards.tags && typeof result.rewards.tags === 'object' && !Array.isArray(result.rewards.tags)) {
      const totalCostVal = {
        time: (props.event.entryFee?.time || 0) + (choice.cost?.time || 0),
        energy: (props.event.entryFee?.energy || 0) + (choice.cost?.energy || 0)
      }
      Object.entries(result.rewards.tags).forEach(([tagId, weight]) => {
        userStore.updateTagWeight(tagId, weight as number, 'event', props.event.id, props.event.title, totalCostVal)
      })
    }
    
    if (result.rewards.items) {
      result.rewards.items.forEach(itemId => userStore.addItem({
          itemId,
          quantity: 1,
          acquiredAt: Date.now(),
          source: props.event.id
        }))
    }
  }
  
  if (result.penalties) {
    if (result.penalties.time) userStore.pay({ time: result.penalties.time })
    if (result.penalties.energy) userStore.pay({ energy: result.penalties.energy })
    if (result.penalties.reputation) userStore.pay({ reputation: result.penalties.reputation })
    
    if (result.penalties.tags) {
      Object.entries(result.penalties.tags).forEach(([tagId, weight]) => {
        userStore.decreaseTagWeight(tagId, weight as number)
      })
    }
  }
  
  // 同步到世界线
  worldStore.recordChoice(props.event.id, props.event.title, choice.text)
  
  mode.value = 'result'
  emit('stateChange', 'result')
}

const handleContinue = () => {
  if (hasNextStage.value) {
    if (nextStageId.value) {
      const idx = props.event.stages.findIndex(s => s.id === nextStageId.value)
      if (idx !== -1) currentStageIndex.value = idx
    } else {
      currentStageIndex.value++
    }
    
    mode.value = 'playing'
    lastResult.value = null
    nextStageId.value = null
    emit('stateChange', 'playing')
  } else {
    eventStore.completeEvent(props.event.id)
    
    worldStore.recordEventComplete(props.event.id, props.event.title, {
      tags: lastResult.value?.rewards?.tags 
        ? (typeof lastResult.value.rewards.tags === 'object' && !Array.isArray(lastResult.value.rewards.tags) 
            ? Object.keys(lastResult.value.rewards.tags) 
            : lastResult.value.rewards.tags as string[])
        : undefined,
      stats: lastResult.value?.rewards ? {
        time: lastResult.value.rewards.time,
        energy: lastResult.value.rewards.energy,
        reputation: lastResult.value.rewards.reputation
      } : undefined
    })
    
    mode.value = 'preview'
    currentStageIndex.value = 0
    lastResult.value = null
    nextStageId.value = null
    emit('stateChange', 'completed')
    
    uni.showToast({ title: '事件完成！', icon: 'success' })
  }
}

watch(() => props.event.id, () => {
  resetCardState()
})

const resetCardState = () => {
  clearTimers()
  mode.value = 'preview'
  currentStageIndex.value = 0
  lastResult.value = null
  nextStageId.value = null
  multiplier.value = 0
  ripples.splice(0)
  emit('stateChange', 'preview')
}

onUnmounted(() => {
  clearTimers()
})

defineExpose({
  resetCardState
})
</script>

<style lang="scss" scoped>
@import '@/styles/theme.scss';

.event-card {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  background: $white;
  border-radius: $radius-2xl;
  overflow: hidden;
  box-shadow: $shadow-lg;
  display: flex;
  flex-direction: column;
}

// 顶部装饰条
.card-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6rpx;
  
  &.story { background: $gradient-primary; }
  &.challenge { background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); }
  &.craft { background: $gradient-secondary; }
  &.social { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); }
  &.exploration { background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); }
  &.creation { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); }
}

.card-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 48rpx 40rpx 40rpx;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.event-type {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 20rpx;
  border-radius: $radius-full;
  background: $gray-50;
  
  &.story { 
    background: rgba(16, 185, 129, 0.08);
    .type-text { color: $primary-dark; }
  }
  &.challenge { 
    background: rgba(239, 68, 68, 0.08);
    .type-text { color: #DC2626; }
  }
  &.craft { 
    background: rgba(251, 191, 36, 0.08);
    .type-text { color: $accent-dark; }
  }
  &.social { 
    background: rgba(59, 130, 246, 0.08);
    .type-text { color: #2563EB; }
  }
  &.exploration {
    background: rgba(139, 92, 246, 0.08);
    .type-text { color: #7C3AED; }
  }
  &.creation {
    background: rgba(245, 158, 11, 0.08);
    .type-text { color: #D97706; }
  }
}

.type-icon { font-size: 22rpx; }
.type-text { font-size: 24rpx; font-weight: 600; color: $text-secondary; }

.event-status {
  padding: 10rpx 20rpx;
  border-radius: $radius-full;
  font-size: 22rpx;
  font-weight: 600;
  
  &.active { background: $gradient-primary; color: $white; }
  &.upcoming { background: $gray-100; color: $text-secondary; }
  &.ended { background: $gray-100; color: $text-tertiary; }
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.event-title, .stage-title, .result-title {
  font-size: 52rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 20rpx;
  line-height: 1.3;
}

.event-desc, .stage-desc, .result-desc {
  font-size: 30rpx;
  color: $text-secondary;
  line-height: 1.7;
}

.card-footer {
  margin-top: auto;
  padding-top: 32rpx;
}

.footer-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.entry-fee {
  &.free .free-label {
    font-size: 26rpx;
    color: $primary-color;
    font-weight: 600;
  }
}

.fee-label { font-size: 22rpx; color: $text-tertiary; margin-bottom: 8rpx; }
.fee-items { display: flex; gap: 16rpx; }

.fee-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 16rpx;
  border-radius: $radius-lg;
  
  &.time {
    background: rgba(59, 130, 246, 0.08);
    .fee-value { color: #2563EB; }
  }
  &.energy {
    background: rgba(251, 191, 36, 0.08);
    .fee-value { color: $accent-dark; }
  }
}

.fee-icon { font-size: 20rpx; }
.fee-value { font-size: 24rpx; font-weight: 600; }

.participants {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  background: $gray-50;
  border-radius: $radius-lg;
}

.participants-icon { font-size: 22rpx; }
.participants-count { font-size: 24rpx; color: $text-secondary; font-weight: 500; }

// ==================== 参与按钮 - 增强交互 ====================
.action-btn {
  position: relative;
  width: 100%;
  min-height: 100rpx;
  height: auto;
  padding: 24rpx 32rpx;
  background: $gradient-primary;
  color: $white;
  border: none;
  border-radius: $radius-xl;
  font-size: 34rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-primary;
  transition: all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  overflow: hidden;
  
  // 按下时缩放
  &:active {
    transform: scale(0.95);
  }
  
  &.disabled {
    background: $gray-200;
    color: $text-tertiary;
    box-shadow: none;
  }
  
  // 倍数等级 - 颜色渐变升级
  &.level-1 {
    background: $gradient-primary;
    box-shadow: 0 4rpx 16rpx rgba(16, 185, 129, 0.35);
  }
  
  &.level-2 {
    background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
    box-shadow: 0 4rpx 20rpx rgba(59, 130, 246, 0.4);
  }
  
  &.level-3 {
    background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
    box-shadow: 0 6rpx 24rpx rgba(139, 92, 246, 0.45);
  }
  
  &.level-high {
    background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
    box-shadow: 0 6rpx 28rpx rgba(239, 68, 68, 0.5);
    animation: glow-pulse 1s ease-in-out infinite;
  }
  
  // 点击弹跳动画 - 交替触发
  &.tap-0.is-tapping {
    animation: tap-bounce-a 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  &.tap-1.is-tapping {
    animation: tap-bounce-b 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

.btn-text-default {
  font-size: 34rpx;
  font-weight: 600;
  letter-spacing: 4rpx;
}

// 弹跳动画A
@keyframes tap-bounce-a {
  0% { transform: scale(0.92); }
  50% { transform: scale(1.06); }
  100% { transform: scale(1); }
}

// 弹跳动画B
@keyframes tap-bounce-b {
  0% { transform: scale(0.92); }
  50% { transform: scale(1.06); }
  100% { transform: scale(1); }
}

// 高倍数发光脉冲
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 6rpx 28rpx rgba(239, 68, 68, 0.5); }
  50% { box-shadow: 0 8rpx 40rpx rgba(239, 68, 68, 0.7); }
}

// 涟漪容器
.ripple-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.ripple {
  position: absolute;
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%) scale(0);
  animation: ripple-expand 0.6s ease-out forwards;
}

@keyframes ripple-expand {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.6;
  }
  100% {
    transform: translate(-50%, -50%) scale(15);
    opacity: 0;
  }
}

// 按钮内容
.btn-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  z-index: 1;
}

.btn-multiplier-row {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.btn-multiplier {
  font-weight: 800;
  letter-spacing: 2rpx;
  transition: font-size 0.15s ease;
  
  &.level-1 { font-size: 44rpx; }
  &.level-2 { font-size: 48rpx; }
  &.level-3 { font-size: 52rpx; }
  &.level-4, &.level-5 { font-size: 56rpx; }
}

.btn-label {
  font-size: 26rpx;
  font-weight: 500;
  opacity: 0.9;
}

.btn-cost-text {
  font-size: 24rpx;
  font-weight: 400;
  opacity: 0.85;
}

// 倒计时进度条
.btn-timer-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 8rpx;
  background: rgba(0, 0, 0, 0.2);
  
  .timer-fill {
    height: 100%;
    background: rgba(255, 255, 255, 0.7);
    transition: width 0.05s linear;
    border-radius: 0 4rpx 4rpx 0;
  }
}

// ==================== 选项列表 ====================
.options-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.option-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
  min-height: 88rpx;
  background: $gray-50;
  border-radius: $radius-xl;
  border: 2rpx solid transparent;
  transition: all 0.2s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  
  &:active {
    background: $white;
    border-color: $primary-color;
    transform: scale(0.98);
    box-shadow: 0 2rpx 12rpx rgba(16, 185, 129, 0.15);
  }
  
  &.disabled { opacity: 0.5; }
}

.option-main { flex: 1; }

.option-text {
  display: block;
  font-size: 28rpx;
  color: $text-primary;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.option-cost { display: flex; gap: 12rpx; }

.cost-tag {
  font-size: 22rpx;
  font-weight: 500;
  &.time { color: #3B82F6; }
  &.energy { color: $accent-dark; }
}

.option-arrow { font-size: 28rpx; color: $text-tertiary; font-weight: 300; }

// 进度点
.progress-dots {
  display: flex;
  justify-content: center;
  gap: 12rpx;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: $gray-200;
  transition: all $transition-normal;
  
  &.active {
    width: 32rpx;
    border-radius: 6rpx;
    background: $primary-color;
  }
  &.completed { background: $primary-light; }
}

// 结果奖励
.result-rewards {
  background: rgba(16, 185, 129, 0.06);
  border-radius: $radius-xl;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.rewards-header { margin-bottom: 16rpx; }
.rewards-title { font-size: 26rpx; font-weight: 600; color: $primary-dark; }

.rewards-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.reward-tag, .reward-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 18rpx;
  background: $white;
  border-radius: $radius-lg;
  box-shadow: $shadow-xs;
}

.tag-icon, .item-icon { font-size: 22rpx; }
.tag-name, .item-name { font-size: 24rpx; color: $text-primary; font-weight: 500; }

// 结果惩罚
.result-penalties {
  background: rgba(239, 68, 68, 0.06);
  border-radius: $radius-xl;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.penalties-header { margin-bottom: 16rpx; }
.penalties-title { font-size: 26rpx; font-weight: 600; color: #DC2626; }
.penalties-grid { display: flex; flex-wrap: wrap; gap: 12rpx; }

.penalty-tag {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 18rpx;
  background: $white;
  border-radius: $radius-lg;
  box-shadow: $shadow-xs;
  .tag-name { color: #DC2626; }
}
</style>
