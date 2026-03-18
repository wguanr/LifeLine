#!/usr/bin/env python3
"""
LifeLine AI Content Pipeline - 主入口
从 worldmonitor RSS 获取新闻 → 三阶段 AI 生成 → 输出到 LifeLine 项目

用法:
  python3 main.py                          # 默认：抓取所有分类，生成 5 个事件
  python3 main.py --categories tech crisis  # 指定分类
  python3 main.py --count 3                # 生成 3 个事件
  python3 main.py --dry-run                # 只抓取新闻，不调用 AI
"""
import argparse
import json
import os
import sys
import time
from datetime import datetime

# 确保可以导入同目录模块
sys.path.insert(0, os.path.dirname(__file__))

from news_fetcher import fetch_all_news, select_top_news, NewsArticle
from ai_generator import generate_content
from output_writer import write_output


def main():
    parser = argparse.ArgumentParser(description="LifeLine AI Content Pipeline")
    parser.add_argument("--categories", nargs="+", default=None,
                        help="RSS categories to fetch (e.g., tech crisis finance)")
    parser.add_argument("--count", type=int, default=5,
                        help="Number of events to generate (default: 5)")
    parser.add_argument("--max-per-feed", type=int, default=3,
                        help="Max articles per RSS feed (default: 3)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Only fetch news, don't call AI")
    parser.add_argument("--output-dir", type=str, default=None,
                        help="Override output directory")
    args = parser.parse_args()

    start_time = time.time()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    print("=" * 70)
    print(f"  LifeLine AI Content Pipeline")
    print(f"  Started at: {timestamp}")
    print(f"  Categories: {args.categories or 'all'}")
    print(f"  Target count: {args.count}")
    print("=" * 70)

    # ── Phase 1: 新闻抓取 ──
    print(f"\n{'─'*70}")
    print("Phase 1: Fetching news from RSS feeds...")
    print(f"{'─'*70}")

    articles = fetch_all_news(
        categories=args.categories,
        max_per_feed=args.max_per_feed,
    )
    top_articles = select_top_news(articles, count=args.count)

    print(f"\nFetched {len(articles)} total articles, selected top {len(top_articles)}:")
    for i, a in enumerate(top_articles, 1):
        print(f"  [{i}] [{a.urgency.upper():8s}] [{a.category:10s}] {a.title[:70]}")

    if args.dry_run:
        print("\n[DRY RUN] Stopping before AI generation.")
        # 保存抓取结果
        output_dir = args.output_dir or os.path.join(os.path.dirname(__file__), "../output")
        os.makedirs(output_dir, exist_ok=True)
        with open(os.path.join(output_dir, "fetched_news.json"), "w", encoding="utf-8") as f:
            json.dump([a.to_dict() for a in top_articles], f, ensure_ascii=False, indent=2)
        print(f"  Saved to {output_dir}/fetched_news.json")
        return

    # ── Phase 2: AI 内容生成 ──
    print(f"\n{'─'*70}")
    print("Phase 2: AI content generation (3-stage pipeline)...")
    print(f"{'─'*70}")

    all_events = []
    all_items = []
    failures = []

    for i, article in enumerate(top_articles, 1):
        try:
            event, items = generate_content(article, i)
            all_events.append(event)
            all_items.extend(items)
            print(f"  ✓ [{i}/{len(top_articles)}] Generated: {event.get('title', 'N/A')[:50]}")
        except Exception as e:
            print(f"  ✗ [{i}/{len(top_articles)}] Failed: {article.title[:50]}... Error: {e}")
            failures.append({"article": article.title, "error": str(e)})

    # ── Phase 3: 输出 ──
    print(f"\n{'─'*70}")
    print("Phase 3: Validation and output...")
    print(f"{'─'*70}")

    if all_events:
        write_output(all_events, all_items)
    else:
        print("  No events generated. Nothing to write.")

    # ── 总结 ──
    elapsed = time.time() - start_time
    print(f"\n{'='*70}")
    print(f"  Pipeline Complete!")
    print(f"  Time: {elapsed:.1f}s")
    print(f"  Events: {len(all_events)} generated, {len(failures)} failed")
    print(f"  Items: {len(all_items)} generated")
    if failures:
        print(f"  Failures:")
        for f in failures:
            print(f"    - {f['article'][:60]}: {f['error'][:80]}")
    print(f"{'='*70}")


if __name__ == "__main__":
    main()
