#!/usr/bin/env python3
"""
LifeLine Content Pipeline - 自动化测试
严格按照 types/index.ts 中的 GameEvent 和 Item 接口定义验证生成的 JSON

测试维度：
  1. 结构完整性：所有必填字段是否存在
  2. 类型一致性：每个字段的值类型是否正确
  3. 枚举约束：type/status/rarity/category 是否在允许范围内
  4. 逻辑一致性：stage 流转、ending 标记、隐藏选项等
  5. 无多余字段：确保输出不含 source 等非标准字段
  6. 可接入性：最终输出的 JSON 可直接被卡片系统消费
"""
import json
import sys
import os
from dataclasses import dataclass, field

# ============================================================
# 常量：来自 types/index.ts
# ============================================================

VALID_EVENT_TYPES = {"story", "social", "challenge", "craft", "exploration", "creation"}
VALID_STATUSES = {"active", "upcoming", "ended", "draft"}
VALID_RARITIES = {"common", "uncommon", "rare", "epic", "legendary"}
VALID_ITEM_CATEGORIES = {"consumable", "equipment", "collectible", "material"}

# GameEvent 允许的顶层字段
EVENT_FIELDS = {
    "id", "title", "description", "cover", "type", "status",
    "requirements", "entryFee", "stages", "participantCount", "createdAt"
}

# Item 允许的顶层字段
ITEM_FIELDS = {
    "id", "name", "description", "icon", "rarity", "category",
    "mintCost", "effects", "tags", "featureTags", "story",
    "image", "visible", "createdAt", "stackable", "maxStack", "maxMint", "mintedCount"
}

# rewards 允许的字段
REWARD_FIELDS = {"time", "energy", "reputation", "tags", "items", "itemDrops"}

# penalties 允许的字段
PENALTY_FIELDS = {"time", "energy", "reputation", "tags"}


@dataclass
class TestResult:
    name: str
    passed: int = 0
    failed: int = 0
    warnings: int = 0
    errors: list = field(default_factory=list)
    warns: list = field(default_factory=list)

    def ok(self, msg: str = ""):
        self.passed += 1

    def fail(self, msg: str):
        self.failed += 1
        self.errors.append(msg)

    def warn(self, msg: str):
        self.warnings += 1
        self.warns.append(msg)

    @property
    def total(self):
        return self.passed + self.failed

    @property
    def success(self):
        return self.failed == 0


# ============================================================
# 测试：GameEvent
# ============================================================

def test_event(event: dict, result: TestResult, all_item_ids: set):
    """验证单个 GameEvent"""
    eid = event.get("id", "?")
    prefix = f"Event[{eid}]"

    # ── 1. 无多余字段 ──
    extra_fields = set(event.keys()) - EVENT_FIELDS
    if extra_fields:
        result.fail(f"{prefix}: 存在非标准字段 {extra_fields}，卡片系统无法识别")
    else:
        result.ok()

    # ── 2. 必填字段存在 ──
    for f in ["id", "title", "description", "cover", "type", "status", "stages", "entryFee", "requirements", "participantCount", "createdAt"]:
        if f not in event:
            result.fail(f"{prefix}: 缺少必填字段 '{f}'")
        else:
            result.ok()

    # ── 3. 字段类型 ──
    if not isinstance(event.get("id"), str) or not event["id"]:
        result.fail(f"{prefix}: id 必须是非空字符串")
    else:
        result.ok()

    if not isinstance(event.get("title"), str) or len(event.get("title", "")) < 5:
        result.fail(f"{prefix}: title 必须是 ≥5 字符的字符串")
    else:
        result.ok()

    if not isinstance(event.get("description"), str) or len(event.get("description", "")) < 20:
        result.fail(f"{prefix}: description 必须是 ≥20 字符的字符串")
    else:
        result.ok()

    if not isinstance(event.get("cover"), str) or not event["cover"]:
        result.fail(f"{prefix}: cover 必须是非空字符串（emoji）")
    else:
        result.ok()

    # ── 4. 枚举约束 ──
    if event.get("type") not in VALID_EVENT_TYPES:
        result.fail(f"{prefix}: type='{event.get('type')}' 不在 {VALID_EVENT_TYPES}")
    else:
        result.ok()

    if event.get("status") not in VALID_STATUSES:
        result.fail(f"{prefix}: status='{event.get('status')}' 不在 {VALID_STATUSES}")
    else:
        result.ok()

    # ── 5. entryFee ──
    ef = event.get("entryFee", {})
    if not isinstance(ef, dict):
        result.fail(f"{prefix}: entryFee 必须是对象")
    else:
        for k, v in ef.items():
            if k not in {"time", "energy"}:
                result.fail(f"{prefix}: entryFee 含非法字段 '{k}'")
            elif not isinstance(v, (int, float)):
                result.fail(f"{prefix}: entryFee.{k} 必须是数字")
            else:
                result.ok()

    # ── 6. requirements ──
    req = event.get("requirements", {})
    if not isinstance(req, dict):
        result.fail(f"{prefix}: requirements 必须是对象")
    else:
        allowed_req = {"tags", "minTagWeight", "items", "minTime", "minReputation"}
        for k in req:
            if k not in allowed_req:
                result.fail(f"{prefix}: requirements 含非法字段 '{k}'")
        if "tags" in req and not isinstance(req["tags"], list):
            result.fail(f"{prefix}: requirements.tags 必须是 string[]")
        else:
            result.ok()

    # ── 7. participantCount & createdAt ──
    if not isinstance(event.get("participantCount"), (int, float)):
        result.fail(f"{prefix}: participantCount 必须是数字")
    else:
        result.ok()

    if not isinstance(event.get("createdAt"), (int, float)):
        result.fail(f"{prefix}: createdAt 必须是数字（毫秒时间戳）")
    else:
        result.ok()

    # ── 8. stages ──
    stages = event.get("stages", [])
    if not isinstance(stages, list) or len(stages) < 1:
        result.fail(f"{prefix}: stages 必须是非空数组")
        return

    stage_ids = set()
    has_ending = False
    has_hidden = False

    for si, stage in enumerate(stages):
        sp = f"{prefix}.stages[{si}]"

        # stage 必填字段
        for f in ["id", "title", "description", "choices"]:
            if f not in stage:
                result.fail(f"{sp}: 缺少必填字段 '{f}'")
            else:
                result.ok()

        sid = stage.get("id", "")
        if sid in stage_ids:
            result.fail(f"{sp}: stage id '{sid}' 重复")
        stage_ids.add(sid)

        choices = stage.get("choices", [])
        if not isinstance(choices, list) or len(choices) < 2:
            result.fail(f"{sp}: choices 必须有 ≥2 个选项")
        else:
            result.ok()

        choice_ids = set()
        for ci, choice in enumerate(choices):
            cp = f"{sp}.choices[{ci}]"
            test_choice(choice, cp, result, stage_ids, all_item_ids)

            cid = choice.get("id", "")
            if cid in choice_ids:
                result.fail(f"{cp}: choice id '{cid}' 重复")
            choice_ids.add(cid)

            if choice.get("outcome", {}).get("isEnding"):
                has_ending = True
            if choice.get("hidden"):
                has_hidden = True

    if not has_ending:
        result.fail(f"{prefix}: 没有任何选项标记 isEnding=true，事件无法结束")
    else:
        result.ok()

    if not has_hidden:
        result.warn(f"{prefix}: 没有隐藏选项（建议至少一个）")


def test_choice(choice: dict, prefix: str, result: TestResult, stage_ids: set, all_item_ids: set):
    """验证单个 EventChoice"""
    # 必填字段
    for f in ["id", "text", "outcome"]:
        if f not in choice:
            result.fail(f"{prefix}: 缺少必填字段 '{f}'")
        else:
            result.ok()

    if not isinstance(choice.get("text"), str) or len(choice.get("text", "")) < 2:
        result.fail(f"{prefix}: text 必须是 ≥2 字符的字符串")
    else:
        result.ok()

    # cost
    cost = choice.get("cost")
    if cost is not None:
        if not isinstance(cost, dict):
            result.fail(f"{prefix}: cost 必须是对象")
        else:
            for k in cost:
                if k not in {"time", "energy"}:
                    result.fail(f"{prefix}: cost 含非法字段 '{k}'")

    # hidden + requiresItems
    if choice.get("hidden"):
        if not choice.get("requiresItems") or not isinstance(choice["requiresItems"], list):
            result.warn(f"{prefix}: hidden=true 但缺少 requiresItems")

    # outcome
    outcome = choice.get("outcome", {})
    if not isinstance(outcome, dict):
        result.fail(f"{prefix}: outcome 必须是对象")
        return

    if "resultText" not in outcome:
        result.fail(f"{prefix}: outcome 缺少 resultText")
    elif not isinstance(outcome["resultText"], str) or len(outcome["resultText"]) < 5:
        result.fail(f"{prefix}: outcome.resultText 必须是 ≥5 字符的字符串")
    else:
        result.ok()

    # nextStageId / isEnding 逻辑
    is_ending = outcome.get("isEnding", False)
    next_stage = outcome.get("nextStageId")
    if not is_ending and next_stage is None:
        result.warn(f"{prefix}: 既不是 ending 也没有 nextStageId")

    # rewards
    rewards = outcome.get("rewards")
    if rewards is not None:
        if not isinstance(rewards, dict):
            result.fail(f"{prefix}: outcome.rewards 必须是对象")
        else:
            for k in rewards:
                if k not in REWARD_FIELDS:
                    result.fail(f"{prefix}: rewards 含非法字段 '{k}'（标签应放在 rewards.tags 下）")
                else:
                    result.ok()
            # 验证 tags 格式
            tags = rewards.get("tags")
            if tags is not None:
                if isinstance(tags, dict):
                    for tk, tv in tags.items():
                        if not isinstance(tv, (int, float)):
                            result.fail(f"{prefix}: rewards.tags['{tk}'] 值必须是数字，实际是 {type(tv).__name__}")
                        else:
                            result.ok()
                elif isinstance(tags, list):
                    result.ok()  # string[] 也是合法的
                else:
                    result.fail(f"{prefix}: rewards.tags 必须是 Record<string,number> 或 string[]")

    # penalties
    penalties = outcome.get("penalties")
    if penalties is not None:
        if not isinstance(penalties, dict):
            result.fail(f"{prefix}: outcome.penalties 必须是对象")
        else:
            for k in penalties:
                if k not in PENALTY_FIELDS:
                    result.fail(f"{prefix}: penalties 含非法字段 '{k}'")
                else:
                    result.ok()
            tags = penalties.get("tags")
            if tags is not None and not isinstance(tags, dict):
                result.fail(f"{prefix}: penalties.tags 必须是 Record<string,number>")


# ============================================================
# 测试：Item
# ============================================================

def test_item(item: dict, result: TestResult):
    """验证单个 Item"""
    iid = item.get("id", "?")
    prefix = f"Item[{iid}]"

    # ── 1. 无多余字段 ──
    extra_fields = set(item.keys()) - ITEM_FIELDS
    if extra_fields:
        result.fail(f"{prefix}: 存在非标准字段 {extra_fields}，卡片系统无法识别")
    else:
        result.ok()

    # ── 2. 必填字段 ──
    for f in ["id", "name", "description", "icon", "rarity", "category", "mintCost", "effects", "tags", "featureTags", "story", "visible", "createdAt"]:
        if f not in item:
            result.fail(f"{prefix}: 缺少必填字段 '{f}'")
        else:
            result.ok()

    # ── 3. 字段类型 ──
    if not isinstance(item.get("id"), str) or not item["id"]:
        result.fail(f"{prefix}: id 必须是非空字符串")
    else:
        result.ok()

    if not isinstance(item.get("name"), str) or len(item.get("name", "")) < 2:
        result.fail(f"{prefix}: name 必须是 ≥2 字符的字符串")
    else:
        result.ok()

    if not isinstance(item.get("description"), str) or len(item.get("description", "")) < 10:
        result.fail(f"{prefix}: description 必须是 ≥10 字符的字符串")
    else:
        result.ok()

    if not isinstance(item.get("icon"), str) or not item["icon"]:
        result.fail(f"{prefix}: icon 必须是非空字符串（emoji）")
    else:
        result.ok()

    if not isinstance(item.get("story"), str) or len(item.get("story", "")) < 20:
        result.fail(f"{prefix}: story 必须是 ≥20 字符的字符串")
    else:
        result.ok()

    if not isinstance(item.get("visible"), bool):
        result.fail(f"{prefix}: visible 必须是布尔值")
    else:
        result.ok()

    if not isinstance(item.get("createdAt"), (int, float)):
        result.fail(f"{prefix}: createdAt 必须是数字")
    else:
        result.ok()

    # ── 4. 枚举约束 ──
    if item.get("rarity") not in VALID_RARITIES:
        result.fail(f"{prefix}: rarity='{item.get('rarity')}' 不在 {VALID_RARITIES}")
    else:
        result.ok()

    if item.get("category") not in VALID_ITEM_CATEGORIES:
        result.fail(f"{prefix}: category='{item.get('category')}' 不在 {VALID_ITEM_CATEGORIES}")
    else:
        result.ok()

    # ── 5. mintCost ──
    mc = item.get("mintCost", {})
    if not isinstance(mc, dict):
        result.fail(f"{prefix}: mintCost 必须是对象")
    else:
        for k in mc:
            if k not in {"time", "energy"}:
                result.fail(f"{prefix}: mintCost 含非法字段 '{k}'")

    # ── 6. effects ──
    effects = item.get("effects", [])
    if not isinstance(effects, list):
        result.fail(f"{prefix}: effects 必须是数组")
    else:
        for ei, eff in enumerate(effects):
            ep = f"{prefix}.effects[{ei}]"
            if not isinstance(eff, dict):
                result.fail(f"{ep}: 必须是对象")
                continue
            for f in ["type", "value", "description"]:
                if f not in eff:
                    result.fail(f"{ep}: 缺少字段 '{f}'")
                else:
                    result.ok()
            if "value" in eff and not isinstance(eff["value"], (int, float)):
                result.fail(f"{ep}: value 必须是数字")

    # ── 7. tags & featureTags ──
    tags = item.get("tags", [])
    if not isinstance(tags, list):
        result.fail(f"{prefix}: tags 必须是 string[]")
    else:
        result.ok()

    ft = item.get("featureTags", [])
    if not isinstance(ft, list) or len(ft) < 3:
        result.fail(f"{prefix}: featureTags 必须有 ≥3 个元素")
    elif len(ft) > 5:
        result.warn(f"{prefix}: featureTags 有 {len(ft)} 个（建议 3-5 个）")
    else:
        result.ok()


# ============================================================
# 主测试入口
# ============================================================

def run_tests(events_path: str, items_path: str) -> bool:
    """运行所有测试，返回是否全部通过"""
    print("=" * 70)
    print("  LifeLine Content Pipeline - 自动化测试")
    print("=" * 70)

    # 加载数据
    with open(events_path, "r", encoding="utf-8") as f:
        events = json.load(f)
    with open(items_path, "r", encoding="utf-8") as f:
        items = json.load(f)

    print(f"\n  输入: {len(events)} events, {len(items)} items")

    # 收集所有 item id
    all_item_ids = {i.get("id", "") for i in items}

    # ── 测试 Events ──
    event_result = TestResult("GameEvent 验证")
    for event in events:
        test_event(event, event_result, all_item_ids)

    # ── 测试 Items ──
    item_result = TestResult("Item 验证")
    for item in items:
        test_item(item, item_result)

    # ── 交叉验证 ──
    cross_result = TestResult("交叉引用验证")

    # 检查 ID 唯一性
    event_ids = [e.get("id") for e in events]
    if len(event_ids) != len(set(event_ids)):
        cross_result.fail("存在重复的 event id")
    else:
        cross_result.ok()

    item_ids = [i.get("id") for i in items]
    if len(item_ids) != len(set(item_ids)):
        cross_result.fail("存在重复的 item id")
    else:
        cross_result.ok()

    # 检查隐藏选项的 requiresItems 是否引用了存在的 item
    for event in events:
        for stage in event.get("stages", []):
            for choice in stage.get("choices", []):
                if choice.get("hidden") and choice.get("requiresItems"):
                    for req_item in choice["requiresItems"]:
                        if req_item not in all_item_ids:
                            cross_result.warn(f"隐藏选项 {choice['id']} 引用了不存在的物品 '{req_item}'")
                        else:
                            cross_result.ok()

    # ── 输出报告 ──
    all_results = [event_result, item_result, cross_result]

    print(f"\n{'─' * 70}")
    total_passed = 0
    total_failed = 0
    total_warnings = 0

    for r in all_results:
        status = "✓ PASS" if r.success else "✗ FAIL"
        print(f"\n  [{status}] {r.name}: {r.passed}/{r.total} passed, {r.warnings} warnings")
        if r.errors:
            for err in r.errors:
                print(f"    ✗ {err}")
        if r.warns:
            for w in r.warns:
                print(f"    ⚠ {w}")
        total_passed += r.passed
        total_failed += r.failed
        total_warnings += r.warnings

    print(f"\n{'─' * 70}")
    all_pass = total_failed == 0
    status = "✓ ALL TESTS PASSED" if all_pass else f"✗ {total_failed} TESTS FAILED"
    print(f"\n  {status}")
    print(f"  Total: {total_passed + total_failed} checks, {total_passed} passed, {total_failed} failed, {total_warnings} warnings")
    print(f"{'=' * 70}\n")

    return all_pass


if __name__ == "__main__":
    base_dir = os.path.join(os.path.dirname(__file__), "../output")
    events_path = os.path.join(base_dir, "generated_events.json")
    items_path = os.path.join(base_dir, "generated_items.json")

    if not os.path.exists(events_path) or not os.path.exists(items_path):
        print("ERROR: 找不到生成的 JSON 文件，请先运行 main.py")
        sys.exit(1)

    success = run_tests(events_path, items_path)
    sys.exit(0 if success else 1)
