<template>
  <view class="ripple-container" :style="{ height: height + 'px' }">
    <canvas
      :id="canvasId"
      type="2d"
      class="ripple-canvas"
      :style="{ width: '100%', height: height + 'px' }"
    />
    <!-- 涟漪事件列表 -->
    <view class="ripple-events" v-if="showEvents && rippleEvents.length > 0">
      <view
        v-for="(evt, idx) in rippleEvents"
        :key="idx"
        class="ripple-event-item"
        :class="'ripple-' + evt.type"
      >
        <text class="ripple-event-icon">{{ getEventIcon(evt.type) }}</text>
        <view class="ripple-event-content">
          <text class="ripple-event-title">{{ evt.title }}</text>
          <text class="ripple-event-desc">{{ evt.description }}</text>
          <text class="ripple-event-time">{{ formatTime(evt.timestamp) }}</text>
        </view>
        <view class="ripple-event-magnitude">
          <view
            class="magnitude-bar"
            :style="{ width: Math.min(evt.magnitude * 100, 100) + '%' }"
            :class="'magnitude-' + getMagnitudeLevel(evt.magnitude)"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'

// ==================== Props ====================

interface RippleEvent {
  type: 'choice' | 'world_tick' | 'epoch_change' | 'black_swan' | 'social' | 'information'
  title: string
  description: string
  magnitude: number  // 0-1
  timestamp: number
  x?: number
  y?: number
}

const props = withDefaults(defineProps<{
  height?: number
  showEvents?: boolean
  maxRipples?: number
  events?: RippleEvent[]
}>(), {
  height: 300,
  showEvents: true,
  maxRipples: 20,
  events: () => [],
})

const canvasId = `ripple-${Date.now()}`

// ==================== 涟漪动画状态 ====================

interface Ripple {
  x: number
  y: number
  radius: number
  maxRadius: number
  opacity: number
  color: string
  speed: number
}

const ripples = ref<Ripple[]>([])
const rippleEvents = ref<RippleEvent[]>([])
let animationTimer: any = null
let canvasWidth = 300
let canvasHeight = 300

// ==================== 颜色映射 ====================

const typeColors: Record<string, string> = {
  choice: '#4FC3F7',
  world_tick: '#81C784',
  epoch_change: '#FFD54F',
  black_swan: '#EF5350',
  social: '#CE93D8',
  information: '#4DD0E1',
}

function getEventIcon(type: string): string {
  const icons: Record<string, string> = {
    choice: '🎯',
    world_tick: '🌍',
    epoch_change: '🔄',
    black_swan: '🦢',
    social: '🤝',
    information: '📡',
  }
  return icons[type] || '💫'
}

function getMagnitudeLevel(mag: number): string {
  if (mag > 0.7) return 'high'
  if (mag > 0.3) return 'medium'
  return 'low'
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
}

// ==================== 涟漪生成 ====================

function addRipple(event: RippleEvent) {
  const x = event.x ?? Math.random() * canvasWidth
  const y = event.y ?? Math.random() * canvasHeight
  const color = typeColors[event.type] || '#4FC3F7'

  ripples.value.push({
    x,
    y,
    radius: 2,
    maxRadius: 30 + event.magnitude * 120,
    opacity: 0.6 + event.magnitude * 0.4,
    color,
    speed: 0.5 + event.magnitude * 1.5,
  })

  // 限制最大涟漪数
  if (ripples.value.length > props.maxRipples) {
    ripples.value = ripples.value.slice(-props.maxRipples)
  }

  // 添加到事件列表
  rippleEvents.value.unshift(event)
  if (rippleEvents.value.length > 10) {
    rippleEvents.value = rippleEvents.value.slice(0, 10)
  }
}

// ==================== Canvas 动画 ====================

function startAnimation() {
  // 使用 setInterval 模拟动画帧（uni-app 兼容）
  animationTimer = setInterval(() => {
    updateRipples()
    drawRipples()
  }, 33) // ~30fps
}

function updateRipples() {
  ripples.value = ripples.value.filter(r => {
    r.radius += r.speed
    r.opacity -= 0.008
    return r.opacity > 0 && r.radius < r.maxRadius
  })
}

function drawRipples() {
  // 在 uni-app 中使用 uni.createCanvasContext
  try {
    const ctx = uni.createCanvasContext(canvasId)
    if (!ctx) return

    // 清空画布
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    // 绘制背景网格
    ctx.setStrokeStyle('rgba(255, 255, 255, 0.03)')
    ctx.setLineWidth(0.5)
    for (let x = 0; x < canvasWidth; x += 30) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvasHeight)
      ctx.stroke()
    }
    for (let y = 0; y < canvasHeight; y += 30) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvasWidth, y)
      ctx.stroke()
    }

    // 绘制涟漪
    for (const r of ripples.value) {
      // 外圈
      ctx.beginPath()
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
      ctx.setStrokeStyle(hexToRgba(r.color, r.opacity))
      ctx.setLineWidth(2)
      ctx.stroke()

      // 内圈（更亮）
      if (r.radius > 10) {
        ctx.beginPath()
        ctx.arc(r.x, r.y, r.radius * 0.6, 0, Math.PI * 2)
        ctx.setStrokeStyle(hexToRgba(r.color, r.opacity * 0.5))
        ctx.setLineWidth(1)
        ctx.stroke()
      }

      // 中心点
      ctx.beginPath()
      ctx.arc(r.x, r.y, 3, 0, Math.PI * 2)
      ctx.setFillStyle(hexToRgba(r.color, Math.min(r.opacity * 2, 1)))
      ctx.fill()
    }

    ctx.draw()
  } catch (e) {
    // Canvas not ready
  }
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// ==================== 生命周期 ====================

onMounted(() => {
  // 获取画布尺寸
  uni.getSystemInfo({
    success: (info) => {
      canvasWidth = info.windowWidth - 32 // padding
      canvasHeight = props.height
    },
  })

  startAnimation()
})

onUnmounted(() => {
  if (animationTimer) {
    clearInterval(animationTimer)
    animationTimer = null
  }
})

// 监听外部事件
watch(() => props.events, (newEvents) => {
  if (newEvents && newEvents.length > 0) {
    const latest = newEvents[newEvents.length - 1]
    addRipple(latest)
  }
}, { deep: true })

// 暴露方法供外部调用
defineExpose({
  addRipple,
})
</script>

<style scoped>
.ripple-container {
  position: relative;
  background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%);
  border-radius: 16rpx;
  overflow: hidden;
}

.ripple-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.ripple-events {
  position: relative;
  z-index: 10;
  padding: 16rpx;
  max-height: 400rpx;
  overflow-y: auto;
}

.ripple-event-item {
  display: flex;
  align-items: center;
  padding: 12rpx 16rpx;
  margin-bottom: 8rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  border-left: 4rpx solid transparent;
}

.ripple-choice { border-left-color: #4FC3F7; }
.ripple-world_tick { border-left-color: #81C784; }
.ripple-epoch_change { border-left-color: #FFD54F; }
.ripple-black_swan { border-left-color: #EF5350; }
.ripple-social { border-left-color: #CE93D8; }
.ripple-information { border-left-color: #4DD0E1; }

.ripple-event-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.ripple-event-content {
  flex: 1;
  min-width: 0;
}

.ripple-event-title {
  font-size: 24rpx;
  color: #e0e0e0;
  font-weight: 600;
  display: block;
}

.ripple-event-desc {
  font-size: 20rpx;
  color: #888;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ripple-event-time {
  font-size: 18rpx;
  color: #666;
  display: block;
  margin-top: 4rpx;
}

.ripple-event-magnitude {
  width: 80rpx;
  height: 8rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4rpx;
  overflow: hidden;
  margin-left: 12rpx;
}

.magnitude-bar {
  height: 100%;
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

.magnitude-low { background: #81C784; }
.magnitude-medium { background: #FFD54F; }
.magnitude-high { background: #EF5350; }
</style>
