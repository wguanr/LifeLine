<template>
  <view class="settlement-preview" v-if="visible">
    <view class="sp-header">
      <text class="sp-title">非对称结算预览</text>
      <view class="sp-close" @click="$emit('close')">
        <text class="sp-close-icon">✕</text>
      </view>
    </view>

    <!-- 三重乘数 -->
    <view class="multipliers-row">
      <view class="mul-card">
        <text class="mul-icon">🎭</text>
        <text class="mul-label">身份系数</text>
        <text class="mul-value" :class="mulClass(settlement.identityMultiplier)">
          x{{ settlement.identityMultiplier.toFixed(2) }}
        </text>
        <text class="mul-hint">标签匹配度</text>
      </view>
      <view class="mul-divider">
        <text class="mul-op">×</text>
      </view>
      <view class="mul-card">
        <text class="mul-icon">🌊</text>
        <text class="mul-label">潮汐系数</text>
        <view class="mul-tide-values">
          <text class="mul-tide-item" :class="tideClass(settlement.tideMultiplier.time)">
            ⏱ x{{ settlement.tideMultiplier.time?.toFixed(2) || '1.00' }}
          </text>
          <text class="mul-tide-item" :class="tideClass(settlement.tideMultiplier.energy)">
            ⚡ x{{ settlement.tideMultiplier.energy?.toFixed(2) || '1.00' }}
          </text>
        </view>
      </view>
      <view class="mul-divider">
        <text class="mul-op">×</text>
      </view>
      <view class="mul-card">
        <text class="mul-icon">{{ epochIcon }}</text>
        <text class="mul-label">纪元加成</text>
        <text class="mul-value" :class="mulClass(settlement.epochBonus)">
          x{{ settlement.epochBonus.toFixed(2) }}
        </text>
        <text class="mul-hint">{{ epochName }}</text>
      </view>
    </view>

    <!-- 预期收益/成本 -->
    <view class="estimate-section">
      <view class="estimate-row" v-if="hasRewards">
        <text class="estimate-label">预期收益</text>
        <view class="estimate-items">
          <view class="est-item reward" v-if="settlement.estimatedRewards.time">
            <text class="est-icon">⏱</text>
            <text class="est-value">+{{ settlement.estimatedRewards.time }}</text>
          </view>
          <view class="est-item reward" v-if="settlement.estimatedRewards.energy">
            <text class="est-icon">⚡</text>
            <text class="est-value">+{{ settlement.estimatedRewards.energy }}</text>
          </view>
          <view class="est-item reward" v-if="settlement.estimatedRewards.reputation">
            <text class="est-icon">⭐</text>
            <text class="est-value">+{{ settlement.estimatedRewards.reputation }}</text>
          </view>
        </view>
      </view>
      <view class="estimate-row" v-if="hasCosts">
        <text class="estimate-label">预期成本</text>
        <view class="estimate-items">
          <view class="est-item cost" v-if="settlement.estimatedCosts.time">
            <text class="est-icon">⏱</text>
            <text class="est-value">-{{ settlement.estimatedCosts.time }}</text>
          </view>
          <view class="est-item cost" v-if="settlement.estimatedCosts.energy">
            <text class="est-icon">⚡</text>
            <text class="est-value">-{{ settlement.estimatedCosts.energy }}</text>
          </view>
          <view class="est-item cost" v-if="settlement.estimatedCosts.reputation">
            <text class="est-icon">⭐</text>
            <text class="est-value">-{{ settlement.estimatedCosts.reputation }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 综合乘数指示器 -->
    <view class="combined-multiplier">
      <text class="combined-label">综合乘数</text>
      <view class="combined-bar-bg">
        <view
          class="combined-bar"
          :style="{ width: combinedBarWidth + '%', background: combinedBarColor }"
        />
        <view class="combined-marker base" />
      </view>
      <text class="combined-value" :class="combinedClass">
        x{{ combinedMultiplier.toFixed(2) }}
      </text>
    </view>

    <!-- 加载中 -->
    <view class="sp-loading" v-if="loading">
      <text class="sp-loading-text">计算中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Settlement {
  identityMultiplier: number
  tideMultiplier: { time: number; energy: number; reputation: number }
  epochBonus: number
  epoch: string
  estimatedRewards: { time: number; energy: number; reputation: number }
  estimatedCosts: { time: number; energy: number; reputation: number }
}

const props = withDefaults(defineProps<{
  visible: boolean
  settlement: Settlement
  loading?: boolean
}>(), {
  loading: false,
  settlement: () => ({
    identityMultiplier: 1,
    tideMultiplier: { time: 1, energy: 1, reputation: 1 },
    epochBonus: 1,
    epoch: 'genesis',
    estimatedRewards: { time: 0, energy: 0, reputation: 0 },
    estimatedCosts: { time: 0, energy: 0, reputation: 0 },
  }),
})

defineEmits<{
  (e: 'close'): void
}>()

// ==================== 纪元映射 ====================

const epochNames: Record<string, string> = {
  genesis: '创世纪',
  golden_age: '黄金时代',
  turbulence: '动荡之秋',
  enlightenment: '启蒙时代',
  solidarity: '团结纪元',
  dark_age: '黑暗时代',
}

const epochIcons: Record<string, string> = {
  genesis: '🌅',
  golden_age: '✨',
  turbulence: '🌪',
  enlightenment: '💡',
  solidarity: '🤝',
  dark_age: '🌑',
}

const epochName = computed(() => epochNames[props.settlement.epoch] || props.settlement.epoch)
const epochIcon = computed(() => epochIcons[props.settlement.epoch] || '🌍')

// ==================== 计算属性 ====================

const hasRewards = computed(() => {
  const r = props.settlement.estimatedRewards
  return r.time || r.energy || r.reputation
})

const hasCosts = computed(() => {
  const c = props.settlement.estimatedCosts
  return c.time || c.energy || c.reputation
})

const combinedMultiplier = computed(() => {
  const avgTide = (
    (props.settlement.tideMultiplier.time || 1) +
    (props.settlement.tideMultiplier.energy || 1)
  ) / 2
  return props.settlement.identityMultiplier * avgTide * props.settlement.epochBonus
})

const combinedBarWidth = computed(() => {
  // 映射 0.5 - 2.0 到 0% - 100%
  return Math.min(Math.max((combinedMultiplier.value - 0.5) / 1.5 * 100, 0), 100)
})

const combinedBarColor = computed(() => {
  if (combinedMultiplier.value > 1.3) return '#81C784'
  if (combinedMultiplier.value > 0.9) return '#FFD54F'
  return '#EF5350'
})

const combinedClass = computed(() => {
  if (combinedMultiplier.value > 1.3) return 'combined-high'
  if (combinedMultiplier.value > 0.9) return 'combined-medium'
  return 'combined-low'
})

// ==================== 工具函数 ====================

function mulClass(val: number): string {
  if (val > 1.1) return 'mul-high'
  if (val > 0.9) return 'mul-neutral'
  return 'mul-low'
}

function tideClass(val: number): string {
  if (val > 1.1) return 'tide-up'
  if (val < 0.9) return 'tide-down'
  return ''
}
</script>

<style scoped>
.settlement-preview {
  background: rgba(10, 10, 26, 0.95);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 20rpx;
  padding: 24rpx;
  margin: 16rpx 0;
  backdrop-filter: blur(10px);
}

.sp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.sp-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #00e5ff;
}

.sp-close {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sp-close-icon {
  font-size: 20rpx;
  color: #888;
}

/* ==================== 三重乘数 ==================== */

.multipliers-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.mul-card {
  flex: 1;
  text-align: center;
  padding: 12rpx 8rpx;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12rpx;
}

.mul-icon {
  font-size: 32rpx;
  display: block;
}

.mul-label {
  font-size: 18rpx;
  color: #888;
  display: block;
  margin-top: 4rpx;
}

.mul-value {
  font-size: 28rpx;
  font-weight: 700;
  display: block;
  margin-top: 4rpx;
}

.mul-hint {
  font-size: 16rpx;
  color: #555;
  display: block;
  margin-top: 2rpx;
}

.mul-high { color: #81C784; }
.mul-neutral { color: #FFD54F; }
.mul-low { color: #EF5350; }

.mul-divider {
  padding: 0 8rpx;
}

.mul-op {
  font-size: 24rpx;
  color: #555;
}

.mul-tide-values {
  display: flex;
  flex-direction: column;
  gap: 2rpx;
  margin-top: 4rpx;
}

.mul-tide-item {
  font-size: 20rpx;
  color: #ccc;
}

.tide-up { color: #81C784; }
.tide-down { color: #EF5350; }

/* ==================== 预期收益/成本 ==================== */

.estimate-section {
  margin-bottom: 16rpx;
}

.estimate-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.estimate-label {
  font-size: 22rpx;
  color: #888;
  width: 120rpx;
}

.estimate-items {
  display: flex;
  gap: 16rpx;
  flex: 1;
}

.est-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 6rpx 12rpx;
  border-radius: 8rpx;
}

.est-item.reward {
  background: rgba(129, 199, 132, 0.1);
}

.est-item.cost {
  background: rgba(239, 83, 80, 0.1);
}

.est-icon {
  font-size: 22rpx;
}

.est-value {
  font-size: 24rpx;
  font-weight: 600;
}

.est-item.reward .est-value { color: #81C784; }
.est-item.cost .est-value { color: #EF5350; }

/* ==================== 综合乘数 ==================== */

.combined-multiplier {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding-top: 16rpx;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.combined-label {
  font-size: 22rpx;
  color: #888;
  width: 120rpx;
}

.combined-bar-bg {
  flex: 1;
  height: 16rpx;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 8rpx;
  overflow: hidden;
  position: relative;
}

.combined-bar {
  height: 100%;
  border-radius: 8rpx;
  transition: width 0.5s ease;
}

.combined-marker.base {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 33.3%;
  width: 2rpx;
  background: rgba(255, 255, 255, 0.3);
}

.combined-value {
  font-size: 28rpx;
  font-weight: 700;
  width: 100rpx;
  text-align: right;
}

.combined-high { color: #81C784; }
.combined-medium { color: #FFD54F; }
.combined-low { color: #EF5350; }

/* ==================== 加载 ==================== */

.sp-loading {
  text-align: center;
  padding: 16rpx;
}

.sp-loading-text {
  font-size: 22rpx;
  color: #666;
}
</style>
