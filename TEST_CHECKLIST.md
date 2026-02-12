# ChoserLife 卡片游戏 - 测试清单

> 每次修改后，必须确保以下所有测试通过才能交付给用户

## 交付前检查清单

每次修改后，必须按以下顺序执行：

1. **重启开发服务器**
   ```bash
   pkill -f "vite" && sleep 2 && cd /home/ubuntu/card-game-app && nohup pnpm run dev:h5 > /tmp/vite.log 2>&1 &
   ```

2. **等待服务器启动**
   ```bash
   sleep 8 && tail -3 /tmp/vite.log
   ```

3. **运行自动化测试**
   ```bash
   node test_all.js
   ```

4. **暴露端口供用户访问**
   使用 `expose` 工具暴露 5173 端口

5. **提供访问链接给用户**

## 生产服务器

**启动命令**:
```bash
/home/ubuntu/card-game-app/start-server.sh
```

**端口**: 3000

**访问地址**: https://3000-i8398pvpxj2ykdhplunw3-0b8d5dea.sg1.manus.computer

**注意**: 沙箱休眠后服务器会停止，需要重新运行启动脚本

---

## 自动化测试

运行命令：`node test_all.js`

### 1. 页面加载测试
- [x] 页面能正常加载，无编译错误
- [x] 顶部导航栏正常显示（世界切换、资源、等级、头像）
- [x] 底部TabBar正常显示（探索、世界线、我的）
- [x] 卡片区域正确填充在导航栏之间

### 2. 卡片队列测试
- [x] 事件数据正确加载（eventStore.loadEvents）
- [x] 物品数据正确加载（itemStore.loadItems）
- [x] 卡片队列正确初始化（cardQueue.length >= 2）
- [x] swiper-item数量与cardQueue长度一致

### 3. Swiper滑动测试
- [x] 垂直滑动能切换卡片
- [x] Swiper change事件正常触发
- [x] Swiper animation finish事件正常触发
- [x] 滑动后显示不同的卡片内容

### 4. 卡片类型测试
- [ ] 用户卡片（UserCard）正常显示
- [ ] 事件卡片（EventCard）正常显示
- [ ] 物品卡片（ItemCard）正常显示

### 5. 布局测试
- [x] 卡片内容不被顶部导航栏遮挡
- [x] 卡片底部按钮不被TabBar遮挡
- [x] 移动端视口适配正常

## 手动测试项（需要用户确认）

### 交互测试
- [ ] 点击"关注"按钮有响应
- [ ] 点击"查看详情"按钮有响应
- [ ] 点击头像能跳转到个人中心
- [ ] 世界切换功能正常

## 测试结果记录

| 日期 | 测试版本 | 通过/失败 | 备注 |
|------|----------|-----------|------|
| 2026-02-02 | v1.0 | 通过 | 初始版本，swiper滑动功能修复 |
| 2026-02-02 | v1.1 | 通过 | 添加自动化测试脚本，11项测试全部通过 |

## 已知问题

1. ~~swiper无法滑动~~ - 已修复（2026-02-02）
   - 原因：事件和物品数据未加载，导致卡片队列只有1张卡片
   - 解决：在onMounted中先加载事件和物品数据

## 测试脚本说明

- `test_all.js` - 运行所有自动化测试
- `test_card_queue.js` - 测试卡片队列初始化
- `test_swipe_console.js` - 测试swiper滑动功能
