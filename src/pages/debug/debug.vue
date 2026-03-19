<template>
  <view class="debug-page">
    <!-- 顶部标题 -->
    <view class="debug-header">
      <text class="debug-title">🔧 引擎测试面板</text>
      <text class="debug-subtitle">Phase 2 — 可视化验证所有后端引擎效果</text>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-card">
      <text class="loading-text">⏳ 正在连接后端引擎...</text>
    </view>

    <!-- 错误提示 -->
    <view v-if="error" class="error-card">
      <text class="error-text">❌ {{ error }}</text>
      <view class="btn btn-small" @click="loadAll">重试</view>
    </view>

    <!-- ==================== 卡片1: 引擎状态总览 ==================== -->
    <view class="card" v-if="status">
      <view class="card-header">
        <text class="card-title">🌍 引擎状态总览</text>
        <view class="btn btn-small" @click="loadStatus">刷新</view>
      </view>

      <!-- 世界纪元 -->
      <view class="info-row epoch-row">
        <text class="info-label">当前纪元</text>
        <view class="epoch-badge" :class="'epoch-' + status.world.epoch">
          <text class="epoch-name">{{ status.world.epochName }}</text>
        </view>
      </view>
      <text class="epoch-desc">{{ status.world.epochDescription }}</text>

      <!-- 世界维度 -->
      <view class="section-title-row">
        <text class="section-label">世界维度</text>
      </view>
      <view class="dimension-grid">
        <view class="dimension-item" v-for="(val, key) in status.world.dimensions" :key="key">
          <text class="dim-label">{{ dimensionNames[key] || key }}</text>
          <view class="dim-bar-bg">
            <view class="dim-bar-fill" :style="{ width: (val * 100) + '%', background: getDimColor(val) }"></view>
          </view>
          <text class="dim-value">{{ (val * 100).toFixed(1) }}%</text>
        </view>
      </view>

      <!-- 资源潮汐 -->
      <view class="section-title-row">
        <text class="section-label">资源潮汐乘数</text>
      </view>
      <view class="tide-grid">
        <view class="tide-item" v-for="(val, key) in status.world.tideMultiplier" :key="key">
          <text class="tide-icon">{{ tideIcons[key] }}</text>
          <text class="tide-label">{{ tideNames[key] }}</text>
          <text class="tide-value" :class="val > 1 ? 'tide-up' : val < 1 ? 'tide-down' : ''">
            ×{{ val.toFixed(2) }}
          </text>
        </view>
      </view>

      <!-- Tick 统计 -->
      <view class="info-row">
        <text class="info-label">Tick 次数</text>
        <text class="info-value">{{ status.tickStats.totalTicks }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">物品数量</text>
        <text class="info-value">{{ status.itemPriceStats.totalItems }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">价格趋势</text>
        <text class="info-value">
          📈{{ status.itemPriceStats.trendDistribution.rising }}
          ➡️{{ status.itemPriceStats.trendDistribution.stable }}
          📉{{ status.itemPriceStats.trendDistribution.falling }}
        </text>
      </view>
    </view>

    <!-- ==================== 卡片2: 世界维度控制器 ==================== -->
    <view class="card">
      <view class="card-header">
        <text class="card-title">🎛️ 世界维度控制器</text>
      </view>
      <text class="card-desc">拖动滑块调整世界维度，观察纪元变迁和潮汐变化</text>

      <view class="slider-group" v-for="dim in dimensionSliders" :key="dim.key">
        <view class="slider-header">
          <text class="slider-label">{{ dim.label }}</text>
          <text class="slider-value">{{ (dim.value * 100).toFixed(0) }}%</text>
        </view>
        <slider
          :value="dim.value * 100"
          :min="0"
          :max="100"
          :step="5"
          activeColor="#00f5ff"
          backgroundColor="#333"
          @change="(e: any) => dim.value = e.detail.value / 100"
        />
      </view>

      <view class="btn btn-primary" @click="applyDimensions">
        ⚡ 应用维度变更
      </view>
      <text v-if="dimResult" class="result-text">{{ dimResult }}</text>
    </view>

    <!-- ==================== 卡片3: 世界 Tick ==================== -->
    <view class="card">
      <view class="card-header">
        <text class="card-title">⏰ 世界 Tick</text>
      </view>
      <text class="card-desc">手动触发世界 Tick，观察自然漂移、纪元变迁和黑天鹅事件</text>

      <view class="btn-row">
        <view class="btn btn-primary" @click="triggerTick">🔄 触发 Tick</view>
        <view class="btn btn-secondary" @click="triggerMultipleTicks">🔄×5 连续 Tick</view>
      </view>

      <view v-if="tickResult" class="tick-result">
        <view class="info-row">
          <text class="info-label">纪元</text>
          <text class="info-value" :class="tickResult.epochChanged ? 'highlight' : ''">
            {{ tickResult.epochChanged ? tickResult.previousEpoch + ' → ' + tickResult.currentEpoch : tickResult.currentEpoch }}
          </text>
        </view>
        <view class="info-row">
          <text class="info-label">处理选择数</text>
          <text class="info-value">{{ tickResult.playerChoicesProcessed }}</text>
        </view>
        <view class="info-row" v-if="tickResult.blackSwanTriggered">
          <text class="info-label">🦢 黑天鹅</text>
          <text class="info-value highlight">{{ tickResult.blackSwanType }}</text>
        </view>
      </view>
    </view>

    <!-- ==================== 卡片4: 动态价格 ==================== -->
    <view class="card">
      <view class="card-header">
        <text class="card-title">💰 Bonding Curve 动态定价</text>
        <view class="btn btn-small" @click="loadPrices">刷新</view>
      </view>
      <text class="card-desc">物品价格随铸造量和世界状态动态变化</text>

      <view v-if="itemPrices.length > 0" class="price-list">
        <view class="price-item" v-for="item in itemPrices" :key="item.id">
          <view class="price-left">
            <text class="price-icon">{{ item.icon }}</text>
            <view class="price-info">
              <text class="price-name">{{ item.name }}</text>
              <text class="price-rarity" :class="'rarity-' + item.rarity">{{ item.rarity }}</text>
            </view>
          </view>
          <view class="price-right">
            <view class="price-multipliers">
              <text class="mul-tag">BC ×{{ item.dynamicPrice.bondingMultiplier }}</text>
              <text class="mul-tag" :class="item.dynamicPrice.worldSensitivityMultiplier < 1 ? 'mul-discount' : item.dynamicPrice.worldSensitivityMultiplier > 1 ? 'mul-premium' : ''">
                WS ×{{ item.dynamicPrice.worldSensitivityMultiplier }}
              </text>
            </view>
            <view class="price-final">
              <text class="price-trend">{{ item.dynamicPrice.trend === 'rising' ? '📈' : item.dynamicPrice.trend === 'falling' ? '📉' : '➡️' }}</text>
              <text class="price-cost">⏱{{ item.dynamicPrice.finalCost.time }} ⚡{{ item.dynamicPrice.finalCost.energy }}</text>
            </view>
            <text class="price-scarcity">稀缺度 {{ (item.dynamicPrice.scarcity * 100).toFixed(0) }}%</text>
          </view>
        </view>
      </view>
    </view>

    <!-- ==================== 卡片5: 用户状态 ==================== -->
    <view class="card">
      <view class="card-header">
        <text class="card-title">👤 用户状态</text>
        <view class="btn btn-small" @click="loadUserState">刷新</view>
      </view>

      <view v-if="userState">
        <view class="section-title-row">
          <text class="section-label">钱包</text>
        </view>
        <view class="wallet-grid">
          <view class="wallet-item">
            <text class="wallet-icon">⏱</text>
            <text class="wallet-value">{{ userState.wallet.time }}</text>
            <text class="wallet-label">时间</text>
          </view>
          <view class="wallet-item">
            <text class="wallet-icon">⚡</text>
            <text class="wallet-value">{{ userState.wallet.energy }}</text>
            <text class="wallet-label">精力</text>
          </view>
          <view class="wallet-item">
            <text class="wallet-icon">⭐</text>
            <text class="wallet-value">{{ userState.wallet.reputation }}</text>
            <text class="wallet-label">声誉</text>
          </view>
        </view>

        <view class="section-title-row">
          <text class="section-label">身份光谱 ({{ userState.tags.length }} 个标签)</text>
        </view>
        <view v-if="userState.tags.length > 0" class="tag-list">
          <view class="tag-item" v-for="tag in userState.tags" :key="tag.tagId">
            <text class="tag-name">{{ tag.tagId }}</text>
            <view class="tag-bar-bg">
              <view class="tag-bar-fill" :style="{ width: tag.weight + '%' }"></view>
            </view>
            <text class="tag-weight">{{ tag.weight.toFixed(1) }}</text>
          </view>
        </view>
        <text v-else class="empty-text">暂无标签，参与事件后获得</text>

        <view class="section-title-row">
          <text class="section-label">背包 ({{ userState.inventory.length }} 件)</text>
        </view>
        <text v-if="userState.inventory.length === 0" class="empty-text">背包为空</text>
        <view v-else class="inventory-list">
          <view class="inv-item" v-for="inv in userState.inventory" :key="inv.itemId">
            <text class="inv-name">{{ inv.itemId }}</text>
            <text class="inv-qty">×{{ inv.quantity }}</text>
          </view>
        </view>
      </view>

      <view class="btn-row" style="margin-top: 16px;">
        <view class="btn btn-danger" @click="resetUser">🔄 重置用户</view>
      </view>
      <text v-if="resetResult" class="result-text">{{ resetResult }}</text>
    </view>

    <!-- ==================== 卡片6: 模拟选择结算 ==================== -->
    <view class="card">
      <view class="card-header">
        <text class="card-title">🎯 模拟选择结算</text>
      </view>
      <text class="card-desc">预览非对称结算效果：身份乘数 × 潮汐乘数 × 纪元加成</text>

      <view class="sim-form">
        <view class="form-row">
          <text class="form-label">事件</text>
          <picker :range="eventOptions" range-key="label" @change="(e: any) => simEventId = eventOptions[e.detail.value].value">
            <view class="picker-btn">{{ simEventId || '选择事件' }}</view>
          </picker>
        </view>

        <view class="form-row">
          <text class="form-label">奖励</text>
          <view class="form-inputs">
            <input class="form-input" type="number" v-model="simRewards.time" placeholder="时间" />
            <input class="form-input" type="number" v-model="simRewards.energy" placeholder="精力" />
            <input class="form-input" type="number" v-model="simRewards.reputation" placeholder="声誉" />
          </view>
        </view>

        <view class="form-row">
          <text class="form-label">成本</text>
          <view class="form-inputs">
            <input class="form-input" type="number" v-model="simPenalties.time" placeholder="时间" />
            <input class="form-input" type="number" v-model="simPenalties.energy" placeholder="精力" />
            <input class="form-input" type="number" v-model="simPenalties.reputation" placeholder="声誉" />
          </view>
        </view>
      </view>

      <view class="btn btn-primary" @click="simulateChoice">🧪 模拟结算</view>

      <view v-if="simResult" class="sim-result">
        <view class="section-title-row">
          <text class="section-label">结算乘数</text>
        </view>
        <view class="multiplier-grid">
          <view class="mul-item">
            <text class="mul-label">身份</text>
            <text class="mul-value">×{{ simResult.settlement.identityMultiplier }}</text>
          </view>
          <view class="mul-item">
            <text class="mul-label">潮汐(时)</text>
            <text class="mul-value">×{{ simResult.settlement.tideMultiplier.time.toFixed(2) }}</text>
          </view>
          <view class="mul-item">
            <text class="mul-label">潮汐(力)</text>
            <text class="mul-value">×{{ simResult.settlement.tideMultiplier.energy.toFixed(2) }}</text>
          </view>
          <view class="mul-item">
            <text class="mul-label">潮汐(誉)</text>
            <text class="mul-value">×{{ simResult.settlement.tideMultiplier.reputation.toFixed(2) }}</text>
          </view>
          <view class="mul-item">
            <text class="mul-label">纪元</text>
            <text class="mul-value">×{{ simResult.settlement.epochBonus }}</text>
          </view>
        </view>

        <view class="section-title-row">
          <text class="section-label">预计收益</text>
        </view>
        <view class="wallet-grid">
          <view class="wallet-item">
            <text class="wallet-icon">⏱</text>
            <text class="wallet-value gain">+{{ simResult.settlement.estimatedRewards.time }}</text>
          </view>
          <view class="wallet-item">
            <text class="wallet-icon">⚡</text>
            <text class="wallet-value gain">+{{ simResult.settlement.estimatedRewards.energy }}</text>
          </view>
          <view class="wallet-item">
            <text class="wallet-icon">⭐</text>
            <text class="wallet-value gain">+{{ simResult.settlement.estimatedRewards.reputation }}</text>
          </view>
        </view>

        <view class="section-title-row">
          <text class="section-label">预计成本</text>
        </view>
        <view class="wallet-grid">
          <view class="wallet-item">
            <text class="wallet-icon">⏱</text>
            <text class="wallet-value loss">-{{ simResult.settlement.estimatedCosts.time }}</text>
          </view>
          <view class="wallet-item">
            <text class="wallet-icon">⚡</text>
            <text class="wallet-value loss">-{{ simResult.settlement.estimatedCosts.energy }}</text>
          </view>
          <view class="wallet-item">
            <text class="wallet-icon">⭐</text>
            <text class="wallet-value loss">-{{ simResult.settlement.estimatedCosts.reputation }}</text>
          </view>
        </view>

        <view class="section-title-row">
          <text class="section-label">预计钱包</text>
        </view>
        <view class="wallet-grid">
          <view class="wallet-item">
            <text class="wallet-icon">⏱</text>
            <text class="wallet-value">{{ simResult.estimatedWalletAfter.time }}</text>
          </view>
          <view class="wallet-item">
            <text class="wallet-icon">⚡</text>
            <text class="wallet-value">{{ simResult.estimatedWalletAfter.energy }}</text>
          </view>
          <view class="wallet-item">
            <text class="wallet-icon">⭐</text>
            <text class="wallet-value">{{ simResult.estimatedWalletAfter.reputation }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- ==================== 卡片7: 实际选择执行 ==================== -->
    <view class="card">
      <view class="card-header">
        <text class="card-title">🎮 执行真实选择</text>
      </view>
      <text class="card-desc">执行一次真实的选择结算，观察钱包、标签、世界状态的实际变化</text>

      <view class="btn btn-primary" @click="executeRealChoice">
        ⚡ 执行选择（流浪猫事件 → 收养）
      </view>

      <view v-if="realChoiceResult" class="sim-result">
        <view class="info-row">
          <text class="info-label">结算 ID</text>
          <text class="info-value">{{ realChoiceResult.id }}</text>
        </view>
        <view class="section-title-row">
          <text class="section-label">结算后钱包</text>
        </view>
        <view class="wallet-grid">
          <view class="wallet-item">
            <text class="wallet-icon">⏱</text>
            <text class="wallet-value">{{ realChoiceResult.wallet.time }}</text>
          </view>
          <view class="wallet-item">
            <text class="wallet-icon">⚡</text>
            <text class="wallet-value">{{ realChoiceResult.wallet.energy }}</text>
          </view>
          <view class="wallet-item">
            <text class="wallet-icon">⭐</text>
            <text class="wallet-value">{{ realChoiceResult.wallet.reputation }}</text>
          </view>
        </view>
        <view v-if="realChoiceResult.settlement" class="info-row">
          <text class="info-label">身份乘数</text>
          <text class="info-value">×{{ realChoiceResult.settlement.identityMultiplier }}</text>
        </view>
        <view v-if="realChoiceResult.settlement" class="info-row">
          <text class="info-label">纪元加成</text>
          <text class="info-value">×{{ realChoiceResult.settlement.epochBonus }}</text>
        </view>
      </view>
    </view>

    <!-- 底部间距 -->
    <view style="height: 40px;"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

const API_BASE = 'http://localhost:3001'
let token = ''

// ==================== 状态 ====================

const loading = ref(true)
const error = ref('')
const status = ref<any>(null)
const itemPrices = ref<any[]>([])
const userState = ref<any>(null)
const tickResult = ref<any>(null)
const dimResult = ref('')
const resetResult = ref('')
const simResult = ref<any>(null)
const realChoiceResult = ref<any>(null)
const simEventId = ref('')
const simRewards = reactive({ time: 20, energy: 10, reputation: 5 })
const simPenalties = reactive({ time: 10, energy: 5, reputation: 0 })
const eventOptions = ref<Array<{ label: string; value: string }>>([])

const dimensionSliders = reactive([
  { key: 'stability', label: '稳定性', value: 0.5 },
  { key: 'prosperity', label: '繁荣度', value: 0.5 },
  { key: 'freedom', label: '自由度', value: 0.5 },
  { key: 'knowledge', label: '知识水平', value: 0.5 },
  { key: 'solidarity', label: '团结度', value: 0.5 },
])

const dimensionNames: Record<string, string> = {
  stability: '稳定性',
  prosperity: '繁荣度',
  freedom: '自由度',
  knowledge: '知识水平',
  solidarity: '团结度',
}

const tideIcons: Record<string, string> = { time: '⏱', energy: '⚡', reputation: '⭐' }
const tideNames: Record<string, string> = { time: '时间', energy: '精力', reputation: '声誉' }

// ==================== API 调用 ====================

async function api(path: string, options: any = {}) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || '请求失败')
  }
  return res.json()
}

async function ensureAuth() {
  // 尝试登录测试用户
  try {
    const res = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'debuguser@test.com', password: 'debug123' }),
    })
    token = res.token
  } catch {
    // 注册后登录
    try {
      await api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: 'debuguser@test.com', password: 'debug123', nickname: '调试员' }),
      })
      const res = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'debuguser@test.com', password: 'debug123' }),
      })
      token = res.token
    } catch (e: any) {
      throw new Error('认证失败: ' + e.message)
    }
  }
}

// ==================== 数据加载 ====================

async function loadStatus() {
  try {
    const data = await api('/api/debug/status')
    status.value = data

    // 同步滑块
    if (data.world?.dimensions) {
      for (const slider of dimensionSliders) {
        slider.value = data.world.dimensions[slider.key] ?? 0.5
      }
    }
  } catch (e: any) {
    error.value = '加载状态失败: ' + e.message
  }
}

async function loadPrices() {
  try {
    const data = await api('/api/debug/items/prices')
    itemPrices.value = data.items || []
  } catch (e: any) {
    error.value = '加载价格失败: ' + e.message
  }
}

async function loadUserState() {
  try {
    const [walletRes, tagsRes, invRes] = await Promise.all([
      api('/api/wallet'),
      api('/api/user/tags'),
      api('/api/inventory'),
    ])
    userState.value = {
      wallet: walletRes.wallet,
      tags: tagsRes.tags || [],
      inventory: invRes.inventory || [],
    }
  } catch (e: any) {
    error.value = '加载用户状态失败: ' + e.message
  }
}

async function loadEvents() {
  try {
    const data = await api('/api/events')
    eventOptions.value = (data.events || []).map((e: any) => ({
      label: e.title,
      value: e.id,
    }))
    if (eventOptions.value.length > 0) {
      simEventId.value = eventOptions.value[0].value
    }
  } catch {}
}

async function loadAll() {
  loading.value = true
  error.value = ''
  try {
    await ensureAuth()
    await Promise.all([loadStatus(), loadPrices(), loadUserState(), loadEvents()])
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

// ==================== 操作 ====================

async function applyDimensions() {
  dimResult.value = ''
  try {
    const body: Record<string, number> = {}
    for (const s of dimensionSliders) {
      body[s.key] = s.value
    }
    const data = await api('/api/debug/world/set-dimensions', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    dimResult.value = `✅ 纪元: ${data.epochInfo?.name || data.world?.epoch} | 更新成功`
    await loadStatus()
    await loadPrices()
  } catch (e: any) {
    dimResult.value = '❌ ' + e.message
  }
}

async function triggerTick() {
  try {
    const data = await api('/api/debug/world/tick', { method: 'POST' })
    tickResult.value = data.result
    await loadStatus()
  } catch (e: any) {
    error.value = 'Tick 失败: ' + e.message
  }
}

async function triggerMultipleTicks() {
  for (let i = 0; i < 5; i++) {
    await triggerTick()
    await new Promise(r => setTimeout(r, 200))
  }
}

async function resetUser() {
  resetResult.value = ''
  try {
    await api('/api/debug/reset-user', { method: 'POST', body: JSON.stringify({}) })
    resetResult.value = '✅ 用户已重置'
    await loadUserState()
  } catch (e: any) {
    resetResult.value = '❌ ' + e.message
  }
}

async function simulateChoice() {
  simResult.value = null
  try {
    const data = await api('/api/debug/simulate-choice', {
      method: 'POST',
      body: JSON.stringify({
        eventId: simEventId.value,
        stageId: 'stage_1',
        choiceId: 'choice_1',
        choiceText: '测试选择',
        outcome: {
          rewards: {
            time: Number(simRewards.time) || 0,
            energy: Number(simRewards.energy) || 0,
            reputation: Number(simRewards.reputation) || 0,
          },
          penalties: {
            time: Number(simPenalties.time) || 0,
            energy: Number(simPenalties.energy) || 0,
            reputation: Number(simPenalties.reputation) || 0,
          },
        },
      }),
    })
    simResult.value = data.preview
  } catch (e: any) {
    error.value = '模拟失败: ' + e.message
  }
}

async function executeRealChoice() {
  realChoiceResult.value = null
  try {
    const data = await api('/api/choices', {
      method: 'POST',
      body: JSON.stringify({
        eventId: simEventId.value || 'stray_cat',
        stageId: 'stage_1',
        choiceId: 'adopt',
        choiceText: '收养流浪猫',
        outcome: {
          resultText: '你决定收养这只橘猫',
          rewards: { time: 10, energy: 5, reputation: 8, tags: { animal_lover: 10, kind: 5 } },
          penalties: { time: 5, energy: 3 },
        },
      }),
    })
    realChoiceResult.value = data
    await loadUserState()
    await loadStatus()
  } catch (e: any) {
    error.value = '执行选择失败: ' + e.message
  }
}

// ==================== 工具函数 ====================

function getDimColor(val: number): string {
  if (val > 0.7) return '#00ff88'
  if (val > 0.4) return '#00f5ff'
  if (val > 0.2) return '#ffaa00'
  return '#ff4444'
}

// ==================== 生命周期 ====================

onMounted(() => {
  loadAll()
})
</script>

<style scoped>
.debug-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #0a0e17 0%, #111827 100%);
  padding: 16px;
  color: #e0e0e0;
}

.debug-header {
  text-align: center;
  margin-bottom: 20px;
  padding: 16px;
}

.debug-title {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #00f5ff;
  margin-bottom: 4px;
}

.debug-subtitle {
  display: block;
  font-size: 13px;
  color: #888;
}

/* 卡片 */
.card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 245, 255, 0.15);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.card-desc {
  display: block;
  font-size: 12px;
  color: #888;
  margin-bottom: 12px;
}

/* 信息行 */
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.info-label {
  font-size: 13px;
  color: #aaa;
}

.info-value {
  font-size: 13px;
  color: #fff;
  font-weight: 500;
}

.highlight {
  color: #ffaa00 !important;
  font-weight: 700;
}

/* 纪元 */
.epoch-row {
  margin-bottom: 4px;
}

.epoch-badge {
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(0, 245, 255, 0.15);
}

.epoch-name {
  font-size: 14px;
  font-weight: 600;
  color: #00f5ff;
}

.epoch-genesis .epoch-name { color: #00f5ff; }
.epoch-golden_age { background: rgba(255, 215, 0, 0.15); }
.epoch-golden_age .epoch-name { color: #ffd700; }
.epoch-turbulence { background: rgba(255, 68, 68, 0.15); }
.epoch-turbulence .epoch-name { color: #ff4444; }
.epoch-enlightenment { background: rgba(138, 43, 226, 0.15); }
.epoch-enlightenment .epoch-name { color: #8a2be2; }
.epoch-dark_age { background: rgba(100, 100, 100, 0.15); }
.epoch-dark_age .epoch-name { color: #888; }

.epoch-desc {
  display: block;
  font-size: 12px;
  color: #888;
  font-style: italic;
  margin-bottom: 12px;
}

/* 维度条 */
.section-title-row {
  margin: 12px 0 8px;
}

.section-label {
  font-size: 13px;
  font-weight: 600;
  color: #aaa;
}

.dimension-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dimension-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dim-label {
  width: 60px;
  font-size: 12px;
  color: #aaa;
}

.dim-bar-bg {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.dim-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.dim-value {
  width: 50px;
  text-align: right;
  font-size: 12px;
  color: #fff;
  font-family: monospace;
}

/* 潮汐 */
.tide-grid {
  display: flex;
  gap: 12px;
}

.tide-item {
  flex: 1;
  text-align: center;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.tide-icon {
  display: block;
  font-size: 20px;
}

.tide-label {
  display: block;
  font-size: 11px;
  color: #888;
  margin: 2px 0;
}

.tide-value {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  font-family: monospace;
}

.tide-up { color: #00ff88; }
.tide-down { color: #ff4444; }

/* 按钮 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #00f5ff, #0088ff);
  color: #000;
  width: 100%;
  margin-top: 12px;
}

.btn-secondary {
  background: rgba(0, 245, 255, 0.15);
  color: #00f5ff;
  border: 1px solid rgba(0, 245, 255, 0.3);
}

.btn-danger {
  background: rgba(255, 68, 68, 0.15);
  color: #ff4444;
  border: 1px solid rgba(255, 68, 68, 0.3);
}

.btn-small {
  padding: 4px 12px;
  font-size: 12px;
  background: rgba(0, 245, 255, 0.1);
  color: #00f5ff;
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 6px;
}

.btn-row {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.btn-row .btn {
  flex: 1;
}

.result-text {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: #00ff88;
}

/* 价格列表 */
.price-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.price-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-icon {
  font-size: 24px;
}

.price-name {
  display: block;
  font-size: 13px;
  color: #fff;
  font-weight: 500;
}

.price-rarity {
  display: block;
  font-size: 11px;
  color: #888;
}

.rarity-common { color: #aaa; }
.rarity-uncommon { color: #00ff88; }
.rarity-rare { color: #00aaff; }
.rarity-epic { color: #aa44ff; }
.rarity-legendary { color: #ffd700; }

.price-right {
  text-align: right;
}

.price-multipliers {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
  justify-content: flex-end;
}

.mul-tag {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: #aaa;
}

.mul-discount { background: rgba(0, 255, 136, 0.15); color: #00ff88; }
.mul-premium { background: rgba(255, 68, 68, 0.15); color: #ff4444; }

.price-final {
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-end;
}

.price-cost {
  font-size: 12px;
  color: #fff;
  font-family: monospace;
}

.price-scarcity {
  display: block;
  font-size: 10px;
  color: #888;
  margin-top: 2px;
}

/* 钱包 */
.wallet-grid {
  display: flex;
  gap: 12px;
}

.wallet-item {
  flex: 1;
  text-align: center;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.wallet-icon {
  display: block;
  font-size: 20px;
}

.wallet-value {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  font-family: monospace;
}

.wallet-value.gain { color: #00ff88; }
.wallet-value.loss { color: #ff4444; }

.wallet-label {
  display: block;
  font-size: 11px;
  color: #888;
}

/* 标签 */
.tag-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag-name {
  width: 80px;
  font-size: 12px;
  color: #aaa;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tag-bar-bg {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.tag-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #00f5ff, #0088ff);
  border-radius: 3px;
}

.tag-weight {
  width: 40px;
  text-align: right;
  font-size: 12px;
  color: #fff;
  font-family: monospace;
}

/* 背包 */
.inventory-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.inv-item {
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  display: flex;
  gap: 4px;
}

.inv-name {
  font-size: 12px;
  color: #aaa;
}

.inv-qty {
  font-size: 12px;
  color: #00f5ff;
  font-weight: 600;
}

.empty-text {
  display: block;
  font-size: 12px;
  color: #666;
  font-style: italic;
}

/* 滑块 */
.slider-group {
  margin-bottom: 12px;
}

.slider-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.slider-label {
  font-size: 13px;
  color: #aaa;
}

.slider-value {
  font-size: 13px;
  color: #00f5ff;
  font-family: monospace;
}

/* 模拟表单 */
.sim-form {
  margin-bottom: 12px;
}

.form-row {
  margin-bottom: 10px;
}

.form-label {
  display: block;
  font-size: 12px;
  color: #aaa;
  margin-bottom: 4px;
}

.form-inputs {
  display: flex;
  gap: 8px;
}

.form-input {
  flex: 1;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #fff;
  font-size: 13px;
  text-align: center;
}

.picker-btn {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #fff;
  font-size: 13px;
}

/* 模拟结果 */
.sim-result {
  margin-top: 12px;
  padding: 12px;
  background: rgba(0, 245, 255, 0.05);
  border: 1px solid rgba(0, 245, 255, 0.1);
  border-radius: 8px;
}

.multiplier-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mul-item {
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  text-align: center;
}

.mul-label {
  display: block;
  font-size: 10px;
  color: #888;
}

.mul-value {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: #00f5ff;
  font-family: monospace;
}

/* 加载和错误 */
.loading-card, .error-card {
  padding: 20px;
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-bottom: 16px;
}

.loading-text {
  color: #00f5ff;
  font-size: 14px;
}

.error-text {
  color: #ff4444;
  font-size: 14px;
  display: block;
  margin-bottom: 8px;
}

.tick-result {
  margin-top: 12px;
  padding: 12px;
  background: rgba(0, 245, 255, 0.05);
  border-radius: 8px;
}
</style>
