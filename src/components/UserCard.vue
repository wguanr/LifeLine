<template>
  <view class="user-card">
    <!-- 头像 + 用户信息区 -->
    <view class="profile-header">
      <view class="avatar-area">
        <view class="avatar-ring" :class="'ring-level-' + Math.min(user.clearanceLevel, 5)">
          <view class="avatar-inner">
            <text class="avatar-char" v-if="user.avatar">{{ user.avatar }}</text>
            <text class="avatar-char" v-else>{{ user.nickname.charAt(0) }}</text>
          </view>
        </view>
        <view class="online-dot" v-if="isRecentlyActive"></view>
      </view>
      <view class="profile-info">
        <view class="name-line">
          <text class="user-name">{{ user.nickname }}</text>
          <view class="level-pill" :class="'pill-level-' + Math.min(user.clearanceLevel, 5)">
            <text class="level-text">L{{ user.clearanceLevel }}</text>
          </view>
        </view>
        <text class="user-bio">{{ user.bio || '这个人很懒，什么都没写~' }}</text>
        <text class="active-time">{{ activeTimeText }}</text>
      </view>
    </view>

    <!-- 座右铭 -->
    <view class="motto-bar" v-if="user.motto">
      <view class="motto-accent"></view>
      <text class="motto-prefix">偶于：</text>
      <text class="motto-text">{{ user.motto }}</text>
    </view>

    <!-- 标签药丸 -->
    <view class="tag-row" v-if="user.tags && user.tags.length">
      <view 
        class="tag-pill" 
        v-for="(tag, idx) in user.tags.slice(0, 4)" 
        :key="tag.tagId"
        :class="'pill-color-' + (idx % 4)"
      >
        <text class="tag-label">{{ getTagName(tag.tagId) }}</text>
      </view>
    </view>

    <!-- 统计四格 -->
    <view class="stats-row">
      <view class="stat-cell">
        <text class="stat-title">标签</text>
        <text class="stat-num">{{ user.tags?.length || 0 }}</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-cell">
        <text class="stat-title">事件</text>
        <text class="stat-num">{{ user.history?.completedEvents?.length || 0 }}</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-cell">
        <text class="stat-title">声望</text>
        <text class="stat-num">{{ user.wallet?.reputation || 0 }}</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-cell">
        <text class="stat-title">道具</text>
        <text class="stat-num">{{ user.inventory?.length || 0 }}</text>
      </view>
    </view>

    <!-- 宝物展示 -->
    <view class="showcase-section" v-if="bestItems.length > 0">
      <text class="section-title">宝物展示</text>
      <view class="showcase-grid">
        <view 
          class="showcase-item" 
          v-for="item in bestItems" 
          :key="item.id"
          :class="'border-' + item.rarity"
        >
          <view class="item-icon-box" :class="'bg-' + item.rarity">
            <text class="item-emoji">{{ item.icon }}</text>
          </view>
          <text class="item-label">{{ item.name }}</text>
        </view>
      </view>
    </view>

    <!-- 成就概念 -->
    <view class="achievements-section" v-if="achievementBadges.length > 0">
      <text class="section-title">成就概念</text>
      <scroll-view class="badge-scroll" scroll-x>
        <view class="badge-track">
          <view 
            class="badge-pill" 
            v-for="badge in achievementBadges" 
            :key="badge.id"
          >
            <text class="badge-icon">{{ badge.icon }}</text>
            <text class="badge-name">{{ badge.name }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
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

const isFollowed = computed(() => {
  return influencerStore.isFollowing(props.user.id)
})

const rarityOrder: Record<string, number> = {
  legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1
}

const bestItems = computed(() => {
  if (!props.user.inventory?.length) return []
  const resolved = props.user.inventory
    .map(inv => {
      const itemDef = itemStore.getItemById(inv.itemId)
      if (!itemDef) return null
      return { id: itemDef.id, name: itemDef.name, icon: itemDef.icon, rarity: itemDef.rarity, quantity: inv.quantity }
    })
    .filter(Boolean) as Array<{ id: string; name: string; icon: string; rarity: string; quantity: number }>
  resolved.sort((a, b) => (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0))
  return resolved.slice(0, 3)
})

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

const achievementBadges = computed(() => {
  const achievements = props.user.history?.achievements || []
  return achievements
    .map(id => {
      const def = achievementDefs[id]
      return def ? { id, ...def } : { id, icon: '🏅', name: id }
    })
    .slice(0, 6)
})

// 主操作：关注/取消关注
const handleFollow = () => {
  if (isFollowed.value) {
    influencerStore.unfollowInfluencer(props.user.id)
    uni.showToast({ title: '已取消关注', icon: 'none' })
  } else {
    influencerStore.followInfluencer(props.user.id, props.user.nickname, props.user.avatar)
    uni.showToast({ title: `已关注 ${props.user.nickname}`, icon: 'none' })
  }
  emit('follow', props.user)
}

// 主操作按钮文字
const primaryActionText = computed(() => {
  return isFollowed.value ? '✓ 已关注' : '👋 关注'
})

// 主操作按钮是否禁用
const primaryActionDisabled = computed(() => false)

// 暴露给父组件的接口
defineExpose({
  handleFollow,
  handlePrimaryAction: handleFollow,
  primaryActionText,
  primaryActionDisabled,
  isFollowed
})
</script>

<style lang="scss" scoped>
@import '@/styles/theme.scss';

// ==================== 卡片根容器 ====================
.user-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 28rpx;
  box-sizing: border-box;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

// ==================== 头像 + 信息区 ====================
.profile-header {
  display: flex;
  align-items: flex-start;
  gap: 24rpx;
  margin-bottom: 24rpx;
  flex-shrink: 0;
}

.avatar-area {
  position: relative;
  flex-shrink: 0;
}

.avatar-ring {
  width: 128rpx;
  height: 128rpx;
  border-radius: 50%;
  padding: 4rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $neon-cyan, $neon-magenta);

  &.ring-level-0 { background: rgba(255,255,255,0.2); }
  &.ring-level-1 { background: linear-gradient(135deg, $color-success, rgba($color-success, 0.4)); }
  &.ring-level-2 { background: linear-gradient(135deg, $neon-cyan, rgba($neon-cyan, 0.4)); }
  &.ring-level-3 { background: linear-gradient(135deg, $neon-magenta, rgba($neon-cyan, 0.4)); }
  &.ring-level-4 { background: linear-gradient(135deg, $neon-amber, rgba($neon-magenta, 0.4)); }
  &.ring-level-5 { background: linear-gradient(135deg, $color-danger, $neon-amber); }
}

.avatar-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: $bg-elevated;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-char {
  font-size: 52rpx;
  color: $text-primary;
}

.online-dot {
  position: absolute;
  bottom: 6rpx;
  right: 6rpx;
  width: 22rpx;
  height: 22rpx;
  border-radius: 50%;
  background: $color-success;
  border: 3rpx solid $bg-elevated;
  box-shadow: 0 0 8rpx rgba($color-success, 0.6);
}

.profile-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  padding-top: 8rpx;
}

.name-line {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.user-name {
  font-size: 34rpx;
  font-weight: 700;
  color: $text-primary;
  @include text-ellipsis(1);
}

.level-pill {
  padding: 2rpx 14rpx;
  border-radius: $radius-full;
  flex-shrink: 0;

  &.pill-level-0 { background: rgba(255,255,255,0.15); }
  &.pill-level-1 { background: rgba($color-success, 0.7); }
  &.pill-level-2 { background: rgba($neon-cyan, 0.7); }
  &.pill-level-3 { background: linear-gradient(135deg, $neon-magenta, rgba($neon-cyan, 0.6)); }
  &.pill-level-4 { background: linear-gradient(135deg, $neon-amber, $neon-magenta); }
  &.pill-level-5 { background: linear-gradient(135deg, $color-danger, $neon-amber); }

  .level-text {
    font-size: 22rpx;
    font-weight: 700;
    color: #fff;
  }
}

.user-bio {
  font-size: 24rpx;
  color: $text-secondary;
  line-height: 1.5;
  @include text-ellipsis(2);
}

.active-time {
  font-size: 22rpx;
  color: $text-tertiary;
}

// ==================== 座右铭 ====================
.motto-bar {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 20rpx;
  margin-bottom: 20rpx;
  border-radius: $radius-lg;
  background: linear-gradient(135deg, rgba($neon-magenta, 0.06), rgba($neon-magenta, 0.02));
  flex-shrink: 0;
}

.motto-accent {
  width: 4rpx;
  height: 32rpx;
  border-radius: 2rpx;
  background: $neon-magenta;
  flex-shrink: 0;
  box-shadow: 0 0 8rpx rgba($neon-magenta, 0.5);
}

.motto-prefix {
  font-size: 24rpx;
  color: $neon-magenta;
  flex-shrink: 0;
  font-weight: 600;
}

.motto-text {
  font-size: 24rpx;
  color: $text-secondary;
  line-height: 1.5;
  @include text-ellipsis(2);
}

// ==================== 标签药丸 ====================
.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 20rpx;
  flex-shrink: 0;
}

.tag-pill {
  padding: 8rpx 24rpx;
  border-radius: $radius-full;
  border: 1.5rpx solid transparent;

  &.pill-color-0 {
    background: rgba($color-success, 0.1);
    border-color: rgba($color-success, 0.4);
    .tag-label { color: $color-success; }
  }
  &.pill-color-1 {
    background: rgba($neon-magenta, 0.1);
    border-color: rgba($neon-magenta, 0.4);
    .tag-label { color: $neon-magenta; }
  }
  &.pill-color-2 {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.25);
    .tag-label { color: $text-primary; }
  }
  &.pill-color-3 {
    background: rgba($neon-cyan, 0.1);
    border-color: rgba($neon-cyan, 0.4);
    .tag-label { color: $neon-cyan; }
  }
}

.tag-label {
  font-size: 24rpx;
  font-weight: 600;
}

// ==================== 统计四格 ====================
.stats-row {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  margin-bottom: 20rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.06);
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.stat-cell {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.stat-title {
  font-size: 22rpx;
  color: $text-tertiary;
}

.stat-num {
  font-size: 36rpx;
  font-weight: 700;
  color: $text-primary;
}

.stat-divider {
  width: 1rpx;
  height: 48rpx;
  background: rgba(255, 255, 255, 0.08);
}

// ==================== 宝物展示 ====================
.showcase-section {
  margin-bottom: 20rpx;
  flex-shrink: 0;
}

.section-title {
  font-size: 26rpx;
  font-weight: 600;
  color: $text-secondary;
  margin-bottom: 16rpx;
  display: block;
}

.showcase-grid {
  display: flex;
  gap: 12rpx;
}

.showcase-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  padding: 20rpx 12rpx;
  border-radius: $radius-lg;
  border: 1.5rpx solid transparent;
  background: rgba(255, 255, 255, 0.03);
  position: relative;
  overflow: hidden;

  &.border-legendary {
    border-color: rgba($rarity-legendary, 0.5);
    background: linear-gradient(180deg, rgba($rarity-legendary, 0.08) 0%, rgba($rarity-legendary, 0.02) 100%);
    &::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3rpx;
      background: $rarity-legendary;
      box-shadow: 0 0 12rpx rgba($rarity-legendary, 0.6);
    }
  }
  &.border-epic {
    border-color: rgba($rarity-epic, 0.5);
    background: linear-gradient(180deg, rgba($rarity-epic, 0.08) 0%, rgba($rarity-epic, 0.02) 100%);
    &::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3rpx;
      background: $rarity-epic;
      box-shadow: 0 0 12rpx rgba($rarity-epic, 0.6);
    }
  }
  &.border-rare {
    border-color: rgba($rarity-rare, 0.4);
    background: linear-gradient(180deg, rgba($rarity-rare, 0.06) 0%, rgba($rarity-rare, 0.02) 100%);
  }
  &.border-uncommon {
    border-color: rgba($rarity-uncommon, 0.3);
    background: linear-gradient(180deg, rgba($rarity-uncommon, 0.05) 0%, rgba($rarity-uncommon, 0.01) 100%);
  }
  &.border-common {
    border-color: rgba(255, 255, 255, 0.1);
  }
}

.item-icon-box {
  width: 80rpx;
  height: 80rpx;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;

  &.bg-legendary { background: rgba($rarity-legendary, 0.15); }
  &.bg-epic { background: rgba($rarity-epic, 0.15); }
  &.bg-rare { background: rgba($rarity-rare, 0.12); }
  &.bg-uncommon { background: rgba($rarity-uncommon, 0.1); }
  &.bg-common { background: rgba(255, 255, 255, 0.06); }
}

.item-emoji {
  font-size: 36rpx;
}

.item-label {
  font-size: 22rpx;
  color: $text-secondary;
  text-align: center;
  @include text-ellipsis(1);
  max-width: 100%;
}

// ==================== 成就概念 ====================
.achievements-section {
  margin-bottom: 16rpx;
  flex-shrink: 0;
}

.badge-scroll {
  white-space: nowrap;
}

.badge-track {
  display: inline-flex;
  gap: 12rpx;
}

.badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 20rpx;
  border-radius: $radius-full;
  background: linear-gradient(135deg, rgba($neon-amber, 0.1), rgba($neon-amber, 0.04));
  border: 1rpx solid rgba($neon-amber, 0.25);
  white-space: nowrap;

  .badge-icon { font-size: 24rpx; }
  .badge-name { font-size: 22rpx; font-weight: 600; color: $neon-amber; }
}
</style>
