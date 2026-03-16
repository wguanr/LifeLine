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
  padding: 6rpx 14rpx;
  background: rgba($neon-cyan, 0.06);
  border: 1rpx solid rgba($neon-cyan, 0.12);
  border-radius: $radius-full;
  min-height: 36px;
  cursor: pointer;
  transition: all $transition-fast;
  
  &:active {
    background: rgba($neon-cyan, 0.12);
    transform: scale(0.96);
  }
}

.world-label {
  font-size: 22rpx;
  font-weight: 600;
  color: $text-secondary;
  letter-spacing: 1rpx;
}

.switch-indicator {
  width: 36rpx;
  height: 20rpx;
  background: rgba(255, 255, 255, 0.15);
  border-radius: $radius-full;
  position: relative;
  transition: background $transition-normal;

  &.chain {
    background: rgba($neon-magenta, 0.5);

    .switch-dot {
      transform: translateX(16rpx);
      background: $neon-magenta-light;
      box-shadow: 0 0 6rpx rgba($neon-magenta, 0.5);
    }
  }
}

.switch-dot {
  width: 16rpx;
  height: 16rpx;
  background: $neon-cyan-light;
  border-radius: 50%;
  position: absolute;
  top: 2rpx;
  left: 2rpx;
  transition: all $transition-normal;
  box-shadow: 0 0 6rpx rgba($neon-cyan, 0.5);
}
</style>
