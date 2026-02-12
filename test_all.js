/**
 * ChoserLife 卡片游戏 - 综合自动化测试
 * 
 * 运行方式: node test_all.js
 * 
 * 测试项目:
 * 1. 页面加载测试
 * 2. 卡片队列测试
 * 3. Swiper滑动测试
 * 4. 布局测试
 */

const { chromium, devices } = require('playwright');

// 测试结果
const results = {
  passed: [],
  failed: []
};

// 记录测试结果
function recordTest(name, passed, message = '') {
  if (passed) {
    results.passed.push({ name, message });
    console.log(`✅ ${name}`);
  } else {
    results.failed.push({ name, message });
    console.log(`❌ ${name}: ${message}`);
  }
}

async function runTests() {
  console.log('🚀 开始运行测试...\n');
  console.log('=' .repeat(50));
  
  const browser = await chromium.launch({ headless: true });
  const iPhone = devices['iPhone 14 Pro'];
  const context = await browser.newContext({
    ...iPhone,
    hasTouch: true,
  });
  const page = await context.newPage();
  
  // 收集console日志
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push(msg.text());
  });
  
  try {
    // ==================== 1. 页面加载测试 ====================
    console.log('\n📋 1. 页面加载测试');
    console.log('-'.repeat(50));
    
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(12000);
    
    // 检查页面是否加载成功
    const pageTitle = await page.title();
    recordTest('页面加载', pageTitle !== '', `标题: ${pageTitle}`);
    
    // 检查是否有编译错误
    const hasError = consoleLogs.some(log => 
      log.includes('Error') || log.includes('error') || log.includes('Failed')
    );
    recordTest('无编译错误', !hasError, hasError ? '发现错误日志' : '');
    
    // 检查顶部导航栏
    const statusBar = await page.locator('.status-bar').count();
    recordTest('顶部导航栏存在', statusBar > 0);
    
    // 检查底部TabBar
    const tabBar = await page.locator('uni-tabbar').count();
    recordTest('底部TabBar存在', tabBar > 0);
    
    // ==================== 2. 卡片队列测试 ====================
    console.log('\n📋 2. 卡片队列测试');
    console.log('-'.repeat(50));
    
    // 检查卡片队列初始化日志
    const queueInitLog = consoleLogs.find(log => log.includes('Card queue initialized'));
    recordTest('卡片队列初始化', !!queueInitLog, queueInitLog || '未找到初始化日志');
    
    // 检查swiper-item数量
    const swiperItemCount = await page.locator('uni-swiper-item').count();
    recordTest('swiper-item数量 >= 2', swiperItemCount >= 2, `实际数量: ${swiperItemCount}`);
    
    // ==================== 3. Swiper滑动测试 ====================
    console.log('\n📋 3. Swiper滑动测试');
    console.log('-'.repeat(50));
    
    if (swiperItemCount >= 2) {
      // 截图滑动前的状态
      await page.screenshot({ path: 'test_screenshots/before_swipe.png' });
      
      // 获取滑动前的swiper current属性
      const beforeIndex = await page.evaluate(() => {
        const swiper = document.querySelector('uni-swiper');
        // 获取当前显示的swiper-item的transform位置
        const items = document.querySelectorAll('uni-swiper-item');
        let currentIndex = 0;
        items.forEach((item, index) => {
          const style = window.getComputedStyle(item);
          const transform = style.transform;
          // 如果transform是none或者translate(0, 0)，说明是当前显示的
          if (transform === 'none' || transform.includes('translate(0px, 0px)') || transform.includes('translate3d(0px, 0px')) {
            currentIndex = index;
          }
        });
        return currentIndex;
      });
      
      // 执行滑动
      const swiperBox = await page.locator('.card-swiper').boundingBox();
      if (swiperBox) {
        const swiper = page.locator('.card-swiper');
        await swiper.dragTo(swiper, {
          sourcePosition: { x: swiperBox.width / 2, y: swiperBox.height * 0.7 },
          targetPosition: { x: swiperBox.width / 2, y: swiperBox.height * 0.3 },
          force: true
        });
        
        await page.waitForTimeout(1500);
        
        // 检查Swiper change事件
        const hasChangeEvent = consoleLogs.some(log => log.includes('Swiper change'));
        recordTest('Swiper change事件触发', hasChangeEvent);
        
        // 检查Swiper animation finish事件
        const hasAnimationFinish = consoleLogs.some(log => log.includes('Swiper animation finish'));
        recordTest('Swiper animation finish事件触发', hasAnimationFinish);
        
        // 截图滑动后的状态
        await page.screenshot({ path: 'test_screenshots/after_swipe.png' });
        
        // 检查Swiper change事件中的current值是否变化
        const changeLog = consoleLogs.find(log => log.includes('Swiper change'));
        let newIndex = -1;
        if (changeLog) {
          const match = changeLog.match(/current:\s*(\d+)/);
          if (match) {
            newIndex = parseInt(match[1]);
          }
        }
        
        // 如果change事件触发了且current值变化了，说明滑动成功
        const swipeSuccess = hasChangeEvent && newIndex !== beforeIndex && newIndex >= 0;
        recordTest('滑动后卡片切换', swipeSuccess, 
          `滑动前索引: ${beforeIndex}, 滑动后索引: ${newIndex}`);
      }
    } else {
      recordTest('Swiper滑动测试', false, '卡片数量不足，无法测试滑动');
    }
    
    // ==================== 4. 布局测试 ====================
    console.log('\n📋 4. 布局测试');
    console.log('-'.repeat(50));
    
    // 检查卡片区域位置
    const cardArea = await page.locator('.card-area').boundingBox();
    const statusBarBox = await page.locator('.status-bar').boundingBox();
    
    if (cardArea && statusBarBox) {
      const cardBelowNav = cardArea.y >= statusBarBox.y + statusBarBox.height - 5;
      recordTest('卡片区域在导航栏下方', cardBelowNav, 
        `卡片顶部: ${cardArea.y}, 导航栏底部: ${statusBarBox.y + statusBarBox.height}`);
    }
    
    // 截图保存
    await page.screenshot({ path: 'test_screenshots/test_result.png' });
    recordTest('测试截图保存', true);
    
  } catch (error) {
    recordTest('测试执行', false, error.message);
  } finally {
    await browser.close();
  }
  
  // ==================== 输出测试结果 ====================
  console.log('\n' + '='.repeat(50));
  console.log('📊 测试结果汇总');
  console.log('='.repeat(50));
  console.log(`✅ 通过: ${results.passed.length}`);
  console.log(`❌ 失败: ${results.failed.length}`);
  console.log(`📈 通过率: ${(results.passed.length / (results.passed.length + results.failed.length) * 100).toFixed(1)}%`);
  
  if (results.failed.length > 0) {
    console.log('\n❌ 失败的测试:');
    results.failed.forEach(test => {
      console.log(`   - ${test.name}: ${test.message}`);
    });
  }
  
  console.log('\n' + '='.repeat(50));
  
  // 返回测试是否全部通过
  const allPassed = results.failed.length === 0;
  console.log(allPassed ? '🎉 所有测试通过！' : '⚠️ 存在失败的测试，请修复后重新运行');
  
  process.exit(allPassed ? 0 : 1);
}

runTests().catch(console.error);
