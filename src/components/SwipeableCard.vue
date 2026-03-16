<template>
  <view class="swipeable-card">
    <scroll-view class="card-scroll" scroll-y>
      <slot></slot>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  disabled?: boolean
}>()

// 暴露方法给父组件（兼容）
defineExpose({
  closeAllPanels: () => {}
})
</script>

<style lang="scss" scoped>
.swipeable-card {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: $radius-2xl;
}

.card-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
</style>
