# LifeLine 事件设计指引 (v1.0)

## 1. 引言

本文档旨在为 LifeLine 游戏设计和开发事件提供一套标准化的流程和数据格式。遵循本指引能够确保新事件与现有系统无缝集成，并为 AI Agent 提供了清晰、可解析的数据结构，便于未来实现自动化事件生成和动态调整。

核心设计哲学是**创造有意义的选择**，而非简单的善恶二分。每个选项都应代表一种在特定情境下合理的、符合人性的决策逻辑。详细的哲学框架请参考《选择决策哲学设计文档》。

## 2. 核心数据结构

所有事件都遵循 `GameEvent` 接口定义。一个完整的事件 JSON 对象包含事件基础信息、触发条件、进入消耗、阶段列表等。以下是 `GameEvent` 的骨架结构，所有模板都在此基础上进行扩展。

```json
{
  "id": "evt_unique_id",
  "title": "事件标题",
  "description": "事件的简短描述，在卡片堆叠中显示。",
  "cover": "/static/events/cover_image.png",
  "type": "social",
  "status": "active",
  "requirements": {},
  "entryFee": { "time": 10, "energy": 5 },
  "stages": [
    // ... 事件阶段内容 ...
  ],
  "participantCount": 0,
  "createdAt": 1678886400000
}
```

**关键字段说明:**

| 字段 | 类型 | 描述 |
|:---|:---|:---|
| `id` | string | 全局唯一的事件ID，建议使用 `evt_` 前缀。 |
| `title` | string | 事件的正式名称。 |
| `description` | string | 在卡片堆叠视图中显示的简介。 |
| `cover` | string | 事件卡片的封面图片路径。 |
| `type` | string | 事件类型，可选值: `story`, `social`, `challenge`, `craft`, `exploration`, `creation`。 |
| `status` | string | 事件状态，`active` 为线上生效。 |
| `requirements` | object | 触发事件所需满足的条件（暂未完全启用）。 |
| `entryFee` | object | 参与事件需要消耗的资源。 |
| `stages` | Array<EventStage> | 事件的核心，包含所有阶段和选择分支。 |

---

## 3. 事件设计模板

根据对现有事件的分析，我们总结出以下几种标准事件模板。设计新事件时，请选择最贴合您构思的模板，并在此基础上进行修改。

### 模板 A：简单二分支 (Simple Binary)

适用于简单的日常遭遇，提供两个明确对立或不同的选择，各自导向一个独立的结局。

- **结构**: `stage_1` (2个选项) → `stage_2a` / `stage_2b` (各自结局)
- **示例**: 咖啡店偶遇 (evt_coffee_encounter)

**JSON 模板:**

```json
{
  "id": "evt_simple_binary_template",
  "title": "模板A：简单二分支",
  "stages": [
    {
      "id": "stage_1",
      "title": "初始选择",
      "description": "描述一个简单的两难情境。",
      "choices": [
        {
          "id": "choice_a",
          "text": "选项A",
          "outcome": { "nextStageId": "stage_2a", "resultText": "你选择了A。" }
        },
        {
          "id": "choice_b",
          "text": "选项B",
          "outcome": { "nextStageId": "stage_2b", "resultText": "你选择了B。" }
        }
      ]
    },
    {
      "id": "stage_2a",
      "title": "A的结局",
      "description": "描述选择A后的结果。",
      "choices": [
        {
          "id": "choice_a_end",
          "text": "接受结果",
          "outcome": {
            "isEnding": true,
            "rewards": { "reputation": 10 },
            "itemDrops": [{ "itemId": "item_coffee_coupon", "dropRate": 0.5 }],
            "resultText": "这是选择A的最终结局。"
          }
        }
      ]
    },
    {
      "id": "stage_2b",
      "title": "B的结局",
      "description": "描述选择B后的结果。",
      "choices": [
        {
          "id": "choice_b_end",
          "text": "接受结果",
          "outcome": {
            "isEnding": true,
            "penalties": { "energy": 5 },
            "resultText": "这是选择B的最终结局。"
          }
        }
      ]
    }
  ]
}
```

---

### 模板 B：三路分支 (Triple Fork)

适用于需要提供更多立场选择的复杂情境，通常代表“同意”、“拒绝”、“协商”三种典型策略。

- **结构**: `stage_1` (3个选项) → `stage_2a` / `stage_2b` / `stage_2c` (各自结局)
- **示例**: 加班请求 (evt_overtime_request)

**JSON 模板:**

```json
{
  "id": "evt_triple_fork_template",
  "title": "模板B：三路分支",
  "stages": [
    {
      "id": "stage_1",
      "title": "初始选择",
      "description": "描述一个包含三种策略的情境。",
      "choices": [
        { "id": "choice_a", "text": "策略A", "outcome": { "nextStageId": "stage_2a" } },
        { "id": "choice_b", "text": "策略B", "outcome": { "nextStageId": "stage_2b" } },
        { "id": "choice_c", "text": "策略C", "outcome": { "nextStageId": "stage_2c" } }
      ]
    },
    { "id": "stage_2a", "title": "A的结局", "choices": [{ "id": "end_a", "text": "接受", "outcome": { "isEnding": true, "resultText": "A的结局" } }] },
    { "id": "stage_2b", "title": "B的结局", "choices": [{ "id": "end_b", "text": "接受", "outcome": { "isEnding": true, "resultText": "B的结局" } }] },
    { "id": "stage_2c", "title": "C的结局", "choices": [{ "id": "end_c", "text": "接受", "outcome": { "isEnding": true, "resultText": "C的结局" } }] }
  ]
}
```

---

### 模板 C：四象限分支 (Quad Dilemma)

最能体现 LifeLine 设计哲学的模板。适用于复杂的道德或人生抉择，四个选项分别对应“共情本能”、“务实主义”、“原则主义”、“灵活变通”四个象限，每个分支都有独立的深度发展。

- **结构**: `stage_1` (4个选项) → 4条独立路线 (每条路线至少一个后续阶段)
- **示例**: 通勤时刻 (evt_subway_seat)

**JSON 模板:**

```json
{
  "id": "evt_quad_dilemma_template",
  "title": "模板C：四象限分支",
  "stages": [
    {
      "id": "stage_1",
      "title": "复杂的抉择",
      "description": "描述一个复杂的道德困境。",
      "choices": [
        { "id": "choice_empathy", "text": "[共情本能]", "outcome": { "nextStageId": "stage_empathy" } },
        { "id": "choice_pragmatic", "text": "[务实主义]", "outcome": { "nextStageId": "stage_pragmatic" } },
        { "id": "choice_principle", "text": "[原则主义]", "outcome": { "nextStageId": "stage_principle" } },
        { "id": "choice_creative", "text": "[灵活变通]", "outcome": { "nextStageId": "stage_creative" } }
      ]
    },
    { "id": "stage_empathy", "title": "共情路线", "choices": [{ "id": "end_empathy", "text": "接受", "outcome": { "isEnding": true, "resultText": "共情路线的结局" } }] },
    { "id": "stage_pragmatic", "title": "务实路线", "choices": [{ "id": "end_pragmatic", "text": "接受", "outcome": { "isEnding": true, "resultText": "务实路线的结局" } }] },
    { "id": "stage_principle", "title": "原则路线", "choices": [{ "id": "end_principle", "text": "接受", "outcome": { "isEnding": true, "resultText": "原则路线的结局" } }] },
    { "id": "stage_creative", "title": "变通路线", "choices": [{ "id": "end_creative", "text": "接受", "outcome": { "isEnding": true, "resultText": "变通路线的结局" } }] }
  ]
}
```

---

### 模板 D：汇聚型 (Converging)

适用于多个初始选择导向同一个核心挑战或情境的事件。

- **结构**: `stage_1` (多个选项) → 共同的 `stage_2` (最终结局选项)
- **示例**: 新技能学习 (evt_skill_learning)

**JSON 模板:**

```json
{
  "id": "evt_converging_template",
  "title": "模板D：汇聚型",
  "stages": [
    {
      "id": "stage_1",
      "title": "选择你的道路",
      "description": "提供多种方式进入同一个挑战。",
      "choices": [
        { "id": "choice_a", "text": "道路A", "outcome": { "nextStageId": "stage_2" } },
        { "id": "choice_b", "text": "道路B", "outcome": { "nextStageId": "stage_2" } }
      ]
    },
    {
      "id": "stage_2",
      "title": "共同的挑战",
      "description": "无论你如何开始，现在都面临同一个问题。",
      "choices": [
        { "id": "choice_resolve", "text": "解决问题", "outcome": { "isEnding": true, "resultText": "你解决了问题。" } },
        { "id": "choice_fail", "text": "放弃", "outcome": { "isEnding": true, "resultText": "你放弃了。" } }
      ]
    }
  ]
}
```

---

### 模板 E：混合深度 (Mixed Depth)

最常见的模板，适用于大多数叙事性事件。提供多个选项，其中一些是“快速结局”，另一些则会引导玩家进入更深层次的分支。

- **结构**: `stage_1` (多选项，含 `isEnding: true` 的选项) → 未结束的选项各自进入 `stage_2a`, `stage_2b` 等。
- **示例**: 深夜外卖 (evt_midnight_delivery)

**JSON 模板:**

```json
{
  "id": "evt_mixed_depth_template",
  "title": "模板E：混合深度",
  "stages": [
    {
      "id": "stage_1",
      "title": "关键抉择",
      "description": "一个决定性的时刻。",
      "choices": [
        { "id": "choice_deep", "text": "深入探索", "outcome": { "nextStageId": "stage_2_deep" } },
        { "id": "choice_quick_end", "text": "快速了结", "outcome": { "isEnding": true, "resultText": "事情很快就结束了。" } }
      ]
    },
    {
      "id": "stage_2_deep",
      "title": "更深层次",
      "description": "你的选择带来了更复杂的局面。",
      "choices": [
        { "id": "choice_final", "text": "最终决定", "outcome": { "isEnding": true, "resultText": "这是深入探索后的结局。" } }
      ]
    }
  ]
}
```

---

### 模板 F：探索型 (Exploration with Secrets)

适用于具有解谜或探索元素的事件。包含需要特定物品才能解锁的隐藏选项 (`requiresItems`) 和必定获得的物品奖励 (`claimableItems`)。

- **结构**: 多阶段，包含 `hidden: true` 的选项和 `claimableItems`。
- **示例**: 神秘夜市 (evt_mystery_market)

**JSON 模板:**

```json
{
  "id": "evt_exploration_template",
  "title": "模板F：探索型",
  "stages": [
    {
      "id": "stage_1",
      "title": "发现秘密",
      "description": "一个充满秘密的场景。",
      "choices": [
        {
          "id": "choice_normal",
          "text": "普通选项",
          "outcome": {
            "claimableItems": [{ "itemId": "item_notebook", "promptText": "你获得了一个关键物品。" }],
            "nextStageId": "stage_2"
          }
        },
        {
          "id": "choice_hidden",
          "text": "[隐藏] 探索秘密通道",
          "hidden": true,
          "requiresItems": ["item_notebook"],
          "hiddenHint": "你的笔记本发出了微光。",
          "outcome": { "nextStageId": "stage_secret" }
        }
      ]
    },
    { "id": "stage_2", "title": "普通路线", "choices": [{ "id": "end_normal", "text": "结束", "outcome": { "isEnding": true } }] },
    { "id": "stage_secret", "title": "秘密路线", "choices": [{ "id": "end_secret", "text": "结束", "outcome": { "isEnding": true } }] }
  ]
}
```

## 4. 奖励与掉落设计

事件的奖励系统是驱动玩家做出选择的重要部分。我们有三种主要的奖励机制：

| 机制 | 字段 | 描述 |
|:---|:---|:---|
| **属性变更** | `rewards` / `penalties` | 直接增减玩家的时间、精力、声望等核心属性，或增减标签权重。 |
| **概率掉落** | `itemDrops` | 在事件结局时，根据设定的概率 (`dropRate`) 随机掉落一个或多个物品。这是制造惊喜和长期留存的关键。 |
| **确定性获取** | `claimableItems` | 在事件的某个阶段，玩家必定会获得一个或多个物品。通常用于给予关键任务物品，会弹出专门的领取界面。 |

**设计原则:**

- **风险与回报成正比**：越是需要付出巨大代价（如消耗大量时间/精力，或承担名誉风险）的选项，其潜在的物品掉落和属性回报也应越高。
- **主题关联性**：掉落的物品应与事件主题和玩家的选择逻辑紧密相关。例如，在“新技能学习”事件中坚持到底，掉落“简约笔记本”的概率就应该更高。
- **稀有度与概率挂钩**：物品的稀有度 (`rarity`) 应直接影响其 `dropRate`。参考标准如下：

| 稀有度 | 掉落概率范围 |
|:---|:---|
| common | 30% - 60% |
| uncommon | 15% - 25% |
| rare | 8% - 20% |
| epic | 3% - 8% |
| legendary | 1% - 3% |

## 5. 结论

本指引提供了一套完整的事件设计框架和数据标准。通过使用这些模板和原则，我们可以高效地创造出既符合游戏世界观、又能引发玩家深度思考的优质内容。对于AI Agent而言，这套结构化的JSON数据是理解、分析乃至未来自主生成事件的基础。

请在设计新事件时严格遵循此指引，如有任何疑问或建议，欢迎随时提出讨论。
