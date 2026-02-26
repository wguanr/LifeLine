<template>
  <view 
    class="swipeable-card"
    @touchstart.passive="onTouchStart"
    @touchmove="onTouchMove"
    @touchend.passive="onTouchEnd"
    @touchcancel.passive="onTouchCancel"
  >
    <!-- 左滑详情面板 -->
    <view 
      class="detail-panel left-panel"
      :class="{ visible: showLeftPanel }"
    >
      <view class="panel-content">
        <view class="panel-header">
          <text class="panel-title">📋 详细信息</text>
          <text class="panel-close" @click="closeLeftPanel">✕</text>
        </view>
        <scroll-view class="panel-body" scroll-y>
          <slot name="detail">
            <text class="placeholder-text">暂无详细信息</text>
          </slot>
        </scroll-view>
      </view>
    </view>

    <!-- 主卡片内容 -->
    <view 
      class="card-content"
      :class="{ 'panel-open': showLeftPanel || showRightPanel }"
      :style="cardContentStyle"
    >
      <slot></slot>
      
      <!-- 底部快捷按钮栏 -->
      <view class="quick-actions" v-if="!showLeftPanel && !showRightPanel">
        <view class="quick-btn detail-btn" @click.stop="openLeftPanel">
          <text class="quick-icon">📋</text>
          <text class="quick-text">详情</text>
        </view>
        <view class="quick-btn action-btn" @click.stop="openRightPanel">
          <text class="quick-icon">⚙️</text>
          <text class="quick-text">操作</text>
        </view>
      </view>
    </view>

    <!-- 右滑操作面板 -->
    <view 
      class="action-panel right-panel"
      :class="{ visible: showRightPanel }"
    >
      <view class="panel-content">
        <view class="panel-header">
          <text class="panel-close" @click="closeRightPanel">✕</text>
          <text class="panel-title">⚙️ 更多操作</text>
        </view>
        <scroll-view class="panel-body" scroll-y>
          <slot name="actions">
            <view class="action-list">
              <view class="action-item" @click="emitAction('share')">
                <text class="action-icon">📤</text>
                <text class="action-text">分享</text>
              </view>
              <view class="action-item" @click="emitAction('favorite')">
                <text class="action-icon">⭐</text>
                <text class="action-text">收藏</text>
              </view>
              <view class="action-item" @click="emitAction('report')">
                <text class="action-icon">🚩</text>
                <text class="action-text">举报</text>
              </view>
              <view class="action-item" @click="emitAction('hide')">
                <text class="action-icon">🙈</text>
                <text class="action-text">不感兴趣</text>
              </view>
            </view>
          </slot>
        </scroll-view>
      </view>
    </view>

    <!-- 遮罩层 -->
    <view 
      class="overlay"
      :class="{ visible: showLeftPanel || showRightPanel }"
      @click="closeAllPanels"
    ></view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  disabled?: boolean
  threshold?: number
}>()

const emit = defineEmits<{
  (e: 'swipeLeft'): void
  (e: 'swipeRight'): void
  (e: 'action', action: string): void
  (e: 'panelChange', panel: 'left' | 'right' | null): void
}>()

// 面板宽度（扩展至340px以提供更多展示空间）
const PANEL_WIDTH = 340
// 方向锁定阈值：移动超过此距离后锁定方向
const LOCK_THRESHOLD = 12
// 水平滑动触发面板的阈值
const SWIPE_THRESHOLD = props.threshold || 80
// 水平/垂直比率要求：水平距离必须是垂直距离的N倍才认为是水平滑动
const DIRECTION_RATIO = 2.5

// 触摸状态
const startX = ref(0)
const startY = ref(0)
const currentX = ref(0)
const isSwiping = ref(false)
// 方向锁定：null=未锁定, 'horizontal'=水平, 'vertical'=垂直
const lockedDirection = ref<'horizontal' | 'vertical' | null>(null)

// 面板状态
const showLeftPanel = ref(false)
const showRightPanel = ref(false)

// 卡片内容样式
const cardContentStyle = computed(() => {
  if (showLeftPanel.value) {
    return { transform: `translateX(${PANEL_WIDTH}px)` }
  }
  if (showRightPanel.value) {
    return { transform: `translateX(-${PANEL_WIDTH}px)` }
  }
  // 滑动中跟手
  if (isSwiping.value && lockedDirection.value === 'horizontal') {
    const deltaX = currentX.value - startX.value
    const clampedX = Math.max(-PANEL_WIDTH, Math.min(PANEL_WIDTH, deltaX))
    return { 
      transform: `translateX(${clampedX}px)`,
      transition: 'none'
    }
  }
  return { transform: 'translateX(0)' }
})

// 触摸开始
function onTouchStart(e: TouchEvent) {
  if (props.disabled || showLeftPanel.value || showRightPanel.value) return
  
  const touch = e.touches[0]
  startX.value = touch.clientX
  startY.value = touch.clientY
  currentX.value = touch.clientX
  isSwiping.value = true
  lockedDirection.value = null
}

// 触摸移动 - 核心方向锁定逻辑
function onTouchMove(e: TouchEvent) {
  if (!isSwiping.value || props.disabled) return
  
  const touch = e.touches[0]
  const deltaX = Math.abs(touch.clientX - startX.value)
  const deltaY = Math.abs(touch.clientY - startY.value)
  
  // 方向未锁定时，等待移动超过阈值再判定
  if (lockedDirection.value === null) {
    const totalDelta = deltaX + deltaY
    if (totalDelta < LOCK_THRESHOLD) return // 还没移动够，不判定
    
    // 判定方向：水平距离必须是垂直距离的 DIRECTION_RATIO 倍
    if (deltaX > deltaY * DIRECTION_RATIO && deltaX > LOCK_THRESHOLD) {
      lockedDirection.value = 'horizontal'
    } else {
      lockedDirection.value = 'vertical'
      // 垂直方向：完全放手，让 swiper 处理
      isSwiping.value = false
      return
    }
  }
  
  // 已锁定为水平方向：更新位置，阻止事件传播
  if (lockedDirection.value === 'horizontal') {
    currentX.value = touch.clientX
    // 阻止事件传播给 swiper，防止同时触发垂直切换
    e.preventDefault()
    e.stopPropagation()
  }
}

// 触摸结束
function onTouchEnd() {
  if (!isSwiping.value || props.disabled) {
    resetTouch()
    return
  }
  
  if (lockedDirection.value === 'horizontal') {
    const deltaX = currentX.value - startX.value
    
    if (deltaX > SWIPE_THRESHOLD) {
      // 右滑 - 显示详情面板
      openLeftPanel()
      emit('swipeRight')
    } else if (deltaX < -SWIPE_THRESHOLD) {
      // 左滑 - 显示操作面板
      openRightPanel()
      emit('swipeLeft')
    }
  }
  
  resetTouch()
}

// 触摸取消
function onTouchCancel() {
  resetTouch()
}

// 重置触摸状态
function resetTouch() {
  isSwiping.value = false
  lockedDirection.value = null
}

// 打开左面板（详情）
function openLeftPanel() {
  showLeftPanel.value = true
  showRightPanel.value = false
  emit('panelChange', 'left')
}

// 打开右面板（操作）
function openRightPanel() {
  showRightPanel.value = true
  showLeftPanel.value = false
  emit('panelChange', 'right')
}

// 关闭左面板
function closeLeftPanel() {
  showLeftPanel.value = false
  emit('panelChange', null)
}

// 关闭右面板
function closeRightPanel() {
  showRightPanel.value = false
  emit('panelChange', null)
}

// 关闭所有面板
function closeAllPanels() {
  showLeftPanel.value = false
  showRightPanel.value = false
  emit('panelChange', null)
}

// 触发操作
function emitAction(action: string) {
  emit('action', action)
  closeRightPanel()
}

// 暴露方法给父组件
defineExpose({
  openLeftPanel,
  openRightPanel,
  closeAllPanels
})
</script>

<style lang="scss" scoped>
.swipeable-card {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  // 关键：告诉浏览器优先处理垂直滑动
  touch-action: pan-y;
}

.card-content {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 10;
  // 继承 pan-y
  touch-action: pan-y;
  
  &.panel-open {
    // 面板打开后禁止卡片内容的触摸交互
    pointer-events: none;
  }
}

// 底部快捷按钮栏
.quick-actions {
  position: absolute;
  bottom: 12rpx;
  right: 12rpx;
  display: flex;
  gap: 8rpx;
  z-index: 15;
  pointer-events: auto;
}

.quick-btn {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10rpx);
  -webkit-backdrop-filter: blur(10rpx);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid rgba(0, 0, 0, 0.06);
  transition: all 0.2s;
  
  &:active {
    transform: scale(0.95);
    background: rgba(255, 255, 255, 0.95);
  }
  
  .quick-icon {
    font-size: 22rpx;
  }
  
  .quick-text {
    font-size: 20rpx;
    color: #666;
    font-weight: 500;
  }
}

// 面板通用样式
.detail-panel,
.action-panel {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 340px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 5;
  
  .panel-content {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 60rpx 24rpx 24rpx;
    border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
    
    .panel-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #fff;
    }
    
    .panel-close {
      font-size: 32rpx;
      color: rgba(255, 255, 255, 0.6);
      padding: 10rpx;
      min-width: 44px;
      min-height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  
  .panel-body {
    flex: 1;
    padding: 24rpx;
    overflow-y: auto;
  }
}

.left-panel {
  left: 0;
  transform: translateX(-100%);
  border-right: 1rpx solid rgba(255, 255, 255, 0.1);
  
  &.visible {
    transform: translateX(0);
  }
}

.right-panel {
  right: 0;
  transform: translateX(100%);
  border-left: 1rpx solid rgba(255, 255, 255, 0.1);
  
  &.visible {
    transform: translateX(0);
  }
}

// 操作列表
.action-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  transition: background 0.2s;
  
  &:active {
    background: rgba(255, 255, 255, 0.2);
  }
  
  .action-icon {
    font-size: 36rpx;
  }
  
  .action-text {
    font-size: 28rpx;
    color: #fff;
  }
}

// 占位文本
.placeholder-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  padding: 40rpx;
}

// 遮罩层
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
  z-index: 8;
  
  &.visible {
    opacity: 1;
    pointer-events: auto;
  }
}
</style>
