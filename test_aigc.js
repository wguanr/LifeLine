const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }
  });
  const page = await context.newPage();
  
  console.log('=== AIGC Card Integration Test ===');
  
  // 访问探索页面
  await page.goto('http://localhost:5173/#/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // 截图初始状态
  await page.screenshot({ path: 'test_screenshots/aigc_explore_1.png' });
  console.log('✅ Screenshot 1: Initial explore page');
  
  // 检查页面内容
  const html = await page.content();
  const hasAigcBadge = html.includes('现实事件') || html.includes('aigc-source-badge');
  console.log(`AIGC badge found: ${hasAigcBadge}`);
  
  // 多次滑动查看不同卡片
  for (let i = 2; i <= 8; i++) {
    // 模拟向上滑动切换卡片
    await page.mouse.move(195, 500);
    await page.mouse.down();
    await page.mouse.move(195, 200, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(800);
    
    await page.screenshot({ path: `test_screenshots/aigc_explore_${i}.png` });
    
    const currentHtml = await page.content();
    const hasAigc = currentHtml.includes('现实事件');
    const hasOriginal = !hasAigc;
    console.log(`✅ Screenshot ${i}: Card ${i} (${hasAigc ? 'AIGC' : 'Original'})`);
  }
  
  // 访问profile页面检查事件tab
  await page.goto('http://localhost:5173/#/pages/profile/profile', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test_screenshots/aigc_profile.png' });
  console.log('✅ Screenshot: Profile page');
  
  // 多尺寸测试
  const sizes = [
    { name: 'iPhone_SE', width: 375, height: 667 },
    { name: 'iPad_Mini', width: 768, height: 1024 }
  ];
  
  for (const size of sizes) {
    await page.setViewportSize({ width: size.width, height: size.height });
    await page.goto('http://localhost:5173/#/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `test_screenshots/aigc_${size.name}.png` });
    console.log(`✅ Screenshot: ${size.name} (${size.width}x${size.height})`);
  }
  
  console.log('\n=== All AIGC Tests Complete ===');
  await browser.close();
})();
