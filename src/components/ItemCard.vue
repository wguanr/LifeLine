<template>
  <BaseCard :rarity="item.rarity" extra-class="item-card">
    <view class="card-content">
      <!-- 顶部：图标 + 名称 + 稀有度 -->
      <view class="item-header">
        <view class="item-icon-area" :class="item.rarity">
          <text class="item-icon">{{ item.icon }}</text>
          <!-- 已拥有角标 -->
          <view class="owned-badge" v-if="ownedQuantity > 0">
            <text class="owned-num">{{ ownedQuantity }}</text>
          </view>
        </view>
        <view class="item-meta">
          <view class="name-row">
            <text class="item-name">{{ item.name }}</text>
            <view class="rarity-badge" :class="item.rarity">
              <text class="rarity-text">{{ getRarityLabel(item.rarity) }}</text>
            </view>
          </view>
          <text class="item-desc">{{ item.description }}</text>
        </view>
      </view>

      <!-- 特性标签（3-5个） -->
      <view class="feature-tags" v-if="item.featureTags && item.featureTags.length">
        <view
          class="feature-tag"
          v-for="(tag, idx) in item.featureTags"
          :key="idx"
          :class="'tag-color-' + (idx % 5)"
        >
          <text class="feature-tag-text">{{ tag }}</text>
        </view>
      </view>

      <!-- 故事预览 -->
      <view class="story-preview" v-if="item.story">
        <text class="story-quote">"</text>
        <text class="story-text">{{ storyPreview }}</text>
      </view>

      <!-- 效果区域 -->
      <view class="effects-area" v-if="item.effects && item.effects.length">
        <view class="effect-item" v-for="(effect, idx) in item.effects" :key="idx">
          <text class="effect-icon">{{ getEffectIcon(effect.type) }}</text>
          <text class="effect-desc">{{ effect.description }}</text>
        </view>
      </view>

      <!-- 已购入提示面板 -->
      <view class="owned-info-panel" v-if="ownedQuantity > 0">
        <view class="owned-info-header">
          <text class="owned-info-icon">✅</text>
          <text class="owned-info-title">已拥有此物品</text>
        </view>
        <view class="owned-info-body">
          <view class="owned-stat">
            <text class="owned-stat-label">持有数量</text>
            <text class="owned-stat-value">{{ ownedQuantity }} 件</text>
          </view>
          <view class="owned-stat" v-if="acquiredInfo">
            <text class="owned-stat-label">获取时间</text>
            <text class="owned-stat-value">{{ acquiredInfo }}</text>
          </view>
        </view>
      </view>

      <!-- 底部信息区（操作按钮已移至外部操作栏） -->
      <view class="card-footer">
        <view class="price-row">
          <view class="price-info">
            <view class="price-values">
              <text class="price-tag" v-if="item.mintCost.time">⏰ {{ item.mintCost.time }}</text>
              <text class="price-tag" v-if="item.mintCost.energy">⚡ {{ item.mintCost.energy }}</text>
            </view>
            <text class="stock-info" v-if="item.maxMint">
              {{ item.mintedCount || 0 }}/{{ item.maxMint }} 已售
            </text>
          </view>
        </view>
        <!-- 已拥有状态提示 -->
        <view class="owned-footer-hint" v-if="ownedQuantity > 0">
          <text class="owned-hint-icon">🎒</text>
          <text class="owned-hint-text">物品已在你的背包中</text>
        </view>
      </view>
    </view>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseCard from '@/components/BaseCard.vue'
import type { Item } from '@/types'
import { useUserStore } from '@/stores/user'
import { getRarityLabel, getEffectIcon, formatRelativeTime } from '@/utils/formatters'

const props = defineProps<{ item: Item }>()


const userStore = useUserStore()

const ownedQuantity = computed(() => {
  const inv = userStore.inventory.find(i => i.itemId === props.item.id)
  return inv?.quantity ?? 0
})

const acquiredInfo = computed(() => {
  const inv = userStore.inventory.find(i => i.itemId === props.item.id)
  if (!inv?.acquiredAt) return ''
  return formatRelativeTime(inv.acquiredAt)
})

const canBuy = computed(() => {
  // 一张卡片只能购买一次：已拥有则不可再买
  if (ownedQuantity.value > 0) return false
  // 检查资源是否足够
  if (!userStore.canAfford(props.item.mintCost)) return false
  // 检查铸造上限
  if (props.item.maxMint && (props.item.mintedCount || 0) >= props.item.maxMint) return false
  return true
})

const buyDisabledReason = computed(() => {
  // 一张卡片只能购买一次
  if (ownedQuantity.value > 0) return '已拥有'
  if (!userStore.canAfford(props.item.mintCost)) return '余额不足'
  if (props.item.maxMint && (props.item.mintedCount || 0) >= props.item.maxMint) return '已售罄'
  return ''
})

const storyPreview = computed(() => {
  if (!props.item.story) return ''
  return props.item.story.length > 60 ? props.item.story.slice(0, 60) + '...' : props.item.story
})

const justBought = ref(false)

const onBuy = () => {
  if (!canBuy.value) {
    uni.showToast({ title: '余额不足', icon: 'none' })
    return
  }
  const success = userStore.buyItem({
    id: props.item.id,
    name: props.item.name,
    mintCost: props.item.mintCost,
    tags: props.item.tags
  })
  if (success) {
    justBought.value = true
    uni.showToast({ title: '买入成功！已收入背包', icon: 'none' })
    setTimeout(() => { justBought.value = false }, 1500)
  }
}

// 通用工具函数已迁移到 @/utils/formatters.ts

defineExpose({
  // 暴露给外部操作栏使用
  onBuy,
  canBuy,
  buyDisabledReason,
  justBought,
  ownedQuantity
})
</script>

<style lang="scss" scoped>

// item-card 特有样式（基础布局 + 稀有度光效已由 BaseCard 提供）
.item-card {
  // BaseCard 已提供基础布局和稀有度光效
}

// card-content 在 BaseCard 的 base-card-content 内部
.card-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 4rpx 0 0; // 微调内距（外层 BaseCard 已提供 28rpx padding）
}

// ==================== 头部 ====================
.item-header {
  display: flex;
  gap: 20rpx;
  align-items: flex-start;
  margin-bottom: 20rpx;
  flex-shrink: 0;
}

.item-icon-area {
  position: relative;
  width: 120rpx;
  height: 120rpx;
  border-radius: $radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.common { @include glass-effect(0.08); }
  &.uncommon { background: rgba($neon-cyan, 0.1); border: 1rpx solid rgba($neon-cyan, 0.2); }
  &.rare { background: rgba($color-info, 0.1); border: 1rpx solid rgba($color-info, 0.2); }
  &.epic { background: rgba($neon-magenta, 0.1); border: 1rpx solid rgba($neon-magenta, 0.2); }
  &.legendary { 
    background: rgba($neon-amber, 0.1); border: 1rpx solid rgba($neon-amber, 0.2);
    animation: icon-glow 2s ease-in-out infinite;
  }
}

@keyframes icon-glow {
  0%, 100% { box-shadow: 0 0 8rpx rgba($neon-amber, 0.3); }
  50% { box-shadow: 0 0 20rpx rgba($neon-amber, 0.5); }
}

.item-icon { font-size: 56rpx; }

.owned-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  min-width: 36rpx;
  height: 36rpx;
  padding: 0 8rpx;
  background: $neon-cyan;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3rpx solid $surface-elevated;
}

.owned-num {
  font-size: 20rpx;
  color: $white;
  font-weight: 700;
}

.item-meta {
  flex: 1;
  min-width: 0;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
  flex-wrap: wrap;
}

.item-name {
  font-size: 36rpx;
  font-weight: 700;
  color: $text-primary;
}

.rarity-badge {
  padding: 4rpx 14rpx;
  border-radius: $radius-full;
  &.common { @include glass-effect(0.06); .rarity-text { color: $text-secondary; } }
  &.uncommon { background: rgba($neon-cyan, 0.1); .rarity-text { color: $neon-cyan; } }
  &.rare { background: rgba($color-info, 0.1); .rarity-text { color: $color-info; } }
  &.epic { background: rgba($neon-magenta, 0.1); .rarity-text { color: $neon-magenta; } }
  &.legendary { background: rgba($neon-amber, 0.1); .rarity-text { color: $neon-amber; } }
}

.rarity-text { font-size: 22rpx; font-weight: 600; }

.item-desc {
  font-size: 26rpx;
  color: $text-secondary;
  line-height: 1.5;
  @include text-ellipsis(2);
}

// ==================== 特性标签 ====================
.feature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 16rpx;
  flex-shrink: 0;
}

.feature-tag {
  padding: 6rpx 18rpx;
  border-radius: $radius-full;
  
  &.tag-color-0 { background: rgba($neon-cyan, 0.08); .feature-tag-text { color: $neon-cyan; } }
  &.tag-color-1 { background: rgba($neon-magenta, 0.08); .feature-tag-text { color: $neon-magenta; } }
  &.tag-color-2 { background: rgba($neon-amber, 0.08); .feature-tag-text { color: $neon-amber; } }
  &.tag-color-3 { background: rgba($color-danger, 0.08); .feature-tag-text { color: $color-danger; } }
  &.tag-color-4 { background: rgba($color-info, 0.08); .feature-tag-text { color: $color-info; } }
}

.feature-tag-text {
  font-size: 22rpx;
  font-weight: 500;
}

// ==================== 故事预览 ====================
.story-preview {
  position: relative;
  padding: 20rpx 24rpx;
  @include glass-effect(0.04);
  border-radius: $radius-lg;
  border-left: 4rpx solid $neon-magenta;
  margin-bottom: 16rpx;
}

.story-quote {
  position: absolute;
  top: 4rpx;
  left: 12rpx;
  font-size: 48rpx;
  color: $neon-magenta;
  font-family: Georgia, serif;
  line-height: 1;
  opacity: 0.4;
}

.story-text {
  font-size: 24rpx;
  color: $text-secondary;
  line-height: 1.7;
  font-style: italic;
  padding-left: 20rpx;
}

// ==================== 效果区域 ====================
.effects-area {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.effect-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.effect-icon { font-size: 22rpx; }

.effect-desc {
  font-size: 24rpx;
  color: $color-success;
  font-weight: 500;
}

// ==================== 已购入提示面板 ====================
.owned-info-panel {
  padding: 20rpx;
  background: rgba($neon-cyan, 0.04);
  border-radius: $radius-xl;
  border: 1rpx solid rgba($neon-cyan, 0.15);
  margin-bottom: 16rpx;
}

.owned-info-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 12rpx;
}

.owned-info-icon { font-size: 24rpx; }

.owned-info-title {
  font-size: 26rpx;
  font-weight: 600;
  color: $neon-cyan;
}

.owned-info-body {
  display: flex;
  gap: 24rpx;
}

.owned-stat {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.owned-stat-label {
  font-size: 20rpx;
  color: $text-tertiary;
}

.owned-stat-value {
  font-size: 24rpx;
  font-weight: 600;
  color: $text-primary;
}

// ==================== 已拥有底部提示 ====================
.owned-footer-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  padding: 24rpx;
  @include glass-effect(0.04);
  border-radius: $radius-xl;
  border: 1rpx dashed rgba($neon-cyan, 0.2);
}

.owned-hint-icon { font-size: 28rpx; }

.owned-hint-text {
  font-size: 28rpx;
  font-weight: 500;
  color: $neon-cyan;
  letter-spacing: 2rpx;
}

// ==================== 底部 ====================
.card-footer {
  margin-top: auto;
  flex-shrink: 0;
  padding-top: 16rpx;
}

.price-row {
  margin-bottom: 16rpx;
}

.price-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price-values {
  display: flex;
  gap: 16rpx;
}

.price-tag {
  font-size: 26rpx;
  color: $text-primary;
  font-weight: 600;
  padding: 6rpx 16rpx;
  @include glass-effect(0.06);
  border-radius: $radius-lg;
}

.stock-info {
  font-size: 22rpx;
  color: $text-tertiary;
}

// ==================== 买入按钮 ====================
.buy-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28rpx;
  border-radius: $radius-xl;
  min-height: $touch-target-min;
  background: linear-gradient(135deg, rgba($neon-cyan, 0.6), rgba($neon-cyan, 0.4));
  transition: all 0.2s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  .btn-text {
    color: $white;
    font-size: 30rpx;
    font-weight: 600;
    letter-spacing: 2rpx;
  }

  &.disabled {
    @include glass-effect(0.06);
    .btn-text { color: $text-tertiary; }
  }

  &.just-bought {
    background: linear-gradient(135deg, rgba($neon-cyan, 0.7), rgba($neon-cyan, 0.5));
    transform: scale(0.97);
  }

  &:active:not(.disabled) {
    transform: scale(0.96);
  }
  
  // 稀有度按钮样式
  &.legendary:not(.disabled):not(.just-bought) {
    background: linear-gradient(135deg, rgba($neon-amber, 0.7), rgba($neon-amber, 0.5));
    @include neon-glow($neon-amber, 0.2);
  }
  &.epic:not(.disabled):not(.just-bought) {
    background: linear-gradient(135deg, rgba($neon-magenta, 0.7), rgba($neon-magenta, 0.5));
    @include neon-glow($neon-magenta, 0.15);
  }
  &.rare:not(.disabled):not(.just-bought) {
    background: linear-gradient(135deg, rgba($color-info, 0.7), rgba($color-info, 0.5));
    @include neon-glow($color-info, 0.15);
  }
}
</style>
