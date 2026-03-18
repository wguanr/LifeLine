"""
三阶段 AI 内容生成器
Stage 1: 事件主题生成 (Event Theme Generation)
Stage 2: 交互设计 (Interactive Design)
Stage 3: 关联物品创造 (Associated Item Creation)
"""
import json
import time
import os
from openai import OpenAI
from news_fetcher import NewsArticle


client = OpenAI()
MODEL = "gpt-4.1-mini"

# LifeLine 可用标签 ID 列表
AVAILABLE_TAGS = [
    "traveler", "explorer", "minimalist", "foodie", "fitness_lover",
    "adventurous", "reader", "animal_lover", "sentimental",
    "social_butterfly", "connector", "kindhearted", "warmhearted",
    "helpful", "generous", "closer", "family_first", "open_minded",
    "workaholic", "work_life_balance", "negotiator", "techie", "reliable", "improviser",
    "learner", "persistent", "creative", "brave", "curious", "resilient", "prepared", "cautious", "skeptic",
    "trade_war_aware", "ai_enthusiast", "tech_innovator",
    "conflict_aware", "conflict_affected",
]

# 紧急度到 entryFee 的映射
URGENCY_TO_FEE = {
    "critical": {"time": 3, "energy": 5},
    "high": {"time": 2, "energy": 3},
    "medium": {"time": 1, "energy": 2},
    "low": {"time": 1, "energy": 1},
}


def call_llm(system_prompt: str, user_prompt: str, temperature: float = 0.8) -> str:
    """调用 LLM 并返回文本响应"""
    for attempt in range(3):
        try:
            response = client.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=temperature,
                max_tokens=4000,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"  [RETRY {attempt+1}/3] LLM call failed: {e}")
            time.sleep(2 ** attempt)
    raise RuntimeError("LLM call failed after 3 retries")


def extract_json(text: str) -> dict:
    """从 LLM 响应中提取 JSON 对象"""
    # 尝试直接解析
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # 尝试从 markdown code block 中提取
    import re
    patterns = [
        r'```json\s*\n(.*?)\n\s*```',
        r'```\s*\n(.*?)\n\s*```',
        r'\{[\s\S]*\}',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.DOTALL)
        if match:
            try:
                candidate = match.group(1) if match.lastindex else match.group(0)
                return json.loads(candidate)
            except (json.JSONDecodeError, IndexError):
                continue

    raise ValueError(f"Failed to extract JSON from LLM response:\n{text[:500]}")


# ============================================================
# Stage 1: 事件主题生成
# ============================================================

STAGE1_SYSTEM = """你是 LifeLine 游戏的内容设计师。LifeLine 是一款基于真实世界事件的卡牌游戏，玩家通过做出选择来影响自己的命运。

你的任务是将一条真实世界新闻转化为一个游戏事件的主题框架。

**核心要求：**
1. 标题必须用第二人称叙事，让玩家感受到事件与自己直接相关
2. 描述要构建一个具体的、与玩家日常生活相关的场景
3. 事件类型从以下选择：story（故事）, social（社交）, challenge（挑战）, craft（制作）, exploration（探索）, creation（创造）
4. cover 使用一个最能代表事件的 emoji
5. requirements.tags 从可用标签中选择 0-2 个相关标签
6. 所有文本使用中文

**可用标签 ID：**
""" + ", ".join(AVAILABLE_TAGS) + """

**输出格式（严格 JSON）：**
```json
{
  "id": "gen_event_xxx",
  "title": "事件标题（第二人称）",
  "description": "事件描述（第二人称，150-250字）",
  "cover": "emoji",
  "type": "story|social|challenge|craft|exploration|creation",
  "status": "active",
  "requirements": {
    "tags": ["tag_id_1"]
  },
  "entryFee": {"time": 1, "energy": 2},
  "participantCount": 0,
  "createdAt": 0,
  "source": {
    "type": "aigc",
    "newsTitle": "原始新闻标题",
    "newsDate": "日期",
    "region": "地区",
    "urgency": "critical|high|medium|low"
  }
}
```"""


def stage1_event_theme(article: NewsArticle, event_id: str) -> dict:
    """Stage 1: 从新闻生成事件主题"""
    print(f"  [Stage 1] Generating event theme...")

    entry_fee = URGENCY_TO_FEE.get(article.urgency, {"time": 1, "energy": 1})

    user_prompt = f"""请将以下新闻转化为 LifeLine 游戏事件主题：

**新闻标题：** {article.title}
**新闻来源：** {article.source}
**新闻分类：** {article.category}
**紧急度：** {article.urgency}
**新闻摘要：** {article.summary}

**要求：**
- id 使用 "{event_id}"
- entryFee 使用 {json.dumps(entry_fee)}
- 建议的事件类型：{article.suggested_event_type}
- createdAt 使用 {int(time.time() * 1000)}

请直接输出 JSON，不要添加任何解释文字。"""

    response = call_llm(STAGE1_SYSTEM, user_prompt, temperature=0.7)
    result = extract_json(response)

    # 确保必要字段
    result["id"] = event_id
    result["status"] = "active"
    result["participantCount"] = 0
    if "stages" not in result:
        result["stages"] = []

    return result


# ============================================================
# Stage 2: 交互设计
# ============================================================

STAGE2_SYSTEM = """你是 LifeLine 游戏的交互设计师。你的任务是为一个游戏事件设计多阶段的交互选项。

**核心设计原则：**
1. 每个事件包含 2-3 个阶段（stages）
2. 每个阶段有 2-3 个选项（choices），体现不同价值观或策略
3. 选项之间要有明确的权衡（不存在"最优解"）
4. 奖励中的标签必须放在 rewards.tags 字段下（Record<string, number> 格式），严禁把标签直接放在 rewards 顶层。正确示例：rewards: {"tags": {"brave": 2}, "reputation": 5}。错误示例：rewards: {"brave": 2, "reputation": 5}
5. 至少一个阶段有隐藏选项（hidden: true, requiresItems 设为某个物品 ID）
6. 最后一个阶段的选项 isEnding 设为 true
7. 所有文本使用中文

**可用标签 ID：**
""" + ", ".join(AVAILABLE_TAGS) + """

**EventStage 结构：**
```json
{
  "id": "stage_1",
  "title": "阶段标题",
  "description": "阶段描述（50-100字）",
  "choices": [
    {
      "id": "1_a",
      "text": "选项文字",
      "cost": {"time": 1, "energy": 1},
      "outcome": {
        "nextStageId": "stage_2",
        "isEnding": false,
        "rewards": {
          "tags": {"brave": 2, "curious": 1},
          "reputation": 5
        },
        "penalties": {
          "energy": 2
        },
        "resultText": "选择结果描述（50-100字）"
      }
    }
  ]
}
```

请为给定的事件设计完整的 stages 数组。输出严格 JSON 格式的数组。"""


def stage2_interactive_design(event_theme: dict) -> list:
    """Stage 2: 为事件设计交互阶段"""
    print(f"  [Stage 2] Designing interactive stages...")

    user_prompt = f"""请为以下游戏事件设计交互阶段：

**事件标题：** {event_theme['title']}
**事件描述：** {event_theme['description']}
**事件类型：** {event_theme['type']}
**事件 ID：** {event_theme['id']}

**要求：**
- 设计 2-3 个阶段
- 每个阶段 2-3 个选项
- stage id 格式：stage_1, stage_2, stage_3
- choice id 格式：1_a, 1_b, 1_c（阶段号_选项字母）
- 最后阶段的所有选项 isEnding: true, nextStageId: null
- 中间阶段的选项 nextStageId 指向下一阶段
- 至少设计一个隐藏选项（hidden: true），requiresItems 设为 ["{event_theme['id']}_item"]
- tags 奖励使用 Record<string, number> 格式

请直接输出 stages JSON 数组，不要添加任何解释文字。"""

    response = call_llm(STAGE2_SYSTEM, user_prompt, temperature=0.8)

    # 尝试解析为数组
    try:
        result = json.loads(response)
        if isinstance(result, list):
            return result
    except json.JSONDecodeError:
        pass

    # 从 markdown 中提取
    import re
    match = re.search(r'```json\s*\n(.*?)\n\s*```', response, re.DOTALL)
    if match:
        result = json.loads(match.group(1))
        if isinstance(result, list):
            return result

    # 尝试提取 JSON 对象中的 stages
    obj = extract_json(response)
    if isinstance(obj, dict) and "stages" in obj:
        return obj["stages"]
    if isinstance(obj, list):
        return obj

    raise ValueError(f"Failed to extract stages array from response")


# ============================================================
# Stage 3: 关联物品创造
# ============================================================

STAGE3_SYSTEM = """你是 LifeLine 游戏的物品设计师。你的任务是为一个游戏事件创造 1-2 个关联物品。

**核心设计原则：**
1. 物品应该是事件的象征物或纪念品
2. 物品名称要有创意，不能直接使用新闻标题
3. icon 使用一个最能代表物品的 emoji
4. rarity 从 common/uncommon/rare/epic/legendary 中选择
5. category 从 consumable/equipment/collectible/material 中选择
6. effects 数组包含 1-3 个效果，每个效果有 type、value（数字）、description
7. featureTags 包含 3-5 个简短的中文特性标签
8. story 是物品的背景故事（100-200字），与真实事件关联
9. 所有文本使用中文

**可用标签 ID：**
""" + ", ".join(AVAILABLE_TAGS) + """

**Item 结构：**
```json
{
  "id": "gen_item_xxx",
  "name": "物品名称",
  "description": "物品描述（50-100字）",
  "icon": "emoji",
  "rarity": "common|uncommon|rare|epic|legendary",
  "category": "consumable|equipment|collectible|material",
  "mintCost": {"time": 60, "energy": 30},
  "effects": [
    {"type": "effect_type", "value": 10, "description": "效果描述"}
  ],
  "tags": ["tag_id_1", "tag_id_2"],
  "featureTags": ["特性1", "特性2", "特性3"],
  "story": "物品背景故事",
  "visible": true,
  "createdAt": 0,
  "source": {
    "type": "aigc",
    "relatedEventId": "event_id",
    "newsTitle": "原始新闻标题"
  }
}
```

请输出一个包含 1-2 个物品的 JSON 数组。"""


def stage3_item_creation(event: dict, article: NewsArticle) -> list:
    """Stage 3: 为事件创造关联物品"""
    print(f"  [Stage 3] Creating associated items...")

    event_id = event["id"]
    item_id_base = event_id.replace("event", "item")

    user_prompt = f"""请为以下游戏事件创造 1-2 个关联物品：

**事件标题：** {event['title']}
**事件描述：** {event['description']}
**事件类型：** {event['type']}
**事件 ID：** {event_id}
**原始新闻：** {article.title}
**新闻紧急度：** {article.urgency}

**要求：**
- 第一个物品 id 使用 "{item_id_base}_a"
- 第二个物品 id 使用 "{item_id_base}_b"（如果有）
- mintCost 根据稀有度设定（common: 30/15, uncommon: 60/30, rare: 120/50, epic: 200/80, legendary: 500/150）
- createdAt 使用 {int(time.time() * 1000)}
- tags 从可用标签中选择 2-4 个
- 紧急度越高，物品稀有度越高

请直接输出 JSON 数组，不要添加任何解释文字。"""

    response = call_llm(STAGE3_SYSTEM, user_prompt, temperature=0.8)

    # 尝试解析
    try:
        result = json.loads(response)
        if isinstance(result, list):
            return result
    except json.JSONDecodeError:
        pass

    import re
    match = re.search(r'```json\s*\n(.*?)\n\s*```', response, re.DOTALL)
    if match:
        result = json.loads(match.group(1))
        if isinstance(result, list):
            return result

    obj = extract_json(response)
    if isinstance(obj, list):
        return obj
    if isinstance(obj, dict):
        return [obj]

    raise ValueError(f"Failed to extract items array from response")


# ============================================================
# 完整管道
# ============================================================

def generate_content(article: NewsArticle, index: int) -> tuple[dict, list]:
    """
    完整的三阶段生成管道
    
    Args:
        article: 新闻文章
        index: 事件序号（用于生成 ID）
    
    Returns:
        (GameEvent, [Item, ...]) 元组
    """
    event_id = f"gen_event_{int(time.time())}_{index:03d}"
    print(f"\n{'='*60}")
    print(f"Generating content for: {article.title[:60]}...")
    print(f"Event ID: {event_id}")
    print(f"{'='*60}")

    # Stage 1: 事件主题
    event_theme = stage1_event_theme(article, event_id)
    print(f"  -> Theme: {event_theme.get('title', 'N/A')}")

    # Stage 2: 交互设计
    stages = stage2_interactive_design(event_theme)
    event_theme["stages"] = stages
    print(f"  -> Stages: {len(stages)} stages, {sum(len(s.get('choices', [])) for s in stages)} choices")

    # Stage 3: 物品创造
    items = stage3_item_creation(event_theme, article)
    print(f"  -> Items: {len(items)} items created")

    return event_theme, items


if __name__ == "__main__":
    # 快速测试：用一条模拟新闻测试管道
    test_article = NewsArticle(
        title="OpenAI releases GPT-5 with breakthrough reasoning capabilities",
        link="https://example.com",
        source="TechCrunch",
        category="tech",
        published="2026-03-18",
        summary="OpenAI has released GPT-5, its most advanced AI model yet, featuring breakthrough reasoning capabilities that can solve complex multi-step problems.",
        urgency="high",
        suggested_event_type="craft",
    )

    event, items = generate_content(test_article, 1)
    print(f"\n{'='*60}")
    print("GENERATED EVENT:")
    print(json.dumps(event, ensure_ascii=False, indent=2)[:2000])
    print(f"\nGENERATED ITEMS ({len(items)}):")
    for item in items:
        print(json.dumps(item, ensure_ascii=False, indent=2)[:500])
