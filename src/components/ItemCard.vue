<template>
  <view class="item-card">
    <view class="card-preview">
      <view class="item-icon-area">
        <text class="item-icon">{{ item.icon }}</text>
      </view>
      <view class="item-info">
        <text class="item-name">{{ item.name }}</text>
        <view class="rarity-badge" :class="item.rarity">
          <text class="rarity-text">{{ getRarityLabel(item.rarity) }}</text>
        </view>
      </view>
      <text class="item-desc">{{ item.description }}</text>
      <view class="item-cost" v-if="item.mintCost">
        <text class="cost-label">铸造消耗：</text>
        <text class="cost-value" v-if="item.mintCost.time">⏰ {{ item.mintCost.time }}分钟</text>
        <text class="cost-value" v-if="item.mintCost.energy">⚡ {{ item.mintCost.energy }}精力</text>
      </view>
      <view class="item-effects" v-if="item.effects && item.effects.length">
        <view class="effect" v-for="(effect, idx) in item.effects" :key="idx">
          <text class="effect-text">✨ {{ effect.description }}</text>
        </view>
      </view>
      <view class="action-buttons">
        <view class="action-btn primary" @click="$emit('mint', item)">
          <text class="btn-text">⛏️ 铸造</text>
        </view>
        <view class="action-btn secondary" @click="$emit('click', item)">
          <text class="btn-text">查看详情</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { Item } from '@/types'

const props = defineProps<{ item: Item }>()

defineEmits<{
  (e: 'click', item: Item): void
  (e: 'mint', item: Item): void
  (e: 'stateChange', state: string): void
}>()

const getRarityLabel = (rarity: string): string => {
  const labels: Record<string, string> = {
    common: '普通', uncommon: '稀有', rare: '精良', epic: '史诗', legendary: '传说'
  }
  return labels[rarity] || rarity
}
</script>

<style lang="scss" scoped>
@import '@/styles/theme.scss';

.item-card { width: 100%; height: 100%; display: flex; flex-direction: column; background: $white; overflow: hidden; }
.card-preview { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 40rpx 32rpx; gap: 24rpx; }
.item-icon-area { width: 160rpx; height: 160rpx; border-radius: 50%; background: $gray-50; display: flex; align-items: center; justify-content: center; border: 2rpx solid $gray-200; }
.item-icon { font-size: 80rpx; }
.item-info { display: flex; align-items: center; gap: 12rpx; }
.item-name { font-size: 36rpx; font-weight: bold; color: $text-primary; }
.rarity-badge { padding: 6rpx 16rpx; border-radius: $radius-full;
  &.common { background: $gray-100; .rarity-text { color: $gray-600; } }
  &.uncommon { background: rgba(#10B981, 0.1); .rarity-text { color: #059669; } }
  &.rare { background: rgba(#3B82F6, 0.1); .rarity-text { color: #2563EB; } }
  &.epic { background: rgba(#8B5CF6, 0.1); .rarity-text { color: #7C3AED; } }
  &.legendary { background: rgba(#F59E0B, 0.1); .rarity-text { color: #D97706; } }
}
.rarity-text { font-size: 22rpx; font-weight: 600; }
.item-desc { font-size: 26rpx; color: $text-secondary; text-align: center; line-height: 1.6; }
.item-cost { display: flex; align-items: center; gap: 8rpx; padding: 16rpx 24rpx; background: $gray-50; border-radius: $radius-lg; }
.cost-label { font-size: 24rpx; color: $text-tertiary; }
.cost-value { font-size: 24rpx; color: $text-primary; font-weight: 600; }
.item-effects { display: flex; flex-direction: column; gap: 8rpx; width: 100%; }
.effect-text { font-size: 24rpx; color: $color-success; text-align: center; }
.action-buttons { display: flex; gap: 16rpx; width: 100%; }
.action-btn { flex: 1; display: flex; align-items: center; justify-content: center; padding: 24rpx; border-radius: $radius-xl; min-height: $touch-target-min;
  &.primary { background: $gradient-primary; .btn-text { color: $white; font-weight: 600; } }
  &.secondary { background: $gray-100; border: 1rpx solid $gray-200; .btn-text { color: $text-primary; } }
}
.btn-text { font-size: 28rpx; }
</style>
