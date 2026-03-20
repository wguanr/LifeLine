# 前端升级审阅笔记

## 现有后端 API 端点（全部可用）

### 已在前端 api/index.ts 中封装的
- `/api/auth/*` — 注册、登录、获取/更新用户信息
- `/api/events` / `/api/events/:id` — 事件列表和详情
- `/api/events/:id/start` / `/api/events/:id/complete` — 事件生命周期
- `/api/choices` — 记录选择（含非对称结算）、获取选择历史
- `/api/items` / `/api/items/:id/buy` — 物品列表和购买（固定价格）
- `/api/wallet` / `/api/user/tags` / `/api/inventory` / `/api/user/history` — 用户资源
- `/api/world` / `/api/world/epochs` — 世界状态和纪元
- `/api/worldline` — 世界线记录
- `/api/legacies` — 事件遗产
- `/api/tags` — 标签定义

### 未在前端封装的（需要新增）
- `/api/social/follow` — POST 关注用户
- `/api/social/unfollow` — POST 取消关注
- `/api/social/following` — GET 关注列表
- `/api/social/followers` — GET 粉丝列表
- `/api/social/mutuals` — GET 互相关注
- `/api/social/overview` — GET 社交网络概览
- `/api/social/interact` — POST 记录互动（positive/negative/betrayal）
- `/api/social/reputation-bonus` — GET 社交圈声誉加成
- `/api/social/circle-tendency/:eventId` — GET 圈子选择倾向
- `/api/info/available` — GET 可用信息列表
- `/api/info/my` — GET 已解锁信息
- `/api/info/market` — GET 信息市场统计
- `/api/info/generate/:eventId` — POST 生成事件信息
- `/api/info/unlock` — POST 解锁信息
- `/api/info/share` — POST 分享信息
- `/api/info/generate-rumor` — POST 生成谣言

### 后端有但前端未使用动态定价 API
- `item.service.ts` 有 `getDynamicPrice()` 和 `getAllItemsWithPrices()` 和 `buyItemDynamic()`
- 但 `game.route.ts` 中的 `/api/items` 仍返回固定价格
- 需要新增路由或修改现有路由来暴露动态定价

## 需要新增的前端路由（pages.json）
- `pages/market/market` — 物品市场页面

## 已有的前端组件
- `RippleCanvas.vue` — 已有完整的涟漪动画组件（353行）
- `dashboard.vue` — 已有世界仪表盘（720行），包含世界状态、涟漪可视化、信息市场、编年史、WebSocket

## 非对称结算引擎
- 后端 `processChoice()` 已实现三重乘数：身份系数 * 潮汐系数 * 纪元加成
- 返回值包含 `settlement` 对象（identityMultiplier, tideMultiplier, epochBonus, epoch, worldImpact）
- 前端 EventCard 尚未展示这些结算预览信息

## 需要新增的后端路由
- `/api/items/market` — 返回所有物品的动态价格（调用 getAllItemsWithPrices）
- `/api/items/:id/price` — 返回单个物品的动态价格（调用 getDynamicPrice）
- `/api/settlement/preview` — 预览非对称结算结果（不实际执行）

## 设计风格
- 暗色主题：#0a0a1a → #1a1a2e 渐变
- 卡片：rgba(255,255,255,0.05) 背景，rgba(255,255,255,0.08) 边框
- 主色调：#00e5ff（青色），#4FC3F7（浅蓝）
- 使用 rpx 单位（uni-app）
- 移动端优先
