const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  
  console.log('=== 左右滑动 & 底部按钮测试 ===');
  
  // 1. 打开探索页
  await page.goto('http://localhost:5173/#/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test_screenshots/swipe3_initial.png' });
  console.log('✅ 1. 初始页面截图完成');
  
  // 2. 检查底部快捷按钮是否存在
  const quickBtns = await page.$$('.quick-btn');
  console.log(`✅ 2. 底部快捷按钮数量: ${quickBtns.length}`);
  
  // 3. 点击"详情"按钮测试
  const detailBtn = await page.$('.detail-btn');
  if (detailBtn) {
    await detailBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test_screenshots/swipe3_detail_btn.png' });
    console.log('✅ 3. 点击详情按钮 - 面板打开');
    
    // 关闭面板
    const overlay = await page.$('.overlay.visible');
    if (overlay) {
      await overlay.click();
      await page.waitForTimeout(500);
    }
  } else {
    console.log('⚠️ 3. 未找到详情按钮');
  }
  
  // 4. 点击"操作"按钮测试
  const actionBtn = await page.$('.action-btn');
  if (actionBtn) {
    await actionBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test_screenshots/swipe3_action_btn.png' });
    console.log('✅ 4. 点击操作按钮 - 面板打开');
    
    // 关闭面板
    const overlay = await page.$('.overlay.visible');
    if (overlay) {
      await overlay.click();
      await page.waitForTimeout(500);
    }
  } else {
    console.log('⚠️ 4. 未找到操作按钮');
  }
  
  // 5. 测试垂直滑动（上下切换卡片）
  await page.screenshot({ path: 'test_screenshots/swipe3_before_vertical.png' });
  
  // 纯垂直滑动 - 应该切换卡片
  await page.touchscreen.tap(195, 400);
  await page.waitForTimeout(200);
  
  // 模拟垂直滑动
  await page.evaluate(() => {
    const el = document.querySelector('.swiper-item');
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const startY = rect.top + rect.height * 0.7;
    const endY = rect.top + rect.height * 0.2;
    
    const touchStart = new TouchEvent('touchstart', {
      bubbles: true, cancelable: true,
      touches: [new Touch({ identifier: 0, target: el, clientX: cx, clientY: startY })]
    });
    const touchMove = new TouchEvent('touchmove', {
      bubbles: true, cancelable: true,
      touches: [new Touch({ identifier: 0, target: el, clientX: cx, clientY: endY })]
    });
    const touchEnd = new TouchEvent('touchend', {
      bubbles: true, cancelable: true,
      changedTouches: [new Touch({ identifier: 0, target: el, clientX: cx, clientY: endY })]
    });
    
    el.dispatchEvent(touchStart);
    setTimeout(() => el.dispatchEvent(touchMove), 50);
    setTimeout(() => el.dispatchEvent(touchEnd), 100);
  });
  
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test_screenshots/swipe3_after_vertical.png' });
  console.log('✅ 5. 垂直滑动测试完成');
  
  // 6. 测试水平滑动（左滑打开操作面板）
  await page.evaluate(() => {
    const el = document.querySelector('.card-content');
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cy = rect.top + rect.height / 2;
    const startX = rect.left + rect.width * 0.8;
    const endX = rect.left + rect.width * 0.1;
    
    const touchStart = new TouchEvent('touchstart', {
      bubbles: true, cancelable: true,
      touches: [new Touch({ identifier: 0, target: el, clientX: startX, clientY: cy })]
    });
    el.dispatchEvent(touchStart);
    
    // 多步移动模拟真实滑动
    const steps = 8;
    for (let i = 1; i <= steps; i++) {
      const x = startX + (endX - startX) * (i / steps);
      setTimeout(() => {
        const touchMove = new TouchEvent('touchmove', {
          bubbles: true, cancelable: true,
          touches: [new Touch({ identifier: 0, target: el, clientX: x, clientY: cy })]
        });
        el.dispatchEvent(touchMove);
      }, i * 30);
    }
    
    setTimeout(() => {
      const touchEnd = new TouchEvent('touchend', {
        bubbles: true, cancelable: true,
        changedTouches: [new Touch({ identifier: 0, target: el, clientX: endX, clientY: cy })]
      });
      el.dispatchEvent(touchEnd);
    }, (steps + 1) * 30);
  });
  
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test_screenshots/swipe3_left_swipe.png' });
  console.log('✅ 6. 左滑手势测试完成');
  
  // 7. 多尺寸测试
  const sizes = [
    { name: 'iPhone_SE', width: 375, height: 667 },
    { name: 'Narrow_320', width: 320, height: 568 },
    { name: 'iPad_Mini', width: 768, height: 1024 },
  ];
  
  for (const size of sizes) {
    await page.setViewportSize({ width: size.width, height: size.height });
    await page.goto('http://localhost:5173/#/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `test_screenshots/swipe3_${size.name}.png` });
    console.log(`✅ 7. ${size.name} (${size.width}x${size.height}) 截图完成`);
  }
  
  console.log('\n=== 所有测试完成 ===');
  await browser.close();
})();
