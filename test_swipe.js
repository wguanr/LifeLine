const { chromium, devices } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const iPhone = devices['iPhone 14 Pro'];
  const context = await browser.newContext({
    ...iPhone,
  });
  const page = await context.newPage();
  
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(5000);
  
  // 截图当前状态
  await page.screenshot({ path: 'test_screenshots/swipe_1.png' });
  
  // 向上滑动切换卡片
  await page.mouse.move(196, 400);
  await page.mouse.down();
  await page.mouse.move(196, 200, { steps: 10 });
  await page.mouse.up();
  
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test_screenshots/swipe_2.png' });
  
  // 再滑动一次
  await page.mouse.move(196, 400);
  await page.mouse.down();
  await page.mouse.move(196, 200, { steps: 10 });
  await page.mouse.up();
  
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test_screenshots/swipe_3.png' });
  
  console.log('Screenshots saved');
  
  await browser.close();
})();
