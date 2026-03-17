<template>
  <view class="topic-list-view">
    <!-- 顶部标题栏 -->
    <view class="header">
      <view class="header-left">
        <text class="title-icon">💬</text>
        <text class="title">社区</text>
      </view>
      <view class="header-stats">
        <view class="stat-chip">
          <text class="stat-num">{{ communityStore.sortedTopics.length }}</text>
          <text class="stat-label">话题</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-chip">
          <text class="stat-num">{{ totalParticipants }}</text>
          <text class="stat-label">参与</text>
        </view>
      </view>
    </view>

    <!-- 话题文本流 -->
    <scroll-view class="topic-scroll" scroll-y>
      <view class="topic-list">
        <view
          v-for="topic in communityStore.sortedTopics"
          :key="topic.id"
          class="topic-card"
          :class="{ 'is-pinned': topic.pinned }"
          @click="$emit('enter', topic.id)"
        >
          <!-- 话题头部 -->
          <view class="topic-header">
            <view class="topic-title-row">
              <text class="topic-icon">{{ topic.icon }}</text>
              <text class="topic-title">{{ topic.title }}</text>
              <view v-if="topic.pinned" class="pin-badge">
                <text class="pin-text">📌</text>
              </view>
            </view>
            <text class="topic-summary">{{ topic.summary }}</text>
          </view>

          <!-- 热门回复预览 -->
          <view v-if="topic.topPosts.length > 0" class="topic-preview">
            <view
              v-for="post in topic.topPosts.slice(0, 2)"
              :key="post.id"
              class="preview-item"
            >
              <text class="preview-avatar">{{ post.authorAvatar }}</text>
              <text class="preview-name">{{ post.authorName }}:</text>
              <text class="preview-text">{{ post.content }}</text>
            </view>
          </view>

          <!-- 话题底部统计 -->
          <view class="topic-footer">
            <view class="footer-stat">
              <text class="footer-icon">💰</text>
              <text class="footer-value">{{ formatPool(topic.totalPool) }}</text>
            </view>
            <view class="footer-stat">
              <text class="footer-icon">👥</text>
              <text class="footer-value">{{ topic.participantCount }}人</text>
            </view>
            <view class="footer-stat">
              <text class="footer-icon">💬</text>
              <text class="footer-value">{{ topic.postCount }}条</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部留白 -->
      <view style="height: 160rpx;"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCommunityStore } from '@/stores/community'
import { formatPool } from '@/utils/formatters'

defineEmits<{
  (e: 'enter', topicId: string): void
}>()

const communityStore = useCommunityStore()

const totalParticipants = computed(() => {
  return communityStore.sortedTopics.reduce((sum, t) => sum + t.participantCount, 0)
})
</script>

<style lang="scss" scoped>

.topic-list-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  z-index: 1;
}

/* ===== 顶部栏 ===== */
.header {
  flex-shrink: 0;
  padding: calc(40rpx + env(safe-area-inset-top, 0px)) 32rpx 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  @include glass-effect(0.06);
  border-bottom: 1rpx solid rgba($neon-cyan, 0.1);
  z-index: 100;
  position: relative;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12rpx;

  .title-icon { font-size: 36rpx; }
  .title {
    font-size: 38rpx;
    font-weight: 700;
    color: $text-primary;
  }
}

.header-stats {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 8rpx 20rpx;
  @include glass-effect(0.06);
  border-radius: $radius-full;
}

.stat-chip {
  display: flex;
  align-items: baseline;
  gap: 6rpx;
}

.stat-num {
  font-size: 28rpx;
  font-weight: 700;
  color: $neon-cyan;
}

.stat-label {
  font-size: 22rpx;
  color: $text-tertiary;
}

.stat-divider {
  width: 1rpx;
  height: 24rpx;
  background: rgba(255, 255, 255, 0.15);
}

/* ===== 话题列表 ===== */
.topic-scroll {
  flex: 1;
  min-height: 0;
}

.topic-list {
  padding: 20rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.topic-card {
  @include glass-card;
  padding: 24rpx;
  transition: all $transition-normal;
  cursor: pointer;

  &:active {
    transform: scale(0.98);
    border-color: rgba($neon-cyan, 0.3);
  }

  &.is-pinned {
    border-color: rgba($neon-amber, 0.2);
    box-shadow: $shadow-md, 0 0 12rpx rgba($neon-amber, 0.08);
  }
}

.topic-header {
  margin-bottom: 16rpx;
}

.topic-title-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 8rpx;
}

.topic-icon {
  font-size: 32rpx;
}

.topic-title {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
  flex: 1;
  @include text-ellipsis(1);
}

.pin-badge {
  font-size: 22rpx;
}

.topic-summary {
  font-size: 24rpx;
  color: $text-secondary;
  line-height: 1.5;
  @include text-ellipsis(2);
}

/* 热门回复预览 */
.topic-preview {
  padding: 12rpx 0;
  border-top: 1rpx solid rgba(255, 255, 255, 0.06);
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.06);
  margin-bottom: 12rpx;
}

.preview-item {
  display: flex;
  align-items: flex-start;
  gap: 8rpx;
  padding: 6rpx 0;
  font-size: 22rpx;
  line-height: 1.4;
}

.preview-avatar {
  font-size: 20rpx;
  flex-shrink: 0;
}

.preview-name {
  color: $neon-cyan;
  flex-shrink: 0;
  font-weight: 500;
}

.preview-text {
  color: $text-tertiary;
  @include text-ellipsis(1);
  flex: 1;
}

/* 话题底部统计 */
.topic-footer {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.footer-stat {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.footer-icon {
  font-size: 20rpx;
}

.footer-value {
  font-size: 22rpx;
  color: $text-tertiary;
  font-weight: 500;
}
</style>
