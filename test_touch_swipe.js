const { chromium, devices } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const iPhone = devices['iPhone 14 Pro'];
  const context = await browser.newContext({
    ...iPhone,
    hasTouch: true,
  });
  const page = await context.newPage();
  
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(5000);
  
  // 截图初始状态
  await page.screenshot({ path: 'test_screenshots/touch_1.png' });
  console.log('Initial screenshot saved');
  
  // 获取swiper元素
  const swiper = await page.locator('.card-swiper').boundingBox();
  console.log('Swiper area:', swiper);
  
  if (swiper) {
    const centerX = swiper.x + swiper.width / 2;
    const startY = swiper.y + swiper.height * 0.7;
    const endY = swiper.y + swiper.height * 0.3;
    
    console.log(`Touch swipe from (${centerX}, ${startY}) to (${centerX}, ${endY})`);
    
    // 使用touchscreen API进行滑动
    await page.touchscreen.tap(centerX, startY);
    await page.waitForTimeout(100);
    
    // 模拟触摸滑动
    await page.evaluate(async ({ startX, startY, endX, endY }) => {
      const swiperEl = document.querySelector('.card-swiper');
      if (!swiperEl) return;
      
      // 创建touch事件
      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [new Touch({
          identifier: 0,
          target: swiperEl,
          clientX: startX,
          clientY: startY,
        })]
      });
      
      const touchMove = new TouchEvent('touchmove', {
        bubbles: true,
        cancelable: true,
        touches: [new Touch({
          identifier: 0,
          target: swiperEl,
          clientX: endX,
          clientY: endY,
        })]
      });
      
      const touchEnd = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        touches: []
      });
      
      swiperEl.dispatchEvent(touchStart);
      await new Promise(r => setTimeout(r, 50));
      swiperEl.dispatchEvent(touchMove);
      await new Promise(r => setTimeout(r, 50));
      swiperEl.dispatchEvent(touchEnd);
    }, { startX: centerX, startY: startY, endX: centerX, endY: endY });
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test_screenshots/touch_2.png' });
    console.log('After touch swipe screenshot saved');
  }
  
  await browser.close();
})();
