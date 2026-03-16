<template>
  <view class="base-card" :class="cardClasses">
    <!-- 稀有度霓虹光晕（可选） -->
    <view class="rarity-accent" :class="rarity" v-if="rarity && rarity !== 'common'" />
    
    <!-- 内容区 -->
    <view class="base-card-content">
      <slot></slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  /** 稀有度，控制霓虹光晕效果 */
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  /** 额外的根容器 class */
  extraClass?: string
}>(), {
  rarity: undefined,
  extraClass: ''
})

const cardClasses = computed(() => {
  const classes: Record<string, boolean> = {}
  if (props.rarity) {
    classes[`rarity-${props.rarity}`] = true
  }
  if (props.extraClass) {
    props.extraClass.split(' ').forEach(c => {
      if (c) classes[c] = true
    })
  }
  return classes
})
</script>

<style lang="scss" scoped>
// ==================== BaseCard 基类样式 ====================
// 所有卡片共享的根容器、内容区、稀有度光效

.base-card {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  background: transparent;
  border-radius: $radius-2xl;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  // ===== 稀有度霓虹光晕 =====
  &.rarity-legendary {
    @include neon-glow($neon-amber, 0.15);
  }
  &.rarity-epic {
    @include neon-glow($neon-magenta, 0.12);
  }
  &.rarity-rare {
    @include neon-glow($color-info, 0.1);
  }
  &.rarity-uncommon {
    @include neon-glow($neon-cyan, 0.08);
  }
}

// 稀有度侧边光带（替代旧的顶部颜色条，改为左侧 2rpx 竖线）
.rarity-accent {
  position: absolute;
  top: 24rpx;
  left: 0;
  bottom: 24rpx;
  width: 3rpx;
  border-radius: 0 2rpx 2rpx 0;
  z-index: 1;
  
  &.uncommon {
    background: linear-gradient(180deg, transparent, $neon-cyan, transparent);
  }
  &.rare {
    background: linear-gradient(180deg, transparent, $color-info, transparent);
  }
  &.epic {
    background: linear-gradient(180deg, transparent, $neon-magenta, transparent);
  }
  &.legendary {
    background: linear-gradient(180deg, transparent, $neon-amber, transparent);
    animation: accent-shimmer 2s ease-in-out infinite alternate;
  }
}

@keyframes accent-shimmer {
  0% { opacity: 0.6; }
  100% { opacity: 1; }
}

// 内容区：统一的滚动容器
.base-card-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 28rpx;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
</style>
