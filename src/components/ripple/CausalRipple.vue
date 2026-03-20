<template>
  <view class="causal-ripple">
    <!-- 因果链可视化 -->
    <view class="chain-header">
      <text class="chain-title">因果链涟漪</text>
      <text class="chain-subtitle">选择的蝴蝶效应</text>
    </view>

    <!-- 涟漪画布 -->
    <view class="ripple-stage" :style="{ height: stageHeight + 'px' }">
      <!-- 中心节点 -->
      <view class="center-node" :class="'node-' + centerType">
        <text class="center-icon">{{ centerIcon }}</text>
        <view class="center-pulse" />
        <view class="center-pulse delay" />
      </view>

      <!-- 涟漪波纹（CSS 动画） -->
      <view
        v-for="(wave, idx) in activeWaves"
        :key="wave.id"
        class="ripple-wave"
        :class="'wave-' + wave.type"
        :style="{
          animationDuration: wave.duration + 's',
          animationDelay: wave.delay + 's',
          '--wave-size': wave.size + 'px',
          '--wave-color': wave.color,
          '--wave-opacity': wave.opacity,
        }"
      />

      <!-- 因果链节点 -->
      <view
        v-for="(node, idx) in chainNodes"
        :key="node.id"
        class="chain-node"
        :class="['chain-' + node.type, node.active ? 'node-active' : '']"
        :style="{
          left: node.x + '%',
          top: node.y + '%',
          animationDelay: node.delay + 's',
        }"
      >
        <text class="chain-node-icon">{{ node.icon }}</text>
        <text class="chain-node-label">{{ node.label }}</text>
        <view class="chain-node-glow" v-if="node.active" />
      </view>

      <!-- 因果连线 -->
      <svg class="chain-lines" :viewBox="`0 0 100 100`" preserveAspectRatio="none">
        <line
          v-for="(line, idx) in chainLines"
          :key="idx"
          :x1="line.x1 + '%'"
          :y1="line.y1 + '%'"
          :x2="line.x2 + '%'"
          :y2="line.y2 + '%'"
          :stroke="line.color"
          stroke-width="0.5"
          :stroke-dasharray="line.dashed ? '2,2' : 'none'"
          :opacity="line.opacity"
          class="chain-line"
          :style="{ animationDelay: line.delay + 's' }"
        />
      </svg>
    </view>

    <!-- 因果事件时间线 -->
    <view class="causal-timeline" v-if="events.length > 0">
      <view
        v-for="(evt, idx) in events.slice(0, 8)"
        :key="evt.id || idx"
        class="causal-event"
        :class="'ce-' + evt.type"
      >
        <view class="ce-connector">
          <view class="ce-dot" :style="{ background: getTypeColor(evt.type) }" />
          <view class="ce-line" v-if="idx < events.length - 1" />
        </view>
        <view class="ce-content">
          <view class="ce-header">
            <text class="ce-icon">{{ getTypeIcon(evt.type) }}</text>
            <text class="ce-title">{{ evt.title }}</text>
            <text class="ce-magnitude" :class="'mag-' + getMagLevel(evt.magnitude)">
              {{ (evt.magnitude * 100).toFixed(0) }}%
            </text>
          </view>
          <text class="ce-desc">{{ evt.description }}</text>
          <!-- 影响维度 -->
          <view class="ce-impacts" v-if="evt.impacts && evt.impacts.length > 0">
            <view
              v-for="impact in evt.impacts"
              :key="impact.dimension"
              class="ce-impact"
              :class="impact.delta > 0 ? 'impact-positive' : 'impact-negative'"
            >
              <text class="impact-dim">{{ dimLabels[impact.dimension] || impact.dimension }}</text>
              <text class="impact-delta">{{ impact.delta > 0 ? '+' : '' }}{{ (impact.delta * 100).toFixed(0) }}%</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-chain" v-if="events.length === 0 && !autoAnimate">
      <text class="empty-icon">🌊</text>
      <text class="empty-text">等待涟漪的到来...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// ==================== Types ====================

interface CausalEvent {
  id?: string
  type: 'choice' | 'world_tick' | 'epoch_change' | 'black_swan' | 'social' | 'information' | 'trade'
  title: string
  description: string
  magnitude: number
  timestamp: number
  impacts?: Array<{ dimension: string; delta: number }>
}

interface ChainNode {
  id: string
  type: string
  icon: string
  label: string
  x: number
  y: number
  delay: number
  active: boolean
}

interface Wave {
  id: number
  type: string
  size: number
  duration: number
  delay: number
  color: string
  opacity: number
}

// ==================== Props ====================

const props = withDefaults(defineProps<{
  events?: CausalEvent[]
  stageHeight?: number
  autoAnimate?: boolean
  centerType?: string
}>(), {
  events: () => [],
  stageHeight: 200,
  autoAnimate: true,
  centerType: 'choice',
})

// ==================== 常量 ====================

const typeColors: Record<string, string> = {
  choice: '#4FC3F7',
  world_tick: '#81C784',
  epoch_change: '#FFD54F',
  black_swan: '#EF5350',
  social: '#CE93D8',
  information: '#4DD0E1',
  trade: '#FF8A65',
}

const typeIcons: Record<string, string> = {
  choice: '🎯',
  world_tick: '🌍',
  epoch_change: '🔄',
  black_swan: '🦢',
  social: '🤝',
  information: '📡',
  trade: '💰',
}

const dimLabels: Record<string, string> = {
  stability: '稳定',
  prosperity: '繁荣',
  freedom: '自由',
  knowledge: '知识',
  solidarity: '团结',
}

// ==================== 计算属性 ====================

const centerIcon = computed(() => typeIcons[props.centerType] || '🎯')

const activeWaves = computed<Wave[]>(() => {
  const waves: Wave[] = []
  let id = 0

  // 基于事件生成波纹
  for (const evt of props.events.slice(-5)) {
    const color = typeColors[evt.type] || '#4FC3F7'
    waves.push({
      id: id++,
      type: evt.type,
      size: 60 + evt.magnitude * 140,
      duration: 2 + (1 - evt.magnitude) * 2,
      delay: id * 0.3,
      color,
      opacity: 0.3 + evt.magnitude * 0.3,
    })
  }

  // 自动动画：持续生成背景波纹
  if (props.autoAnimate && waves.length === 0) {
    for (let i = 0; i < 3; i++) {
      waves.push({
        id: id++,
        type: 'choice',
        size: 80 + i * 40,
        duration: 3 + i,
        delay: i * 1.5,
        color: '#4FC3F7',
        opacity: 0.15,
      })
    }
  }

  return waves
})

const chainNodes = computed<ChainNode[]>(() => {
  const nodes: ChainNode[] = []
  const types = ['stability', 'prosperity', 'freedom', 'knowledge', 'solidarity']
  const icons = ['🛡', '💰', '🕊', '📚', '🤝']
  const positions = [
    { x: 15, y: 20 },
    { x: 80, y: 15 },
    { x: 10, y: 75 },
    { x: 85, y: 70 },
    { x: 50, y: 85 },
  ]

  for (let i = 0; i < 5; i++) {
    const hasImpact = props.events.some(e =>
      e.impacts?.some(imp => imp.dimension === types[i])
    )
    nodes.push({
      id: types[i],
      type: types[i],
      icon: icons[i],
      label: dimLabels[types[i]],
      x: positions[i].x,
      y: positions[i].y,
      delay: i * 0.2,
      active: hasImpact,
    })
  }

  return nodes
})

const chainLines = computed(() => {
  const lines: any[] = []
  const center = { x: 50, y: 50 }

  for (const node of chainNodes.value) {
    lines.push({
      x1: center.x,
      y1: center.y,
      x2: node.x,
      y2: node.y,
      color: node.active ? typeColors[props.centerType] || '#4FC3F7' : 'rgba(255,255,255,0.08)',
      dashed: !node.active,
      opacity: node.active ? 0.6 : 0.2,
      delay: node.delay,
    })
  }

  // 节点之间的连线
  for (let i = 0; i < chainNodes.value.length; i++) {
    const next = chainNodes.value[(i + 1) % chainNodes.value.length]
    const curr = chainNodes.value[i]
    if (curr.active && next.active) {
      lines.push({
        x1: curr.x,
        y1: curr.y,
        x2: next.x,
        y2: next.y,
        color: 'rgba(255,255,255,0.1)',
        dashed: true,
        opacity: 0.3,
        delay: 0.5,
      })
    }
  }

  return lines
})

// ==================== 工具函数 ====================

function getTypeColor(type: string): string {
  return typeColors[type] || '#4FC3F7'
}

function getTypeIcon(type: string): string {
  return typeIcons[type] || '💫'
}

function getMagLevel(mag: number): string {
  if (mag > 0.7) return 'high'
  if (mag > 0.3) return 'medium'
  return 'low'
}

// ==================== 暴露方法 ====================

defineExpose({
  addEvent: (event: CausalEvent) => {
    // 外部调用时可以直接添加事件
    // 由于 events 是 prop，实际使用中应该通过父组件更新
  },
})
</script>

<style scoped>
.causal-ripple {
  background: linear-gradient(180deg, rgba(10, 10, 26, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%);
  border-radius: 20rpx;
  overflow: hidden;
}

.chain-header {
  padding: 20rpx 24rpx 12rpx;
}

.chain-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #e0e0e0;
  display: block;
}

.chain-subtitle {
  font-size: 20rpx;
  color: #666;
  display: block;
  margin-top: 4rpx;
}

/* ==================== 涟漪舞台 ==================== */

.ripple-stage {
  position: relative;
  overflow: hidden;
}

/* 中心节点 */
.center-node {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.center-icon {
  font-size: 36rpx;
  position: relative;
  z-index: 2;
}

.center-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(79, 195, 247, 0.2);
  animation: center-pulse 2s ease-in-out infinite;
}

.center-pulse.delay {
  animation-delay: 1s;
}

.node-choice .center-pulse { background: rgba(79, 195, 247, 0.2); }
.node-social .center-pulse { background: rgba(206, 147, 216, 0.2); }
.node-epoch_change .center-pulse { background: rgba(255, 213, 79, 0.2); }
.node-black_swan .center-pulse { background: rgba(239, 83, 80, 0.2); }

@keyframes center-pulse {
  0% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.8); opacity: 0; }
  100% { transform: scale(1); opacity: 0; }
}

/* 涟漪波纹 */
.ripple-wave {
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--wave-size);
  height: var(--wave-size);
  margin-left: calc(var(--wave-size) / -2);
  margin-top: calc(var(--wave-size) / -2);
  border-radius: 50%;
  border: 2rpx solid var(--wave-color);
  opacity: 0;
  animation: wave-expand var(--wave-duration, 3s) ease-out infinite;
}

@keyframes wave-expand {
  0% {
    transform: scale(0.1);
    opacity: var(--wave-opacity, 0.4);
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

/* 因果链节点 */
.chain-node {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 5;
  opacity: 0.4;
  transition: opacity 0.5s, transform 0.3s;
  animation: node-appear 0.5s ease-out forwards;
}

.chain-node.node-active {
  opacity: 1;
}

.chain-node:active {
  transform: translate(-50%, -50%) scale(1.1);
}

@keyframes node-appear {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
  to { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
}

.chain-node.node-active {
  animation: node-appear-active 0.5s ease-out forwards;
}

@keyframes node-appear-active {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

.chain-node-icon {
  font-size: 28rpx;
}

.chain-node-label {
  font-size: 16rpx;
  color: #888;
  margin-top: 4rpx;
}

.chain-node.node-active .chain-node-label {
  color: #e0e0e0;
}

.chain-node-glow {
  position: absolute;
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(79, 195, 247, 0.3) 0%, transparent 70%);
  animation: glow-pulse 1.5s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); }
}

/* 因果连线 SVG */
.chain-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.chain-line {
  animation: line-draw 1s ease-out forwards;
  stroke-dashoffset: 100;
}

@keyframes line-draw {
  from { stroke-dashoffset: 100; opacity: 0; }
  to { stroke-dashoffset: 0; opacity: 1; }
}

/* ==================== 因果时间线 ==================== */

.causal-timeline {
  padding: 16rpx 24rpx 24rpx;
}

.causal-event {
  display: flex;
  gap: 12rpx;
}

.ce-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 24rpx;
}

.ce-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.ce-line {
  width: 2rpx;
  flex: 1;
  background: rgba(255, 255, 255, 0.08);
  margin: 4rpx 0;
}

.ce-content {
  flex: 1;
  padding-bottom: 16rpx;
}

.ce-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.ce-icon {
  font-size: 22rpx;
}

.ce-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #e0e0e0;
  flex: 1;
}

.ce-magnitude {
  font-size: 18rpx;
  font-weight: 600;
  padding: 2rpx 8rpx;
  border-radius: 6rpx;
}

.mag-low { background: rgba(129, 199, 132, 0.15); color: #81C784; }
.mag-medium { background: rgba(255, 213, 79, 0.15); color: #FFD54F; }
.mag-high { background: rgba(239, 83, 80, 0.15); color: #EF5350; }

.ce-desc {
  font-size: 20rpx;
  color: #888;
  display: block;
  margin-top: 4rpx;
}

.ce-impacts {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 8rpx;
}

.ce-impact {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 2rpx 8rpx;
  border-radius: 4rpx;
  font-size: 18rpx;
}

.impact-positive {
  background: rgba(129, 199, 132, 0.1);
}

.impact-negative {
  background: rgba(239, 83, 80, 0.1);
}

.impact-dim {
  color: #888;
}

.impact-delta {
  font-weight: 600;
}

.impact-positive .impact-delta { color: #81C784; }
.impact-negative .impact-delta { color: #EF5350; }

/* ==================== 空状态 ==================== */

.empty-chain {
  text-align: center;
  padding: 40rpx;
}

.empty-icon {
  font-size: 48rpx;
  display: block;
}

.empty-text {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-top: 8rpx;
}
</style>
