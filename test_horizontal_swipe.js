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
  await page.screenshot({ path: 'test_screenshots/horizontal_1.png' });
  console.log('Initial screenshot saved');
  
  // 获取卡片区域的位置
  const cardArea = await page.locator('.card-area').boundingBox();
  console.log('Card area:', cardArea);
  
  if (cardArea) {
    const centerY = cardArea.y + cardArea.height / 2;
    const startX = cardArea.x + cardArea.width * 0.7;
    const endX = cardArea.x + cardArea.width * 0.2;
    
    console.log(`Swiping left from (${startX}, ${centerY}) to (${endX}, ${centerY})`);
    
    // 执行水平左滑
    await page.mouse.move(startX, centerY);
    await page.mouse.down();
    await page.mouse.move(endX, centerY, { steps: 20 });
    await page.mouse.up();
    
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test_screenshots/horizontal_2.png' });
    console.log('After left swipe screenshot saved');
    
    // 等待一下然后右滑
    await page.waitForTimeout(1000);
    
    const startX2 = cardArea.x + cardArea.width * 0.3;
    const endX2 = cardArea.x + cardArea.width * 0.8;
    
    console.log(`Swiping right from (${startX2}, ${centerY}) to (${endX2}, ${centerY})`);
    
    await page.mouse.move(startX2, centerY);
    await page.mouse.down();
    await page.mouse.move(endX2, centerY, { steps: 20 });
    await page.mouse.up();
    
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test_screenshots/horizontal_3.png' });
    console.log('After right swipe screenshot saved');
  }
  
  await browser.close();
})();
