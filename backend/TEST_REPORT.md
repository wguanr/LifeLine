# LifeLine 后端测试报告

**日期**：2026-03-19
**提交**：cfa0f41
**结果**：8 个测试文件，184 个测试，全部通过

## 测试覆盖总览

| 测试文件 | 测试数 | 耗时 | 覆盖模块 |
| :--- | ---: | ---: | :--- |
| `resource.service.test.ts` | 31 | 2.6s | 钱包 CRUD、标签权重更新（含衰减）、背包管理 |
| `social.service.test.ts` | 22 | 3.6s | 关注/取关、互关检测、信任值变化、声誉传播、社交分红 |
| `information.service.test.ts` | 19 | 2.1s | 三层信息生成、谣言生成、信息解锁、市场统计 |
| `event.service.test.ts` | 14 | 0.8s | 事件 CRUD、选择结算（含潮汐乘数）、编年史记录 |
| `world.service.test.ts` | 14 | 0.2s | 世界维度更新、纪元变迁、潮汐计算、快照 |
| `item.service.test.ts` | 10 | 0.5s | Bonding Curve 定价、世界敏感性乘数、购买流程 |
| `api.integration.test.ts` | 42 | 2.3s | 全部 HTTP 端点（auth、game、social、info、debug） |
| `engine-interplay.test.ts` | 32 | 4.3s | 跨引擎联动、边界条件、错误处理 |
| **合计** | **184** | **16.3s** | |

## 测试分类

### 1. Service 层单元测试（110 个）

覆盖 6 个核心 Service 的所有公开方法：

**resource.service（31 个）**：`getWallet`、`updateWallet`、`getUserTags`、`updateTagWeight`（含衰减公式验证）、`getInventory`、`addToInventory`、`removeFromInventory`

**event.service（14 个）**：`getAllEvents`、`getEventById`、`processChoice`（含非对称结算、潮汐乘数联动）、`getUserChoices`、`getUserChronicle`

**item.service（10 个）**：`getAllItems`、`getDynamicPrice`（Bonding Curve 公式验证）、`purchaseItem`（含余额检查、铸造量递增）

**world.service（14 个）**：`getCurrentWorldState`、`updateDimensions`（含 clamp 验证）、`getEpochInfo`、纪元变迁（genesis → golden_age → turmoil）、潮汐乘数计算

**social.service（22 个）**：`follow`/`unfollow`、`getFollowing`/`getFollowers`、`getMutualFriends`、`recordInteraction`（positive/negative/betrayal 信任值变化）、`calculateReputationBonus`、`getSocialOverview`

**information.service（19 个）**：`generateEventInformation`（三层分布验证）、`generateRumor`、`unlockInformation`（含声誉扣减）、`getAvailableInformation`、`getInformationMarketStats`

### 2. API 路由集成测试（42 个）

使用 supertest 对全部 HTTP 端点进行端到端测试：

- **Auth**：`POST /register`、`POST /login`、`GET /me`、重复注册 409、错误密码 401
- **Game**：`GET /events`、`GET /events/:id`、`GET /items`、`GET /tags`、`GET /world`、`POST /choices`、`GET /wallet`、`GET /user/tags`、`GET /inventory`、`GET /worldline`
- **Social**：`POST /follow`、`DELETE /unfollow`、`GET /overview`、`POST /interact`
- **Info**：`GET /available`、`POST /unlock`、`GET /market/stats`
- **Debug**：`GET /status`、`GET /items/prices`、`POST /world/tick`、`POST /world/set-dimensions`
- **Guard**：未认证请求返回 401

### 3. 引擎联动测试（32 个）

**选择结算联动（3 个）**：选择 → 钱包更新、惩罚扣减、多次选择累积历史

**世界维度 → 物品定价（2 个）**：维度变化影响价格、高铸造量 Bonding Curve 价格上升

**纪元变迁与潮汐（3 个）**：高维度触发纪元变迁、低维度变化、潮汐乘数正数验证

**社交引擎联动（5 个）**：关注概览、互关形成、正面互动提升信任、背叛降低信任、声誉加成计算

**信息引擎联动（5 个）**：事件信息生成、免费解锁、付费解锁扣减声誉、声誉不足拒绝、市场统计

**完整生命周期（3 个）**：注册 → 选择 → 验证全流程、多用户并发不干扰、社交 + 信息完整流程

**边界条件（5 个）**：资源不能为负、维度 clamp 到 [0,1]、不能关注自己、重复关注幂等、空 ID 不崩溃

**错误处理（5 个）**：不存在的事件/物品/信息优雅处理、无关系用户返回空、新用户零值

## 发现并修复的 Bug

| Bug | 文件 | 严重性 | 描述 |
| :--- | :--- | :--- | :--- |
| `req.userId` 未定义 | `social.route.ts` | **高** | auth 中间件设置的是 `req.user.userId`，但路由中使用了 `req.userId`，导致所有社交 API 在生产环境中 400 |
| `req.userId` 未定义 | `information.route.ts` | **高** | 同上，所有信息 API 在生产环境中 400 |

## 测试基础设施

- **框架**：Vitest 3.x（单线程模式，避免 SQLite 并发冲突）
- **数据库隔离**：每个测试文件使用独立的 `test.db`，`beforeEach` 清空所有表
- **辅助函数**：`createTestUser`、`createTestEvent`、`createTestItem`、`createTestInfo`、`createTestRelation`
- **运行方式**：`cd backend && pnpm test`
