<template>
  <view 
    class="swipeable-card"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <!-- 左滑详情面板 -->
    <view 
      class="detail-panel left-panel"
      :class="{ visible: showLeftPanel }"
      :style="{ transform: `translateX(${leftPanelOffset}px)` }"
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
      :style="{ transform: `translateX(${cardOffset}px)` }"
      @click="onCardClick"
    >
      <slot></slot>
      
      <!-- 左滑指示器 -->
      <view class="swipe-indicator left" :class="{ active: swipeDirection === 'left' }">
        <text class="indicator-icon">📋</text>
        <text class="indicator-text">详情</text>
      </view>
      
      <!-- 右滑指示器 -->
      <view class="swipe-indicator right" :class="{ active: swipeDirection === 'right' }">
        <text class="indicator-icon">⚙️</text>
        <text class="indicator-text">操作</text>
      </view>
    </view>

    <!-- 右滑操作面板 -->
    <view 
      class="action-panel right-panel"
      :class="{ visible: showRightPanel }"
      :style="{ transform: `translateX(${rightPanelOffset}px)` }"
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

// 滑动阈值
const SWIPE_THRESHOLD = props.threshold || 80
const PANEL_WIDTH = 280

// 触摸状态
const startX = ref(0)
const startY = ref(0)
const currentX = ref(0)
const isSwiping = ref(false)
const isHorizontalSwipe = ref(false)

// 面板状态
const showLeftPanel = ref(false)
const showRightPanel = ref(false)

// 卡片偏移量
const cardOffset = computed(() => {
  if (showLeftPanel.value) return PANEL_WIDTH
  if (showRightPanel.value) return -PANEL_WIDTH
  if (!isSwiping.value || !isHorizontalSwipe.value) return 0
  
  const deltaX = currentX.value - startX.value
  // 限制最大偏移量
  return Math.max(-PANEL_WIDTH, Math.min(PANEL_WIDTH, deltaX))
})

// 左面板偏移量
const leftPanelOffset = computed(() => {
  if (showLeftPanel.value) return 0
  return -PANEL_WIDTH + Math.max(0, cardOffset.value)
})

// 右面板偏移量
const rightPanelOffset = computed(() => {
  if (showRightPanel.value) return 0
  return PANEL_WIDTH + Math.min(0, cardOffset.value)
})

// 滑动方向
const swipeDirection = computed(() => {
  if (!isSwiping.value || !isHorizontalSwipe.value) return null
  const deltaX = currentX.value - startX.value
  if (deltaX > 30) return 'right'
  if (deltaX < -30) return 'left'
  return null
})

// 触摸开始
function onTouchStart(e: TouchEvent) {
  if (props.disabled) return
  
  const touch = e.touches[0]
  startX.value = touch.clientX
  startY.value = touch.clientY
  currentX.value = touch.clientX
  isSwiping.value = true
  isHorizontalSwipe.value = false
}

// 触摸移动
function onTouchMove(e: TouchEvent) {
  if (!isSwiping.value || props.disabled) return
  
  const touch = e.touches[0]
  currentX.value = touch.clientX
  
  const deltaX = Math.abs(currentX.value - startX.value)
  const deltaY = Math.abs(touch.clientY - startY.value)
  
  // 判断是否为水平滑动 - 只有水平移动明显大于垂直移动时才认为是水平滑动
  if (!isHorizontalSwipe.value && (deltaX > 15 || deltaY > 15)) {
    // 只有水平移动距离是垂直移动的2倍以上时，才认为是水平滑动
    isHorizontalSwipe.value = deltaX > deltaY * 2
  }
  
  // 只有确定是水平滑动时才阻止默认行为，让垂直滑动传递给swiper
  if (isHorizontalSwipe.value && deltaX > 30) {
    e.preventDefault?.()
    e.stopPropagation?.()
  }
  // 如果是垂直滑动，不阻止事件，让swiper可以正常工作
}

// 触摸结束
function onTouchEnd() {
  if (!isSwiping.value || props.disabled) return
  
  const deltaX = currentX.value - startX.value
  
  if (isHorizontalSwipe.value) {
    if (deltaX > SWIPE_THRESHOLD) {
      // 右滑 - 显示详情
      openLeftPanel()
      emit('swipeRight')
    } else if (deltaX < -SWIPE_THRESHOLD) {
      // 左滑 - 显示操作
      openRightPanel()
      emit('swipeLeft')
    }
  }
  
  isSwiping.value = false
  isHorizontalSwipe.value = false
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

// 点击卡片内容区域
function onCardClick(e: Event) {
  // 如果有面板打开，则关闭面板并阻止事件冒泡
  if (showLeftPanel.value || showRightPanel.value) {
    e.stopPropagation()
    closeAllPanels()
  }
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
}

.card-content {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  z-index: 10;
}

// 滑动指示器
.swipe-indicator {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 20rpx;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 16rpx;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 20;
  
  &.left {
    right: 20rpx;
  }
  
  &.right {
    left: 20rpx;
  }
  
  &.active {
    opacity: 1;
  }
  
  .indicator-icon {
    font-size: 40rpx;
  }
  
  .indicator-text {
    font-size: 22rpx;
    color: #fff;
  }
}

// 面板通用样式
.detail-panel,
.action-panel {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 280px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  transition: transform 0.3s ease;
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
