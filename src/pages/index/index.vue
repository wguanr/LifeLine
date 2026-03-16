<template>
  <view class="index-container">
    <!-- 顶部状态栏 - Cyberpunk 风格 -->
    <view class="status-bar">
      <!-- 左侧：LifeLine Logo + 世界切换 -->
      <view class="status-left">
        <view class="logo-group">
          <text class="logo-text">Life</text><text class="logo-text logo-accent">Line</text>
        </view>
        <WorldTrackSwitch />
      </view>
      
      <!-- 右侧：资源胶囊 + 头像 + 通知 -->
      <view class="status-right">
        <!-- 资源胶囊 -->
        <view class="resource-capsule" v-if="!isChainWorld">
          <view class="resource-item">
            <text class="resource-icon">⏱</text>
            <text class="resource-value">{{ formatNum(userStore.wallet.time) }}</text>
          </view>
          <view class="resource-divider"></view>
          <view class="resource-item">
            <text class="resource-icon">⚡</text>
            <text class="resource-value">{{ formatNum(userStore.wallet.energy) }}</text>
          </view>
        </view>
        <view class="resource-capsule" v-if="isChainWorld">
          <view class="resource-item">
            <text class="resource-icon">🦋</text>
            <text class="resource-value">{{ chainWallet.bfc }}</text>
          </view>
          <view class="resource-divider"></view>
          <view class="resource-item">
            <text class="resource-icon">🗳️</text>
            <text class="resource-value">{{ chainWallet.gov }}</text>
          </view>
        </view>
        
        <!-- 用户头像 + 等级徽章 -->
        <view class="avatar-group" @click="goToProfile">
          <view class="avatar-ring">
            <view class="user-avatar">
              <text class="avatar-text">{{ userInitial }}</text>
            </view>
          </view>
          <view class="level-badge">
            <text class="level-text">L{{ userStore.currentUser.clearanceLevel }}</text>
          </view>
        </view>
        
        <!-- 通知铃铛 -->
        <view class="notification-bell">
          <text class="bell-icon">🔔</text>
          <view class="bell-dot"></view>
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
              :ref="(el: any) => setSwipeableCardRef(index, el)"
              :disabled="isCardActive"
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
                @buy="onItemBuy"
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
                  <!-- 已参与状态提示 -->
                  <view class="detail-section owned-notice" v-if="eventStore.isEventCompleted((card.data as GameEvent).id)">
                    <view class="owned-notice-box" style="border-color: #059669; background: #ecfdf5;">
                      <text class="owned-notice-icon">✅</text>
                      <view class="owned-notice-info">
                        <text class="owned-notice-title" style="color: #059669;">你已完成此事件</text>
                        <text class="owned-notice-desc">可前往世界线页面查看完整历史抉择</text>
                      </view>
                    </view>
                  </view>
                  <view class="detail-section owned-notice" v-else-if="eventStore.isEventActive((card.data as GameEvent).id)">
                    <view class="owned-notice-box" style="border-color: #d97706; background: #fffbeb;">
                      <text class="owned-notice-icon">⏳</text>
                      <view class="owned-notice-info">
                        <text class="owned-notice-title" style="color: #d97706;">事件进行中</text>
                        <text class="owned-notice-desc">你已开始参与此事件，可继续探索</text>
                      </view>
                    </view>
                  </view>
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
                  <!-- 已购入提示 -->
                  <view class="detail-section owned-notice" v-if="isItemOwned(card.data as Item)">
                    <view class="owned-notice-box">
                      <text class="owned-notice-icon">✅</text>
                      <view class="owned-notice-info">
                        <text class="owned-notice-title">你已拥有此物品</text>
                        <text class="owned-notice-desc">持有 {{ getItemOwnedCount(card.data as Item) }} 件</text>
                      </view>
                    </view>
                  </view>
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
                  <!-- 座右铭 -->
                  <view class="detail-section" v-if="(card.data as User).motto">
                    <view class="detail-motto-card">
                      <text class="detail-motto-mark">“</text>
                      <text class="detail-motto-text">{{ (card.data as User).motto }}</text>
                      <text class="detail-motto-mark end">”</text>
                    </view>
                  </view>
                  
                  <view class="detail-section">
                    <text class="section-title">👤 关于 TA</text>
                    <text class="section-text">{{ (card.data as User).bio || '这个人很懒，什么都没写~' }}</text>
                  </view>
                  
                  <!-- 资源概览 -->
                  <view class="detail-section">
                    <text class="section-title">💰 资源概览</text>
                    <view class="resource-grid">
                      <view class="resource-item">
                        <text class="resource-icon">⏰</text>
                        <view class="resource-info">
                          <text class="resource-value">{{ (card.data as User).wallet?.time || 0 }}</text>
                          <text class="resource-label">时间</text>
                        </view>
                      </view>
                      <view class="resource-item">
                        <text class="resource-icon">⚡</text>
                        <view class="resource-info">
                          <text class="resource-value">{{ (card.data as User).wallet?.energy || 0 }}</text>
                          <text class="resource-label">精力</text>
                        </view>
                      </view>
                      <view class="resource-item">
                        <text class="resource-icon">🌟</text>
                        <view class="resource-info">
                          <text class="resource-value">{{ (card.data as User).wallet?.reputation || 0 }}</text>
                          <text class="resource-label">声望</text>
                        </view>
                      </view>
                    </view>
                  </view>
                  
                  <!-- 标签展示 - 带权重进度条 -->
                  <view class="detail-section" v-if="(card.data as User).tags?.length">
                    <text class="section-title">🏷️ TA 的标签</text>
                    <view class="user-tag-list">
                      <view 
                        class="user-tag-item" 
                        v-for="(tag, idx) in (card.data as User).tags" 
                        :key="tag.tagId"
                      >
                        <view class="tag-icon-wrap" :class="'tag-bg-' + (idx % 5)">
                          <text class="tag-icon">{{ getTagIcon(tag.tagId) }}</text>
                        </view>
                        <view class="tag-info">
                          <view class="tag-name-row">
                            <text class="tag-name">{{ getTagName(tag.tagId) }}</text>
                            <text class="tag-weight">{{ tag.weight }}</text>
                          </view>
                          <view class="tag-bar">
                            <view class="tag-bar-fill" :class="'bar-color-' + (idx % 5)" :style="{ width: Math.min(tag.weight, 100) + '%' }" />
                          </view>
                        </view>
                      </view>
                    </view>
                  </view>
                  <view class="detail-section empty-tags" v-else>
                    <text class="section-title">🏷️ TA 的标签</text>
                    <text class="empty-text">还没有获得任何标签</text>
                  </view>
                  
                  <!-- 成就展示 -->
                  <view class="detail-section" v-if="(card.data as User).history?.achievements?.length">
                    <text class="section-title">🏆 成就徽章</text>
                    <view class="detail-achievement-grid">
                      <view class="detail-achievement-item" v-for="achId in (card.data as User).history.achievements" :key="achId">
                        <text class="detail-ach-icon">{{ getAchievementIcon(achId) }}</text>
                        <text class="detail-ach-name">{{ getAchievementName(achId) }}</text>
                      </view>
                    </view>
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
                  
                  <!-- 历史选择记录 -->
                  <view class="detail-section" v-if="(card.data as User).history?.choiceHistory?.length">
                    <text class="section-title">📜 历史选择</text>
                    <view class="choice-timeline">
                      <view 
                        class="timeline-item" 
                        v-for="(ch, idx) in (card.data as User).history.choiceHistory.slice(-6).reverse()" 
                        :key="idx"
                      >
                        <view class="timeline-dot" :class="'dot-color-' + (idx % 3)" />
                        <view class="timeline-line" v-if="idx < Math.min((card.data as User).history.choiceHistory.length, 6) - 1" />
                        <view class="timeline-content">
                          <text class="timeline-choice">{{ ch.choiceId }}</text>
                          <text class="timeline-time" v-if="ch.timestamp">{{ formatChoiceTime(ch.timestamp) }}</text>
                        </view>
                      </view>
                    </view>
                  </view>
                  
                  <!-- 物品收藏 - 增强版，显示稀有度和图标 -->
                  <view class="detail-section" v-if="(card.data as User).inventory?.length">
                    <text class="section-title">🎒 物品收藏</text>
                    <view class="detail-inventory-list">
                      <view class="detail-inv-item" v-for="inv in (card.data as User).inventory.slice(0, 8)" :key="inv.itemId">
                        <text class="detail-inv-icon">{{ getItemIcon(inv.itemId) }}</text>
                        <view class="detail-inv-info">
                          <text class="detail-inv-name">{{ getItemName(inv.itemId) }}</text>
                          <text class="detail-inv-rarity" :class="'rarity-text-' + getItemRarity(inv.itemId)">{{ getRarityLabel(getItemRarity(inv.itemId)) }}</text>
                        </view>
                        <text class="detail-inv-qty" v-if="inv.quantity > 1">×{{ inv.quantity }}</text>
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
                  <!-- 已完成事件 -->
                  <template v-if="eventStore.isEventCompleted((card.data as GameEvent).id)">
                    <view class="action-item" @click="onCardAction(card, 'viewHistory')">
                      <text class="action-icon">📜</text>
                      <text class="action-text">查看历史抉择</text>
                    </view>
                    <view class="action-item" @click="onCardAction(card, 'replay')">
                      <text class="action-icon">🔄</text>
                      <text class="action-text">重新体验</text>
                    </view>
                  </template>
                  <!-- 进行中事件 -->
                  <template v-else-if="eventStore.isEventActive((card.data as GameEvent).id)">
                    <view class="action-item" @click="onCardAction(card, 'continue')">
                      <text class="action-icon">▶️</text>
                      <text class="action-text">继续事件</text>
                    </view>
                    <view class="action-item" @click="onCardAction(card, 'viewHistory')">
                      <text class="action-icon">📜</text>
                      <text class="action-text">查看已做抉择</text>
                    </view>
                  </template>
                  <!-- 未参与事件 -->
                  <template v-else>
                    <view class="action-item" @click="onCardAction(card, 'join')">
                      <text class="action-icon">🎯</text>
                      <text class="action-text">立即参与</text>
                    </view>
                  </template>
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
                  <view class="action-item" v-if="!isItemOwned(card.data as Item)" @click="onCardAction(card, 'buy')">
                    <text class="action-icon">🛒</text>
                    <text class="action-text">买入物品</text>
                  </view>
                  <view class="action-item owned-action-hint" v-else>
                    <text class="action-icon">✅</text>
                    <text class="action-text" style="color: #059669;">已拥有 {{ getItemOwnedCount(card.data as Item) }} 件</text>
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
    
    <!-- 物品全屏展示使用纯 JS DOM 方案，无需 Vue 组件 -->
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
import { getTagDefinition } from '@/data/tags'

const cardStore = useCardStore()
const userStore = useUserStore()
const worldStore = useWorldStore()
const eventStore = useEventStore()
const itemStore = useItemStore()

const isPanelOpen = ref(false)
const isCardActive = ref(false)


// SwipeableCard 实例引用
const swipeableCardRefs = ref<Record<number, any>>({})
const setSwipeableCardRef = (index: number, el: any) => {
  if (el) {
    swipeableCardRefs.value[index] = el
  } else {
    delete swipeableCardRefs.value[index]
  }
}

// 标签工具方法
const getTagName = (tagId: string): string => {
  const def = getTagDefinition(tagId)
  return def?.name || tagId
}

const getTagIcon = (tagId: string): string => {
  const def = getTagDefinition(tagId)
  return def?.icon || '🏷️'
}

// 数字格式化（大数字缩写）
const formatNum = (n: number): string => {
  if (n >= 9950_0000) return (n / 1e8).toFixed(1).replace(/\.0$/, '') + '亿'
  if (n >= 1e4) return (n / 1e4).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '') + '万'
  return n.toString()
}

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

// 格式化选择时间
const formatChoiceTime = (timestamp: number): string => {
  if (!timestamp) return ''
  const d = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  return `${d.getMonth() + 1}/${d.getDate()}`
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

// 成就定义
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

const getAchievementIcon = (id: string): string => {
  return achievementDefs[id]?.icon || '🏅'
}

const getAchievementName = (id: string): string => {
  return achievementDefs[id]?.name || id
}

// 物品信息辅助函数
const getItemIcon = (itemId: string): string => {
  const item = itemStore.getItemById(itemId)
  return item?.icon || '📦'
}

const getItemName = (itemId: string): string => {
  const item = itemStore.getItemById(itemId)
  return item?.name || itemId
}

const getItemRarity = (itemId: string): string => {
  const item = itemStore.getItemById(itemId)
  return item?.rarity || 'common'
}

// 物品拥有状态检查
const isItemOwned = (item: Item): boolean => {
  return userStore.hasItem(item.id)
}

const getItemOwnedCount = (item: Item): number => {
  const inv = userStore.inventory.find(i => i.itemId === item.id)
  return inv?.quantity ?? 0
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
  cardStore.currentIndex = e.detail.current
}

// Swiper过渡
const onSwiperTransition = (e: any) => {
  // transition
}

// Swiper动画结束
const onSwiperAnimationFinish = (e: any) => {
  // animation finish
}


// 卡片操作
const onCardAction = (card: Card, action: string) => {
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
    case 'viewHistory':
      uni.switchTab({ url: '/pages/worldline/worldline' })
      break
    case 'replay':
      uni.showToast({ title: '重新体验功能开发中', icon: 'none' })
      break
    case 'continue':
      uni.showToast({ title: '请点击卡片上的“继续事件”按钮', icon: 'none' })
      break
    case 'buy':
      uni.showToast({ title: '请点击卡片上的买入按钮', icon: 'none' })
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
  // item click
}

// 物品买入
const onItemBuy = (item: Item) => {
  // item buy
}

// 用户点击
const onUserClick = (user: User) => {
  // 用户卡片内部已处理点击
}

// 用户关注（UserCard 内部已处理 influencerStore 逻辑）
const onUserFollow = (user: User) => {
  console.log('[Index] User follow/unfollow:', user.nickname)
}

// 查看用户主页 - 打开 SwipeableCard 的详情面板
const onUserViewProfile = (user: User) => {
  console.log('[Index] View profile:', user.nickname)
  // 遍历所有 ref，找到包含用户卡片的 SwipeableCard
  for (const key of Object.keys(swipeableCardRefs.value)) {
    const ref = swipeableCardRefs.value[Number(key)]
    if (ref?.$el) {
      const userCard = ref.$el.querySelector('.user-card')
      if (userCard && userCard.offsetParent !== null) {
        ref.openLeftPanel()
        return
      }
    }
  }
  // 备用方案：通过 DOM 找到包含可见 user-card 的 swipeable-card
  const userCardEl = document.querySelector('.user-card')
  if (userCardEl) {
    const swipeCard = userCardEl.closest('.swipeable-card')
    const detailPanel = swipeCard?.querySelector('.detail-panel')
    if (detailPanel) {
      detailPanel.classList.add('visible')
      const overlay = swipeCard?.querySelector('.overlay')
      overlay?.classList.add('visible')
      const cardContent = swipeCard?.querySelector('.card-content')
      cardContent?.classList.add('panel-open')
    }
  }
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
  // Card queue ready
})
</script>

<style lang="scss" scoped>

// 移动端安全区域适配
$safe-area-top: env(safe-area-inset-top, 0px);
$safe-area-bottom: env(safe-area-inset-bottom, 0px);

.index-container {
  width: 100%;
  height: 100vh;
  background: $bg-deep;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  position: relative;
  
  // 星空背景
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      url('/static/bg/starfield_bg.png') center/cover no-repeat,
      linear-gradient(180deg, $bg-deep 0%, $bg-base 50%, $bg-deep 100%);
    pointer-events: none;
    z-index: 0;
  }
  
  // 微妙的霓虹光晕装饰
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(ellipse at 20% 10%, rgba($neon-cyan, 0.04) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 90%, rgba($neon-magenta, 0.03) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
}

// 顶部状态栏 - 暗色玻璃效果
.status-bar {
  position: relative;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 24rpx;
  padding-top: calc(16rpx + #{$safe-area-top});
  padding-bottom: 16rpx;
  flex-shrink: 0;
  background: rgba($bg-deep, 0.7);
  backdrop-filter: blur(40rpx) saturate(150%);
  -webkit-backdrop-filter: blur(40rpx) saturate(150%);
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.3);
  max-width: 100%;
  box-sizing: border-box;
}

// 左侧：Logo + 世界切换
.status-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-shrink: 0;
}

.logo-group {
  display: flex;
  align-items: baseline;
  
  .logo-text {
    font-size: 30rpx;
    font-weight: 800;
    color: $text-primary;
    font-family: 'SF Mono', 'Courier New', monospace;
    letter-spacing: -1rpx;
    
    &.logo-accent {
      color: $neon-cyan;
      @include neon-text($neon-cyan);
    }
  }
}

// 右侧：资源 + 头像 + 通知
.status-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-shrink: 0;
}

// 资源胶囊容器
.resource-capsule {
  display: flex;
  align-items: center;
  padding: 6rpx 14rpx;
  background: rgba($neon-cyan, 0.06);
  border: 1rpx solid rgba($neon-cyan, 0.12);
  border-radius: $radius-full;
  gap: 0;
  
  .resource-item {
    display: flex;
    align-items: center;
    gap: 4rpx;
    padding: 0 8rpx;
  }
  
  .resource-icon {
    font-size: 18rpx;
  }
  
  .resource-value {
    font-size: 20rpx;
    font-weight: 700;
    color: $neon-cyan-light;
    font-family: 'SF Mono', 'Courier New', monospace;
  }
  
  .resource-divider {
    width: 1rpx;
    height: 20rpx;
    background: rgba($neon-cyan, 0.2);
    margin: 0 4rpx;
  }
}

// 用户头像组（头像 + 等级徽章）
.avatar-group {
  position: relative;
  cursor: pointer;
  
  .avatar-ring {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    padding: 3rpx;
    background: linear-gradient(135deg, $neon-cyan, $neon-magenta);
    @include neon-glow($neon-cyan, 0.15);
  }
  
  .user-avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba($neon-magenta, 0.25), rgba($neon-cyan, 0.25));
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2rpx solid $bg-deep;
  }
  
  .avatar-text {
    font-size: 24rpx;
    font-weight: bold;
    color: $neon-cyan-light;
  }
  
  .level-badge {
    position: absolute;
    bottom: -4rpx;
    right: -6rpx;
    padding: 2rpx 8rpx;
    background: linear-gradient(135deg, rgba($neon-cyan, 0.9), rgba($neon-cyan-dark, 0.9));
    border-radius: $radius-full;
    border: 2rpx solid $bg-deep;
    
    .level-text {
      font-size: 16rpx;
      font-weight: 800;
      color: $text-on-neon;
      font-family: 'SF Mono', 'Courier New', monospace;
    }
  }
}

// 通知铃铛
.notification-bell {
  position: relative;
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  .bell-icon {
    font-size: 28rpx;
    filter: grayscale(0.3);
    transition: filter $transition-fast;
  }
  
  .bell-dot {
    position: absolute;
    top: 6rpx;
    right: 6rpx;
    width: 12rpx;
    height: 12rpx;
    background: $color-danger;
    border-radius: 50%;
    border: 2rpx solid $bg-deep;
    animation: pulse-glow 2s ease-in-out infinite;
  }
  
  &:active {
    .bell-icon {
      filter: grayscale(0);
    }
  }
}

// 卡片区域 - flex:1 填充剩余空间，为底部TabBar预留空间
.card-area {
  flex: 1;
  position: relative;
  z-index: 1;
  overflow: hidden;
  min-height: 0;
  // 卡片悬浮形态：上下留白，不贴满全屏
  padding: 16rpx 28rpx calc(16rpx + #{$safe-area-bottom});
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-swiper {
  width: 100%;
  max-width: 480px; // 限制卡片最大宽度，宽屏居中
  height: 100%;
  touch-action: pan-y; // 允许垂直滑动
}

.swiper-item {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8rpx 0;
  box-sizing: border-box;
  overflow: visible;
  touch-action: pan-y;
}

.card-wrapper {
  width: 100%;
  height: 100%;
  min-height: 0;
  border-radius: $radius-2xl;
  overflow: hidden;
  transition: transform $transition-normal;
  display: flex;
  flex-direction: column;
  touch-action: pan-y;
  
  // 玻璃态卡片背景 - 暗色半透明 + 微光边框
  background: linear-gradient(160deg, rgba(20, 26, 48, 0.92) 0%, rgba(10, 14, 26, 0.96) 100%);
  backdrop-filter: blur(40rpx) saturate(150%);
  -webkit-backdrop-filter: blur(40rpx) saturate(150%);
  border: 1.5rpx solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 8rpx 48rpx rgba(0, 0, 0, 0.5),
    0 0 60rpx rgba($neon-cyan, 0.05),
    0 0 120rpx rgba($neon-magenta, 0.03),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.08);
  
  &:active {
    transform: scale(0.998);
  }
}

// 详情面板内容样式 - 暗色主题
.detail-content {
  .detail-section {
    margin-bottom: 32rpx;
    
    .section-title {
      font-size: 28rpx;
      font-weight: bold;
      color: $neon-cyan-light;
      margin-bottom: 16rpx;
      display: block;
      letter-spacing: 1rpx;
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
      @include glass-effect(0.06);
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
      @include glass-effect(0.06);
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
      background: rgba($neon-cyan, 0.08);
      border: 1rpx solid rgba($neon-cyan, 0.2);
      border-radius: $radius-full;
      font-size: 24rpx;
      color: $neon-cyan;
    }
  }
  
  // 用户标签列表 - 带权重进度条
  .user-tag-list {
    display: flex;
    flex-direction: column;
    gap: 14rpx;
    
    .user-tag-item {
      display: flex;
      align-items: center;
      gap: 16rpx;
      padding: 16rpx 20rpx;
      @include glass-effect(0.06);
      border-radius: $radius-lg;
      
      .tag-icon-wrap {
        width: 52rpx;
        height: 52rpx;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        
        &.tag-bg-0 { background: rgba(#4caf50, 0.15); }
        &.tag-bg-1 { background: rgba(#2196f3, 0.15); }
        &.tag-bg-2 { background: rgba(#e91e63, 0.15); }
        &.tag-bg-3 { background: rgba(#ff9800, 0.15); }
        &.tag-bg-4 { background: rgba(#9c27b0, 0.15); }
      }
      
      .tag-icon {
        font-size: 28rpx;
      }
      
      .tag-info {
        flex: 1;
        min-width: 0;
        
        .tag-name-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8rpx;
        }
        
        .tag-name {
          font-size: 26rpx;
          font-weight: 600;
          color: $text-primary;
        }
        
        .tag-weight {
          font-size: 24rpx;
          font-weight: 700;
          color: $text-secondary;
        }
        
        .tag-bar {
          height: 8rpx;
          background: rgba(255,255,255,0.3);
          border-radius: 4rpx;
          overflow: hidden;
        }
        
        .tag-bar-fill {
          height: 100%;
          border-radius: 4rpx;
          transition: width 0.3s ease;
          
          &.bar-color-0 { background: linear-gradient(90deg, #66bb6a, #4caf50); }
          &.bar-color-1 { background: linear-gradient(90deg, #42a5f5, #2196f3); }
          &.bar-color-2 { background: linear-gradient(90deg, #f06292, #e91e63); }
          &.bar-color-3 { background: linear-gradient(90deg, #ffb74d, #ff9800); }
          &.bar-color-4 { background: linear-gradient(90deg, #ba68c8, #9c27b0); }
        }
      }
    }
  }
  
  // 空标签状态
  .empty-tags {
    .empty-text {
      font-size: 26rpx;
      color: $text-tertiary;
      font-style: italic;
    }
  }
  
  // 共同标签
  .common-tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    
    .common-tag {
      padding: 10rpx 20rpx;
      background: rgba($neon-cyan, 0.08);
      border: 1rpx solid rgba($neon-cyan, 0.2);
      border-radius: $radius-full;
      font-size: 24rpx;
      color: $neon-cyan;
    }
  }
  
  // 生活足迹统计
  .life-stats {
    display: flex;
    justify-content: space-around;
    padding: 20rpx 0;
    @include glass-effect(0.06);
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
  
  // 活跃状态
  .activity-info {
    padding: 16rpx 20rpx;
    @include glass-effect(0.06);
    border-radius: $radius-lg;
    
    .activity-text {
      font-size: 26rpx;
      color: $text-primary;
    }
  }
  
  // 历史选择时间线
  .choice-timeline {
    display: flex;
    flex-direction: column;
    padding-left: 8rpx;
    
    .timeline-item {
      display: flex;
      gap: 16rpx;
      position: relative;
      min-height: 60rpx;
    }
    
    .timeline-dot {
      width: 16rpx;
      height: 16rpx;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 8rpx;
      z-index: 1;
      
      &.dot-color-0 { background: #42a5f5; box-shadow: 0 0 8rpx rgba(#42a5f5, 0.4); }
      &.dot-color-1 { background: #66bb6a; box-shadow: 0 0 8rpx rgba(#66bb6a, 0.4); }
      &.dot-color-2 { background: #ffa726; box-shadow: 0 0 8rpx rgba(#ffa726, 0.4); }
    }
    
    .timeline-line {
      position: absolute;
      left: 7rpx;
      top: 28rpx;
      bottom: 0;
      width: 3rpx;
      background: rgba(255,255,255,0.2);
    }
    
    .timeline-content {
      flex: 1;
      min-width: 0;
      padding-bottom: 20rpx;
    }
    
    .timeline-choice {
      font-size: 26rpx;
      color: $text-primary;
      display: block;
      line-height: 1.4;
    }
    
    .timeline-time {
      font-size: 22rpx;
      color: $text-tertiary;
      margin-top: 4rpx;
      display: block;
    }
  }
  
  // 物品收藏网格
  .inventory-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12rpx;
    
    .inventory-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8rpx;
      padding: 16rpx 8rpx;
      @include glass-effect(0.06);
      border-radius: $radius-lg;
    }
    
    .inventory-icon {
      font-size: 36rpx;
    }
    
    .inventory-name {
      font-size: 20rpx;
      color: $text-secondary;
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;
    }
  }
  
  // 已购入提示框
  .owned-notice {
    .owned-notice-box {
      display: flex;
      align-items: center;
      gap: 16rpx;
      padding: 20rpx 24rpx;
      background: rgba($color-success, 0.06);
      border: 1rpx solid rgba($color-success, 0.2);
      border-radius: $radius-xl;
    }
    
    .owned-notice-icon {
      font-size: 36rpx;
    }
    
    .owned-notice-info {
      flex: 1;
    }
    
    .owned-notice-title {
      display: block;
      font-size: 28rpx;
      font-weight: 600;
      color: $color-success;
      margin-bottom: 4rpx;
    }
    
    .owned-notice-desc {
      display: block;
      font-size: 24rpx;
      color: rgba($color-success, 0.7);
    }
  }
  
  // 详情面板座右铭
  .detail-motto-card {
    display: flex;
    align-items: flex-start;
    gap: 6rpx;
    padding: 20rpx 24rpx;
    background: linear-gradient(135deg, rgba($neon-magenta, 0.06), rgba($neon-magenta, 0.02));
    border-radius: $radius-xl;
    border-left: 4rpx solid rgba($neon-magenta, 0.5);
  }
  
  .detail-motto-mark {
    font-size: 40rpx;
    font-weight: 700;
    color: $neon-magenta;
    line-height: 1;
    opacity: 0.4;
    flex-shrink: 0;
    
    &.end {
      align-self: flex-end;
    }
  }
  
  .detail-motto-text {
    font-size: 26rpx;
    color: $text-secondary;
    line-height: 1.6;
    font-style: italic;
    flex: 1;
    padding: 6rpx 0;
  }
  
  // 资源概览
  .resource-grid {
    display: flex;
    gap: 12rpx;
    
    .resource-item {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 12rpx;
      padding: 16rpx 14rpx;
      @include glass-effect(0.06);
      border-radius: $radius-lg;
      
      .resource-icon {
        font-size: 28rpx;
      }
      
      .resource-info {
        display: flex;
        flex-direction: column;
        gap: 2rpx;
      }
      
      .resource-value {
        font-size: 28rpx;
        font-weight: 700;
        color: $text-primary;
      }
      
      .resource-label {
        font-size: 20rpx;
        color: $text-tertiary;
      }
    }
  }
  
  // 成就徽章网格
  .detail-achievement-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
    
    .detail-achievement-item {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 10rpx 16rpx;
      background: linear-gradient(135deg, rgba($neon-amber, 0.08), rgba($neon-amber, 0.04));
      border: 1rpx solid rgba($neon-amber, 0.2);
      border-radius: 20rpx;
      
      .detail-ach-icon {
        font-size: 24rpx;
      }
      
      .detail-ach-name {
        font-size: 22rpx;
        font-weight: 600;
        color: $neon-amber;
      }
    }
  }
  
  // 物品收藏列表（增强版）
  .detail-inventory-list {
    display: flex;
    flex-direction: column;
    gap: 10rpx;
    
    .detail-inv-item {
      display: flex;
      align-items: center;
      gap: 14rpx;
      padding: 14rpx 18rpx;
      @include glass-effect(0.06);
      border-radius: $radius-lg;
      
      .detail-inv-icon {
        font-size: 32rpx;
        flex-shrink: 0;
      }
      
      .detail-inv-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4rpx;
      }
      
      .detail-inv-name {
        font-size: 24rpx;
        font-weight: 600;
        color: $text-primary;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .detail-inv-rarity {
        font-size: 20rpx;
        font-weight: 500;
        
        &.rarity-text-legendary { color: $rarity-legendary; }
        &.rarity-text-epic { color: $rarity-epic; }
        &.rarity-text-rare { color: $rarity-rare; }
        &.rarity-text-uncommon { color: $rarity-uncommon; }
        &.rarity-text-common { color: $rarity-common; }
      }
      
      .detail-inv-qty {
        font-size: 22rpx;
        font-weight: 700;
        color: $text-secondary;
        flex-shrink: 0;
      }
    }
  }
}

// 操作面板内容样式 - 暗色主题
.action-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  
  .action-item {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 28rpx;
    @include glass-effect(0.06);
    border-radius: $radius-xl;
    transition: all $transition-normal;
    min-height: $touch-target-min;
    
    &:active {
      transform: scale(0.98);
      background: rgba(255, 255, 255, 0.1);
    }
    
    &.danger {
      background: rgba($color-danger, 0.08);
      border-color: rgba($color-danger, 0.2);
      
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
  background: rgba($bg-deep, 0.9);
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
  border: 6rpx solid rgba(255, 255, 255, 0.1);
  border-top-color: $neon-cyan;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24rpx;
  @include neon-glow($neon-cyan, 0.2);
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
