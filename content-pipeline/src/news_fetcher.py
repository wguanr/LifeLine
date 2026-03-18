"""
RSS 新闻抓取模块
从 worldmonitor 使用的 RSS 源获取结构化新闻数据
"""
import feedparser
import time
import json
from dataclasses import dataclass, asdict
from typing import Optional


# worldmonitor 使用的核心 RSS 源（精选高质量源）
RSS_FEEDS = {
    "politics": [
        {"name": "BBC World", "url": "https://feeds.bbci.co.uk/news/world/rss.xml"},
        {"name": "Reuters World", "url": "https://news.google.com/rss/search?q=site:reuters.com+world&hl=en-US&gl=US&ceid=US:en"},
    ],
    "tech": [
        {"name": "TechCrunch", "url": "https://techcrunch.com/feed/"},
        {"name": "Ars Technica", "url": "https://feeds.arstechnica.com/arstechnica/index"},
    ],
    "finance": [
        {"name": "CNBC", "url": "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114"},
        {"name": "MarketWatch", "url": "https://feeds.marketwatch.com/marketwatch/topstories/"},
    ],
    "crisis": [
        {"name": "Al Jazeera", "url": "https://www.aljazeera.com/xml/rss/all.xml"},
        {"name": "BBC Middle East", "url": "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml"},
    ],
    "china": [
        {"name": "SCMP China", "url": "https://news.google.com/rss/search?q=site:scmp.com+china&hl=en-US&gl=US&ceid=US:en"},
        {"name": "Reuters China", "url": "https://news.google.com/rss/search?q=site:reuters.com+china&hl=en-US&gl=US&ceid=US:en"},
    ],
}

# 新闻分类关键词映射到 LifeLine 事件类型
CATEGORY_TO_EVENT_TYPE = {
    "politics": "story",
    "tech": "craft",
    "finance": "challenge",
    "crisis": "challenge",
    "china": "story",
    "science": "exploration",
    "social": "social",
}

# 紧急度关键词
URGENCY_KEYWORDS = {
    "critical": ["war", "attack", "killed", "dead", "crisis", "emergency", "collapse", "crash"],
    "high": ["conflict", "sanctions", "protest", "strike", "threat", "surge", "plunge", "ban"],
    "medium": ["tension", "concern", "debate", "dispute", "risk", "warning", "decline"],
    "low": ["announce", "plan", "propose", "discuss", "review", "update", "launch"],
}


@dataclass
class NewsArticle:
    """结构化新闻文章"""
    title: str
    link: str
    source: str
    category: str
    published: str
    summary: str
    urgency: str  # critical, high, medium, low
    suggested_event_type: str  # story, social, challenge, craft, exploration, creation

    def to_dict(self):
        return asdict(self)


def classify_urgency(title: str, summary: str = "") -> str:
    """基于关键词分类新闻紧急度"""
    text = (title + " " + summary).lower()
    for level, keywords in URGENCY_KEYWORDS.items():
        for kw in keywords:
            if kw in text:
                return level
    return "low"


def fetch_feed(feed_config: dict, category: str, max_items: int = 5) -> list[NewsArticle]:
    """抓取单个 RSS feed"""
    articles = []
    try:
        feed = feedparser.parse(feed_config["url"])
        for entry in feed.entries[:max_items]:
            title = entry.get("title", "").strip()
            if not title:
                continue

            link = entry.get("link", "")
            summary = entry.get("summary", entry.get("description", ""))
            # 清理 HTML 标签
            if summary:
                import re
                summary = re.sub(r'<[^>]+>', '', summary).strip()[:500]

            published = entry.get("published", entry.get("updated", ""))
            urgency = classify_urgency(title, summary)
            event_type = CATEGORY_TO_EVENT_TYPE.get(category, "story")

            articles.append(NewsArticle(
                title=title,
                link=link,
                source=feed_config["name"],
                category=category,
                published=published,
                summary=summary,
                urgency=urgency,
                suggested_event_type=event_type,
            ))
    except Exception as e:
        print(f"  [WARN] Failed to fetch {feed_config['name']}: {e}")

    return articles


def fetch_all_news(categories: Optional[list[str]] = None, max_per_feed: int = 3) -> list[NewsArticle]:
    """
    从所有配置的 RSS 源获取新闻
    
    Args:
        categories: 要抓取的分类列表，None 表示全部
        max_per_feed: 每个 feed 最多获取的文章数
    
    Returns:
        NewsArticle 列表
    """
    all_articles = []
    target_feeds = RSS_FEEDS if categories is None else {
        k: v for k, v in RSS_FEEDS.items() if k in categories
    }

    for category, feeds in target_feeds.items():
        print(f"[Fetching] Category: {category}")
        for feed_config in feeds:
            print(f"  -> {feed_config['name']}...")
            articles = fetch_feed(feed_config, category, max_per_feed)
            all_articles.extend(articles)
            print(f"     Got {len(articles)} articles")
            time.sleep(0.5)  # 礼貌性延迟

    # 按紧急度排序：critical > high > medium > low
    urgency_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    all_articles.sort(key=lambda a: urgency_order.get(a.urgency, 3))

    return all_articles


def select_top_news(articles: list[NewsArticle], count: int = 5) -> list[NewsArticle]:
    """
    从新闻列表中选择最适合生成游戏事件的 top N 条
    优先选择：高紧急度 + 分类多样性
    """
    selected = []
    seen_categories = set()

    # 第一轮：每个分类选一条最高紧急度的
    for article in articles:
        if article.category not in seen_categories and len(selected) < count:
            selected.append(article)
            seen_categories.add(article.category)

    # 第二轮：补充剩余名额
    for article in articles:
        if article not in selected and len(selected) < count:
            selected.append(article)

    return selected[:count]


if __name__ == "__main__":
    print("=" * 60)
    print("LifeLine Content Pipeline - News Fetcher")
    print("=" * 60)

    articles = fetch_all_news(max_per_feed=3)
    top = select_top_news(articles, count=5)

    print(f"\n{'=' * 60}")
    print(f"Total fetched: {len(articles)} articles")
    print(f"Top selected: {len(top)} articles")
    print(f"{'=' * 60}\n")

    for i, article in enumerate(top, 1):
        print(f"[{i}] [{article.urgency.upper()}] [{article.category}] {article.title}")
        print(f"    Source: {article.source}")
        print(f"    Type: {article.suggested_event_type}")
        print(f"    Summary: {article.summary[:120]}...")
        print()

    # 保存到 JSON 文件
    output = [a.to_dict() for a in top]
    with open("/home/ubuntu/card-game-app/content-pipeline/output/fetched_news.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"Saved to output/fetched_news.json")
