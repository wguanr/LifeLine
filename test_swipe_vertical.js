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
  
  // 截图初始状态
  await page.screenshot({ path: 'test_screenshots/vertical_1.png' });
  console.log('Initial screenshot saved');
  
  // 获取卡片区域的位置
  const cardArea = await page.locator('.card-area').boundingBox();
  console.log('Card area:', cardArea);
  
  if (cardArea) {
    const centerX = cardArea.x + cardArea.width / 2;
    const startY = cardArea.y + cardArea.height * 0.7;
    const endY = cardArea.y + cardArea.height * 0.3;
    
    console.log(`Swiping from (${centerX}, ${startY}) to (${centerX}, ${endY})`);
    
    // 执行垂直滑动
    await page.mouse.move(centerX, startY);
    await page.mouse.down();
    await page.mouse.move(centerX, endY, { steps: 20 });
    await page.mouse.up();
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test_screenshots/vertical_2.png' });
    console.log('After swipe screenshot saved');
  }
  
  await browser.close();
})();
