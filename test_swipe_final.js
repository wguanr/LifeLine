const { chromium, devices } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const iPhone = devices['iPhone 14 Pro'];
  const context = await browser.newContext({
    ...iPhone,
    hasTouch: true,
  });
  const page = await context.newPage();
  
  // 监听console消息
  page.on('console', msg => {
    if (msg.text().includes('Swiper') || msg.text().includes('swiper') || msg.text().includes('change')) {
      console.log('PAGE LOG:', msg.text());
    }
  });
  
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(5000);
  
  // 截图初始状态
  await page.screenshot({ path: 'test_screenshots/final_1.png' });
  console.log('Initial screenshot saved');
  
  // 获取swiper元素位置
  const swiperBox = await page.locator('.card-swiper').boundingBox();
  console.log('Swiper box:', swiperBox);
  
  if (swiperBox) {
    const centerX = swiperBox.x + swiperBox.width / 2;
    const startY = swiperBox.y + swiperBox.height * 0.8;
    const endY = swiperBox.y + swiperBox.height * 0.2;
    
    console.log(`Will swipe from (${centerX}, ${startY}) to (${centerX}, ${endY})`);
    
    // 使用page.touchscreen进行滑动
    // 先触摸起点
    await page.touchscreen.tap(centerX, startY);
    await page.waitForTimeout(100);
    
    // 然后进行滑动手势
    // Playwright的swipe需要使用mouse.move配合
    await page.mouse.move(centerX, startY);
    await page.mouse.down();
    
    // 分步移动，模拟真实滑动
    const steps = 10;
    const deltaY = (endY - startY) / steps;
    for (let i = 1; i <= steps; i++) {
      await page.mouse.move(centerX, startY + deltaY * i);
      await page.waitForTimeout(20);
    }
    
    await page.mouse.up();
    
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test_screenshots/final_2.png' });
    console.log('After swipe screenshot saved');
  }
  
  // 检查当前显示的卡片
  const cardInfo = await page.evaluate(() => {
    const cardWrapper = document.querySelector('.card-wrapper');
    const userName = document.querySelector('.user-name');
    const eventTitle = document.querySelector('.event-title');
    return {
      userName: userName?.textContent || null,
      eventTitle: eventTitle?.textContent || null
    };
  });
  console.log('Current card info:', cardInfo);
  
  await browser.close();
})();
