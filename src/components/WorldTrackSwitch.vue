<template>
  <view class="world-switch" @click="toggleWorld">
    <text class="world-label">{{ isRealWorld ? '主世界' : '链世界' }}</text>
    <view class="switch-indicator" :class="{ chain: !isRealWorld }">
      <view class="switch-dot"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWorldStore } from '@/stores/world'

const worldStore = useWorldStore()
const isRealWorld = computed(() => worldStore.isRealWorld)

const toggleWorld = () => {
  worldStore.toggleWorld()
}
</script>

<style lang="scss" scoped>

.world-switch {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  background: $gray-100;
  border-radius: $radius-full;
  min-height: $touch-target-min;
  cursor: pointer;
}

.world-label {
  font-size: 24rpx;
  font-weight: 600;
  color: $text-primary;
}

.switch-indicator {
  width: 40rpx;
  height: 24rpx;
  background: $gray-300;
  border-radius: $radius-full;
  position: relative;
  transition: background $transition-normal;

  &.chain {
    background: $accent-color;

    .switch-dot {
      transform: translateX(16rpx);
    }
  }
}

.switch-dot {
  width: 20rpx;
  height: 20rpx;
  background: $white;
  border-radius: 50%;
  position: absolute;
  top: 2rpx;
  left: 2rpx;
  transition: transform $transition-normal;
  box-shadow: $shadow-sm;
}
</style>
