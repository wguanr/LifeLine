<template>
  <view class="dashboard-page">
    <!-- 顶部标题 -->
    <view class="dashboard-header">
      <text class="dashboard-title">世界涟漪仪表盘</text>
      <text class="dashboard-subtitle">每一个选择，都在这里留下回声</text>
    </view>

    <!-- 世界状态概览 -->
    <view class="card world-overview-card">
      <text class="card-title">世界状态</text>
      <view class="epoch-banner" :class="'epoch-' + worldState.epoch">
        <view class="epoch-top-row">
          <view class="epoch-text-area">
            <text class="epoch-name">{{ epochNames[worldState.epoch] || worldState.epoch }}</text>
            <text class="epoch-desc">{{ epochDescs[worldState.epoch] || '' }}</text>
          </view>
          <view class="epoch-bonus-badge">
            <text class="epoch-bonus-label">纪元加成</text>
            <text class="epoch-bonus-value">x{{ epochBonuses[worldState.epoch] || '1.00' }}</text>
          </view>
        </view>
        <!-- 纪元进度指示器 -->
        <view class="epoch-timeline">
          <view
            v-for="(ep, idx) in epochOrder"
            :key="ep"
            class="epoch-dot-wrapper"
          >
            <view
              class="epoch-dot-indicator"
              :class="{
                'dot-active': worldState.epoch === ep,
                'dot-passed': epochOrder.indexOf(worldState.epoch) > idx
              }"
              :style="{ background: epochColors[ep] }"
            />
            <text class="epoch-dot-label" :class="{ 'label-active': worldState.epoch === ep }">
              {{ epochShortNames[ep] }}
            </text>
          </view>
          <view class="epoch-line" />
        </view>
      </view>

      <!-- 五维雷达图（用条形图模拟） -->
      <view class="dimensions-section">
        <text class="section-label">世界维度</text>
        <view class="dimensions-grid">
          <view v-for="(dim, key) in worldState.dimensions" :key="key" class="dim-item">
            <view class="dim-label-row">
              <text class="dim-icon">{{ dimIcons[key] }}</text>
              <text class="dim-label">{{ dimLabels[key] || key }}</text>
            </view>
            <view class="dim-bar-bg">
              <view
                class="dim-bar-fill"
                :style="{ width: (dim * 100) + '%', background: dimColors[key] }"
              />
              <!-- 阈值标记 -->
              <view class="dim-threshold low" />
              <view class="dim-threshold high" />
            </view>
            <text class="dim-value" :class="dimValueClass(dim)">{{ (dim * 100).toFixed(0) }}%</text>
          </view>
        </view>
      </view>

      <!-- 资源潮汐 -->
      <view class="tide-section">
        <text class="section-label">资源潮汐</text>
        <view class="tide-grid">
          <view v-for="(val, key) in worldState.tideMultiplier" :key="key" class="tide-card">
            <text class="tide-icon">{{ tideIcons[key] }}</text>
            <text class="tide-name">{{ tideNames[key] }}</text>
            <text class="tide-val" :class="tideClass(val)">
              x{{ val?.toFixed(2) }}
            </text>
            <view class="tide-indicator">
              <view
                class="tide-bar"
                :style="{
                  width: Math.min(val * 50, 100) + '%',
                  background: tideBarColor(val)
                }"
              />
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 社交网络概览 -->
    <view class="card social-card">
      <text class="card-title">社交网络</text>
      <view class="social-stats">
        <view class="social-stat">
          <text class="social-num">{{ socialOverview.followingCount }}</text>
          <text class="social-label">关注</text>
        </view>
        <view class="social-stat">
          <text class="social-num">{{ socialOverview.followerCount }}</text>
          <text class="social-label">粉丝</text>
        </view>
        <view class="social-stat">
          <text class="social-num">{{ socialOverview.mutualCount }}</text>
          <text class="social-label">互关</text>
        </view>
        <view class="social-stat">
          <text class="social-num">{{ (socialOverview.avgTrustGiven * 100).toFixed(0) }}%</text>
          <text class="social-label">信任度</text>
        </view>
      </view>
      <view class="network-health-bar">
        <text class="health-label">网络健康度</text>
        <view class="health-track">
          <view class="health-fill" :style="{ width: networkHealth + '%' }" />
        </view>
        <text class="health-value">{{ networkHealth }}%</text>
      </view>
    </view>

    <!-- 信息市场 -->
    <view class="card info-market-card">
      <text class="card-title">信息市场</text>
      <view class="info-stats" v-if="infoMarket">
        <view class="info-stat-row">
          <view class="info-stat">
            <text class="info-num">{{ infoMarket.totalPieces }}</text>
            <text class="info-label">总信息</text>
          </view>
          <view class="info-stat">
            <text class="info-num">{{ infoMarket.activeRumors || 0 }}</text>
            <text class="info-label">活跃谣言</text>
          </view>
          <view class="info-stat">
            <text class="info-num">{{ (infoMarket.avgAccuracy * 100).toFixed(0) }}%</text>
            <text class="info-label">准确度</text>
          </view>
        </view>
        <!-- 信息层级分布 -->
        <view class="tier-distribution">
          <text class="tier-title">信息层级分布</text>
          <view class="tier-bars">
            <view class="tier-bar-item">
              <text class="tier-label">公开</text>
              <view class="tier-bar-bg">
                <view
                  class="tier-bar-fill tier-public"
                  :style="{ width: tierPercent('public') + '%' }"
                />
              </view>
              <text class="tier-count">{{ infoMarket.tierDistribution?.public || 0 }}</text>
            </view>
            <view class="tier-bar-item">
              <text class="tier-label">深层</text>
              <view class="tier-bar-bg">
                <view
                  class="tier-bar-fill tier-deep"
                  :style="{ width: tierPercent('deep') + '%' }"
                />
              </view>
              <text class="tier-count">{{ infoMarket.tierDistribution?.deep || 0 }}</text>
            </view>
            <view class="tier-bar-item">
              <text class="tier-label">核心</text>
              <view class="tier-bar-bg">
                <view
                  class="tier-bar-fill tier-core"
                  :style="{ width: tierPercent('core') + '%' }"
                />
              </view>
              <text class="tier-count">{{ infoMarket.tierDistribution?.core || 0 }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 涟漪可视化 -->
    <view class="card ripple-card">
      <text class="card-title">因果涟漪</text>
      <RippleCanvas ref="rippleRef" :height="250" :showEvents="true" :events="rippleEvents" />
      <view class="ripple-controls">
        <view class="btn btn-sm" @click="simulateRipple('choice')">模拟选择</view>
        <view class="btn btn-sm" @click="simulateRipple('social')">模拟社交</view>
        <view class="btn btn-sm" @click="simulateRipple('epoch_change')">模拟纪元</view>
        <view class="btn btn-sm btn-danger" @click="simulateRipple('black_swan')">黑天鹅</view>
      </view>
    </view>

    <!-- 世界历史时间线 -->
    <view class="card timeline-card">
      <text class="card-title">世界编年史</text>
      <view class="timeline" v-if="worldSnapshots.length > 0">
        <view
          v-for="(snap, idx) in worldSnapshots"
          :key="idx"
          class="timeline-item"
          :class="snap.significantEvent ? 'timeline-significant' : ''"
        >
          <view class="timeline-dot" :class="'epoch-dot-' + snap.epoch" />
          <view class="timeline-content">
            <text class="timeline-epoch">{{ epochNames[snap.epoch] || snap.epoch }}</text>
            <text class="timeline-tick">Tick #{{ snap.tickNumber }}</text>
            <text class="timeline-event" v-if="snap.significantEvent">{{ snap.significantEvent }}</text>
            <view class="timeline-dims">
              <text class="timeline-dim" v-for="(key) in ['dimStability','dimProsperity','dimFreedom','dimKnowledge','dimSolidarity']" :key="key">
                {{ dimLabels[key.replace('dim','')] || key }}: {{ ((snap[key] || 0) * 100).toFixed(0) }}%
              </text>
            </view>
            <text class="timeline-time">{{ formatDate(snap.createdAt) }}</text>
          </view>
        </view>
      </view>
      <view v-else class="empty-state">
        <text class="empty-text">暂无世界历史记录，触发 World Tick 后将出现</text>
      </view>
      <view class="btn" @click="triggerWorldTick" style="margin-top: 16rpx;">触发 World Tick</view>
    </view>

    <!-- WebSocket 状态 -->
    <view class="card ws-card">
      <text class="card-title">实时连接</text>
      <view class="ws-status">
        <view class="ws-indicator" :class="wsConnected ? 'ws-connected' : 'ws-disconnected'" />
        <text class="ws-text">{{ wsConnected ? '已连接' : '未连接' }}</text>
        <text class="ws-detail">在线: {{ wsOnline }}</text>
      </view>
      <view class="ws-messages" v-if="wsMessages.length > 0">
        <view v-for="(msg, idx) in wsMessages" :key="idx" class="ws-msg-item">
          <text class="ws-msg-type">[{{ msg.type }}]</text>
          <text class="ws-msg-text">{{ JSON.stringify(msg.payload).slice(0, 80) }}</text>
        </view>
      </view>
      <view class="ws-controls">
        <view class="btn btn-sm" @click="connectWs">{{ wsConnected ? '重连' : '连接' }}</view>
        <view class="btn btn-sm" @click="disconnectWs" v-if="wsConnected">断开</view>
      </view>
    </view>

    <!-- 快捷导航 -->
    <view class="card nav-card">
      <text class="card-title">快捷导航</text>
      <view class="nav-grid">
        <view class="nav-item" @click="navigateTo('/pages/market/market')">
          <text class="nav-icon">🏪</text>
          <text class="nav-label">物品市场</text>
        </view>
        <view class="nav-item" @click="navigateTo('/pages/debug/debug')">
          <text class="nav-icon">🔧</text>
          <text class="nav-label">调试面板</text>
        </view>
        <view class="nav-item" @click="navigateTo('/pages/community/community')">
          <text class="nav-icon">👥</text>
          <text class="nav-label">社区</text>
        </view>
        <view class="nav-item" @click="navigateTo('/pages/profile/profile')">
          <text class="nav-icon">👤</text>
          <text class="nav-label">个人</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import RippleCanvas from '@/components/ripple/RippleCanvas.vue'
import { socialApi, infoApi, worldApi, wsClient, type WsMessage } from '@/api'

const API_BASE = 'http://localhost:3001'
const WS_BASE = 'ws://localhost:3001/ws'

// ==================== 状态 ====================

const worldState = ref<any>({
  epoch: 'genesis',
  dimensions: { stability: 0.5, prosperity: 0.5, freedom: 0.5, knowledge: 0.5, solidarity: 0.5 },
  tideMultiplier: { time: 1, energy: 1, reputation: 1 },
})
const socialOverview = ref<any>({
  followingCount: 0,
  followerCount: 0,
  mutualCount: 0,
  avgTrustGiven: 0,
  avgTrustReceived: 0,
})
const infoMarket = ref<any>(null)
const worldSnapshots = ref<any[]>([])
const rippleEvents = ref<any[]>([])
const rippleRef = ref<any>(null)

// WebSocket
const wsConnected = ref(false)
const wsOnline = ref(0)
const wsMessages = ref<any[]>([])
let ws: WebSocket | null = null

// ==================== 常量映射 ====================

const epochOrder = ['genesis', 'golden_age', 'enlightenment', 'turbulence', 'solidarity', 'dark_age']

const epochNames: Record<string, string> = {
  genesis: '创世纪',
  golden_age: '黄金时代',
  turbulence: '动荡之秋',
  enlightenment: '启蒙时代',
  solidarity: '团结纪元',
  dark_age: '黑暗时代',
}

const epochShortNames: Record<string, string> = {
  genesis: '创世',
  golden_age: '黄金',
  turbulence: '动荡',
  enlightenment: '启蒙',
  solidarity: '团结',
  dark_age: '黑暗',
}

const epochDescs: Record<string, string> = {
  genesis: '世界初生，一切皆有可能',
  golden_age: '繁荣与稳定的巅峰',
  turbulence: '变革与冲突的漩涡',
  enlightenment: '知识与自由的觉醒',
  solidarity: '团结与合作的力量',
  dark_age: '混沌与衰退的深渊',
}

const epochBonuses: Record<string, string> = {
  genesis: '1.00',
  golden_age: '1.20',
  turbulence: '0.85',
  enlightenment: '1.15',
  solidarity: '1.10',
  dark_age: '0.70',
}

const epochColors: Record<string, string> = {
  genesis: '#4FC3F7',
  golden_age: '#FFD54F',
  turbulence: '#EF5350',
  enlightenment: '#CE93D8',
  solidarity: '#FF8A65',
  dark_age: '#666',
}

const dimLabels: Record<string, string> = {
  stability: '稳定', Stability: '稳定',
  prosperity: '繁荣', Prosperity: '繁荣',
  freedom: '自由', Freedom: '自由',
  knowledge: '知识', Knowledge: '知识',
  solidarity: '团结', Solidarity: '团结',
}

const dimIcons: Record<string, string> = {
  stability: '🛡',
  prosperity: '💰',
  freedom: '🕊',
  knowledge: '📚',
  solidarity: '🤝',
}

const dimColors: Record<string, string> = {
  stability: '#4FC3F7',
  prosperity: '#FFD54F',
  freedom: '#81C784',
  knowledge: '#CE93D8',
  solidarity: '#FF8A65',
}

const tideIcons: Record<string, string> = {
  time: '⏱',
  energy: '⚡',
  reputation: '⭐',
}

const tideNames: Record<string, string> = {
  time: '时间',
  energy: '精力',
  reputation: '声誉',
}

// ==================== 计算属性 ====================

const networkHealth = computed(() => {
  const o = socialOverview.value
  if (o.followingCount === 0) return 0
  const mutualRatio = o.mutualCount / Math.max(o.followingCount, 1)
  const trustScore = (o.avgTrustGiven + o.avgTrustReceived) / 2
  return Math.round((mutualRatio * 50 + trustScore * 50))
})

// ==================== 工具函数 ====================

function dimValueClass(val: number): string {
  if (val > 0.7) return 'dim-high'
  if (val < 0.3) return 'dim-low'
  return ''
}

function tideClass(val: number): string {
  if (val > 1.1) return 'tide-up'
  if (val < 0.9) return 'tide-down'
  return ''
}

function tideBarColor(val: number): string {
  if (val > 1.1) return '#81C784'
  if (val < 0.9) return '#EF5350'
  return '#FFD54F'
}

function tierPercent(tier: string): number {
  if (!infoMarket.value || !infoMarket.value.totalPieces) return 0
  const count = infoMarket.value.tierDistribution?.[tier] || 0
  return (count / infoMarket.value.totalPieces) * 100
}

function formatDate(ts: number): string {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function navigateTo(url: string) {
  uni.navigateTo({ url })
}

// ==================== API 请求 ====================

async function fetchData() {
  try {
    // 世界状态
    const worldRes = await fetch(`${API_BASE}/api/world`)
    if (worldRes.ok) {
      const data = await worldRes.json()
      // API 返回 { world: { epoch, dimensions, tideMultiplier, ... } }
      const w = data.world || data
      worldState.value = {
        epoch: w.epoch || 'genesis',
        dimensions: w.dimensions || worldState.value.dimensions,
        tideMultiplier: w.tideMultiplier || worldState.value.tideMultiplier,
      }
    }

    // 社交概览
    try {
      const socialRes = await socialApi.getOverview()
      if (socialRes.data) {
        socialOverview.value = socialRes.data
      }
    } catch {}

    // 信息市场
    const infoRes = await fetch(`${API_BASE}/api/info/market`)
    if (infoRes.ok) {
      infoMarket.value = await infoRes.json()
    }

    // 世界快照
    const snapRes = await fetch(`${API_BASE}/api/debug/world/snapshots`)
    if (snapRes.ok) {
      const data = await snapRes.json()
      worldSnapshots.value = data.snapshots || []
    }
  } catch (e) {
    console.warn('[Dashboard] API fetch failed, using defaults')
  }
}

async function triggerWorldTick() {
  try {
    const res = await fetch(`${API_BASE}/api/debug/world/tick`, { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      rippleEvents.value.push({
        type: 'world_tick',
        title: 'World Tick',
        description: `纪元: ${epochNames[data.result?.epoch] || data.result?.epoch}`,
        magnitude: 0.3,
        timestamp: Date.now(),
      })
      await fetchData()
      uni.showToast({ title: 'Tick 完成', icon: 'success' })
    }
  } catch (e) {
    uni.showToast({ title: 'Tick 失败', icon: 'none' })
  }
}

// ==================== 涟漪模拟 ====================

function simulateRipple(type: string) {
  const titles: Record<string, string> = {
    choice: '玩家做出了选择',
    epoch_change: '纪元发生了变迁',
    black_swan: '黑天鹅事件降临！',
    social: '社交互动发生',
    information: '新信息被解锁',
  }
  const magnitudes: Record<string, number> = {
    choice: 0.3 + Math.random() * 0.3,
    epoch_change: 0.7 + Math.random() * 0.2,
    black_swan: 0.9 + Math.random() * 0.1,
    social: 0.2 + Math.random() * 0.3,
    information: 0.3 + Math.random() * 0.2,
  }

  const event = {
    type,
    title: titles[type] || '未知事件',
    description: `模拟 ${type} 涟漪效果`,
    magnitude: magnitudes[type] || 0.5,
    timestamp: Date.now(),
  }

  rippleEvents.value.push(event)
  if (rippleRef.value) {
    rippleRef.value.addRipple(event)
  }
}

// ==================== WebSocket ====================

function connectWs() {
  if (ws) {
    ws.close()
  }

  try {
    ws = new WebSocket(WS_BASE)

    ws.onopen = () => {
      wsConnected.value = true
      wsMessages.value.unshift({
        type: 'system',
        payload: 'Connected',
        timestamp: Date.now(),
      })
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        wsMessages.value.unshift(msg)
        if (wsMessages.value.length > 20) {
          wsMessages.value = wsMessages.value.slice(0, 20)
        }

        if (msg.type === 'player_count') {
          wsOnline.value = msg.payload?.online || 0
        }

        if (['world_tick', 'epoch_change', 'black_swan', 'choice_update'].includes(msg.type)) {
          rippleEvents.value.push({
            type: msg.type,
            title: msg.type.replace(/_/g, ' '),
            description: JSON.stringify(msg.payload).slice(0, 50),
            magnitude: msg.type === 'black_swan' ? 0.9 : 0.4,
            timestamp: msg.timestamp || Date.now(),
          })
        }
      } catch (e) {}
    }

    ws.onclose = () => {
      wsConnected.value = false
    }

    ws.onerror = () => {
      wsConnected.value = false
    }
  } catch (e) {
    wsConnected.value = false
  }
}

function disconnectWs() {
  if (ws) {
    ws.close()
    ws = null
  }
}

// ==================== 生命周期 ====================

onMounted(() => {
  fetchData()
  connectWs()
})

onUnmounted(() => {
  disconnectWs()
})
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 100%);
  padding: 24rpx;
  padding-bottom: 120rpx;
}

.dashboard-header {
  text-align: center;
  padding: 32rpx 0;
}

.dashboard-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #e0e0e0;
  display: block;
}

.dashboard-subtitle {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-top: 8rpx;
}

/* ==================== 卡片 ==================== */

.card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #e0e0e0;
  display: block;
  margin-bottom: 16rpx;
}

.section-label {
  font-size: 24rpx;
  font-weight: 500;
  color: #aaa;
  display: block;
  margin-bottom: 12rpx;
}

/* ==================== 纪元 ==================== */

.epoch-banner {
  padding: 20rpx;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  background: rgba(79, 195, 247, 0.1);
  border: 1px solid rgba(79, 195, 247, 0.2);
}

.epoch-genesis { background: rgba(79, 195, 247, 0.1); border-color: rgba(79, 195, 247, 0.3); }
.epoch-golden_age { background: rgba(255, 213, 79, 0.1); border-color: rgba(255, 213, 79, 0.3); }
.epoch-turbulence { background: rgba(239, 83, 80, 0.1); border-color: rgba(239, 83, 80, 0.3); }
.epoch-enlightenment { background: rgba(206, 147, 216, 0.1); border-color: rgba(206, 147, 216, 0.3); }
.epoch-solidarity { background: rgba(255, 138, 101, 0.1); border-color: rgba(255, 138, 101, 0.3); }
.epoch-dark_age { background: rgba(100, 100, 100, 0.1); border-color: rgba(100, 100, 100, 0.3); }

.epoch-top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.epoch-text-area {
  flex: 1;
}

.epoch-name {
  font-size: 32rpx;
  font-weight: 700;
  color: #fff;
  display: block;
}

.epoch-desc {
  font-size: 22rpx;
  color: #aaa;
  display: block;
  margin-top: 4rpx;
}

.epoch-bonus-badge {
  background: rgba(255, 255, 255, 0.1);
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  text-align: center;
}

.epoch-bonus-label {
  font-size: 18rpx;
  color: #888;
  display: block;
}

.epoch-bonus-value {
  font-size: 28rpx;
  font-weight: 700;
  color: #FFD54F;
  display: block;
}

/* 纪元时间线 */
.epoch-timeline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  padding: 0 8rpx;
}

.epoch-line {
  position: absolute;
  top: 12rpx;
  left: 24rpx;
  right: 24rpx;
  height: 2rpx;
  background: rgba(255, 255, 255, 0.1);
  z-index: 0;
}

.epoch-dot-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.epoch-dot-indicator {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 2rpx solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.epoch-dot-indicator.dot-active {
  width: 28rpx;
  height: 28rpx;
  border: 3rpx solid #fff;
  box-shadow: 0 0 12rpx currentColor;
}

.epoch-dot-indicator.dot-passed {
  opacity: 0.5;
}

.epoch-dot-label {
  font-size: 16rpx;
  color: #666;
  margin-top: 6rpx;
}

.epoch-dot-label.label-active {
  color: #fff;
  font-weight: 600;
}

/* ==================== 维度 ==================== */

.dimensions-section {
  margin-bottom: 20rpx;
}

.dimensions-grid {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.dim-item {
  display: flex;
  align-items: center;
}

.dim-label-row {
  display: flex;
  align-items: center;
  gap: 6rpx;
  width: 100rpx;
}

.dim-icon {
  font-size: 24rpx;
}

.dim-label {
  font-size: 22rpx;
  color: #aaa;
}

.dim-bar-bg {
  flex: 1;
  height: 16rpx;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 8rpx;
  overflow: hidden;
  margin: 0 12rpx;
  position: relative;
}

.dim-bar-fill {
  height: 100%;
  border-radius: 8rpx;
  transition: width 0.5s ease;
}

.dim-threshold {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2rpx;
  background: rgba(255, 255, 255, 0.15);
}

.dim-threshold.low { left: 30%; }
.dim-threshold.high { left: 70%; }

.dim-value {
  width: 70rpx;
  font-size: 22rpx;
  color: #ccc;
  text-align: right;
  font-weight: 600;
}

.dim-high { color: #81C784 !important; }
.dim-low { color: #EF5350 !important; }

/* ==================== 潮汐 ==================== */

.tide-section {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 16rpx;
}

.tide-grid {
  display: flex;
  gap: 16rpx;
}

.tide-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12rpx;
  padding: 16rpx;
  text-align: center;
}

.tide-icon { font-size: 32rpx; display: block; }
.tide-name { font-size: 20rpx; color: #888; display: block; margin-top: 4rpx; }
.tide-val { font-size: 28rpx; font-weight: 700; color: #ccc; display: block; margin-top: 4rpx; }
.tide-up { color: #81C784 !important; }
.tide-down { color: #EF5350 !important; }

.tide-indicator {
  height: 6rpx;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 3rpx;
  overflow: hidden;
  margin-top: 8rpx;
}

.tide-bar {
  height: 100%;
  border-radius: 3rpx;
  transition: width 0.3s;
}

/* ==================== 社交网络 ==================== */

.social-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 16rpx;
}

.social-stat { text-align: center; }
.social-num { font-size: 36rpx; font-weight: 700; color: #CE93D8; display: block; }
.social-label { font-size: 20rpx; color: #888; display: block; }

.network-health-bar {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.health-label { font-size: 22rpx; color: #888; width: 120rpx; }

.health-track {
  flex: 1;
  height: 12rpx;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 6rpx;
  overflow: hidden;
}

.health-fill {
  height: 100%;
  background: linear-gradient(90deg, #EF5350, #FFD54F, #81C784);
  border-radius: 6rpx;
  transition: width 0.5s;
}

.health-value { font-size: 22rpx; color: #ccc; font-weight: 600; width: 60rpx; text-align: right; }

/* ==================== 信息市场 ==================== */

.info-stat-row {
  display: flex;
  justify-content: space-around;
  margin-bottom: 16rpx;
}

.info-stat { text-align: center; }
.info-num { font-size: 36rpx; font-weight: 700; color: #4DD0E1; display: block; }
.info-label { font-size: 20rpx; color: #888; display: block; }

.tier-distribution { margin-top: 12rpx; }
.tier-title { font-size: 22rpx; color: #888; display: block; margin-bottom: 8rpx; }

.tier-bars { display: flex; flex-direction: column; gap: 8rpx; }

.tier-bar-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.tier-label { font-size: 20rpx; color: #aaa; width: 60rpx; }

.tier-bar-bg {
  flex: 1;
  height: 12rpx;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 6rpx;
  overflow: hidden;
}

.tier-bar-fill {
  height: 100%;
  border-radius: 6rpx;
  transition: width 0.3s;
}

.tier-public { background: #81C784; }
.tier-deep { background: #FFD54F; }
.tier-core { background: #EF5350; }

.tier-count { font-size: 20rpx; color: #ccc; width: 40rpx; text-align: right; }

/* ==================== 时间线 ==================== */

.timeline {
  position: relative;
  padding-left: 32rpx;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 10rpx;
  top: 0;
  bottom: 0;
  width: 2rpx;
  background: rgba(255, 255, 255, 0.1);
}

.timeline-item {
  position: relative;
  padding-bottom: 20rpx;
  padding-left: 16rpx;
}

.timeline-dot {
  position: absolute;
  left: -28rpx;
  top: 8rpx;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #4FC3F7;
  border: 2rpx solid #0a0a1a;
}

.epoch-dot-genesis { background: #4FC3F7; }
.epoch-dot-golden_age { background: #FFD54F; }
.epoch-dot-turbulence { background: #EF5350; }
.epoch-dot-enlightenment { background: #CE93D8; }
.epoch-dot-solidarity { background: #FF8A65; }
.epoch-dot-dark_age { background: #666; }

.timeline-significant {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8rpx;
  padding: 12rpx;
}

.timeline-epoch { font-size: 24rpx; font-weight: 600; color: #e0e0e0; display: block; }
.timeline-tick { font-size: 20rpx; color: #888; display: block; }
.timeline-event { font-size: 22rpx; color: #FFD54F; display: block; margin-top: 4rpx; }

.timeline-dims {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 8rpx;
}

.timeline-dim {
  font-size: 18rpx;
  color: #666;
  background: rgba(255, 255, 255, 0.05);
  padding: 2rpx 8rpx;
  border-radius: 4rpx;
}

.timeline-time { font-size: 18rpx; color: #555; display: block; margin-top: 4rpx; }

/* ==================== WebSocket ==================== */

.ws-status {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.ws-indicator {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
}

.ws-connected { background: #81C784; box-shadow: 0 0 8rpx #81C784; }
.ws-disconnected { background: #EF5350; }

.ws-text { font-size: 24rpx; color: #e0e0e0; }
.ws-detail { font-size: 20rpx; color: #888; margin-left: auto; }

.ws-messages {
  max-height: 300rpx;
  overflow-y: auto;
  margin-bottom: 12rpx;
}

.ws-msg-item {
  display: flex;
  gap: 8rpx;
  padding: 4rpx 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.ws-msg-type { font-size: 20rpx; color: #4FC3F7; font-family: monospace; }
.ws-msg-text { font-size: 20rpx; color: #888; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.ws-controls {
  display: flex;
  gap: 12rpx;
}

/* ==================== 导航 ==================== */

.nav-grid {
  display: flex;
  gap: 16rpx;
}

.nav-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12rpx;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.nav-item:active { background: rgba(255, 255, 255, 0.08); }
.nav-icon { font-size: 40rpx; display: block; }
.nav-label { font-size: 20rpx; color: #aaa; display: block; margin-top: 8rpx; }

/* ==================== 按钮 ==================== */

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12rpx 24rpx;
  background: rgba(79, 195, 247, 0.15);
  border: 1px solid rgba(79, 195, 247, 0.3);
  border-radius: 12rpx;
  color: #4FC3F7;
  font-size: 24rpx;
}

.btn-sm { padding: 8rpx 16rpx; font-size: 22rpx; }

.btn-danger {
  background: rgba(239, 83, 80, 0.15);
  border-color: rgba(239, 83, 80, 0.3);
  color: #EF5350;
}

.ripple-controls {
  display: flex;
  gap: 12rpx;
  margin-top: 16rpx;
  justify-content: center;
  flex-wrap: wrap;
}

.empty-state {
  text-align: center;
  padding: 40rpx;
}

.empty-text {
  font-size: 24rpx;
  color: #666;
}
</style>
