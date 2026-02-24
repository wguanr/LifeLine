const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  
  // Test on iPhone 14 size
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();
  
  await page.goto('http://localhost:5173/#/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Screenshot 1: Initial state - check top bar
  await page.screenshot({ path: 'test_screenshots/zindex_initial.png' });
  console.log('✅ Screenshot: Initial state');
  
  // Screenshot 2: Scroll down in swiper to see if top bar gets covered
  // Simulate swipe up to go to next card
  await page.touchscreen.tap(195, 400);
  await page.waitForTimeout(500);
  
  // Swipe up (next card)
  await page.evaluate(() => {
    const swiper = document.querySelector('.card-swiper');
    if (swiper) {
      const rect = swiper.getBoundingClientRect();
      console.log('Swiper rect:', JSON.stringify(rect));
    }
    // Check z-index of elements
    const statusBar = document.querySelector('.status-bar');
    const cardArea = document.querySelector('.card-area');
    const cardWrapper = document.querySelector('.card-wrapper');
    if (statusBar) {
      const style = window.getComputedStyle(statusBar);
      console.log('status-bar z-index:', style.zIndex, 'position:', style.position);
    }
    if (cardArea) {
      const style = window.getComputedStyle(cardArea);
      console.log('card-area z-index:', style.zIndex, 'position:', style.position);
    }
    if (cardWrapper) {
      const style = window.getComputedStyle(cardWrapper);
      console.log('card-wrapper z-index:', style.zIndex, 'position:', style.position, 'overflow:', style.overflow);
    }
  });
  
  // Check if card content overflows into status bar area
  const overlap = await page.evaluate(() => {
    const statusBar = document.querySelector('.status-bar');
    const cards = document.querySelectorAll('.card-wrapper');
    if (!statusBar || !cards.length) return 'elements not found';
    
    const statusRect = statusBar.getBoundingClientRect();
    const results = [];
    cards.forEach((card, i) => {
      const cardRect = card.getBoundingClientRect();
      results.push({
        card: i,
        cardTop: cardRect.top,
        cardBottom: cardRect.bottom,
        statusBottom: statusRect.bottom,
        overlaps: cardRect.top < statusRect.bottom
      });
    });
    return JSON.stringify(results);
  });
  console.log('Overlap check:', overlap);
  
  // Screenshot 3: Try left swipe to open detail panel
  const startX = 300, startY = 400;
  await page.touchscreen.tap(startX, startY);
  await page.waitForTimeout(200);
  
  // Manual touch simulation for left swipe
  await page.evaluate(async ({sx, sy}) => {
    const el = document.querySelector('.swipeable-card');
    if (!el) return;
    
    // Create touch events
    const createTouch = (x, y) => new Touch({
      identifier: 0,
      target: el,
      clientX: x,
      clientY: y,
      pageX: x,
      pageY: y
    });
    
    el.dispatchEvent(new TouchEvent('touchstart', {
      touches: [createTouch(sx, sy)],
      changedTouches: [createTouch(sx, sy)],
      bubbles: true
    }));
    
    // Gradual move left
    for (let i = 1; i <= 10; i++) {
      await new Promise(r => setTimeout(r, 30));
      const x = sx - (i * 15);
      el.dispatchEvent(new TouchEvent('touchmove', {
        touches: [createTouch(x, sy)],
        changedTouches: [createTouch(x, sy)],
        bubbles: true
      }));
    }
    
    await new Promise(r => setTimeout(r, 50));
    const endX = sx - 150;
    el.dispatchEvent(new TouchEvent('touchend', {
      touches: [],
      changedTouches: [createTouch(endX, sy)],
      bubbles: true
    }));
  }, {sx: startX, sy: startY});
  
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test_screenshots/zindex_left_swipe.png' });
  console.log('✅ Screenshot: After left swipe attempt');
  
  // Check panel state
  const panelState = await page.evaluate(() => {
    const leftPanel = document.querySelector('.left-panel');
    const rightPanel = document.querySelector('.right-panel');
    const overlay = document.querySelector('.overlay');
    return {
      leftVisible: leftPanel?.classList.contains('visible'),
      rightVisible: rightPanel?.classList.contains('visible'),
      overlayVisible: overlay?.classList.contains('visible'),
      leftTransform: leftPanel ? window.getComputedStyle(leftPanel).transform : 'n/a',
      rightTransform: rightPanel ? window.getComputedStyle(rightPanel).transform : 'n/a'
    };
  });
  console.log('Panel state:', JSON.stringify(panelState));
  
  // Screenshot 4: Try right swipe
  // First close any open panel
  await page.evaluate(() => {
    const overlay = document.querySelector('.overlay.visible');
    if (overlay) overlay.click();
  });
  await page.waitForTimeout(300);
  
  await page.evaluate(async ({sx, sy}) => {
    const el = document.querySelector('.swipeable-card');
    if (!el) return;
    
    const createTouch = (x, y) => new Touch({
      identifier: 0,
      target: el,
      clientX: x,
      clientY: y,
      pageX: x,
      pageY: y
    });
    
    el.dispatchEvent(new TouchEvent('touchstart', {
      touches: [createTouch(sx, sy)],
      changedTouches: [createTouch(sx, sy)],
      bubbles: true
    }));
    
    for (let i = 1; i <= 10; i++) {
      await new Promise(r => setTimeout(r, 30));
      const x = sx + (i * 15);
      el.dispatchEvent(new TouchEvent('touchmove', {
        touches: [createTouch(x, sy)],
        changedTouches: [createTouch(x, sy)],
        bubbles: true
      }));
    }
    
    await new Promise(r => setTimeout(r, 50));
    const endX = sx + 150;
    el.dispatchEvent(new TouchEvent('touchend', {
      touches: [],
      changedTouches: [createTouch(endX, sy)],
      bubbles: true
    }));
  }, {sx: 100, sy: 400});
  
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test_screenshots/zindex_right_swipe.png' });
  console.log('✅ Screenshot: After right swipe attempt');
  
  const panelState2 = await page.evaluate(() => {
    const leftPanel = document.querySelector('.left-panel');
    const rightPanel = document.querySelector('.right-panel');
    return {
      leftVisible: leftPanel?.classList.contains('visible'),
      rightVisible: rightPanel?.classList.contains('visible')
    };
  });
  console.log('Panel state after right swipe:', JSON.stringify(panelState2));
  
  // Screenshot 5: Check bottom tab bar overlap
  await page.evaluate(() => {
    const overlay = document.querySelector('.overlay.visible');
    if (overlay) overlay.click();
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'test_screenshots/zindex_bottom.png', clip: { x: 0, y: 744, width: 390, height: 100 } });
  console.log('✅ Screenshot: Bottom tab bar area');
  
  await browser.close();
  console.log('=== Z-Index Test Complete ===');
})();
