<template>
  <view class="community-page">
    <!-- ==================== 话题列表视图 ==================== -->
    <TopicListView
      v-if="!communityStore.currentTopicId"
      @enter="onEnterTopic"
    />

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
            v-for="(post, idx) in communityStore.currentTopicPosts"
            :key="post.id"
            class="post-card"
            :class="{ 'post-new': justPostedIds.has(post.id) }"
            :style="{ animationDelay: justPostedIds.has(post.id) ? '0ms' : (idx * 30) + 'ms' }"
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
                  <text v-if="!communityStore.userLikedPostIds.has(post.id)" class="action-cost">⏱{{ COMMUNITY_COSTS.like.time }}</text>
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
                  :class="{ 'post-new': justPostedIds.has(reply.id) }"
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
      <BoostPanel
        :post="boostingPost"
        @cancel="cancelBoost"
        @submit="onBoostSubmit"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useCommunityStore, COMMUNITY_COSTS } from '@/stores/community'
import type { TopicPost } from '@/types'
import { formatRelativeTime, formatPool } from '@/utils/formatters'
import TopicListView from '@/components/community/TopicListView.vue'
import BoostPanel from '@/components/community/BoostPanel.vue'

const communityStore = useCommunityStore()

// ==================== 导航 ====================

function onEnterTopic(topicId: string) {
  communityStore.enterTopic(topicId)
}

function onLeaveTopic() {
  communityStore.leaveTopic()
}

// ==================== 动画状态 ====================

const justPostedIds = reactive(new Set<string>())

function markNewPost(postId: string) {
  justPostedIds.add(postId)
  setTimeout(() => justPostedIds.delete(postId), 600)
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
  const postsBefore = communityStore.currentTopicPosts.map(p => p.id)
  const success = communityStore.createPost(communityStore.currentTopicId, composeContent.value.trim())
  if (success) {
    const newPost = communityStore.currentTopicPosts.find(p => !postsBefore.includes(p.id))
    if (newPost) markNewPost(newPost.id)
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
  expandedReplies.value.add(post.id)
}

function cancelReply() {
  replyingTo.value = null
  replyContent.value = ''
}

function submitReply(parentPost: TopicPost) {
  if (!replyContent.value.trim() || !communityStore.currentTopicId) return
  const repliesBefore = communityStore.getReplies(parentPost.id).map(r => r.id)
  const success = communityStore.replyToPost(
    communityStore.currentTopicId,
    parentPost.id,
    replyContent.value.trim()
  )
  if (success) {
    const newReply = communityStore.getReplies(parentPost.id).find(r => !repliesBefore.includes(r.id))
    if (newReply) markNewPost(newReply.id)
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

function onStartBoost(post: TopicPost) {
  boostingPost.value = post
}

function cancelBoost() {
  boostingPost.value = null
}

function onBoostSubmit(amount: number) {
  if (!boostingPost.value || !communityStore.currentTopicId) return
  const success = communityStore.boostPost(
    communityStore.currentTopicId,
    boostingPost.value.id,
    amount
  )
  if (success) {
    uni.showToast({ title: `助力成功 +${amount}`, icon: 'success' })
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
  padding: 6rpx 14rpx;
  @include glass-effect(0.08);
  border-radius: $radius-full;
  flex-shrink: 0;

  .pool-icon { font-size: 20rpx; }
  .pool-value {
    font-size: 24rpx;
    font-weight: 700;
    color: $neon-amber;
  }
}

/* ===== 话题信息区 ===== */
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

/* ===== 发帖区 ===== */
.compose-section {
  padding: 16rpx 24rpx;
}

.compose-trigger {
  padding: 20rpx;
  @include glass-card;
  cursor: pointer;

  &:active { transform: scale(0.99); }
}

.compose-placeholder {
  font-size: 26rpx;
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
  padding-top: 12rpx;
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
  padding: 8rpx 20rpx;
  font-size: 24rpx;
  color: $text-secondary;
  @include glass-effect(0.06);
  border-radius: $radius-lg;
  cursor: pointer;
}

.btn-submit {
  padding: 8rpx 24rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: $neon-cyan;
  background: rgba($neon-cyan, 0.12);
  border: 1rpx solid rgba($neon-cyan, 0.3);
  border-radius: $radius-lg;
  cursor: pointer;

  &.disabled {
    opacity: 0.4;
    pointer-events: none;
  }
}

/* ===== 帖子列表 ===== */
.post-scroll {
  flex: 1;
  min-height: 0;
}

.post-list {
  padding: 16rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.post-card {
  @include glass-card;
  padding: 20rpx;
  transition: all 0.3s ease;
}

.post-new {
  animation: postSlideIn 0.5s ease-out forwards;
}

@keyframes postSlideIn {
  0% {
    opacity: 0;
    transform: translateY(-20rpx) scale(0.97);
    box-shadow: 0 0 20rpx rgba($neon-cyan, 0.4);
  }
  60% {
    opacity: 1;
    transform: translateY(4rpx) scale(1.01);
    box-shadow: 0 0 30rpx rgba($neon-cyan, 0.6);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    box-shadow: none;
  }
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
  gap: 6rpx;
  padding: 6rpx 12rpx;
  background: rgba($neon-amber, 0.1);
  border: 1rpx solid rgba($neon-amber, 0.2);
  border-radius: $radius-full;

  .value-icon { font-size: 18rpx; }
  .value-num {
    font-size: 22rpx;
    font-weight: 700;
    color: $neon-amber;
  }
}

.post-content {
  font-size: 26rpx;
  color: $text-primary;
  line-height: 1.7;
  margin-bottom: 16rpx;
}

/* ===== 帖子操作栏 ===== */
.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.06);
}

.post-time {
  .time-text {
    font-size: 22rpx;
    color: $text-tertiary;
  }
}

.action-group {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 6rpx 12rpx;
  border-radius: $radius-lg;
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
  .action-cost {
    font-size: 18rpx;
    color: rgba(0, 200, 200, 0.5);
    margin-left: 4rpx;
  }
}

/* ===== 回复区域 ===== */
.replies-section {
  margin-top: 12rpx;
  padding-top: 12rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.04);
}

.replies-toggle {
  padding: 8rpx 0;
  cursor: pointer;

  .toggle-text {
    font-size: 22rpx;
    color: $neon-cyan;
    font-weight: 500;
  }
}

.reply-list {
  padding: 8rpx 0;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.reply-item {
  display: flex;
  gap: 10rpx;
  padding: 10rpx 12rpx;
  @include glass-effect(0.03);
  border-radius: $radius-md;
}

.reply-avatar {
  font-size: 28rpx;
  flex-shrink: 0;
}

.reply-body {
  flex: 1;
  min-width: 0;
}

.reply-meta {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 4rpx;
}

.reply-name {
  font-size: 22rpx;
  font-weight: 600;
  color: $neon-cyan;
}

.reply-time {
  font-size: 20rpx;
  color: $text-tertiary;
}

.reply-content {
  font-size: 24rpx;
  color: $text-secondary;
  line-height: 1.5;
}

/* ===== 回复输入 ===== */
.reply-compose {
  margin-top: 10rpx;
  padding: 12rpx;
  @include glass-effect(0.04);
  border-radius: $radius-md;
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
