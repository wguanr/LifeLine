<template>
  <view class="community-page">
    <!-- ==================== 话题列表视图 ==================== -->
    <view v-if="!communityStore.currentTopicId" class="topic-list-view">
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
            @click="onEnterTopic(topic.id)"
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

    <!-- ==================== 话题详情视图 ==================== -->
    <view v-else class="topic-detail-view">
      <!-- 详情顶部栏 -->
      <view class="detail-header">
        <view class="back-btn" @click="onLeaveTopic">
          <text class="back-icon">←</text>
          <text class="back-text">返回</text>
        </view>
        <view class="detail-title-area">
          <text class="detail-title">{{ communityStore.currentTopic?.icon }} {{ communityStore.currentTopic?.title }}</text>
        </view>
        <view class="detail-pool">
          <text class="pool-icon">💰</text>
          <text class="pool-value">{{ formatPool(communityStore.currentTopic?.totalPool ?? 0) }}</text>
        </view>
      </view>

      <!-- 话题信息区 -->
      <view class="topic-info-section">
        <text class="info-summary">{{ communityStore.currentTopic?.summary }}</text>
        <view class="info-stats">
          <view class="info-stat">
            <text class="info-stat-num">{{ communityStore.currentTopic?.participantCount }}</text>
            <text class="info-stat-label">参与者</text>
          </view>
          <view class="info-stat">
            <text class="info-stat-num">{{ communityStore.currentTopic?.postCount }}</text>
            <text class="info-stat-label">帖子</text>
          </view>
          <view class="info-stat">
            <text class="info-stat-num">{{ formatPool(communityStore.currentTopic?.totalPool ?? 0) }}</text>
            <text class="info-stat-label">资源池</text>
          </view>
        </view>
      </view>

      <!-- 帖子列表 -->
      <scroll-view class="post-scroll" scroll-y>
        <!-- 发帖入口 -->
        <view class="compose-section">
          <view v-if="!showCompose" class="compose-trigger" @click="showCompose = true">
            <text class="compose-placeholder">💭 分享你的想法... (消耗 ⏱{{ COMMUNITY_COSTS.post.time }} ⚡{{ COMMUNITY_COSTS.post.energy }})</text>
          </view>
          <view v-else class="compose-panel">
            <textarea
              class="compose-input"
              v-model="composeContent"
              placeholder="写下你的想法..."
              :maxlength="500"
              auto-height
            />
            <view class="compose-actions">
              <text class="compose-cost">消耗 ⏱{{ COMMUNITY_COSTS.post.time }} ⚡{{ COMMUNITY_COSTS.post.energy }}</text>
              <view class="compose-btns">
                <view class="btn-cancel" @click="cancelCompose">取消</view>
                <view class="btn-submit" :class="{ disabled: !composeContent.trim() }" @click="submitPost">发布</view>
              </view>
            </view>
          </view>
        </view>

        <!-- 帖子流 -->
        <view class="post-list">
          <view
            v-for="post in communityStore.currentTopicPosts"
            :key="post.id"
            class="post-card"
          >
            <!-- 帖子头部 -->
            <view class="post-header">
              <view class="post-author">
                <text class="author-avatar">{{ post.authorAvatar }}</text>
                <view class="author-info">
                  <text class="author-name">{{ post.authorName }}</text>
                  <text class="author-level">Lv.{{ post.authorLevel }}</text>
                </view>
              </view>
              <view class="post-value-badge">
                <text class="value-icon">💰</text>
                <text class="value-num">{{ post.totalValue }}</text>
              </view>
            </view>

            <!-- 帖子内容 -->
            <text class="post-content">{{ post.content }}</text>

            <!-- 帖子操作栏 -->
            <view class="post-actions">
              <view class="post-time">
                <text class="time-text">{{ formatRelativeTime(post.createdAt) }}</text>
              </view>
              <view class="action-group">
                <view
                  class="action-btn"
                  :class="{ 'is-liked': communityStore.userLikedPostIds.has(post.id) }"
                  @click="onLike(post)"
                >
                  <text class="action-icon">{{ communityStore.userLikedPostIds.has(post.id) ? '❤️' : '🤍' }}</text>
                  <text class="action-count">{{ post.likeCount }}</text>
                </view>
                <view class="action-btn" @click="onStartBoost(post)">
                  <text class="action-icon">🚀</text>
                  <text class="action-count">{{ post.boostCount }}</text>
                </view>
                <view class="action-btn" @click="onStartReply(post)">
                  <text class="action-icon">💬</text>
                  <text class="action-count">{{ post.replyCount }}</text>
                </view>
              </view>
            </view>

            <!-- 回复区域 -->
            <view v-if="post.replyCount > 0 || replyingTo === post.id" class="replies-section">
              <!-- 展开/收起回复 -->
              <view
                v-if="post.replyCount > 0"
                class="replies-toggle"
                @click="toggleReplies(post.id)"
              >
                <text class="toggle-text">
                  {{ expandedReplies.has(post.id) ? '收起回复' : `查看 ${post.replyCount} 条回复` }}
                </text>
              </view>

              <!-- 回复列表 -->
              <view v-if="expandedReplies.has(post.id)" class="reply-list">
                <view
                  v-for="reply in communityStore.getReplies(post.id)"
                  :key="reply.id"
                  class="reply-item"
                >
                  <text class="reply-avatar">{{ reply.authorAvatar }}</text>
                  <view class="reply-body">
                    <view class="reply-meta">
                      <text class="reply-name">{{ reply.authorName }}</text>
                      <text class="reply-time">{{ formatRelativeTime(reply.createdAt) }}</text>
                    </view>
                    <text class="reply-content">{{ reply.content }}</text>
                  </view>
                </view>
              </view>

              <!-- 回复输入框 -->
              <view v-if="replyingTo === post.id" class="reply-compose">
                <textarea
                  class="reply-input"
                  v-model="replyContent"
                  :placeholder="`回复 @${post.authorName}...`"
                  :maxlength="500"
                  auto-height
                />
                <view class="reply-actions">
                  <text class="reply-cost">消耗 ⏱{{ COMMUNITY_COSTS.reply.time }} ⚡{{ COMMUNITY_COSTS.reply.energy }}</text>
                  <view class="reply-btns">
                    <view class="btn-cancel" @click="cancelReply">取消</view>
                    <view class="btn-submit" :class="{ disabled: !replyContent.trim() }" @click="submitReply(post)">回复</view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-if="communityStore.currentTopicPosts.length === 0" class="empty-posts">
          <text class="empty-icon">🌱</text>
          <text class="empty-text">还没有人发言，成为第一个分享者吧</text>
        </view>

        <!-- 底部留白 -->
        <view style="height: 160rpx;"></view>
      </scroll-view>

      <!-- 助力面板 -->
      <view v-if="boostingPost" class="boost-overlay" @click.self="cancelBoost">
        <view class="boost-panel">
          <view class="boost-header">
            <text class="boost-title">🚀 助力帖子</text>
            <view class="boost-close" @click="cancelBoost">
              <text class="close-icon">✕</text>
            </view>
          </view>
          <text class="boost-desc">投入资源帮助帖子提升排名，投入越多排名越高</text>
          <view class="boost-author">
            <text class="boost-author-avatar">{{ boostingPost.authorAvatar }}</text>
            <text class="boost-author-name">{{ boostingPost.authorName }}</text>
          </view>
          <text class="boost-content-preview">{{ boostingPost.content.slice(0, 60) }}{{ boostingPost.content.length > 60 ? '...' : '' }}</text>

          <!-- 预设档位 -->
          <view class="boost-presets">
            <view
              v-for="preset in boostPresets"
              :key="preset"
              class="boost-preset-btn"
              :class="{ selected: boostAmount === preset }"
              @click="boostAmount = preset"
            >
              <text class="preset-value">⏱{{ preset }}</text>
            </view>
          </view>

          <!-- 自定义输入 -->
          <view class="boost-custom">
            <text class="custom-label">自定义数量：</text>
            <input
              class="custom-input"
              type="number"
              v-model="boostAmountStr"
              :placeholder="`最少 ${COMMUNITY_COSTS.boostMin.time}`"
            />
          </view>

          <view class="boost-submit" :class="{ disabled: boostAmount < COMMUNITY_COSTS.boostMin.time }" @click="submitBoost">
            <text class="submit-text">确认助力 ⏱{{ boostAmount }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCommunityStore, COMMUNITY_COSTS } from '@/stores/community'
import type { TopicPost } from '@/types'
import { formatRelativeTime } from '@/utils/formatters'

const communityStore = useCommunityStore()

// ==================== 话题列表 ====================

const totalParticipants = computed(() => {
  return communityStore.sortedTopics.reduce((sum, t) => sum + t.participantCount, 0)
})

function formatPool(value: number): string {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}万`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}千`
  return String(value)
}

function onEnterTopic(topicId: string) {
  communityStore.enterTopic(topicId)
}

function onLeaveTopic() {
  communityStore.leaveTopic()
}

// ==================== 发帖 ====================

const showCompose = ref(false)
const composeContent = ref('')

function cancelCompose() {
  showCompose.value = false
  composeContent.value = ''
}

function submitPost() {
  if (!composeContent.value.trim() || !communityStore.currentTopicId) return
  const success = communityStore.createPost(communityStore.currentTopicId, composeContent.value.trim())
  if (success) {
    uni.showToast({ title: '发布成功', icon: 'success' })
    cancelCompose()
  }
}

// ==================== 回复 ====================

const replyingTo = ref<string | null>(null)
const replyContent = ref('')
const expandedReplies = ref(new Set<string>())

function onStartReply(post: TopicPost) {
  replyingTo.value = post.id
  replyContent.value = ''
  // 自动展开回复区域
  expandedReplies.value.add(post.id)
}

function cancelReply() {
  replyingTo.value = null
  replyContent.value = ''
}

function submitReply(parentPost: TopicPost) {
  if (!replyContent.value.trim() || !communityStore.currentTopicId) return
  const success = communityStore.replyToPost(
    communityStore.currentTopicId,
    parentPost.id,
    replyContent.value.trim()
  )
  if (success) {
    uni.showToast({ title: '回复成功', icon: 'success' })
    cancelReply()
  }
}

function toggleReplies(postId: string) {
  if (expandedReplies.value.has(postId)) {
    expandedReplies.value.delete(postId)
  } else {
    expandedReplies.value.add(postId)
  }
}

// ==================== 点赞 ====================

function onLike(post: TopicPost) {
  if (!communityStore.currentTopicId) return
  communityStore.likePost(communityStore.currentTopicId, post.id)
}

// ==================== 助力 ====================

const boostingPost = ref<TopicPost | null>(null)
const boostAmount = ref(10)
const boostAmountStr = computed({
  get: () => String(boostAmount.value),
  set: (val: string) => { boostAmount.value = parseInt(val) || 0 }
})
const boostPresets = [5, 10, 20, 50, 100]

function onStartBoost(post: TopicPost) {
  boostingPost.value = post
  boostAmount.value = 10
}

function cancelBoost() {
  boostingPost.value = null
}

function submitBoost() {
  if (!boostingPost.value || !communityStore.currentTopicId) return
  if (boostAmount.value < COMMUNITY_COSTS.boostMin.time) return
  const success = communityStore.boostPost(
    communityStore.currentTopicId,
    boostingPost.value.id,
    boostAmount.value
  )
  if (success) {
    uni.showToast({ title: `助力成功 +${boostAmount.value}`, icon: 'success' })
    cancelBoost()
  }
}

// ==================== 初始化 ====================

onMounted(() => {
  communityStore.initData()
})
</script>

<style lang="scss" scoped>

.community-page {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  height: 100vh;
  background: $bg-deep;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background:
      radial-gradient(ellipse at 20% 0%, rgba($neon-cyan, 0.05) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 100%, rgba($neon-magenta, 0.04) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }
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
.topic-list-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  z-index: 1;
}

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

/* ===== 话题详情视图 ===== */
.topic-detail-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  z-index: 1;
}

.detail-header {
  flex-shrink: 0;
  padding: calc(40rpx + env(safe-area-inset-top, 0px)) 24rpx 20rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  @include glass-effect(0.06);
  border-bottom: 1rpx solid rgba($neon-cyan, 0.1);
  z-index: 100;
  position: relative;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 16rpx;
  @include glass-effect(0.08);
  border-radius: $radius-full;
  cursor: pointer;
  flex-shrink: 0;

  &:active { transform: scale(0.95); }

  .back-icon {
    font-size: 28rpx;
    color: $neon-cyan;
  }
  .back-text {
    font-size: 24rpx;
    color: $text-secondary;
  }
}

.detail-title-area {
  flex: 1;
  min-width: 0;
}

.detail-title {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
  @include text-ellipsis(1);
}

.detail-pool {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 6rpx 16rpx;
  @include glass-tinted($neon-amber, 0.1);
  border-radius: $radius-full;
  flex-shrink: 0;

  .pool-icon { font-size: 20rpx; }
  .pool-value {
    font-size: 24rpx;
    font-weight: 600;
    color: $neon-amber;
  }
}

/* 话题信息区 */
.topic-info-section {
  padding: 20rpx 24rpx;
  @include glass-effect(0.03);
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.06);
}

.info-summary {
  font-size: 24rpx;
  color: $text-secondary;
  line-height: 1.6;
  margin-bottom: 16rpx;
}

.info-stats {
  display: flex;
  gap: 32rpx;
}

.info-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.info-stat-num {
  font-size: 28rpx;
  font-weight: 700;
  color: $neon-cyan;
}

.info-stat-label {
  font-size: 20rpx;
  color: $text-tertiary;
}

/* 帖子滚动区 */
.post-scroll {
  flex: 1;
  min-height: 0;
}

/* 发帖入口 */
.compose-section {
  padding: 20rpx 24rpx;
}

.compose-trigger {
  padding: 20rpx 24rpx;
  @include glass-card;
  cursor: pointer;

  &:active { transform: scale(0.98); }
}

.compose-placeholder {
  font-size: 24rpx;
  color: $text-tertiary;
}

.compose-panel {
  @include glass-card;
  padding: 20rpx;
}

.compose-input {
  width: 100%;
  min-height: 120rpx;
  font-size: 26rpx;
  color: $text-primary;
  background: transparent;
  border: none;
  line-height: 1.6;
}

.compose-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.06);
}

.compose-cost {
  font-size: 22rpx;
  color: $text-tertiary;
}

.compose-btns {
  display: flex;
  gap: 12rpx;
}

.btn-cancel {
  padding: 8rpx 24rpx;
  font-size: 24rpx;
  color: $text-secondary;
  @include glass-effect(0.06);
  border-radius: $radius-lg;
  cursor: pointer;

  &:active { transform: scale(0.95); }
}

.btn-submit {
  padding: 8rpx 24rpx;
  font-size: 24rpx;
  color: $neon-cyan;
  background: rgba($neon-cyan, 0.15);
  border: 1rpx solid rgba($neon-cyan, 0.3);
  border-radius: $radius-lg;
  font-weight: 600;
  cursor: pointer;

  &:active { transform: scale(0.95); }

  &.disabled {
    opacity: 0.4;
    pointer-events: none;
  }
}

/* ===== 帖子卡片 ===== */
.post-list {
  padding: 0 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.post-card {
  @include glass-card;
  padding: 20rpx;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.author-avatar {
  font-size: 36rpx;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 2rpx;
}

.author-name {
  font-size: 26rpx;
  font-weight: 600;
  color: $text-primary;
}

.author-level {
  font-size: 20rpx;
  color: $neon-cyan;
  font-weight: 500;
}

.post-value-badge {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 4rpx 12rpx;
  background: rgba($neon-amber, 0.1);
  border: 1rpx solid rgba($neon-amber, 0.2);
  border-radius: $radius-full;

  .value-icon { font-size: 18rpx; }
  .value-num {
    font-size: 22rpx;
    font-weight: 600;
    color: $neon-amber;
  }
}

.post-content {
  font-size: 26rpx;
  color: $text-primary;
  line-height: 1.7;
  margin-bottom: 16rpx;
}

/* 帖子操作栏 */
.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.06);
}

.post-time {
  .time-text {
    font-size: 20rpx;
    color: $text-tertiary;
  }
}

.action-group {
  display: flex;
  gap: 24rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 6rpx 12rpx;
  border-radius: $radius-full;
  cursor: pointer;
  transition: all $transition-fast;

  &:active { transform: scale(0.9); }

  &.is-liked {
    background: rgba($neon-magenta, 0.1);
  }

  .action-icon { font-size: 24rpx; }
  .action-count {
    font-size: 22rpx;
    color: $text-tertiary;
    font-weight: 500;
  }
}

/* ===== 回复区域 ===== */
.replies-section {
  margin-top: 12rpx;
  padding-top: 12rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.04);
}

.replies-toggle {
  cursor: pointer;
  padding: 8rpx 0;

  .toggle-text {
    font-size: 22rpx;
    color: $neon-cyan;
    font-weight: 500;
  }
}

.reply-list {
  padding: 8rpx 0;
}

.reply-item {
  display: flex;
  gap: 10rpx;
  padding: 10rpx 0;

  .reply-avatar { font-size: 24rpx; flex-shrink: 0; }

  .reply-body { flex: 1; min-width: 0; }

  .reply-meta {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 4rpx;
  }

  .reply-name {
    font-size: 22rpx;
    font-weight: 600;
    color: $neon-cyan;
  }

  .reply-time {
    font-size: 18rpx;
    color: $text-tertiary;
  }

  .reply-content {
    font-size: 24rpx;
    color: $text-secondary;
    line-height: 1.5;
  }
}

/* 回复输入 */
.reply-compose {
  margin-top: 12rpx;
  padding: 12rpx;
  @include glass-effect(0.04);
  border-radius: $radius-lg;
}

.reply-input {
  width: 100%;
  min-height: 80rpx;
  font-size: 24rpx;
  color: $text-primary;
  background: transparent;
  border: none;
  line-height: 1.5;
}

.reply-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10rpx;
}

.reply-cost {
  font-size: 20rpx;
  color: $text-tertiary;
}

.reply-btns {
  display: flex;
  gap: 10rpx;
}

/* ===== 助力面板 ===== */
.boost-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.boost-panel {
  width: 100%;
  max-width: 480px;
  padding: 32rpx 28rpx calc(32rpx + env(safe-area-inset-bottom, 0px));
  background: $bg-elevated;
  border-radius: $radius-2xl $radius-2xl 0 0;
  border-top: 1rpx solid rgba($neon-cyan, 0.15);
}

.boost-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.boost-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
}

.boost-close {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  @include glass-effect(0.08);
  border-radius: 50%;
  cursor: pointer;

  .close-icon {
    font-size: 24rpx;
    color: $text-secondary;
  }
}

.boost-desc {
  font-size: 24rpx;
  color: $text-tertiary;
  margin-bottom: 20rpx;
  line-height: 1.5;
}

.boost-author {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 8rpx;
}

.boost-author-avatar { font-size: 28rpx; }
.boost-author-name {
  font-size: 24rpx;
  color: $neon-cyan;
  font-weight: 500;
}

.boost-content-preview {
  font-size: 22rpx;
  color: $text-secondary;
  line-height: 1.5;
  margin-bottom: 24rpx;
  padding: 12rpx;
  @include glass-effect(0.04);
  border-radius: $radius-md;
}

.boost-presets {
  display: flex;
  gap: 12rpx;
  margin-bottom: 20rpx;
  flex-wrap: wrap;
}

.boost-preset-btn {
  padding: 12rpx 24rpx;
  @include glass-effect(0.06);
  border-radius: $radius-lg;
  cursor: pointer;
  transition: all $transition-fast;

  &:active { transform: scale(0.95); }

  &.selected {
    background: rgba($neon-cyan, 0.15);
    border-color: rgba($neon-cyan, 0.4);
    box-shadow: 0 0 8rpx rgba($neon-cyan, 0.15);
  }

  .preset-value {
    font-size: 26rpx;
    font-weight: 600;
    color: $text-primary;
  }
}

.boost-custom {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.custom-label {
  font-size: 24rpx;
  color: $text-secondary;
  flex-shrink: 0;
}

.custom-input {
  flex: 1;
  padding: 12rpx 16rpx;
  font-size: 26rpx;
  color: $text-primary;
  background: rgba(255, 255, 255, 0.05);
  border: 1rpx solid rgba(255, 255, 255, 0.1);
  border-radius: $radius-md;
}

.boost-submit {
  width: 100%;
  padding: 20rpx;
  text-align: center;
  background: linear-gradient(135deg, rgba($neon-cyan, 0.2), rgba($neon-magenta, 0.15));
  border: 1rpx solid rgba($neon-cyan, 0.3);
  border-radius: $radius-lg;
  cursor: pointer;
  transition: all $transition-fast;

  &:active { transform: scale(0.98); }

  &.disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  .submit-text {
    font-size: 28rpx;
    font-weight: 700;
    color: $neon-cyan;
  }
}

/* ===== 空状态 ===== */
.empty-posts {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;
  gap: 16rpx;

  .empty-icon { font-size: 64rpx; }
  .empty-text {
    font-size: 26rpx;
    color: $text-tertiary;
  }
}
</style>
