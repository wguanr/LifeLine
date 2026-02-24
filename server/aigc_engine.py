"""
AIGC Content Generation Engine
将现实世界新闻事件转化为游戏内的 GameEvent 和 Item 卡片数据
"""

import json
import os
import time
from typing import Optional
from openai import OpenAI

client = OpenAI()
MODEL = "gpt-4.1-mini"

# ==================== Prompt Templates ====================

EVENT_GENERATION_PROMPT = """你是一个游戏内容设计师，负责将现实世界的新闻事件转化为一款生活模拟卡牌游戏中的"事件卡片"。

游戏背景：这是一款让用户通过卡片选择来体验人生的游戏。用户扮演一个普通人，通过参与各种事件来获取标签、物品和经验。现实世界的大事件会以"世界事件"的形式推送给用户，让用户以个人视角参与和感受这些宏大叙事。

请将以下新闻事件转化为一个 GameEvent JSON 对象。要求：

1. **视角转换**：将宏大的国际事件转化为个人可参与的微观体验。例如"关税战"→"你在跨境电商平台上的商品突然涨价了"
2. **多阶段选择**：设计3-5个阶段(stages)，每个阶段2-3个选择(choices)
3. **选择有代价**：每个选择都有 cost（时间/精力消耗）和 outcome（奖励/惩罚/标签变化）
4. **标签关联**：选择结果要关联到用户标签系统，反映用户的价值观和倾向
5. **emoji图标**：cover字段用一个合适的emoji

可用标签ID列表：traveler, explorer, minimalist, foodie, fitness_lover, social_butterfly, connector, kindhearted, warmhearted, helpful, workaholic, work_life_balance, negotiator, techie, learner, persistent, creative

可用事件类型：story, social, challenge, craft, exploration, creation

输出严格的JSON格式（不要markdown代码块），符合以下TypeScript接口：
```
interface GameEvent {
  id: string           // 格式: "aigc_event_xxx"
  title: string        // 中文标题，简洁有力
  description: string  // 中文描述，50-100字，个人视角
  cover: string        // 单个emoji
  type: 'story' | 'social' | 'challenge' | 'craft' | 'exploration' | 'creation'
  status: 'active'
  requirements: { tags?: string[], minTagWeight?: number, items?: string[], minTime?: number, minReputation?: number }
  entryFee: { time?: number, energy?: number }
  stages: EventStage[]
  participantCount: number  // 模拟参与人数，数千到数万
  createdAt: number         // Unix时间戳
  source: {                 // 新增：来源信息
    type: 'aigc'
    newsTitle: string       // 原始新闻标题
    newsDate: string        // 新闻日期
    region: string          // 影响地区
    urgency: 'low' | 'medium' | 'high' | 'critical'
  }
}
```

新闻事件：
{news_event}

请生成JSON："""

ITEM_GENERATION_PROMPT = """你是一个游戏内容设计师，负责将现实世界新闻事件中的关键概念转化为游戏内的"物品卡片"。

游戏背景：物品是用户可以收集的藏品，每个物品有特性标签、故事背景和游戏效果。物品应该是新闻事件中某个有象征意义的概念、物体或符号的具象化。

请根据以下新闻事件，生成1-3个关联物品的JSON数组。要求：

1. **概念具象化**：将抽象概念变成可收集的物品。如"关税壁垒"→一面微型围墙模型
2. **故事感**：每个物品都有一段50-100字的故事，连接现实事件
3. **特性标签**：3-5个中文短语描述物品特性
4. **emoji图标**：用一个合适的emoji作为图标

可用稀有度：common, uncommon, rare, epic, legendary
可用分类：consumable, equipment, collectible, material
可用标签ID：traveler, explorer, minimalist, foodie, fitness_lover, social_butterfly, connector, kindhearted, warmhearted, helpful, workaholic, work_life_balance, negotiator, techie, learner, persistent, creative

输出严格的JSON数组格式（不要markdown代码块），每个物品符合：
```
interface Item {
  id: string           // 格式: "aigc_item_xxx"
  name: string         // 中文名称
  description: string  // 中文描述，30-50字
  icon: string         // 单个emoji
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  category: 'consumable' | 'equipment' | 'collectible' | 'material'
  mintCost: { time?: number, energy?: number }
  effects: Array<{ type: string, value: number, description: string }>
  tags: string[]       // 标签ID列表
  featureTags: string[]  // 3-5个中文特性标签短语
  story: string        // 50-100字的物品故事
  visible: true
  createdAt: number
  source: {
    type: 'aigc'
    relatedEventId: string  // 关联的事件ID
    newsTitle: string
  }
}
```

新闻事件：
{news_event}

关联事件ID：{event_id}

请生成JSON数组："""

TAG_GENERATION_PROMPT = """你是一个游戏标签系统设计师。根据以下新闻事件，判断是否需要新增标签定义。

现有标签列表：
- life类: traveler(旅行者), explorer(探索者), minimalist(极简主义), foodie(美食家), fitness_lover(健身达人)
- social类: social_butterfly(社交达人), connector(连接者), kindhearted(善良), warmhearted(热心), helpful(乐于助人)
- work类: workaholic(工作狂), work_life_balance(平衡达人), negotiator(谈判专家), techie(技术控)
- growth类: learner(学习者), persistent(坚持者), creative(创造者)

如果现有标签不足以表达新闻事件带来的用户画像维度，请新增1-3个标签。
如果现有标签已经足够，返回空数组。

输出严格的JSON数组格式（不要markdown代码块）：
```
[{
  "id": "string",        // 英文snake_case
  "name": "string",      // 中文名称
  "icon": "string",      // 单个emoji
  "description": "string", // 中文描述
  "category": "life" | "social" | "work" | "growth"
}]
```

新闻事件：
{news_event}

请生成JSON数组："""


def clean_json_response(text: str) -> str:
    """清理LLM返回的JSON文本，移除可能的markdown代码块标记"""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


def generate_event_from_news(news_event: dict) -> Optional[dict]:
    """
    将新闻事件转化为 GameEvent
    
    Args:
        news_event: {
            "title": "新闻标题",
            "summary": "新闻摘要",
            "date": "日期",
            "region": "影响地区",
            "urgency": "紧急程度"
        }
    """
    news_text = f"""标题：{news_event['title']}
摘要：{news_event['summary']}
日期：{news_event['date']}
影响地区：{news_event['region']}
紧急程度：{news_event['urgency']}"""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "你是一个专业的游戏内容设计师，擅长将现实事件转化为有趣的游戏体验。只输出JSON，不要任何其他文字。"},
                {"role": "user", "content": EVENT_GENERATION_PROMPT.replace("{news_event}", news_text)}
            ],
            temperature=0.8,
            max_tokens=3000
        )
        
        raw = response.choices[0].message.content
        cleaned = clean_json_response(raw)
        event = json.loads(cleaned)
        
        # 确保必要字段
        if 'source' not in event:
            event['source'] = {
                'type': 'aigc',
                'newsTitle': news_event['title'],
                'newsDate': news_event['date'],
                'region': news_event['region'],
                'urgency': news_event['urgency']
            }
        
        return event
        
    except Exception as e:
        print(f"[AIGC Engine] Event generation failed for '{news_event['title']}': {e}")
        return None


def generate_items_from_news(news_event: dict, event_id: str) -> list:
    """
    根据新闻事件生成关联物品
    """
    news_text = f"""标题：{news_event['title']}
摘要：{news_event['summary']}
日期：{news_event['date']}"""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "你是一个专业的游戏物品设计师。只输出JSON数组，不要任何其他文字。"},
                {"role": "user", "content": ITEM_GENERATION_PROMPT.replace("{news_event}", news_text).replace("{event_id}", event_id)}
            ],
            temperature=0.8,
            max_tokens=3000
        )
        
        raw = response.choices[0].message.content
        cleaned = clean_json_response(raw)
        items = json.loads(cleaned)
        
        if not isinstance(items, list):
            items = [items]
        
        return items
        
    except Exception as e:
        print(f"[AIGC Engine] Item generation failed for '{news_event['title']}': {e}")
        return []


def generate_new_tags(news_event: dict) -> list:
    """
    判断是否需要为新闻事件新增标签
    """
    news_text = f"""标题：{news_event['title']}
摘要：{news_event['summary']}"""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "你是一个游戏标签系统设计师。只输出JSON数组，不要任何其他文字。"},
                {"role": "user", "content": TAG_GENERATION_PROMPT.replace("{news_event}", news_text)}
            ],
            temperature=0.5,
            max_tokens=1000
        )
        
        raw = response.choices[0].message.content
        cleaned = clean_json_response(raw)
        tags = json.loads(cleaned)
        
        if not isinstance(tags, list):
            tags = [tags]
        
        return tags
        
    except Exception as e:
        print(f"[AIGC Engine] Tag generation failed: {e}")
        return []


def process_news_event(news_event: dict) -> dict:
    """
    完整处理一个新闻事件：生成事件卡片 + 关联物品 + 可能的新标签
    
    Returns: {
        "event": GameEvent dict,
        "items": [Item dict, ...],
        "newTags": [TagDefinition dict, ...],
        "success": bool
    }
    """
    print(f"\n[AIGC Engine] Processing: {news_event['title']}")
    
    # Step 1: 生成事件卡片
    event = generate_event_from_news(news_event)
    if not event:
        return {"event": None, "items": [], "newTags": [], "success": False}
    
    print(f"  ✓ Event generated: {event.get('title', 'unknown')}")
    
    # Step 2: 生成关联物品
    items = generate_items_from_news(news_event, event.get('id', ''))
    print(f"  ✓ Items generated: {len(items)}")
    
    # Step 3: 检查是否需要新标签
    new_tags = generate_new_tags(news_event)
    if new_tags:
        print(f"  ✓ New tags suggested: {[t.get('name') for t in new_tags]}")
    
    return {
        "event": event,
        "items": items,
        "newTags": new_tags,
        "success": True
    }


if __name__ == "__main__":
    # 测试：用一个新闻事件测试生成
    test_news = {
        "title": "特朗普发动关税战",
        "summary": "2025年4月2日，特朗普宣布'解放日'，对大多数进口商品征收10%关税，对中国商品关税升至125%。全球贸易格局剧变，供应链面临重组。消费者面临物价上涨压力。",
        "date": "2025-04-02",
        "region": "全球",
        "urgency": "critical"
    }
    
    result = process_news_event(test_news)
    
    if result["success"]:
        print("\n=== Generated Event ===")
        print(json.dumps(result["event"], ensure_ascii=False, indent=2))
        print("\n=== Generated Items ===")
        print(json.dumps(result["items"], ensure_ascii=False, indent=2))
        print("\n=== New Tags ===")
        print(json.dumps(result["newTags"], ensure_ascii=False, indent=2))
    else:
        print("Generation failed!")
