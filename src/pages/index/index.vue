<template>
  <view class="index-container">
    <!-- 顶部状态栏 - 不使用fixed定位 -->
    <view class="status-bar">
      <!-- 左侧：世界切换 -->
      <view class="status-left">
        <WorldTrackSwitch />
      </view>
      
      <!-- 中间：货币/资源显示 -->
      <view class="status-center">
        <view class="wallet-item" v-if="!isChainWorld">
          <text class="wallet-icon">⏰</text>
          <text class="wallet-value">{{ userStore.wallet.time }}</text>
        </view>
        <view class="wallet-item" v-if="!isChainWorld">
          <text class="wallet-icon">⚡</text>
          <text class="wallet-value">{{ userStore.wallet.energy }}</text>
        </view>
        <view class="wallet-item chain-currency" v-if="isChainWorld">
          <text class="wallet-icon">🦋</text>
          <text class="wallet-value">{{ chainWallet.bfc }}</text>
        </view>
        <view class="wallet-item chain-currency" v-if="isChainWorld">
          <text class="wallet-icon">🗳️</text>
          <text class="wallet-value">{{ chainWallet.gov }}</text>
        </view>
      </view>
      
      <!-- 右侧：等级和头像 -->
      <view class="status-right">
        <view class="clearance-badge">
          <text class="clearance-text">L{{ userStore.currentUser.clearanceLevel }}</text>
        </view>
        <view class="user-avatar" @click="goToProfile">
          <text class="avatar-text">{{ userInitial }}</text>
        </view>
      </view>
    </view>
    
    <!-- 卡片流区域 - flex:1 自动填充剩余空间 -->
    <view class="card-area">
      <swiper 
        class="card-swiper"
        :current="cardStore.currentIndex"
        vertical
        circular
        :duration="300"
        :disable-touch="isPanelOpen"
        :easing-function="'default'"
        @change="onSwiperChange"
        @transition="onSwiperTransition"
        @animationfinish="onSwiperAnimationFinish"
      >
        <swiper-item 
          v-for="(card, index) in cardStore.cardQueue" 
          :key="card.id"
          class="swiper-item"
        >
          <view class="card-wrapper">
            <SwipeableCard
              :disabled="isCardActive"
              @swipeLeft="onSwipeLeft(card)"
              @swipeRight="onSwipeRight(card)"
              @action="(action) => onCardAction(card, action)"
              @panelChange="onPanelChange"
            >
              <!-- 主卡片内容 -->
              <EventCard 
                v-if="card.type === 'event'" 
                :event="card.data as GameEvent"
                @stateChange="onEventStateChange"
              />
              
              <ItemCard 
                v-else-if="card.type === 'item'" 
                :item="card.data as Item"
                @click="onItemClick"
                @mint="onItemMint"
                @stateChange="onItemStateChange"
              />
              
              <UserCard 
                v-else-if="card.type === 'user'" 
                :user="card.data as User"
                @click="onUserClick"
                @follow="onUserFollow"
                @viewProfile="onUserViewProfile"
                @stateChange="onUserStateChange"
              />
              
              <!-- 详情面板内容 -->
              <template #detail>
                <!-- 事件详情 -->
                <view v-if="card.type === 'event'" class="detail-content">
                  <view class="detail-section">
                    <text class="section-title">📖 事件简介</text>
                    <text class="section-text">{{ (card.data as GameEvent).description }}</text>
                  </view>
                  <view class="detail-section">
                    <text class="section-title">📊 事件信息</text>
                    <view class="info-grid">
                      <view class="info-item">
                        <text class="info-label">类型</text>
                        <text class="info-value">{{ getEventTypeLabel((card.data as GameEvent).type) }}</text>
                      </view>
                      <view class="info-item">
                        <text class="info-label">参与人数</text>
                        <text class="info-value">{{ (card.data as GameEvent).participantCount?.toLocaleString() || 0 }}</text>
                      </view>
                      <view class="info-item">
                        <text class="info-label">阶段数</text>
                        <text class="info-value">{{ (card.data as GameEvent).stages?.length || 0 }}</text>
                      </view>
                      <view class="info-item">
                        <text class="info-label">状态</text>
                        <text class="info-value">{{ getEventStatusLabel((card.data as GameEvent).status) }}</text>
                      </view>
                    </view>
                  </view>
                  <view class="detail-section" v-if="(card.data as GameEvent).entryCost">
                    <text class="section-title">💰 入场成本</text>
                    <view class="cost-list">
                      <view class="cost-item" v-if="(card.data as GameEvent).entryCost?.time">
                        <text class="cost-icon">⏰</text>
                        <text class="cost-value">{{ (card.data as GameEvent).entryCost?.time }} 分钟</text>
                      </view>
                      <view class="cost-item" v-if="(card.data as GameEvent).entryCost?.energy">
                        <text class="cost-icon">⚡</text>
                        <text class="cost-value">{{ (card.data as GameEvent).entryCost?.energy }} 精力</text>
                      </view>
                    </view>
                  </view>
                  <view class="detail-section" v-if="(card.data as GameEvent).requiredTags?.length">
                    <text class="section-title">🏷️ 需要标签</text>
                    <view class="tag-list">
                      <view class="tag-item" v-for="tag in (card.data as GameEvent).requiredTags" :key="tag">
                        {{ tag }}
                      </view>
                    </view>
                  </view>
                </view>
                
                <!-- 物品详情 -->
                <view v-else-if="card.type === 'item'" class="detail-content">
                  <view class="detail-section">
                    <text class="section-title">📦 物品简介</text>
                    <text class="section-text">{{ (card.data as Item).description }}</text>
                  </view>
                  <view class="detail-section">
                    <text class="section-title">📊 物品信息</text>
                    <view class="info-grid">
                      <view class="info-item">
                        <text class="info-label">稀有度</text>
                        <text class="info-value">{{ getRarityLabel((card.data as Item).rarity) }}</text>
                      </view>
                      <view class="info-item">
                        <text class="info-label">已铸造</text>
                        <text class="info-value">{{ (card.data as Item).mintedCount }} / {{ (card.data as Item).maxMint }}</text>
                      </view>
                    </view>
                  </view>
                  <view class="detail-section" v-if="(card.data as Item).effects?.length">
                    <text class="section-title">✨ 物品效果</text>
                    <view class="effect-list">
                      <view class="effect-item" v-for="(effect, idx) in (card.data as Item).effects" :key="idx">
                        <text class="effect-type">{{ effect.type === 'attribute' ? '属性加成' : '解锁事件' }}</text>
                        <text class="effect-value" v-if="effect.type === 'attribute'">{{ effect.attribute }} +{{ effect.value }}</text>
                        <text class="effect-value" v-else>{{ effect.eventId }}</text>
                      </view>
                    </view>
                  </view>
                </view>
                
                <!-- 用户详情 -->
                <view v-else-if="card.type === 'user'" class="detail-content">
                  <view class="detail-section">
                    <text class="section-title">👤 关于 TA</text>
                    <text class="section-text">{{ (card.data as User).bio || '这个人很懒，什么都没写~' }}</text>
                  </view>
                  
                  <!-- 标签展示 - 核心信息 -->
                  <view class="detail-section" v-if="(card.data as User).profile?.tags?.length">
                    <text class="section-title">🏷️ TA 的标签</text>
                    <view class="user-tag-list">
                      <view 
                        class="user-tag-item" 
                        v-for="tag in (card.data as User).profile.tags" 
                        :key="tag.id"
                      >
                        <text class="tag-icon">{{ tag.icon }}</text>
                        <view class="tag-info">
                          <text class="tag-name">{{ tag.name }}</text>
                          <text class="tag-desc">{{ tag.description }}</text>
                        </view>
                      </view>
                    </view>
                  </view>
                  <view class="detail-section empty-tags" v-else>
                    <text class="section-title">🏷️ TA 的标签</text>
                    <text class="empty-text">还没有获得任何标签</text>
                  </view>
                  
                  <!-- 共同点 -->
                  <view class="detail-section" v-if="getCommonTags(card.data as User).length">
                    <text class="section-title">🤝 你们的共同点</text>
                    <view class="common-tag-list">
                      <view class="common-tag" v-for="tag in getCommonTags(card.data as User)" :key="tag">
                        {{ tag }}
                      </view>
                    </view>
                  </view>
                  
                  <!-- 生活记录 -->
                  <view class="detail-section">
                    <text class="section-title">📝 生活足迹</text>
                    <view class="life-stats">
                      <view class="stat-item">
                        <text class="stat-value">{{ (card.data as User).history?.completedEvents?.length || 0 }}</text>
                        <text class="stat-label">完成事件</text>
                      </view>
                      <view class="stat-item">
                        <text class="stat-value">{{ (card.data as User).history?.currentEvents?.length || 0 }}</text>
                        <text class="stat-label">进行中</text>
                      </view>
                      <view class="stat-item">
                        <text class="stat-value">{{ (card.data as User).inventory?.length || 0 }}</text>
                        <text class="stat-label">物品数</text>
                      </view>
                    </view>
                  </view>
                  
                  <!-- 最近活跃 -->
                  <view class="detail-section">
                    <text class="section-title">⏰ 活跃状态</text>
                    <view class="activity-info">
                      <text class="activity-text">{{ getLastActiveText(card.data as User) }}</text>
                    </view>
                  </view>
                </view>
              </template>
              
              <!-- 操作面板内容 -->
              <template #actions>
                <view v-if="card.type === 'event'" class="action-list">
                  <view class="action-item" @click="onCardAction(card, 'join')">
                    <text class="action-icon">🎯</text>
                    <text class="action-text">立即参与</text>
                  </view>
                  <view class="action-item" @click="onCardAction(card, 'save')">
                    <text class="action-icon">📌</text>
                    <text class="action-text">收藏事件</text>
                  </view>
                  <view class="action-item" @click="onCardAction(card, 'share')">
                    <text class="action-icon">📤</text>
                    <text class="action-text">分享给好友</text>
                  </view>
                  <view class="action-item danger" @click="onCardAction(card, 'report')">
                    <text class="action-icon">⚠️</text>
                    <text class="action-text">举报问题</text>
                  </view>
                </view>
                
                <view v-else-if="card.type === 'item'" class="action-list">
                  <view class="action-item" @click="onCardAction(card, 'mint')">
                    <text class="action-icon">⛏️</text>
                    <text class="action-text">铸造物品</text>
                  </view>
                  <view class="action-item" @click="onCardAction(card, 'save')">
                    <text class="action-icon">📌</text>
                    <text class="action-text">收藏物品</text>
                  </view>
                  <view class="action-item" @click="onCardAction(card, 'share')">
                    <text class="action-icon">📤</text>
                    <text class="action-text">分享给好友</text>
                  </view>
                </view>
                
                <view v-else-if="card.type === 'user'" class="action-list">
                  <view class="action-item" @click="onCardAction(card, 'follow')">
                    <text class="action-icon">👋</text>
                    <text class="action-text">关注 TA</text>
                  </view>
                  <view class="action-item" @click="onCardAction(card, 'message')">
                    <text class="action-icon">💬</text>
                    <text class="action-text">发送消息</text>
                  </view>
                  <view class="action-item" @click="onCardAction(card, 'profile')">
                    <text class="action-icon">👤</text>
                    <text class="action-text">查看主页</text>
                  </view>
                  <view class="action-item danger" @click="onCardAction(card, 'block')">
                    <text class="action-icon">🚫</text>
                    <text class="action-text">屏蔽用户</text>
                  </view>
                </view>
              </template>
            </SwipeableCard>
          </view>
        </swiper-item>
      </swiper>
    </view>
    
    <!-- 加载状态 -->
    <view v-if="cardStore.isLoading" class="loading-overlay">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useCardStore } from '@/stores/card'
import { useUserStore } from '@/stores/user'
import { useWorldStore } from '@/stores/world'
import { useEventStore } from '@/stores/event'
import { useItemStore } from '@/stores/item'
import WorldTrackSwitch from '@/components/WorldTrackSwitch.vue'
import SwipeableCard from '@/components/SwipeableCard.vue'
import EventCard from '@/components/EventCard.vue'
import ItemCard from '@/components/ItemCard.vue'
import UserCard from '@/components/UserCard.vue'
import type { GameEvent, Item, User, Card } from '@/types'

const cardStore = useCardStore()
const userStore = useUserStore()
const worldStore = useWorldStore()
const eventStore = useEventStore()
const itemStore = useItemStore()

const isPanelOpen = ref(false)
const isCardActive = ref(false)

// 链世界钱包
const chainWallet = computed(() => ({
  bfc: 1250,
  gov: 85
}))

// 是否在链世界
const isChainWorld = computed(() => worldStore.currentWorld === 'chain')

// 用户名首字母
const userInitial = computed(() => {
  const name = userStore.currentUser?.nickname || 'U'
  return name.charAt(0).toUpperCase()
})

// 获取共同标签
const getCommonTags = (user: User): string[] => {
  const myTags = userStore.currentUser?.tags?.map(t => t.tagId) || []
  const theirTags = user.tags?.map(t => t.tagId) || []
  return myTags.filter(tag => theirTags.includes(tag))
}

// 获取最后活跃时间文本
const getLastActiveText = (user: User): string => {
  if (!user.lastActive) return '未知'
  const now = new Date()
  const lastActive = new Date(user.lastActive)
  const diff = now.getTime() - lastActive.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (minutes < 5) return '刚刚活跃'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return '一周前'
}

// 事件类型标签
const getEventTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'story': '剧情',
    'social': '社交',
    'challenge': '挑战',
    'exploration': '探索',
    'creation': '创作'
  }
  return labels[type] || type
}

// 事件状态标签
const getEventStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'active': '进行中',
    'upcoming': '即将开始',
    'ended': '已结束',
    'draft': '草稿'
  }
  return labels[status] || status
}

// 稀有度标签
const getRarityLabel = (rarity: string): string => {
  const labels: Record<string, string> = {
    'common': '普通',
    'uncommon': '稀有',
    'rare': '精良',
    'epic': '史诗',
    'legendary': '传说'
  }
  return labels[rarity] || rarity
}

// 面板状态变化
const onPanelChange = (panel: 'left' | 'right' | null) => {
  isPanelOpen.value = panel !== null
}

// 事件状态变化
const onEventStateChange = (state: string) => {
  isCardActive.value = state === 'playing' || state === 'result'
}

// 物品状态变化
const onItemStateChange = (state: string) => {
  isCardActive.value = state === 'detail'
}

// 用户状态变化
const onUserStateChange = (state: string) => {
  isCardActive.value = state === 'detail'
}

// Swiper切换
const onSwiperChange = (e: any) => {
  console.log('Swiper change:', e.detail)
  cardStore.currentIndex = e.detail.current
}

// Swiper过渡
const onSwiperTransition = (e: any) => {
  console.log('Swiper transition:', e.detail)
}

// Swiper动画结束
const onSwiperAnimationFinish = (e: any) => {
  console.log('Swiper animation finish:', e.detail)
}

// 左滑操作
const onSwipeLeft = (card: Card) => {
  console.log('Swipe left:', card)
  cardStore.nextCard()
}

// 右滑操作
const onSwipeRight = (card: Card) => {
  console.log('Swipe right:', card)
  if (card.type === 'event') {
    // 收藏事件
  } else if (card.type === 'user') {
    // 关注用户
  }
  cardStore.nextCard()
}

// 卡片操作
const onCardAction = (card: Card, action: string) => {
  console.log('Card action:', card, action)
  
  switch (action) {
    case 'join':
      if (card.type === 'event') {
        uni.navigateTo({
          url: `/pages/event/play?id=${card.data.id}`
        })
      }
      break
    case 'save':
      uni.showToast({ title: '已收藏', icon: 'success' })
      break
    case 'share':
      uni.showToast({ title: '分享功能开发中', icon: 'none' })
      break
    case 'report':
      uni.showToast({ title: '举报已提交', icon: 'none' })
      break
    case 'mint':
      uni.showToast({ title: '铸造功能开发中', icon: 'none' })
      break
    case 'follow':
      uni.showToast({ title: '已关注', icon: 'success' })
      break
    case 'message':
      uni.showToast({ title: '消息功能开发中', icon: 'none' })
      break
    case 'profile':
      uni.showToast({ title: '主页功能开发中', icon: 'none' })
      break
    case 'block':
      uni.showToast({ title: '已屏蔽', icon: 'none' })
      break
  }
}

// 物品点击
const onItemClick = (item: Item) => {
  console.log('Item click:', item)
}

// 物品铸造
const onItemMint = (item: Item) => {
  console.log('Item mint:', item)
}

// 用户点击
const onUserClick = (user: User) => {
  console.log('User click:', user)
}

// 用户关注
const onUserFollow = (user: User) => {
  console.log('User follow:', user)
}

// 查看用户主页
const onUserViewProfile = (user: User) => {
  console.log('User view profile:', user)
}

// 跳转到个人中心
const goToProfile = () => {
  uni.switchTab({
    url: '/pages/profile/profile'
  })
}

onMounted(async () => {
  // 先加载事件和物品数据，再初始化卡片队列
  await eventStore.loadEvents()
  await itemStore.loadItems()
  await cardStore.initCardQueue()
  console.log('Card queue initialized:', cardStore.cardQueue.length, 'cards')
})
</script>

<style lang="scss" scoped>
@import '@/styles/theme.scss';

// 移动端安全区域适配
$safe-area-top: env(safe-area-inset-top, 0px);
$safe-area-bottom: env(safe-area-inset-bottom, 0px);

.index-container {
  width: 100%;
  height: 100vh;
  background: $white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  
  // 柔和的背景渐变
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(ellipse at 0% 0%, rgba($primary-color, 0.06) 0%, transparent 50%),
      radial-gradient(ellipse at 100% 100%, rgba($accent-color, 0.04) 0%, transparent 50%),
      linear-gradient(180deg, $white 0%, $gray-50 100%);
    pointer-events: none;
    z-index: 0;
  }
}

// 顶部状态栏 - 使用flex布局，不用fixed
.status-bar {
  position: relative;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 16rpx;
  padding-top: calc(12rpx + #{$safe-area-top});
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(40rpx) saturate(180%);
  -webkit-backdrop-filter: blur(40rpx) saturate(180%);
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
}

.status-left {
  flex-shrink: 0;
}

.status-center {
  display: flex;
  gap: 8rpx;
  flex: 1;
  justify-content: center;
  max-width: 280rpx;
}

.status-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex-shrink: 0;
}

.wallet-item {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 6rpx 12rpx;
  background: rgba($primary-color, 0.08);
  border: 1rpx solid rgba($primary-color, 0.12);
  border-radius: $radius-full;
  
  &.chain-currency {
    background: rgba($accent-color, 0.1);
    border: 1rpx solid rgba($accent-color, 0.2);
    
    .wallet-value {
      color: $accent-dark;
    }
  }
}

.clearance-badge {
  display: flex;
  align-items: center;
  padding: 6rpx 12rpx;
  background: $gradient-primary;
  border-radius: $radius-full;
  box-shadow: 0 2rpx 8rpx rgba($primary-color, 0.3);
  
  .clearance-text {
    font-size: 20rpx;
    font-weight: bold;
    color: $white;
    font-family: 'SF Mono', 'Courier New', monospace;
  }
}

.wallet-icon {
  font-size: 20rpx;
}

.wallet-value {
  font-size: 20rpx;
  font-weight: 600;
  color: $text-primary;
}

.user-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: $gradient-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba($primary-color, 0.3);
  min-width: $touch-target-min;
  min-height: $touch-target-min;
}

.avatar-text {
  font-size: 28rpx;
  font-weight: bold;
  color: $white;
}

// 卡片区域 - flex:1 填充剩余空间，为底部TabBar预留空间
.card-area {
  flex: 1;
  position: relative;
  z-index: 1;
  overflow: hidden;
  min-height: 0; // 重要：允许flex子元素收缩
  // 为底部TabBar预留空间（uni-app TabBar高度约50px + 安全区域）
  padding-bottom: calc(100rpx + #{$safe-area-bottom});
  box-sizing: border-box;
}

.card-swiper {
  width: 100%;
  height: 100%;
  touch-action: pan-y; // 允许垂直滑动
}

.swiper-item {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: 8rpx;
  box-sizing: border-box;
  overflow: hidden;
  touch-action: pan-y; // 允许垂直滑动
}

.card-wrapper {
  width: 100%;
  height: 100%;
  min-height: 0;
  border-radius: $radius-xl;
  overflow: hidden;
  box-shadow: $shadow-xl;
  transition: transform $transition-normal;
  display: flex;
  flex-direction: column;
  touch-action: pan-y; // 允许垂直滑动
  
  &:active {
    transform: scale(0.998);
  }
}

// 详情面板内容样式 - 白色系
.detail-content {
  .detail-section {
    margin-bottom: 32rpx;
    
    .section-title {
      font-size: 28rpx;
      font-weight: bold;
      color: $text-primary;
      margin-bottom: 16rpx;
      display: block;
    }
    
    .section-text {
      font-size: 26rpx;
      color: $text-secondary;
      line-height: 1.6;
    }
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16rpx;
    
    .info-item {
      @include glass-effect(0.6);
      padding: 20rpx;
      border-radius: $radius-lg;
      
      .info-label {
        font-size: 22rpx;
        color: $text-tertiary;
        display: block;
        margin-bottom: 8rpx;
      }
      
      .info-value {
        font-size: 26rpx;
        color: $text-primary;
        font-weight: 600;
      }
    }
  }
  
  .cost-list, .effect-list {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
    
    .cost-item, .effect-item {
      display: flex;
      align-items: center;
      gap: 12rpx;
      padding: 16rpx 20rpx;
      @include glass-effect(0.6);
      border-radius: $radius-lg;
      
      .cost-icon {
        font-size: 28rpx;
      }
      
      .cost-value, .effect-value {
        font-size: 26rpx;
        color: $text-primary;
      }
      
      .effect-type {
        font-size: 22rpx;
        color: $text-tertiary;
      }
    }
  }
  
  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    
    .tag-item {
      padding: 10rpx 18rpx;
      background: rgba($primary-color, 0.1);
      border: 1rpx solid rgba($primary-color, 0.15);
      border-radius: $radius-full;
      font-size: 24rpx;
      color: $primary-dark;
    }
  }
  
  // 用户标签列表 - 白色系
  .user-tag-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    
    .user-tag-item {
      display: flex;
      align-items: flex-start;
      gap: 16rpx;
      padding: 20rpx;
      @include glass-effect(0.7);
      border-radius: $radius-lg;
      
      .tag-icon {
        font-size: 36rpx;
        flex-shrink: 0;
      }
      
      .tag-info {
        flex: 1;
        
        .tag-name {
          font-size: 28rpx;
          font-weight: 600;
          color: $text-primary;
          display: block;
          margin-bottom: 6rpx;
        }
        
        .tag-desc {
          font-size: 24rpx;
          color: $text-secondary;
          line-height: 1.4;
        }
      }
    }
  }
  
  // 空标签状态 - 白色系
  .empty-tags {
    .empty-text {
      font-size: 26rpx;
      color: $text-tertiary;
      font-style: italic;
    }
  }
  
  // 共同标签 - 白色系
  .common-tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    
    .common-tag {
      padding: 10rpx 20rpx;
      background: rgba($primary-color, 0.1);
      border: 1rpx solid rgba($primary-color, 0.2);
      border-radius: $radius-full;
      font-size: 24rpx;
      color: $primary-dark;
    }
  }
  
  // 生活足迹统计 - 白色系
  .life-stats {
    display: flex;
    justify-content: space-around;
    padding: 20rpx 0;
    @include glass-effect(0.6);
    border-radius: $radius-lg;
    
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8rpx;
      
      .stat-value {
        font-size: 40rpx;
        font-weight: bold;
        color: $text-primary;
      }
      
      .stat-label {
        font-size: 22rpx;
        color: $text-tertiary;
      }
    }
  }
  
  // 活跃状态 - 白色系
  .activity-info {
    padding: 16rpx 20rpx;
    @include glass-effect(0.6);
    border-radius: $radius-lg;
    
    .activity-text {
      font-size: 26rpx;
      color: $text-primary;
    }
  }
}

// 操作面板内容样式 - 白色系
.action-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  
  .action-item {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 28rpx;
    @include glass-effect(0.7);
    border-radius: $radius-xl;
    transition: all $transition-normal;
    min-height: $touch-target-min;
    
    &:active {
      transform: scale(0.98);
      background: rgba(255, 255, 255, 0.9);
    }
    
    &.danger {
      background: rgba($color-danger, 0.08);
      border-color: rgba($color-danger, 0.15);
      
      .action-text {
        color: $color-danger;
      }
    }
    
    .action-icon {
      font-size: 36rpx;
    }
    
    .action-text {
      font-size: 28rpx;
      color: $text-primary;
      font-weight: 500;
    }
  }
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(40rpx);
  -webkit-backdrop-filter: blur(40rpx);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 80rpx;
  height: 80rpx;
  border: 6rpx solid $gray-200;
  border-top-color: $primary-color;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24rpx;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 28rpx;
  color: $text-secondary;
}
</style>
