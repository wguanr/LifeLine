<template>
  <view class="swipeable-card">
    <!-- 左侧边缘点击区域（点击打开详情面板） -->
    <view 
      class="edge-tap-zone left-edge"
      v-if="!showLeftPanel && !showRightPanel"
      @click.stop="openLeftPanel"
    >
      <view class="edge-indicator left-indicator">
        <text class="edge-icon">›</text>
      </view>
    </view>

    <!-- 右侧边缘点击区域（点击打开操作面板） -->
    <view 
      class="edge-tap-zone right-edge"
      v-if="!showLeftPanel && !showRightPanel"
      @click.stop="openRightPanel"
    >
      <view class="edge-indicator right-indicator">
        <text class="edge-icon">‹</text>
      </view>
    </view>

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
      :class="{ 'panel-open-left': showLeftPanel, 'panel-open-right': showRightPanel }"
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
}>()

const emit = defineEmits<{
  (e: 'action', action: string): void
  (e: 'panelChange', panel: 'left' | 'right' | null): void
}>()

// 面板宽度
const PANEL_WIDTH = 340

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
  return { transform: 'translateX(0)' }
})

// 打开左面板（详情）
function openLeftPanel() {
  if (props.disabled) return
  showLeftPanel.value = true
  showRightPanel.value = false
  emit('panelChange', 'left')
}

// 打开右面板（操作）
function openRightPanel() {
  if (props.disabled) return
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
}

// ====== 边缘点击区域 ======
.edge-tap-zone {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 36px;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.left-edge {
    left: 0;
  }
  
  &.right-edge {
    right: 0;
  }
}

.edge-indicator {
  width: 20px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  transition: all 0.25s ease;
  opacity: 0.5;
  
  .edge-icon {
    font-size: 18px;
    color: #999;
    font-weight: 300;
    line-height: 1;
  }
}

.left-indicator {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  margin-left: -2px;
}

.right-indicator {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  margin-right: -2px;
}

.edge-tap-zone:active .edge-indicator {
  opacity: 1;
  background: rgba(0, 0, 0, 0.12);
  transform: scaleY(1.1);
  
  .edge-icon {
    color: #666;
  }
}

// ====== 主卡片内容 ======
.card-content {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 10;
  
  &.panel-open-left,
  &.panel-open-right {
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

// ====== 面板通用样式 ======
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

// ====== 操作列表 ======
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

// ====== 遮罩层 ======
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
