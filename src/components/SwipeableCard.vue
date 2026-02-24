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
      :style="cardStyle"
      @click="onCardClick"
    >
      <slot></slot>
      
      <!-- 左滑指示器 -->
      <view class="swipe-indicator left" :class="{ active: swipeHint === 'left' }">
        <text class="indicator-icon">📋</text>
        <text class="indicator-text">详情</text>
      </view>
      
      <!-- 右滑指示器 -->
      <view class="swipe-indicator right" :class="{ active: swipeHint === 'right' }">
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

// 常量
const SWIPE_THRESHOLD = props.threshold || 80
const PANEL_WIDTH = 280
// 方向判定的最小移动距离（越小越灵敏，但太小容易误判）
const DIRECTION_LOCK_THRESHOLD = 8
// 水平/垂直比率阈值：水平距离需要大于垂直距离的这个倍数才判定为水平
const DIRECTION_RATIO = 1.2

// 触摸状态
const startX = ref(0)
const startY = ref(0)
const currentX = ref(0)
const isSwiping = ref(false)

// 方向锁定状态：null=未确定, 'horizontal'=水平, 'vertical'=垂直
const lockedDirection = ref<'horizontal' | 'vertical' | null>(null)

// 面板状态
const showLeftPanel = ref(false)
const showRightPanel = ref(false)

// 是否处于水平滑动中
const isHorizontalLocked = computed(() => lockedDirection.value === 'horizontal')

// 卡片偏移量
const cardOffset = computed(() => {
  if (showLeftPanel.value) return PANEL_WIDTH
  if (showRightPanel.value) return -PANEL_WIDTH
  if (!isSwiping.value || !isHorizontalLocked.value) return 0
  
  const deltaX = currentX.value - startX.value
  // 添加阻尼效果：超过面板宽度后减速
  const clamped = Math.max(-PANEL_WIDTH, Math.min(PANEL_WIDTH, deltaX))
  return clamped
})

// 卡片样式（滑动中不使用transition避免延迟感）
const cardStyle = computed(() => {
  const offset = cardOffset.value
  const isAnimating = isSwiping.value && isHorizontalLocked.value
  return {
    transform: `translateX(${offset}px)`,
    transition: isAnimating ? 'none' : 'transform 0.3s ease'
  }
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

// 滑动方向提示
const swipeHint = computed(() => {
  if (!isSwiping.value || !isHorizontalLocked.value) return null
  const deltaX = currentX.value - startX.value
  if (deltaX > 30) return 'right'
  if (deltaX < -30) return 'left'
  return null
})

// 重置所有触摸状态
function resetTouchState() {
  isSwiping.value = false
  lockedDirection.value = null
  currentX.value = 0
  startX.value = 0
  startY.value = 0
}

// 触摸开始
function onTouchStart(e: TouchEvent) {
  if (props.disabled) return
  // 如果面板已打开，不处理新的滑动
  if (showLeftPanel.value || showRightPanel.value) return
  
  const touch = e.touches[0]
  startX.value = touch.clientX
  startY.value = touch.clientY
  currentX.value = touch.clientX
  isSwiping.value = true
  lockedDirection.value = null
}

// 触摸移动 - 核心手势判定逻辑
function onTouchMove(e: TouchEvent) {
  if (!isSwiping.value || props.disabled) return
  
  const touch = e.touches[0]
  const deltaX = touch.clientX - startX.value
  const deltaY = touch.clientY - startY.value
  const absDeltaX = Math.abs(deltaX)
  const absDeltaY = Math.abs(deltaY)
  
  // 阶段1：方向未锁定，尝试判定方向
  if (lockedDirection.value === null) {
    const totalMove = absDeltaX + absDeltaY
    
    // 移动距离不够，还不能判定方向
    if (totalMove < DIRECTION_LOCK_THRESHOLD) return
    
    // 判定方向：水平移动明显大于垂直移动 → 水平滑动
    if (absDeltaX > absDeltaY * DIRECTION_RATIO) {
      lockedDirection.value = 'horizontal'
    } else {
      // 垂直或斜向 → 锁定为垂直，让swiper处理
      lockedDirection.value = 'vertical'
    }
  }
  
  // 阶段2：已锁定方向
  if (lockedDirection.value === 'horizontal') {
    // 水平滑动：更新偏移量，阻止事件传播给swiper
    currentX.value = touch.clientX
    // 阻止默认行为和事件冒泡，防止swiper响应
    e.preventDefault()
    e.stopPropagation()
  }
  // 垂直滑动：什么都不做，让事件自然传播给swiper
}

// 触摸结束
function onTouchEnd() {
  if (!isSwiping.value || props.disabled) {
    resetTouchState()
    return
  }
  
  // 只有水平锁定时才处理面板打开
  if (lockedDirection.value === 'horizontal') {
    const deltaX = currentX.value - startX.value
    
    if (deltaX > SWIPE_THRESHOLD) {
      // 右滑 → 显示左侧详情面板
      openLeftPanel()
      emit('swipeRight')
    } else if (deltaX < -SWIPE_THRESHOLD) {
      // 左滑 → 显示右侧操作面板
      openRightPanel()
      emit('swipeLeft')
    }
  }
  
  resetTouchState()
}

// 触摸取消（如来电中断等）
function onTouchCancel() {
  resetTouchState()
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
  // 告诉浏览器这个元素主要处理水平方向的触摸
  // 让浏览器优先将垂直滑动传递给swiper
  touch-action: pan-y;
}

.card-content {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  z-index: 10;
  // 默认有transition，滑动中通过内联样式覆盖为none
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
  pointer-events: none;
  
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
