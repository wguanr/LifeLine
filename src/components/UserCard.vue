<template>
  <view class="user-card">
    <view class="card-content">
      <!-- 头像区域 -->
      <view class="user-header">
        <view class="avatar-wrapper">
          <view class="user-avatar-large" :class="'level-' + Math.min(user.clearanceLevel, 5)">
            <text class="avatar-initial">{{ user.nickname.charAt(0) }}</text>
          </view>
          <!-- 等级徽章 -->
          <view class="level-badge" :class="'level-' + Math.min(user.clearanceLevel, 5)">
            <text class="level-text">L{{ user.clearanceLevel }}</text>
          </view>
        </view>
        <view class="user-info">
          <view class="name-row">
            <text class="user-name">{{ user.nickname }}</text>
            <text class="active-dot" :class="{ online: isRecentlyActive }" />
          </view>
          <text class="user-bio">{{ user.bio || '这个人很懒，什么都没写~' }}</text>
          <text class="active-time">{{ activeTimeText }}</text>
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

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <view class="action-btn primary" @click="$emit('follow', user)">
          <text class="btn-text">👋 关注</text>
        </view>
        <view class="action-btn secondary" @click="$emit('viewProfile', user)">
          <text class="btn-text">查看主页</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { User } from '@/types'
import { getTagDefinition } from '@/data/tags'

const props = defineProps<{
  user: User
}>()

defineEmits<{
  (e: 'click', user: User): void
  (e: 'follow', user: User): void
  (e: 'viewProfile', user: User): void
  (e: 'stateChange', state: string): void
}>()

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
  return Date.now() - lastActive < 3600000 // 1小时内
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
</script>

<style lang="scss" scoped>

.user-card {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: $white;
  border-radius: $radius-2xl;
  overflow: hidden;
  box-shadow: $shadow-lg;
}

.card-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 36rpx 32rpx 28rpx;
  gap: 24rpx;
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
  
  &.level-0 { background: $gradient-secondary; }
  &.level-1 { background: $gradient-primary; }
  &.level-2 { background: linear-gradient(135deg, #3B82F6, #2563EB); }
  &.level-3 { background: linear-gradient(135deg, #8B5CF6, #7C3AED); }
  &.level-4 { background: linear-gradient(135deg, #F59E0B, #D97706); }
  &.level-5 { 
    background: linear-gradient(135deg, #EF4444, #DC2626);
    box-shadow: 0 0 16rpx rgba(#EF4444, 0.3);
  }
}

.avatar-initial {
  font-size: 48rpx;
  font-weight: bold;
  color: $white;
}

.level-badge {
  position: absolute;
  bottom: -4rpx;
  right: -4rpx;
  min-width: 40rpx;
  height: 40rpx;
  padding: 0 10rpx;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3rpx solid $white;
  
  &.level-0 { background: $gray-400; }
  &.level-1 { background: $primary-color; }
  &.level-2 { background: #2563EB; }
  &.level-3 { background: #7C3AED; }
  &.level-4 { background: #D97706; }
  &.level-5 { background: #DC2626; }
}

.level-text {
  font-size: 20rpx;
  color: $white;
  font-weight: 700;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 8rpx;
}

.user-name {
  font-size: 36rpx;
  font-weight: 700;
  color: $text-primary;
  @include text-ellipsis(1);
}

.active-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: $gray-300;
  flex-shrink: 0;
  
  &.online {
    background: $color-success;
    box-shadow: 0 0 8rpx rgba($color-success, 0.5);
  }
}

.user-bio {
  font-size: 26rpx;
  color: $text-secondary;
  line-height: 1.5;
  margin-bottom: 6rpx;
  @include text-ellipsis(2);
}

.active-time {
  font-size: 22rpx;
  color: $text-tertiary;
}

// ==================== 彩色标签 ====================
.user-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  flex-shrink: 0;
  
  &.empty {
    padding: 16rpx;
    justify-content: center;
  }
}

.empty-tag-text {
  font-size: 24rpx;
  color: $text-tertiary;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 16rpx;
  border-radius: $radius-full;
  
  &.tag-color-0 { background: rgba(#6366F1, 0.08); border: 1rpx solid rgba(#6366F1, 0.12); }
  &.tag-color-1 { background: rgba(#10B981, 0.08); border: 1rpx solid rgba(#10B981, 0.12); }
  &.tag-color-2 { background: rgba(#F59E0B, 0.08); border: 1rpx solid rgba(#F59E0B, 0.12); }
  &.tag-color-3 { background: rgba(#EF4444, 0.08); border: 1rpx solid rgba(#EF4444, 0.12); }
  &.tag-color-4 { background: rgba(#8B5CF6, 0.08); border: 1rpx solid rgba(#8B5CF6, 0.12); }
}

.tag-icon { font-size: 22rpx; }

.tag-name {
  font-size: 22rpx;
  font-weight: 500;
  color: $text-primary;
}

.tag-weight {
  padding: 2rpx 8rpx;
  background: rgba(0, 0, 0, 0.06);
  border-radius: $radius-full;
}

.weight-text {
  font-size: 18rpx;
  color: $text-tertiary;
  font-weight: 600;
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
  gap: 6rpx;
  padding: 16rpx 8rpx;
  background: $gray-50;
  border-radius: $radius-lg;
}

.stat-icon { font-size: 24rpx; }

.stat-value {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
}

.stat-label {
  font-size: 20rpx;
  color: $text-tertiary;
}

// ==================== 操作按钮 ====================
.action-buttons {
  display: flex;
  gap: 16rpx;
  margin-top: auto;
  flex-shrink: 0;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
  border-radius: $radius-xl;
  min-height: $touch-target-min;
  transition: all 0.15s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  &.primary {
    background: $gradient-primary;
    box-shadow: $shadow-primary;
    .btn-text { color: $white; font-weight: 600; }
    &:active { transform: scale(0.96); }
  }

  &.secondary {
    background: $gray-50;
    border: 1rpx solid $gray-200;
    .btn-text { color: $text-primary; }
    &:active { transform: scale(0.96); background: $gray-100; }
  }
}

.btn-text {
  font-size: 28rpx;
}
</style>
