const { chromium, devices } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const iPhone = devices['iPhone 14 Pro'];
  const context = await browser.newContext({
    ...iPhone,
    hasTouch: true,
  });
  const page = await context.newPage();
  
  // 监听console消息
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(5000);
  
  // 检查cardQueue的状态
  const storeInfo = await page.evaluate(() => {
    // 尝试访问Pinia store
    const pinia = window.__PINIA__;
    if (pinia) {
      const cardStore = pinia.state.value.card;
      return {
        hasPinia: true,
        cardQueue: cardStore?.cardQueue || [],
        currentIndex: cardStore?.currentIndex,
        queueLength: cardStore?.cardQueue?.length || 0
      };
    }
    return { hasPinia: false };
  });
  
  console.log('Store info:', JSON.stringify(storeInfo, null, 2));
  
  // 检查DOM中的swiper-item数量
  const domInfo = await page.evaluate(() => {
    const swiperItems = document.querySelectorAll('uni-swiper-item');
    return {
      swiperItemCount: swiperItems.length,
      swiperItemsHTML: Array.from(swiperItems).map(item => item.className)
    };
  });
  
  console.log('DOM info:', domInfo);
  
  await browser.close();
})();
