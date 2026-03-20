<template>
  <view class="swipe-sheet-overlay" :class="{ visible: modelValue }" @click.self="onOverlayTap">
    <view
      class="swipe-sheet-container"
      :class="{ visible: modelValue, dragging: isDragging }"
      :style="sheetStyle"
    >
      <!-- 拖拽手柄区域 — 始终可拖拽 -->
      <view
        class="swipe-sheet-handle-zone"
        @touchstart.prevent="onHandleTouchStart"
        @touchmove.prevent="onHandleTouchMove"
        @touchend.prevent="onHandleTouchEnd"
        @touchcancel.prevent="onHandleTouchEnd"
        @mousedown.prevent="onHandleMouseDown"
      >
        <view class="swipe-sheet-handle-bar" />
      </view>

      <!-- 头部插槽 -->
      <view class="swipe-sheet-header" v-if="$slots.header || title">
        <slot name="header">
          <text class="swipe-sheet-title">{{ title }}</text>
        </slot>
        <view class="swipe-sheet-close" @click="close">
          <text class="close-icon">✕</text>
        </view>
      </view>

      <!-- 内容区域 -->
      <scroll-view
        class="swipe-sheet-body"
        scroll-y
        :scroll-top="scrollTop"
        @scroll="onScroll"
        @touchstart.passive="onBodyTouchStart"
        @touchmove="onBodyTouchMove"
        @touchend="onBodyTouchEnd"
        @touchcancel="onBodyTouchEnd"
      >
        <slot />
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

// ==================== Props & Emits ====================

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  maxHeight?: string
  closeThreshold?: number
  velocityThreshold?: number
  closeOnOverlay?: boolean
}>(), {
  title: '',
  maxHeight: '75vh',
  closeThreshold: 100,
  velocityThreshold: 0.4,
  closeOnOverlay: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}>()

// ==================== 状态 ====================

const isDragging = ref(false)
const translateY = ref(0)
const scrollTop = ref(0)
const isScrolledToTop = ref(true)

// 触摸追踪
let startY = 0
let startTime = 0
let lastY = 0
let isBodyDrag = false
let dragLocked = false
let isMouseDragging = false

// ==================== 计算属性 ====================

const sheetStyle = computed(() => {
  if (translateY.value > 0) {
    return {
      transform: `translateY(${translateY.value}px)`,
      maxHeight: props.maxHeight,
    }
  }
  return {
    maxHeight: props.maxHeight,
  }
})

// ==================== 手柄区域触摸（始终可拖拽） ====================

function onHandleTouchStart(e: TouchEvent) {
  if (!props.modelValue) return
  const touch = e.touches[0]
  startY = touch.clientY
  lastY = touch.clientY
  startTime = Date.now()
  isDragging.value = true
}

function onHandleTouchMove(e: TouchEvent) {
  if (!props.modelValue || !isDragging.value) return
  const touch = e.touches[0]
  const rawDelta = touch.clientY - startY
  // 只允许向下拖拽
  if (rawDelta > 0) {
    translateY.value = Math.pow(rawDelta, 0.8)
  }
  lastY = touch.clientY
}

function onHandleTouchEnd(e: TouchEvent) {
  if (!props.modelValue) return
  finishDrag()
}

// ==================== 手柄区域鼠标事件（桌面端） ====================

function onHandleMouseDown(e: MouseEvent) {
  if (!props.modelValue) return
  startY = e.clientY
  lastY = e.clientY
  startTime = Date.now()
  isDragging.value = true
  isMouseDragging = true

  // 添加全局鼠标事件
  document.addEventListener('mousemove', onGlobalMouseMove)
  document.addEventListener('mouseup', onGlobalMouseUp)
}

function onGlobalMouseMove(e: MouseEvent) {
  if (!isMouseDragging) return
  const rawDelta = e.clientY - startY
  if (rawDelta > 0) {
    translateY.value = Math.pow(rawDelta, 0.8)
  }
  lastY = e.clientY
}

function onGlobalMouseUp(e: MouseEvent) {
  if (!isMouseDragging) return
  isMouseDragging = false
  document.removeEventListener('mousemove', onGlobalMouseMove)
  document.removeEventListener('mouseup', onGlobalMouseUp)
  finishDrag()
}

// ==================== 内容区域触摸（滚动到顶部后可拖拽） ====================

function onBodyTouchStart(e: TouchEvent) {
  if (!props.modelValue) return
  const touch = e.touches[0]
  startY = touch.clientY
  lastY = touch.clientY
  startTime = Date.now()
  isBodyDrag = false
  dragLocked = false
}

function onBodyTouchMove(e: TouchEvent) {
  if (!props.modelValue) return
  const touch = e.touches[0]
  const deltaY = touch.clientY - startY

  // 如果已经锁定为滚动模式，不处理
  if (dragLocked && !isBodyDrag) return

  // 判断方向：向下拖拽 且 scroll-view 已在顶部
  if (!dragLocked && deltaY > 10 && isScrolledToTop.value) {
    isBodyDrag = true
    isDragging.value = true
    dragLocked = true
  } else if (!dragLocked && deltaY < -5) {
    // 向上滚动，锁定为滚动模式
    dragLocked = true
    isBodyDrag = false
    return
  }

  if (isBodyDrag) {
    const rawDelta = touch.clientY - startY
    const dampedDelta = rawDelta > 0 ? Math.pow(rawDelta, 0.8) : 0
    translateY.value = dampedDelta
    lastY = touch.clientY

    // 尝试阻止滚动
    try { e.preventDefault() } catch (_) {}
  }
}

function onBodyTouchEnd(e: TouchEvent) {
  if (!props.modelValue) return

  if (isBodyDrag && isDragging.value) {
    finishDrag()
  }

  isBodyDrag = false
  dragLocked = false
}

// ==================== scroll-view 滚动追踪 ====================

function onScroll(e: any) {
  const top = e.detail?.scrollTop ?? 0
  scrollTop.value = top
  isScrolledToTop.value = top <= 1
}

// ==================== 统一的拖拽结束处理 ====================

function finishDrag() {
  const endTime = Date.now()
  const duration = endTime - startTime
  const distance = translateY.value
  const velocity = distance / Math.max(duration, 1) // px/ms

  if (distance > props.closeThreshold || velocity > props.velocityThreshold) {
    animateClose()
  } else {
    animateSnapBack()
  }

  isDragging.value = false
}

// ==================== 关闭动画 ====================

function animateClose() {
  translateY.value = window.innerHeight
  setTimeout(() => {
    translateY.value = 0
    emit('update:modelValue', false)
    emit('close')
  }, 300)
}

function animateSnapBack() {
  translateY.value = 0
}

function close() {
  animateClose()
}

function onOverlayTap() {
  if (props.closeOnOverlay) {
    close()
  }
}

// ==================== 监听打开/关闭 ====================

watch(() => props.modelValue, (val) => {
  if (val) {
    translateY.value = 0
    scrollTop.value = 0
    isScrolledToTop.value = true
  }
})

// ==================== 清理 ====================

onUnmounted(() => {
  document.removeEventListener('mousemove', onGlobalMouseMove)
  document.removeEventListener('mouseup', onGlobalMouseUp)
})

// ==================== 暴露方法 ====================

defineExpose({
  close,
})
</script>

<style scoped>
.swipe-sheet-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0);
  pointer-events: none;
  transition: background 0.3s ease;
}

.swipe-sheet-overlay.visible {
  background: rgba(0, 0, 0, 0.5);
  pointer-events: auto;
}

.swipe-sheet-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, rgba(20, 26, 48, 0.98) 0%, rgba(10, 14, 26, 0.99) 100%);
  backdrop-filter: blur(40rpx) saturate(150%);
  -webkit-backdrop-filter: blur(40rpx) saturate(150%);
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
  border-radius: 32rpx 32rpx 0 0;
  transform: translateY(100%);
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
  display: flex;
  flex-direction: column;
  will-change: transform;
}

.swipe-sheet-container.visible {
  transform: translateY(0);
}

.swipe-sheet-container.dragging {
  transition: none !important;
}

/* 拖拽手柄区域 — 增大可触摸区域 */
.swipe-sheet-handle-zone {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20rpx 0 12rpx;
  cursor: grab;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

.swipe-sheet-handle-zone:active {
  cursor: grabbing;
}

.swipe-sheet-handle-bar {
  width: 72rpx;
  height: 8rpx;
  border-radius: 4rpx;
  background: rgba(255, 255, 255, 0.25);
  transition: width 0.2s, background 0.2s;
}

.swipe-sheet-container.dragging .swipe-sheet-handle-bar {
  width: 96rpx;
  background: rgba(255, 255, 255, 0.5);
}

/* 头部 */
.swipe-sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8rpx 32rpx 20rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.08);
}

.swipe-sheet-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
}

.swipe-sheet-close {
  padding: 10rpx;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.close-icon {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.5);
}

.swipe-sheet-close:hover .close-icon {
  color: rgba(255, 255, 255, 0.8);
}

.swipe-sheet-close:active .close-icon {
  color: rgba(255, 255, 255, 1);
}

/* 内容区域 */
.swipe-sheet-body {
  flex: 1;
  overflow: hidden;
  -webkit-overflow-scrolling: touch;
}
</style>
