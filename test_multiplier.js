const { chromium } = require('playwright');

async function testMultiplier() {
  console.log('🚀 测试倍数选择器功能...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    // 滑动找到有入场费的事件卡片
    let foundEventWithFee = false;
    let attempts = 0;
    
    while (!foundEventWithFee && attempts < 10) {
      // 检查当前卡片是否有倍数选择器
      const multiplierSection = await page.$('.multiplier-section');
      const feeLabel = await page.$('.fee-label');
      
      if (multiplierSection || feeLabel) {
        foundEventWithFee = true;
        console.log('✅ 找到有入场费的事件卡片');
        
        // 截图
        await page.screenshot({ 
          path: 'test_screenshots/multiplier_found.png',
          fullPage: false
        });
        
        // 检查倍数控制按钮
        const minusBtn = await page.$('.multiplier-btn.minus');
        const plusBtn = await page.$('.multiplier-btn.plus');
        const valueNumber = await page.$('.value-number');
        
        if (minusBtn && plusBtn && valueNumber) {
          console.log('✅ 倍数控制按钮存在');
          
          // 获取初始倍数
          const initialValue = await valueNumber.textContent();
          console.log(`   初始倍数: ${initialValue}`);
          
          // 点击+按钮增加倍数
          await plusBtn.click();
          await page.waitForTimeout(500);
          
          const newValue = await valueNumber.textContent();
          console.log(`   点击+后倍数: ${newValue}`);
          
          if (parseInt(newValue) > parseInt(initialValue)) {
            console.log('✅ 点击+按钮成功增加倍数');
          }
          
          // 再点击几次
          await plusBtn.click();
          await page.waitForTimeout(300);
          await plusBtn.click();
          await page.waitForTimeout(300);
          
          const finalValue = await valueNumber.textContent();
          console.log(`   多次点击后倍数: ${finalValue}`);
          
          // 检查总消耗是否显示
          const totalCost = await page.$('.total-cost');
          if (totalCost) {
            const totalText = await totalCost.textContent();
            console.log(`✅ 总消耗显示: ${totalText}`);
          }
          
          // 截图显示倍数增加后的状态
          await page.screenshot({ 
            path: 'test_screenshots/multiplier_increased.png',
            fullPage: false
          });
          
          // 点击-按钮减少倍数
          await minusBtn.click();
          await page.waitForTimeout(500);
          
          const afterMinus = await valueNumber.textContent();
          console.log(`   点击-后倍数: ${afterMinus}`);
          
          if (parseInt(afterMinus) < parseInt(finalValue)) {
            console.log('✅ 点击-按钮成功减少倍数');
          }
          
        } else {
          console.log('❌ 倍数控制按钮不完整');
        }
        
      } else {
        // 滑动到下一张卡片
        const swiper = await page.$('.card-swiper');
        if (swiper) {
          const box = await swiper.boundingBox();
          await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
          await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.3);
          await page.mouse.down();
          await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.7, { steps: 10 });
          await page.mouse.up();
          await page.waitForTimeout(1000);
        }
        attempts++;
      }
    }
    
    if (!foundEventWithFee) {
      console.log('⚠️ 未找到有入场费的事件卡片，检查事件数据');
      
      // 截取当前状态
      await page.screenshot({ 
        path: 'test_screenshots/multiplier_not_found.png',
        fullPage: false
      });
    }
    
    console.log('\n✅ 倍数选择器测试完成');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await browser.close();
  }
}

testMultiplier();
