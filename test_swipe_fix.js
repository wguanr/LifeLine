const { chromium } = require('playwright');

async function testSwipe() {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  
  const devices = [
    { name: 'iPhone_14', width: 390, height: 844 },
    { name: 'iPhone_SE', width: 375, height: 667 },
  ];
  
  for (const device of devices) {
    const context = await browser.newContext({
      viewport: { width: device.width, height: device.height },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    
    try {
      await page.goto('http://localhost:5173/#/', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: `test_screenshots/swipe_${device.name}_initial.png` });
      
      // 检查基础渲染
      const hasContent = await page.evaluate(() => {
        const html = document.querySelector('uni-page-body')?.innerHTML || '';
        return html.length > 1000;
      });
      
      const hasSwipeCard = await page.evaluate(() => {
        return document.querySelector('.swipeable-card') !== null;
      });
      
      // 检查touch-action CSS属性是否正确设置
      const touchAction = await page.evaluate(() => {
        const el = document.querySelector('.swipeable-card');
        return el ? getComputedStyle(el).touchAction : 'not found';
      });
      
      // 检查card-content是否存在且无默认transition（内联样式控制）
      const cardContentExists = await page.evaluate(() => {
        return document.querySelector('.card-content') !== null;
      });
      
      // 检查swipe-indicator是否存在
      const hasIndicators = await page.evaluate(() => {
        return document.querySelectorAll('.swipe-indicator').length >= 2;
      });
      
      // 检查overlay是否存在
      const hasOverlay = await page.evaluate(() => {
        return document.querySelector('.overlay') !== null;
      });
      
      results.push({
        device: device.name,
        hasContent,
        hasSwipeCard,
        touchAction,
        cardContentExists,
        hasIndicators,
        hasOverlay,
        status: hasContent && hasSwipeCard && touchAction === 'pan-y' ? '✅' : '❌'
      });
      
      await page.screenshot({ path: `test_screenshots/swipe_${device.name}_final.png` });
      
    } catch (err) {
      results.push({ device: device.name, error: err.message, status: '❌' });
    }
    
    await context.close();
  }
  
  await browser.close();
  
  console.log('\n=== 滑动手势修复验证 ===');
  for (const r of results) {
    console.log(`${r.status} ${r.device}:`);
    console.log(`  content=${r.hasContent} swipeCard=${r.hasSwipeCard}`);
    console.log(`  touch-action=${r.touchAction} (期望: pan-y)`);
    console.log(`  cardContent=${r.cardContentExists} indicators=${r.hasIndicators} overlay=${r.hasOverlay}`);
    if (r.error) console.log(`  Error: ${r.error}`);
  }
  
  const allPass = results.every(r => r.status === '✅');
  console.log(`\n总结: ${allPass ? '✅ 全部通过' : '❌ 存在问题'}`);
}

testSwipe().catch(console.error);
