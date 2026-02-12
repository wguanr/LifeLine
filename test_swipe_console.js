const { chromium, devices } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const iPhone = devices['iPhone 14 Pro'];
  const context = await browser.newContext({
    ...iPhone,
    hasTouch: true,
  });
  const page = await context.newPage();
  
  // 监听所有console消息
  page.on('console', msg => {
    console.log('PAGE LOG:', msg.text());
  });
  
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(5000);
  
  // 截图初始状态
  await page.screenshot({ path: 'test_screenshots/console_1.png' });
  console.log('Initial screenshot saved');
  
  // 检查cardQueue的长度
  const queueInfo = await page.evaluate(() => {
    const swiperItems = document.querySelectorAll('uni-swiper-item');
    return {
      itemCount: swiperItems.length
    };
  });
  console.log('Swiper items:', queueInfo);
  
  // 获取swiper元素位置
  const swiperBox = await page.locator('.card-swiper').boundingBox();
  console.log('Swiper box:', swiperBox);
  
  if (swiperBox && queueInfo.itemCount > 1) {
    const centerX = swiperBox.x + swiperBox.width / 2;
    const startY = swiperBox.y + swiperBox.height * 0.7;
    const endY = swiperBox.y + swiperBox.height * 0.3;
    
    console.log(`Performing swipe gesture from (${centerX}, ${startY}) to (${centerX}, ${endY})`);
    
    // 使用page.locator进行滑动
    const swiper = page.locator('.card-swiper');
    
    // 尝试使用dragTo
    await swiper.dragTo(swiper, {
      sourcePosition: { x: swiperBox.width / 2, y: swiperBox.height * 0.7 },
      targetPosition: { x: swiperBox.width / 2, y: swiperBox.height * 0.3 },
      force: true
    });
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test_screenshots/console_2.png' });
    console.log('After drag screenshot saved');
  }
  
  await browser.close();
})();
