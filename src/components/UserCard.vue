<template>
  <view class="user-card">
    <view class="card-content">
      <!-- 顶部区域：头像 + 基本信息 -->
      <view class="user-header">
        <view class="avatar-wrapper">
          <view class="user-avatar-large" :class="'level-' + Math.min(user.clearanceLevel, 5)">
            <text class="avatar-emoji" v-if="user.avatar">{{ user.avatar }}</text>
            <text class="avatar-initial" v-else>{{ user.nickname.charAt(0) }}</text>
          </view>
          <view class="level-badge" :class="'level-' + Math.min(user.clearanceLevel, 5)">
            <text class="level-text">L{{ user.clearanceLevel }}</text>
          </view>
          <view class="online-indicator" v-if="isRecentlyActive" />
        </view>
        <view class="user-info">
          <view class="name-row">
            <text class="user-name">{{ user.nickname }}</text>
          </view>
          <text class="user-bio">{{ user.bio || '这个人很懒，什么都没写~' }}</text>
          <view class="active-row">
            <text class="active-time">{{ activeTimeText }}</text>
          </view>
        </view>
      </view>

      <!-- 彩色标签 -->
      <view class="user-tags" v-if="user.tags && user.tags.length">
        <view 
          class="tag-chip" 
          v-for="(tag, idx) in user.tags.slice(0, 4)" 
          :key="tag.tagId"
          :class="'tag-color-' + (idx % 5)"
        >
          <text class="tag-icon">{{ getTagIcon(tag.tagId) }}</text>
          <text class="tag-name">{{ getTagName(tag.tagId) }}</text>
          <view class="tag-weight" v-if="tag.weight >= 30">
            <text class="weight-text">{{ tag.weight }}</text>
          </view>
        </view>
      </view>
      <view class="user-tags empty" v-else>
        <text class="empty-tag-text">尚未获得标签</text>
      </view>

      <!-- 统计区域 -->
      <view class="stats-grid">
        <view class="stat-card">
          <text class="stat-icon">🏷️</text>
          <text class="stat-value">{{ user.tags?.length || 0 }}</text>
          <text class="stat-label">标签</text>
        </view>
        <view class="stat-card">
          <text class="stat-icon">📖</text>
          <text class="stat-value">{{ user.history?.completedEvents?.length || 0 }}</text>
          <text class="stat-label">事件</text>
        </view>
        <view class="stat-card">
          <text class="stat-icon">{{ reputationIcon }}</text>
          <text class="stat-value">{{ user.wallet?.reputation || 0 }}</text>
          <text class="stat-label">声望</text>
        </view>
        <view class="stat-card">
          <text class="stat-icon">🎒</text>
          <text class="stat-value">{{ user.inventory?.length || 0 }}</text>
          <text class="stat-label">藏品</text>
        </view>
      </view>

      <!-- 最近选择记录 -->
      <view class="recent-choices" v-if="recentChoices.length > 0">
        <text class="section-label">📜 最近选择</text>
        <view class="choice-list">
          <view class="choice-item" v-for="(ch, idx) in recentChoices" :key="idx">
            <view class="choice-dot" :class="'dot-color-' + (idx % 3)" />
            <text class="choice-text">{{ ch.choiceId }}</text>
          </view>
        </view>
      </view>

      <!-- 共同参与的事件 -->
      <view class="shared-events" v-if="sharedEventCount > 0">
        <view class="shared-badge">
          <text class="shared-icon">🤝</text>
          <text class="shared-text">你们共同参与了 {{ sharedEventCount }} 个事件</text>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <view 
          class="action-btn" 
          :class="isFollowed ? 'followed' : 'primary'"
          @click.stop="handleFollow"
        >
          <text class="btn-text">{{ isFollowed ? '✅ 已关注' : '👋 关注' }}</text>
        </view>
        <view class="swipe-hint">
          <text class="hint-text">← 左滑查看主页</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { User } from '@/types'
import { getTagDefinition } from '@/data/tags'
import { useInfluencerStore } from '@/stores/influencer'
import { useUserStore } from '@/stores/user'

const props = defineProps<{
  user: User
}>()

const emit = defineEmits<{
  (e: 'click', user: User): void
  (e: 'follow', user: User): void
  (e: 'viewProfile', user: User): void
  (e: 'stateChange', state: string): void
}>()

const influencerStore = useInfluencerStore()
const userStore = useUserStore()

const getTagName = (tagId: string): string => {
  const def = getTagDefinition(tagId)
  return def?.name || tagId
}

const getTagIcon = (tagId: string): string => {
  const def = getTagDefinition(tagId)
  return def?.icon || '🏷️'
}

const isRecentlyActive = computed(() => {
  const lastActive = props.user.lastActive || props.user.lastActiveAt
  if (!lastActive) return false
  return Date.now() - lastActive < 3600000
})

const activeTimeText = computed(() => {
  const lastActive = props.user.lastActive || props.user.lastActiveAt
  if (!lastActive) return '未知'
  const diff = Date.now() - lastActive
  if (diff < 60000) return '刚刚活跃'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  return `${Math.floor(diff / 86400000)} 天前`
})

const reputationIcon = computed(() => {
  const rep = props.user.wallet?.reputation || 0
  if (rep >= 500) return '👑'
  if (rep >= 200) return '⭐'
  if (rep >= 100) return '🌟'
  return '💫'
})

/** 是否已关注 */
const isFollowed = computed(() => {
  return influencerStore.isFollowing(props.user.id)
})

/** 最近选择记录（展示3条） */
const recentChoices = computed(() => {
  return (props.user.history?.choiceHistory || []).slice(-3).reverse()
})

/** 共同参与的事件数 */
const sharedEventCount = computed(() => {
  const myEvents = new Set([
    ...(userStore.user?.history?.completedEvents || []),
    ...(userStore.user?.history?.currentEvents || [])
  ])
  const theirEvents = [
    ...(props.user.history?.completedEvents || []),
    ...(props.user.history?.currentEvents || [])
  ]
  return theirEvents.filter(e => myEvents.has(e)).length
})

/** 关注/取关 */
const handleFollow = () => {
  if (isFollowed.value) {
    influencerStore.unfollowInfluencer(props.user.id)
    uni.showToast({ title: `已取消关注`, icon: 'none' })
  } else {
    influencerStore.followInfluencer(props.user.id, props.user.nickname, props.user.avatar)
    uni.showToast({ title: `已关注 ${props.user.nickname}`, icon: 'none' })
  }
  emit('follow', props.user)
}

</script>

<style lang="scss" scoped>

.user-card {
  position: relative;
  width: 100%;
  height: 100%;
}

// ==================== 内容区域 ====================
.card-content {
  flex: 1;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 36rpx 32rpx 28rpx;
  gap: 20rpx;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

// ==================== 头像区域 ====================
.user-header {
  display: flex;
  align-items: flex-start;
  gap: 24rpx;
  flex-shrink: 0;
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.user-avatar-large {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  border: 4rpx solid rgba(0,0,0,0.06);
  
  &.level-1 { background: linear-gradient(135deg, #e8f5e9, #c8e6c9); }
  &.level-2 { background: linear-gradient(135deg, #e3f2fd, #bbdefb); }
  &.level-3 { background: linear-gradient(135deg, #f3e5f5, #ce93d8); }
  &.level-4 { background: linear-gradient(135deg, #fff3e0, #ffcc80); }
  &.level-5 { background: linear-gradient(135deg, #fce4ec, #f48fb1); }
}

.avatar-emoji { font-size: 52rpx; }
.avatar-initial { font-size: 44rpx; font-weight: 700; color: rgba(0,0,0,0.5); }

.level-badge {
  position: absolute;
  bottom: -4rpx;
  right: -4rpx;
  padding: 2rpx 10rpx;
  border-radius: 16rpx;
  border: 3rpx solid $white;
  
  &.level-1 { background: #66bb6a; }
  &.level-2 { background: #42a5f5; }
  &.level-3 { background: #ab47bc; }
  &.level-4 { background: #ffa726; }
  &.level-5 { background: #ef5350; }
  
  .level-text {
    font-size: 20rpx;
    font-weight: 700;
    color: $white;
  }
}

.online-indicator {
  position: absolute;
  top: 4rpx;
  right: 4rpx;
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background: #4caf50;
  border: 3rpx solid $white;
  animation: pulse-online 2s infinite;
}

@keyframes pulse-online {
  0%, 100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
  50% { box-shadow: 0 0 0 6rpx rgba(76, 175, 80, 0); }
}

.user-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.user-name {
  font-size: 36rpx;
  font-weight: 700;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-bio {
  font-size: 24rpx;
  color: $text-secondary;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.active-row {
  display: flex;
  align-items: center;
}

.active-time {
  font-size: 22rpx;
  color: $text-tertiary;
}

// ==================== 标签区域 ====================
.user-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  flex-shrink: 0;
  
  &.empty {
    padding: 12rpx 0;
  }
}

.empty-tag-text {
  font-size: 24rpx;
  color: $text-tertiary;
  font-style: italic;
}

.tag-chip {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 16rpx;
  border-radius: 24rpx;
  font-size: 22rpx;
  
  &.tag-color-0 { background: #e8f5e9; color: #2e7d32; }
  &.tag-color-1 { background: #e3f2fd; color: #1565c0; }
  &.tag-color-2 { background: #fce4ec; color: #c62828; }
  &.tag-color-3 { background: #fff3e0; color: #e65100; }
  &.tag-color-4 { background: #f3e5f5; color: #6a1b9a; }
}

.tag-icon { font-size: 24rpx; }
.tag-name { font-weight: 600; }

.tag-weight {
  background: rgba(0,0,0,0.08);
  padding: 2rpx 8rpx;
  border-radius: 10rpx;
  
  .weight-text {
    font-size: 18rpx;
    font-weight: 700;
    opacity: 0.7;
  }
}

// ==================== 统计区域 ====================
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12rpx;
  flex-shrink: 0;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  padding: 16rpx 8rpx;
  background: $gray-50;
  border-radius: $radius-lg;
}

.stat-icon { font-size: 28rpx; }
.stat-value { font-size: 32rpx; font-weight: 700; color: $text-primary; }
.stat-label { font-size: 20rpx; color: $text-tertiary; }

// ==================== 最近选择 ====================
.recent-choices {
  flex-shrink: 0;
}

.section-label {
  font-size: 24rpx;
  font-weight: 600;
  color: $text-secondary;
  margin-bottom: 12rpx;
  display: block;
}

.choice-list {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.choice-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 10rpx 16rpx;
  background: $gray-50;
  border-radius: $radius-md;
}

.choice-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  flex-shrink: 0;
  
  &.dot-color-0 { background: #42a5f5; }
  &.dot-color-1 { background: #66bb6a; }
  &.dot-color-2 { background: #ffa726; }
}

.choice-text {
  font-size: 24rpx;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// ==================== 共同事件 ====================
.shared-events {
  flex-shrink: 0;
}

.shared-badge {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 14rpx 20rpx;
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  border-radius: $radius-lg;
  border: 1rpx solid rgba(76, 175, 80, 0.2);
}

.shared-icon { font-size: 28rpx; }
.shared-text { font-size: 24rpx; color: #2e7d32; font-weight: 500; }

// ==================== 操作按钮 ====================
.action-buttons {
  display: flex;
  gap: 16rpx;
  margin-top: auto;
  padding-top: 12rpx;
  flex-shrink: 0;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 0;
  border-radius: $radius-xl;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background: linear-gradient(135deg, $primary-color, $primary-dark);
    box-shadow: 0 4rpx 12rpx rgba($primary-color, 0.3);
    
    .btn-text { color: $white; }
    
    &:active {
      transform: scale(0.97);
      box-shadow: 0 2rpx 6rpx rgba($primary-color, 0.2);
    }
  }
  
  &.followed {
    background: $gray-100;
    border: 1rpx solid $gray-200;
    
    .btn-text { color: $text-secondary; }
    
    &:active { background: $gray-200; }
  }
  
}

.btn-text {
  font-size: 28rpx;
  font-weight: 600;
}

.swipe-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 0;
  flex: 1;
  
  .hint-text {
    font-size: 24rpx;
    color: $text-tertiary;
    letter-spacing: 1rpx;
    animation: swipeHintPulse 2s ease-in-out infinite;
  }
}

@keyframes swipeHintPulse {
  0%, 100% { opacity: 0.5; transform: translateX(0); }
  50% { opacity: 1; transform: translateX(-8rpx); }
}

</style>
