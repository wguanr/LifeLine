# LifeLine V4 经济系统：实施与迁移计划 (修正版)

**作者：Manus AI**
**日期：2026-03-19**

---

## 1. 总体策略与原则 (修正版)

非常抱歉，之前的计划错误地将 LifeLine 视为 `Iahuijuan` 的子项目。在重新审阅了 `wguanr/LifeLine` 仓库后，现为您呈上针对该独立项目的正确实施计划。

**核心策略：**

- **保留前端，重构后端**：保留并升级现有的 **Vue 3 + uni-app** 前端，这是您项目的核心资产。抛弃纯前端本地存储的模式，引入一个全新的、功能完备的 **Node.js 后端**，将 LifeLine 从单机原型升级为真正的网络游戏。
- **技术栈选型**：
    - **后端**: **Node.js + Express.js + Drizzle ORM**。与前端共享 TypeScript，降低开发和维护成本。
    - **数据库**: **Phase 1 使用 SQLite** (零配置，便于快速开发和单机运行)，**Phase 2+ 迁移到 PostgreSQL** (支持更复杂的查询和高并发)。
    - **API 风格**: **RESTful API + Zod 校验**。不引入 tRPC，以保持技术栈的简洁性，同时通过共享类型和 Zod 保证接口的健壮性。
- **架构演进**：
    - **主游戏后端 (Node.js)**：负责处理所有核心游戏逻辑，包括用户、事件、物品、世界状态等。
    - **AIGC 内容管道 (Python)**：保留现有的 `content-pipeline` 和 `server/api_server.py` 作为独立的微服务，专门负责从新闻源生成游戏内容，并通过 API 推送给主游戏后端。
- **分阶段交付**：严格遵循 V4 设计文档中的 **MVP → Beta → GA** 三阶段规划，确保每个阶段都有可测试、可交付的价值。

## 2. 实施路线图：三阶段走

### 第一阶段：MVP - 从单机到联网 (预计 3-4 周)

此阶段的目标是为 LifeLine 搭建一个真正的后端，将核心数据从本地存储迁移到数据库，实现用户认证和数据持久化。

| 任务模块 | 任务项 | 涉及文件/组件/表 | 验收标准 |
| :--- | :--- | :--- | :--- |
| **1. 后端：从零到一** | 初始化 Node.js + Express + TypeScript 后端项目，建立 `backend/` 目录。 | `backend/` | 一个能运行并提供 `/ping` 接口的 Express 服务器。 |
| | 引入 Drizzle ORM，配置 SQLite 数据库，并定义 MVP 阶段的核心表。 | `backend/src/db/schema.ts` (`ll_users`, `ll_world_state`, `ll_events`...) | Drizzle schema 定义完成，可生成并执行迁移。 |
| | 实现简单的 JWT 用户认证（注册/登录），并创建用户路由。 | `backend/src/routes/auth.route.ts` | 用户可以通过 API 注册和登录，并获取 token。 |
| | **重构引擎为 Service**：将 V4 设计中的资源、身份、世界状态、事件引擎实现为后端的 Service 层。 | `backend/src/services/*.service.ts` | 后端具备处理核心游戏逻辑的能力。 |
| **2. 前端：连接后端** | **API Client**：创建一个 API client (`src/api/index.ts`)，用于调用新的后端 REST API。 | `src/api/index.ts` | 前端可以方便地调用所有后端接口。 |
| | **重构 Pinia Stores**：修改 `user.ts`, `event.ts`, `world.ts` 等 stores，将 `uni.setStorageSync` 的逻辑替换为对后端 API 的调用。 | `src/stores/*.ts` | 应用启动时从后端加载用户数据，操作时将数据保存到后端。 |
| | **登录/注册页面**：创建一个简单的登录/注册页面。 | `src/pages/login/login.vue` | 用户可以登录或注册，应用能保存 JWT token。 |
| **3. 数据迁移** | 编写 Node.js 脚本，将 `src/data/` 下的所有 mock 数据（users, events, items, tags）导入到新的 SQLite 数据库中。 | `backend/scripts/seed.ts` | 数据库包含完整的原型内容，新用户登录后能看到事件卡片。 |

**第一阶段完成后，LifeLine 将从一个单机应用变为一个拥有账户系统和持久化数据的网络游戏。虽然游戏玩法没有大变，但为后续所有在线功能的开发奠定了基础。**

---

### 第二阶段：Beta - 经济的血肉 (预计 3-4 周)

此阶段的目标是在已联网的架构上，实现 V4 设计中的核心动态经济系统。

| 任务模块 | 任务项 | 涉及文件/组件/表 | 验收标准 |
| :--- | :--- | :--- | :--- |
| **1. 后端：经济引擎** | **物品引擎**：实现“世界状态敏感性”和“Bonding Curve 动态定价”。 | `backend/src/services/item.service.ts` | 物品的价格会根据世界状态和购买行为动态变化。 |
| | **世界状态引擎 (完整版)**：实现“世界纪元”和“资源潮汐”的后台定时任务。 | `backend/src/jobs/world-tick.job.ts` | 创建一个定时任务（如每小时），定期更新纪元和潮汐。 |
| | **事件引擎 (完整版)**：实现基于身份和世界状态的“非对称结算”。 | `backend/src/services/event.service.ts` | 事件结算不再是固定值，而是根据用户的身份和当前世界状态动态计算。 |
| **2. 前端：策略界面** | **世界状态仪表盘**：在 `profile` 或新页面中，可视化当前的世界纪元、资源潮汐和核心维度。 | `src/components/WorldStatusDashboard.vue` | 用户可以直观地看到宏观经济环境。 |
| | **物品市场**：创建一个 `market` 页面，展示所有可购买的物品及其动态价格。 | `src/pages/market/market.vue` | 用户可以浏览和购买物品。 |
| | **升级 EventCard**：`EventCard.vue` 需要能展示非对称结算的预期收益。 | `src/components/EventCard.vue` | 选项下方会提示“基于你 [身份]，预计获得...” |

**第二阶段完成后，游戏的核心经济循环和策略深度将基本成型，可进行小范围的玩家测试。**

---

### 第三阶段：GA - 涌现的灵魂 (预计 3-4 周)

此阶段的目标是加入能催生复杂涌现行为的顶级系统，并打磨最终的用户体验。

| 任务模块 | 任务项 | 涉及文件/组件/表 | 验收标准 |
| :--- | :--- | :--- | :--- |
| **1. 后端：高级系统** | **社交引擎**：实现“信任网络”和“声誉传播”模型。 | `backend/src/services/social.service.ts` | 用户之间可以建立和改变信任值。 |
| | **信息引擎**：实现“信息分层”和“信息市场”的逻辑。 | `backend/src/services/information.service.ts` | 用户可以消耗 INS 解锁事件的隐藏信息。 |
| | **实时通信**：引入 WebSocket (如 `socket.io`)，用于实时推送集体事件的状态更新。 | `backend/src/websocket.ts` | 当多个玩家参与同一个 `Persistent` 事件时，他们的选择能被其他玩家实时看到。 |
| **2. 前端：沉浸式体验** | **因果链可视化**：在事件结算时，用 V4 设计的“涟漪动画”代替简单的数字跳动。 | `src/components/RippleEffect.vue` | 用户的每个选择都能看到其在个人、事件、世界三个层面的影响。 |
| | **集体涟漪仪表盘**：开发一个高级数据可视化页面，展示世界历史的宏大脉动。 | `src/pages/chronicle/chronicle.vue` | 玩家可以像上帝一样回顾整个世界的演化历史。 |

**第三阶段完成后，整个 V4 设计将全部实现，一个复杂、动态、充满涌现可能的“人生模拟器”正式诞生。**

## 3. 项目目录结构规划 (修正版)

```
LifeLine/
├── backend/                         # [新增] Node.js 后端
│   ├── src/
│   │   ├── db/                      # Drizzle ORM 相关
│   │   │   └── schema.ts            # 数据库表定义
│   │   ├── services/                # 核心游戏逻辑服务
│   │   ├── routes/                  # Express 路由
│   │   ├── jobs/                    # 后台定时任务
│   │   ├── utils/
│   │   ├── index.ts                 # Express 服务器入口
│   │   └── shared-types.ts          # 与前端共享的类型定义
│   ├── scripts/
│   │   └── seed.ts                  # 数据迁移脚本
│   ├── package.json
│   └── tsconfig.json
│
├── content-pipeline/                # [保留] Python 内容生成管道
│
├── server/                          # [保留] Python AIGC API 微服务
│
├── src/                             # [重构] Vue 3 + uni-app 前端
│   ├── api/                       # [新增] API Client
│   │   └── index.ts
│   ├── stores/                    # [重构] Pinia stores，调用 API
│   ├── pages/
│   │   ├── login/                 # [新增] 登录页
│   │   └── ...
│   └── ...
│
├── package.json
└── vite.config.ts
```

## 4. 第一步行动指南：Sprint 0 (修正版)

建议用 **2-3 天** 完成 Sprint 0，为项目引入后端能力。

| 序号 | 任务 | 产出 | 预计时间 |
| :--- | :--- | :--- | :--- |
| 1 | 在 `LifeLine/` 下创建 `backend/` 目录，运行 `npm init`，安装 Express, TypeScript, Drizzle ORM, SQLite3。 | 一个基本的 Node.js 项目结构 | 2h |
| 2 | 创建 `backend/src/db/schema.ts`，定义 `ll_users` 表，运行 Drizzle 命令生成并应用到 `lifeline.db` 文件。 | 一个包含 `ll_users` 表的 SQLite 文件 | 2h |
| 3 | 创建 `backend/src/routes/auth.route.ts`，实现 `/register` 和 `/login` 接口，使用 JWT。 | 可通过 Postman 调通的注册登录接口 | 3h |
| 4 | 在 Vue 项目中创建 `src/pages/login/login.vue`，并能成功调用后端接口完成登录，将 token 存入本地存储。 | 一个可以实际登录的前端页面 | 3h |
| 5 | 重构 `src/stores/user.ts` 的 `login` 方法，使其调用后端 API，并在 App 启动时尝试用 token 获取用户信息。 | 一个能持久化登录状态的前端应用 | 2h |

**Sprint 0 完成后，您将拥有一个具备了账户系统的 LifeLine，为后续所有网络功能的开发铺平了道路。**
