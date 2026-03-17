<template>
  <view v-if="post" class="boost-overlay" @click.self="$emit('cancel')">
    <view class="boost-panel">
      <view class="boost-header">
        <text class="boost-title">🚀 助力帖子</text>
        <view class="boost-close" @click="$emit('cancel')">
          <text class="close-icon">✕</text>
        </view>
      </view>
      <text class="boost-desc">投入资源帮助帖子提升排名，投入越多排名越高</text>
      <view class="boost-author">
        <text class="boost-author-avatar">{{ post.authorAvatar }}</text>
        <text class="boost-author-name">{{ post.authorName }}</text>
      </view>
      <text class="boost-content-preview">{{ post.content.slice(0, 60) }}{{ post.content.length > 60 ? '...' : '' }}</text>

      <!-- 预设档位 -->
      <view class="boost-presets">
        <view
          v-for="preset in presets"
          :key="preset"
          class="boost-preset-btn"
          :class="{ selected: amount === preset }"
          @click="amount = preset"
        >
          <text class="preset-value">⏱{{ preset }}</text>
        </view>
      </view>

      <!-- 自定义输入 -->
      <view class="boost-custom">
        <text class="custom-label">自定义数量：</text>
        <input
          class="custom-input"
          type="number"
          v-model="amountStr"
          :placeholder="`最少 ${minAmount}`"
        />
      </view>

      <view class="boost-submit" :class="{ disabled: amount < minAmount }" @click="onSubmit">
        <text class="submit-text">确认助力 ⏱{{ amount }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TopicPost } from '@/types'
import { COMMUNITY_COSTS } from '@/stores/community'

const props = defineProps<{
  post: TopicPost | null
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'submit', amount: number): void
}>()

const presets = [5, 10, 20, 50, 100]
const minAmount = COMMUNITY_COSTS.boostMin.time
const amount = ref(10)
const amountStr = computed({
  get: () => String(amount.value),
  set: (val: string) => { amount.value = parseInt(val) || 0 }
})

function onSubmit() {
  if (!props.post || amount.value < minAmount) return
  emit('submit', amount.value)
  amount.value = 10
}
</script>

<style lang="scss" scoped>

.boost-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.boost-panel {
  width: 100%;
  max-width: 480px;
  padding: 32rpx 28rpx calc(32rpx + env(safe-area-inset-bottom, 0px));
  background: $bg-elevated;
  border-radius: $radius-2xl $radius-2xl 0 0;
  border-top: 1rpx solid rgba($neon-cyan, 0.15);
}

.boost-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.boost-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
}

.boost-close {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  @include glass-effect(0.08);
  border-radius: 50%;
  cursor: pointer;

  .close-icon {
    font-size: 24rpx;
    color: $text-secondary;
  }
}

.boost-desc {
  font-size: 24rpx;
  color: $text-tertiary;
  margin-bottom: 20rpx;
  line-height: 1.5;
}

.boost-author {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 8rpx;
}

.boost-author-avatar { font-size: 28rpx; }
.boost-author-name {
  font-size: 24rpx;
  color: $neon-cyan;
  font-weight: 500;
}

.boost-content-preview {
  font-size: 22rpx;
  color: $text-secondary;
  line-height: 1.5;
  margin-bottom: 24rpx;
  padding: 12rpx;
  @include glass-effect(0.04);
  border-radius: $radius-md;
}

.boost-presets {
  display: flex;
  gap: 12rpx;
  margin-bottom: 20rpx;
  flex-wrap: wrap;
}

.boost-preset-btn {
  padding: 12rpx 24rpx;
  @include glass-effect(0.06);
  border-radius: $radius-lg;
  cursor: pointer;
  transition: all $transition-fast;

  &:active { transform: scale(0.95); }

  &.selected {
    background: rgba($neon-cyan, 0.15);
    border-color: rgba($neon-cyan, 0.4);
    box-shadow: 0 0 8rpx rgba($neon-cyan, 0.15);
  }

  .preset-value {
    font-size: 26rpx;
    font-weight: 600;
    color: $text-primary;
  }
}

.boost-custom {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.custom-label {
  font-size: 24rpx;
  color: $text-secondary;
  flex-shrink: 0;
}

.custom-input {
  flex: 1;
  padding: 12rpx 16rpx;
  font-size: 26rpx;
  color: $text-primary;
  background: rgba(255, 255, 255, 0.05);
  border: 1rpx solid rgba(255, 255, 255, 0.1);
  border-radius: $radius-md;
}

.boost-submit {
  width: 100%;
  padding: 20rpx;
  text-align: center;
  background: linear-gradient(135deg, rgba($neon-cyan, 0.2), rgba($neon-magenta, 0.15));
  border: 1rpx solid rgba($neon-cyan, 0.3);
  border-radius: $radius-lg;
  cursor: pointer;
  transition: all $transition-fast;

  &:active { transform: scale(0.98); }

  &.disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  .submit-text {
    font-size: 28rpx;
    font-weight: 700;
    color: $neon-cyan;
  }
}
</style>
