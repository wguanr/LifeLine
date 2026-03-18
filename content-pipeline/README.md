# LifeLine AI Content Pipeline

基于 worldmonitor RSS 新闻源，通过三阶段 AI Prompt 链自动生成 LifeLine 游戏的 Events 和 Items。

## 架构

```
RSS Feeds (worldmonitor sources)
    │
    ▼
[news_fetcher.py] ── 抓取 + 分类 + 紧急度评估
    │
    ▼
[ai_generator.py] ── 三阶段 AI Prompt 链
    │  Stage 1: 事件主题生成 (NewsArticle → GameEvent 框架)
    │  Stage 2: 交互设计 (GameEvent → stages + choices)
    │  Stage 3: 关联物品创造 (GameEvent → Items)
    │
    ▼
[output_writer.py] ── JSON 验证 + 自动修复 + 写入 TS 文件
    │
    ▼
src/data/generated_events.ts + generated_items.ts
```

## 使用方法

```bash
# 安装依赖
pip3 install openai feedparser

# 默认运行：抓取所有分类，生成 5 个事件
python3 src/main.py

# 指定分类和数量
python3 src/main.py --categories tech crisis --count 3

# 仅抓取新闻（不调用 AI）
python3 src/main.py --dry-run

# 查看帮助
python3 src/main.py --help
```

## 环境变量

需要设置 `OPENAI_API_KEY` 环境变量。默认使用 `gpt-4.1-mini` 模型。

## RSS 数据源

| 分类 | 数据源 |
|------|--------|
| politics | BBC World, Reuters World |
| tech | TechCrunch, Ars Technica |
| finance | CNBC, MarketWatch |
| crisis | Al Jazeera, BBC Middle East |
| china | SCMP China, Reuters China |

## 输出

生成的数据同时保存到两个位置：

1. `output/generated_events.json` + `generated_items.json` — JSON 备份
2. `../src/data/generated_events.ts` + `generated_items.ts` — LifeLine 项目数据文件
