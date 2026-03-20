<template>
  <view class="market-page">
    <!-- 顶部标题 -->
    <view class="market-header">
      <text class="market-title">物品市场</text>
      <text class="market-subtitle">Bonding Curve 动态定价</text>
    </view>

    <!-- 市场概览卡片 -->
    <view class="card overview-card">
      <view class="overview-row">
        <view class="overview-stat">
          <text class="stat-num">{{ store.items.length }}</text>
          <text class="stat-label">物品总数</text>
        </view>
        <view class="overview-stat">
          <text class="stat-num" :class="trendColor('rising')">{{ store.trendStats.rising }}</text>
          <text class="stat-label">价格上涨</text>
        </view>
        <view class="overview-stat">
          <text class="stat-num" :class="trendColor('stable')">{{ store.trendStats.stable }}</text>
          <text class="stat-label">价格稳定</text>
        </view>
        <view class="overview-stat">
          <text class="stat-num" :class="trendColor('falling')">{{ store.trendStats.falling }}</text>
          <text class="stat-label">价格下降</text>
        </view>
      </view>
      <view class="overview-row secondary">
        <view class="overview-stat">
          <text class="stat-num">x{{ store.avgBondingMultiplier }}</text>
          <text class="stat-label">平均 Bonding</text>
        </view>
        <view class="overview-stat">
          <text class="stat-num">x{{ store.avgWorldSensitivity }}</text>
          <text class="stat-label">世界敏感性</text>
        </view>
      </view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <scroll-view scroll-x class="filter-scroll">
        <view class="filter-chips">
          <view
            class="chip"
            :class="{ active: store.selectedRarity === 'all' }"
            @click="store.selectedRarity = 'all'"
          >
            <text class="chip-text">全部</text>
          </view>
          <view
            v-for="r in rarityList"
            :key="r.key"
            class="chip"
            :class="{ active: store.selectedRarity === r.key }"
            @click="store.selectedRarity = r.key"
          >
            <text class="chip-dot" :style="{ background: r.color }" />
            <text class="chip-text">{{ r.label }}</text>
            <text class="chip-count" v-if="store.rarityStats[r.key]">{{ store.rarityStats[r.key] }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 趋势筛选 + 排序 -->
    <view class="sort-bar">
      <view class="trend-chips">
        <view
          class="mini-chip"
          :class="{ active: store.selectedTrend === 'all' }"
          @click="store.selectedTrend = 'all'"
        >
          <text class="mini-chip-text">全部趋势</text>
        </view>
        <view
          class="mini-chip trend-rising"
          :class="{ active: store.selectedTrend === 'rising' }"
          @click="store.selectedTrend = 'rising'"
        >
          <text class="mini-chip-text">上涨</text>
        </view>
        <view
          class="mini-chip trend-stable"
          :class="{ active: store.selectedTrend === 'stable' }"
          @click="store.selectedTrend = 'stable'"
        >
          <text class="mini-chip-text">稳定</text>
        </view>
        <view
          class="mini-chip trend-falling"
          :class="{ active: store.selectedTrend === 'falling' }"
          @click="store.selectedTrend = 'falling'"
        >
          <text class="mini-chip-text">下降</text>
        </view>
      </view>
      <view class="sort-select" @click="cycleSortBy">
        <text class="sort-icon">{{ sortIcon }}</text>
        <text class="sort-text">{{ sortLabel }}</text>
      </view>
    </view>

    <!-- 物品列表 -->
    <view class="items-grid">
      <view
        v-for="item in store.filteredItems"
        :key="item.id"
        class="market-item-card"
        :class="'rarity-' + item.rarity"
        @click="selectItem(item)"
      >
        <!-- 稀有度指示条 -->
        <view class="rarity-indicator" :style="{ background: rarityColor(item.rarity) }" />

        <!-- 物品头部 -->
        <view class="item-header">
          <text class="item-icon">{{ item.icon }}</text>
          <view class="item-info">
            <text class="item-name">{{ item.name }}</text>
            <text class="item-rarity-badge" :style="{ color: rarityColor(item.rarity) }">{{ rarityLabel(item.rarity) }}</text>
          </view>
          <view class="trend-badge" :class="'trend-' + item.dynamicPrice.trend">
            <text class="trend-arrow">{{ trendArrow(item.dynamicPrice.trend) }}</text>
          </view>
        </view>

        <!-- 价格区域 -->
        <view class="price-section">
          <view class="price-row">
            <text class="price-label">时间</text>
            <view class="price-bar-bg">
              <view
                class="price-bar"
                :style="{
                  width: priceBarWidth(item.dynamicPrice.finalCost.time, 'time') + '%',
                  background: priceBarColor(item.dynamicPrice.bondingMultiplier)
                }"
              />
            </view>
            <text class="price-value">{{ item.dynamicPrice.finalCost.time }}</text>
          </view>
          <view class="price-row" v-if="item.dynamicPrice.finalCost.energy > 0">
            <text class="price-label">精力</text>
            <view class="price-bar-bg">
              <view
                class="price-bar"
                :style="{
                  width: priceBarWidth(item.dynamicPrice.finalCost.energy, 'energy') + '%',
                  background: priceBarColor(item.dynamicPrice.bondingMultiplier)
                }"
              />
            </view>
            <text class="price-value">{{ item.dynamicPrice.finalCost.energy }}</text>
          </view>
        </view>

        <!-- Bonding Curve 指标 -->
        <view class="bonding-section">
          <view class="bonding-item">
            <text class="bonding-label">Bonding</text>
            <text class="bonding-value" :class="bondingClass(item.dynamicPrice.bondingMultiplier)">
              x{{ item.dynamicPrice.bondingMultiplier.toFixed(2) }}
            </text>
          </view>
          <view class="bonding-item">
            <text class="bonding-label">稀缺度</text>
            <view class="scarcity-bar-bg">
              <view
                class="scarcity-bar"
                :style="{ width: (item.dynamicPrice.scarcity * 100) + '%' }"
              />
            </view>
          </view>
          <view class="bonding-item">
            <text class="bonding-label">铸造</text>
            <text class="bonding-value">{{ item.dynamicPrice.mintedCount }}/{{ item.dynamicPrice.maxMint }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="!store.isLoading && store.filteredItems.length === 0">
      <text class="empty-icon">🏪</text>
      <text class="empty-text">暂无符合条件的物品</text>
    </view>

    <!-- 加载中 -->
    <view class="loading-state" v-if="store.isLoading">
      <text class="loading-text">加载市场数据中...</text>
    </view>

    <!-- 物品详情底部弹出面板 -->
    <SwipeDownSheet v-model="showItemSheet" max-height="80vh" @close="closeItemSheet">
      <template #header>
        <view class="sheet-item-header" v-if="selectedItem">
          <text class="modal-icon">{{ selectedItem.icon }}</text>
          <view class="modal-title-area">
            <text class="modal-title">{{ selectedItem.name }}</text>
            <text class="modal-rarity" :style="{ color: rarityColor(selectedItem.rarity) }">
              {{ rarityLabel(selectedItem.rarity) }}
            </text>
          </view>
        </view>
      </template>
      <view class="sheet-item-body" v-if="selectedItem">

        <text class="modal-desc">{{ selectedItem.description }}</text>

        <text class="modal-story" v-if="selectedItem.story">{{ selectedItem.story }}</text>

        <!-- 动态定价详情 -->
        <view class="modal-section">
          <text class="section-title">动态定价详情</text>
          <view class="detail-grid">
            <view class="detail-item">
              <text class="detail-label">基础价格 (时间)</text>
              <text class="detail-value">{{ selectedItem.dynamicPrice.baseCost.time || 0 }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">基础价格 (精力)</text>
              <text class="detail-value">{{ selectedItem.dynamicPrice.baseCost.energy || 0 }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">Bonding 乘数</text>
              <text class="detail-value" :class="bondingClass(selectedItem.dynamicPrice.bondingMultiplier)">
                x{{ selectedItem.dynamicPrice.bondingMultiplier.toFixed(3) }}
              </text>
            </view>
            <view class="detail-item">
              <text class="detail-label">世界敏感性</text>
              <text class="detail-value">x{{ selectedItem.dynamicPrice.worldSensitivityMultiplier.toFixed(3) }}</text>
            </view>
            <view class="detail-item highlight">
              <text class="detail-label">最终价格 (时间)</text>
              <text class="detail-value">{{ selectedItem.dynamicPrice.finalCost.time }}</text>
            </view>
            <view class="detail-item highlight">
              <text class="detail-label">最终价格 (精力)</text>
              <text class="detail-value">{{ selectedItem.dynamicPrice.finalCost.energy }}</text>
            </view>
          </view>
        </view>

        <!-- 稀缺度可视化 -->
        <view class="modal-section">
          <text class="section-title">稀缺度</text>
          <view class="scarcity-visual">
            <view class="scarcity-track">
              <view
                class="scarcity-fill"
                :style="{ width: (selectedItem.dynamicPrice.scarcity * 100) + '%' }"
              />
              <view class="scarcity-dots">
                <view
                  v-for="i in 10"
                  :key="i"
                  class="scarcity-dot"
                  :class="{ filled: (i / 10) <= selectedItem.dynamicPrice.scarcity }"
                />
              </view>
            </view>
            <text class="scarcity-text">
              {{ (selectedItem.dynamicPrice.scarcity * 100).toFixed(0) }}%
              ({{ selectedItem.dynamicPrice.mintedCount }}/{{ selectedItem.dynamicPrice.maxMint }})
            </text>
          </view>
        </view>

        <!-- 购买按钮 -->
        <view class="modal-actions">
          <view class="buy-btn" @click="handleBuy">
            <text class="buy-text">购买</text>
            <text class="buy-price">
              {{ selectedItem.dynamicPrice.finalCost.time }} 时间
              <text v-if="selectedItem.dynamicPrice.finalCost.energy > 0">
                + {{ selectedItem.dynamicPrice.finalCost.energy }} 精力
              </text>
            </text>
          </view>
        </view>
      </view>
    </SwipeDownSheet>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMarketStore, type MarketItem } from '@/stores/market'
import SwipeDownSheet from '@/components/SwipeDownSheet.vue'

const showItemSheet = ref(false)

const store = useMarketStore()
const selectedItem = ref<MarketItem | null>(null)

function closeItemSheet() {
  showItemSheet.value = false
  setTimeout(() => { selectedItem.value = null }, 300)
}

// ==================== 稀有度配置 ====================

const rarityList = [
  { key: 'common', label: '普通', color: '#9E9E9E' },
  { key: 'uncommon', label: '优秀', color: '#4CAF50' },
  { key: 'rare', label: '稀有', color: '#2196F3' },
  { key: 'epic', label: '史诗', color: '#9C27B0' },
  { key: 'legendary', label: '传说', color: '#FF9800' },
]

function rarityColor(rarity: string): string {
  return rarityList.find(r => r.key === rarity)?.color || '#9E9E9E'
}

function rarityLabel(rarity: string): string {
  return rarityList.find(r => r.key === rarity)?.label || rarity
}

// ==================== 趋势 ====================

function trendArrow(trend: string): string {
  if (trend === 'rising') return '↑'
  if (trend === 'falling') return '↓'
  return '→'
}

function trendColor(trend: string): string {
  if (trend === 'rising') return 'trend-up'
  if (trend === 'falling') return 'trend-down'
  return 'trend-neutral'
}

// ==================== 价格条 ====================

function priceBarWidth(value: number, type: string): number {
  const maxTime = Math.max(...store.items.map(i => i.dynamicPrice.finalCost.time), 1)
  const maxEnergy = Math.max(...store.items.map(i => i.dynamicPrice.finalCost.energy), 1)
  const max = type === 'time' ? maxTime : maxEnergy
  return Math.min((value / max) * 100, 100)
}

function priceBarColor(bondingMul: number): string {
  if (bondingMul > 1.3) return '#EF5350'
  if (bondingMul > 1.1) return '#FFD54F'
  return '#4FC3F7'
}

function bondingClass(mul: number): string {
  if (mul > 1.3) return 'bonding-high'
  if (mul > 1.1) return 'bonding-medium'
  return 'bonding-low'
}

// ==================== 排序 ====================

const sortOptions = [
  { key: 'price_asc', label: '价格低→高', icon: '↑' },
  { key: 'price_desc', label: '价格高→低', icon: '↓' },
  { key: 'scarcity', label: '稀缺度', icon: '◆' },
  { key: 'name', label: '名称', icon: 'A' },
] as const

const sortLabel = computed(() => sortOptions.find(s => s.key === store.sortBy)?.label || '')
const sortIcon = computed(() => sortOptions.find(s => s.key === store.sortBy)?.icon || '')

function cycleSortBy() {
  const idx = sortOptions.findIndex(s => s.key === store.sortBy)
  const next = (idx + 1) % sortOptions.length
  store.sortBy = sortOptions[next].key as any
}

// ==================== 交互 ====================

function selectItem(item: MarketItem) {
  selectedItem.value = item
  showItemSheet.value = true
}

async function handleBuy() {
  if (!selectedItem.value) return
  const result = await store.buyItem(selectedItem.value.id)
  if (result) {
    uni.showToast({ title: '购买成功！', icon: 'success' })
    showItemSheet.value = false
    setTimeout(() => { selectedItem.value = null }, 300)
  } else {
    uni.showToast({ title: '购买失败', icon: 'none' })
  }
}

// ==================== 生命周期 ====================

onMounted(() => {
  store.loadMarket()
})
</script>

<style scoped>
.market-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 100%);
  padding: 24rpx;
  padding-bottom: 120rpx;
}

.market-header {
  text-align: center;
  padding: 32rpx 0 16rpx;
}

.market-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #e0e0e0;
  display: block;
}

.market-subtitle {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-top: 8rpx;
}

/* ==================== 概览卡片 ==================== */

.card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.overview-row {
  display: flex;
  justify-content: space-around;
}

.overview-row.secondary {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.overview-stat {
  text-align: center;
}

.stat-num {
  font-size: 36rpx;
  font-weight: 700;
  color: #e0e0e0;
  display: block;
}

.stat-label {
  font-size: 20rpx;
  color: #888;
  display: block;
  margin-top: 4rpx;
}

.trend-up { color: #EF5350 !important; }
.trend-neutral { color: #FFD54F !important; }
.trend-down { color: #4CAF50 !important; }

/* ==================== 筛选栏 ==================== */

.filter-bar {
  margin-bottom: 16rpx;
}

.filter-scroll {
  white-space: nowrap;
}

.filter-chips {
  display: inline-flex;
  gap: 12rpx;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 20rpx;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 32rpx;
  transition: all 0.2s;
}

.chip.active {
  background: rgba(0, 229, 255, 0.15);
  border-color: #00e5ff;
}

.chip-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
}

.chip-text {
  font-size: 22rpx;
  color: #ccc;
}

.chip.active .chip-text {
  color: #00e5ff;
}

.chip-count {
  font-size: 18rpx;
  color: #888;
  background: rgba(255, 255, 255, 0.08);
  padding: 2rpx 10rpx;
  border-radius: 16rpx;
}

/* ==================== 排序栏 ==================== */

.sort-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.trend-chips {
  display: flex;
  gap: 8rpx;
}

.mini-chip {
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.mini-chip.active {
  background: rgba(0, 229, 255, 0.12);
  border-color: rgba(0, 229, 255, 0.3);
}

.mini-chip-text {
  font-size: 20rpx;
  color: #aaa;
}

.mini-chip.active .mini-chip-text {
  color: #00e5ff;
}

.mini-chip.trend-rising.active { background: rgba(239, 83, 80, 0.15); border-color: rgba(239, 83, 80, 0.3); }
.mini-chip.trend-rising.active .mini-chip-text { color: #EF5350; }
.mini-chip.trend-falling.active { background: rgba(76, 175, 80, 0.15); border-color: rgba(76, 175, 80, 0.3); }
.mini-chip.trend-falling.active .mini-chip-text { color: #4CAF50; }

.sort-select {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 6rpx 16rpx;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 20rpx;
}

.sort-icon {
  font-size: 20rpx;
  color: #00e5ff;
}

.sort-text {
  font-size: 20rpx;
  color: #aaa;
}

/* ==================== 物品卡片 ==================== */

.items-grid {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.market-item-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16rpx;
  padding: 20rpx;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.market-item-card:active {
  transform: scale(0.98);
}

.rarity-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 4rpx;
  height: 100%;
  border-radius: 4rpx 0 0 4rpx;
}

.item-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.item-icon {
  font-size: 48rpx;
  margin-right: 16rpx;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #e0e0e0;
  display: block;
}

.item-rarity-badge {
  font-size: 20rpx;
  font-weight: 500;
  display: block;
  margin-top: 2rpx;
}

.trend-badge {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.trend-badge.trend-rising { background: rgba(239, 83, 80, 0.15); }
.trend-badge.trend-stable { background: rgba(255, 213, 79, 0.15); }
.trend-badge.trend-falling { background: rgba(76, 175, 80, 0.15); }

.trend-arrow {
  font-size: 28rpx;
  font-weight: 700;
}

.trend-rising .trend-arrow { color: #EF5350; }
.trend-stable .trend-arrow { color: #FFD54F; }
.trend-falling .trend-arrow { color: #4CAF50; }

/* ==================== 价格区域 ==================== */

.price-section {
  margin-bottom: 12rpx;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.price-label {
  font-size: 20rpx;
  color: #888;
  width: 60rpx;
}

.price-bar-bg {
  flex: 1;
  height: 12rpx;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 6rpx;
  overflow: hidden;
}

.price-bar {
  height: 100%;
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.price-value {
  font-size: 24rpx;
  font-weight: 600;
  color: #e0e0e0;
  width: 80rpx;
  text-align: right;
}

/* ==================== Bonding 指标 ==================== */

.bonding-section {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding-top: 12rpx;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.bonding-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.bonding-label {
  font-size: 18rpx;
  color: #666;
}

.bonding-value {
  font-size: 20rpx;
  font-weight: 600;
  color: #ccc;
}

.bonding-low { color: #4FC3F7 !important; }
.bonding-medium { color: #FFD54F !important; }
.bonding-high { color: #EF5350 !important; }

.scarcity-bar-bg {
  width: 80rpx;
  height: 8rpx;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4rpx;
  overflow: hidden;
}

.scarcity-bar {
  height: 100%;
  background: linear-gradient(90deg, #4FC3F7, #CE93D8);
  border-radius: 4rpx;
}

/* ==================== 空状态 / 加载 ==================== */

.empty-state, .loading-state {
  text-align: center;
  padding: 80rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 16rpx;
}

.empty-text, .loading-text {
  font-size: 26rpx;
  color: #666;
}

/* ==================== 底部弹出面板 ====================  */

.sheet-item-header {
  display: flex;
  align-items: center;
  flex: 1;
}

.sheet-item-body {
  padding: 24rpx 32rpx 48rpx;
}

/* ==================== 弹窗样式复用 ==================== */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  max-height: 85vh;
  background: #1a1a2e;
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.modal-icon {
  font-size: 64rpx;
  margin-right: 20rpx;
}

.modal-title-area {
  flex: 1;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #e0e0e0;
  display: block;
}

.modal-rarity {
  font-size: 24rpx;
  font-weight: 500;
  display: block;
  margin-top: 4rpx;
}

.modal-close {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-icon {
  font-size: 24rpx;
  color: #888;
}

.modal-desc {
  font-size: 26rpx;
  color: #aaa;
  line-height: 1.6;
  display: block;
  margin-bottom: 16rpx;
}

.modal-story {
  font-size: 22rpx;
  color: #666;
  font-style: italic;
  line-height: 1.5;
  display: block;
  margin-bottom: 24rpx;
  padding: 16rpx;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12rpx;
  border-left: 4rpx solid rgba(255, 255, 255, 0.1);
}

.modal-section {
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #ccc;
  display: block;
  margin-bottom: 16rpx;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12rpx;
}

.detail-item {
  background: rgba(255, 255, 255, 0.04);
  padding: 16rpx;
  border-radius: 12rpx;
}

.detail-item.highlight {
  background: rgba(0, 229, 255, 0.08);
  border: 1px solid rgba(0, 229, 255, 0.15);
}

.detail-label {
  font-size: 20rpx;
  color: #888;
  display: block;
}

.detail-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #e0e0e0;
  display: block;
  margin-top: 4rpx;
}

/* ==================== 稀缺度可视化 ==================== */

.scarcity-visual {
  padding: 16rpx;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12rpx;
}

.scarcity-track {
  position: relative;
  height: 24rpx;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12rpx;
  overflow: hidden;
  margin-bottom: 12rpx;
}

.scarcity-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #4FC3F7, #CE93D8, #EF5350);
  border-radius: 12rpx;
  transition: width 0.5s ease;
}

.scarcity-dots {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 8rpx;
}

.scarcity-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
}

.scarcity-dot.filled {
  background: rgba(255, 255, 255, 0.6);
}

.scarcity-text {
  font-size: 22rpx;
  color: #aaa;
  text-align: center;
  display: block;
}

/* ==================== 购买按钮 ==================== */

.modal-actions {
  margin-top: 24rpx;
}

.buy-btn {
  width: 100%;
  padding: 24rpx;
  background: linear-gradient(135deg, #00e5ff 0%, #00b0ff 100%);
  border-radius: 16rpx;
  text-align: center;
}

.buy-btn:active {
  opacity: 0.8;
}

.buy-text {
  font-size: 30rpx;
  font-weight: 700;
  color: #0a0a1a;
  display: block;
}

.buy-price {
  font-size: 22rpx;
  color: rgba(10, 10, 26, 0.7);
  display: block;
  margin-top: 4rpx;
}
</style>
