# LifeLine - ChoserLife 卡片式人生模拟游戏

一款基于 uni-app (Vue 3 + TypeScript) 的卡片式人生模拟游戏。玩家通过上下滑动卡片来探索世界、参与事件、结识用户、铸造物品。

## 功能特性

- **卡片探索**：上下滑动切换卡片，左右滑动查看详情/操作面板
- **三种卡片类型**：事件卡片、用户卡片、物品卡片
- **多倍资源投入**：参与事件时，每次点击追加一倍投入，2秒倒计时自动确认
- **世界线系统**：多世界线切换，记录人生轨迹
- **资源管理**：时间、精力、社交积分三种资源

## 技术栈

- **框架**: uni-app (Vue 3 + TypeScript)
- **状态管理**: Pinia
- **样式**: SCSS + 玻璃拟态设计
- **构建工具**: Vite

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动H5开发服务器
pnpm run dev:h5

# 构建H5生产版本
pnpm run build:h5
```

## 项目结构

```
src/
├── components/       # 组件
│   ├── EventCard.vue       # 事件卡片（单按钮多倍投入）
│   ├── UserCard.vue        # 用户卡片
│   ├── ItemCard.vue        # 物品卡片
│   ├── SwipeableCard.vue   # 可滑动卡片容器
│   └── WorldTrackSwitch.vue # 世界线切换
├── data/             # Mock数据
├── pages/            # 页面
│   ├── index/        # 探索页（主页）
│   ├── worldline/    # 世界线页
│   └── profile/      # 个人页
├── stores/           # Pinia状态管理
├── styles/           # 全局样式
└── types/            # TypeScript类型定义
```

## 测试

```bash
# 运行自动化测试（需要先启动开发服务器）
node test_all.js
```
