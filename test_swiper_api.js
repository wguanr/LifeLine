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
  await page.screenshot({ path: 'test_screenshots/api_1.png' });
  console.log('Initial screenshot saved');
  
  // 尝试通过修改current属性来切换swiper
  await page.evaluate(() => {
    // 查找Vue实例并修改currentIndex
    const app = document.querySelector('#app');
    if (app && app.__vue_app__) {
      console.log('Found Vue app');
    }
    
    // 尝试直接操作swiper元素
    const swiperEl = document.querySelector('uni-swiper');
    if (swiperEl) {
      console.log('Found swiper element:', swiperEl);
      // 尝试触发change事件
      const event = new CustomEvent('change', {
        detail: { current: 1 }
      });
      swiperEl.dispatchEvent(event);
    }
  });
  
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test_screenshots/api_2.png' });
  console.log('After API call screenshot saved');
  
  // 检查swiper的DOM结构
  const swiperInfo = await page.evaluate(() => {
    const swiper = document.querySelector('uni-swiper');
    const swiperItems = document.querySelectorAll('uni-swiper-item');
    return {
      swiperExists: !!swiper,
      swiperItemCount: swiperItems.length,
      swiperHTML: swiper ? swiper.outerHTML.substring(0, 500) : 'not found'
    };
  });
  console.log('Swiper info:', swiperInfo);
  
  await browser.close();
})();
