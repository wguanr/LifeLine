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
        <view v-for="(node, index) in activeNodes" :key="node.eventId" class="tree-node active">
          <view class="node-branch" :class="getBranchDirection(index)">
            <view class="branch-line active-line"></view>
          </view>
          <view class="node-content" :class="{ 'left': index % 2 === 0, 'right': index % 2 === 1 }">
            <view class="node-card active-card">
              <view class="node-icon">{{ getEventIcon(node.type) }}</view>
              <view class="node-info">
                <text class="node-title">{{ node.eventTitle }}</text>
                <text class="node-desc">{{ node.detail }}</text>
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
        <view v-for="(node, index) in completedNodes" :key="node.eventId" class="tree-node completed">
          <view class="node-branch" :class="getBranchDirection(index + activeNodes.length)">
            <view class="branch-line completed-line"></view>
          </view>
          <view class="node-content" :class="{ 'left': (index + activeNodes.length) % 2 === 0, 'right': (index + activeNodes.length) % 2 === 1 }">
            <view class="node-card completed-card">
              <view class="node-icon">{{ getEventIcon(node.type) }}</view>
              <view class="node-info">
                <text class="node-title">{{ node.eventTitle }}</text>
                <text class="node-desc">{{ node.detail }}</text>
                <view class="node-rewards" v-if="node.rewards?.tags">
                  <text v-for="tag in node.rewards.tags" :key="tag" class="reward-tag">🏷️ {{ tag }}</text>
                </view>
              </view>
              <view class="node-status-badge completed-badge">✓</view>
            </view>
          </view>
          <view class="node-dot completed-dot"></view>
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

    <!-- 节点详情弹窗 -->
    <view v-if="selectedNode" class="node-modal" @click="selectedNode = null">
      <view class="modal-content" @click.stop>
        <view class="modal-header" :style="{ background: `linear-gradient(135deg, ${selectedNode.color || '#667eea'}40, transparent)` }">
          <text class="modal-icon">{{ selectedNode.icon }}</text>
          <text class="modal-title">{{ selectedNode.title }}</text>
          <text class="modal-close" @click="selectedNode = null">✕</text>
        </view>
        <view class="modal-body">
          <text class="modal-desc">{{ selectedNode.description }}</text>
          
          <view v-if="selectedNode.globalStats" class="modal-stats">
            <text class="stats-title">📊 全服数据</text>
            <text class="stats-participants">👥 {{ formatNumber(selectedNode.globalStats.totalParticipants) }} 人参与</text>
            <view class="choice-distribution">
              <view v-for="(count, choice) in selectedNode.globalStats.choiceDistribution" :key="choice" class="choice-bar">
                <text class="choice-name">{{ getChoiceLabel(String(choice)) }}</text>
                <view class="bar-track">
                  <view class="bar-fill" :style="{ width: getChoicePercent(selectedNode.globalStats, String(choice)) + '%' }"></view>
                </view>
                <text class="choice-percent">{{ getChoicePercent(selectedNode.globalStats, String(choice)) }}%</text>
              </view>
            </view>
          </view>

          <view v-if="selectedNode.userChoice" class="user-choice-section">
            <text class="choice-label">🎯 你的选择</text>
            <text class="choice-value">{{ getChoiceLabel(selectedNode.userChoice) }}</text>
          </view>
        </view>
        <view class="modal-footer">
          <button v-if="selectedNode.userStatus === 'available'" class="action-btn primary" @click="joinEvent(selectedNode)">
            参与事件
          </button>
          <button v-else-if="selectedNode.userStatus === 'joined'" class="action-btn secondary">
            进行中...
          </button>
          <button v-else-if="selectedNode.userStatus === 'locked'" class="action-btn disabled">
            🔒 未解锁
          </button>
          <button v-else class="action-btn completed-btn">
            ✅ 已完成
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWorldlineStore } from '@/stores/worldline'
import type { WorldEvent, GlobalStats } from '@/types'

const worldlineStore = useWorldlineStore()

// 选中的节点
const selectedNode = ref<WorldEvent | null>(null)

// 用户注册日期（模拟）
const registrationDate = ref(Date.now() - 90 * 24 * 60 * 60 * 1000)

// 当前纪元
const currentEra = computed(() => worldlineStore.currentEra)

// 基于个人时间线数据构建世界线节点
// 按事件分组，每个事件只显示一次
const timelineByEvent = computed(() => {
  const timeline = worldlineStore.sortedTimeline
  const eventMap = new Map<string, { 
    eventId: string, 
    eventTitle: string, 
    type: string, 
    timestamp: number,
    detail: string,
    rewards?: { tags?: string[], stats?: Record<string, number> }
  }>()
  
  // 按时间倒序遍历，取每个事件的最新状态
  for (const node of timeline) {
    if (!eventMap.has(node.eventId)) {
      eventMap.set(node.eventId, {
        eventId: node.eventId,
        eventTitle: node.eventTitle,
        type: node.type,
        timestamp: node.timestamp,
        detail: node.detail,
        rewards: node.rewards
      })
    }
  }
  
  return Array.from(eventMap.values())
})

// 活跃节点：显示用户已参与但未完成的事件
const activeNodes = computed(() => 
  timelineByEvent.value.filter(e => e.type === 'join' || e.type === 'choice')
)

// 已完成节点：显示用户已完成或获得奖励的事件
const completedNodes = computed(() => 
  timelineByEvent.value.filter(e => e.type === 'complete' || e.type === 'reward')
)

// 统计数据
const totalEvents = computed(() => worldlineStore.timelineStats.totalEvents)
const totalChoices = computed(() => worldlineStore.timelineStats.totalChoices)
const totalDays = computed(() => Math.floor((Date.now() - registrationDate.value) / (24 * 60 * 60 * 1000)))

// 获取分支方向
function getBranchDirection(index: number): string {
  return index % 2 === 0 ? 'left' : 'right'
}

// 选择节点
function selectNode(node: WorldEvent) {
  selectedNode.value = node
}

// 参与事件
function joinEvent(event: WorldEvent) {
  worldlineStore.recordEventJoin(event.id, event.title)
  selectedNode.value = null
  uni.showToast({ title: '已加入事件', icon: 'success' })
}

// 获取事件图标
function getEventIcon(type: string): string {
  const icons: Record<string, string> = {
    'join': '🚀',
    'choice': '🎯',
    'complete': '✅',
    'reward': '🎁',
    'unlock': '🔓'
  }
  return icons[type] || '📌'
}

// 格式化相对时间
function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  if (days < 365) return `${Math.floor(days / 30)}个月前`
  return `${Math.floor(days / 365)}年前`
}

// 获取类型标签
function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'global': '🌍 全服',
    'branch': '🌿 分支',
    'personal': '👤 个人'
  }
  return labels[type] || type
}

// 获取选择标签
function getChoiceLabel(choice: string): string {
  const labels: Record<string, string> = {
    'health': '健康优先',
    'career': '事业优先',
    'social': '社交优先',
    'family_reunion': '与家人团聚',
    'travel': '外出旅行',
    'work': '坚守工作',
    'exercise': '运动健身',
    'diet': '健康饮食',
    'sleep': '规律作息'
  }
  return labels[choice] || choice
}

// 格式化数字
function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

// 格式化日期
function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

// 计算选择百分比
function getChoicePercent(stats: GlobalStats, choice: string): number {
  const total = Object.values(stats.choiceDistribution).reduce((a, b) => a + b, 0)
  if (total === 0) return 0
  return Math.round((stats.choiceDistribution[choice] / total) * 100)
}

// 获取节点奖励
function getNodeRewards(eventId: string): { tags?: string[], stats?: Record<string, number> } | null {
  const timeline = worldlineStore.sortedTimeline
  const rewardNode = timeline.find(n => n.eventId === eventId && (n.type === 'complete' || n.type === 'reward'))
  return rewardNode?.rewards || null
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
  
  // 柔和的背景渐变
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

// 树干 - 白色系
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

// 树节点
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

// 节点圆点 - 白色系
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
  
  &.future-dot {
    background: $gray-300;
    border-color: $white;
  }
  
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

// 分支线 - 白色系
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

// 节点内容
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

// 节点卡片 - 白色系
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
  
  &.locked {
    opacity: 0.5;
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
    
    .node-status {
      font-size: 20rpx;
      color: $text-tertiary;
    }
    
    .node-choice {
      font-size: 20rpx;
      color: $primary-color;
      display: block;
    }
    
    .node-meta {
      display: flex;
      gap: 12rpx;
      margin-top: 8rpx;
      
      .node-type, .node-participants {
        font-size: 18rpx;
        color: $text-tertiary;
      }
    }
    
    .node-rewards {
      display: flex;
      flex-wrap: wrap;
      gap: 8rpx;
      margin-top: 8rpx;
      
      .reward-tag {
        font-size: 18rpx;
        color: $accent-dark;
        background: rgba($accent-color, 0.1);
        padding: 4rpx 10rpx;
        border-radius: $radius-sm;
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

// 根节点 - 白色系
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

// 树根装饰 - 白色系
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

// 统计摘要 - 白色系
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

// 弹窗样式
.node-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 40rpx;
}

.modal-content {
  background: #1a1a2e;
  border-radius: 24rpx;
  width: 100%;
  max-width: 600rpx;
  max-height: 80vh;
  overflow: hidden;
  
  .modal-header {
    padding: 24rpx;
    display: flex;
    align-items: center;
    gap: 16rpx;
    border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
    
    .modal-icon {
      font-size: 40rpx;
    }
    
    .modal-title {
      flex: 1;
      font-size: 32rpx;
      font-weight: bold;
      color: #fff;
    }
    
    .modal-close {
      font-size: 32rpx;
      color: rgba(255, 255, 255, 0.5);
      padding: 8rpx;
    }
  }
  
  .modal-body {
    padding: 24rpx;
    max-height: 50vh;
    overflow-y: auto;
    
    .modal-desc {
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.6;
      display: block;
      margin-bottom: 24rpx;
    }
    
    .modal-stats {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16rpx;
      padding: 20rpx;
      margin-bottom: 20rpx;
      
      .stats-title {
        font-size: 26rpx;
        font-weight: 600;
        color: #fff;
        display: block;
        margin-bottom: 12rpx;
      }
      
      .stats-participants {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.6);
        display: block;
        margin-bottom: 16rpx;
      }
      
      .choice-distribution {
        .choice-bar {
          display: flex;
          align-items: center;
          gap: 12rpx;
          margin-bottom: 12rpx;
          
          .choice-name {
            font-size: 22rpx;
            color: rgba(255, 255, 255, 0.7);
            width: 120rpx;
            flex-shrink: 0;
          }
          
          .bar-track {
            flex: 1;
            height: 16rpx;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8rpx;
            overflow: hidden;
            
            .bar-fill {
              height: 100%;
              background: linear-gradient(90deg, #667eea, #8B5CF6);
              border-radius: 8rpx;
              transition: width 0.5s ease;
            }
          }
          
          .choice-percent {
            font-size: 22rpx;
            color: #8B5CF6;
            width: 60rpx;
            text-align: right;
          }
        }
      }
    }
    
    .user-choice-section {
      background: rgba(139, 92, 246, 0.1);
      border: 1rpx solid rgba(139, 92, 246, 0.3);
      border-radius: 16rpx;
      padding: 16rpx 20rpx;
      display: flex;
      align-items: center;
      gap: 12rpx;
      
      .choice-label {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.6);
      }
      
      .choice-value {
        font-size: 26rpx;
        font-weight: 600;
        color: #8B5CF6;
      }
    }
  }
  
  .modal-footer {
    padding: 20rpx 24rpx;
    border-top: 1rpx solid rgba(255, 255, 255, 0.1);
    
    .action-btn {
      width: 100%;
      height: 80rpx;
      border-radius: 40rpx;
      font-size: 28rpx;
      font-weight: 600;
      border: none;
      
      &.primary {
        background: linear-gradient(135deg, #667eea, #8B5CF6);
        color: #fff;
      }
      
      &.secondary {
        background: rgba(139, 92, 246, 0.2);
        color: #8B5CF6;
      }
      
      &.disabled {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.4);
      }
      
      &.completed-btn {
        background: rgba(76, 175, 80, 0.2);
        color: #4CAF50;
      }
    }
  }
}

// 动画
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
