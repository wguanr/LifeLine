<template>
  <view class="profile-page">
    <!-- ==================== 顶部个人信息 ==================== -->
    <view class="profile-header">
      <view class="header-top">
        <view class="avatar-circle">
          <text class="avatar-text">{{ userInitial }}</text>
        </view>
        <view class="header-info">
          <view class="name-row">
            <text class="nickname">{{ userStore.currentUser.nickname }}</text>
            <view class="level-badge">
              <text class="level-text">L{{ userStore.currentUser.clearanceLevel }}</text>
            </view>
          </view>
          <text class="bio">{{ userStore.currentUser.bio }}</text>
        </view>
      </view>

      <!-- 资源条 -->
      <view class="resource-row">
        <view class="resource-chip">
          <text class="resource-icon">⏰</text>
          <text class="resource-val">{{ formatNum(userStore.wallet.time) }}</text>
        </view>
        <view class="resource-chip">
          <text class="resource-icon">⚡</text>
          <text class="resource-val">{{ formatNum(userStore.wallet.energy) }}</text>
        </view>
        <view class="resource-chip">
          <text class="resource-icon">💫</text>
          <text class="resource-val">{{ formatNum(userStore.wallet.reputation) }}</text>
        </view>
      </view>

      <!-- 闪亮标签画像 -->
      <view class="tag-cloud" v-if="userStore.credibleTags.length">
        <view
          class="shine-tag"
          v-for="tag in sortedTags"
          :key="tag.tagId"
          :class="getTagTier(tag.credibility)"
          @click="toggleTagDetail(tag.tagId)"
        >
          <text class="shine-tag-icon">{{ tag.icon }}</text>
          <text class="shine-tag-name">{{ tag.name }}</text>
          <!-- 展开明细 -->
          <view class="tag-tooltip" v-if="expandedTagId === tag.tagId">
            <text class="tooltip-score">可信度 {{ tag.credibility }}</text>
            <text class="tooltip-detail">事件 {{ tag.fromActions }} · 物品 {{ tag.fromItems }}</text>
          </view>
        </view>
      </view>
      <view class="tag-cloud-empty" v-else>
        <text class="tag-empty-text">参与更多事件，标签画像将逐渐清晰</text>
      </view>
    </view>

    <!-- ==================== Tab 切换栏 ==================== -->
    <view class="tab-bar">
      <view
        class="tab-item"
        v-for="tab in tabs"
        :key="tab.key"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <text class="tab-icon">{{ tab.icon }}</text>
        <text class="tab-label">{{ tab.label }}</text>
        <text class="tab-count" v-if="tab.count > 0">{{ tab.count }}</text>
      </view>
    </view>

    <!-- ==================== Tab 内容区 ==================== -->
    <view class="tab-content">

      <!-- 藏品 Tab -->
      <view class="tab-panel" v-if="activeTab === 'collection'">
        <view class="collection-grid" v-if="collectionItems.length">
          <view
            class="collection-item"
            v-for="item in collectionItems"
            :key="item.itemId"
            @click="openItemDetail(item)"
          >
            <view class="ci-icon-wrap" :class="item.rarity">
              <text class="ci-icon">{{ item.icon }}</text>
              <view class="ci-qty-badge" v-if="item.quantity > 1">
                <text class="ci-qty-text">{{ item.quantity }}</text>
              </view>
            </view>
            <text class="ci-name">{{ item.name }}</text>
            <view class="ci-rarity" :class="item.rarity">
              <text class="ci-rarity-text">{{ getRarityLabel(item.rarity) }}</text>
            </view>
          </view>
        </view>
        <view class="empty-state" v-else>
          <text class="empty-icon">📦</text>
          <text class="empty-title">暂无藏品</text>
          <text class="empty-desc">在探索页面买入物品，它们会出现在这里</text>
        </view>
      </view>

      <!-- 事件 Tab -->
      <view class="tab-panel" v-if="activeTab === 'events'">
        <view class="event-list" v-if="eventBranches.length">
          <view
            class="event-row"
            v-for="branch in eventBranches"
            :key="branch.eventId"
          >
            <view class="event-dot" :class="{ completed: branch.completed }" />
            <view class="event-info">
              <view class="event-title-row">
                <text class="event-title">{{ branch.eventTitle }}</text>
                <text class="event-status-badge" :class="branch.completed ? 'done' : 'ongoing'">
                  {{ branch.completed ? '已完成' : '进行中' }}
                </text>
              </view>
              <text class="event-choices-count">
                {{ branch.choices.length }} 个选择 · {{ formatTime(branch.startTime) }}
              </text>
              <text class="event-summary" v-if="branch.endingSummary">
                {{ branch.endingSummary }}
              </text>
            </view>
          </view>
        </view>
        <view class="empty-state" v-else>
          <text class="empty-icon">📜</text>
          <text class="empty-title">暂无事件</text>
          <text class="empty-desc">参与探索页面的事件，你的故事将在这里展开</text>
        </view>
      </view>

      <!-- 关注 Tab -->
      <view class="tab-panel" v-if="activeTab === 'following'">
        <view class="following-list" v-if="followedUserList.length">
          <view
            class="following-item"
            v-for="user in followedUserList"
            :key="user.id"
          >
            <view class="fi-avatar">
              <text class="fi-avatar-text">{{ user.avatar || user.nickname.charAt(0) }}</text>
              <view class="fi-level">L{{ user.level }}</view>
            </view>
            <view class="fi-info">
              <view class="fi-name-row">
                <text class="fi-name">{{ user.nickname }}</text>
                <text class="fi-active">{{ getActiveTimeText(user.lastActive) }}</text>
              </view>
              <text class="fi-bio" v-if="user.bio">{{ user.bio }}</text>
              <view class="fi-tags" v-if="user.tags.length">
                <view class="fi-tag" v-for="tag in user.tags" :key="tag.tagId">
                  <text class="fi-tag-icon">{{ tag.icon }}</text>
                  <text class="fi-tag-name">{{ tag.name }}</text>
                  <text class="fi-tag-weight" v-if="tag.weight">{{ tag.weight }}</text>
                </view>
              </view>
              <text class="fi-stance" v-if="user.stance">💬 {{ user.stance }}</text>
            </view>
            <view class="fi-unfollow" @click="handleUnfollow(user.id)">
              <text class="fi-unfollow-text">取消</text>
            </view>
          </view>
        </view>
        <view class="empty-state" v-else>
          <text class="empty-icon">👥</text>
          <text class="empty-title">暂无关注</text>
          <text class="empty-desc">在探索页面关注其他用户，他们会出现在这里</text>
        </view>
      </view>
    </view>

    <!-- ==================== 藏品详情弹窗 ==================== -->
    <view class="detail-overlay" v-if="selectedItem" @click.self="closeItemDetail">
      <view class="detail-modal">
        <view class="dm-header">
          <view class="dm-icon-area" :class="selectedItem.rarity">
            <text class="dm-icon">{{ selectedItem.icon }}</text>
          </view>
          <view class="dm-meta">
            <view class="dm-name-row">
              <text class="dm-name">{{ selectedItem.name }}</text>
              <view class="dm-rarity" :class="selectedItem.rarity">
                <text class="dm-rarity-text">{{ getRarityLabel(selectedItem.rarity) }}</text>
              </view>
            </view>
            <text class="dm-desc">{{ selectedItem.description }}</text>
            <text class="dm-qty">拥有 {{ selectedItem.quantity }} 件</text>
          </view>
          <view class="dm-close" @click="closeItemDetail">
            <text class="dm-close-text">✕</text>
          </view>
        </view>

        <view class="dm-section" v-if="selectedItem.featureTags.length">
          <text class="dm-section-title">特性标签</text>
          <view class="dm-feature-tags">
            <view
              class="dm-feature-tag"
              v-for="(ft, idx) in selectedItem.featureTags"
              :key="idx"
              :class="'tag-color-' + (idx % 5)"
            >
              <text class="dm-ft-text">{{ ft }}</text>
            </view>
          </view>
        </view>

        <view class="dm-section" v-if="selectedItem.effects.length">
          <text class="dm-section-title">物品效果</text>
          <view class="dm-effects">
            <view class="dm-effect" v-for="(eff, idx) in selectedItem.effects" :key="idx">
              <text class="dm-effect-text">✨ {{ eff.description }}</text>
            </view>
          </view>
        </view>

        <view class="dm-section" v-if="selectedItem.story">
          <text class="dm-section-title">物品故事</text>
          <text class="dm-story">{{ selectedItem.story }}</text>
        </view>

        <view class="dm-section dm-acquire-info">
          <text class="dm-section-title">获取记录</text>
          <view class="dm-info-row">
            <text class="dm-info-label">首次获取</text>
            <text class="dm-info-value">{{ formatTime(selectedItem.acquiredAt) }}</text>
          </view>
          <view class="dm-info-row">
            <text class="dm-info-label">买入价格</text>
            <view class="dm-price">
              <text class="dm-price-val" v-if="selectedItem.mintCost.time">⏰ {{ selectedItem.mintCost.time }}</text>
              <text class="dm-price-val" v-if="selectedItem.mintCost.energy">⚡ {{ selectedItem.mintCost.energy }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useWorldStore } from '@/stores/world'
import { useInfluencerStore } from '@/stores/influencer'
import { mockItems } from '@/data/items'
import { aigcItems } from '@/data/aigc_items'
import { mockUsers } from '@/data/users'
import { getTagDefinition } from '@/data/tags'
import type { Item } from '@/types'

// 合并所有物品定义
const allItemDefs = [...mockItems, ...(aigcItems as any[])]

const userStore = useUserStore()
const worldStore = useWorldStore()
const influencerStore = useInfluencerStore()

// 数字格式化
const formatNum = (n: number): string => {
  if (n >= 100000000) return `约${Math.round(n / 100000000)}亿`
  if (n >= 10000) return `${(n / 10000).toFixed(n >= 100000 ? 0 : 1)}万`
  return String(n)
}

onMounted(() => {
  worldStore.seedDemoData()
})

const userInitial = computed(() => {
  return (userStore.currentUser.nickname || 'U').charAt(0).toUpperCase()
})

// ==================== 标签画像 ====================

const expandedTagId = ref<string | null>(null)

const sortedTags = computed(() => {
  return [...userStore.credibleTags].sort((a, b) => b.credibility - a.credibility)
})

const toggleTagDetail = (tagId: string) => {
  expandedTagId.value = expandedTagId.value === tagId ? null : tagId
}

/** 根据可信度返回标签等级 tier */
const getTagTier = (credibility: number): string => {
  const maxCred = sortedTags.value.length
    ? sortedTags.value[0].credibility
    : 100
  const ratio = credibility / maxCred
  if (ratio >= 0.8) return 'tier-legendary'
  if (ratio >= 0.5) return 'tier-epic'
  if (ratio >= 0.3) return 'tier-rare'
  return 'tier-common'
}

// ==================== Tab 切换 ====================

const activeTab = ref<'collection' | 'events' | 'following'>('collection')

const eventBranches = computed(() => worldStore.worldlineBranches)

/** 关注用户列表 */
const followedUserList = computed(() => {
  const followedIds = [...influencerStore.followedInfluencers]
  const users: Array<{
    id: string
    nickname: string
    avatar: string
    bio: string
    level: number
    tags: Array<{ tagId: string; icon: string; name: string; weight: number }>
    reputation: number
    lastActive: number
    stance: string
    source: 'mock' | 'pool'
  }> = []

  for (const userId of followedIds) {
    // 优先从 mockUsers 中查找
    const mockUser = mockUsers.find(u => u.id === userId)
    if (mockUser) {
      users.push({
        id: mockUser.id,
        nickname: mockUser.nickname,
        avatar: mockUser.avatar || '',
        bio: mockUser.bio || '',
        level: mockUser.clearanceLevel,
        tags: (mockUser.tags || []).slice(0, 3).map(t => {
          const def = getTagDefinition(t.tagId)
          return { tagId: t.tagId, icon: def?.icon || '🏷️', name: def?.name || t.tagId, weight: t.weight }
        }),
        reputation: mockUser.wallet?.reputation || 0,
        lastActive: mockUser.lastActive || mockUser.lastActiveAt || 0,
        stance: '',
        source: 'mock'
      })
      continue
    }

    // 从 influencer 资源池中查找
    for (const pool of Object.values(influencerStore.resourcePools)) {
      const participant = pool.participants[userId]
      if (participant) {
        const latestChoices = participant.choices.slice(-2)
        const stance = latestChoices.map(c => c.choiceText).join(' → ')
        users.push({
          id: userId,
          nickname: participant.nickname,
          avatar: participant.avatar || '',
          bio: participant.bio || '',
          level: 1,
          tags: (participant.topTags || []).slice(0, 3).map(t => ({
            tagId: t.tagId, icon: t.icon, name: t.name, weight: 0
          })),
          reputation: 0,
          lastActive: 0,
          stance,
          source: 'pool'
        })
        break
      }
    }
  }

  return users
})

/** 取消关注 */
const handleUnfollow = (userId: string) => {
  influencerStore.unfollowInfluencer(userId)
  uni.showToast({ title: '已取消关注', icon: 'none' })
}

/** 获取活跃时间文本 */
const getActiveTimeText = (lastActive: number): string => {
  if (!lastActive) return '未知'
  const diff = Date.now() - lastActive
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${Math.floor(diff / 86400000)}天前`
}

const tabs = computed(() => [
  { key: 'collection' as const, icon: '💎', label: '藏品', count: collectionItems.value.length },
  { key: 'events' as const, icon: '📜', label: '事件', count: eventBranches.value.length },
  { key: 'following' as const, icon: '👥', label: '关注', count: followedUserList.value.length }
])

// ==================== 藏品系统 ====================

interface CollectionItem {
  itemId: string
  name: string
  icon: string
  description: string
  rarity: Item['rarity']
  category: Item['category']
  mintCost: { time?: number; energy?: number }
  effects: Item['effects']
  featureTags: string[]
  story: string
  quantity: number
  acquiredAt: number
}

const collectionItems = computed<CollectionItem[]>(() => {
  return userStore.inventory.map(inv => {
    const def = allItemDefs.find(i => i.id === inv.itemId)
    return {
      itemId: inv.itemId,
      name: def?.name || inv.itemId,
      icon: def?.icon || '📦',
      description: def?.description || '',
      rarity: def?.rarity || 'common',
      category: def?.category || 'consumable',
      mintCost: def?.mintCost || {},
      effects: def?.effects || [],
      featureTags: def?.featureTags || [],
      story: def?.story || '',
      quantity: inv.quantity,
      acquiredAt: inv.acquiredAt
    }
  }).sort((a, b) => {
    const rarityOrder: Record<string, number> = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 }
    return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0)
  })
})

const selectedItem = ref<CollectionItem | null>(null)

const openItemDetail = (item: CollectionItem) => {
  selectedItem.value = item
}

const closeItemDetail = () => {
  selectedItem.value = null
}

const getRarityLabel = (rarity: string): string => {
  const labels: Record<string, string> = {
    common: '普通', uncommon: '稀有', rare: '精良', epic: '史诗', legendary: '传说'
  }
  return labels[rarity] || rarity
}

const formatTime = (timestamp: number): string => {
  const d = new Date(timestamp)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>

.profile-page {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  background: $bg-deep;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom, 0px));
  position: relative;

  // 背景氛围光
  &::before {
    content: '';
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background:
      radial-gradient(ellipse at 50% 0%, rgba($neon-magenta, 0.06) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 80%, rgba($neon-cyan, 0.04) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
}

// ==================== 顶部个人信息 ====================

.profile-header {
  position: relative;
  z-index: 1;
  @include glass-effect(0.06);
  padding: calc(40rpx + env(safe-area-inset-top, 0px)) 32rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  border-bottom: 1rpx solid rgba($neon-cyan, 0.1);
}

.header-top {
  display: flex;
  gap: 24rpx;
  align-items: flex-start;
}

.avatar-circle {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba($neon-cyan, 0.3), rgba($neon-magenta, 0.3));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  @include neon-glow($neon-cyan, 0.15);
  border: 3rpx solid rgba($neon-cyan, 0.4);
}

.avatar-text {
  font-size: 52rpx;
  font-weight: 700;
  color: $text-primary;
}

.header-info {
  flex: 1;
  min-width: 0;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.nickname {
  font-size: 36rpx;
  font-weight: bold;
  color: $text-primary;
  @include text-ellipsis(1);
}

.level-badge {
  padding: 4rpx 16rpx;
  background: linear-gradient(135deg, rgba($neon-cyan, 0.3), rgba($neon-cyan, 0.15));
  border: 1rpx solid rgba($neon-cyan, 0.4);
  border-radius: $radius-full;
  flex-shrink: 0;
}

.level-text { font-size: 22rpx; font-weight: bold; color: $neon-cyan; }

.bio {
  font-size: 24rpx;
  color: $text-secondary;
  @include text-ellipsis(2);
}

// 资源条
.resource-row {
  display: flex;
  gap: 12rpx;
}

.resource-chip {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  padding: 12rpx 0;
  @include glass-effect(0.06);
  border-radius: $radius-lg;
}

.resource-icon { font-size: 24rpx; }
.resource-val { font-size: 28rpx; font-weight: 700; color: $text-primary; }

// ==================== 闪亮标签云 ====================

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.tag-cloud-empty {
  padding: 16rpx 0;
}

.tag-empty-text {
  font-size: 24rpx;
  color: $text-tertiary;
}

.shine-tag {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 10rpx 20rpx;
  border-radius: $radius-full;
  transition: all $transition-normal;
  cursor: pointer;

  &:active { transform: scale(0.95); }

  .shine-tag-icon { font-size: 26rpx; }
  .shine-tag-name { font-size: 24rpx; font-weight: 600; }

  // Tier 1: 普通 - 暗色玻璃底
  &.tier-common {
    @include glass-effect(0.06);
    .shine-tag-name { color: $text-secondary; }
  }

  // Tier 2: 稀有 - 蓝色光泽
  &.tier-rare {
    background: linear-gradient(135deg, rgba($color-info, 0.12), rgba($color-info, 0.06));
    border: 1rpx solid rgba($color-info, 0.25);
    .shine-tag-name { color: $color-info; }
  }

  // Tier 3: 史诗 - 洋红发光
  &.tier-epic {
    background: linear-gradient(135deg, rgba($neon-magenta, 0.15), rgba($neon-magenta, 0.08));
    border: 1rpx solid rgba($neon-magenta, 0.3);
    @include neon-glow($neon-magenta, 0.1);
    .shine-tag-name { color: $neon-magenta; font-weight: 700; }
  }

  // Tier 4: 传说 - 琥珀闪耀
  &.tier-legendary {
    background: linear-gradient(135deg, rgba($neon-amber, 0.15), rgba($neon-amber, 0.08));
    background-size: 200% 100%;
    animation: tag-shimmer 3s ease infinite;
    border: 1rpx solid rgba($neon-amber, 0.4);
    @include neon-glow($neon-amber, 0.15);
    .shine-tag-name { color: $neon-amber; font-weight: 800; }
  }
}

@keyframes tag-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

// 标签点击展开的小气泡
.tag-tooltip {
  position: absolute;
  bottom: calc(100% + 12rpx);
  left: 50%;
  transform: translateX(-50%);
  @include glass-effect(0.15);
  border-radius: $radius-lg;
  padding: 12rpx 20rpx;
  white-space: nowrap;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;

  // 小三角
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 8rpx solid transparent;
    border-top-color: rgba(255, 255, 255, 0.15);
  }
}

.tooltip-score {
  font-size: 24rpx;
  font-weight: 700;
  color: $text-primary;
}

.tooltip-detail {
  font-size: 20rpx;
  color: $text-secondary;
}

// ==================== Tab 切换栏 ====================

.tab-bar {
  position: relative;
  z-index: 1;
  display: flex;
  @include glass-effect(0.06);
  margin-top: 2rpx;
  padding: 0 16rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.06);
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 24rpx 0;
  position: relative;
  transition: all $transition-fast;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 20%;
    right: 20%;
    height: 4rpx;
    border-radius: 4rpx;
    background: transparent;
    transition: all $transition-normal;
  }

  &.active {
    &::after {
      background: $neon-cyan;
      box-shadow: 0 0 8rpx rgba($neon-cyan, 0.4);
    }
    .tab-icon { transform: scale(1.1); }
    .tab-label { color: $neon-cyan; font-weight: 700; }
    .tab-count { background: rgba($neon-cyan, 0.2); color: $neon-cyan; }
  }

  &:active { opacity: 0.7; }
}

.tab-icon {
  font-size: 28rpx;
  transition: transform $transition-fast;
}

.tab-label {
  font-size: 26rpx;
  font-weight: 500;
  color: $text-secondary;
  transition: all $transition-fast;
}

.tab-count {
  font-size: 20rpx;
  font-weight: 700;
  color: $text-tertiary;
  @include glass-effect(0.06);
  padding: 2rpx 12rpx;
  border-radius: $radius-full;
  min-width: 32rpx;
  text-align: center;
  transition: all $transition-fast;
}

// ==================== Tab 内容区 ====================

.tab-content {
  position: relative;
  z-index: 1;
  min-height: 400rpx;
}

.tab-panel {
  padding: 24rpx;
}

// ==================== 藏品网格 ====================

.collection-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.collection-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 12rpx;
  @include glass-effect(0.06);
  border-radius: $radius-xl;
  gap: 10rpx;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.95);
    background: rgba(255, 255, 255, 0.1);
  }
}

.ci-icon-wrap {
  width: 100rpx;
  height: 100rpx;
  border-radius: $radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &.common { @include glass-effect(0.08); }
  &.uncommon { background: rgba($rarity-uncommon, 0.1); border: 1rpx solid rgba($rarity-uncommon, 0.2); }
  &.rare { background: rgba($rarity-rare, 0.1); border: 1rpx solid rgba($rarity-rare, 0.2); }
  &.epic { background: rgba($rarity-epic, 0.1); border: 1rpx solid rgba($rarity-epic, 0.2); @include neon-glow($rarity-epic, 0.08); }
  &.legendary { background: rgba($rarity-legendary, 0.1); border: 1rpx solid rgba($rarity-legendary, 0.2); @include neon-glow($rarity-legendary, 0.1); }
}

.ci-icon { font-size: 48rpx; }

.ci-qty-badge {
  position: absolute;
  top: -6rpx;
  right: -6rpx;
  background: $neon-cyan;
  border-radius: $radius-full;
  min-width: 36rpx;
  height: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
  border: 3rpx solid $bg-deep;
}

.ci-qty-text { font-size: 20rpx; font-weight: bold; color: $text-on-neon; }

.ci-name {
  font-size: 24rpx;
  font-weight: 600;
  color: $text-primary;
  text-align: center;
  max-width: 100%;
  @include text-ellipsis(1);
}

.ci-rarity {
  padding: 2rpx 12rpx;
  border-radius: $radius-full;
  &.common { @include glass-effect(0.06); .ci-rarity-text { color: $text-tertiary; } }
  &.uncommon { background: rgba($rarity-uncommon, 0.1); .ci-rarity-text { color: $rarity-uncommon; } }
  &.rare { background: rgba($rarity-rare, 0.1); .ci-rarity-text { color: $rarity-rare; } }
  &.epic { background: rgba($rarity-epic, 0.1); .ci-rarity-text { color: $rarity-epic; } }
  &.legendary { background: rgba($rarity-legendary, 0.1); .ci-rarity-text { color: $rarity-legendary; } }
}

.ci-rarity-text { font-size: 18rpx; font-weight: 600; }

// ==================== 事件列表 ====================

.event-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.event-row {
  display: flex;
  gap: 20rpx;
  align-items: flex-start;
}

.event-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
  margin-top: 10rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.1);

  &.completed {
    background: $color-success;
    border-color: rgba($color-success, 0.3);
    box-shadow: 0 0 8rpx rgba($color-success, 0.3);
  }
}

.event-info {
  flex: 1;
  min-width: 0;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.06);
}

.event-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 6rpx;
}

.event-title {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  @include text-ellipsis(1);
}

.event-status-badge {
  font-size: 20rpx;
  font-weight: 600;
  padding: 2rpx 12rpx;
  border-radius: $radius-full;
  flex-shrink: 0;

  &.done {
    background: rgba($color-success, 0.12);
    color: $color-success;
  }
  &.ongoing {
    background: rgba($neon-cyan, 0.12);
    color: $neon-cyan;
  }
}

.event-choices-count {
  font-size: 22rpx;
  color: $text-tertiary;
  display: block;
  margin-bottom: 4rpx;
}

.event-summary {
  font-size: 24rpx;
  color: $text-secondary;
  @include text-ellipsis(2);
}

// ==================== 空状态 ====================

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64rpx 0;
  gap: 12rpx;
}

.empty-icon { font-size: 64rpx; }
.empty-title { font-size: 28rpx; font-weight: 600; color: $text-secondary; }
.empty-desc { font-size: 24rpx; color: $text-tertiary; text-align: center; max-width: 400rpx; }

// ==================== 藏品详情弹窗 ====================

.detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.detail-modal {
  width: 100%;
  max-width: 480px;
  max-height: 85vh;
  background: $bg-elevated;
  border-radius: 32rpx 32rpx 0 0;
  padding: 40rpx 32rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom, 0px));
  overflow-y: auto;
  border-top: 1rpx solid rgba($neon-cyan, 0.15);
}

.dm-header {
  display: flex;
  gap: 20rpx;
  align-items: flex-start;
  margin-bottom: 32rpx;
}

.dm-icon-area {
  width: 120rpx;
  height: 120rpx;
  border-radius: $radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.common { @include glass-effect(0.08); }
  &.uncommon { background: rgba($rarity-uncommon, 0.1); border: 1rpx solid rgba($rarity-uncommon, 0.2); }
  &.rare { background: rgba($rarity-rare, 0.1); border: 1rpx solid rgba($rarity-rare, 0.2); }
  &.epic { background: rgba($rarity-epic, 0.1); border: 1rpx solid rgba($rarity-epic, 0.2); @include neon-glow($rarity-epic, 0.1); }
  &.legendary { background: rgba($rarity-legendary, 0.1); border: 1rpx solid rgba($rarity-legendary, 0.2); @include neon-glow($rarity-legendary, 0.15); }
}

.dm-icon { font-size: 56rpx; }
.dm-meta { flex: 1; min-width: 0; }

.dm-name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.dm-name { font-size: 34rpx; font-weight: bold; color: $text-primary; }

.dm-rarity {
  padding: 4rpx 14rpx;
  border-radius: $radius-full;
  &.common { @include glass-effect(0.06); .dm-rarity-text { color: $text-tertiary; } }
  &.uncommon { background: rgba($rarity-uncommon, 0.1); .dm-rarity-text { color: $rarity-uncommon; } }
  &.rare { background: rgba($rarity-rare, 0.1); .dm-rarity-text { color: $rarity-rare; } }
  &.epic { background: rgba($rarity-epic, 0.1); .dm-rarity-text { color: $rarity-epic; } }
  &.legendary { background: rgba($rarity-legendary, 0.1); .dm-rarity-text { color: $rarity-legendary; } }
}

.dm-rarity-text { font-size: 22rpx; font-weight: 600; }
.dm-desc { font-size: 26rpx; color: $text-secondary; line-height: 1.5; display: block; margin-bottom: 6rpx; }
.dm-qty { font-size: 24rpx; color: $neon-cyan; font-weight: 600; }

.dm-close {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  @include glass-effect(0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dm-close-text { font-size: 28rpx; color: $text-secondary; }

.dm-section {
  padding: 24rpx 0;
  border-top: 1rpx solid rgba(255, 255, 255, 0.06);
}

.dm-section-title {
  font-size: 26rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 16rpx;
  display: block;
}

.dm-feature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.dm-feature-tag {
  padding: 10rpx 24rpx;
  border-radius: $radius-full;

  &.tag-color-0 { background: rgba($neon-cyan, 0.08); .dm-ft-text { color: $neon-cyan; } }
  &.tag-color-1 { background: rgba($neon-magenta, 0.08); .dm-ft-text { color: $neon-magenta; } }
  &.tag-color-2 { background: rgba($neon-amber, 0.08); .dm-ft-text { color: $neon-amber; } }
  &.tag-color-3 { background: rgba($color-danger, 0.08); .dm-ft-text { color: $color-danger; } }
  &.tag-color-4 { background: rgba($color-info, 0.08); .dm-ft-text { color: $color-info; } }
}

.dm-ft-text { font-size: 26rpx; font-weight: 500; }

.dm-effects {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.dm-effect-text { font-size: 26rpx; color: $color-success; }

.dm-story {
  font-size: 26rpx;
  color: $text-secondary;
  line-height: 1.8;
  text-align: justify;
}

.dm-acquire-info {
  .dm-info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8rpx 0;
  }
}

.dm-info-label { font-size: 24rpx; color: $text-tertiary; }
.dm-info-value { font-size: 24rpx; font-weight: 600; color: $text-secondary; }

.dm-price {
  display: flex;
  gap: 12rpx;
}

.dm-price-val { font-size: 24rpx; font-weight: 600; color: $text-primary; }

// ==================== 关注列表 ====================

.following-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.following-item {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  padding: 20rpx;
  @include glass-effect(0.06);
  border-radius: $radius-xl;
  transition: all 0.2s ease;

  &:active {
    background: rgba(255, 255, 255, 0.1);
  }
}

.fi-avatar {
  position: relative;
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba($neon-cyan, 0.3), rgba($neon-magenta, 0.3));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2rpx solid rgba($neon-cyan, 0.3);
}

.fi-avatar-text {
  font-size: 40rpx;
}

.fi-level {
  position: absolute;
  bottom: -4rpx;
  right: -4rpx;
  background: $neon-cyan;
  color: $text-on-neon;
  font-size: 16rpx;
  font-weight: 700;
  padding: 2rpx 8rpx;
  border-radius: $radius-full;
  border: 2rpx solid $bg-deep;
}

.fi-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.fi-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.fi-name {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  @include text-ellipsis(1);
}

.fi-active {
  font-size: 20rpx;
  color: $text-tertiary;
  flex-shrink: 0;
}

.fi-bio {
  font-size: 22rpx;
  color: $text-secondary;
  @include text-ellipsis(2);
}

.fi-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 4rpx;
}

.fi-tag {
  display: flex;
  align-items: center;
  gap: 4rpx;
  @include glass-effect(0.06);
  padding: 4rpx 12rpx;
  border-radius: $radius-full;
}

.fi-tag-icon {
  font-size: 18rpx;
}

.fi-tag-name {
  font-size: 18rpx;
  color: $text-secondary;
}

.fi-tag-weight {
  font-size: 16rpx;
  color: $text-tertiary;
  font-weight: 600;
}

.fi-stance {
  font-size: 22rpx;
  color: $neon-cyan;
  margin-top: 4rpx;
  @include text-ellipsis(1);
}

.fi-unfollow {
  flex-shrink: 0;
  padding: 10rpx 20rpx;
  border-radius: $radius-lg;
  @include glass-effect(0.08);
  align-self: center;
  transition: all 0.2s ease;

  &:active {
    background: rgba($color-danger, 0.15);
    transform: scale(0.95);
  }
}

.fi-unfollow-text {
  font-size: 22rpx;
  font-weight: 500;
  color: $text-secondary;
}
</style>
