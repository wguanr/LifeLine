const { chromium } = require('playwright');

async function test() {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  
  const devices = [
    { name: 'iPhone_14', width: 390, height: 844 },
    { name: 'iPhone_SE', width: 375, height: 667 },
    { name: 'iPad_Mini', width: 768, height: 1024 },
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
      await page.waitForTimeout(2500);
      
      // 截图初始状态
      await page.screenshot({ path: `test_screenshots/nojitter_${device.name}_initial.png` });
      
      // 检查基础渲染
      const hasContent = await page.evaluate(() => {
        return (document.querySelector('uni-page-body')?.innerHTML || '').length > 500;
      });
      
      // 检查底部操作栏是否存在
      const hasActionsBar = await page.evaluate(() => {
        return document.querySelector('.card-actions-bar') !== null;
      });
      
      // 检查详情按钮和更多按钮
      const hasDetailBtn = await page.evaluate(() => {
        return document.querySelector('.detail-btn') !== null;
      });
      const hasMoreBtn = await page.evaluate(() => {
        return document.querySelector('.more-btn') !== null;
      });
      
      // 检查没有touch事件处理器（不应该有swipeable-card上的touchstart）
      const noTouchHandler = await page.evaluate(() => {
        const el = document.querySelector('.swipeable-card');
        // 检查元素上没有touchstart属性
        return el && !el.getAttribute('ontouchstart');
      });
      
      // 点击详情按钮测试面板弹出
      const detailBtn = await page.$('.detail-btn');
      if (detailBtn) {
        await detailBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: `test_screenshots/nojitter_${device.name}_detail_panel.png` });
        
        // 检查面板是否弹出
        const panelVisible = await page.evaluate(() => {
          const overlay = document.querySelector('.panel-overlay.visible');
          const sheet = document.querySelector('.panel-sheet.visible');
          return { overlay: !!overlay, sheet: !!sheet };
        });
        
        // 关闭面板
        const closeBtn = await page.$('.sheet-close');
        if (closeBtn) await closeBtn.click();
        await page.waitForTimeout(400);
      }
      
      // 点击更多按钮测试操作面板
      const moreBtn = await page.$('.more-btn');
      if (moreBtn) {
        await moreBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: `test_screenshots/nojitter_${device.name}_more_panel.png` });
      }
      
      // 测试垂直滑动（swiper切换卡片）- 不应该有任何冲突
      // 关闭面板先
      const overlay = await page.$('.panel-overlay.visible');
      if (overlay) await overlay.click();
      await page.waitForTimeout(400);
      
      // 模拟垂直滑动
      await page.touchscreen.tap(device.width / 2, device.height / 2);
      await page.waitForTimeout(200);
      
      // 使用 mouse 模拟滑动
      await page.mouse.move(device.width / 2, device.height * 0.6);
      await page.mouse.down();
      for (let i = 0; i < 10; i++) {
        await page.mouse.move(device.width / 2, device.height * 0.6 - (i * 20), { steps: 1 });
        await page.waitForTimeout(20);
      }
      await page.mouse.up();
      await page.waitForTimeout(800);
      
      await page.screenshot({ path: `test_screenshots/nojitter_${device.name}_after_swipe.png` });
      
      results.push({
        device: device.name,
        hasContent,
        hasActionsBar,
        hasDetailBtn,
        hasMoreBtn,
        status: hasContent && hasActionsBar && hasDetailBtn && hasMoreBtn ? '✅' : '❌'
      });
      
    } catch (err) {
      results.push({ device: device.name, error: err.message, status: '❌' });
    }
    
    await context.close();
  }
  
  await browser.close();
  
  console.log('\n=== 无抖动方案验证 ===');
  for (const r of results) {
    console.log(`${r.status} ${r.device}: content=${r.hasContent} actionsBar=${r.hasActionsBar} detailBtn=${r.hasDetailBtn} moreBtn=${r.hasMoreBtn}`);
    if (r.error) console.log(`  Error: ${r.error}`);
  }
  
  const allPass = results.every(r => r.status === '✅');
  console.log(`\n总结: ${allPass ? '✅ 全部通过' : '❌ 存在问题'}`);
}

test().catch(console.error);
