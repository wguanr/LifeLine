<template>
  <view class="user-card">
    <view class="card-preview">
      <view class="user-header">
        <view class="user-avatar-large">
          <text class="avatar-initial">{{ user.nickname.charAt(0) }}</text>
        </view>
        <view class="user-info">
          <text class="user-name">{{ user.nickname }}</text>
          <text class="user-bio">{{ user.bio }}</text>
        </view>
      </view>

      <view class="user-tags" v-if="user.tags && user.tags.length">
        <view class="tag-chip" v-for="tag in user.tags.slice(0, 3)" :key="tag.tagId">
          <text class="tag-text">{{ getTagName(tag.tagId) }}</text>
        </view>
      </view>

      <view class="user-stats">
        <view class="stat">
          <text class="stat-value">{{ user.tags?.length || 0 }}</text>
          <text class="stat-label">标签</text>
        </view>
        <view class="stat">
          <text class="stat-value">{{ user.history?.completedEvents?.length || 0 }}</text>
          <text class="stat-label">事件</text>
        </view>
        <view class="stat">
          <text class="stat-value">{{ user.wallet?.reputation || 0 }}</text>
          <text class="stat-label">声望</text>
        </view>
      </view>

      <view class="action-buttons">
        <view class="action-btn primary" @click="$emit('follow', user)">
          <text class="btn-text">👋 关注</text>
        </view>
        <view class="action-btn secondary" @click="$emit('viewProfile', user)">
          <text class="btn-text">查看详情</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
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
  return def ? `${def.icon} ${def.name}` : tagId
}
</script>

<style lang="scss" scoped>
@import '@/styles/theme.scss';

.user-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: $white;
  overflow: hidden;
}

.card-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40rpx 32rpx;
  gap: 32rpx;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.user-avatar-large {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: $gradient-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-initial {
  font-size: 48rpx;
  font-weight: bold;
  color: $white;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 36rpx;
  font-weight: bold;
  color: $text-primary;
  display: block;
  margin-bottom: 8rpx;
}

.user-bio {
  font-size: 26rpx;
  color: $text-secondary;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.user-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.tag-chip {
  padding: 10rpx 20rpx;
  background: rgba($primary-color, 0.08);
  border: 1rpx solid rgba($primary-color, 0.15);
  border-radius: $radius-full;
}

.tag-text {
  font-size: 24rpx;
  color: $primary-dark;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  padding: 24rpx 0;
  border-top: 1rpx solid $gray-100;
  border-bottom: 1rpx solid $gray-100;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: $text-primary;
}

.stat-label {
  font-size: 22rpx;
  color: $text-tertiary;
}

.action-buttons {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
  border-radius: $radius-xl;
  min-height: $touch-target-min;

  &.primary {
    background: $gradient-primary;
    .btn-text { color: $white; font-weight: 600; }
  }

  &.secondary {
    background: $gray-100;
    border: 1rpx solid $gray-200;
    .btn-text { color: $text-primary; }
  }
}

.btn-text {
  font-size: 28rpx;
}
</style>
