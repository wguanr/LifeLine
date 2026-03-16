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

      <!-- 座右铭 -->
      <view class="motto-section" v-if="user.motto">
        <view class="motto-card">
          <text class="motto-quote-mark">"</text>
          <text class="motto-text">{{ user.motto }}</text>
          <text class="motto-quote-mark end">"</text>
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

      <!-- 最佳藏品展示 -->
      <view class="best-items-section" v-if="bestItems.length > 0">
        <text class="section-label">🏆 珍藏展柜</text>
        <view class="best-items-row">
          <view 
            class="best-item" 
            v-for="item in bestItems" 
            :key="item.id"
            :class="'rarity-' + item.rarity"
          >
            <view class="item-icon-wrap" :class="'rarity-bg-' + item.rarity">
              <text class="item-icon">{{ item.icon }}</text>
            </view>
            <text class="item-name">{{ item.name }}</text>
            <view class="rarity-dot" :class="'rarity-' + item.rarity" />
          </view>
        </view>
      </view>

      <!-- 成就徽章 -->
      <view class="achievements-section" v-if="achievementBadges.length > 0">
        <text class="section-label">🎖️ 成就</text>
        <view class="badge-row">
          <view 
            class="badge-chip" 
            v-for="badge in achievementBadges" 
            :key="badge.id"
          >
            <text class="badge-icon">{{ badge.icon }}</text>
            <text class="badge-name">{{ badge.name }}</text>
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
          <text class="hint-text">点击边缘查看详情</text>
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
import { useItemStore } from '@/stores/item'

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
const itemStore = useItemStore()

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

/** 稀有度排序权重 */
const rarityOrder: Record<string, number> = {
  legendary: 5,
  epic: 4,
  rare: 3,
  uncommon: 2,
  common: 1
}

/** 最佳藏品 - 按稀有度排序，展示前3个 */
const bestItems = computed(() => {
  if (!props.user.inventory?.length) return []
  
  const resolved = props.user.inventory
    .map(inv => {
      const itemDef = itemStore.getItemById(inv.itemId)
      if (!itemDef) return null
      return {
        id: itemDef.id,
        name: itemDef.name,
        icon: itemDef.icon,
        rarity: itemDef.rarity,
        quantity: inv.quantity
      }
    })
    .filter(Boolean) as Array<{ id: string; name: string; icon: string; rarity: string; quantity: number }>
  
  // 按稀有度降序排列
  resolved.sort((a, b) => (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0))
  
  return resolved.slice(0, 3)
})

/** 成就徽章定义 */
const achievementDefs: Record<string, { icon: string; name: string }> = {
  first_choice: { icon: '🎯', name: '初次抉择' },
  bookworm: { icon: '📖', name: '书虫' },
  early_adopter: { icon: '🌅', name: '先行者' },
  fitness_master: { icon: '🏋️', name: '健身大师' },
  early_bird: { icon: '🐦', name: '早起鸟' },
  iron_will: { icon: '🔥', name: '钢铁意志' },
  streak_7: { icon: '📅', name: '连续7天' },
  social_star: { icon: '⭐', name: '社交之星' },
  party_king: { icon: '👑', name: '派对之王' },
  wanderer: { icon: '🗺️', name: '漫游者' },
  collector: { icon: '💎', name: '收藏家' }
}

/** 成就徽章列表 */
const achievementBadges = computed(() => {
  const achievements = props.user.history?.achievements || []
  return achievements
    .map(id => {
      const def = achievementDefs[id]
      return def ? { id, ...def } : { id, icon: '🏅', name: id }
    })
    .slice(0, 4)
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
  gap: 16rpx;
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
  border: 2rpx solid rgba(255, 255, 255, 0.1);
  
  &.level-0 { background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03)); }
  &.level-1 { background: linear-gradient(135deg, rgba($color-success, 0.15), rgba($color-success, 0.05)); @include neon-glow($color-success, 0.1); }
  &.level-2 { background: linear-gradient(135deg, rgba($neon-cyan, 0.15), rgba($neon-cyan, 0.05)); @include neon-glow($neon-cyan, 0.1); }
  &.level-3 { background: linear-gradient(135deg, rgba($neon-magenta, 0.15), rgba($neon-magenta, 0.05)); @include neon-glow($neon-magenta, 0.1); }
  &.level-4 { background: linear-gradient(135deg, rgba($neon-amber, 0.15), rgba($neon-amber, 0.05)); @include neon-glow($neon-amber, 0.15); }
  &.level-5 { background: linear-gradient(135deg, rgba($color-danger, 0.15), rgba($neon-amber, 0.1)); @include neon-glow($color-danger, 0.15); }
}

.avatar-emoji { font-size: 52rpx; }
.avatar-initial { font-size: 44rpx; font-weight: 700; color: $text-secondary; }

.level-badge {
  position: absolute;
  bottom: -4rpx;
  right: -4rpx;
  padding: 2rpx 10rpx;
  border-radius: 16rpx;
  border: 2rpx solid rgba(0, 0, 0, 0.3);
  
  &.level-0 { background: rgba(255,255,255,0.2); }
  &.level-1 { background: rgba($color-success, 0.8); @include neon-glow($color-success, 0.2); }
  &.level-2 { background: rgba($neon-cyan, 0.8); @include neon-glow($neon-cyan, 0.2); }
  &.level-3 { background: rgba($neon-magenta, 0.8); @include neon-glow($neon-magenta, 0.2); }
  &.level-4 { background: rgba($neon-amber, 0.8); @include neon-glow($neon-amber, 0.2); }
  &.level-5 { background: rgba($color-danger, 0.8); @include neon-glow($color-danger, 0.2); }
  
  .level-text {
    font-size: 20rpx;
    font-weight: 700;
    color: $text-primary;
  }
}

.online-indicator {
  position: absolute;
  top: 4rpx;
  right: 4rpx;
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background: $color-success;
  border: 2rpx solid $bg-deep;
  animation: pulse-online 2s infinite;
  @include neon-glow($color-success, 0.3);
}

@keyframes pulse-online {
  0%, 100% { box-shadow: 0 0 0 0 rgba($color-success, 0.4); }
  50% { box-shadow: 0 0 0 6rpx rgba($color-success, 0); }
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

// ==================== 座右铭 ====================
.motto-section {
  flex-shrink: 0;
}

.motto-card {
  display: flex;
  align-items: flex-start;
  gap: 4rpx;
  padding: 16rpx 20rpx;
  background: linear-gradient(135deg, rgba($neon-magenta, 0.06), rgba($neon-magenta, 0.02));
  border-radius: 16rpx;
  border-left: 4rpx solid rgba($neon-magenta, 0.5);
  position: relative;
}

.motto-quote-mark {
  font-size: 36rpx;
  font-weight: 700;
  color: $neon-magenta;
  line-height: 1;
  opacity: 0.4;
  flex-shrink: 0;
  
  &.end {
    align-self: flex-end;
  }
}

.motto-text {
  font-size: 24rpx;
  color: $text-secondary;
  line-height: 1.6;
  font-style: italic;
  flex: 1;
  padding: 4rpx 0;
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
  border: 1rpx solid transparent;
  
  &.tag-color-0 { background: rgba($color-success, 0.08); color: $color-success; border-color: rgba($color-success, 0.2); }
  &.tag-color-1 { background: rgba($neon-cyan, 0.08); color: $neon-cyan; border-color: rgba($neon-cyan, 0.2); }
  &.tag-color-2 { background: rgba($color-danger, 0.08); color: $color-danger; border-color: rgba($color-danger, 0.2); }
  &.tag-color-3 { background: rgba($neon-amber, 0.08); color: $neon-amber; border-color: rgba($neon-amber, 0.2); }
  &.tag-color-4 { background: rgba($neon-magenta, 0.08); color: $neon-magenta; border-color: rgba($neon-magenta, 0.2); }
}

.tag-icon { font-size: 24rpx; }
.tag-name { font-weight: 600; }

.tag-weight {
  background: rgba(255, 255, 255, 0.08);
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
  @include glass-effect(0.06);
  border-radius: $radius-lg;
}

.stat-icon { font-size: 28rpx; }
.stat-value { font-size: 32rpx; font-weight: 700; color: $text-primary; }
.stat-label { font-size: 20rpx; color: $text-tertiary; }

// ==================== 最佳藏品 ====================
.best-items-section {
  flex-shrink: 0;
}

.section-label {
  font-size: 24rpx;
  font-weight: 600;
  color: $text-secondary;
  margin-bottom: 12rpx;
  display: block;
}

.best-items-row {
  display: flex;
  gap: 12rpx;
}

.best-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 8rpx;
  border-radius: $radius-lg;
  position: relative;
  @include glass-effect(0.04);
  border: 1rpx solid transparent;
  
  &.rarity-legendary {
    background: linear-gradient(135deg, rgba($rarity-legendary, 0.08), rgba($rarity-legendary, 0.03));
    border-color: rgba($rarity-legendary, 0.25);
    @include neon-glow($rarity-legendary, 0.08);
  }
  &.rarity-epic {
    background: linear-gradient(135deg, rgba($rarity-epic, 0.08), rgba($rarity-epic, 0.03));
    border-color: rgba($rarity-epic, 0.25);
    @include neon-glow($rarity-epic, 0.08);
  }
  &.rarity-rare {
    background: linear-gradient(135deg, rgba($rarity-rare, 0.08), rgba($rarity-rare, 0.03));
    border-color: rgba($rarity-rare, 0.25);
  }
  &.rarity-uncommon {
    background: linear-gradient(135deg, rgba($rarity-uncommon, 0.06), rgba($rarity-uncommon, 0.02));
    border-color: rgba($rarity-uncommon, 0.2);
  }
}

.item-icon-wrap {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.rarity-bg-legendary { background: rgba($rarity-legendary, 0.15); }
  &.rarity-bg-epic { background: rgba($rarity-epic, 0.15); }
  &.rarity-bg-rare { background: rgba($rarity-rare, 0.15); }
  &.rarity-bg-uncommon { background: rgba($rarity-uncommon, 0.15); }
  &.rarity-bg-common { background: rgba(255, 255, 255, 0.06); }
}

.item-icon { font-size: 28rpx; }

.item-name {
  font-size: 20rpx;
  color: $text-secondary;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  font-weight: 500;
}

.rarity-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  
  &.rarity-legendary { background: $rarity-legendary; box-shadow: 0 0 8rpx rgba($rarity-legendary, 0.5); }
  &.rarity-epic { background: $rarity-epic; box-shadow: 0 0 8rpx rgba($rarity-epic, 0.5); }
  &.rarity-rare { background: $rarity-rare; box-shadow: 0 0 8rpx rgba($rarity-rare, 0.5); }
  &.rarity-uncommon { background: $rarity-uncommon; box-shadow: 0 0 8rpx rgba($rarity-uncommon, 0.5); }
  &.rarity-common { background: $rarity-common; }
}

// ==================== 成就徽章 ====================
.achievements-section {
  flex-shrink: 0;
}

.badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.badge-chip {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 14rpx;
  background: linear-gradient(135deg, rgba($neon-amber, 0.08), rgba($neon-amber, 0.03));
  border: 1rpx solid rgba($neon-amber, 0.2);
  border-radius: 20rpx;
  
  .badge-icon {
    font-size: 22rpx;
  }
  
  .badge-name {
    font-size: 20rpx;
    font-weight: 600;
    color: $neon-amber;
  }
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
  background: linear-gradient(135deg, rgba($color-success, 0.06), rgba($color-success, 0.02));
  border-radius: $radius-lg;
  border: 1rpx solid rgba($color-success, 0.2);
}

.shared-icon { font-size: 28rpx; }
.shared-text { font-size: 24rpx; color: $color-success; font-weight: 500; }

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
    background: linear-gradient(135deg, rgba($neon-cyan, 0.2), rgba($neon-cyan, 0.1));
    border: 1rpx solid rgba($neon-cyan, 0.4);
    @include neon-glow($neon-cyan, 0.1);
    
    .btn-text { color: $neon-cyan; }
    
    &:active {
      transform: scale(0.97);
      background: rgba($neon-cyan, 0.25);
    }
  }
  
  &.followed {
    @include glass-effect(0.06);
    
    .btn-text { color: $text-secondary; }
    
    &:active { background: rgba(255, 255, 255, 0.1); }
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
  0%, 100% { opacity: 0.3; transform: translateX(0); }
  50% { opacity: 0.7; transform: translateX(-8rpx); }
}

</style>
