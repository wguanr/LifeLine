# LifeLine 后端测试报告

> 生成时间：2026-03-19
> 框架：Vitest 4.1.0 + supertest
> 运行模式：单线程（SQLite 并发安全）

## 总览

| 指标 | 数值 |
| :--- | ---: |
| 测试文件 | 10 |
| 测试用例 | 292 |
| 通过 | 292 |
| 失败 | 0 |
| 耗时 | ~23s |
| Service 方法覆盖 | 55/55 (100%) |
| API 端点覆盖 | 51/51 (100%) |

## 测试文件清单

| 文件 | 测试数 | 类型 | 覆盖范围 |
| :--- | ---: | :--- | :--- |
| `services/resource.service.test.ts` | 31 | 单元 | 钱包 CRUD、canAfford、标签权重更新/衰减、背包管理、购买物品、用户历史 |
| `services/event.service.test.ts` | 26 | 单元 | 事件查询、startEvent、processChoice（含非对称结算）、completeEvent、选择历史、世界线记录、事件遗产 |
| `services/item.service.test.ts` | 10 | 单元 | Bonding Curve 定价、世界状态敏感性、getAllItemsWithPrices、buyItemDynamic |
| `services/world.service.test.ts` | 14 | 单元 | 世界维度更新、纪元变迁（创世纪→启蒙时代→黄金时代→衰退期→黑暗时代）、潮汐乘数、getAllEpochs |
| `services/social.service.test.ts` | 26 | 单元 | 关注/取关、互动记录（positive/negative/betrayal）、信任衰减、互关检测、声誉加成、社交分红、圈子倾向 |
| `services/information.service.test.ts` | 19 | 单元 | 信息生成（三层分级）、解锁（声誉扣减）、分享（声誉奖励+衰减）、谣言生成、市场统计 |
| `jobs/world-tick.job.test.ts` | 13 | 单元 | executeWorldTick（维度漂移+潮汐调节）、startWorldTick/stopWorldTick（幂等性）、getTickHistory |
| `routes/api.integration.test.ts` | 81 | 集成 | 全部 HTTP 端点：auth(12) + game(28) + social(16) + info(12) + debug(13) |
| `integration/engine-interplay.test.ts` | 32 | 联动 | 选择→世界维度、维度→物品价格、潮汐→结算乘数、纪元变迁级联、边界条件(6)、错误处理(5) |
| `integration/engine-interplay-extended.test.ts` | 40 | 联动 | 购买全链路(5)、选择→标签(5)、世界Tick→价格(6)、社交分红(4)、信息分享(4)、事件遗产(4)、边界条件(6)、错误处理(6) |

## Service 层覆盖率（55 个方法 → 139 个测试）

### resource.service — 14 methods, 31 tests

| 方法 | 测试数 | 状态 |
| :--- | ---: | :--- |
| `getWallet` | 2 | PASS |
| `canAfford` | 4 | PASS |
| `deductResources` | 2 | PASS |
| `addResources` | 2 | PASS |
| `getUserTags` | 2 | PASS |
| `updateTagWeight` | 3 | PASS |
| `updateTagWeights` | 1 | PASS |
| `decayTagWeights` | 2 | PASS |
| `getInventory` | 1 | PASS |
| `addItem` | 3 | PASS |
| `removeItem` | 4 | PASS |
| `buyItem` | 3 | PASS |
| `getUserHistory` | 1 | PASS |
| `updateUserHistory` | 1 | PASS |

### event.service — 9 methods, 26 tests

| 方法 | 测试数 | 状态 |
| :--- | ---: | :--- |
| `getActiveEvents` | 2 | PASS |
| `getEventById` | 2 | PASS |
| `startEvent` | 3 | PASS |
| `processChoice` | 8 | PASS |
| `completeEvent` | 3 | PASS |
| `getUserChoices` | 2 | PASS |
| `getWorldlineRecords` | 2 | PASS |
| `createEventLegacy` | 2 | PASS |
| `getEventLegacies` | 2 | PASS |

### item.service — 3 methods, 10 tests

| 方法 | 测试数 | 状态 |
| :--- | ---: | :--- |
| `getDynamicPrice` | 4 | PASS |
| `getAllItemsWithPrices` | 2 | PASS |
| `buyItemDynamic` | 4 | PASS |

### world.service — 4 methods, 14 tests

| 方法 | 测试数 | 状态 |
| :--- | ---: | :--- |
| `getCurrentWorldState` | 1 | PASS |
| `updateDimensions` | 9 | PASS |
| `getEpochInfo` | 3 | PASS |
| `getAllEpochs` | 1 | PASS |

### social.service — 11 methods, 26 tests

| 方法 | 测试数 | 状态 |
| :--- | ---: | :--- |
| `follow` | 3 | PASS |
| `unfollow` | 2 | PASS |
| `recordInteraction` | 6 | PASS |
| `applyTrustDecay` | 1 | PASS |
| `getFollowing` | 1 | PASS |
| `getFollowers` | 1 | PASS |
| `getMutualFriends` | 2 | PASS |
| `calculateReputationBonus` | 2 | PASS |
| `distributeSocialDividend` | 3 | PASS |
| `getCircleTendency` | 3 | PASS |
| `getSocialOverview` | 2 | PASS |

### information.service — 7 methods, 19 tests

| 方法 | 测试数 | 状态 |
| :--- | ---: | :--- |
| `generateEventInformation` | 3 | PASS |
| `unlockInformation` | 6 | PASS |
| `shareInformation` | 4 | PASS |
| `generateRumor` | 1 | PASS |
| `getUserInformation` | 1 | PASS |
| `getAvailableInformation` | 1 | PASS |
| `getInformationMarketStats` | 3 | PASS |

### world-tick.job — 4 exports, 13 tests

| 方法 | 测试数 | 状态 |
| :--- | ---: | :--- |
| `executeWorldTick` | 7 | PASS |
| `startWorldTick` | 3 | PASS |
| `stopWorldTick` | 1 | PASS |
| `getTickHistory` | 2 | PASS |

## API 路由覆盖率（51 个端点 → 81 个测试）

### auth.route — 5 endpoints, 12 tests

| 端点 | 测试数 | 状态 |
| :--- | ---: | :--- |
| `POST /api/auth/register` | 5 | PASS |
| `POST /api/auth/login` | 3 | PASS |
| `GET /api/auth/me` | 2 | PASS |
| `PATCH /api/auth/me` | 1 | PASS |
| 401 守卫（未认证） | 1 | PASS |

### game.route — 18 endpoints, 28 tests

| 端点 | 测试数 | 状态 |
| :--- | ---: | :--- |
| `GET /api/events` | 1 | PASS |
| `GET /api/events/:id` | 2 | PASS |
| `POST /api/events/:id/start` | 2 | PASS |
| `POST /api/events/:id/complete` | 2 | PASS |
| `POST /api/choices` | 2 | PASS |
| `GET /api/choices` | 1 | PASS |
| `GET /api/items` | 1 | PASS |
| `POST /api/items/:id/buy` | 2 | PASS |
| `GET /api/tags` | 1 | PASS |
| `GET /api/wallet` | 2 | PASS |
| `GET /api/user/tags` | 1 | PASS |
| `GET /api/inventory` | 1 | PASS |
| `GET /api/user/history` | 2 | PASS |
| `GET /api/world` | 1 | PASS |
| `GET /api/world/epochs` | 1 | PASS |
| `GET /api/worldline` | 2 | PASS |
| `GET /api/legacies` | 1 | PASS |
| 401 守卫（未认证） | 3 | PASS |

### social.route — 9 endpoints, 16 tests

| 端点 | 测试数 | 状态 |
| :--- | ---: | :--- |
| `POST /api/social/follow` | 2 | PASS |
| `POST /api/social/unfollow` | 1 | PASS |
| `GET /api/social/following` | 2 | PASS |
| `GET /api/social/followers` | 1 | PASS |
| `GET /api/social/mutuals` | 1 | PASS |
| `GET /api/social/overview` | 1 | PASS |
| `POST /api/social/interact` | 2 | PASS |
| `GET /api/social/reputation-bonus` | 2 | PASS |
| `GET /api/social/circle-tendency/:eventId` | 2 | PASS |
| 401 守卫（未认证） | 2 | PASS |

### information.route — 7 endpoints, 12 tests

| 端点 | 测试数 | 状态 |
| :--- | ---: | :--- |
| `GET /api/info/available` | 2 | PASS |
| `GET /api/info/my` | 2 | PASS |
| `GET /api/info/market` | 1 | PASS |
| `POST /api/info/generate/:eventId` | 1 | PASS |
| `POST /api/info/unlock` | 2 | PASS |
| `POST /api/info/share` | 2 | PASS |
| `POST /api/info/generate-rumor` | 1 | PASS |
| 401 守卫（未认证） | 1 | PASS |

### debug.route — 14 endpoints, 13 tests

| 端点 | 测试数 | 状态 |
| :--- | ---: | :--- |
| `GET /api/debug/status` | 1 | PASS |
| `GET /api/debug/items/prices` | 1 | PASS |
| `GET /api/debug/items/:id/price` | 2 | PASS |
| `POST /api/debug/world/tick` | 1 | PASS |
| `GET /api/debug/world/tick-history` | 1 | PASS |
| `GET /api/debug/world/snapshots` | 1 | PASS |
| `POST /api/debug/world/set-dimensions` | 1 | PASS |
| `POST /api/debug/simulate-choice` | 2 | PASS |
| `POST /api/debug/reset-user` | 2 | PASS |
| `GET /api/debug/phase3/status` | 1 | PASS |
| `POST /api/debug/social/create-test-users` | 2 | PASS |
| `POST /api/debug/social/setup-network` | 2 | PASS |
| `POST /api/debug/info/generate-all` | 1 | PASS |
| `POST /api/debug/info/force-rumor` | 1 | PASS |

## 引擎联动测试（72 个测试）

### engine-interplay.test.ts — 32 tests

| 场景 | 测试数 | 状态 |
| :--- | ---: | :--- |
| 选择结算联动世界状态 | 5 | PASS |
| 物品定价联动世界维度 | 5 | PASS |
| 潮汐乘数联动结算 | 5 | PASS |
| 纪元变迁级联效应 | 6 | PASS |
| 边界条件 | 6 | PASS |
| 错误处理 | 5 | PASS |

### engine-interplay-extended.test.ts — 40 tests

| 场景 | 测试数 | 状态 |
| :--- | ---: | :--- |
| 购买物品全链路（Bonding Curve + 标签 + 钱包） | 5 | PASS |
| 选择结算与标签联动 | 5 | PASS |
| 世界 Tick 全链路（维度漂移 → 价格联动） | 6 | PASS |
| 社交分红联动（粉丝钱包增加） | 4 | PASS |
| 信息分享全链路（生成 → 解锁 → 分享 → 接收） | 4 | PASS |
| 事件遗产全链路（start → choice → complete → legacy） | 4 | PASS |
| 扩展边界条件（空标签、极端维度、零铸造量等） | 6 | PASS |
| 扩展错误处理（不存在的 ID、重复操作、资源不足等） | 6 | PASS |

## 测试发现并修复的 Bug

| Bug | 文件 | 严重性 | 描述 |
| :--- | :--- | :--- | :--- |
| `req.userId` 未定义 | `social.route.ts` | **高** | auth 中间件设置 `req.user.userId`，但路由使用 `req.userId`，导致所有社交 API 返回 400 |
| `req.userId` 未定义 | `information.route.ts` | **高** | 同上，所有信息 API 返回 400 |

## 测试基础设施

测试框架使用 Vitest 4.1.0，配置为单线程模式以避免 SQLite 并发冲突。HTTP 集成测试通过 supertest 直接调用 Express 应用实例，无需启动真实服务器。数据库隔离策略为每个测试文件使用独立的 `test.db`，并在 `beforeEach` 钩子中清空所有表确保测试间无状态污染。

测试辅助函数包括 `createTestUser`、`createTestEvent`、`createTestItem`、`createTestInfo`、`createTestRelation`，均通过 Drizzle ORM 直接操作数据库，与 Service 层使用同一个数据库连接，避免双连接不一致问题。

**运行方式**：`cd backend && pnpm test`
