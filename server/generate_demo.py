"""
批量生成 Demo 数据：用过去一年的核心新闻事件生成游戏卡片
"""

import json
import time
import os
from aigc_engine import process_news_event

# ==================== 过去一年核心新闻事件 ====================

DEMO_NEWS_EVENTS = [
    {
        "title": "特朗普打响全球关税战",
        "summary": "2025年4月2日'解放日'，特朗普宣布对大多数进口商品征收10%基础关税，对中国商品关税升至125%。全球贸易格局剧变，消费品价格飙升，供应链面临重组。中国以暂停稀土出口反制。5月中美达成90天减税协议暂时缓和局势。",
        "date": "2025-04-02",
        "region": "全球",
        "urgency": "critical"
    },
    {
        "title": "俄乌战争进入第四年",
        "summary": "俄乌战争在2025年持续胶着。俄罗斯3月收复库尔斯克，但全年仅增加不到1%的乌克兰领土控制，每天损失约1000名士兵。乌克兰6月发动'蜘蛛网行动'用无人机深入俄境打击5个空军基地。欧盟年底提供1050亿美元贷款支持乌克兰。特朗普推动停火谈判但被批评偏向俄罗斯。",
        "date": "2025-06-15",
        "region": "欧洲/俄罗斯",
        "urgency": "critical"
    },
    {
        "title": "DeepSeek震撼AI行业",
        "summary": "2025年1月，中国AI公司DeepSeek发布了一款不依赖先进Nvidia芯片就能匹敌美国顶级AI模型的系统，引发全球震动。美国科技公司加大AI投资，芯片出口管制成为中美博弈焦点。12月特朗普授权Nvidia向中国出售H200芯片引发争议。AI是否会取代大量工作岗位成为全民讨论话题。",
        "date": "2025-01-20",
        "region": "全球",
        "urgency": "high"
    },
    {
        "title": "以色列与伊朗爆发十二日战争",
        "summary": "2025年6月，以色列发动'雄狮崛起'行动打击伊朗核设施和军事基地，暗杀政治领袖和核科学家。伊朗以导弹和无人机反击。美国B2轰炸机参与'午夜之锤'行动打击伊朗核设施。6月24日双方停火，但伊朗可能已转移浓缩铀库存，根本矛盾未解。",
        "date": "2025-06-12",
        "region": "中东",
        "urgency": "critical"
    },
    {
        "title": "印度与巴基斯坦军事冲突",
        "summary": "2025年5月，克什米尔恐袭导致26人死亡后，印度打击巴基斯坦境内'恐怖基础设施'。巴基斯坦以无人机和导弹反击并击落两架印度先进战斗机。这是两个核大国半个世纪以来最激烈的军事冲突。三天后双方停火，但印度暂停参与1960年《印度河水条约》，威胁巴基斯坦80%农田的灌溉水源。",
        "date": "2025-05-10",
        "region": "南亚",
        "urgency": "critical"
    },
    {
        "title": "中国稀土武器化反制美国",
        "summary": "2025年4月，面对美国关税攻势，中国暂停对美出口磁铁和7种稀土矿物。中国控制全球60%稀土开采和90%精炼产能。10月美国加码芯片出口管制后，中国再次以稀土出口限制反制。美国被迫推迟出口管制实施。稀土成为中国对抗美国经济霸权的关键武器。",
        "date": "2025-04-15",
        "region": "中美",
        "urgency": "high"
    },
    {
        "title": "加沙停火与三阶段和平计划",
        "summary": "经过两年残酷战斗，以色列和哈马斯在2025年10月达成停火协议。和平计划分三阶段：立即停火并交换人质、哈马斯解除武装并部署国际稳定力量、重建巴勒斯坦治理和加沙基础设施。但哈马斯无意解除武装，以色列恢复空袭，无国家正式承诺派兵。持久和平仍遥不可及。",
        "date": "2025-10-01",
        "region": "中东",
        "urgency": "high"
    },
    {
        "title": "苏丹内战造成40万人死亡",
        "summary": "苏丹内战持续近三年，苏丹武装部队(SAF)与快速支援部队(RSF)激战。40万人死亡，1200万人流离失所，大面积饥荒。2025年10月RSF攻占达尔富尔最后据点法希尔，屠杀平民的血迹从太空可见。国际社会调解无果，国家面临事实分裂。",
        "date": "2025-10-15",
        "region": "非洲",
        "urgency": "high"
    },
    {
        "title": "教皇方济各去世，首位美国教皇诞生",
        "summary": "2025年4月21日，教皇方济各中风去世。经过四轮投票，枢机主教团选出芝加哥出身的罗伯特·普雷沃斯特枢机为新教皇，取名利奥十四世。他是天主教会267位教皇中首位来自北美的教皇，也是奥古斯丁修会首位教皇。他以关注工人阶级福祉的利奥十三世为榜样。",
        "date": "2025-05-08",
        "region": "全球",
        "urgency": "medium"
    },
    {
        "title": "柬泰边境冲突升级",
        "summary": "2025年7月，柬埔寨和泰国因百年边境古庙争端爆发数十年来最严重军事冲突。初期战斗造成数十人死亡、数万人流离失所。10月在吉隆坡签署停火协议，但11月地雷炸死4名泰国士兵后协议破裂。12月泰国战斗机轰炸柬埔寨目标，冲突再度升级。",
        "date": "2025-07-10",
        "region": "东南亚",
        "urgency": "medium"
    }
]


def generate_all_demo_data():
    """批量生成所有Demo数据"""
    all_events = []
    all_items = []
    all_new_tags = []
    
    for i, news in enumerate(DEMO_NEWS_EVENTS):
        print(f"\n{'='*60}")
        print(f"[{i+1}/{len(DEMO_NEWS_EVENTS)}] Processing: {news['title']}")
        print(f"{'='*60}")
        
        result = process_news_event(news)
        
        if result["success"]:
            all_events.append(result["event"])
            all_items.extend(result["items"])
            all_new_tags.extend(result["newTags"])
            print(f"  ✅ Success: 1 event + {len(result['items'])} items")
        else:
            print(f"  ❌ Failed")
        
        # 避免API限流
        if i < len(DEMO_NEWS_EVENTS) - 1:
            time.sleep(1)
    
    # 去重标签
    seen_tag_ids = set()
    unique_tags = []
    for tag in all_new_tags:
        if tag.get('id') not in seen_tag_ids:
            seen_tag_ids.add(tag.get('id'))
            unique_tags.append(tag)
    
    # 输出统计
    print(f"\n{'='*60}")
    print(f"Generation Complete!")
    print(f"  Events: {len(all_events)}")
    print(f"  Items:  {len(all_items)}")
    print(f"  New Tags: {len(unique_tags)}")
    print(f"{'='*60}")
    
    return {
        "events": all_events,
        "items": all_items,
        "newTags": unique_tags,
        "generatedAt": int(time.time() * 1000),
        "newsCount": len(DEMO_NEWS_EVENTS)
    }


def save_demo_data(data: dict, output_dir: str):
    """保存生成的Demo数据为前端可用的TypeScript文件"""
    
    os.makedirs(output_dir, exist_ok=True)
    
    # 1. 保存完整JSON（供后端API使用）
    json_path = os.path.join(output_dir, "aigc_demo_data.json")
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Saved JSON: {json_path}")
    
    # 2. 生成前端 TypeScript 文件 - AIGC Events
    events_ts = generate_events_ts(data["events"])
    events_path = os.path.join(output_dir, "aigc_events.ts")
    with open(events_path, 'w', encoding='utf-8') as f:
        f.write(events_ts)
    print(f"Saved TS events: {events_path}")
    
    # 3. 生成前端 TypeScript 文件 - AIGC Items
    items_ts = generate_items_ts(data["items"])
    items_path = os.path.join(output_dir, "aigc_items.ts")
    with open(items_path, 'w', encoding='utf-8') as f:
        f.write(items_ts)
    print(f"Saved TS items: {items_path}")
    
    # 4. 生成前端 TypeScript 文件 - AIGC Tags
    tags_ts = generate_tags_ts(data["newTags"])
    tags_path = os.path.join(output_dir, "aigc_tags.ts")
    with open(tags_path, 'w', encoding='utf-8') as f:
        f.write(tags_ts)
    print(f"Saved TS tags: {tags_path}")


def normalize_event(event: dict) -> dict:
    """将LLM生成的event标准化为前端GameEvent格式"""
    # 确保stages格式正确
    stages = []
    raw_stages = event.get('stages', [])
    for i, stage in enumerate(raw_stages):
        normalized_stage = {
            "id": stage.get('id', f"stage_{i+1}"),
            "title": stage.get('title', stage.get('stageTitle', f'阶段{i+1}')),
            "description": stage.get('description', stage.get('stageDescription', '')),
            "choices": []
        }
        
        for j, choice in enumerate(stage.get('choices', [])):
            cost = choice.get('cost', {})
            outcome = choice.get('outcome', {})
            
            # 标准化outcome
            normalized_choice = {
                "id": choice.get('id', f"choice_{i+1}_{j+1}"),
                "text": choice.get('text', ''),
                "cost": cost if cost else None,
                "outcome": {
                    "nextStageId": outcome.get('nextStageId'),
                    "isEnding": outcome.get('isEnding', i == len(raw_stages) - 1),
                    "rewards": {
                        "tags": outcome.get('tags', {}),
                        "items": outcome.get('items', []),
                    },
                    "resultText": outcome.get('resultText', outcome.get('description', ''))
                }
            }
            normalized_stage["choices"].append(normalized_choice)
        
        stages.append(normalized_stage)
    
    return {
        "id": event.get('id', f"aigc_event_{int(time.time())}"),
        "title": event.get('title', ''),
        "description": event.get('description', ''),
        "cover": event.get('cover', '📰'),
        "type": event.get('type', 'story'),
        "status": 'active',
        "requirements": event.get('requirements', {}),
        "entryFee": event.get('entryFee', event.get('entryCost', {})),
        "stages": stages,
        "participantCount": event.get('participantCount', 1000),
        "createdAt": event.get('createdAt', int(time.time())),
        "source": event.get('source', {"type": "aigc"})
    }


def normalize_item(item: dict) -> dict:
    """将LLM生成的item标准化为前端Item格式"""
    return {
        "id": item.get('id', f"aigc_item_{int(time.time())}"),
        "name": item.get('name', ''),
        "description": item.get('description', ''),
        "icon": item.get('icon', '📦'),
        "rarity": item.get('rarity', 'uncommon'),
        "category": item.get('category', 'collectible'),
        "mintCost": item.get('mintCost', {"time": 30, "energy": 20}),
        "effects": item.get('effects', []),
        "tags": item.get('tags', []),
        "featureTags": item.get('featureTags', []),
        "story": item.get('story', ''),
        "visible": True,
        "createdAt": item.get('createdAt', int(time.time())),
        "source": item.get('source', {"type": "aigc"})
    }


def generate_events_ts(events: list) -> str:
    """生成前端可用的 aigc_events.ts"""
    normalized = [normalize_event(e) for e in events]
    
    ts = """/**
 * AIGC 生成的现实世界事件卡片
 * 基于过去一年全球核心新闻事件自动生成
 * Generated at: """ + time.strftime('%Y-%m-%d %H:%M:%S') + """
 */

export interface AigcSource {
  type: 'aigc'
  newsTitle: string
  newsDate: string
  region: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
}

export const aigcEvents = """ + json.dumps(normalized, ensure_ascii=False, indent=2) + """ as const

export default aigcEvents
"""
    return ts


def generate_items_ts(items: list) -> str:
    """生成前端可用的 aigc_items.ts"""
    normalized = [normalize_item(i) for i in items]
    
    ts = """/**
 * AIGC 生成的现实世界关联物品
 * 每个物品与一个现实事件关联
 * Generated at: """ + time.strftime('%Y-%m-%d %H:%M:%S') + """
 */

export const aigcItems = """ + json.dumps(normalized, ensure_ascii=False, indent=2) + """ as const

export default aigcItems
"""
    return ts


def generate_tags_ts(tags: list) -> str:
    """生成前端可用的 aigc_tags.ts"""
    ts = """/**
 * AIGC 建议的新标签定义
 * 用于扩展用户画像维度以覆盖现实事件主题
 * Generated at: """ + time.strftime('%Y-%m-%d %H:%M:%S') + """
 */

import type { TagDefinition } from '@/types'

export const aigcTagDefinitions: TagDefinition[] = """ + json.dumps(tags, ensure_ascii=False, indent=2) + """

export default aigcTagDefinitions
"""
    return ts


if __name__ == "__main__":
    print("Starting AIGC Demo Data Generation...")
    print(f"Processing {len(DEMO_NEWS_EVENTS)} news events...\n")
    
    data = generate_all_demo_data()
    
    # 保存到前端 data 目录
    output_dir = "/home/ubuntu/card-game-app/src/data"
    save_demo_data(data, output_dir)
    
    # 同时保存到 server 目录备份
    save_demo_data(data, "/home/ubuntu/card-game-app/server")
    
    print("\n✅ All demo data generated and saved!")
