const { chromium } = require('playwright')

async function test() {
  const browser = await chromium.launch()
  const results = []
  
  const devices = [
    { name: 'iPhone_SE', width: 375, height: 667 },
    { name: 'iPhone_14', width: 390, height: 844 },
    { name: 'iPad_Mini', width: 768, height: 1024 },
  ]
  
  for (const device of devices) {
    const context = await browser.newContext({ viewport: { width: device.width, height: device.height } })
    const page = await context.newPage()
    
    // 访问首页（探索页）
    await page.goto('http://localhost:5173/#/', { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(2000)
    
    // 截图探索页
    await page.screenshot({ path: `test_screenshots/${device.name}_explore.png`, fullPage: false })
    
    // 检查页面内容
    const html = await page.content()
    const hasContent = html.length > 10000
    
    // 检查卡片元素
    const hasEventCard = html.includes('event-card') || html.includes('atmosphere-zone')
    const hasItemCard = html.includes('item-card') || html.includes('feature-tag')
    const hasUserCard = html.includes('user-card') || html.includes('stats-grid')
    
    results.push({
      device: device.name,
      width: device.width,
      hasContent,
      htmlLength: html.length,
      hasEventCard,
      hasItemCard,
      hasUserCard,
    })
    
    // 切换到"我的"页面
    await page.goto('http://localhost:5173/#/pages/profile/profile', { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(1500)
    await page.screenshot({ path: `test_screenshots/${device.name}_profile.png`, fullPage: false })
    
    await context.close()
  }
  
  // 额外测试：滑动查看不同卡片类型
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await context.newPage()
  await page.goto('http://localhost:5173/#/', { waitUntil: 'networkidle', timeout: 15000 })
  await page.waitForTimeout(2000)
  
  // 截图当前卡片
  await page.screenshot({ path: `test_screenshots/card_view_1.png`, fullPage: false })
  
  // 向上滑动查看下一张卡片
  await page.mouse.move(195, 400)
  await page.mouse.down()
  await page.mouse.move(195, 200, { steps: 10 })
  await page.mouse.up()
  await page.waitForTimeout(1000)
  await page.screenshot({ path: `test_screenshots/card_view_2.png`, fullPage: false })
  
  // 再滑一次
  await page.mouse.move(195, 400)
  await page.mouse.down()
  await page.mouse.move(195, 200, { steps: 10 })
  await page.mouse.up()
  await page.waitForTimeout(1000)
  await page.screenshot({ path: `test_screenshots/card_view_3.png`, fullPage: false })
  
  await context.close()
  await browser.close()
  
  console.log('\n=== 卡片测试结果 ===')
  let allPass = true
  for (const r of results) {
    const pass = r.hasContent
    if (!pass) allPass = false
    console.log(`${pass ? '✅' : '❌'} ${r.device} (${r.width}px): content=${r.hasContent} html=${r.htmlLength} event=${r.hasEventCard} item=${r.hasItemCard} user=${r.hasUserCard}`)
  }
  console.log(`\n总结: ${allPass ? '✅ 全部通过' : '❌ 有失败项'}`)
}

test().catch(e => { console.error('测试失败:', e.message); process.exit(1) })
