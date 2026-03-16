<template>
  <view class="worldline-page">
    <!-- 顶部标题栏 -->
    <view class="header">
      <view class="header-left">
        <text class="title-icon">🌳</text>
        <text class="title">世界线</text>
      </view>
      <view class="header-stats">
        <view class="stat-chip">
          <text class="stat-num">{{ branches.length }}</text>
          <text class="stat-label">事件</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-chip">
          <text class="stat-num">{{ completedCount }}</text>
          <text class="stat-label">完成</text>
        </view>
      </view>
    </view>

    <!-- 世界线树 -->
    <scroll-view class="tree-scroll" scroll-y>
      <view class="tree-wrapper">
        <!-- 主干线 -->
        <view class="trunk-line"></view>

        <!-- 当前时刻指示器 -->
        <view class="now-indicator">
          <view class="now-pulse"></view>
          <text class="now-label">现在</text>
        </view>

        <!-- 分支节点列表 -->
        <view
          v-for="(branch, index) in branches"
          :key="branch.eventId"
          class="branch-node"
          :class="{ 'is-expanded': expandedId === branch.eventId }"
        >
          <!-- 节点圆点（在主干上） -->
          <view
            class="node-dot"
            :class="[branch.completed ? 'dot-completed' : 'dot-active']"
            @click="toggleBranch(branch.eventId)"
          >
            <text class="dot-icon">{{ getTypeIcon(branch.eventType) }}</text>
          </view>

          <!-- 分支线（未展开时） -->
          <view
            v-if="expandedId !== branch.eventId"
            class="branch-arm"
            :class="[index % 2 === 0 ? 'arm-left' : 'arm-right']"
          ></view>

          <!-- 分支卡片（未展开时：左右交替） -->
          <view
            v-if="expandedId !== branch.eventId"
            class="branch-card"
            :class="[
              index % 2 === 0 ? 'card-left' : 'card-right',
              branch.completed ? 'card-completed' : 'card-active'
            ]"
            @click="toggleBranch(branch.eventId)"
          >
            <view class="card-header">
              <view class="card-title-row">
                <text class="card-title">{{ branch.eventTitle }}</text>
                <view class="card-badge" :class="branch.completed ? 'badge-done' : 'badge-active'">
                  <text class="badge-text">{{ branch.completed ? '✓' : '…' }}</text>
                </view>
              </view>
              <text class="card-time">{{ formatRelativeTime(branch.startTime) }}</text>
            </view>
            <view class="expand-hint">
              <text class="expand-arrow">▼ 查看故事</text>
            </view>
          </view>

          <!-- 展开后的详情卡片（居中全宽） -->
          <view
            v-if="expandedId === branch.eventId"
            class="expanded-card"
            :class="branch.completed ? 'card-completed' : 'card-active'"
          >
            <!-- 卡片头部 -->
            <view class="card-header">
              <view class="card-title-row">
                <text class="expanded-title">{{ getTypeIcon(branch.eventType) }} {{ branch.eventTitle }}</text>
                <view class="card-badge" :class="branch.completed ? 'badge-done' : 'badge-active'">
                  <text class="badge-text">{{ branch.completed ? '已完成' : '进行中' }}</text>
                </view>
              </view>
              <text class="card-time">{{ formatRelativeTime(branch.startTime) }}</text>
            </view>

            <!-- 选择时间线 -->
            <view class="card-detail">
              <view class="choice-timeline" v-if="branch.choices.length > 0">
                <text class="detail-section-title">📜 你的选择</text>
                <view
                  v-for="(choice, ci) in branch.choices"
                  :key="choice.id"
                  class="choice-item"
                >
                  <view class="choice-connector">
                    <view class="choice-dot"></view>
                    <view v-if="ci < branch.choices.length - 1 || branch.completed" class="choice-line"></view>
                  </view>
                  <view class="choice-content">
                    <text class="choice-text">{{ choice.text }}</text>
                    <text v-if="choice.resultText" class="choice-result">{{ choice.resultText }}</text>
                  </view>
                </view>
              </view>

              <!-- 无选择时的提示 -->
              <view v-else class="no-choices">
                <text class="no-choices-text">🔮 故事刚刚开始，等待你的抉择...</text>
              </view>

              <!-- 结局摘要 -->
              <view v-if="branch.completed && branch.endingSummary" class="ending-summary">
                <text class="detail-section-title">🏁 结局</text>
                <text class="ending-text">{{ branch.endingSummary }}</text>
              </view>
            </view>

            <!-- 收起按钮 -->
            <view class="collapse-btn" @click="toggleBranch(branch.eventId)">
              <text class="collapse-text">▲ 收起</text>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-if="branches.length === 0" class="empty-state">
          <text class="empty-icon">🌌</text>
          <text class="empty-title">世界线尚未展开</text>
          <text class="empty-desc">去探索页面参与事件，你的每一个选择都将在这里留下痕迹</text>
        </view>

        <!-- 起点节点 -->
        <view class="origin-node">
          <view class="origin-dot">
            <text class="origin-icon">🌱</text>
          </view>
          <text class="origin-label">世界线起点</text>
        </view>
      </view>

      <!-- 底部留白 -->
      <view style="height: 160rpx;"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWorldStore } from '@/stores/world'
import type { WorldlineBranch } from '@/stores/world'

const worldStore = useWorldStore()

// 当前展开的分支ID
const expandedId = ref<string | null>(null)

// 分支列表（按时间倒序，最新在上）
const branches = computed<WorldlineBranch[]>(() => worldStore.worldlineBranches)

// 已完成数
const completedCount = computed(() => branches.value.filter(b => b.completed).length)

// 切换分支展开/收起
function toggleBranch(eventId: string) {
  expandedId.value = expandedId.value === eventId ? null : eventId
}

// 事件类型图标
function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    'social': '💬',
    'story': '📖',
    'challenge': '💼',
    'craft': '🔨',
    'exploration': '🗺️',
    'creation': '✨'
  }
  return icons[type] || '📌'
}

// 格式化相对时间
function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  return `${Math.floor(days / 30)}个月前`
}

// 页面加载时注入演示数据
onMounted(() => {
  worldStore.seedDemoData()
})
</script>

<style lang="scss" scoped>

.worldline-page {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  height: 100vh;
  background: $bg-deep;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;

  // 背景氛围光
  &::before {
    content: '';
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background:
      radial-gradient(ellipse at 30% 0%, rgba($neon-cyan, 0.06) 0%, transparent 60%),
      radial-gradient(ellipse at 70% 100%, rgba($neon-magenta, 0.04) 0%, transparent 60%);
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

  .title-icon {
    font-size: 36rpx;
  }

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

/* ===== 树滚动容器 ===== */
.tree-scroll {
  flex: 1;
  min-height: 0;
  width: 100%;
  position: relative;
  z-index: 1;
}

.tree-wrapper {
  position: relative;
  padding: 40rpx 24rpx calc(120rpx + env(safe-area-inset-bottom, 0px));
  min-height: 100%;
}

/* ===== 主干线 ===== */
.trunk-line {
  position: absolute;
  left: 50%;
  top: 80rpx;
  bottom: 100rpx;
  width: 4rpx;
  background: linear-gradient(
    180deg,
    rgba($neon-cyan, 0.5) 0%,
    rgba($neon-cyan, 0.25) 50%,
    rgba($neon-magenta, 0.15) 100%
  );
  transform: translateX(-50%);
  border-radius: 2rpx;
  box-shadow: 0 0 8rpx rgba($neon-cyan, 0.2);
}

/* ===== 当前时刻指示器 ===== */
.now-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-bottom: 48rpx;
  position: relative;
  z-index: 10;

  .now-pulse {
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    background: $neon-cyan;
    box-shadow: 0 0 8rpx rgba($neon-cyan, 0.6), 0 0 20rpx rgba($neon-cyan, 0.3);
    animation: pulse-ring 2s ease-in-out infinite;
  }

  .now-label {
    font-size: 22rpx;
    color: $neon-cyan;
    font-weight: 600;
    letter-spacing: 2rpx;
    @include neon-text($neon-cyan);
  }
}

/* ===== 分支节点 ===== */
.branch-node {
  position: relative;
  min-height: 140rpx;
  margin-bottom: 40rpx;
}

/* 节点圆点 */
.node-dot {
  position: absolute;
  left: 50%;
  top: 16rpx;
  transform: translateX(-50%);
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  cursor: pointer;
  transition: all $transition-normal;
  border: 3rpx solid $bg-deep;

  .dot-icon {
    font-size: 22rpx;
  }

  &.dot-completed {
    @include glass-effect(0.1);
    box-shadow: 0 2rpx 12rpx rgba($color-success, 0.2);
    border-color: rgba($color-success, 0.3);
  }

  &.dot-active {
    background: linear-gradient(135deg, rgba($neon-cyan, 0.3), rgba($neon-cyan, 0.15));
    box-shadow: 0 0 16rpx rgba($neon-cyan, 0.4);
    border-color: rgba($neon-cyan, 0.5);
    @include neon-glow($neon-cyan, 0.2);
  }
}

/* 分支线 */
.branch-arm {
  position: absolute;
  top: 38rpx;
  width: 36rpx;
  height: 3rpx;
  background: rgba($neon-cyan, 0.2);
  box-shadow: 0 0 4rpx rgba($neon-cyan, 0.1);

  &.arm-left {
    right: 50%;
    margin-right: 26rpx;
  }
  &.arm-right {
    left: 50%;
    margin-left: 26rpx;
  }
}

/* ===== 未展开的分支卡片 ===== */
.branch-card {
  position: absolute;
  top: 0;
  width: calc(50% - 56rpx);
  border-radius: $radius-xl;
  padding: 20rpx 24rpx;
  cursor: pointer;
  transition: all 0.3s ease;

  &.card-left {
    right: calc(50% + 44rpx);
  }
  &.card-right {
    left: calc(50% + 44rpx);
  }

  &.card-completed {
    @include glass-effect(0.06);
    border-color: rgba($color-success, 0.15);
  }

  &.card-active {
    @include glass-effect(0.08);
    border-color: rgba($neon-cyan, 0.25);
    @include neon-glow($neon-cyan, 0.05);
  }

  &:active {
    transform: scale(0.97);
  }
}

/* 卡片头部 */
.card-header {
  .card-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8rpx;
    margin-bottom: 4rpx;
  }

  .card-title {
    font-size: 26rpx;
    font-weight: 600;
    color: $text-primary;
    flex: 1;
    @include text-ellipsis(1);
  }

  .expanded-title {
    font-size: 30rpx;
    font-weight: 700;
    color: $text-primary;
    flex: 1;
  }

  .card-badge {
    flex-shrink: 0;
    width: 36rpx;
    height: 36rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    &.badge-done {
      background: rgba($color-success, 0.15);
      .badge-text { color: $color-success; font-size: 18rpx; }
    }
    &.badge-active {
      background: rgba($neon-cyan, 0.15);
      .badge-text { color: $neon-cyan; font-size: 18rpx; }
    }
  }

  .card-time {
    font-size: 22rpx;
    color: $text-tertiary;
  }
}

/* 展开提示 */
.expand-hint {
  margin-top: 8rpx;
  .expand-arrow {
    font-size: 20rpx;
    color: $text-tertiary;
  }
}

/* ===== 展开后的详情卡片 ===== */
.expanded-card {
  position: relative;
  width: 100%;
  border-radius: $radius-xl;
  padding: 28rpx;
  margin-top: 8rpx;
  z-index: 20;
  animation: card-expand 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-sizing: border-box;

  &.card-completed {
    @include glass-effect(0.08);
    border-color: rgba($color-success, 0.2);
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.3), 0 0 12rpx rgba($color-success, 0.08);
  }

  &.card-active {
    @include glass-effect(0.1);
    border-color: rgba($neon-cyan, 0.3);
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.3), 0 0 12rpx rgba($neon-cyan, 0.1);
  }

  .card-header {
    .card-badge {
      width: auto;
      border-radius: $radius-full;
      padding: 4rpx 16rpx;
    }
  }
}

/* ===== 展开详情内容 ===== */
.card-detail {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.08);
}

.detail-section-title {
  font-size: 24rpx;
  font-weight: 600;
  color: $text-secondary;
  display: block;
  margin-bottom: 16rpx;
}

/* 选择时间线 */
.choice-timeline {
  margin-bottom: 16rpx;
}

.choice-item {
  display: flex;
  gap: 16rpx;
}

.choice-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20rpx;
  flex-shrink: 0;
  padding-top: 8rpx;

  .choice-dot {
    width: 14rpx;
    height: 14rpx;
    border-radius: 50%;
    background: $neon-cyan;
    box-shadow: 0 0 6rpx rgba($neon-cyan, 0.4);
    flex-shrink: 0;
  }

  .choice-line {
    width: 2rpx;
    flex: 1;
    min-height: 16rpx;
    background: rgba($neon-cyan, 0.2);
    margin-top: 4rpx;
  }
}

.choice-content {
  flex: 1;
  padding-bottom: 16rpx;

  .choice-text {
    font-size: 26rpx;
    font-weight: 500;
    color: $text-primary;
    display: block;
    margin-bottom: 8rpx;
  }

  .choice-result {
    font-size: 23rpx;
    color: $text-secondary;
    line-height: 1.55;
    display: block;
    padding: 14rpx 18rpx;
    @include glass-effect(0.06);
    border-radius: $radius-md;
    border-left: 4rpx solid rgba($neon-cyan, 0.3);
  }
}

/* 无选择提示 */
.no-choices {
  padding: 24rpx 0;

  .no-choices-text {
    font-size: 24rpx;
    color: $text-tertiary;
    font-style: italic;
  }
}

/* 结局摘要 */
.ending-summary {
  margin-top: 16rpx;
  padding: 18rpx 22rpx;
  background: rgba($color-success, 0.06);
  border-radius: $radius-lg;
  border: 1rpx solid rgba($color-success, 0.15);

  .ending-text {
    font-size: 24rpx;
    color: $text-secondary;
    line-height: 1.6;
    display: block;
    margin-top: 8rpx;
  }
}

/* 收起按钮 */
.collapse-btn {
  margin-top: 16rpx;
  text-align: center;
  padding: 12rpx;
  cursor: pointer;
  border-radius: $radius-lg;
  transition: all 0.2s ease;

  &:active {
    background: rgba($neon-cyan, 0.08);
  }

  .collapse-text {
    font-size: 22rpx;
    color: $neon-cyan;
    font-weight: 500;
  }
}

/* ===== 空状态 ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 60rpx;
  text-align: center;

  .empty-icon {
    font-size: 80rpx;
    margin-bottom: 24rpx;
  }
  .empty-title {
    font-size: 32rpx;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 12rpx;
  }
  .empty-desc {
    font-size: 24rpx;
    color: $text-tertiary;
    line-height: 1.6;
  }
}

/* ===== 起点节点 ===== */
.origin-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0 20rpx;
  position: relative;
  z-index: 10;

  .origin-dot {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba($neon-cyan, 0.3), rgba($neon-magenta, 0.2));
    display: flex;
    align-items: center;
    justify-content: center;
    @include neon-glow($neon-cyan, 0.2);
    border: 3rpx solid rgba($neon-cyan, 0.4);
    margin-bottom: 12rpx;

    .origin-icon {
      font-size: 32rpx;
    }
  }

  .origin-label {
    font-size: 22rpx;
    color: $text-tertiary;
    font-weight: 500;
  }
}

/* ===== 动画 ===== */
@keyframes pulse-ring {
  0%, 100% {
    box-shadow: 0 0 8rpx rgba($neon-cyan, 0.6), 0 0 20rpx rgba($neon-cyan, 0.3);
  }
  50% {
    box-shadow: 0 0 16rpx rgba($neon-cyan, 0.8), 0 0 40rpx rgba($neon-cyan, 0.1);
  }
}

@keyframes card-expand {
  from {
    opacity: 0;
    transform: translateY(-10rpx) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
