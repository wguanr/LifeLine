<template>
  <view class="item-card" :class="item.rarity">
    <!-- 稀有度装饰边框 -->
    <view class="rarity-glow" :class="item.rarity" />
    
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

      <!-- 底部操作区 -->
      <view class="card-footer">
        <!-- 价格 + 库存 -->
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

        <!-- 买入按钮 -->
        <view
          class="buy-btn"
          :class="{ disabled: !canBuy, 'just-bought': justBought, [item.rarity]: true }"
          @click.stop="onBuy"
        >
          <text class="btn-text" v-if="justBought">✓ 已买入</text>
          <text class="btn-text" v-else-if="!canBuy">余额不足</text>
          <text class="btn-text" v-else>🛒 买入</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Item } from '@/types'
import { useUserStore } from '@/stores/user'

const props = defineProps<{ item: Item }>()

defineEmits<{
  (e: 'click', item: Item): void
  (e: 'buy', item: Item): void
  (e: 'stateChange', state: string): void
}>()

const userStore = useUserStore()

const ownedQuantity = computed(() => {
  const inv = userStore.inventory.find(i => i.itemId === props.item.id)
  return inv?.quantity ?? 0
})

const canBuy = computed(() => userStore.canAfford(props.item.mintCost))

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
    uni.showToast({ title: `买入成功！已拥有 ${ownedQuantity.value} 件`, icon: 'none' })
    setTimeout(() => { justBought.value = false }, 1500)
  }
}

const getRarityLabel = (rarity: string): string => {
  const labels: Record<string, string> = {
    common: '普通', uncommon: '稀有', rare: '精良', epic: '史诗', legendary: '传说'
  }
  return labels[rarity] || rarity
}

const getEffectIcon = (type: string): string => {
  const icons: Record<string, string> = {
    energy: '⚡', time: '⏰', reputation: '⭐', attribute: '📊', unlock: '🔓'
  }
  return icons[type] || '✨'
}
</script>

<style lang="scss" scoped>
@import '@/styles/theme.scss';

.item-card {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: $white;
  border-radius: $radius-2xl;
  overflow: hidden;
  box-shadow: $shadow-lg;
  
  // 稀有度边框
  &.legendary {
    box-shadow: $shadow-lg, 0 0 20rpx rgba(#F59E0B, 0.2);
  }
  &.epic {
    box-shadow: $shadow-lg, 0 0 16rpx rgba(#8B5CF6, 0.15);
  }
  &.rare {
    box-shadow: $shadow-lg, 0 0 12rpx rgba(#3B82F6, 0.12);
  }
}

// 稀有度顶部装饰
.rarity-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6rpx;
  
  &.common { background: $gray-300; }
  &.uncommon { background: linear-gradient(90deg, #10B981, #34D399); }
  &.rare { background: linear-gradient(90deg, #3B82F6, #60A5FA); }
  &.epic { background: linear-gradient(90deg, #8B5CF6, #A78BFA); }
  &.legendary {
    height: 8rpx;
    background: linear-gradient(90deg, #F59E0B, #FCD34D, #F59E0B);
    background-size: 200% 100%;
    animation: shimmer-gold 2s linear infinite;
  }
}

@keyframes shimmer-gold {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.card-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 32rpx 28rpx 28rpx;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
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

  &.common { background: linear-gradient(135deg, #f3f4f6, #e5e7eb); }
  &.uncommon { background: linear-gradient(135deg, #d1fae5, #a7f3d0); }
  &.rare { background: linear-gradient(135deg, #dbeafe, #93c5fd); }
  &.epic { background: linear-gradient(135deg, #ede9fe, #c4b5fd); }
  &.legendary { 
    background: linear-gradient(135deg, #fef3c7, #fcd34d);
    animation: icon-glow 2s ease-in-out infinite;
  }
}

@keyframes icon-glow {
  0%, 100% { box-shadow: 0 0 8rpx rgba(#F59E0B, 0.3); }
  50% { box-shadow: 0 0 20rpx rgba(#F59E0B, 0.5); }
}

.item-icon { font-size: 56rpx; }

.owned-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  min-width: 36rpx;
  height: 36rpx;
  padding: 0 8rpx;
  background: $primary-color;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3rpx solid $white;
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
  &.common { background: $gray-100; .rarity-text { color: $gray-600; } }
  &.uncommon { background: rgba(#10B981, 0.1); .rarity-text { color: #059669; } }
  &.rare { background: rgba(#3B82F6, 0.1); .rarity-text { color: #2563EB; } }
  &.epic { background: rgba(#8B5CF6, 0.1); .rarity-text { color: #7C3AED; } }
  &.legendary { background: rgba(#F59E0B, 0.1); .rarity-text { color: #D97706; } }
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
  
  &.tag-color-0 { background: rgba(#6366F1, 0.08); .feature-tag-text { color: #4F46E5; } }
  &.tag-color-1 { background: rgba(#10B981, 0.08); .feature-tag-text { color: #059669; } }
  &.tag-color-2 { background: rgba(#F59E0B, 0.08); .feature-tag-text { color: #D97706; } }
  &.tag-color-3 { background: rgba(#EF4444, 0.08); .feature-tag-text { color: #DC2626; } }
  &.tag-color-4 { background: rgba(#8B5CF6, 0.08); .feature-tag-text { color: #7C3AED; } }
}

.feature-tag-text {
  font-size: 22rpx;
  font-weight: 500;
}

// ==================== 故事预览 ====================
.story-preview {
  position: relative;
  padding: 20rpx 24rpx;
  background: $gray-50;
  border-radius: $radius-lg;
  border-left: 4rpx solid $primary-light;
  margin-bottom: 16rpx;
}

.story-quote {
  position: absolute;
  top: 4rpx;
  left: 12rpx;
  font-size: 48rpx;
  color: $primary-light;
  font-family: Georgia, serif;
  line-height: 1;
  opacity: 0.5;
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
  background: $gray-50;
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
  background: $gradient-primary;
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
    background: $gray-200;
    .btn-text { color: $text-tertiary; }
  }

  &.just-bought {
    background: linear-gradient(135deg, #10B981, #34D399);
    transform: scale(0.97);
  }

  &:active:not(.disabled) {
    transform: scale(0.96);
  }
  
  // 稀有度按钮样式
  &.legendary:not(.disabled):not(.just-bought) {
    background: linear-gradient(135deg, #F59E0B, #D97706);
    box-shadow: 0 4rpx 16rpx rgba(#F59E0B, 0.3);
  }
  &.epic:not(.disabled):not(.just-bought) {
    background: linear-gradient(135deg, #8B5CF6, #7C3AED);
    box-shadow: 0 4rpx 16rpx rgba(#8B5CF6, 0.25);
  }
  &.rare:not(.disabled):not(.just-bought) {
    background: linear-gradient(135deg, #3B82F6, #2563EB);
    box-shadow: 0 4rpx 16rpx rgba(#3B82F6, 0.25);
  }
}
</style>
