"""
AIGC Content API Server
提供 AIGC 内容推送和实时新闻转换接口
"""

import json
import os
import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from aigc_engine import process_news_event

app = FastAPI(title="LifeLine AIGC Content API", version="1.0.0")

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 加载已生成的Demo数据
DEMO_DATA_PATH = os.path.join(os.path.dirname(__file__), "aigc_demo_data.json")
demo_data = {}
if os.path.exists(DEMO_DATA_PATH):
    with open(DEMO_DATA_PATH, 'r', encoding='utf-8') as f:
        demo_data = json.load(f)


# ==================== Models ====================

class NewsInput(BaseModel):
    title: str
    summary: str
    date: str
    region: str
    urgency: str = "medium"


class ContentFeedRequest(BaseModel):
    region: Optional[str] = None
    urgency: Optional[str] = None
    limit: int = 5
    offset: int = 0


# ==================== API Endpoints ====================

@app.get("/")
async def root():
    return {
        "service": "LifeLine AIGC Content API",
        "version": "1.0.0",
        "endpoints": {
            "GET /api/feed": "获取AIGC内容推送流",
            "GET /api/events": "获取所有AIGC事件",
            "GET /api/items": "获取所有AIGC物品",
            "GET /api/tags": "获取AIGC新增标签",
            "POST /api/generate": "实时将新闻转化为卡片",
            "GET /api/stats": "获取内容统计"
        }
    }


@app.get("/api/feed")
async def get_content_feed(region: Optional[str] = None, urgency: Optional[str] = None, limit: int = 10, offset: int = 0):
    """
    获取AIGC内容推送流
    按时间倒序返回事件和物品的混合流
    """
    events = demo_data.get("events", [])
    items = demo_data.get("items", [])
    
    # 过滤
    if region:
        events = [e for e in events if region.lower() in e.get("source", {}).get("region", "").lower()]
    if urgency:
        events = [e for e in events if e.get("source", {}).get("urgency") == urgency]
    
    # 构建混合流：每个事件后跟其关联物品
    feed = []
    for event in events:
        feed.append({
            "type": "event",
            "data": event,
            "timestamp": event.get("createdAt", 0)
        })
        # 找到关联物品
        event_id = event.get("id", "")
        related_items = [i for i in items if i.get("source", {}).get("relatedEventId") == event_id]
        for item in related_items:
            feed.append({
                "type": "item",
                "data": item,
                "timestamp": item.get("createdAt", 0)
            })
    
    # 分页
    total = len(feed)
    feed = feed[offset:offset + limit]
    
    return {
        "feed": feed,
        "total": total,
        "offset": offset,
        "limit": limit,
        "hasMore": offset + limit < total
    }


@app.get("/api/events")
async def get_aigc_events(region: Optional[str] = None, urgency: Optional[str] = None):
    """获取所有AIGC生成的事件"""
    events = demo_data.get("events", [])
    
    if region:
        events = [e for e in events if region.lower() in e.get("source", {}).get("region", "").lower()]
    if urgency:
        events = [e for e in events if e.get("source", {}).get("urgency") == urgency]
    
    return {"events": events, "total": len(events)}


@app.get("/api/events/{event_id}")
async def get_aigc_event(event_id: str):
    """获取单个AIGC事件详情"""
    events = demo_data.get("events", [])
    items = demo_data.get("items", [])
    
    event = next((e for e in events if e.get("id") == event_id), None)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    related_items = [i for i in items if i.get("source", {}).get("relatedEventId") == event_id]
    
    return {"event": event, "relatedItems": related_items}


@app.get("/api/items")
async def get_aigc_items():
    """获取所有AIGC生成的物品"""
    items = demo_data.get("items", [])
    return {"items": items, "total": len(items)}


@app.get("/api/tags")
async def get_aigc_tags():
    """获取AIGC建议的新标签"""
    tags = demo_data.get("newTags", [])
    return {"tags": tags, "total": len(tags)}


@app.get("/api/stats")
async def get_stats():
    """获取AIGC内容统计"""
    events = demo_data.get("events", [])
    items = demo_data.get("items", [])
    tags = demo_data.get("newTags", [])
    
    # 按地区统计
    region_stats = {}
    for e in events:
        region = e.get("source", {}).get("region", "unknown")
        region_stats[region] = region_stats.get(region, 0) + 1
    
    # 按紧急度统计
    urgency_stats = {}
    for e in events:
        urgency = e.get("source", {}).get("urgency", "unknown")
        urgency_stats[urgency] = urgency_stats.get(urgency, 0) + 1
    
    return {
        "totalEvents": len(events),
        "totalItems": len(items),
        "totalNewTags": len(tags),
        "generatedAt": demo_data.get("generatedAt"),
        "regionDistribution": region_stats,
        "urgencyDistribution": urgency_stats
    }


@app.post("/api/generate")
async def generate_from_news(news: NewsInput):
    """
    实时将新闻转化为游戏卡片
    POST body: { title, summary, date, region, urgency }
    """
    news_dict = {
        "title": news.title,
        "summary": news.summary,
        "date": news.date,
        "region": news.region,
        "urgency": news.urgency
    }
    
    result = process_news_event(news_dict)
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail="AIGC generation failed")
    
    return {
        "event": result["event"],
        "items": result["items"],
        "newTags": result["newTags"],
        "generatedAt": int(time.time() * 1000)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
