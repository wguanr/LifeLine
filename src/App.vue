<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'

onLaunch(() => {
  const userStore = useUserStore()
  userStore.initUser()
})

onShow(() => {
  // App visible
})

onHide(() => {
  // App hidden
})
</script>

<style lang="scss">
@import '@/styles/theme.scss';

/* 全局样式 - 极简主义白色系 */
page {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
  font-size: 28rpx;
  line-height: 1.6;
  color: $text-primary;
  background: $white;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  
  // 柔和的背景渐变
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(ellipse at 0% 0%, rgba($green-400, 0.08) 0%, transparent 50%),
      radial-gradient(ellipse at 100% 100%, rgba($gold-400, 0.06) 0%, transparent 50%),
      linear-gradient(180deg, $white 0%, $gray-50 100%);
    pointer-events: none;
    z-index: -1;
  }
}

/* 重置样式 */
view, text, image, button {
  box-sizing: border-box;
}

button {
  margin: 0;
  padding: 0;
  background: none;
  border: none;
  outline: none;
  
  &::after {
    border: none;
  }
}

/* 滚动条美化 - 白色系 */
::-webkit-scrollbar {
  width: 8rpx;
  height: 8rpx;
}

::-webkit-scrollbar-track {
  background: $gray-100;
  border-radius: 4rpx;
}

::-webkit-scrollbar-thumb {
  background: $gray-300;
  border-radius: 4rpx;
  
  &:hover {
    background: $gray-400;
  }
}

/* 通用工具类 */
.flex {
  display: flex;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.text-center {
  text-align: center;
}

.text-bold {
  font-weight: 700;
}

.text-gradient {
  background: linear-gradient(135deg, #10B981 0%, #FBBF24 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 玻璃卡片效果 - 增强版 */
.glass-card {
  @include glass-card;
}

.glass-surface {
  @include glass-effect(0.8);
}

.glass-panel {
  @include glass-panel;
}

.glass-tinted {
  @include glass-tinted($primary-color);
}

/* 发光效果 */
.glow-primary {
  @include glow-effect($primary-color, 0.25);
}

.glow-accent {
  @include glow-effect($accent-color, 0.25);
}

.glow-success {
  @include glow-effect($color-success, 0.25);
}

/* 按钮样式 */
.btn-primary {
  @include btn-primary;
}

.btn-secondary {
  @include btn-secondary;
}

.btn-accent {
  @include btn-accent;
}

/* 标签样式 */
.tag-primary {
  @include tag-style($primary-color);
}

.tag-accent {
  @include tag-style($accent-color);
}

.tag-success {
  @include tag-style($color-success);
}

.tag-warning {
  @include tag-style($color-warning);
}

/* 安全区域适配 - 移动端优化 */
.safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-area-top {
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}

/* 触控优化 */
.touch-target {
  min-height: $touch-target-min;
  min-width: $touch-target-min;
}

/* 动画类 */
.animate-fade-in {
  animation: fade-in-up 0.4s ease-out;
}

.animate-scale {
  animation: scale-in 0.3s ease-out;
}

/* 分割线 - 白色系 */
.divider {
  height: 1rpx;
  background: linear-gradient(90deg, transparent, $gray-200, transparent);
  margin: $spacing-lg 0;
}

/* 骨架屏 - 白色系 */
.skeleton {
  background: linear-gradient(
    90deg,
    $gray-100 25%,
    $gray-50 50%,
    $gray-100 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: $radius-md;
}

/* 阴影效果 */
.shadow-sm {
  box-shadow: $shadow-sm;
}

.shadow-md {
  box-shadow: $shadow-md;
}

.shadow-lg {
  box-shadow: $shadow-lg;
}

/* 圆角 */
.rounded-lg {
  border-radius: $radius-lg;
}

.rounded-xl {
  border-radius: $radius-xl;
}

.rounded-full {
  border-radius: $radius-full;
}
</style>
