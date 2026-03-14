<template>
  <view class="event-card">
    <!-- 顶部装饰条 -->
    <view class="card-accent" :class="event.type" />
    
    
    <!-- 内容区 -->
    <view class="card-content">
      <!-- 顶部信息 -->
      <view class="card-header">
        <view class="event-type" :class="event.type">
          <text class="type-icon">{{ getTypeIcon(event.type) }}</text>
          <text class="type-text">{{ getTypeName(event.type) }}</text>
        </view>
        <view class="header-right">
          <view class="header-badges-row" v-if="isAigcEvent">
            <view class="aigc-source-badge">
              <text class="aigc-icon">🌍</text>
              <text class="aigc-label">现实事件</text>
            </view>
            <view class="aigc-urgency-badge" :class="aigcUrgency">
              <text class="urgency-text">{{ aigcUrgencyText }}</text>
            </view>
          </view>
          <view class="event-status" :class="event.status">
            {{ getStatusText(event.status) }}
          </view>
        </view>
      </view>
      
      <!-- 主体内容区 -->
      <view class="card-body">
        <template v-if="mode === 'preview'">
          <!-- 氛围区：大图标 + 渐变背景 -->
          <view class="atmosphere-zone" :class="event.type">
            <text class="atmo-icon">{{ getTypeIcon(event.type) }}</text>
            <view class="atmo-particles">
              <view class="particle" v-for="i in 5" :key="i" :class="'p-' + i" />
            </view>
          </view>

          <text class="event-title">{{ event.title }}</text>
          <text class="event-desc">{{ event.description }}</text>

          <!-- 事件深度信息 -->
          <view class="event-meta-row">
            <view class="meta-chip">
              <text class="meta-icon">📖</text>
              <text class="meta-text">{{ event.stages.length }} 个阶段</text>
            </view>
            <view class="meta-chip">
              <text class="meta-icon">🎭</text>
              <text class="meta-text">{{ totalChoicesCount }} 种选择</text>
            </view>
            <view class="meta-chip participants-chip">
              <text class="meta-icon">👥</text>
              <text class="meta-text">{{ formatNumber(event.participantCount || 0) }}</text>
            </view>
          </view>

          <!-- 已完成：历史抉择摘要 -->
          <view class="history-summary" v-if="isEventCompleted">
            <view class="history-badge completed">
              <text class="history-badge-icon">✅</text>
              <text class="history-badge-text">已完成</text>
            </view>
            <view class="history-choices" v-if="eventBranch && eventBranch.choices.length">
              <view class="history-choice" v-for="(choice, idx) in eventBranch.choices.slice(0, 2)" :key="choice.id">
                <text class="choice-index">{{ idx + 1 }}</text>
                <text class="choice-text">{{ choice.text }}</text>
              </view>
              <text class="history-more" v-if="eventBranch.choices.length > 2">
                还有 {{ eventBranch.choices.length - 2 }} 个抉择...
              </text>
            </view>
            <text class="history-ending" v-if="eventBranch?.endingSummary">
              {{ eventBranch.endingSummary }}
            </text>
          </view>

          <!-- 进行中：当前进度提示 -->
          <view class="history-summary" v-else-if="isEventInProgress">
            <view class="history-badge in-progress">
              <text class="history-badge-icon">⏳</text>
              <text class="history-badge-text">进行中</text>
            </view>
            <view class="history-choices" v-if="eventBranch && eventBranch.choices.length">
              <view class="history-choice" v-for="(choice, idx) in eventBranch.choices.slice(-2)" :key="choice.id">
                <text class="choice-index">{{ idx + 1 }}</text>
                <text class="choice-text">{{ choice.text }}</text>
              </view>
            </view>
            <text class="history-hint">你已做出 {{ eventBranch?.choices.length || 0 }} 个抉择，继续探索吧</text>
          </view>

          <!-- 未参与：可能获得的标签预览 -->
          <view class="reward-preview" v-else-if="possibleTags.length > 0">
            <text class="reward-label">可能获得</text>
            <view class="reward-tags">
              <view 
                class="preview-tag" 
                v-for="(tag, idx) in possibleTags.slice(0, 4)" 
                :key="tag.id"
                :class="'tag-color-' + (idx % 5)"
              >
                <text class="preview-tag-icon">{{ tag.icon }}</text>
                <text class="preview-tag-name">{{ tag.name }}</text>
              </view>
              <view class="preview-tag more" v-if="possibleTags.length > 4">
                <text class="preview-tag-name">+{{ possibleTags.length - 4 }}</text>
              </view>
            </view>
          </view>
        </template>
        
        <template v-else-if="mode === 'playing'">
          <!-- 阶段进度条 -->
          <view class="stage-progress-bar">
            <view class="stage-progress-fill" :style="{ width: stageProgressPercent + '%' }" />
            <text class="stage-progress-text">阶段 {{ currentStageIndex + 1 }} / {{ event.stages.length }}</text>
          </view>
          <text class="stage-title">{{ currentStage?.title }}</text>
          <text class="stage-desc">{{ currentStage?.description }}</text>
        </template>
        
        <template v-else-if="mode === 'result'">
          <!-- 阶段进度条 -->
          <view class="stage-progress-bar">
            <view class="stage-progress-fill" :style="{ width: stageProgressPercent + '%' }" />
            <text class="stage-progress-text">阶段 {{ currentStageIndex + 1 }} / {{ event.stages.length }}</text>
          </view>
          <text class="result-title">选择结果</text>
          <text class="result-desc">{{ lastResult?.resultText }}</text>
          
          <!-- 多倍下注提示 -->
          <view class="bet-boost-info" v-if="lastBetMultiplier > 1">
            <text class="bet-boost-badge">🔥 {{ lastBetMultiplier }}× 加码</text>
            <text class="bet-boost-desc">你的影响力占比：{{ (myInvestmentPercent * 100).toFixed(1) }}%</text>
          </view>
          
          <!-- 概率掉落物品展示 -->
          <view class="item-drops-panel" v-if="droppedItems.length > 0">
            <view class="drops-header">
              <text class="drops-sparkle">✨</text>
              <text class="drops-title">意外收获</text>
              <text class="drops-sparkle">✨</text>
            </view>
            <view class="drops-list">
              <view class="drop-item" v-for="(drop, idx) in droppedItems" :key="drop.itemId + '-' + idx">
                <view class="drop-item-glow" />
                <text class="drop-item-icon">{{ getClaimItemIcon(drop.itemId) }}</text>
                <view class="drop-item-info">
                  <text class="drop-item-name">{{ getItemName(drop.itemId) }}</text>
                  <text class="drop-item-qty" v-if="drop.quantity > 1">×{{ drop.quantity }}</text>
                </view>
                <text class="drop-item-badge">NEW</text>
              </view>
            </view>
          </view>
          
          <!-- 未掉落物品时的提示 -->
          <view class="no-drops-hint" v-else-if="lastResult?.rewards?.itemDrops && lastResult.rewards.itemDrops.length > 0">
            <text class="no-drops-text">🎲 这次没有额外收获，下次运气会更好！</text>
          </view>
        </template>
      </view>
      
      <!-- 底部操作区 -->
      <view class="card-footer">
        <template v-if="mode === 'preview'">
          <!-- 已完成状态：查看历史抉择按钮 -->
          <template v-if="isEventCompleted">
            <button 
              class="action-btn history-btn"
              @click.stop="handleViewHistory"
            >
              <text class="btn-text-default">📜 查看历史抉择</text>
            </button>
          </template>

          <!-- 进行中状态：继续事件按钮 -->
          <template v-else-if="isEventInProgress">
            <button 
              class="action-btn continue-btn"
              @click.stop="handleContinueEvent"
            >
              <text class="btn-text-default">▶️ 继续事件</text>
            </button>
          </template>

          <!-- 未参与状态：原有参与按钮 -->
          <template v-else>
            <view class="footer-info">
              <view class="entry-fee" v-if="hasEntryFee">
                <view class="fee-label">额定消耗</view>
                <view class="fee-items">
                  <view v-if="event.entryFee?.time" class="fee-item time">
                    <text class="fee-icon">⏰</text>
                    <text class="fee-value">{{ event.entryFee.time }}分钟</text>
                  </view>
                  <view v-if="event.entryFee?.energy" class="fee-item energy">
                    <text class="fee-icon">⚡</text>
                    <text class="fee-value">{{ event.entryFee.energy }}</text>
                  </view>
                </view>
              </view>
              <view v-else class="entry-fee free">
                <text class="free-label">随时参与</text>
              </view>
            </view>
            
            <button 
              class="action-btn" 
              :class="btnClasses"
              :disabled="!canJoin || !canAffordCurrent"
              @click.stop="handleTapJoin"
            >
              <!-- 涟漪效果层 -->
              <view class="ripple-container">
                <view 
                  v-for="ripple in ripples" 
                  :key="ripple.id" 
                  class="ripple"
                  :style="{ left: ripple.x + 'px', top: ripple.y + 'px' }"
                />
              </view>
              
              <!-- 按钮内容 -->
              <template v-if="!canJoin">条件不足</template>
              <template v-else-if="!canAffordCurrent">资源不足</template>
              <template v-else-if="hasEntryFee && multiplier > 0">
                <view class="btn-content">
                  <view class="btn-multiplier-row">
                    <text class="btn-multiplier" :class="'level-' + Math.min(multiplier, 5)">×{{ multiplier }}</text>
                    <text class="btn-label">倍投入</text>
                  </view>
                  <text class="btn-cost-text">
                    {{ costSummary }}
                  </text>
                </view>
                <!-- 倒计时进度条 -->
                <view class="btn-timer-bar" v-if="isCountingDown">
                  <view class="timer-fill" :style="{ width: timerProgress + '%' }" />
                </view>
              </template>
              <template v-else>
                <text class="btn-text-default">参与事件</text>
              </template>
            </button>
          </template>
        </template>
        
        <template v-else-if="mode === 'playing'">
          <!-- 已关注玩家的选择提示（紧凑条幅） -->
          <view class="followed-hint-bar" v-if="followedChoices.length > 0">
            <view class="followed-hint-item" v-for="fc in followedChoices" :key="fc.influencer.userId">
              <text class="fh-avatar">{{ fc.influencer.avatar }}</text>
              <text class="fh-text">{{ fc.influencer.nickname }} 选择了「{{ fc.latestChoice.choiceText }}」</text>
            </view>
          </view>
          
          <!-- 下注提示信息 -->
          <view class="bet-hint-bar" v-if="hasAnyBetBoosted">
            <text class="bet-hint-icon">🔥</text>
            <text class="bet-hint-text">加码投入可提升你的影响力占比</text>
            <text class="bet-hint-total" v-if="totalBetExtraCost">额外消耗: {{ totalBetExtraCostText }}</text>
          </view>
          
          <view class="options-list">
            <!-- 普通选项 -->
            <view 
              v-for="choice in visibleChoices" 
              :key="choice.id"
              class="option-item"
              :class="{ 
                disabled: !canAffordBet(choice),
                'hidden-choice': choice.hidden,
                'hidden-unlocked': choice.hidden && isChoiceUnlocked(choice),
                'bet-boosted': getChoiceBet(choice.id) > 1
              }"
            >
              <view class="option-main" @click="handleSelectChoice(choice)">
                <view class="option-text-row">
                  <text class="hidden-badge" v-if="choice.hidden">🔓 隐藏</text>
                  <text class="option-text">{{ choice.text }}</text>
                </view>
                <text class="hidden-hint" v-if="choice.hidden && choice.hiddenHint">{{ choice.hiddenHint }}</text>
                <view class="option-cost-row">
                  <view class="option-cost" v-if="getChoiceTotalCost(choice)">
                    <text v-if="getChoiceTotalCost(choice).time" class="cost-tag time">
                      ⏰ {{ getChoiceTotalCost(choice).time }}
                    </text>
                    <text v-if="getChoiceTotalCost(choice).energy" class="cost-tag energy">
                      ⚡ {{ getChoiceTotalCost(choice).energy }}
                    </text>
                    <text v-if="getChoiceBet(choice.id) > 1" class="cost-multiplier-badge">
                      {{ getChoiceBet(choice.id) }}× 加码
                    </text>
                  </view>
                  <text v-if="!canAffordBet(choice)" class="cant-afford-hint">资源不足</text>
                </view>
                <view class="requires-items" v-if="choice.hidden && choice.requiresItems">
                  <text class="requires-label">需要持有：</text>
                  <view class="requires-item" v-for="reqId in choice.requiresItems" :key="reqId" :class="{ owned: userStore.hasItem(reqId) }">
                    <text class="req-icon">{{ userStore.hasItem(reqId) ? '✅' : '❌' }}</text>
                    <text class="req-name">{{ getItemName(reqId) }}</text>
                  </view>
                </view>
              </view>
              
              <!-- 下注倍数选择器 -->
              <view class="bet-selector">
                <text class="bet-label">下注</text>
                <view class="bet-chips">
                  <view 
                    v-for="m in betOptions" 
                    :key="m"
                    class="bet-chip"
                    :class="{ 
                      active: getChoiceBet(choice.id) === m,
                      'cant-afford': !canAffordBetLevel(choice, m),
                      'is-boost': m > 1
                    }"
                    @click.stop="handleSetBet(choice.id, m)"
                  >
                    <text class="bet-chip-text">{{ m }}×</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
          
          <view class="progress-dots">
            <view 
              v-for="(stage, idx) in event.stages" 
              :key="stage.id"
              class="dot"
              :class="{ active: idx === currentStageIndex, completed: idx < currentStageIndex }"
            />
          </view>
        </template>
        
        <!-- “与玩家相遇”偶发子事件卡片页 -->
        <template v-else-if="mode === 'encounter' && encounterInfluencer">
          <view class="encounter-card">
            <!-- 氛围背景 -->
            <view class="encounter-atmosphere">
              <view class="encounter-glow" />
              <view class="encounter-particles">
                <view class="enc-particle" v-for="i in 6" :key="i" :class="'ep-' + i" />
              </view>
            </view>
            
            <!-- 标题 -->
            <view class="encounter-title-row">
              <text class="encounter-label">✨ 与玩家相遇</text>
            </view>
            
            <!-- 玩家信息卡片 -->
            <view class="encounter-profile">
              <view class="encounter-avatar-ring">
                <text class="encounter-avatar">{{ encounterInfluencer.avatar }}</text>
              </view>
              <text class="encounter-name">{{ encounterInfluencer.nickname }}</text>
              <view class="encounter-percent-row">
                <text class="encounter-percent">贡献占比 {{ (encounterInfluencer.investmentPercent * 100).toFixed(1) }}%</text>
              </view>
              <text class="encounter-bio" v-if="encounterInfluencer.bio">{{ encounterInfluencer.bio }}</text>
            </view>
            
            <!-- 标签 -->
            <view class="encounter-tags" v-if="encounterInfluencer.topTags?.length">
              <view class="enc-tag" v-for="tag in encounterInfluencer.topTags" :key="tag.tagId">
                <text class="enc-tag-icon">{{ tag.icon }}</text>
                <text class="enc-tag-name">{{ tag.name }}</text>
              </view>
            </view>
            
            <!-- 历史选择记录 -->
            <view class="encounter-history">
              <text class="encounter-history-title">📜 历史选择</text>
              <view class="encounter-choices">
                <view 
                  class="enc-choice-item" 
                  v-for="(ch, idx) in encounterInfluencer.choices.slice(-4)" 
                  :key="idx"
                >
                  <view class="enc-choice-dot" />
                  <view class="enc-choice-content">
                    <text class="enc-choice-text">「{{ ch.choiceText }}」</text>
                    <text class="enc-choice-result" v-if="ch.resultText">{{ ch.resultText }}</text>
                  </view>
                </view>
              </view>
              <text class="enc-no-history" v-if="!encounterInfluencer.choices?.length">这位玩家还很神秘…</text>
            </view>
            
            <!-- 操作按钮 -->
            <view class="encounter-actions">
              <button class="encounter-follow-btn" @click="handleEncounterFollow">
                + 关注 TA
              </button>
              <button class="encounter-skip-btn" @click="handleEncounterSkip">
                下次再说
              </button>
            </view>
          </view>
        </template>
        
        <template v-else-if="mode === 'result'">
          <view class="result-rewards" v-if="lastResult?.rewards">
            <view class="rewards-header">
              <text class="rewards-title">✨ 获得奖励</text>
            </view>
            <view class="rewards-grid">
              <view v-if="lastResult.rewards.tags" class="reward-tag" v-for="tag in normalizeTagIds(lastResult.rewards.tags)" :key="tag">
                <text class="tag-icon">{{ getTagIcon(tag) }}</text>
                <text class="tag-name">{{ getTagDisplayName(tag) }}</text>
              </view>
              <view v-if="lastResult.rewards.items" class="reward-item" v-for="itemId in lastResult.rewards.items" :key="itemId">
                <text class="item-icon">🎁</text>
                <text class="item-name">{{ getItemName(itemId) }}</text>
              </view>
            </view>
          </view>
          
          <view class="result-penalties" v-if="lastResult?.penalties">
            <view class="penalties-header">
              <text class="penalties-title">⚠️ 代价</text>
            </view>
            <view class="penalties-grid">
              <view v-if="lastResult.penalties.tags" class="penalty-tag" v-for="tag in normalizeTagIds(lastResult.penalties.tags)" :key="tag">
                <text class="tag-icon">{{ getTagIcon(tag) }}</text>
                <text class="tag-name">{{ getTagDisplayName(tag) }}</text>
              </view>
            </view>
          </view>
          
          <!-- ClaimItem 领取物品界面 -->
          <view class="claim-items-panel" v-if="pendingClaimItems.length > 0">
            <view class="claim-header">
              <text class="claim-title">🎁 可领取的物品</text>
              <text class="claim-subtitle">点击领取或跳过</text>
            </view>
            <view class="claim-items-list">
              <view 
                v-for="(ci, idx) in pendingClaimItems" 
                :key="ci.itemId + '-' + idx"
                class="claim-item"
                :class="{ claimed: claimedItemIds.has(ci.itemId + '-' + idx), required: ci.required }"
              >
                <view class="claim-item-info">
                  <text class="claim-item-icon">{{ getClaimItemIcon(ci.itemId) }}</text>
                  <view class="claim-item-detail">
                    <text class="claim-item-name">{{ getItemName(ci.itemId) }}</text>
                    <text class="claim-item-qty" v-if="(ci.quantity || 1) > 1">×{{ ci.quantity }}</text>
                  </view>
                </view>
                <text class="claim-item-prompt" v-if="ci.promptText">{{ ci.promptText }}</text>
                <view class="claim-item-actions">
                  <button 
                    class="claim-btn" 
                    v-if="!claimedItemIds.has(ci.itemId + '-' + idx)"
                    @click.stop="handleClaimItem(ci, idx)"
                  >领取</button>
                  <text class="claimed-text" v-else>✅ 已领取</text>
                  <button 
                    class="skip-btn" 
                    v-if="!ci.required && !claimedItemIds.has(ci.itemId + '-' + idx)"
                    @click.stop="handleSkipClaim(ci, idx)"
                  >跳过</button>
                </view>
              </view>
            </view>
          </view>

          <button class="action-btn" @click="handleContinue" :disabled="hasRequiredUnclaimedItems">
            {{ hasRequiredUnclaimedItems ? '请先领取必须物品' : (hasNextStage ? '继续' : '完成') }}
          </button>
        </template>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, reactive } from 'vue'
import { useEventStore } from '@/stores/event'
import { useUserStore } from '@/stores/user'
import { useItemStore } from '@/stores/item'
import { useWorldStore } from '@/stores/world'
import { useInfluencerStore, costToValue } from '@/stores/influencer'
import { showItemDrops } from '@/utils/itemShowcase'
import { generateSimulatedParticipation } from '@/data/simulated_users'
import { getTagDefinition } from '@/data/tags'
import type { GameEvent, EventStage, EventChoice, EventOutcome, ClaimableItem, InfluencerInfo, ItemDrop } from '@/types'

const props = defineProps<{
  event: GameEvent
}>()

const emit = defineEmits<{
  (e: 'stateChange', state: string): void
  (e: 'itemDropped', items: Array<{ itemId: string; quantity: number }>): void
}>()

const eventStore = useEventStore()
const userStore = useUserStore()
const itemStore = useItemStore()
const worldStore = useWorldStore()
const influencerStore = useInfluencerStore()
// ItemShowcase 使用纯 JS DOM 方案，无需 store

const mode = ref<'preview' | 'playing' | 'encounter' | 'result'>('preview')
const currentStageIndex = ref(0)
const lastResult = ref<EventOutcome | null>(null)
const nextStageId = ref<string | null>(null)

// ========== ClaimItem 状态 ==========
const claimedItemIds = ref(new Set<string>())
const skippedItemIds = ref(new Set<string>())

// ========== 概率掉落物品状态 ==========
const droppedItems = ref<Array<{ itemId: string; quantity: number }>>([])

/** 根据 itemDrops 概率判定掉落物品 */
const rollItemDrops = (itemDrops?: ItemDrop[]): Array<{ itemId: string; quantity: number }> => {
  if (!itemDrops || itemDrops.length === 0) return []
  const results: Array<{ itemId: string; quantity: number }> = []
  for (const drop of itemDrops) {
    const roll = Math.random()
    if (roll < drop.dropRate) {
      const min = drop.minQuantity || 1
      const max = drop.maxQuantity || 1
      const qty = min === max ? min : Math.floor(Math.random() * (max - min + 1)) + min
      results.push({ itemId: drop.itemId, quantity: qty })
    }
  }
  return results
}

// ========== 偏发相遇子事件 ==========
/** 当前相遇的 Influencer */
const encounterInfluencer = ref<InfluencerInfo | null>(null)
/** 已经触发过相遇的阶段 ID 集合（每个阶段最多触发一次） */
const encounteredStages = ref(new Set<string>())
/** 相遇触发概率 */
const ENCOUNTER_CHANCE = 0.35
/** 最低贡献占比门槛（小数比例，0.05 = 5%） */
const ENCOUNTER_MIN_PERCENT = 0.05

/** 尝试触发相遇子事件，返回 true 表示触发成功 */
const tryTriggerEncounter = (): boolean => {
  const stageId = currentStage.value?.id
  if (!stageId) return false
  // 每个阶段最多触发一次
  if (encounteredStages.value.has(stageId)) return false
  // 随机概率判定
  if (Math.random() > ENCOUNTER_CHANCE) return false
  // 筛选贡献超过 5% 的玩家（排除自己和已关注的）
  const userId = userStore.user?.id || ''
  const allInfluencers = influencerStore.getStageInfluencers(props.event.id, stageId, userId)
  const candidates = allInfluencers.filter(inf => 
    inf.investmentPercent >= ENCOUNTER_MIN_PERCENT && 
    !influencerStore.isFollowing(inf.userId)
  )
  if (candidates.length === 0) return false
  // 随机选一位
  const picked = candidates[Math.floor(Math.random() * candidates.length)]
  encounterInfluencer.value = picked
  encounteredStages.value.add(stageId)
  return true
}

/** 相遇后关注 */
const handleEncounterFollow = () => {
  if (!encounterInfluencer.value) return
  const inf = encounterInfluencer.value
  influencerStore.followInfluencer(inf.userId, inf.nickname, inf.avatar)
  uni.showToast({ title: `已关注 ${inf.nickname}`, icon: 'none' })
  // 进入结果页
  encounterInfluencer.value = null
  mode.value = 'result'
  emit('stateChange', 'result')
}

/** 相遇后跳过 */
const handleEncounterSkip = () => {
  encounterInfluencer.value = null
  mode.value = 'result'
  emit('stateChange', 'result')
}

// ========== Influencer 系统 ==========
/** 是否已初始化过虚拟用户数据 */
const simDataInjected = ref(new Set<string>())

/** 当前阶段的 Influencer 列表 */
const stageInfluencers = computed<InfluencerInfo[]>(() => {
  if (mode.value !== 'playing' || !currentStage.value) return []
  const userId = userStore.user?.id || ''
  return influencerStore.getStageInfluencers(props.event.id, currentStage.value.id, userId)
})

/** 已关注的 Influencer 在当前事件中的最新选择 */
const followedChoices = computed(() => {
  if (mode.value !== 'playing') return []
  return influencerStore.getFollowedInfluencerChoices(props.event.id)
})

/** 当前用户在该事件中的投入占比 */
const myInvestmentPercent = computed(() => {
  const userId = userStore.user?.id || ''
  return influencerStore.getUserInvestmentPercent(props.event.id, userId)
})

/** 事件资源池统计 */
const poolStats = computed(() => {
  return influencerStore.getPoolStats(props.event.id)
})

/** 初始化虚拟用户数据（在参与事件时触发） */
const initSimulatedUsers = () => {
  if (simDataInjected.value.has(props.event.id)) return
  
  const simData = generateSimulatedParticipation(
    props.event.id,
    props.event.stages as any,
    currentStageIndex.value,
    props.event.entryFee
  )
  
  influencerStore.injectSimulatedData(props.event.id, simData)
  simDataInjected.value.add(props.event.id)
}

/** 记录当前用户的投入 */
const recordMyInvestment = (type: 'entry_fee' | 'choice_cost' | 'item_purchase' | 'boost', cost: { time?: number; energy?: number; reputation?: number }, stageId?: string, description?: string) => {
  const userId = userStore.user?.id || ''
  const profile = {
    nickname: userStore.user?.nickname || '未知',
    avatar: userStore.user?.avatar || '',
    bio: userStore.user?.bio,
    topTags: (userStore.topTags.slice(0, 3) || []).map(t => {
      const def = getTagDefinition(t.tagId)
      return { tagId: t.tagId, name: def?.name || t.tagId, icon: def?.icon || '🏷️' }
    })
  }
  
  influencerStore.recordInvestment(props.event.id, userId, profile, {
    type,
    value: costToValue(cost),
    timestamp: Date.now(),
    stageId,
    description
  })
}

/** 记录当前用户的选择 */
const recordMyChoice = (stageId: string, choiceId: string, choiceText: string, resultText?: string) => {
  const userId = userStore.user?.id || ''
  const profile = {
    nickname: userStore.user?.nickname || '未知',
    avatar: userStore.user?.avatar || '',
    bio: userStore.user?.bio,
    topTags: (userStore.topTags.slice(0, 3) || []).map(t => {
      const def = getTagDefinition(t.tagId)
      return { tagId: t.tagId, name: def?.name || t.tagId, icon: def?.icon || '🏷️' }
    })
  }
  
  influencerStore.recordParticipantChoice(props.event.id, userId, profile, {
    stageId,
    choiceId,
    choiceText,
    resultText,
    timestamp: Date.now()
  })
}

// ========== 事件参与状态判断 ==========
const isEventCompleted = computed(() => eventStore.isEventCompleted(props.event.id))
const isEventInProgress = computed(() => eventStore.isEventActive(props.event.id))
const eventBranch = computed(() => {
  return worldStore.worldlineBranches.find(b => b.eventId === props.event.id) || null
})

// ========== AIGC来源判断 ==========
const isAigcEvent = computed(() => props.event.id.startsWith('aigc_'))
const aigcSource = computed(() => (props.event as any).source || {})
const aigcUrgency = computed(() => aigcSource.value.urgency || 'medium')
const aigcUrgencyText = computed(() => {
  const map: Record<string, string> = { critical: '紧急', high: '重要', medium: '关注', low: '了解' }
  return map[aigcUrgency.value] || '关注'
})

// ========== 新增：计算事件深度信息 ==========
const totalChoicesCount = computed(() => {
  return props.event.stages.reduce((sum, stage) => sum + stage.choices.length, 0)
})

const stageProgressPercent = computed(() => {
  if (props.event.stages.length <= 1) return 100
  return ((currentStageIndex.value + 1) / props.event.stages.length) * 100
})

// 提取所有可能获得的标签（去重）
const possibleTags = computed(() => {
  const tagIds = new Set<string>()
  props.event.stages.forEach(stage => {
    stage.choices.forEach(choice => {
      if (choice.outcome.rewards?.tags) {
        if (Array.isArray(choice.outcome.rewards.tags)) {
          choice.outcome.rewards.tags.forEach((t: any) => tagIds.add(typeof t === 'string' ? t : t.id))
        } else if (typeof choice.outcome.rewards.tags === 'object') {
          Object.keys(choice.outcome.rewards.tags).forEach(t => tagIds.add(t))
        }
      }
    })
  })
  return Array.from(tagIds).map(id => {
    const def = getTagDefinition(id)
    return { id, name: def?.name || id, icon: def?.icon || '🏷️' }
  })
})

// ========== 快节奏多倍投入 ==========
const multiplier = ref(0)
const maxMultiplier = 10
const CONFIRM_DELAY = 2000
const TIMER_INTERVAL = 50
let confirmTimer: ReturnType<typeof setTimeout> | null = null
let progressTimer: ReturnType<typeof setInterval> | null = null
const timerProgress = ref(100)
const isCountingDown = ref(false)

// ========== 按钮交互效果 ==========
const tapAnimKey = ref(0)
const ripples = reactive<Array<{ id: number; x: number; y: number }>>([])
let rippleId = 0

const btnClasses = computed(() => ({
  disabled: !canJoin.value || !canAffordCurrent.value,
  'is-tapping': multiplier.value > 0 && hasEntryFee.value,
  'level-1': multiplier.value === 1,
  'level-2': multiplier.value === 2,
  'level-3': multiplier.value === 3,
  'level-high': multiplier.value >= 4,
  [`tap-${tapAnimKey.value % 2}`]: multiplier.value > 0,
}))

// ========== 隐藏分支计算 ==========
const isChoiceUnlocked = (choice: EventChoice): boolean => {
  if (!choice.hidden || !choice.requiresItems) return true
  return choice.requiresItems.every(itemId => userStore.hasItem(itemId))
}

const visibleChoices = computed(() => {
  if (!currentStage.value) return []
  return currentStage.value.choices.filter(choice => {
    // 非隐藏选项始终显示
    if (!choice.hidden) return true
    // 隐藏选项：只有持有所有所需物品时才显示
    return isChoiceUnlocked(choice)
  })
})

// ========== ClaimItem 计算 ==========
const pendingClaimItems = computed(() => {
  if (!lastResult.value?.claimableItems) return []
  return lastResult.value.claimableItems.filter((ci, idx) => {
    const key = ci.itemId + '-' + idx
    return !skippedItemIds.value.has(key)
  })
})

const hasRequiredUnclaimedItems = computed(() => {
  if (!lastResult.value?.claimableItems) return false
  return lastResult.value.claimableItems.some((ci, idx) => {
    const key = ci.itemId + '-' + idx
    return ci.required && !claimedItemIds.value.has(key) && !skippedItemIds.value.has(key)
  })
})

// ========== 计算属性 ==========
const currentStage = computed((): EventStage | undefined => {
  return props.event.stages[currentStageIndex.value]
})

const hasEntryFee = computed(() => {
  return props.event.entryFee && (props.event.entryFee.time || props.event.entryFee.energy)
})

const hasNextStage = computed(() => {
  if (nextStageId.value) {
    return props.event.stages.some(s => s.id === nextStageId.value)
  }
  return currentStageIndex.value < props.event.stages.length - 1
})

const canJoin = computed(() => {
  if (props.event.requirements && !userStore.meetsRequirements(props.event.requirements)) {
    return false
  }
  if (props.event.entryFee && !userStore.canAfford(props.event.entryFee)) {
    return false
  }
  return props.event.status === 'active'
})

const canAffordChoice = (choice: EventChoice): boolean => {
  if (!choice.cost) return true
  return userStore.canAfford(choice.cost)
}

// ========== 多倍下注系统 ==========
/** 可选的下注倍数 */
const betOptions = [1, 2, 3, 5]
/** 无cost选项的基础下注额 */
const BASE_BET = { time: 5, energy: 3 }
/** 每个选项的当前下注倍数：choiceId -> multiplier */
const choiceBets = ref<Record<string, number>>({})
/** 上一次选择的下注倍数（用于result页面展示） */
const lastBetMultiplier = ref(1)

/** 获取某选项的当前下注倍数 */
const getChoiceBet = (choiceId: string): number => {
  return choiceBets.value[choiceId] || 1
}

/** 设置某选项的下注倍数 */
const setChoiceBet = (choiceId: string, m: number) => {
  choiceBets.value[choiceId] = m
}

/** 设置下注倍数（带触觉反馈） */
const handleSetBet = (choiceId: string, m: number) => {
  if (!canAffordBetLevel(visibleChoices.value.find(c => c.id === choiceId)!, m)) return
  setChoiceBet(choiceId, m)
  // 触觉反馈
  try {
    if (navigator && navigator.vibrate) {
      navigator.vibrate(m > 1 ? [20, 10, 20] : 10)
    }
  } catch (e) {}
}

/** 是否有任何选项被加码 */
const hasAnyBetBoosted = computed(() => {
  return Object.values(choiceBets.value).some(m => m > 1)
})

/** 当前所有选项的额外消耗总和 */
const totalBetExtraCost = computed(() => {
  let extraTime = 0
  let extraEnergy = 0
  for (const choice of visibleChoices.value) {
    const m = getChoiceBet(choice.id)
    if (m <= 1) continue
    if (choice.cost) {
      extraTime += (choice.cost.time || 0) * (m - 1)
      extraEnergy += (choice.cost.energy || 0) * (m - 1)
    } else {
      extraTime += BASE_BET.time * (m - 1)
      extraEnergy += BASE_BET.energy * (m - 1)
    }
  }
  if (extraTime === 0 && extraEnergy === 0) return null
  return { time: extraTime, energy: extraEnergy }
})

/** 额外消耗文本 */
const totalBetExtraCostText = computed(() => {
  if (!totalBetExtraCost.value) return ''
  const parts: string[] = []
  if (totalBetExtraCost.value.time) parts.push(`⏰${totalBetExtraCost.value.time}`)
  if (totalBetExtraCost.value.energy) parts.push(`⚡${totalBetExtraCost.value.energy}`)
  return parts.join(' ')
})

/** 获取某选项在当前下注倍数下的总消耗 */
const getChoiceTotalCost = (choice: EventChoice): { time?: number; energy?: number } | null => {
  const m = getChoiceBet(choice.id)
  if (choice.cost) {
    return {
      time: choice.cost.time ? choice.cost.time * m : undefined,
      energy: choice.cost.energy ? choice.cost.energy * m : undefined
    }
  }
  // 无cost选项：倍数>1时使用基础下注额
  if (m > 1) {
    return {
      time: BASE_BET.time * (m - 1),
      energy: BASE_BET.energy * (m - 1)
    }
  }
  return null
}

/** 检查当前下注倍数下是否负担得起 */
const canAffordBet = (choice: EventChoice): boolean => {
  const cost = getChoiceTotalCost(choice)
  if (!cost) return true
  return userStore.canAfford(cost)
}

/** 检查某个特定倍数是否负担得起 */
const canAffordBetLevel = (choice: EventChoice, m: number): boolean => {
  if (choice.cost) {
    const cost = {
      time: choice.cost.time ? choice.cost.time * m : 0,
      energy: choice.cost.energy ? choice.cost.energy * m : 0
    }
    return userStore.canAfford(cost)
  }
  if (m > 1) {
    const cost = {
      time: BASE_BET.time * (m - 1),
      energy: BASE_BET.energy * (m - 1)
    }
    return userStore.canAfford(cost)
  }
  return true
}

const totalCost = computed(() => {
  const fee = props.event.entryFee
  if (!fee) return { time: 0, energy: 0 }
  const m = Math.max(multiplier.value, 1)
  return {
    time: (fee.time || 0) * m,
    energy: (fee.energy || 0) * m
  }
})

const canAffordCurrent = computed(() => {
  if (!hasEntryFee.value) return true
  if (multiplier.value === 0) return true
  return userStore.canAfford(totalCost.value)
})

const canAffordNext = computed(() => {
  const fee = props.event.entryFee
  if (!fee) return true
  if (multiplier.value >= maxMultiplier) return false
  const nextCost = {
    time: (fee.time || 0) * (multiplier.value + 1),
    energy: (fee.energy || 0) * (multiplier.value + 1)
  }
  return userStore.canAfford(nextCost)
})

const costSummary = computed(() => {
  const parts: string[] = []
  if (totalCost.value.time) parts.push(`⏰${totalCost.value.time}`)
  if (totalCost.value.energy) parts.push(`⚡${totalCost.value.energy}`)
  return parts.join(' ')
})

// ========== 计时器管理 ==========
const clearTimers = () => {
  if (confirmTimer) {
    clearTimeout(confirmTimer)
    confirmTimer = null
  }
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
  isCountingDown.value = false
}

const startConfirmCountdown = () => {
  clearTimers()
  timerProgress.value = 100
  isCountingDown.value = true
  
  const startTime = Date.now()
  
  progressTimer = setInterval(() => {
    const elapsed = Date.now() - startTime
    timerProgress.value = Math.max(0, 100 - (elapsed / CONFIRM_DELAY) * 100)
  }, TIMER_INTERVAL)
  
  confirmTimer = setTimeout(() => {
    clearTimers()
    confirmJoin()
  }, CONFIRM_DELAY)
}

// ========== 涟漪效果 ==========
const addRipple = () => {
  const id = ++rippleId
  const x = 30 + Math.random() * 140
  const y = 10 + Math.random() * 30
  ripples.push({ id, x, y })
  
  setTimeout(() => {
    const idx = ripples.findIndex(r => r.id === id)
    if (idx !== -1) ripples.splice(idx, 1)
  }, 600)
}

// ========== 核心交互 ==========
const handleTapJoin = () => {
  if (!canJoin.value) return
  
  if (!hasEntryFee.value) {
    multiplier.value = 1
    confirmJoin()
    return
  }
  
  if (canAffordNext.value || multiplier.value === 0) {
    multiplier.value++
    tapAnimKey.value++
    addRipple()
    
    try {
      if (navigator && navigator.vibrate) {
        navigator.vibrate(multiplier.value > 3 ? [30, 20, 30] : 15)
      }
    } catch (e) {}
    
    startConfirmCountdown()
  }
}

const confirmJoin = () => {
  if (!canJoin.value || !canAffordCurrent.value) return
  
  const finalMultiplier = Math.max(multiplier.value, 1)
  
  if (props.event.entryFee && hasEntryFee.value) {
    userStore.pay(totalCost.value)
  }
  
  // Influencer系统：初始化虚拟用户数据
  initSimulatedUsers()
  
  // Influencer系统：记录当前用户的入场费投入
  if (props.event.entryFee && hasEntryFee.value) {
    const fee = {
      time: (props.event.entryFee.time || 0) * finalMultiplier,
      energy: (props.event.entryFee.energy || 0) * finalMultiplier
    }
    recordMyInvestment('entry_fee', fee, undefined, `参与事件入场费${finalMultiplier > 1 ? ` (${finalMultiplier}倍)` : ''}`)
  }
  
  eventStore.startEvent(props.event.id)
  
  worldStore.recordEvent(
    props.event.id, 
    props.event.title + (finalMultiplier > 1 ? ` (${finalMultiplier}倍投入)` : '')
  )
  
  mode.value = 'playing'
  currentStageIndex.value = 0
  multiplier.value = 0
  
  emit('stateChange', 'playing')
}

// ========== 已参与状态处理 ==========
const handleViewHistory = () => {
  // 切换到世界线页面查看详细历史
  uni.switchTab({ url: '/pages/worldline/worldline' })
}

const handleContinueEvent = () => {
  // 继续进行中的事件，进入playing模式
  mode.value = 'playing'
  // 尝试恢复到上次的阶段（根据已做选择数量推断）
  const choicesMade = eventBranch.value?.choices.length || 0
  currentStageIndex.value = Math.min(choicesMade, props.event.stages.length - 1)
  emit('stateChange', 'playing')
}

// ========== Influencer 交互 ==========
const handleToggleFollow = (inf: InfluencerInfo) => {
  if (influencerStore.isFollowing(inf.userId)) {
    influencerStore.unfollowInfluencer(inf.userId)
    uni.showToast({ title: `已取消关注 ${inf.nickname}`, icon: 'none' })
  } else {
    influencerStore.followInfluencer(inf.userId, inf.nickname, inf.avatar)
    uni.showToast({ title: `已关注 ${inf.nickname}，后续阶段将提示其选择`, icon: 'none' })
  }
}

// ========== 辅助函数 ==========
const getTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    story: '📖', challenge: '💼', craft: '🎯', social: '💬', exploration: '🔍', creation: '✨'
  }
  return icons[type] || '📅'
}

const getTypeName = (type: string): string => {
  const names: Record<string, string> = {
    story: '生活', challenge: '挑战', craft: '制作', social: '社交', exploration: '探索', creation: '创造'
  }
  return names[type] || '事件'
}

const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    upcoming: '即将开始', active: '进行中', ended: '已结束'
  }
  return texts[status] || status
}

const formatNumber = (num: number): string => {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num.toString()
}

const getItemName = (itemId: string): string => {
  const item = itemStore.getItem(itemId)
  return item?.name || itemId
}

// 统一标签格式：兼容 string[], {id,value}[], {tagId: weight} 三种格式
const normalizeTagIds = (tags: any): string[] => {
  if (!tags) return []
  if (Array.isArray(tags)) {
    return tags.map((t: any) => typeof t === 'string' ? t : t.id).filter(Boolean)
  }
  if (typeof tags === 'object') {
    return Object.keys(tags)
  }
  return []
}

const getTagDisplayName = (tagId: string): string => {
  const def = getTagDefinition(tagId)
  return def?.name || tagId
}

const getTagIcon = (tagId: string): string => {
  const def = getTagDefinition(tagId)
  return def?.icon || '🏷️'
}

// ========== ClaimItem 处理 ==========
const handleClaimItem = (ci: ClaimableItem, idx: number) => {
  const key = ci.itemId + '-' + idx
  if (claimedItemIds.value.has(key)) return
  
  userStore.addItem({
    itemId: ci.itemId,
    quantity: ci.quantity || 1,
    acquiredAt: Date.now(),
    source: props.event.id
  })
  
  claimedItemIds.value.add(key)
  // 触发全屏展示
  showItemDrops([{ itemId: ci.itemId, quantity: ci.quantity || 1 }])
}

const handleSkipClaim = (ci: ClaimableItem, idx: number) => {
  const key = ci.itemId + '-' + idx
  skippedItemIds.value.add(key)
}

const getClaimItemIcon = (itemId: string): string => {
  const item = itemStore.getItem(itemId)
  return item?.icon || '🎁'
}

// ========== 选项选择 ==========
const handleSelectChoice = (choice: EventChoice) => {
  // 隐藏分支校验
  if (choice.hidden && !isChoiceUnlocked(choice)) {
    uni.showToast({ title: '需要持有特定物品才能解锁', icon: 'none' })
    return
  }
  
  // 使用多倍下注的实际消耗
  const betMultiplier = getChoiceBet(choice.id)
  lastBetMultiplier.value = betMultiplier
  const actualCost = getChoiceTotalCost(choice)
  
  if (actualCost && !userStore.canAfford(actualCost)) {
    uni.showToast({ title: '时间或精力不足', icon: 'none' })
    return
  }
  
  if (actualCost) {
    userStore.pay(actualCost)
    // Influencer系统：记录选择消耗
    const investType: 'boost' | 'choice_cost' = betMultiplier > 1 ? 'boost' : 'choice_cost'
    const desc = betMultiplier > 1 
      ? `选择“${choice.text}”并${betMultiplier}倍加码` 
      : `选择“${choice.text}”的消耗`
    recordMyInvestment(investType, actualCost, currentStage.value?.id, desc)
  }
  
  // Influencer系统：记录用户选择
  if (currentStage.value) {
    recordMyChoice(currentStage.value.id, choice.id, choice.text, choice.outcome.resultText)
  }
  
  const result = choice.outcome
  lastResult.value = result
  nextStageId.value = result.nextStageId || null
  
  if (result.rewards) {
    if (result.rewards.time) userStore.updateWallet({ time: result.rewards.time })
    if (result.rewards.energy) userStore.updateWallet({ energy: result.rewards.energy })
    if (result.rewards.reputation) userStore.updateWallet({ reputation: result.rewards.reputation })
    
    if (result.rewards.tags) {
      const totalCostVal = {
        time: (props.event.entryFee?.time || 0) + (choice.cost?.time || 0),
        energy: (props.event.entryFee?.energy || 0) + (choice.cost?.energy || 0)
      }
      if (Array.isArray(result.rewards.tags)) {
        result.rewards.tags.forEach((t: any) => {
          if (typeof t === 'string') {
            userStore.updateTagWeight(t, 5, 'event', props.event.id, props.event.title, totalCostVal)
          } else if (t && typeof t === 'object' && t.id) {
            userStore.updateTagWeight(t.id, t.value || 5, 'event', props.event.id, props.event.title, totalCostVal)
          }
        })
      } else if (typeof result.rewards.tags === 'object') {
        Object.entries(result.rewards.tags).forEach(([tagId, weight]) => {
          userStore.updateTagWeight(tagId, weight as number, 'event', props.event.id, props.event.title, totalCostVal)
        })
      }
    }
    
    if (result.rewards.items) {
      result.rewards.items.forEach(itemId => userStore.addItem({
          itemId,
          quantity: 1,
          acquiredAt: Date.now(),
          source: props.event.id
        }))
    }
    
    // 概率掉落物品处理
    if (result.rewards.itemDrops && result.rewards.itemDrops.length > 0) {
      const drops = rollItemDrops(result.rewards.itemDrops)
      droppedItems.value = drops
      // 先添加到背包
      drops.forEach(drop => {
        userStore.addItem({
          itemId: drop.itemId,
          quantity: drop.quantity,
          acquiredAt: Date.now(),
          source: props.event.id
        })
      })
      // 触发全屏展示
      if (drops.length > 0) {
        showItemDrops(drops)
      }
    } else {
      droppedItems.value = []
    }
  }
  
  if (result.penalties) {
    if (result.penalties.time) userStore.pay({ time: result.penalties.time })
    if (result.penalties.energy) userStore.pay({ energy: result.penalties.energy })
    if (result.penalties.reputation) userStore.pay({ reputation: result.penalties.reputation })
    
    if (result.penalties.tags) {
      Object.entries(result.penalties.tags).forEach(([tagId, weight]) => {
        userStore.decreaseTagWeight(tagId, weight as number)
      })
    }
  }
  
  worldStore.recordChoice(props.event.id, props.event.title, choice.text)
  
  // 重置ClaimItem状态
  claimedItemIds.value.clear()
  skippedItemIds.value.clear()
  
  // 尝试触发“与玩家相遇”偶发子事件
  if (tryTriggerEncounter()) {
    mode.value = 'encounter'
    emit('stateChange', 'encounter')
  } else {
    mode.value = 'result'
    emit('stateChange', 'result')
  }
}

const handleContinue = () => {
  // 检查是否有必须领取的物品未领取
  if (hasRequiredUnclaimedItems.value) {
    uni.showToast({ title: '请先领取必须物品', icon: 'none' })
    return
  }
  if (hasNextStage.value) {
    if (nextStageId.value) {
      const idx = props.event.stages.findIndex(s => s.id === nextStageId.value)
      if (idx !== -1) currentStageIndex.value = idx
    } else {
      currentStageIndex.value++
    }
    
    // Influencer系统：更新虚拟用户数据到新阶段
    const simData = generateSimulatedParticipation(
      props.event.id,
      props.event.stages as any,
      currentStageIndex.value,
      props.event.entryFee
    )
    influencerStore.injectSimulatedData(props.event.id, simData)
    
    mode.value = 'playing'
    lastResult.value = null
    nextStageId.value = null
    choiceBets.value = {}
    lastBetMultiplier.value = 1
    emit('stateChange', 'playing')
  } else {
    eventStore.completeEvent(props.event.id)
    
    worldStore.recordEventComplete(props.event.id, props.event.title, {
      tags: lastResult.value?.rewards?.tags 
        ? (typeof lastResult.value.rewards.tags === 'object' && !Array.isArray(lastResult.value.rewards.tags) 
            ? Object.keys(lastResult.value.rewards.tags) 
            : lastResult.value.rewards.tags as string[])
        : undefined,
      stats: lastResult.value?.rewards ? {
        time: lastResult.value.rewards.time,
        energy: lastResult.value.rewards.energy,
        reputation: lastResult.value.rewards.reputation
      } : undefined
    })
    
    mode.value = 'preview'
    currentStageIndex.value = 0
    lastResult.value = null
    nextStageId.value = null
    emit('stateChange', 'completed')
    
    uni.showToast({ title: '事件完成！', icon: 'success' })
  }
}

watch(() => props.event.id, () => {
  resetCardState()
})

const resetCardState = () => {
  clearTimers()
  mode.value = 'preview'
  currentStageIndex.value = 0
  lastResult.value = null
  nextStageId.value = null
  multiplier.value = 0
  ripples.splice(0)
  claimedItemIds.value.clear()
  skippedItemIds.value.clear()
  droppedItems.value = []
  influencerExpanded.value = false
  choiceBets.value = {}
  lastBetMultiplier.value = 1
  emit('stateChange', 'preview')
}

onUnmounted(() => {
  clearTimers()
})

defineExpose({
  resetCardState
})
</script>

<style lang="scss" scoped>

.event-card {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  background: $white;
  border-radius: $radius-2xl;
  overflow: hidden;
  box-shadow: $shadow-lg;
  display: flex;
  flex-direction: column;
}

// AIGC来源标记
.header-badges-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex-wrap: nowrap;
}

.aigc-source-badge {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 20rpx;
  padding: 6rpx 14rpx;
  white-space: nowrap;
  
  .aigc-icon {
    font-size: 20rpx;
    line-height: 1;
  }
  .aigc-label {
    font-size: 20rpx;
    color: #059669;
    font-weight: 600;
    line-height: 1.2;
  }
}

.aigc-urgency-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6rpx 14rpx;
  border-radius: 20rpx;
  white-space: nowrap;
  
  .urgency-text {
    font-size: 20rpx;
    font-weight: 700;
    line-height: 1.2;
  }
  
  &.critical {
    background: #FEE2E2;
    border: 1px solid rgba(220, 38, 38, 0.3);
    .urgency-text { color: #DC2626; }
  }
  &.high {
    background: #FEF3C7;
    border: 1px solid rgba(217, 119, 6, 0.3);
    .urgency-text { color: #D97706; }
  }
  &.medium {
    background: #DBEAFE;
    border: 1px solid rgba(37, 99, 235, 0.3);
    .urgency-text { color: #2563EB; }
  }
  &.low {
    background: #F3F4F6;
    border: 1px solid rgba(107, 114, 128, 0.3);
    .urgency-text { color: #6B7280; }
  }
}

// 顶部装饰条
.card-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6rpx;
  
  &.story { background: $gradient-primary; }
  &.challenge { background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); }
  &.craft { background: $gradient-secondary; }
  &.social { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); }
  &.exploration { background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); }
  &.creation { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); }
}

.card-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 32rpx 32rpx 28rpx;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24rpx;
  flex-shrink: 0;
  gap: 12rpx;
}

.header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
  flex-shrink: 0;
}

.event-type {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 20rpx;
  border-radius: $radius-full;
  background: $gray-50;
  
  &.story { 
    background: rgba(16, 185, 129, 0.08);
    .type-text { color: $primary-dark; }
  }
  &.challenge { 
    background: rgba(239, 68, 68, 0.08);
    .type-text { color: #DC2626; }
  }
  &.craft { 
    background: rgba(251, 191, 36, 0.08);
    .type-text { color: $accent-dark; }
  }
  &.social { 
    background: rgba(59, 130, 246, 0.08);
    .type-text { color: #2563EB; }
  }
  &.exploration {
    background: rgba(139, 92, 246, 0.08);
    .type-text { color: #7C3AED; }
  }
  &.creation {
    background: rgba(245, 158, 11, 0.08);
    .type-text { color: #D97706; }
  }
}

.type-icon { font-size: 22rpx; }
.type-text { font-size: 24rpx; font-weight: 600; color: $text-secondary; }

.event-status {
  padding: 10rpx 20rpx;
  border-radius: $radius-full;
  font-size: 22rpx;
  font-weight: 600;
  
  &.active { background: $gradient-primary; color: $white; }
  &.upcoming { background: $gray-100; color: $text-secondary; }
  &.ended { background: $gray-100; color: $text-tertiary; }
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 0;
}

// ==================== 氛围区 ====================
.atmosphere-zone {
  position: relative;
  width: 100%;
  height: 160rpx;
  border-radius: $radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
  overflow: hidden;
  flex-shrink: 0;

  &.story { background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(52, 211, 153, 0.08) 100%); }
  &.challenge { background: linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(248, 113, 113, 0.08) 100%); }
  &.craft { background: linear-gradient(135deg, rgba(107, 114, 128, 0.12) 0%, rgba(156, 163, 175, 0.08) 100%); }
  &.social { background: linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(96, 165, 250, 0.08) 100%); }
  &.exploration { background: linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(167, 139, 250, 0.08) 100%); }
  &.creation { background: linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(252, 211, 77, 0.08) 100%); }
}

.atmo-icon {
  font-size: 80rpx;
  z-index: 2;
}

.atmo-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.particle {
  position: absolute;
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  animation: float-particle 4s ease-in-out infinite;

  &.p-1 { top: 20%; left: 15%; animation-delay: 0s; }
  &.p-2 { top: 60%; left: 80%; animation-delay: 0.8s; }
  &.p-3 { top: 30%; left: 65%; animation-delay: 1.6s; width: 12rpx; height: 12rpx; }
  &.p-4 { top: 70%; left: 25%; animation-delay: 2.4s; }
  &.p-5 { top: 45%; left: 90%; animation-delay: 3.2s; width: 6rpx; height: 6rpx; }
}

@keyframes float-particle {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
  50% { transform: translateY(-10rpx) scale(1.3); opacity: 0.6; }
}

.event-title, .stage-title, .result-title {
  font-size: 44rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 12rpx;
  line-height: 1.3;
}

.event-desc, .stage-desc, .result-desc {
  font-size: 28rpx;
  color: $text-secondary;
  line-height: 1.7;
  margin-bottom: 20rpx;
  @include text-ellipsis(3);
}

// ==================== 事件深度信息 ====================
.event-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 16rpx;
  background: $gray-50;
  border-radius: $radius-full;
  border: 1rpx solid $gray-100;
}

.meta-icon { font-size: 20rpx; }
.meta-text { font-size: 22rpx; color: $text-secondary; font-weight: 500; }

.participants-chip {
  background: rgba($primary-color, 0.06);
  border-color: rgba($primary-color, 0.12);
  .meta-text { color: $primary-color; font-weight: 600; }
}

// ==================== 标签预览 ====================
.reward-preview {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  margin-bottom: 16rpx;
}

.reward-label {
  font-size: 22rpx;
  color: $text-tertiary;
  font-weight: 500;
}

.reward-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.preview-tag {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 6rpx 16rpx;
  border-radius: $radius-full;
  
  &.tag-color-0 { background: rgba(#6366F1, 0.08); .preview-tag-name { color: #4F46E5; } .preview-tag-icon { color: #4F46E5; } }
  &.tag-color-1 { background: rgba(#10B981, 0.08); .preview-tag-name { color: #059669; } .preview-tag-icon { color: #059669; } }
  &.tag-color-2 { background: rgba(#F59E0B, 0.08); .preview-tag-name { color: #D97706; } .preview-tag-icon { color: #D97706; } }
  &.tag-color-3 { background: rgba(#EF4444, 0.08); .preview-tag-name { color: #DC2626; } .preview-tag-icon { color: #DC2626; } }
  &.tag-color-4 { background: rgba(#8B5CF6, 0.08); .preview-tag-name { color: #7C3AED; } .preview-tag-icon { color: #7C3AED; } }
  
  &.more {
    background: $gray-100;
    .preview-tag-name { color: $text-tertiary; }
  }
}

.preview-tag-icon { font-size: 20rpx; }
.preview-tag-name { font-size: 22rpx; font-weight: 500; }

// ==================== 阶段进度条 ====================
.stage-progress-bar {
  position: relative;
  width: 100%;
  height: 36rpx;
  background: $gray-100;
  border-radius: $radius-full;
  margin-bottom: 24rpx;
  overflow: hidden;
  flex-shrink: 0;
}

.stage-progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: $gradient-primary;
  border-radius: $radius-full;
  transition: width 0.5s ease;
}

.stage-progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 20rpx;
  font-weight: 600;
  color: $text-secondary;
  z-index: 1;
}

// ==================== 底部 ====================
.card-footer {
  margin-top: auto;
  flex-shrink: 0;
  padding-top: 24rpx;
}

.footer-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.entry-fee {
  &.free .free-label {
    font-size: 26rpx;
    color: $primary-color;
    font-weight: 600;
  }
}

.fee-label { font-size: 22rpx; color: $text-tertiary; margin-bottom: 8rpx; }
.fee-items { display: flex; gap: 16rpx; }

.fee-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 16rpx;
  border-radius: $radius-lg;
  
  &.time {
    background: rgba(59, 130, 246, 0.08);
    .fee-value { color: #2563EB; }
  }
  &.energy {
    background: rgba(251, 191, 36, 0.08);
    .fee-value { color: $accent-dark; }
  }
}

.fee-icon { font-size: 20rpx; }
.fee-value { font-size: 24rpx; font-weight: 600; }

// ==================== 参与按钮 ====================
.action-btn {
  position: relative;
  width: 100%;
  min-height: 100rpx;
  height: auto;
  padding: 24rpx 32rpx;
  background: $gradient-primary;
  color: $white;
  border: none;
  border-radius: $radius-xl;
  font-size: 34rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-primary;
  transition: all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  overflow: hidden;
  
  &:active { transform: scale(0.95); }
  
  &.disabled {
    background: $gray-200;
    color: $text-tertiary;
    box-shadow: none;
  }
  
  &.level-1 {
    background: $gradient-primary;
    box-shadow: 0 4rpx 16rpx rgba(16, 185, 129, 0.35);
  }
  &.level-2 {
    background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
    box-shadow: 0 4rpx 20rpx rgba(59, 130, 246, 0.4);
  }
  &.level-3 {
    background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
    box-shadow: 0 6rpx 24rpx rgba(139, 92, 246, 0.45);
  }
  &.level-high {
    background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
    box-shadow: 0 6rpx 28rpx rgba(239, 68, 68, 0.5);
    animation: glow-pulse 1s ease-in-out infinite;
  }
  
  &.tap-0.is-tapping {
    animation: tap-bounce-a 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  &.tap-1.is-tapping {
    animation: tap-bounce-b 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

.btn-text-default {
  font-size: 34rpx;
  font-weight: 600;
  letter-spacing: 4rpx;
}

@keyframes tap-bounce-a {
  0% { transform: scale(0.92); }
  50% { transform: scale(1.06); }
  100% { transform: scale(1); }
}

@keyframes tap-bounce-b {
  0% { transform: scale(0.92); }
  50% { transform: scale(1.06); }
  100% { transform: scale(1); }
}

@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 6rpx 28rpx rgba(239, 68, 68, 0.5); }
  50% { box-shadow: 0 8rpx 40rpx rgba(239, 68, 68, 0.7); }
}

.ripple-container {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.ripple {
  position: absolute;
  width: 20rpx; height: 20rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%) scale(0);
  animation: ripple-expand 0.6s ease-out forwards;
}

@keyframes ripple-expand {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(15); opacity: 0; }
}

.btn-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  z-index: 1;
}

.btn-multiplier-row {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.btn-multiplier {
  font-weight: 800;
  letter-spacing: 2rpx;
  transition: font-size 0.15s ease;
  &.level-1 { font-size: 44rpx; }
  &.level-2 { font-size: 48rpx; }
  &.level-3 { font-size: 52rpx; }
  &.level-4, &.level-5 { font-size: 56rpx; }
}

.btn-label { font-size: 26rpx; font-weight: 500; opacity: 0.9; }
.btn-cost-text { font-size: 24rpx; font-weight: 400; opacity: 0.85; }

.btn-timer-bar {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 8rpx;
  background: rgba(0, 0, 0, 0.2);
  
  .timer-fill {
    height: 100%;
    background: rgba(255, 255, 255, 0.7);
    transition: width 0.05s linear;
    border-radius: 0 4rpx 4rpx 0;
  }
}

// ==================== 选项列表 ====================
.options-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.option-item {
  display: flex;
  flex-direction: column;
  padding: 24rpx 28rpx;
  min-height: 88rpx;
  background: $gray-50;
  border-radius: $radius-xl;
  border: 2rpx solid transparent;
  transition: all 0.25s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  
  &:active {
    background: $white;
    border-color: $primary-color;
    transform: scale(0.98);
    box-shadow: 0 2rpx 12rpx rgba(16, 185, 129, 0.15);
  }
  &.disabled { opacity: 0.5; pointer-events: none; }
}

.option-main {
  flex: 1;
  cursor: pointer;
  padding: 4rpx 0;
}

.option-text {
  display: block;
  font-size: 28rpx;
  color: $text-primary;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.option-cost { display: flex; gap: 12rpx; }

.cost-tag {
  font-size: 22rpx;
  font-weight: 500;
  &.time { color: #3B82F6; }
  &.energy { color: $accent-dark; }
}

.option-arrow { font-size: 28rpx; color: $text-tertiary; font-weight: 300; }

.progress-dots {
  display: flex;
  justify-content: center;
  gap: 12rpx;
}

.dot {
  width: 12rpx; height: 12rpx;
  border-radius: 50%;
  background: $gray-200;
  transition: all $transition-normal;
  
  &.active { width: 32rpx; border-radius: 6rpx; background: $primary-color; }
  &.completed { background: $primary-light; }
}

// ==================== 结果奖励 ====================
.result-rewards {
  background: rgba(16, 185, 129, 0.06);
  border-radius: $radius-xl;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.rewards-header { margin-bottom: 16rpx; }
.rewards-title { font-size: 26rpx; font-weight: 600; color: $primary-dark; }

.rewards-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.reward-tag, .reward-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 18rpx;
  background: $white;
  border-radius: $radius-lg;
  box-shadow: $shadow-xs;
}

.tag-icon, .item-icon { font-size: 22rpx; }
.tag-name, .item-name { font-size: 24rpx; color: $text-primary; font-weight: 500; }

.result-penalties {
  background: rgba(239, 68, 68, 0.06);
  border-radius: $radius-xl;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.penalties-header { margin-bottom: 16rpx; }
.penalties-title { font-size: 26rpx; font-weight: 600; color: #DC2626; }
.penalties-grid { display: flex; flex-wrap: wrap; gap: 12rpx; }

.penalty-tag {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 18rpx;
  background: $white;
  border-radius: $radius-lg;
  box-shadow: $shadow-xs;
  .tag-name { color: #DC2626; }
}

// ==================== 历史抉择摘要 ====================
.history-summary {
  padding: 20rpx;
  background: rgba(99, 102, 241, 0.04);
  border-radius: $radius-xl;
  border: 2rpx solid rgba(99, 102, 241, 0.12);
}

.history-badge {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 6rpx 16rpx;
  border-radius: $radius-full;
  margin-bottom: 12rpx;
  
  &.completed {
    background: rgba(16, 185, 129, 0.1);
    .history-badge-text { color: #059669; }
  }
  &.in-progress {
    background: rgba(245, 158, 11, 0.1);
    .history-badge-text { color: #D97706; }
  }
}

.history-badge-icon { font-size: 22rpx; }
.history-badge-text { font-size: 22rpx; font-weight: 600; }

.history-choices {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-bottom: 8rpx;
}

.history-choice {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 10rpx 16rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: $radius-lg;
  
  .choice-index {
    width: 36rpx;
    height: 36rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(99, 102, 241, 0.1);
    border-radius: 50%;
    font-size: 20rpx;
    font-weight: 700;
    color: #4F46E5;
    flex-shrink: 0;
  }
  
  .choice-text {
    font-size: 24rpx;
    color: $text-secondary;
    @include text-ellipsis(1);
  }
}

.history-more {
  font-size: 22rpx;
  color: $text-tertiary;
  padding-left: 48rpx;
}

.history-ending {
  display: block;
  font-size: 22rpx;
  color: $text-secondary;
  font-style: italic;
  line-height: 1.5;
  @include text-ellipsis(2);
}

.history-hint {
  display: block;
  font-size: 22rpx;
  color: #D97706;
  font-weight: 500;
}

// ==================== 状态按钮 ====================
.history-btn {
  background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%) !important;
  box-shadow: 0 4rpx 16rpx rgba(99, 102, 241, 0.3) !important;
}

.continue-btn {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%) !important;
  box-shadow: 0 4rpx 16rpx rgba(245, 158, 11, 0.3) !important;
}

// ==================== 隐藏分支选项 ====================
.hidden-choice {
  border: 2rpx solid rgba(168, 85, 247, 0.3) !important;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(139, 92, 246, 0.08) 100%) !important;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(45deg, transparent 40%, rgba(168, 85, 247, 0.06) 50%, transparent 60%);
    animation: shimmer 3s infinite;
  }
  
  &:active {
    border-color: rgba(168, 85, 247, 0.6) !important;
    box-shadow: 0 2rpx 16rpx rgba(168, 85, 247, 0.2) !important;
  }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.option-text-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 4rpx;
}

.hidden-badge {
  display: inline-flex;
  align-items: center;
  padding: 2rpx 12rpx;
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  color: white;
  font-size: 18rpx;
  font-weight: 700;
  border-radius: $radius-full;
  flex-shrink: 0;
  letter-spacing: 1rpx;
}

.hidden-hint {
  display: block;
  font-size: 22rpx;
  color: #7C3AED;
  font-style: italic;
  margin: 6rpx 0;
  padding-left: 4rpx;
  line-height: 1.4;
}

.requires-items {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8rpx;
  margin-top: 8rpx;
}

.requires-label {
  font-size: 20rpx;
  color: $text-tertiary;
  font-weight: 500;
}

.requires-item {
  display: inline-flex;
  align-items: center;
  gap: 4rpx;
  padding: 4rpx 12rpx;
  background: rgba(239, 68, 68, 0.08);
  border-radius: $radius-lg;
  border: 1rpx solid rgba(239, 68, 68, 0.2);
  
  &.owned {
    background: rgba(16, 185, 129, 0.08);
    border-color: rgba(16, 185, 129, 0.2);
  }
}

.req-icon { font-size: 18rpx; }
.req-name { font-size: 20rpx; color: $text-secondary; font-weight: 500; }

// ==================== ClaimItem 领取面板 ====================
.claim-items-panel {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(245, 158, 11, 0.12) 100%);
  border: 2rpx solid rgba(245, 158, 11, 0.2);
  border-radius: $radius-xl;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.claim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.claim-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #B45309;
}

.claim-subtitle {
  font-size: 22rpx;
  color: #D97706;
}

.claim-items-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.claim-item {
  background: $white;
  border-radius: $radius-lg;
  padding: 20rpx;
  border: 2rpx solid rgba(245, 158, 11, 0.15);
  transition: all 0.3s ease;
  
  &.claimed {
    background: rgba(16, 185, 129, 0.06);
    border-color: rgba(16, 185, 129, 0.2);
    opacity: 0.8;
  }
  
  &.required {
    border-color: rgba(239, 68, 68, 0.3);
    &::after {
      content: '必须领取';
      position: absolute;
      top: 8rpx;
      right: 12rpx;
      font-size: 18rpx;
      color: #DC2626;
      font-weight: 600;
    }
  }
}

.claim-item-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 8rpx;
}

.claim-item-icon {
  font-size: 40rpx;
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(251, 191, 36, 0.1);
  border-radius: $radius-lg;
  flex-shrink: 0;
}

.claim-item-detail {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.claim-item-name {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
}

.claim-item-qty {
  font-size: 24rpx;
  color: #D97706;
  font-weight: 700;
}

.claim-item-prompt {
  display: block;
  font-size: 24rpx;
  color: $text-secondary;
  font-style: italic;
  line-height: 1.5;
  margin-bottom: 12rpx;
  padding-left: 72rpx;
}

.claim-item-actions {
  display: flex;
  gap: 16rpx;
  padding-left: 72rpx;
}

.claim-btn {
  padding: 10rpx 32rpx !important;
  font-size: 24rpx !important;
  font-weight: 600 !important;
  color: white !important;
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%) !important;
  border-radius: $radius-lg !important;
  border: none !important;
  line-height: 1.4 !important;
  min-height: 0 !important;
  
  &:active {
    transform: scale(0.96);
    opacity: 0.9;
  }
}

.skip-btn {
  padding: 10rpx 24rpx !important;
  font-size: 24rpx !important;
  font-weight: 500 !important;
  color: $text-tertiary !important;
  background: $gray-100 !important;
  border-radius: $radius-lg !important;
  border: none !important;
  line-height: 1.4 !important;
  min-height: 0 !important;
}

.claimed-text {
  font-size: 24rpx;
  color: #059669;
  font-weight: 600;
}

// ========== Influencer 系统样式 ==========
// ==================== 已关注玩家提示条 ====================
.followed-hint-bar {
  margin-bottom: 16rpx;
  padding: 12rpx 16rpx;
  background: rgba(59, 130, 246, 0.05);
  border-radius: $radius-lg;
  border: 2rpx solid rgba(59, 130, 246, 0.12);
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.followed-hint-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.fh-avatar {
  font-size: 24rpx;
  flex-shrink: 0;
}

.fh-text {
  font-size: 22rpx;
  color: $text-secondary;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// ========== 多倍下注系统 ==========
.option-item.bet-boosted {
  border-color: #f59e0b;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(245, 158, 11, 0.02));
  box-shadow: 0 0 12rpx rgba(245, 158, 11, 0.2);
  animation: bet-glow 2s ease-in-out infinite alternate;
}

@keyframes bet-glow {
  0% { box-shadow: 0 0 8rpx rgba(245, 158, 11, 0.15); }
  100% { box-shadow: 0 0 16rpx rgba(245, 158, 11, 0.3); }
}

// 下注提示栏
.bet-hint-bar {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 16rpx;
  margin-bottom: 16rpx;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(239, 68, 68, 0.05));
  border-radius: $radius-lg;
  border: 1rpx solid rgba(245, 158, 11, 0.2);
  animation: hint-slide-in 0.3s ease-out;
}

@keyframes hint-slide-in {
  from { opacity: 0; transform: translateY(-10rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.bet-hint-icon {
  font-size: 24rpx;
  flex-shrink: 0;
}

.bet-hint-text {
  font-size: 22rpx;
  color: #92400e;
  font-weight: 500;
  flex: 1;
}

.bet-hint-total {
  font-size: 22rpx;
  color: #d97706;
  font-weight: 700;
  white-space: nowrap;
}

// 选项消耗行
.option-cost-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8rpx;
}

.cost-multiplier-badge {
  display: inline-flex;
  align-items: center;
  padding: 2rpx 10rpx;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  font-size: 18rpx;
  font-weight: 700;
  border-radius: $radius-full;
  animation: badge-pop 0.3s ease;
}

@keyframes badge-pop {
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

.cant-afford-hint {
  font-size: 20rpx;
  color: #ef4444;
  font-weight: 600;
  white-space: nowrap;
}

.bet-selector {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12rpx;
  margin-top: 12rpx;
  padding-top: 10rpx;
  border-top: 1rpx solid rgba(0, 0, 0, 0.04);
}

.bet-label {
  font-size: 20rpx;
  color: $text-tertiary;
  font-weight: 500;
  letter-spacing: 1rpx;
}

.bet-chips {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.bet-chip {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 64rpx;
  height: 44rpx;
  padding: 0 14rpx;
  border-radius: 22rpx;
  border: 2rpx solid #e5e7eb;
  background: #f9fafb;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  
  &.active {
    border-color: #f59e0b;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    box-shadow: 0 2rpx 12rpx rgba(245, 158, 11, 0.4);
    transform: scale(1.08);
    
    .bet-chip-text {
      color: white;
      font-weight: 700;
    }
  }
  
  &.active.is-boost {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    border-color: #ef4444;
    box-shadow: 0 2rpx 12rpx rgba(239, 68, 68, 0.4);
  }
  
  &.cant-afford {
    opacity: 0.3;
    pointer-events: none;
    filter: grayscale(1);
  }
  
  &:active:not(.cant-afford) {
    transform: scale(0.92);
  }
}

.bet-chip-text {
  font-size: 22rpx;
  color: #6b7280;
  font-weight: 500;
}

.cost-multiplier {
  font-size: 20rpx;
  color: #f59e0b;
  font-weight: 600;
}

.bet-boost-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 16rpx;
  padding: 12rpx 16rpx;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(245, 158, 11, 0.04));
  border-radius: 12rpx;
  border: 1rpx solid rgba(245, 158, 11, 0.3);
  animation: boost-info-in 0.4s ease;
}

@keyframes boost-info-in {
  from { opacity: 0; transform: translateY(10rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.bet-boost-badge {
  font-size: 24rpx;
  font-weight: 700;
  color: #d97706;
  white-space: nowrap;
}

.bet-boost-desc {
  font-size: 22rpx;
  color: #92400e;
}

// ==================== “与玩家相遇”偶发子事件 ====================
.encounter-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;
  position: relative;
  animation: encounter-fade-in 0.6s ease-out;
}

@keyframes encounter-fade-in {
  0% { opacity: 0; transform: scale(0.92) translateY(20rpx); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

// 氛围背景
.encounter-atmosphere {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 280rpx;
  overflow: hidden;
  border-radius: $radius-xl;
  pointer-events: none;
}

.encounter-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300rpx;
  height: 300rpx;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%);
  animation: enc-glow-pulse 3s ease-in-out infinite alternate;
}

@keyframes enc-glow-pulse {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
}

.encounter-particles {
  position: absolute;
  inset: 0;
}

.enc-particle {
  position: absolute;
  width: 6rpx;
  height: 6rpx;
  background: #f59e0b;
  border-radius: 50%;
  opacity: 0;
  animation: enc-float 4s ease-in-out infinite;
}

.ep-1 { top: 20%; left: 15%; animation-delay: 0s; }
.ep-2 { top: 40%; left: 75%; animation-delay: 0.8s; }
.ep-3 { top: 60%; left: 30%; animation-delay: 1.6s; }
.ep-4 { top: 25%; left: 60%; animation-delay: 2.4s; }
.ep-5 { top: 70%; left: 80%; animation-delay: 0.4s; }
.ep-6 { top: 50%; left: 45%; animation-delay: 1.2s; }

@keyframes enc-float {
  0%, 100% { opacity: 0; transform: translateY(0) scale(0.5); }
  50% { opacity: 0.8; transform: translateY(-30rpx) scale(1); }
}

// 标题
.encounter-title-row {
  margin-bottom: 24rpx;
  position: relative;
  z-index: 1;
}

.encounter-label {
  font-size: 30rpx;
  font-weight: 700;
  color: #b45309;
  letter-spacing: 4rpx;
}

// 玩家信息
.encounter-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 24rpx;
  position: relative;
  z-index: 1;
}

.encounter-avatar-ring {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6rpx;
  box-shadow: 0 8rpx 32rpx rgba(245, 158, 11, 0.3);
  animation: enc-ring-glow 2s ease-in-out infinite alternate;
}

@keyframes enc-ring-glow {
  0% { box-shadow: 0 8rpx 24rpx rgba(245, 158, 11, 0.2); }
  100% { box-shadow: 0 8rpx 40rpx rgba(245, 158, 11, 0.45); }
}

.encounter-avatar {
  font-size: 64rpx;
  width: 108rpx;
  height: 108rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $white;
  border-radius: 50%;
}

.encounter-name {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
}

.encounter-percent-row {
  display: flex;
  align-items: center;
}

.encounter-percent {
  font-size: 24rpx;
  font-weight: 700;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  padding: 4rpx 20rpx;
  border-radius: 24rpx;
}

.encounter-bio {
  font-size: 24rpx;
  color: $text-secondary;
  text-align: center;
  max-width: 480rpx;
  line-height: 1.5;
}

// 标签
.encounter-tags {
  display: flex;
  justify-content: center;
  gap: 12rpx;
  flex-wrap: wrap;
  margin-bottom: 24rpx;
  position: relative;
  z-index: 1;
}

.enc-tag {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 6rpx 16rpx;
  background: $gray-100;
  border-radius: 20rpx;
}

.enc-tag-icon {
  font-size: 22rpx;
}

.enc-tag-name {
  font-size: 22rpx;
  color: $text-secondary;
  font-weight: 500;
}

// 历史选择
.encounter-history {
  width: 100%;
  margin-bottom: 28rpx;
  position: relative;
  z-index: 1;
}

.encounter-history-title {
  font-size: 24rpx;
  font-weight: 600;
  color: $text-primary;
  display: block;
  margin-bottom: 14rpx;
}

.encounter-choices {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.enc-choice-item {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  padding: 14rpx 18rpx;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(245, 158, 11, 0.01));
  border-radius: $radius-lg;
  border-left: 4rpx solid rgba(245, 158, 11, 0.4);
}

.enc-choice-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #f59e0b;
  margin-top: 10rpx;
  flex-shrink: 0;
}

.enc-choice-content {
  flex: 1;
  min-width: 0;
}

.enc-choice-text {
  font-size: 24rpx;
  font-weight: 500;
  color: $text-primary;
  display: block;
  line-height: 1.5;
}

.enc-choice-result {
  font-size: 22rpx;
  color: $text-tertiary;
  display: block;
  margin-top: 4rpx;
  line-height: 1.4;
}

.enc-no-history {
  font-size: 24rpx;
  color: $text-tertiary;
  text-align: center;
  padding: 24rpx 0;
  font-style: italic;
}

// 操作按钮
.encounter-actions {
  display: flex;
  gap: 20rpx;
  width: 100%;
  position: relative;
  z-index: 1;
}

.encounter-follow-btn {
  flex: 1;
  padding: 18rpx 0 !important;
  font-size: 28rpx !important;
  font-weight: 700 !important;
  color: $white !important;
  background: linear-gradient(135deg, #f59e0b, #ef4444) !important;
  border: none !important;
  border-radius: $radius-xl !important;
  line-height: 1.4 !important;
  min-height: 0 !important;
  box-shadow: 0 6rpx 20rpx rgba(245, 158, 11, 0.3);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.96);
    box-shadow: 0 2rpx 10rpx rgba(245, 158, 11, 0.2);
  }
}

.encounter-skip-btn {
  flex: 1;
  padding: 18rpx 0 !important;
  font-size: 28rpx !important;
  font-weight: 600 !important;
  color: $text-tertiary !important;
  background: $gray-100 !important;
  border: 2rpx solid rgba(0, 0, 0, 0.06) !important;
  border-radius: $radius-xl !important;
  line-height: 1.4 !important;
  min-height: 0 !important;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.96);
    background: $gray-200 !important;
  }
}

// ========== 概率掉落物品展示 ==========
.item-drops-panel {
  margin-top: 20rpx;
  padding: 20rpx;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(234, 88, 12, 0.06));
  border-radius: $radius-lg;
  border: 2rpx solid rgba(245, 158, 11, 0.2);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.06) 0%, transparent 60%);
    animation: shimmer 3s ease-in-out infinite;
  }
}

@keyframes shimmer {
  0%, 100% { transform: translate(0, 0); opacity: 0.5; }
  50% { transform: translate(10%, 10%); opacity: 1; }
}

.drops-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
  position: relative;
  z-index: 1;
}

.drops-sparkle {
  font-size: 24rpx;
  animation: sparkle-pulse 1.5s ease-in-out infinite;
}

@keyframes sparkle-pulse {
  0%, 100% { opacity: 0.6; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.2); }
}

.drops-title {
  font-size: 26rpx;
  font-weight: 700;
  color: #d97706;
  letter-spacing: 2rpx;
}

.drops-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  position: relative;
  z-index: 1;
}

.drop-item {
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 14rpx 18rpx;
  background: rgba(255, 255, 255, 0.85);
  border-radius: $radius-md;
  border: 2rpx solid rgba(245, 158, 11, 0.15);
  position: relative;
  overflow: hidden;
  animation: drop-slide-in 0.5s ease-out backwards;
  
  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.3s; }
  &:nth-child(3) { animation-delay: 0.5s; }
}

@keyframes drop-slide-in {
  from {
    opacity: 0;
    transform: translateY(20rpx) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.drop-item-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.08), transparent);
  animation: glow-sweep 2s ease-in-out infinite;
}

@keyframes glow-sweep {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.drop-item-icon {
  font-size: 36rpx;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.drop-item-info {
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: 8rpx;
  position: relative;
  z-index: 1;
}

.drop-item-name {
  font-size: 26rpx;
  font-weight: 600;
  color: $text-primary;
}

.drop-item-qty {
  font-size: 22rpx;
  color: $text-secondary;
}

.drop-item-badge {
  font-size: 18rpx;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  letter-spacing: 1rpx;
  position: relative;
  z-index: 1;
  animation: badge-pulse 2s ease-in-out infinite;
}

@keyframes badge-pulse {
  0%, 100% { opacity: 0.9; }
  50% { opacity: 1; transform: scale(1.05); }
}

.no-drops-hint {
  margin-top: 16rpx;
  padding: 14rpx 20rpx;
  background: rgba(0, 0, 0, 0.02);
  border-radius: $radius-md;
  text-align: center;
}

.no-drops-text {
  font-size: 24rpx;
  color: $text-tertiary;
  font-style: italic;
}
</style>
