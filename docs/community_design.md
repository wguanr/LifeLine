# LifeLine 社区模块架构设计

> **版本**：v1.0
> **日期**：2026-03-16
> **定位**：社区模块位于底部导航栏的【世界线】和【我的】之间，提供话题驱动的社区交流功能

---

## 一、核心概念

社区模块是 LifeLine 中用户之间交流互动的核心场所。与传统社区不同，LifeLine 社区的核心机制是**资源驱动排序**——用户在话题中的发帖、回复、点赞、助力等行为都需要消耗资源（时间/精力），消耗资源越多的内容排序越靠前。这一机制确保了高质量、高投入的内容获得更多曝光，同时与 LifeLine 的资源经济系统深度绑定。

---

## 二、数据模型

### 2.1 话题（Topic）

话题是社区的基本单元，每个话题代表一个讨论主题。话题列表限制为 20 个，屏幕同时展示 4-6 个话题块。

```typescript
interface Topic {
  id: string
  title: string                    // 话题标题（最多30字）
  summary: string                  // 话题简介（最多100字）
  icon: string                     // 话题图标（emoji）
  creatorId: string                // 创建者用户ID
  creatorName: string              // 创建者昵称
  creatorAvatar: string            // 创建者头像
  tags: string[]                   // 关联标签ID
  totalPool: number                // 总投入资源池（所有用户投入之和）
  participantCount: number         // 参与人数
  postCount: number                // 帖子总数（含回复）
  topPosts: TopicPost[]            // 排序靠前的回复（预览用，最多3条）
  pinned: boolean                  // 是否置顶
  createdAt: number                // 创建时间
  lastActiveAt: number             // 最后活跃时间
}
```

### 2.2 帖子（TopicPost）

帖子是话题下的内容单元，包括主贴和回复。

```typescript
interface TopicPost {
  id: string
  topicId: string                  // 所属话题ID
  authorId: string                 // 作者用户ID
  authorName: string               // 作者昵称
  authorAvatar: string             // 作者头像
  authorLevel: number              // 作者等级
  content: string                  // 帖子内容（最多500字）
  investedResources: number        // 作者投入的资源总量
  likeCount: number                // 点赞数
  boostCount: number               // 助力数（助力 = 消耗资源帮助帖子提升排名）
  totalValue: number               // 帖子总价值 = investedResources + 所有boost之和
  replyTo: string | null           // 回复目标帖子ID（null表示主贴）
  replyCount: number               // 被回复数
  replies: TopicPost[]             // 直接回复列表（嵌套一层）
  createdAt: number                // 发帖时间
}
```

### 2.3 用户社区行为记录

```typescript
interface CommunityAction {
  type: 'post' | 'reply' | 'like' | 'boost'
  topicId: string
  postId?: string
  cost: { time?: number; energy?: number }
  timestamp: number
}
```

### 2.4 资源消耗规则

| 行为 | 时间消耗 | 精力消耗 | 说明 |
|------|----------|----------|------|
| 发帖 | 10 | 5 | 基础发帖成本 |
| 回复 | 5 | 3 | 回复他人帖子 |
| 点赞 | 1 | 0 | 轻量互动 |
| 助力 | 自定义 | 自定义 | 用户自选投入量，最低 5 时间 |

---

## 三、UI 设计

### 3.1 话题列表页（社区首页）

页面结构自上而下：

**顶部标题栏**：左侧"💬 社区"标题 + 右侧统计（话题数/参与人数），风格与世界线页面一致。

**话题文本流**：垂直滚动列表，每屏展示 4-6 个话题块。每个话题块是一个紧凑的玻璃卡片，包含以下信息：

```
┌─────────────────────────────────┐
│ 🔥 话题标题                 📌  │  ← 图标 + 标题 + 置顶标记
│ 话题简介文字（最多2行）...       │  ← 简介（2行截断）
│ ─────────────────────────────── │
│ 👤 用户A: 排序第1的回复...      │  ← 热门回复预览（1-2条）
│ 👤 用户B: 排序第2的回复...      │
│ ─────────────────────────────── │
│ 💰 1.2万  👥 86人  💬 234条     │  ← 资源池 + 参与人数 + 帖子数
└─────────────────────────────────┘
```

视觉风格：Lofi Cyberpunk 暗色玻璃卡片，cyan 边框微光，hover 时边框加亮。

### 3.2 话题详情页

点击话题块后进入详情页（页面内切换，非新页面路由），结构：

**顶部**：返回按钮 + 话题标题 + 资源池总量

**话题信息区**：完整简介 + 标签 + 创建者信息 + 统计数据

**发帖入口**：固定在话题信息区下方的输入框，点击展开发帖面板

**帖子列表**：按 `totalValue` 降序排列的帖子流，每个帖子卡片包含：
- 作者信息（头像、昵称、等级）
- 帖子内容
- 投入资源量标签
- 操作栏：点赞 / 助力 / 回复
- 回复折叠区（展开可见）

**助力面板**：点击助力按钮后弹出底部面板，用户可自定义投入资源量。

---

## 四、交互逻辑

### 4.1 话题列表交互

用户进入社区页面后，看到 20 个话题块的垂直滚动列表。话题按 `totalPool`（资源池总量）降序排列，资源池越大的话题越靠前。用户点击任意话题块进入话题详情。

### 4.2 发帖交互

用户在话题详情页点击发帖入口，展开发帖面板。输入内容后点击"发布"，系统扣除基础发帖成本（时间 10 + 精力 5），帖子以 `investedResources = 15` 的初始价值加入列表。

### 4.3 回复交互

用户点击帖子的"回复"按钮，输入框聚焦并显示"回复 @用户名"提示。提交后扣除回复成本（时间 5 + 精力 3）。

### 4.4 点赞交互

用户点击帖子的"点赞"按钮，扣除 1 时间，帖子 `likeCount + 1`。已点赞的帖子按钮高亮，不可重复点赞。

### 4.5 助力交互

用户点击帖子的"助力"按钮，弹出助力面板。面板中用户可通过滑块或点击预设档位（5/10/20/50）选择投入资源量。确认后扣除对应资源，帖子 `boostCount` 和 `totalValue` 增加。助力是社区中最核心的资源消耗行为，直接影响帖子排序。

### 4.6 排序机制

帖子排序公式：`totalValue = investedResources + sum(所有boost)`。`totalValue` 越高排序越靠前。话题排序同理，`totalPool = sum(话题下所有帖子的totalValue + 所有点赞消耗)`。

---

## 五、技术实现

### 5.1 文件结构

```
src/
├── types/index.ts              # 新增 Topic, TopicPost, CommunityAction 类型
├── stores/community.ts         # 社区 Pinia Store
├── data/community_topics.ts    # Mock 话题数据
├── pages/community/community.vue  # 社区页面
├── components/TopicCard.vue    # 话题块组件
├── components/PostCard.vue     # 帖子卡片组件
└── static/icons/
    ├── tab_community.png       # 社区 tab 图标
    └── tab_community_active.png
```

### 5.2 Store 设计

`communityStore` 管理话题列表、帖子数据、用户社区行为：

- **State**：`topics[]`、`currentTopicId`、`posts[]`、`userActions[]`
- **Getters**：`sortedTopics`（按资源池排序）、`currentTopicPosts`（当前话题帖子按价值排序）、`userLikedPosts`（用户已点赞帖子集合）
- **Actions**：`createPost`、`replyToPost`、`likePost`、`boostPost`、`loadTopicDetail`

### 5.3 路由集成

在 `pages.json` 中新增社区页面，插入到世界线和我的之间。同时在 tabBar 中新增社区 tab。
