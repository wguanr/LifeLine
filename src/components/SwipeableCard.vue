<template>
  <view class="swipeable-card">
    <!-- 主卡片内容区域（带圆角和玻璃态，可滚动） -->
    <view class="card-body">
      <scroll-view class="card-scroll" scroll-y>
        <slot></slot>
      </scroll-view>
    </view>

    <!-- 卡片底部操作栏（在卡片玻璃体外部） -->
    <view class="card-footer">
      <!-- 主操作按钮 -->
      <view class="main-action-btn" @click.stop="onPrimaryAction">
        <slot name="primaryAction">
          <text class="main-action-text">操作</text>
        </slot>
      </view>
      <!-- 详情按钮 -->
      <view class="footer-icon-btn" @click.stop="onDetailAction">
        <text class="footer-icon">📋</text>
      </view>
      <!-- 更多操作按钮 -->
      <view class="footer-icon-btn" @click.stop="onActionsAction">
        <text class="footer-icon">⚙️</text>
      </view>
    </view>

    <!-- 底部提示文字 -->
    <view class="card-hint">
      <text class="hint-text">上下滑动探索更多</text>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'action', action: string): void
  (e: 'openDetail'): void
  (e: 'openActions'): void
}>()

function onPrimaryAction() {
  if (props.disabled) return
  emit('action', 'primary')
}

function onDetailAction() {
  if (props.disabled) return
  emit('openDetail')
}

function onActionsAction() {
  if (props.disabled) return
  emit('openActions')
}

// 暴露方法给父组件（兼容）
defineExpose({
  closeAllPanels: () => {}
})
</script>

<style lang="scss" scoped>
.swipeable-card {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// ====== 主卡片内容体 ======
.card-body {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: $radius-2xl;
}

.card-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

// ====== 卡片底部操作栏 ======
.card-footer {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 8rpx 4rpx;
  flex-shrink: 0;
}

.main-action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 76rpx;
  border-radius: $radius-full;
  background: linear-gradient(135deg, $neon-cyan 0%, $neon-magenta 100%);
  box-shadow: 0 4rpx 20rpx rgba($neon-cyan, 0.25), 0 4rpx 20rpx rgba($neon-magenta, 0.15);
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.97);
    box-shadow: 0 2rpx 12rpx rgba($neon-cyan, 0.4), 0 2rpx 12rpx rgba($neon-magenta, 0.3);
  }
}

.footer-icon-btn {
  width: 76rpx;
  height: 76rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  @include glass-effect(0.12);
  border: 1rpx solid rgba(255, 255, 255, 0.12);
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  &:active {
    transform: scale(0.92);
    background: rgba($neon-cyan, 0.15);
    border-color: rgba($neon-cyan, 0.3);
  }
  
  .footer-icon {
    font-size: 30rpx;
    line-height: 1;
  }
}

// ====== 底部提示 ======
.card-hint {
  padding: 4rpx 0 2rpx;
  text-align: center;
  flex-shrink: 0;
  
  .hint-text {
    font-size: 18rpx;
    color: rgba(255, 255, 255, 0.2);
    letter-spacing: 1rpx;
  }
}
</style>
