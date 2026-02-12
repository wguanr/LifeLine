<template>
  <view class="profile-page">
    <view class="profile-header">
      <view class="avatar-area">
        <view class="avatar-circle">
          <text class="avatar-text">{{ userInitial }}</text>
        </view>
      </view>
      <text class="nickname">{{ userStore.currentUser.nickname }}</text>
      <text class="bio">{{ userStore.currentUser.bio }}</text>
      <view class="level-badge">
        <text class="level-text">L{{ userStore.currentUser.clearanceLevel }}</text>
      </view>
    </view>

    <view class="stats-row">
      <view class="stat-item">
        <text class="stat-value">⏰ {{ userStore.wallet.time }}</text>
        <text class="stat-label">时间</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">⚡ {{ userStore.wallet.energy }}</text>
        <text class="stat-label">精力</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">💫 {{ userStore.wallet.reputation }}</text>
        <text class="stat-label">声望</text>
      </view>
    </view>

    <view class="section">
      <text class="section-title">我的标签</text>
      <view class="tag-list">
        <view class="tag-item" v-for="tag in userStore.topTags" :key="tag.tagId">
          <text class="tag-name">{{ getTagName(tag.tagId) }}</text>
          <text class="tag-weight">{{ Math.round(tag.weight) }}</text>
        </view>
        <text v-if="!userStore.topTags.length" class="empty-text">暂无标签</text>
      </view>
    </view>

    <view class="section">
      <text class="section-title">背包物品</text>
      <view class="inventory-list">
        <view class="inv-item" v-for="item in userStore.inventory" :key="item.itemId">
          <text class="inv-name">{{ item.itemId }}</text>
          <text class="inv-qty">x{{ item.quantity }}</text>
        </view>
        <text v-if="!userStore.inventory.length" class="empty-text">背包为空</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { getTagDefinition } from '@/data/tags'

const userStore = useUserStore()

const userInitial = computed(() => {
  return (userStore.currentUser.nickname || 'U').charAt(0).toUpperCase()
})

const getTagName = (tagId: string): string => {
  const def = getTagDefinition(tagId)
  return def ? `${def.icon} ${def.name}` : tagId
}
</script>

<style lang="scss" scoped>
@import '@/styles/theme.scss';

.profile-page {
  width: 100%;
  min-height: 100vh;
  background: $gray-50;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom, 0px));
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 32rpx 40rpx;
  background: $white;
  gap: 16rpx;
}

.avatar-circle {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: $gradient-primary;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text { font-size: 64rpx; font-weight: bold; color: $white; }
.nickname { font-size: 36rpx; font-weight: bold; color: $text-primary; }
.bio { font-size: 26rpx; color: $text-secondary; text-align: center; max-width: 500rpx; }
.level-badge { padding: 8rpx 24rpx; background: $gradient-primary; border-radius: $radius-full; }
.level-text { font-size: 24rpx; font-weight: bold; color: $white; }

.stats-row {
  display: flex;
  justify-content: space-around;
  padding: 32rpx;
  background: $white;
  margin-top: 16rpx;
}

.stat-item { display: flex; flex-direction: column; align-items: center; gap: 8rpx; }
.stat-value { font-size: 32rpx; font-weight: bold; color: $text-primary; }
.stat-label { font-size: 22rpx; color: $text-tertiary; }

.section {
  margin-top: 16rpx;
  padding: 32rpx;
  background: $white;
}

.section-title { font-size: 30rpx; font-weight: bold; color: $text-primary; display: block; margin-bottom: 20rpx; }

.tag-list { display: flex; flex-wrap: wrap; gap: 12rpx; }
.tag-item {
  display: flex; align-items: center; gap: 8rpx;
  padding: 12rpx 20rpx; background: rgba($primary-color, 0.08);
  border-radius: $radius-full; border: 1rpx solid rgba($primary-color, 0.15);
}
.tag-name { font-size: 24rpx; color: $primary-dark; }
.tag-weight { font-size: 20rpx; color: $text-tertiary; font-weight: 600; }

.inventory-list { display: flex; flex-direction: column; gap: 12rpx; }
.inv-item { display: flex; justify-content: space-between; padding: 16rpx 20rpx; background: $gray-50; border-radius: $radius-lg; }
.inv-name { font-size: 26rpx; color: $text-primary; }
.inv-qty { font-size: 26rpx; color: $text-secondary; font-weight: 600; }
.empty-text { font-size: 26rpx; color: $text-tertiary; font-style: italic; }
</style>
