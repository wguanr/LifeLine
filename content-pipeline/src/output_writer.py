"""
输出模块：JSON 验证 + 写入 LifeLine 数据文件
"""
import json
import os
import re
from datetime import datetime


# LifeLine 项目数据目录
LIFELINE_DATA_DIR = os.path.join(os.path.dirname(__file__), "../../src/data")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "../output")


# ============================================================
# JSON Schema 验证
# ============================================================

VALID_EVENT_TYPES = {"story", "social", "challenge", "craft", "exploration", "creation"}
VALID_STATUSES = {"active", "upcoming", "ended", "draft"}
VALID_RARITIES = {"common", "uncommon", "rare", "epic", "legendary"}
VALID_CATEGORIES = {"consumable", "equipment", "collectible", "material"}


def validate_event(event: dict) -> list[str]:
    """验证 GameEvent JSON 结构，返回错误列表"""
    errors = []

    # 必要字段检查
    required = ["id", "title", "description", "cover", "type", "status", "stages"]
    for field in required:
        if field not in event:
            errors.append(f"Missing required field: {field}")

    # 类型检查
    if event.get("type") not in VALID_EVENT_TYPES:
        errors.append(f"Invalid type: {event.get('type')}, must be one of {VALID_EVENT_TYPES}")

    if event.get("status") not in VALID_STATUSES:
        errors.append(f"Invalid status: {event.get('status')}, must be one of {VALID_STATUSES}")

    # stages 检查
    stages = event.get("stages", [])
    if not isinstance(stages, list) or len(stages) == 0:
        errors.append("stages must be a non-empty array")
    else:
        for i, stage in enumerate(stages):
            if not stage.get("id"):
                errors.append(f"Stage {i}: missing id")
            if not stage.get("title"):
                errors.append(f"Stage {i}: missing title")
            choices = stage.get("choices", [])
            if not isinstance(choices, list) or len(choices) == 0:
                errors.append(f"Stage {i}: choices must be a non-empty array")
            for j, choice in enumerate(choices):
                if not choice.get("id"):
                    errors.append(f"Stage {i}, Choice {j}: missing id")
                if not choice.get("text"):
                    errors.append(f"Stage {i}, Choice {j}: missing text")
                outcome = choice.get("outcome", {})
                if not outcome.get("resultText"):
                    errors.append(f"Stage {i}, Choice {j}: missing outcome.resultText")

    # entryFee 检查
    entry_fee = event.get("entryFee", {})
    if not isinstance(entry_fee, dict):
        errors.append("entryFee must be an object")

    # requirements 检查
    requirements = event.get("requirements", {})
    if not isinstance(requirements, dict):
        errors.append("requirements must be an object")

    return errors


def validate_item(item: dict) -> list[str]:
    """验证 Item JSON 结构，返回错误列表"""
    errors = []

    required = ["id", "name", "description", "icon", "rarity", "category"]
    for field in required:
        if field not in item:
            errors.append(f"Missing required field: {field}")

    if item.get("rarity") not in VALID_RARITIES:
        errors.append(f"Invalid rarity: {item.get('rarity')}, must be one of {VALID_RARITIES}")

    if item.get("category") not in VALID_CATEGORIES:
        errors.append(f"Invalid category: {item.get('category')}, must be one of {VALID_CATEGORIES}")

    # effects 检查
    effects = item.get("effects", [])
    if not isinstance(effects, list):
        errors.append("effects must be an array")
    else:
        for i, effect in enumerate(effects):
            if not effect.get("type"):
                errors.append(f"Effect {i}: missing type")
            if "value" not in effect:
                errors.append(f"Effect {i}: missing value")
            if not effect.get("description"):
                errors.append(f"Effect {i}: missing description")

    # featureTags 检查
    feature_tags = item.get("featureTags", [])
    if not isinstance(feature_tags, list) or len(feature_tags) < 3:
        errors.append("featureTags must have at least 3 items")

    return errors


# ============================================================
# 修复常见问题
# ============================================================

def fix_event(event: dict) -> dict:
    """自动修复 GameEvent 中的常见问题"""
    # 确保 requirements 存在
    if "requirements" not in event:
        event["requirements"] = {}

    # 确保 entryFee 存在
    if "entryFee" not in event:
        event["entryFee"] = {"time": 1, "energy": 1}

    # 确保 participantCount 存在
    if "participantCount" not in event:
        event["participantCount"] = 0

    # 确保 createdAt 存在
    if "createdAt" not in event or event["createdAt"] == 0:
        event["createdAt"] = int(datetime.now().timestamp() * 1000)

    # 修复 stages 中的 choices
    for stage in event.get("stages", []):
        if "description" not in stage:
            stage["description"] = ""
        for choice in stage.get("choices", []):
            outcome = choice.get("outcome", {})
            # 确保 resultText 存在
            if "resultText" not in outcome:
                outcome["resultText"] = "你做出了选择。"

            # 修复 rewards.tags：AI 经常把 tag 直接放在 rewards 顶层
            rewards = outcome.get("rewards", {})
            if isinstance(rewards, dict):
                known_reward_keys = {"time", "energy", "reputation", "items", "itemDrops", "tags"}
                stray_tags = {}
                keys_to_remove = []
                for k, v in rewards.items():
                    if k not in known_reward_keys and isinstance(v, (int, float)):
                        stray_tags[k] = v
                        keys_to_remove.append(k)
                if stray_tags:
                    existing_tags = rewards.get("tags", {})
                    if isinstance(existing_tags, dict):
                        existing_tags.update(stray_tags)
                    else:
                        existing_tags = stray_tags
                    rewards["tags"] = existing_tags
                    for k in keys_to_remove:
                        del rewards[k]
                outcome["rewards"] = rewards

            # 修复 penalties 中同样的问题
            penalties = outcome.get("penalties", {})
            if isinstance(penalties, dict):
                known_penalty_keys = {"time", "energy", "reputation", "tags"}
                stray_tags = {}
                keys_to_remove = []
                for k, v in penalties.items():
                    if k not in known_penalty_keys and isinstance(v, (int, float)):
                        stray_tags[k] = v
                        keys_to_remove.append(k)
                if stray_tags:
                    existing_tags = penalties.get("tags", {})
                    if isinstance(existing_tags, dict):
                        existing_tags.update(stray_tags)
                    else:
                        existing_tags = stray_tags
                    penalties["tags"] = existing_tags
                    for k in keys_to_remove:
                        del penalties[k]
                outcome["penalties"] = penalties

            choice["outcome"] = outcome

    return event


def fix_item(item: dict) -> dict:
    """自动修复 Item 中的常见问题"""
    if "mintCost" not in item:
        item["mintCost"] = {"time": 60, "energy": 30}

    if "effects" not in item:
        item["effects"] = []

    if "tags" not in item:
        item["tags"] = []

    if "featureTags" not in item or len(item.get("featureTags", [])) < 3:
        item["featureTags"] = item.get("featureTags", [])
        while len(item["featureTags"]) < 3:
            item["featureTags"].append("神秘物品")

    if "story" not in item:
        item["story"] = item.get("description", "一个神秘的物品。")

    if "visible" not in item:
        item["visible"] = True

    if "createdAt" not in item or item["createdAt"] == 0:
        item["createdAt"] = int(datetime.now().timestamp() * 1000)

    return item


# ============================================================
# 文件写入
# ============================================================

def write_generated_events_ts(events: list[dict], filepath: str):
    """将事件列表写入 TypeScript 文件"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    content = f'''/**
 * AI 生成的游戏事件
 * 基于 worldmonitor RSS 新闻源自动生成
 * Generated at: {timestamp}
 * Pipeline: content-pipeline/src/main.py
 */
export const generatedEvents = {json.dumps(events, ensure_ascii=False, indent=2)} as const
'''
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  Written {len(events)} events to {filepath}")


def write_generated_items_ts(items: list[dict], filepath: str):
    """将物品列表写入 TypeScript 文件"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    content = f'''/**
 * AI 生成的游戏物品
 * 与 generatedEvents 关联
 * Generated at: {timestamp}
 * Pipeline: content-pipeline/src/main.py
 */
export const generatedItems = {json.dumps(items, ensure_ascii=False, indent=2)} as const
'''
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  Written {len(items)} items to {filepath}")


def write_output(events: list[dict], items: list[dict]):
    """
    完整输出流程：验证 → 修复 → 写入
    """
    print(f"\n{'='*60}")
    print("Output Writer: Validating and writing...")
    print(f"{'='*60}")

    # 验证和修复 events
    valid_events = []
    for event in events:
        event = fix_event(event)
        errors = validate_event(event)
        if errors:
            print(f"  [WARN] Event '{event.get('id', '?')}' has {len(errors)} issues:")
            for err in errors:
                print(f"    - {err}")
            # 仍然保留，只是警告
        valid_events.append(event)

    # 验证和修复 items
    valid_items = []
    for item in items:
        item = fix_item(item)
        errors = validate_item(item)
        if errors:
            print(f"  [WARN] Item '{item.get('id', '?')}' has {len(errors)} issues:")
            for err in errors:
                print(f"    - {err}")
        valid_items.append(item)

    # 写入 output 目录（JSON 备份）
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(os.path.join(OUTPUT_DIR, "generated_events.json"), "w", encoding="utf-8") as f:
        json.dump(valid_events, f, ensure_ascii=False, indent=2)
    with open(os.path.join(OUTPUT_DIR, "generated_items.json"), "w", encoding="utf-8") as f:
        json.dump(valid_items, f, ensure_ascii=False, indent=2)
    print(f"  JSON backups saved to {OUTPUT_DIR}/")

    # 写入 LifeLine 数据目录（TypeScript 文件）
    data_dir = os.path.abspath(LIFELINE_DATA_DIR)
    if os.path.isdir(data_dir):
        write_generated_events_ts(valid_events, os.path.join(data_dir, "generated_events.ts"))
        write_generated_items_ts(valid_items, os.path.join(data_dir, "generated_items.ts"))
    else:
        print(f"  [WARN] LifeLine data dir not found: {data_dir}")
        print(f"  Only JSON backups were saved.")

    print(f"\n  Summary: {len(valid_events)} events, {len(valid_items)} items written")
    return valid_events, valid_items
