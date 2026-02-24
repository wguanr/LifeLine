<template>
  <view class="swipeable-card">
    <!-- 主卡片内容 -->
    <view class="card-main">
      <slot></slot>
    </view>

    <!-- 底部操作栏：用按钮代替手势，彻底消除冲突 -->
    <view class="card-actions-bar" v-if="!disabled">
      <view class="action-btn detail-btn" @click.stop="toggleLeftPanel">
        <text class="btn-icon">📋</text>
        <text class="btn-label">详情</text>
      </view>
      <view class="action-btn more-btn" @click.stop="toggleRightPanel">
        <text class="btn-icon">⚙️</text>
        <text class="btn-label">更多</text>
      </view>
    </view>

    <!-- 详情面板（底部弹出） -->
    <view 
      class="panel-overlay"
      :class="{ visible: showLeftPanel }"
      @click.stop="closeLeftPanel"
    >
      <view class="panel-sheet left-sheet" :class="{ visible: showLeftPanel }" @click.stop>
        <view class="sheet-handle" @click.stop="closeLeftPanel">
          <view class="handle-bar"></view>
        </view>
        <view class="sheet-header">
          <text class="sheet-title">📋 详细信息</text>
          <text class="sheet-close" @click.stop="closeLeftPanel">✕</text>
        </view>
        <scroll-view class="sheet-body" scroll-y>
          <slot name="detail">
            <text class="placeholder-text">暂无详细信息</text>
          </slot>
        </scroll-view>
      </view>
    </view>

    <!-- 操作面板（底部弹出） -->
    <view 
      class="panel-overlay"
      :class="{ visible: showRightPanel }"
      @click.stop="closeRightPanel"
    >
      <view class="panel-sheet right-sheet" :class="{ visible: showRightPanel }" @click.stop>
        <view class="sheet-handle" @click.stop="closeRightPanel">
          <view class="handle-bar"></view>
        </view>
        <view class="sheet-header">
          <text class="sheet-title">⚙️ 更多操作</text>
          <text class="sheet-close" @click.stop="closeRightPanel">✕</text>
        </view>
        <scroll-view class="sheet-body" scroll-y>
          <slot name="actions">
            <view class="default-actions">
              <view class="action-item" @click.stop="emitAction('share')">
                <text class="action-icon">📤</text>
                <text class="action-text">分享</text>
              </view>
              <view class="action-item" @click.stop="emitAction('favorite')">
                <text class="action-icon">⭐</text>
                <text class="action-text">收藏</text>
              </view>
              <view class="action-item" @click.stop="emitAction('report')">
                <text class="action-icon">🚩</text>
                <text class="action-text">举报</text>
              </view>
              <view class="action-item" @click.stop="emitAction('hide')">
                <text class="action-icon">🙈</text>
                <text class="action-text">不感兴趣</text>
              </view>
            </view>
          </slot>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'swipeLeft'): void
  (e: 'swipeRight'): void
  (e: 'action', action: string): void
  (e: 'panelChange', panel: 'left' | 'right' | null): void
}>()

// 面板状态
const showLeftPanel = ref(false)
const showRightPanel = ref(false)

// 切换详情面板
function toggleLeftPanel() {
  if (showLeftPanel.value) {
    closeLeftPanel()
  } else {
    openLeftPanel()
  }
}

// 切换操作面板
function toggleRightPanel() {
  if (showRightPanel.value) {
    closeRightPanel()
  } else {
    openRightPanel()
  }
}

// 打开详情面板
function openLeftPanel() {
  showLeftPanel.value = true
  showRightPanel.value = false
  emit('panelChange', 'left')
}

// 打开操作面板
function openRightPanel() {
  showRightPanel.value = true
  showLeftPanel.value = false
  emit('panelChange', 'right')
}

// 关闭详情面板
function closeLeftPanel() {
  showLeftPanel.value = false
  emit('panelChange', null)
}

// 关闭操作面板
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
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// 主卡片内容区
.card-main {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// 底部操作栏
.card-actions-bar {
  display: flex;
  justify-content: center;
  gap: 32rpx;
  padding: 12rpx 24rpx;
  padding-bottom: calc(12rpx + env(safe-area-inset-bottom, 0px));
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  border-top: 1rpx solid rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 14rpx 28rpx;
  border-radius: 40rpx;
  background: rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.95);
    background: rgba(0, 0, 0, 0.08);
  }
  
  .btn-icon {
    font-size: 28rpx;
  }
  
  .btn-label {
    font-size: 24rpx;
    color: #666;
    font-weight: 500;
  }
}

.detail-btn {
  background: rgba(99, 102, 241, 0.08);
  
  .btn-label {
    color: #6366f1;
  }
  
  &:active {
    background: rgba(99, 102, 241, 0.15);
  }
}

.more-btn {
  background: rgba(107, 114, 128, 0.08);
  
  .btn-label {
    color: #6b7280;
  }
  
  &:active {
    background: rgba(107, 114, 128, 0.15);
  }
}

// 面板遮罩
.panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  
  &.visible {
    opacity: 1;
    pointer-events: auto;
  }
}

// 底部弹出面板
.panel-sheet {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 70vh;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  transform: translateY(100%);
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
  display: flex;
  flex-direction: column;
  box-shadow: 0 -8rpx 40rpx rgba(0, 0, 0, 0.12);
  
  &.visible {
    transform: translateY(0);
  }
}

// 拖动手柄
.sheet-handle {
  display: flex;
  justify-content: center;
  padding: 16rpx 0 8rpx;
  flex-shrink: 0;
  
  .handle-bar {
    width: 64rpx;
    height: 8rpx;
    background: #ddd;
    border-radius: 4rpx;
  }
}

// 面板头部
.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 32rpx 20rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
  
  .sheet-title {
    font-size: 32rpx;
    font-weight: 700;
    color: #1a1a2e;
  }
  
  .sheet-close {
    font-size: 36rpx;
    color: #999;
    padding: 8rpx 16rpx;
    border-radius: 50%;
    
    &:active {
      background: rgba(0, 0, 0, 0.05);
    }
  }
}

// 面板内容区
.sheet-body {
  flex: 1;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom, 0px));
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

// 默认操作列表
.default-actions {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 28rpx 24rpx;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 20rpx;
  transition: all 0.2s;
  
  &:active {
    background: rgba(0, 0, 0, 0.06);
    transform: scale(0.98);
  }
  
  .action-icon {
    font-size: 36rpx;
  }
  
  .action-text {
    font-size: 30rpx;
    color: #333;
    font-weight: 500;
  }
}

// 占位文本
.placeholder-text {
  font-size: 28rpx;
  color: #999;
  text-align: center;
  padding: 60rpx 0;
}
</style>
