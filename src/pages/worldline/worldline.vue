<template>
  <view class="worldline-page">
    <!-- 顶部标题栏 -->
    <view class="header">
      <text class="title">🌳 我的世界线</text>
      <text class="era">{{ currentEra }}</text>
    </view>

    <!-- 树形世界线容器 -->
    <scroll-view class="tree-container" scroll-y>
      <!-- 树干背景 -->
      <view class="tree-trunk"></view>
      
      <!-- 世界线树 - 从下往上生长 -->
      <view class="worldline-tree">
        <!-- 当前活跃节点（用户已参与的事件） -->
        <view v-for="(node, index) in activeNodes" :key="node.id" class="tree-node active">
          <view class="node-branch" :class="getBranchDirection(index)">
            <view class="branch-line active-line"></view>
          </view>
          <view class="node-content" :class="{ 'left': index % 2 === 0, 'right': index % 2 === 1 }">
            <view class="node-card active-card">
              <view class="node-icon">{{ getEventIcon(node.type) }}</view>
              <view class="node-info">
                <text class="node-title">{{ node.title }}</text>
                <text class="node-desc">{{ node.detail || '进行中...' }}</text>
                <view class="node-meta">
                  <text class="node-time">{{ formatRelativeTime(node.timestamp) }}</text>
                </view>
              </view>
              <view class="node-status-badge active-badge">进行中</view>
            </view>
          </view>
          <view class="node-dot active-dot">
            <view class="dot-glow"></view>
          </view>
        </view>

        <!-- 已完成的历史节点 -->
        <view v-for="(node, index) in completedNodes" :key="node.id" class="tree-node completed">
          <view class="node-branch" :class="getBranchDirection(index + activeNodes.length)">
            <view class="branch-line completed-line"></view>
          </view>
          <view class="node-content" :class="{ 'left': (index + activeNodes.length) % 2 === 0, 'right': (index + activeNodes.length) % 2 === 1 }">
            <view class="node-card completed-card">
              <view class="node-icon">{{ getEventIcon(node.type) }}</view>
              <view class="node-info">
                <text class="node-title">{{ node.title }}</text>
                <text class="node-desc">{{ node.detail || '已完成' }}</text>
              </view>
              <view class="node-status-badge completed-badge">✓</view>
            </view>
          </view>
          <view class="node-dot completed-dot"></view>
        </view>

        <!-- 空状态提示 -->
        <view v-if="worldRecords.length === 0" class="empty-state">
          <text class="empty-icon">🌌</text>
          <text class="empty-title">世界线尚未展开</text>
          <text class="empty-desc">去探索页面参与事件，开始你的故事吧</text>
        </view>

        <!-- 根节点：账号注册 -->
        <view class="tree-node root">
          <view class="root-content">
            <view class="root-card">
              <view class="root-icon">🌱</view>
              <view class="root-info">
                <text class="root-title">世界线起点</text>
                <text class="root-date">{{ formatDate(registrationDate) }} 加入</text>
                <text class="root-desc">你的故事从这里开始...</text>
              </view>
            </view>
          </view>
          <view class="root-dot">
            <view class="root-glow"></view>
          </view>
        </view>

        <!-- 树根装饰 -->
        <view class="tree-roots">
          <view class="root-line left"></view>
          <view class="root-line center"></view>
          <view class="root-line right"></view>
        </view>
      </view>

      <!-- 统计信息 -->
      <view class="stats-summary">
        <view class="stat-item">
          <text class="stat-value">{{ totalEvents }}</text>
          <text class="stat-label">参与事件</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ totalChoices }}</text>
          <text class="stat-label">关键抉择</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ totalDays }}</text>
          <text class="stat-label">成长天数</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWorldStore } from '@/stores/world'

const worldStore = useWorldStore()

// 用户注册日期（模拟）
const registrationDate = ref(Date.now() - 90 * 24 * 60 * 60 * 1000)

// 当前纪元
const currentEra = computed(() => {
  const days = Math.floor((Date.now() - registrationDate.value) / (24 * 60 * 60 * 1000))
  if (days < 7) return '第一章·萌芽'
  if (days < 30) return '第二章·成长'
  if (days < 90) return '第三章·绽放'
  return '第四章·收获'
})

// 世界线记录
const worldRecords = computed(() => worldStore.worldlineRecords)

// 活跃节点：event_start和choice类型
const activeNodes = computed(() =>
  worldRecords.value.filter(r => r.type === 'event_start' || r.type === 'choice')
)

// 已完成节点
const completedNodes = computed(() =>
  worldRecords.value.filter(r => r.type === 'event_complete')
)

// 统计数据
const totalEvents = computed(() => worldRecords.value.filter(r => r.type === 'event_start').length)
const totalChoices = computed(() => worldRecords.value.filter(r => r.type === 'choice').length)
const totalDays = computed(() => Math.floor((Date.now() - registrationDate.value) / (24 * 60 * 60 * 1000)))

// 获取分支方向
function getBranchDirection(index: number): string {
  return index % 2 === 0 ? 'left' : 'right'
}

// 获取事件图标
function getEventIcon(type: string): string {
  const icons: Record<string, string> = {
    'event_start': '🚀',
    'choice': '🎯',
    'event_complete': '✅'
  }
  return icons[type] || '📌'
}

// 格式化相对时间
function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / (60 * 1000))
  const hours = Math.floor(diff / (60 * 60 * 1000))
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  if (days < 365) return `${Math.floor(days / 30)}个月前`
  return `${Math.floor(days / 365)}年前`
}

// 格式化日期
function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}
</script>

<style lang="scss" scoped>
@import '@/styles/theme.scss';

.worldline-page {
  width: 100%;
  max-width: 100vw;
  height: 100vh;
  background: $white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  margin: 0 auto;
  
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(ellipse at 0% 0%, rgba($primary-color, 0.06) 0%, transparent 50%),
      radial-gradient(ellipse at 100% 100%, rgba($accent-color, 0.04) 0%, transparent 50%),
      linear-gradient(180deg, $white 0%, $gray-50 100%);
    pointer-events: none;
    z-index: -1;
  }
}

.header {
  position: relative;
  z-index: 100;
  flex-shrink: 0;
  padding: calc(40rpx + env(safe-area-inset-top, 0px)) 30rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(40rpx) saturate(180%);
  -webkit-backdrop-filter: blur(40rpx) saturate(180%);
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
  
  .title {
    font-size: 40rpx;
    font-weight: bold;
    color: $text-primary;
  }
  
  .era {
    font-size: 24rpx;
    color: $text-tertiary;
    background: rgba($primary-color, 0.08);
    padding: 8rpx 20rpx;
    border-radius: $radius-full;
  }
}

.tree-container {
  flex: 1;
  min-height: 0;
  padding: 0 30rpx calc(120rpx + env(safe-area-inset-bottom, 0px));
  position: relative;
  z-index: 1;
  width: 100%;
  box-sizing: border-box;
}

.tree-trunk {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 200rpx;
  width: 6rpx;
  background: linear-gradient(180deg, 
    rgba($primary-color, 0.4) 0%,
    rgba($primary-color, 0.3) 30%,
    rgba($primary-color, 0.2) 70%,
    rgba($accent-color, 0.3) 100%
  );
  transform: translateX(-50%);
  border-radius: 3rpx;
  
  &::before {
    content: '';
    position: absolute;
    left: -6rpx;
    right: -6rpx;
    top: 0;
    bottom: 0;
    background: inherit;
    filter: blur(12rpx);
    opacity: 0.3;
  }
}

.worldline-tree {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
  position: relative;
  width: 100%;
  margin: 0 auto;
}

.tree-node {
  width: 100%;
  max-width: 700rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin: 0 auto 40rpx;
  min-height: 120rpx;
}

.node-dot {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background: $primary-color;
  border: 4rpx solid $white;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  z-index: 10;
  
  &.active-dot {
    background: $primary-color;
    box-shadow: 0 0 20rpx rgba($primary-color, 0.4);
    
    .dot-glow {
      position: absolute;
      inset: -8rpx;
      border-radius: 50%;
      background: rgba($primary-color, 0.2);
      animation: pulse 2s ease-in-out infinite;
    }
  }
  
  &.completed-dot {
    background: $primary-color;
  }
}

.node-branch {
  position: absolute;
  top: 50%;
  width: 60rpx;
  height: 3rpx;
  
  &.left {
    right: 50%;
    margin-right: 12rpx;
    
    .branch-line {
      background: linear-gradient(90deg, rgba($primary-color, 0.3), transparent);
    }
  }
  
  &.right {
    left: 50%;
    margin-left: 12rpx;
    
    .branch-line {
      background: linear-gradient(270deg, rgba($primary-color, 0.3), transparent);
    }
  }
  
  .branch-line {
    width: 100%;
    height: 100%;
    border-radius: 2rpx;
    
    &.active-line {
      background: linear-gradient(90deg, rgba($primary-color, 0.5), transparent) !important;
    }
    
    &.completed-line {
      background: linear-gradient(90deg, rgba($primary-color, 0.4), transparent) !important;
    }
  }
}

.node-content {
  position: absolute;
  width: calc(50% - 50rpx);
  max-width: 320rpx;
  
  &.left {
    right: calc(50% + 30rpx);
  }
  
  &.right {
    left: calc(50% + 30rpx);
  }
}

.node-card {
  @include glass-effect(0.85);
  border-radius: $radius-lg;
  padding: 20rpx;
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  position: relative;
  transition: all $transition-normal;
  min-height: $touch-target-min;
  
  &:active {
    transform: scale(0.98);
    background: rgba(255, 255, 255, 0.95);
  }
  
  &.active-card {
    @include glass-tinted($primary-color);
    box-shadow: 0 4rpx 20rpx rgba($primary-color, 0.15);
  }
  
  &.completed-card {
    @include glass-tinted($primary-color);
  }
  
  .node-icon {
    font-size: 32rpx;
    flex-shrink: 0;
  }
  
  .node-info {
    flex: 1;
    min-width: 0;
    
    .node-title {
      font-size: 26rpx;
      font-weight: 600;
      color: $text-primary;
      display: block;
      margin-bottom: 4rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .node-desc {
      font-size: 20rpx;
      color: $text-tertiary;
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .node-meta {
      display: flex;
      gap: 12rpx;
      margin-top: 8rpx;
      
      .node-time {
        font-size: 18rpx;
        color: $text-tertiary;
      }
    }
  }
  
  .node-status-badge {
    position: absolute;
    top: -8rpx;
    right: -8rpx;
    font-size: 18rpx;
    padding: 6rpx 14rpx;
    border-radius: $radius-full;
    
    &.active-badge {
      background: $gradient-primary;
      color: $white;
      box-shadow: 0 4rpx 12rpx rgba($primary-color, 0.3);
    }
    
    &.completed-badge {
      background: $primary-color;
      color: $white;
      width: 32rpx;
      height: 32rpx;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
  }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx;
  
  .empty-icon {
    font-size: 80rpx;
    margin-bottom: 20rpx;
  }
  
  .empty-title {
    font-size: 32rpx;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 12rpx;
  }
  
  .empty-desc {
    font-size: 24rpx;
    color: $text-tertiary;
  }
}

// 根节点
.tree-node.root {
  margin-top: 60rpx;
  margin-bottom: 0;
  
  .root-content {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  
  .root-card {
    @include glass-tinted($primary-color);
    border-radius: $radius-xl;
    padding: 28rpx;
    display: flex;
    align-items: center;
    gap: 16rpx;
    max-width: 400rpx;
    
    .root-icon {
      font-size: 48rpx;
    }
    
    .root-info {
      .root-title {
        font-size: 28rpx;
        font-weight: bold;
        color: $primary-color;
        display: block;
      }
      
      .root-date {
        font-size: 22rpx;
        color: $text-secondary;
        display: block;
        margin: 4rpx 0;
      }
      
      .root-desc {
        font-size: 20rpx;
        color: $text-tertiary;
        font-style: italic;
      }
    }
  }
  
  .root-dot {
    position: absolute;
    left: 50%;
    top: -30rpx;
    transform: translateX(-50%);
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    background: $gradient-primary;
    border: 4rpx solid $white;
    box-shadow: 0 4rpx 16rpx rgba($primary-color, 0.3);
    z-index: 10;
    
    .root-glow {
      position: absolute;
      inset: -12rpx;
      border-radius: 50%;
      background: radial-gradient(circle, rgba($primary-color, 0.2) 0%, transparent 70%);
    }
  }
}

.tree-roots {
  display: flex;
  justify-content: center;
  gap: 20rpx;
  margin-top: 20rpx;
  
  .root-line {
    width: 4rpx;
    height: 60rpx;
    background: linear-gradient(180deg, rgba($primary-color, 0.3), transparent);
    border-radius: 2rpx;
    
    &.left {
      transform: rotate(-20deg);
    }
    
    &.right {
      transform: rotate(20deg);
    }
  }
}

.stats-summary {
  display: flex;
  justify-content: space-around;
  @include glass-card;
  padding: 28rpx;
  margin: 40rpx auto;
  width: 100%;
  max-width: 700rpx;
  box-sizing: border-box;
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .stat-value {
      font-size: 36rpx;
      font-weight: bold;
      color: $primary-color;
    }
    
    .stat-label {
      font-size: 22rpx;
      color: $text-tertiary;
      margin-top: 4rpx;
    }
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.5);
    opacity: 0;
  }
}
</style>
