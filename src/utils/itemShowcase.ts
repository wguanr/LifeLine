/**
 * ItemShowcase - 纯 JS DOM 操作的物品全屏展示模块
 * 绕过 uni-app 的 Vue 组件渲染限制，直接操作 DOM
 */
import type { Item } from '@/types'
import { useItemStore } from '@/stores/item'

interface ShowcaseEntry {
  item: Item
  quantity: number
}

// 稀有度配色
const RARITY_COLORS: Record<string, { primary: string; gradient: string; glow: string }> = {
  common: { primary: '#9ca3af', gradient: 'linear-gradient(90deg, #6b7280, #9ca3af)', glow: 'rgba(156,163,175,0.4)' },
  uncommon: { primary: '#22c55e', gradient: 'linear-gradient(90deg, #16a34a, #22c55e)', glow: 'rgba(34,197,94,0.4)' },
  rare: { primary: '#3b82f6', gradient: 'linear-gradient(90deg, #2563eb, #3b82f6)', glow: 'rgba(59,130,246,0.4)' },
  epic: { primary: '#a855f7', gradient: 'linear-gradient(90deg, #7c3aed, #a855f7)', glow: 'rgba(168,85,247,0.4)' },
  legendary: { primary: '#f59e0b', gradient: 'linear-gradient(90deg, #d97706, #f59e0b, #ef4444)', glow: 'rgba(245,158,11,0.5)' },
}

const RARITY_NAMES: Record<string, string> = {
  common: '普通',
  uncommon: '精良',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
}

const EFFECT_ICONS: Record<string, string> = {
  time: '⏰',
  energy: '⚡',
  reputation: '⭐',
}

let currentOverlay: HTMLElement | null = null
let queue: ShowcaseEntry[] = []
let currentIndex = 0
let autoCollectTimer: ReturnType<typeof setTimeout> | null = null

/**
 * 注入全局 CSS 样式（只注入一次）
 */
let styleInjected = false
function injectStyles() {
  if (styleInjected) return
  styleInjected = true

  const style = document.createElement('style')
  style.textContent = `
    @keyframes is-overlayFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes is-starFloat {
      0%, 100% { opacity: 0.3; transform: translateY(0) scale(1); }
      50% { opacity: 1; transform: translateY(-10px) scale(1.5); }
    }
    @keyframes is-auraPulse {
      0%, 100% { transform: scale(1); opacity: 0.3; }
      50% { transform: scale(1.15); opacity: 0.5; }
    }
    @keyframes is-cardEnter {
      0% { opacity: 0; transform: scale(0.3) rotateY(180deg) translateY(100px); }
      50% { opacity: 1; transform: scale(1.1) rotateY(0deg) translateY(-20px); }
      100% { opacity: 1; transform: scale(1) rotateY(0deg) translateY(0); }
    }
    @keyframes is-cardFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    @keyframes is-cardCollect {
      0% { opacity: 1; transform: scale(1) translateY(0); }
      100% { opacity: 0; transform: scale(0.2) translateY(300px); }
    }
    @keyframes is-imageReveal {
      from { opacity: 0; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes is-shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes is-collectPulse {
      0% { transform: scale(0.5) translate(-50%, 0); opacity: 1; }
      100% { transform: scale(3) translate(-50%, 0); opacity: 0; }
    }
    @keyframes is-hintFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `
  document.head.appendChild(style)
}

/**
 * 创建星星粒子背景
 */
function createParticles(): HTMLElement {
  const container = document.createElement('div')
  container.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;overflow:hidden;pointer-events:none;'

  const positions = [
    [10, 15], [20, 80], [35, 10], [45, 90], [60, 20],
    [70, 75], [80, 30], [15, 50], [50, 5], [85, 60],
    [5, 35], [25, 65], [55, 45], [75, 85], [40, 55],
    [90, 40], [30, 25], [65, 70], [8, 72], [95, 15],
  ]

  positions.forEach(([top, left], i) => {
    const star = document.createElement('div')
    const size = [3, 4, 5][i % 3]
    star.style.cssText = `
      position:absolute;
      width:${size}px;height:${size}px;
      background:#fff;border-radius:50%;
      top:${top}%;left:${left}%;
      animation: is-starFloat 3s ease-in-out infinite;
      animation-delay: ${(i * 0.15).toFixed(2)}s;
    `
    container.appendChild(star)
  })

  return container
}

/**
 * 创建物品展示卡片
 */
function createShowcaseCard(entry: ShowcaseEntry): HTMLElement {
  const { item, quantity } = entry
  const rarity = item.rarity || 'common'
  const colors = RARITY_COLORS[rarity] || RARITY_COLORS.common

  const card = document.createElement('div')
  card.style.cssText = `
    position:relative;
    width:280px;
    background:linear-gradient(145deg, #1a1a2e, #16213e);
    border-radius:20px;
    overflow:hidden;
    z-index:1;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    border: 2px solid ${colors.primary}80;
    animation: is-cardEnter 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  `
  if (rarity === 'legendary') {
    card.style.boxShadow = `0 20px 60px rgba(245,158,11,0.3)`
  }

  // 稀有度标签
  const banner = document.createElement('div')
  banner.style.cssText = `padding:10px 16px;text-align:center;background:${colors.gradient};`
  banner.innerHTML = `<span style="color:#fff;font-size:13px;font-weight:700;letter-spacing:4px;">${RARITY_NAMES[rarity] || '普通'}</span>`
  card.appendChild(banner)

  // 物品图片区域
  const imageZone = document.createElement('div')
  imageZone.style.cssText = 'position:relative;height:200px;display:flex;align-items:center;justify-content:center;overflow:hidden;'

  // 光晕
  const glow = document.createElement('div')
  glow.style.cssText = `
    position:absolute;width:180px;height:180px;border-radius:50%;
    filter:blur(40px);opacity:0.3;background:${colors.primary};
  `
  imageZone.appendChild(glow)

  // 图片或图标
  if (item.image) {
    const img = document.createElement('img')
    img.src = item.image
    img.style.cssText = `
      position:relative;width:160px;height:160px;object-fit:contain;z-index:1;
      animation: is-imageReveal 0.6s ease-out 0.3s both;
    `
    imageZone.appendChild(img)
  } else {
    const iconDiv = document.createElement('div')
    iconDiv.style.cssText = `
      position:relative;z-index:1;font-size:72px;
      animation: is-imageReveal 0.6s ease-out 0.3s both;
    `
    iconDiv.textContent = item.icon || '🎁'
    imageZone.appendChild(iconDiv)
  }
  card.appendChild(imageZone)

  // 物品信息
  const infoZone = document.createElement('div')
  infoZone.style.cssText = 'padding:14px 20px 10px;text-align:center;'

  const name = document.createElement('div')
  name.style.cssText = 'color:#fff;font-size:20px;font-weight:700;margin-bottom:6px;'
  name.textContent = item.name || '未知物品'
  infoZone.appendChild(name)

  const desc = document.createElement('div')
  desc.style.cssText = 'color:rgba(255,255,255,0.6);font-size:12px;line-height:1.5;margin-bottom:10px;'
  desc.textContent = item.description || ''
  infoZone.appendChild(desc)

  // 效果标签
  if (item.effects && item.effects.length > 0) {
    const effectsDiv = document.createElement('div')
    effectsDiv.style.cssText = 'display:flex;flex-direction:column;gap:6px;margin-bottom:8px;'
    item.effects.forEach(effect => {
      const tag = document.createElement('div')
      tag.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:6px;background:rgba(255,255,255,0.08);border-radius:8px;padding:6px 12px;'
      tag.innerHTML = `
        <span style="font-size:14px;">${EFFECT_ICONS[effect.type] || '✨'}</span>
        <span style="color:rgba(255,255,255,0.8);font-size:11px;">${effect.description}</span>
      `
      effectsDiv.appendChild(tag)
    })
    infoZone.appendChild(effectsDiv)
  }

  // 数量
  if (quantity > 1) {
    const qBadge = document.createElement('div')
    qBadge.style.cssText = 'display:inline-block;background:linear-gradient(135deg,#f59e0b,#ef4444);border-radius:12px;padding:4px 14px;margin-top:4px;'
    qBadge.innerHTML = `<span style="color:#fff;font-size:16px;font-weight:700;">×${quantity}</span>`
    infoZone.appendChild(qBadge)
  }

  card.appendChild(infoZone)

  // 底部提示
  const hint = document.createElement('div')
  hint.style.cssText = 'padding:12px;text-align:center;opacity:0;animation: is-hintFadeIn 0.5s ease forwards;animation-delay:1.5s;'
  hint.innerHTML = `<span style="color:rgba(255,255,255,0.4);font-size:12px;">点击任意处收入仓库</span>`
  card.appendChild(hint)

  return card
}

/**
 * 创建光环
 */
function createAura(rarity: string): HTMLElement {
  const colors = RARITY_COLORS[rarity] || RARITY_COLORS.common
  const aura = document.createElement('div')
  let bg = `radial-gradient(circle, ${colors.primary}, transparent)`
  if (rarity === 'legendary') {
    bg = 'radial-gradient(circle, #f59e0b, #ef4444, transparent)'
  }
  aura.style.cssText = `
    position:absolute;width:350px;height:350px;border-radius:50%;
    filter:blur(80px);opacity:0.4;
    background:${bg};
    animation: is-auraPulse 2s ease-in-out infinite;
  `
  return aura
}

/**
 * 展示当前队列中的物品
 */
function showCurrent() {
  if (currentIndex >= queue.length) {
    dismiss()
    return
  }

  const entry = queue[currentIndex]
  const rarity = entry.item.rarity || 'common'

  // 移除旧的 overlay
  if (currentOverlay) {
    currentOverlay.remove()
    currentOverlay = null
  }

  injectStyles()

  // 创建 overlay
  const overlay = document.createElement('div')
  overlay.id = 'item-showcase-overlay'
  overlay.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;
    z-index:99999;
    display:flex;align-items:center;justify-content:center;
    background:rgba(0,0,0,0.88);
    animation: is-overlayFadeIn 0.3s ease-out;
    cursor:pointer;
  `

  // 添加粒子
  overlay.appendChild(createParticles())

  // 添加光环
  overlay.appendChild(createAura(rarity))

  // 添加卡片
  const card = createShowcaseCard(entry)
  overlay.appendChild(card)

  // 点击事件
  overlay.addEventListener('click', () => {
    collectCurrent()
  })

  // 阻止卡片点击冒泡（让卡片上的点击也能收集）
  // 不阻止，让整个 overlay 的点击都能触发收集

  document.body.appendChild(overlay)
  currentOverlay = overlay

  // 0.8s 后切换到浮动动画
  setTimeout(() => {
    if (card.isConnected) {
      card.style.animation = 'is-cardFloat 3s ease-in-out infinite'
    }
  }, 800)

  // 8s 后自动收集
  if (autoCollectTimer) clearTimeout(autoCollectTimer)
  autoCollectTimer = setTimeout(() => {
    collectCurrent()
  }, 8000)
}

/**
 * 收集当前物品并展示下一个
 */
function collectCurrent() {
  if (!currentOverlay) return
  if (autoCollectTimer) clearTimeout(autoCollectTimer)

  // 收集动画
  const card = currentOverlay.querySelector('div[style*="is-cardEnter"], div[style*="is-cardFloat"]') as HTMLElement
  if (card) {
    card.style.animation = 'is-cardCollect 0.5s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards'
  }

  // 添加收集脉冲效果
  const pulse = document.createElement('div')
  pulse.style.cssText = `
    position:absolute;bottom:80px;left:50%;
    width:60px;height:60px;
    border-radius:50%;
    background:radial-gradient(circle, rgba(245,158,11,0.6), transparent);
    animation: is-collectPulse 0.5s ease-out forwards;
    transform-origin: left center;
  `
  currentOverlay.appendChild(pulse)

  // 0.5s 后移除并展示下一个
  setTimeout(() => {
    currentIndex++
    if (currentIndex < queue.length) {
      showCurrent()
    } else {
      dismiss()
    }
  }, 500)
}

/**
 * 关闭展示
 */
function dismiss() {
  if (autoCollectTimer) {
    clearTimeout(autoCollectTimer)
    autoCollectTimer = null
  }
  if (currentOverlay) {
    currentOverlay.style.opacity = '0'
    currentOverlay.style.transition = 'opacity 0.3s ease'
    setTimeout(() => {
      currentOverlay?.remove()
      currentOverlay = null
    }, 300)
  }
  queue = []
  currentIndex = 0
}

/**
 * 展示掉落物品（主入口）
 * @param drops 掉落物品列表 [{ itemId, quantity }]
 */
export function showItemDrops(drops: Array<{ itemId: string; quantity: number }>) {
  const itemStore = useItemStore()
  const entries: ShowcaseEntry[] = []

  for (const drop of drops) {
    const item = itemStore.getItem(drop.itemId)
    if (item) {
      entries.push({ item, quantity: drop.quantity })
    }
  }

  if (entries.length === 0) return

  // 如果当前有展示，先关闭
  if (currentOverlay) {
    dismiss()
  }

  queue = entries
  currentIndex = 0

  // 延迟一帧确保 DOM 准备好
  requestAnimationFrame(() => {
    showCurrent()
  })
}

/**
 * 强制关闭展示
 */
export function dismissShowcase() {
  dismiss()
}
