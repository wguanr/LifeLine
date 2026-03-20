# 前端弹出面板交互审计

## 需要添加手势下拉关闭的面板

### 1. 首页 index.vue — 两个 bottom-sheet
- 详情面板 (showDetailSheet): 行 287-564，从底部弹出，最大高度 75vh
- 操作面板 (showActionsSheet): 行 566-659，从底部弹出
- 当前关闭方式: 点击 sheet-handle / sheet-close 按钮 / 点击遮罩层
- 需要: 添加手势下拉关闭

### 2. 物品市场 market.vue — modal-overlay
- 物品详情弹窗 (selectedItem): 行 196-280，居中弹窗
- 当前关闭方式: 点击遮罩层 / 点击关闭按钮
- 需要: 改造为底部弹出 + 手势下拉关闭

### 3. 个人页 profile.vue — detail-modal
- 详情弹窗: 行 179
- 需要: 检查后决定是否改造

## 实现方案
创建通用 SwipeDownSheet 组件，封装手势下拉关闭逻辑：
- touchstart 记录起始 Y
- touchmove 计算下拉距离，实时 transform 跟随手指
- touchend 判断下拉距离/速度，超过阈值则关闭，否则回弹
- 支持 scroll-view 内部滚动到顶部后才触发下拉
