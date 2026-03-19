# LifeLine Backend Test Checklist

## Service 层单元测试

### 1. resource.service (14 functions)
- [ ] getWallet: 正常获取 / 新用户默认钱包
- [ ] canAfford: 够用 / 不够用 / 边界值
- [ ] deductResources: 正常扣除 / 余额不足
- [ ] addResources: 正常增加 / 溢出边界
- [ ] getUserTags: 有标签 / 无标签
- [ ] updateTagWeight: 新标签 / 已有标签累加
- [ ] updateTagWeights: 批量更新
- [ ] decayTagWeights: 衰减计算正确性
- [ ] getInventory: 有物品 / 空背包
- [ ] addItem: 新物品 / 已有物品叠加
- [ ] removeItem: 正常移除 / 数量不足
- [ ] buyItem: 正常购买 / 余额不足

### 2. event.service (9 functions)
- [ ] getActiveEvents: 返回所有事件
- [ ] getEventById: 存在 / 不存在
- [ ] startEvent: 正常开始
- [ ] processChoice: 非对称结算正确性 / 潮汐乘数联动 / 身份乘数
- [ ] completeEvent: 正常完成
- [ ] getUserChoices: 有记录 / 无记录
- [ ] getWorldlineRecords: 返回世界线
- [ ] createEventLegacy: 创建遗产
- [ ] getEventLegacies: 查询遗产

### 3. item.service (3 functions)
- [ ] getDynamicPrice: Bonding Curve 计算 / 世界状态敏感性
- [ ] getAllItemsWithPrices: 返回所有物品含价格
- [ ] buyItemDynamic: 动态价格购买 / 余额不足

### 4. world.service (4 functions)
- [ ] getCurrentWorldState: 正常获取
- [ ] updateDimensions: 更新维度 / 触发纪元变迁
- [ ] getEpochInfo: 各纪元信息
- [ ] getAllEpochs: 返回所有纪元

### 5. social.service
- [ ] follow/unfollow: 关注/取关
- [ ] getFollowing/getFollowers: 列表查询
- [ ] getMutuals: 互关列表
- [ ] getOverview: 社交概览
- [ ] interact: 互动（合作/竞争/交易）
- [ ] getReputationBonus: 声誉加成
- [ ] getCircleTendency: 圈子倾向

### 6. information.service
- [ ] generateForEvent: 为事件生成信息
- [ ] getAvailable: 可用信息列表
- [ ] getMyInfo: 已解锁信息
- [ ] getMarket: 市场统计
- [ ] unlockInfo: 解锁信息 / 余额不足 / 已解锁
- [ ] shareInfo: 分享信息
- [ ] generateRumor: 生成谣言

### 7. world-tick.job
- [ ] executeTick: 维度漂移 / 纪元变迁 / 潮汐更新

## API 路由集成测试

### auth.route (4 endpoints)
- [ ] POST /register: 正常注册 / 重复邮箱 / 缺少字段
- [ ] POST /login: 正常登录 / 错误密码 / 不存在用户
- [ ] GET /me: 认证成功 / 无 token / 过期 token
- [ ] PATCH /me: 更新昵称

### game.route (17 endpoints)
- [ ] GET /events, /events/:id
- [ ] POST /events/:id/start, /events/:id/complete
- [ ] POST /choices, GET /choices
- [ ] GET /items, POST /items/:id/buy
- [ ] GET /tags, /wallet, /user/tags, /inventory
- [ ] GET /world, /world/epochs, /worldline, /legacies

### social.route (9 endpoints)
- [ ] POST /follow, /unfollow
- [ ] GET /following, /followers, /mutuals, /overview
- [ ] POST /interact
- [ ] GET /reputation-bonus, /circle-tendency/:eventId

### information.route (7 endpoints)
- [ ] GET /available, /my, /market
- [ ] POST /generate/:eventId, /unlock, /share, /generate-rumor

## 引擎联动测试
- [ ] 选择结算 → 钱包变化 → 标签更新 → 世界维度影响
- [ ] 世界 Tick → 纪元变迁 → 物品价格变化
- [ ] 社交网络 → 声誉加成 → 结算乘数
- [ ] 信息解锁 → 声誉消耗 → 钱包变化
- [ ] 并发安全：同时操作钱包
- [ ] 边界条件：钱包归零、标签权重极值、维度 0/1 边界
