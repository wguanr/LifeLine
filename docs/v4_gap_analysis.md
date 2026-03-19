# V4 Gap Analysis: LifeLine 项目现状 vs V4 设计

## 一、项目现状总结

| 维度 | 现状 |
| :--- | :--- |
| 项目名 | `wguanr/LifeLine` (choser-life) |
| 前端框架 | Vue 3 + TypeScript + uni-app (H5/小程序) |
| 状态管理 | Pinia (7 个 store, 共 2175 行) |
| 后端 | Python FastAPI (AIGC 内容 API) + 无数据库 |
| 数据存储 | 前端 `uni.setStorageSync` (本地存储) + 静态 TS 数据文件 |
| 内容管道 | content-pipeline (Python, RSS → AI → Events/Items) |
| 页面 | 探索页(index)、世界线(worldline)、社区(community)、个人(profile) |
| 组件 | EventCard, ItemCard, UserCard, SwipeableCard, WorldTrackSwitch, 社区组件 |
| 设计文档 | choice_design_doc, community_design, event_design_guide |

## 二、核心差距矩阵

### 2.1 架构层面（最大差距）

| V4 需求 | LifeLine 现状 | 差距等级 | 说明 |
| :--- | :--- | :--- | :--- |
| 持久化数据库 | 无数据库，纯本地存储 | **重大** | 需要引入数据库层 |
| 用户认证 | 无认证系统 | **重大** | 多人世界需要用户系统 |
| 后端 API (tRPC/REST) | 仅有 Python AIGC API | **重大** | 需要完整的游戏后端 |
| 实时通信 (WebSocket) | 无 | **中等** | 集体事件需要实时推送 |
| 后台定时任务 | 无 | **中等** | 世界状态更新、标签衰减等 |

### 2.2 数据模型层面

| V4 需求 | LifeLine 现状 | 差距等级 |
| :--- | :--- | :--- |
| CoreResources (INF/CRD/INS/RES) | UserWallet (time/energy/reputation) | **中等** — 需要重新映射 |
| IdentitySpectrum (连续维度) | 离散标签 (UserTag[]) | **重大** — 全新概念 |
| ChronicleEntry (编年史) | choiceHistory (简单数组) | **中等** — 需扩展 |
| WorldState.dimensions | 无 (仅 worldlineRecords) | **重大** — 全新模块 |
| EventLegacy (事件遗产) | 无 | **重大** — 全新概念 |
| Item.sensitivity (世界敏感性) | 固定 effects | **重大** — 全新机制 |
| TrustNetwork (信任网络) | 无 | **重大** — 全新模块 |

### 2.3 游戏引擎层面

| V4 需求 | LifeLine 现状 | 差距等级 |
| :--- | :--- | :--- |
| 4种事件生命周期 | 单一类型 (stages/choices) | **中等** — 需扩展事件模型 |
| 非对称结算 | 固定 rewards/penalties | **重大** — 全新引擎 |
| 集体塑造 (加权投票) | Influencer 系统 (有基础概念) | **中等** — 可扩展 |
| Bonding Curve 动态定价 | 固定 mintCost | **重大** — 全新算法 |
| 世界纪元/潮汐 | 无 | **重大** — 全新系统 |
| 信息分层/市场 | 无 | **重大** — 全新系统 |

## 三、可直接复用的资产

### 前端组件（保留并升级）
1. **EventCard.vue** (3022行) — 核心交互组件，升级为支持 V4 事件模型
2. **ItemCard.vue** (508行) — 升级为支持动态定价和世界敏感性
3. **SwipeableCard.vue** — 卡片滑动交互，直接复用
4. **WorldTrackSwitch.vue** — 世界线切换，直接复用
5. **社区组件** — TopicListView, BoostPanel，作为社交引擎的 UI 基础

### 状态管理逻辑（重构升级）
1. **user.ts** (764行) — 标签可信度计算逻辑可参考
2. **event.ts** (147行) — 事件加载/状态管理模式可参考
3. **influencer.ts** (322行) — 投资/追踪逻辑是集体塑造的原型
4. **world.ts** (322行) — 世界线记录模式可演化为编年史
5. **community.ts** (327行) — 社区逻辑是社交引擎的原型

### 数据内容（迁移）
1. **events.ts + aigc_events.ts + generated_events.ts** — 所有事件数据
2. **items.ts + aigc_items.ts + generated_items.ts** — 所有物品数据
3. **tags.ts + aigc_tags.ts** — 标签定义
4. **users.ts + simulated_users.ts** — 用户数据

### 内容管道（保留并增强）
1. **content-pipeline/** — RSS → AI → Events/Items 管道，直接保留
2. **server/aigc_engine.py** — AIGC 生成引擎，保留并增强

## 四、关键架构决策

1. **是否更换前端框架？**
   → **建议保留 Vue 3 + uni-app**。LifeLine 是独立项目，没有必要迁移到 React。现有的 4823 行组件代码和 2175 行 store 代码都是有价值的资产。

2. **后端技术选型？**
   → **建议 Node.js (Express/Fastify) + Drizzle ORM + SQLite/PostgreSQL**。理由：与前端共享 TypeScript 类型，降低维护成本。现有 Python AIGC API 保留为独立微服务。

3. **数据库选型？**
   → **Phase 1 用 SQLite**（零配置，适合原型和单机开发），**Phase 2+ 迁移到 PostgreSQL**（支持 JSON 查询、并发写入）。

4. **是否引入 tRPC？**
   → **建议不引入 tRPC**。LifeLine 是 Vue 项目，tRPC 的类型安全优势主要在 React 生态。建议用 **REST API + Zod 校验 + 共享类型** 的方式实现类似效果。

5. **认证方案？**
   → Phase 1 先用 **简单的 JWT + 邮箱/密码**，Phase 2 可加入 OAuth。
