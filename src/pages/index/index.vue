<template>
  <view class="index-container">
    <!-- 动态渐变背景 -->
    <canvas class="dynamic-bg-canvas" id="dynamicBgCanvas" canvas-id="dynamicBgCanvas" />
    <!-- 顶部状态栏 - Smooth Corner 风格 -->
    <view class="status-bar">
      <!-- 左侧：Logo 胶囊 -->
      <view class="bar-capsule logo-capsule">
        <image class="logo-image" src="/static/brand/lifeline_logo.png" mode="heightFix" />
      </view>
      
      <!-- 中间：世界线切换 -->
      <view class="bar-capsule world-capsule">
        <WorldTrackSwitch />
      </view>
      
      <!-- 右侧：资源胶囊 -->
      <view class="bar-capsule resource-capsule" v-if="!isChainWorld">
        <view class="resource-item">
          <text class="resource-icon">⏱</text>
          <text class="resource-value">{{ formatNum(userStore.wallet.time) }}</text>
        </view>
        <view class="resource-divider"></view>
        <view class="resource-item">
          <text class="resource-icon">⚡</text>
          <text class="resource-value">{{ formatNum(userStore.wallet.energy) }}</text>
        </view>
      </view>
      <view class="bar-capsule resource-capsule" v-if="isChainWorld">
        <view class="resource-item">
          <text class="resource-icon">🦋</text>
          <text class="resource-value">{{ chainWallet.bfc }}</text>
        </view>
        <view class="resource-divider"></view>
        <view class="resource-item">
          <text class="resource-icon">🗳️</text>
          <text class="resource-value">{{ chainWallet.gov }}</text>
        </view>
      </view>
      
      <!-- 头像胶囊 -->
      <view class="bar-capsule avatar-capsule" @click="goToProfile">
        <view class="avatar-ring">
          <view class="user-avatar">
            <text class="avatar-text">{{ userInitial }}</text>
          </view>
        </view>
        <view class="level-badge">
          <text class="level-text">L{{ userStore.currentUser.clearanceLevel }}</text>
        </view>
      </view>
      
      <!-- 通知胶囊 -->
      <view class="bar-capsule notify-capsule">
        <text class="bell-icon">🔔</text>
        <view class="bell-dot"></view>
      </view>
    </view>
    
    <!-- 卡片流区域 - flex:1 自动填充剩余空间 -->
    <view class="card-area">
      <swiper 
        class="card-swiper"
        :current="cardStore.currentIndex"
        vertical
        circular
        :duration="300"
        :disable-touch="isPanelOpen"
        :easing-function="'default'"
        @change="onSwiperChange"
        @transition="onSwiperTransition"
        @animationfinish="onSwiperAnimationFinish"
      >
        <swiper-item 
          v-for="(card, index) in cardStore.cardQueue" 
          :key="card.id"
          class="swiper-item"
        >
          <view class="card-wrapper" @click="onCardBodyTap(card)">
            <SwipeableCard
              :ref="(el: any) => setSwipeableCardRef(index, el)"
              :disabled="isCardActive"
            >
              <EventCard 
                v-if="card.type === 'event'" 
                :ref="(el: any) => setCardComponentRef(index, el)"
                :event="card.data as GameEvent"
                @stateChange="onEventStateChange"
              />
              <ItemCard 
                v-else-if="card.type === 'item'" 
                :ref="(el: any) => setCardComponentRef(index, el)"
                :item="card.data as Item"
              />
              <UserCard 
                v-else-if="card.type === 'user'" 
                :ref="(el: any) => setCardComponentRef(index, el)"
                :user="card.data as User"
                @follow="onUserFollow"
              />
            </SwipeableCard>
          </view>
        </swiper-item>
      </swiper>
    </view>
    
    <!-- 卡片下方操作栏（独立于 swiper 外部，滑动时隐藏） -->
    <view class="card-actions-bar" :class="{ hidden: isSwiping }" v-if="currentCard">
      
      <!-- ===== EventCard 操作按钮 ===== -->
      <template v-if="currentCard.type === 'event' && currentCardComponent">
        <!-- preview 模式 -->
        <template v-if="currentCardComponent.mode === 'preview'">
          <!-- 已完成 -->
          <view class="main-action-btn" @click="currentCardComponent.handleViewHistory()" v-if="currentCardComponent.isEventCompleted">
            <text class="main-action-icon">📜</text>
            <text class="main-action-text">查看历史抉择</text>
          </view>
          <!-- 进行中 -->
          <view class="main-action-btn" @click="currentCardComponent.handleContinueEvent()" v-else-if="currentCardComponent.isEventInProgress">
            <text class="main-action-icon">▶️</text>
            <text class="main-action-text">继续事件</text>
          </view>
          <!-- 未参与 -->
          <view class="main-action-btn" 
            :class="{ disabled: !currentCardComponent.canJoin || !currentCardComponent.canAffordCurrent }"
            @click="currentCardComponent.handleTapJoin()" 
            v-else
          >
            <template v-if="currentCardComponent.hasEntryFee && currentCardComponent.multiplier > 0">
              <text class="main-action-icon">×{{ currentCardComponent.multiplier }}</text>
              <text class="main-action-text">倍投入 {{ currentCardComponent.costSummary }}</text>
            </template>
            <template v-else>
              <text class="main-action-icon">🎮</text>
              <text class="main-action-text">参与事件</text>
            </template>
            <!-- 倒计时进度条 -->
            <view class="action-timer-bar" v-if="currentCardComponent.isCountingDown">
              <view class="timer-fill" :style="{ width: currentCardComponent.timerProgress + '%' }" />
            </view>
          </view>
        </template>
        <!-- encounter 模式 -->
        <template v-else-if="currentCardComponent.mode === 'encounter'">
          <view class="main-action-btn" @click="currentCardComponent.handleEncounterFollow()">
            <text class="main-action-icon">👋</text>
            <text class="main-action-text">关注 TA</text>
          </view>
          <view class="secondary-action-btn" @click="currentCardComponent.handleEncounterSkip()">
            <text class="secondary-action-text">下次再说</text>
          </view>
        </template>
        <!-- result 模式 -->
        <template v-else-if="currentCardComponent.mode === 'result'">
          <view class="main-action-btn" 
            :class="{ disabled: currentCardComponent.hasRequiredUnclaimedItems }"
            @click="currentCardComponent.handleContinue()"
          >
            <text class="main-action-icon">{{ currentCardComponent.hasNextStage ? '▶️' : '✅' }}</text>
            <text class="main-action-text">{{ currentCardComponent.hasRequiredUnclaimedItems ? '请先领取必须物品' : (currentCardComponent.hasNextStage ? '继续' : '完成') }}</text>
          </view>
        </template>
        <!-- playing 模式：外部选项列表 + 倒计时状态栏 -->
        <template v-else-if="currentCardComponent.mode === 'playing'">
          <!-- 选项列表（卡片外部） -->
          <view class="external-choices-area">
            <view 
              v-for="choice in currentCardComponent.visibleChoices" 
              :key="choice.id"
              class="ext-choice-item"
              :class="{ 
                disabled: choice.hidden && !currentCardComponent.isChoiceUnlocked(choice),
                'is-selected': currentCardComponent.selectedChoiceId === choice.id,
                'is-not-selected': currentCardComponent.selectedChoiceId && currentCardComponent.selectedChoiceId !== choice.id,
                'cant-afford': currentCardComponent.selectedChoiceId === choice.id && !currentCardComponent.canAffordSelectedMultiplier
              }"
              @click="currentCardComponent.handleChoiceTap(choice)"
            >
              <view class="ext-choice-main">
                <text class="ext-choice-text">{{ choice.text }}</text>
                <!-- 选中状态：倍数 + 消耗 -->
                <view class="ext-choice-selected-info" v-if="currentCardComponent.selectedChoiceId === choice.id">
                  <view class="ext-multiplier-badge">
                    <text class="ext-mult-text">{{ currentCardComponent.selectedMultiplier }}×</text>
                  </view>
                  <view class="ext-cost-tags" v-if="currentCardComponent.selectedCost">
                    <text v-if="currentCardComponent.selectedCost.time" class="ext-cost-tag time">⏰{{ currentCardComponent.selectedCost.time }}</text>
                    <text v-if="currentCardComponent.selectedCost.energy" class="ext-cost-tag energy">⚡{{ currentCardComponent.selectedCost.energy }}</text>
                  </view>
                  <text class="ext-tap-hint" v-if="currentCardComponent.canAffordNextMultiplier">点击 +1×</text>
                  <text class="ext-max-hint" v-else>已达上限</text>
                </view>
                <!-- 未选中状态：基础消耗 -->
                <view class="ext-choice-cost" v-else-if="currentCardComponent.getChoiceBaseCost(choice)">
                  <text v-if="currentCardComponent.getChoiceBaseCost(choice).time" class="ext-cost-tag time">⏰{{ currentCardComponent.getChoiceBaseCost(choice).time }}</text>
                  <text v-if="currentCardComponent.getChoiceBaseCost(choice).energy" class="ext-cost-tag energy">⚡{{ currentCardComponent.getChoiceBaseCost(choice).energy }}</text>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 倒计时状态栏 -->
          <view class="main-action-btn choice-countdown-status" 
            :class="{ 
              disabled: !currentCardComponent.selectedChoiceId,
              'has-selection': !!currentCardComponent.selectedChoiceId,
              'is-counting': currentCardComponent.isChoiceCountingDown
            }"
          >
            <template v-if="currentCardComponent.selectedChoiceId && currentCardComponent.isChoiceCountingDown">
              <text class="main-action-icon">{{ currentCardComponent.selectedMultiplier > 1 ? '🔥' : '⏳' }}</text>
              <text class="main-action-text">{{ currentCardComponent.selectedMultiplier }}× 投入中...</text>
            </template>
            <template v-else-if="currentCardComponent.selectedChoiceId">
              <text class="main-action-icon">✅</text>
              <text class="main-action-text">{{ currentCardComponent.selectedMultiplier }}× 已选择</text>
            </template>
            <template v-else>
              <text class="main-action-icon">👆</text>
              <text class="main-action-text">选择一个选项</text>
            </template>
            <!-- 底部进度条 -->
            <view class="action-timer-bar" v-if="currentCardComponent.isChoiceCountingDown">
              <view class="timer-fill" :style="{ width: currentCardComponent.choiceTimerProgress + '%' }" />
            </view>
          </view>
        </template>
      </template>
      
      <!-- ===== ItemCard 操作按钮 ===== -->
      <template v-else-if="currentCard.type === 'item' && currentCardComponent">
        <view class="main-action-btn" 
          :class="{ 
            disabled: !currentCardComponent.canBuy,
            'just-bought': currentCardComponent.justBought
          }"
          @click="currentCardComponent.onBuy()"
        >
          <text class="main-action-icon" v-if="currentCardComponent.justBought">✓</text>
          <text class="main-action-icon" v-else>🛒</text>
          <text class="main-action-text" v-if="currentCardComponent.justBought">已买入</text>
          <text class="main-action-text" v-else-if="!currentCardComponent.canBuy">{{ currentCardComponent.buyDisabledReason || '余额不足' }}</text>
          <text class="main-action-text" v-else>买入</text>
        </view>
      </template>
      
      <!-- ===== UserCard 操作按钮 ===== -->
      <template v-else-if="currentCard.type === 'user' && currentCardComponent">
        <view class="main-action-btn" 
          :class="{ 'is-followed': currentCardComponent.isFollowed }"
          @click="currentCardComponent.handlePrimaryAction()"
        >
          <text class="main-action-icon">{{ currentCardComponent.isFollowed ? '✓' : '👋' }}</text>
          <text class="main-action-text">{{ currentCardComponent.isFollowed ? '已关注' : '关注' }}</text>
        </view>
      </template>
      
      <!-- 详情按钮 -->
      <view class="footer-icon-btn" @click="openDetailSheet(currentCard)">
        <text class="footer-icon">📋</text>
      </view>
      <!-- 更多操作按钮 -->
      <view class="footer-icon-btn" @click="openActionsSheet(currentCard)">
        <text class="footer-icon">⚙️</text>
      </view>
    </view>
    
    <!-- 加载状态 -->
    <view v-if="cardStore.isLoading" class="loading-overlay">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>
    
    <!-- ====== 页面级底部弹出面板（详情） ====== -->
    <view class="bottom-sheet" :class="{ visible: showDetailSheet }" @click.self="closeDetailSheet">
      <view class="sheet-content" :class="{ visible: showDetailSheet }">
        <view class="sheet-handle" @click="closeDetailSheet">
          <view class="handle-bar"></view>
        </view>
        <view class="sheet-header">
          <text class="sheet-title">📋 详细信息</text>
          <text class="sheet-close" @click="closeDetailSheet">✕</text>
        </view>
        <scroll-view class="sheet-body" scroll-y v-if="activeSheetCard">
                <!-- 事件详情 -->
                <view v-if="activeSheetCard.type === 'event'" class="detail-content">
                  <!-- 已参与状态提示 -->
                  <view class="detail-section owned-notice" v-if="eventStore.isEventCompleted((activeSheetCard.data as GameEvent).id)">
                    <view class="owned-notice-box" style="border-color: #059669; background: #ecfdf5;">
                      <text class="owned-notice-icon">✅</text>
                      <view class="owned-notice-info">
                        <text class="owned-notice-title" style="color: #059669;">你已完成此事件</text>
                        <text class="owned-notice-desc">可前往世界线页面查看完整历史抉择</text>
                      </view>
                    </view>
                  </view>
                  <view class="detail-section owned-notice" v-else-if="eventStore.isEventActive((activeSheetCard.data as GameEvent).id)">
                    <view class="owned-notice-box" style="border-color: #d97706; background: #fffbeb;">
                      <text class="owned-notice-icon">⏳</text>
                      <view class="owned-notice-info">
                        <text class="owned-notice-title" style="color: #d97706;">事件进行中</text>
                        <text class="owned-notice-desc">你已开始参与此事件，可继续探索</text>
                      </view>
                    </view>
                  </view>
                  <view class="detail-section">
                    <text class="section-title">📖 事件简介</text>
                    <text class="section-text">{{ (activeSheetCard.data as GameEvent).description }}</text>
                  </view>
                  <view class="detail-section">
                    <text class="section-title">📊 事件信息</text>
                    <view class="info-grid">
                      <view class="info-item">
                        <text class="info-label">类型</text>
                        <text class="info-value">{{ getEventTypeLabel((activeSheetCard.data as GameEvent).type) }}</text>
                      </view>
                      <view class="info-item">
                        <text class="info-label">参与人数</text>
                        <text class="info-value">{{ (activeSheetCard.data as GameEvent).participantCount?.toLocaleString() || 0 }}</text>
                      </view>
                      <view class="info-item">
                        <text class="info-label">阶段数</text>
                        <text class="info-value">{{ (activeSheetCard.data as GameEvent).stages?.length || 0 }}</text>
                      </view>
                      <view class="info-item">
                        <text class="info-label">状态</text>
                        <text class="info-value">{{ getEventStatusLabel((activeSheetCard.data as GameEvent).status) }}</text>
                      </view>
                    </view>
                  </view>
                  <view class="detail-section" v-if="(activeSheetCard.data as GameEvent).entryFee">
                    <text class="section-title">💰 入场成本</text>
                    <view class="cost-list">
                      <view class="cost-item" v-if="(activeSheetCard.data as GameEvent).entryFee?.time">
                        <text class="cost-icon">⏰</text>
                        <text class="cost-value">{{ (activeSheetCard.data as GameEvent).entryFee?.time }} 分钟</text>
                      </view>
                      <view class="cost-item" v-if="(activeSheetCard.data as GameEvent).entryFee?.energy">
                        <text class="cost-icon">⚡</text>
                        <text class="cost-value">{{ (activeSheetCard.data as GameEvent).entryFee?.energy }} 精力</text>
                      </view>
                    </view>
                  </view>
                  <view class="detail-section" v-if="(activeSheetCard.data as GameEvent).requirements?.tags?.length">
                    <text class="section-title">🏷️ 需要标签</text>
                    <view class="tag-list">
                      <view class="tag-item" v-for="tag in (activeSheetCard.data as GameEvent).requirements.tags" :key="tag">
                        {{ tag }}
                      </view>
                    </view>
                  </view>
                </view>
                
                <!-- 物品详情 -->
                <view v-else-if="activeSheetCard.type === 'item'" class="detail-content">
                  <!-- 已购入提示 -->
                  <view class="detail-section owned-notice" v-if="isItemOwned(activeSheetCard.data as Item)">
                    <view class="owned-notice-box">
                      <text class="owned-notice-icon">✅</text>
                      <view class="owned-notice-info">
                        <text class="owned-notice-title">你已拥有此物品</text>
                        <text class="owned-notice-desc">持有 {{ getItemOwnedCount(activeSheetCard.data as Item) }} 件</text>
                      </view>
                    </view>
                  </view>
                  <view class="detail-section">
                    <text class="section-title">📦 物品简介</text>
                    <text class="section-text">{{ (activeSheetCard.data as Item).description }}</text>
                  </view>
                  <view class="detail-section">
                    <text class="section-title">📊 物品信息</text>
                    <view class="info-grid">
                      <view class="info-item">
                        <text class="info-label">稀有度</text>
                        <text class="info-value">{{ getRarityLabel((activeSheetCard.data as Item).rarity) }}</text>
                      </view>
                      <view class="info-item">
                        <text class="info-label">已铸造</text>
                        <text class="info-value">{{ (activeSheetCard.data as Item).mintedCount }} / {{ (activeSheetCard.data as Item).maxMint }}</text>
                      </view>
                    </view>
                  </view>
                  <view class="detail-section" v-if="(activeSheetCard.data as Item).effects?.length">
                    <text class="section-title">✨ 物品效果</text>
                    <view class="effect-list">
                      <view class="effect-item" v-for="(effect, idx) in (activeSheetCard.data as Item).effects" :key="idx">
                        <text class="effect-type">{{ effect.description || effect.type }}</text>
                        <text class="effect-value" v-if="effect.value">+{{ effect.value }}</text>
                      </view>
                    </view>
                  </view>
                </view>
                
                <!-- 用户详情 -->
                <view v-else-if="activeSheetCard.type === 'user'" class="detail-content">
                  <!-- 座右铭 -->
                  <view class="detail-section" v-if="(activeSheetCard.data as User).motto">
                    <view class="detail-motto-card">
                      <text class="detail-motto-mark">“</text>
                      <text class="detail-motto-text">{{ (activeSheetCard.data as User).motto }}</text>
                      <text class="detail-motto-mark end">”</text>
                    </view>
                  </view>
                  
                  <view class="detail-section">
                    <text class="section-title">👤 关于 TA</text>
                    <text class="section-text">{{ (activeSheetCard.data as User).bio || '这个人很懒，什么都没写~' }}</text>
                  </view>
                  
                  <!-- 资源概览 -->
                  <view class="detail-section">
                    <text class="section-title">💰 资源概览</text>
                    <view class="resource-grid">
                      <view class="resource-item">
                        <text class="resource-icon">⏰</text>
                        <view class="resource-info">
                          <text class="resource-value">{{ (activeSheetCard.data as User).wallet?.time || 0 }}</text>
                          <text class="resource-label">时间</text>
                        </view>
                      </view>
                      <view class="resource-item">
                        <text class="resource-icon">⚡</text>
                        <view class="resource-info">
                          <text class="resource-value">{{ (activeSheetCard.data as User).wallet?.energy || 0 }}</text>
                          <text class="resource-label">精力</text>
                        </view>
                      </view>
                      <view class="resource-item">
                        <text class="resource-icon">🌟</text>
                        <view class="resource-info">
                          <text class="resource-value">{{ (activeSheetCard.data as User).wallet?.reputation || 0 }}</text>
                          <text class="resource-label">声望</text>
                        </view>
                      </view>
                    </view>
                  </view>
                  
                  <!-- 标签展示 - 带权重进度条 -->
                  <view class="detail-section" v-if="(activeSheetCard.data as User).tags?.length">
                    <text class="section-title">🏷️ TA 的标签</text>
                    <view class="user-tag-list">
                      <view 
                        class="user-tag-item" 
                        v-for="(tag, idx) in (activeSheetCard.data as User).tags" 
                        :key="tag.tagId"
                      >
                        <view class="tag-icon-wrap" :class="'tag-bg-' + (idx % 5)">
                          <text class="tag-icon">{{ getTagIcon(tag.tagId) }}</text>
                        </view>
                        <view class="tag-info">
                          <view class="tag-name-row">
                            <text class="tag-name">{{ getTagName(tag.tagId) }}</text>
                            <text class="tag-weight">{{ tag.weight }}</text>
                          </view>
                          <view class="tag-bar">
                            <view class="tag-bar-fill" :class="'bar-color-' + (idx % 5)" :style="{ width: Math.min(tag.weight, 100) + '%' }" />
                          </view>
                        </view>
                      </view>
                    </view>
                  </view>
                  <view class="detail-section empty-tags" v-else>
                    <text class="section-title">🏷️ TA 的标签</text>
                    <text class="empty-text">还没有获得任何标签</text>
                  </view>
                  
                  <!-- 成就展示 -->
                  <view class="detail-section" v-if="(activeSheetCard.data as User).history?.achievements?.length">
                    <text class="section-title">🏆 成就徽章</text>
                    <view class="detail-achievement-grid">
                      <view class="detail-achievement-item" v-for="achId in (activeSheetCard.data as User).history.achievements" :key="achId">
                        <text class="detail-ach-icon">{{ getAchievementIcon(achId) }}</text>
                        <text class="detail-ach-name">{{ getAchievementName(achId) }}</text>
                      </view>
                    </view>
                  </view>
                  
                  <!-- 共同点 -->
                  <view class="detail-section" v-if="getCommonTags(activeSheetCard.data as User).length">
                    <text class="section-title">🤝 你们的共同点</text>
                    <view class="common-tag-list">
                      <view class="common-tag" v-for="tag in getCommonTags(activeSheetCard.data as User)" :key="tag">
                        {{ tag }}
                      </view>
                    </view>
                  </view>
                  
                  <!-- 生活记录 -->
                  <view class="detail-section">
                    <text class="section-title">📝 生活足迹</text>
                    <view class="life-stats">
                      <view class="stat-item">
                        <text class="stat-value">{{ (activeSheetCard.data as User).history?.completedEvents?.length || 0 }}</text>
                        <text class="stat-label">完成事件</text>
                      </view>
                      <view class="stat-item">
                        <text class="stat-value">{{ (activeSheetCard.data as User).history?.currentEvents?.length || 0 }}</text>
                        <text class="stat-label">进行中</text>
                      </view>
                      <view class="stat-item">
                        <text class="stat-value">{{ (activeSheetCard.data as User).inventory?.length || 0 }}</text>
                        <text class="stat-label">物品数</text>
                      </view>
                    </view>
                  </view>
                  
                  <!-- 历史选择记录 -->
                  <view class="detail-section" v-if="(activeSheetCard.data as User).history?.choiceHistory?.length">
                    <text class="section-title">📜 历史选择</text>
                    <view class="choice-timeline">
                      <view 
                        class="timeline-item" 
                        v-for="(ch, idx) in (activeSheetCard.data as User).history.choiceHistory.slice(-6).reverse()" 
                        :key="idx"
                      >
                        <view class="timeline-dot" :class="'dot-color-' + (idx % 3)" />
                        <view class="timeline-line" v-if="idx < Math.min((activeSheetCard.data as User).history.choiceHistory.length, 6) - 1" />
                        <view class="timeline-content">
                          <text class="timeline-choice">{{ ch.choiceId }}</text>
                          <text class="timeline-time" v-if="ch.timestamp">{{ formatChoiceTime(ch.timestamp) }}</text>
                        </view>
                      </view>
                    </view>
                  </view>
                  
                  <!-- 物品收藏 - 增强版，显示稀有度和图标 -->
                  <view class="detail-section" v-if="(activeSheetCard.data as User).inventory?.length">
                    <text class="section-title">🎒 物品收藏</text>
                    <view class="detail-inventory-list">
                      <view class="detail-inv-item" v-for="inv in (activeSheetCard.data as User).inventory.slice(0, 8)" :key="inv.itemId">
                        <text class="detail-inv-icon">{{ getItemIcon(inv.itemId) }}</text>
                        <view class="detail-inv-info">
                          <text class="detail-inv-name">{{ getItemName(inv.itemId) }}</text>
                          <text class="detail-inv-rarity" :class="'rarity-text-' + getItemRarity(inv.itemId)">{{ getRarityLabel(getItemRarity(inv.itemId)) }}</text>
                        </view>
                        <text class="detail-inv-qty" v-if="inv.quantity > 1">×{{ inv.quantity }}</text>
                      </view>
                    </view>
                  </view>
                  
                  <!-- 最近活跃 -->
                  <view class="detail-section">
                    <text class="section-title">⏰ 活跃状态</text>
                    <view class="activity-info">
                      <text class="activity-text">{{ getLastActiveText(activeSheetCard.data as User) }}</text>
                    </view>
                  </view>
                </view>
        </scroll-view>
      </view>
    </view>
    
    <!-- ====== 页面级底部弹出面板（操作） ====== -->
    <view class="bottom-sheet" :class="{ visible: showActionsSheet }" @click.self="closeActionsSheet">
      <view class="sheet-content" :class="{ visible: showActionsSheet }">
        <view class="sheet-handle" @click="closeActionsSheet">
          <view class="handle-bar"></view>
        </view>
        <view class="sheet-header">
          <text class="sheet-title">⚙️ 更多操作</text>
          <text class="sheet-close" @click="closeActionsSheet">✕</text>
        </view>
        <scroll-view class="sheet-body" scroll-y v-if="activeSheetCard">
                <view v-if="activeSheetCard.type === 'event'" class="action-list">
                  <!-- 已完成事件 -->
                  <template v-if="eventStore.isEventCompleted((activeSheetCard.data as GameEvent).id)">
                    <view class="action-item" @click="onCardAction(activeSheetCard, 'viewHistory')">
                      <text class="action-icon">📜</text>
                      <text class="action-text">查看历史抉择</text>
                    </view>
                    <view class="action-item" @click="onCardAction(activeSheetCard, 'replay')">
                      <text class="action-icon">🔄</text>
                      <text class="action-text">重新体验</text>
                    </view>
                  </template>
                  <!-- 进行中事件 -->
                  <template v-else-if="eventStore.isEventActive((activeSheetCard.data as GameEvent).id)">
                    <view class="action-item" @click="onCardAction(activeSheetCard, 'continue')">
                      <text class="action-icon">▶️</text>
                      <text class="action-text">继续事件</text>
                    </view>
                    <view class="action-item" @click="onCardAction(activeSheetCard, 'viewHistory')">
                      <text class="action-icon">📜</text>
                      <text class="action-text">查看已做抉择</text>
                    </view>
                  </template>
                  <!-- 未参与事件 -->
                  <template v-else>
                    <view class="action-item" @click="onCardAction(activeSheetCard, 'join')">
                      <text class="action-icon">🎯</text>
                      <text class="action-text">立即参与</text>
                    </view>
                  </template>
                  <view class="action-item" @click="onCardAction(activeSheetCard, 'save')">
                    <text class="action-icon">📌</text>
                    <text class="action-text">收藏事件</text>
                  </view>
                  <view class="action-item" @click="onCardAction(activeSheetCard, 'share')">
                    <text class="action-icon">📤</text>
                    <text class="action-text">分享给好友</text>
                  </view>
                  <view class="action-item danger" @click="onCardAction(activeSheetCard, 'report')">
                    <text class="action-icon">⚠️</text>
                    <text class="action-text">举报问题</text>
                  </view>
                </view>
                
                <view v-else-if="activeSheetCard.type === 'item'" class="action-list">
                  <view class="action-item" v-if="!isItemOwned(activeSheetCard.data as Item)" @click="onCardAction(activeSheetCard, 'buy')">
                    <text class="action-icon">🛒</text>
                    <text class="action-text">买入物品</text>
                  </view>
                  <view class="action-item owned-action-hint" v-else>
                    <text class="action-icon">✅</text>
                    <text class="action-text" style="color: #059669;">已拥有 {{ getItemOwnedCount(activeSheetCard.data as Item) }} 件</text>
                  </view>
                  <view class="action-item" @click="onCardAction(activeSheetCard, 'save')">
                    <text class="action-icon">📌</text>
                    <text class="action-text">收藏物品</text>
                  </view>
                  <view class="action-item" @click="onCardAction(activeSheetCard, 'share')">
                    <text class="action-icon">📤</text>
                    <text class="action-text">分享给好友</text>
                  </view>
                </view>
                
                <view v-else-if="activeSheetCard.type === 'user'" class="action-list">
                  <view class="action-item" @click="onCardAction(activeSheetCard, 'follow')">
                    <text class="action-icon">👋</text>
                    <text class="action-text">关注 TA</text>
                  </view>
                  <view class="action-item" @click="onCardAction(activeSheetCard, 'message')">
                    <text class="action-icon">💬</text>
                    <text class="action-text">发送消息</text>
                  </view>
                  <view class="action-item" @click="onCardAction(activeSheetCard, 'profile')">
                    <text class="action-icon">👤</text>
                    <text class="action-text">查看主页</text>
                  </view>
                  <view class="action-item danger" @click="onCardAction(activeSheetCard, 'block')">
                    <text class="action-icon">🚫</text>
                    <text class="action-text">屏蔽用户</text>
                  </view>
                </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useCardStore } from '@/stores/card'
import { useUserStore } from '@/stores/user'
import { useWorldStore } from '@/stores/world'
import { useEventStore } from '@/stores/event'
import { useItemStore } from '@/stores/item'
import WorldTrackSwitch from '@/components/WorldTrackSwitch.vue'
import SwipeableCard from '@/components/SwipeableCard.vue'
import EventCard from '@/components/EventCard.vue'
import ItemCard from '@/components/ItemCard.vue'
import UserCard from '@/components/UserCard.vue'
import type { GameEvent, Item, User, Card } from '@/types'
import {
  formatNumber, formatRelativeTime, formatChoiceTime,
  getTagName, getTagIcon, getRarityLabel,
  getEventTypeLabel, getEventStatusLabel,
  getAchievementIcon, getAchievementName
} from '@/utils/formatters'

const cardStore = useCardStore()
const userStore = useUserStore()
const worldStore = useWorldStore()
const eventStore = useEventStore()
const itemStore = useItemStore()

const isPanelOpen = ref(false)
const isCardActive = ref(false)
const isSwiping = ref(false)

// 当前显示的卡片
const currentCard = computed(() => {
  const queue = cardStore.cardQueue
  if (!queue || queue.length === 0) return null
  return queue[cardStore.currentIndex] || queue[0]
})

// 主操作按钮点击
const onPrimaryAction = () => {
  if (!currentCard.value) return
  onCardAction(currentCard.value, 'primary')
}


// SwipeableCard 实例引用
const swipeableCardRefs = ref<Record<number, any>>({})
const setSwipeableCardRef = (index: number, el: any) => {
  if (el) {
    swipeableCardRefs.value[index] = el
  } else {
    delete swipeableCardRefs.value[index]
  }
}

// 卡片组件实例引用（EventCard/ItemCard/UserCard）
const cardComponentRefs = ref<Record<number, any>>({})
const setCardComponentRef = (index: number, el: any) => {
  if (el) {
    cardComponentRefs.value[index] = el
  } else {
    delete cardComponentRefs.value[index]
  }
}

// 当前卡片组件实例
const currentCardComponent = computed(() => {
  return cardComponentRefs.value[cardStore.currentIndex] || null
})

// 通用工具函数已统一迁移到 @/utils/formatters.ts
const formatNum = formatNumber  // 别名兼容模板中的引用

// 链世界钱包
const chainWallet = computed(() => ({
  bfc: 1250,
  gov: 85
}))

// 是否在链世界
const isChainWorld = computed(() => worldStore.currentWorld === 'chain')

// 用户名首字母
const userInitial = computed(() => {
  const name = userStore.currentUser?.nickname || 'U'
  return name.charAt(0).toUpperCase()
})

// 获取共同标签
const getCommonTags = (user: User): string[] => {
  const myTags = userStore.currentUser?.tags?.map(t => t.tagId) || []
  const theirTags = user.tags?.map(t => t.tagId) || []
  return myTags.filter(tag => theirTags.includes(tag))
}

const getLastActiveText = (user: User): string => {
  return formatRelativeTime(user.lastActive)
}

// 物品信息辅助函数
const getItemIcon = (itemId: string): string => {
  const item = itemStore.getItemById(itemId)
  return item?.icon || '📦'
}

const getItemName = (itemId: string): string => {
  const item = itemStore.getItemById(itemId)
  return item?.name || itemId
}

const getItemRarity = (itemId: string): string => {
  const item = itemStore.getItemById(itemId)
  return item?.rarity || 'common'
}

// 物品拥有状态检查
const isItemOwned = (item: Item): boolean => {
  return userStore.hasItem(item.id)
}

const getItemOwnedCount = (item: Item): number => {
  const inv = userStore.inventory.find(i => i.itemId === item.id)
  return inv?.quantity ?? 0
}

// ====== 页面级底部弹出面板状态 ======
const showDetailSheet = ref(false)
const showActionsSheet = ref(false)
const activeSheetCard = ref<Card | null>(null)

// 类型安全的计算属性，避免模板中重复断言
const sheetEvent = computed(() => activeSheetCard.value?.type === 'event' ? activeSheetCard.value.data as GameEvent : null)
const sheetItem = computed(() => activeSheetCard.value?.type === 'item' ? activeSheetCard.value.data as Item : null)
const sheetUser = computed(() => activeSheetCard.value?.type === 'user' ? activeSheetCard.value.data as User : null)

/** 点击卡片体打开详情面板（排除滑动误触） */
const onCardBodyTap = (card: Card) => {
  // 滑动中不响应点击
  if (isSwiping.value) return
  // 已打开面板时不重复打开
  if (isPanelOpen.value) return
  openDetailSheet(card)
}

const openDetailSheet = (card: Card) => {
  activeSheetCard.value = card
  showDetailSheet.value = true
  showActionsSheet.value = false
  isPanelOpen.value = true
}

const openActionsSheet = (card: Card) => {
  activeSheetCard.value = card
  showActionsSheet.value = true
  showDetailSheet.value = false
  isPanelOpen.value = true
}

const closeDetailSheet = () => {
  showDetailSheet.value = false
  isPanelOpen.value = false
}

const closeActionsSheet = () => {
  showActionsSheet.value = false
  isPanelOpen.value = false
}

// 事件状态变化
const onEventStateChange = (state: string) => {
  isCardActive.value = state === 'playing' || state === 'result'
}


// Swiper切换
const onSwiperChange = (e: any) => {
  isSwiping.value = true
  cardStore.currentIndex = e.detail.current
}

// Swiper过渡
const onSwiperTransition = (e: any) => {
  isSwiping.value = true
}

// Swiper动画结束
const onSwiperAnimationFinish = (e: any) => {
  isSwiping.value = false
}


// 卡片操作
const onCardAction = (card: Card, action: string) => {
  switch (action) {
    case 'join':
      if (card.type === 'event') {
        uni.navigateTo({
          url: `/pages/event/play?id=${card.data.id}`
        })
      }
      break
    case 'save':
      uni.showToast({ title: '已收藏', icon: 'success' })
      break
    case 'share':
      uni.showToast({ title: '分享功能开发中', icon: 'none' })
      break
    case 'report':
      uni.showToast({ title: '举报已提交', icon: 'none' })
      break
    case 'viewHistory':
      uni.switchTab({ url: '/pages/worldline/worldline' })
      break
    case 'replay':
      uni.showToast({ title: '重新体验功能开发中', icon: 'none' })
      break
    case 'continue':
      uni.showToast({ title: '请点击卡片上的“继续事件”按钮', icon: 'none' })
      break
    case 'buy':
      uni.showToast({ title: '请点击卡片上的买入按钮', icon: 'none' })
      break
    case 'follow':
      uni.showToast({ title: '已关注', icon: 'success' })
      break
    case 'message':
      uni.showToast({ title: '消息功能开发中', icon: 'none' })
      break
    case 'profile':
      uni.showToast({ title: '主页功能开发中', icon: 'none' })
      break
    case 'block':
      uni.showToast({ title: '已屏蔽', icon: 'none' })
      break
  }
}

// 用户关注回调（UserCard 内部已处理 influencerStore 逻辑）
const onUserFollow = (_user: User) => {
  // UserCard 内部已处理，此处保留接口以便后续扩展
}

// 跳转到个人中心
const goToProfile = () => {
  uni.switchTab({
    url: '/pages/profile/profile'
  })
}

// ====== 动态渐变背景 ======
let bgAnimationId: number | null = null

const initDynamicBackground = () => {
  const uniCanvas = document.getElementById('dynamicBgCanvas')
  if (!uniCanvas) return
  const canvas = uniCanvas.querySelector('canvas') as HTMLCanvasElement
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  // 设置 canvas 尺寸
  const resize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)
  
  // 渐变光晕配置
  interface GlowOrb {
    x: number; y: number
    targetX: number; targetY: number
    radius: number
    color: [number, number, number]
    alpha: number
    speed: number
    phase: number
    pulseSpeed: number
  }
  
  const orbs: GlowOrb[] = [
    // 青色主光晕 - 左上
    { x: 0.15, y: 0.08, targetX: 0.25, targetY: 0.2, radius: 0.6, color: [0, 229, 255], alpha: 0.22, speed: 0.00008, phase: 0, pulseSpeed: 0.0006 },
    // 洋红光晕 - 右下
    { x: 0.85, y: 0.85, targetX: 0.7, targetY: 0.75, radius: 0.55, color: [224, 64, 251], alpha: 0.15, speed: 0.00006, phase: Math.PI * 0.7, pulseSpeed: 0.0005 },
    // 琥珀光晕 - 中间偏下
    { x: 0.5, y: 0.55, targetX: 0.45, targetY: 0.5, radius: 0.4, color: [255, 171, 0], alpha: 0.08, speed: 0.00005, phase: Math.PI * 1.3, pulseSpeed: 0.0004 },
    // 深蓝补光 - 右上
    { x: 0.8, y: 0.15, targetX: 0.75, targetY: 0.25, radius: 0.4, color: [68, 138, 255], alpha: 0.12, speed: 0.00007, phase: Math.PI * 0.4, pulseSpeed: 0.00045 },
    // 青色补光 - 底部
    { x: 0.3, y: 0.9, targetX: 0.4, targetY: 0.8, radius: 0.35, color: [0, 229, 255], alpha: 0.06, speed: 0.00004, phase: Math.PI * 1.8, pulseSpeed: 0.0003 },
  ]
  
  let time = 0
  
  const draw = () => {
    const w = canvas.width
    const h = canvas.height
    time++
    
    // 清除画布 - 深色基底
    ctx.fillStyle = '#0a0e1a'
    ctx.fillRect(0, 0, w, h)
    
    // 绘制每个光晕
    for (const orb of orbs) {
      // 缓慢移动轨迹 - 利萨如图形
      orb.phase += orb.speed
      const moveX = Math.sin(orb.phase * 2.3) * 0.08 + Math.cos(orb.phase * 1.7) * 0.05
      const moveY = Math.cos(orb.phase * 1.9) * 0.06 + Math.sin(orb.phase * 2.7) * 0.04
      const cx = (orb.x + moveX) * w
      const cy = (orb.y + moveY) * h
      
      // 呼吸脉冲
      const pulse = Math.sin(time * orb.pulseSpeed) * 0.3 + 0.7
      const currentAlpha = orb.alpha * pulse
      const currentRadius = orb.radius * (0.9 + pulse * 0.1) * Math.max(w, h)
      
      // 多层径向渐变
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, currentRadius)
      const [r, g, b] = orb.color
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${currentAlpha * 1.5})`)
      gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${currentAlpha * 0.8})`)
      gradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${currentAlpha * 0.3})`)
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, w, h)
    }
    
    // 添加微妙的暖色光带（地平线效果）
    const horizGrad = ctx.createLinearGradient(0, h * 0.65, 0, h * 0.85)
    horizGrad.addColorStop(0, 'rgba(255, 171, 0, 0)')
    horizGrad.addColorStop(0.5, 'rgba(255, 171, 0, 0.012)')
    horizGrad.addColorStop(1, 'rgba(255, 171, 0, 0)')
    ctx.fillStyle = horizGrad
    ctx.fillRect(0, 0, w, h)
    
    bgAnimationId = requestAnimationFrame(draw)
  }
  
  draw()
}

onMounted(async () => {
  // 初始化动态背景
  initDynamicBackground()
  
  // 先加载事件和物品数据，再初始化卡片队列
  await eventStore.loadEvents()
  await itemStore.loadItems()
  await cardStore.initCardQueue()
  // Card queue ready
})

onUnmounted(() => {
  if (bgAnimationId) {
    cancelAnimationFrame(bgAnimationId)
    bgAnimationId = null
  }
})
</script>

<style lang="scss" scoped>

// 移动端安全区域适配
$safe-area-top: env(safe-area-inset-top, 0px);
$safe-area-bottom: env(safe-area-inset-bottom, 0px);

.index-container {
  width: 100%;
  height: 100vh;
  background: $bg-deep;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  position: relative;
  
  // 背景由 canvas 动态渲染，不再使用静态图片
}

// 动态渐变背景 Canvas
.dynamic-bg-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

// ===== 顶部状态栏 - Smooth Corner Squircle 风格 =====
.status-bar {
  position: relative;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 14rpx 20rpx;
  padding-top: calc(14rpx + #{$safe-area-top});
  padding-bottom: 14rpx;
  flex-shrink: 0;
  max-width: 100%;
  box-sizing: border-box;
}

// 通用胶囊基类 - Smooth Corner Squircle
.bar-capsule {
  display: flex;
  align-items: center;
  justify-content: center;
  // 深色玻璃质感背景
  background: linear-gradient(
    160deg,
    rgba($bg-elevated, 0.92) 0%,
    rgba($bg-surface, 0.80) 100%
  );
  backdrop-filter: blur(48rpx) saturate(160%);
  -webkit-backdrop-filter: blur(48rpx) saturate(160%);
  // 微妙的双层边框效果
  border: 1rpx solid rgba(255, 255, 255, 0.10);
  // Smooth corner - squircle 风格
  @include smooth-corner(24rpx);
  // 多层阴影营造深度
  box-shadow:
    0 4rpx 16rpx rgba(0, 0, 0, 0.40),
    0 1rpx 4rpx rgba(0, 0, 0, 0.25),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.08),
    inset 0 -1rpx 0 rgba(0, 0, 0, 0.15);
  transition: all $transition-fast;
}

// Logo 胶囊
.logo-capsule {
  padding: 10rpx 18rpx;
  height: 76rpx;
  flex-shrink: 0;
  // Logo 胶囊特殊的微光边框
  border-color: rgba($neon-cyan, 0.08);
  
  .logo-image {
    height: 48rpx;
    display: block;
    filter: drop-shadow(0 0 6rpx rgba($neon-cyan, 0.35));
  }
}

// 世界线切换胶囊
.world-capsule {
  padding: 8rpx 14rpx;
  height: 76rpx;
  flex-shrink: 0;
  // 世界线切换的微妙边框
  border-color: rgba($neon-cyan, 0.06);
}

// 资源胶囊
.resource-capsule {
  padding: 10rpx 18rpx;
  height: 76rpx;
  gap: 0;
  flex: 1;
  min-width: 0;
  // 资源胶囊的特殊青色调
  border-color: rgba($neon-cyan, 0.15);
  background: linear-gradient(
    160deg,
    rgba($bg-elevated, 0.92) 0%,
    rgba(mix($neon-cyan, $bg-surface, 5%), 0.80) 100%
  );
  
  .resource-item {
    display: flex;
    align-items: center;
    gap: 6rpx;
    padding: 0 10rpx;
  }
  
  .resource-icon {
    font-size: 20rpx;
  }
  
  .resource-value {
    font-size: 22rpx;
    font-weight: 700;
    color: $neon-cyan-light;
    font-family: 'SF Mono', 'Courier New', monospace;
    letter-spacing: 0.5rpx;
  }
  
  .resource-divider {
    width: 1rpx;
    height: 24rpx;
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba($neon-cyan, 0.25) 50%,
      transparent 100%
    );
    margin: 0 6rpx;
  }
}

// 头像胶囊
.avatar-capsule {
  position: relative;
  padding: 8rpx 12rpx;
  height: 76rpx;
  cursor: pointer;
  flex-shrink: 0;
  // 头像胶囊的微妙洋红调
  border-color: rgba($neon-magenta, 0.08);
  
  .avatar-ring {
    width: 56rpx;
    height: 56rpx;
    @include smooth-corner(18rpx);
    padding: 2rpx;
    background: linear-gradient(135deg, $neon-cyan, $neon-magenta);
    @include neon-glow($neon-cyan, 0.12);
  }
  
  .user-avatar {
    width: 100%;
    height: 100%;
    @include smooth-corner(16rpx);
    background: linear-gradient(135deg, rgba($neon-magenta, 0.25), rgba($neon-cyan, 0.25));
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2rpx solid $bg-deep;
  }
  
  .avatar-text {
    font-size: 22rpx;
    font-weight: bold;
    color: $neon-cyan-light;
  }
  
  .level-badge {
    position: absolute;
    bottom: 4rpx;
    right: 4rpx;
    padding: 2rpx 8rpx;
    background: linear-gradient(135deg, rgba($neon-cyan, 0.9), rgba($neon-cyan-dark, 0.9));
    @include smooth-corner(10rpx);
    border: 2rpx solid $bg-deep;
    box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.3);
    
    .level-text {
      font-size: 14rpx;
      font-weight: 800;
      color: $text-on-neon;
      font-family: 'SF Mono', 'Courier New', monospace;
    }
  }
  
  &:active {
    transform: scale(0.95);
  }
}

// 通知胶囊
.notify-capsule {
  position: relative;
  width: 76rpx;
  height: 76rpx;
  cursor: pointer;
  flex-shrink: 0;
  
  .bell-icon {
    font-size: 28rpx;
    filter: grayscale(0.3);
    transition: filter $transition-fast;
  }
  
  .bell-dot {
    position: absolute;
    top: 14rpx;
    right: 14rpx;
    width: 12rpx;
    height: 12rpx;
    background: $color-danger;
    border-radius: 50%;
    border: 2rpx solid $bg-deep;
    box-shadow: 0 0 8rpx rgba($color-danger, 0.5);
    animation: pulse-glow 2s ease-in-out infinite;
  }
  
  &:active {
    transform: scale(0.95);
    .bell-icon {
      filter: grayscale(0);
    }
  }
}

// 卡片区域 - 不再独占全部空间，为底部操作栏预留空间
.card-area {
  flex: 1 1 0;
  position: relative;
  z-index: 1;
  overflow: hidden;
  min-height: 0;
  // 卡片悬浮形态：上下留白
  padding: 16rpx 28rpx 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-swiper {
  width: 100%;
  max-width: 480px; // 限制卡片最大宽度，宽屏居中
  height: 100%;
  touch-action: pan-y; // 允许垂直滑动
}

.swiper-item {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8rpx 0 120rpx;
  box-sizing: border-box;
  overflow: visible;
  touch-action: pan-y;
}

.card-wrapper {
  width: 100%;
  max-height: 100%;
  min-height: 70vh;
  border-radius: $radius-2xl;
  overflow: visible;
  transition: transform $transition-normal;
  display: flex;
  flex-direction: column;
  touch-action: pan-y;
  position: relative;
  
  // 玻璃态卡片背景 - 暗色半透明 + 微光边框
  background: linear-gradient(160deg, rgba(20, 26, 48, 0.92) 0%, rgba(10, 14, 26, 0.96) 100%);
  backdrop-filter: blur(40rpx) saturate(150%);
  -webkit-backdrop-filter: blur(40rpx) saturate(150%);
  border: 1.5rpx solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 8rpx 48rpx rgba(0, 0, 0, 0.5),
    0 0 60rpx rgba($neon-cyan, 0.05),
    0 0 120rpx rgba($neon-magenta, 0.03),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.08);
  
  // 彩色流光边缘效果 - 旋转渐变伪元素
  &::before {
    content: '';
    position: absolute;
    top: -2rpx;
    left: -2rpx;
    right: -2rpx;
    bottom: -2rpx;
    border-radius: calc(#{$radius-2xl} + 2rpx);
    background: conic-gradient(
      from var(--glow-angle, 0deg),
      transparent 0%,
      rgba($neon-cyan, 0.6) 10%,
      transparent 20%,
      rgba($neon-magenta, 0.5) 35%,
      transparent 45%,
      rgba($neon-amber, 0.4) 55%,
      transparent 65%,
      rgba($neon-cyan, 0.5) 80%,
      transparent 90%
    );
    z-index: -1;
    animation: glow-rotate 6s linear infinite;
    opacity: 0.7;
  }
  
  // 内层遮罩，只留边缘发光
  &::after {
    content: '';
    position: absolute;
    top: 2rpx;
    left: 2rpx;
    right: 2rpx;
    bottom: 2rpx;
    border-radius: calc(#{$radius-2xl} - 1rpx);
    background: linear-gradient(160deg, rgba(20, 26, 48, 0.97) 0%, rgba(10, 14, 26, 0.99) 100%);
    z-index: -1;
  }
}

@keyframes glow-rotate {
  0% { --glow-angle: 0deg; }
  100% { --glow-angle: 360deg; }
}

// 注册 CSS 自定义属性以支持动画
@property --glow-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

// 详情面板内容样式 - 暗色主题
.detail-content {
  .detail-section {
    margin-bottom: 32rpx;
    
    .section-title {
      font-size: 28rpx;
      font-weight: bold;
      color: $neon-cyan-light;
      margin-bottom: 16rpx;
      display: block;
      letter-spacing: 1rpx;
    }
    
    .section-text {
      font-size: 26rpx;
      color: $text-secondary;
      line-height: 1.6;
    }
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16rpx;
    
    .info-item {
      @include glass-effect(0.06);
      padding: 20rpx;
      border-radius: $radius-lg;
      
      .info-label {
        font-size: 22rpx;
        color: $text-tertiary;
        display: block;
        margin-bottom: 8rpx;
      }
      
      .info-value {
        font-size: 26rpx;
        color: $text-primary;
        font-weight: 600;
      }
    }
  }
  
  .cost-list, .effect-list {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
    
    .cost-item, .effect-item {
      display: flex;
      align-items: center;
      gap: 12rpx;
      padding: 16rpx 20rpx;
      @include glass-effect(0.06);
      border-radius: $radius-lg;
      
      .cost-icon {
        font-size: 28rpx;
      }
      
      .cost-value, .effect-value {
        font-size: 26rpx;
        color: $text-primary;
      }
      
      .effect-type {
        font-size: 22rpx;
        color: $text-tertiary;
      }
    }
  }
  
  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    
    .tag-item {
      padding: 10rpx 18rpx;
      background: rgba($neon-cyan, 0.08);
      border: 1rpx solid rgba($neon-cyan, 0.2);
      border-radius: $radius-full;
      font-size: 24rpx;
      color: $neon-cyan;
    }
  }
  
  // 用户标签列表 - 带权重进度条
  .user-tag-list {
    display: flex;
    flex-direction: column;
    gap: 14rpx;
    
    .user-tag-item {
      display: flex;
      align-items: center;
      gap: 16rpx;
      padding: 16rpx 20rpx;
      @include glass-effect(0.06);
      border-radius: $radius-lg;
      
      .tag-icon-wrap {
        width: 52rpx;
        height: 52rpx;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        
        &.tag-bg-0 { background: rgba(#4caf50, 0.15); }
        &.tag-bg-1 { background: rgba(#2196f3, 0.15); }
        &.tag-bg-2 { background: rgba(#e91e63, 0.15); }
        &.tag-bg-3 { background: rgba(#ff9800, 0.15); }
        &.tag-bg-4 { background: rgba(#9c27b0, 0.15); }
      }
      
      .tag-icon {
        font-size: 28rpx;
      }
      
      .tag-info {
        flex: 1;
        min-width: 0;
        
        .tag-name-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8rpx;
        }
        
        .tag-name {
          font-size: 26rpx;
          font-weight: 600;
          color: $text-primary;
        }
        
        .tag-weight {
          font-size: 24rpx;
          font-weight: 700;
          color: $text-secondary;
        }
        
        .tag-bar {
          height: 8rpx;
          background: rgba(255,255,255,0.3);
          border-radius: 4rpx;
          overflow: hidden;
        }
        
        .tag-bar-fill {
          height: 100%;
          border-radius: 4rpx;
          transition: width 0.3s ease;
          
          &.bar-color-0 { background: linear-gradient(90deg, #66bb6a, #4caf50); }
          &.bar-color-1 { background: linear-gradient(90deg, #42a5f5, #2196f3); }
          &.bar-color-2 { background: linear-gradient(90deg, #f06292, #e91e63); }
          &.bar-color-3 { background: linear-gradient(90deg, #ffb74d, #ff9800); }
          &.bar-color-4 { background: linear-gradient(90deg, #ba68c8, #9c27b0); }
        }
      }
    }
  }
  
  // 空标签状态
  .empty-tags {
    .empty-text {
      font-size: 26rpx;
      color: $text-tertiary;
      font-style: italic;
    }
  }
  
  // 共同标签
  .common-tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    
    .common-tag {
      padding: 10rpx 20rpx;
      background: rgba($neon-cyan, 0.08);
      border: 1rpx solid rgba($neon-cyan, 0.2);
      border-radius: $radius-full;
      font-size: 24rpx;
      color: $neon-cyan;
    }
  }
  
  // 生活足迹统计
  .life-stats {
    display: flex;
    justify-content: space-around;
    padding: 20rpx 0;
    @include glass-effect(0.06);
    border-radius: $radius-lg;
    
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8rpx;
      
      .stat-value {
        font-size: 40rpx;
        font-weight: bold;
        color: $text-primary;
      }
      
      .stat-label {
        font-size: 22rpx;
        color: $text-tertiary;
      }
    }
  }
  
  // 活跃状态
  .activity-info {
    padding: 16rpx 20rpx;
    @include glass-effect(0.06);
    border-radius: $radius-lg;
    
    .activity-text {
      font-size: 26rpx;
      color: $text-primary;
    }
  }
  
  // 历史选择时间线
  .choice-timeline {
    display: flex;
    flex-direction: column;
    padding-left: 8rpx;
    
    .timeline-item {
      display: flex;
      gap: 16rpx;
      position: relative;
      min-height: 60rpx;
    }
    
    .timeline-dot {
      width: 16rpx;
      height: 16rpx;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 8rpx;
      z-index: 1;
      
      &.dot-color-0 { background: #42a5f5; box-shadow: 0 0 8rpx rgba(#42a5f5, 0.4); }
      &.dot-color-1 { background: #66bb6a; box-shadow: 0 0 8rpx rgba(#66bb6a, 0.4); }
      &.dot-color-2 { background: #ffa726; box-shadow: 0 0 8rpx rgba(#ffa726, 0.4); }
    }
    
    .timeline-line {
      position: absolute;
      left: 7rpx;
      top: 28rpx;
      bottom: 0;
      width: 3rpx;
      background: rgba(255,255,255,0.2);
    }
    
    .timeline-content {
      flex: 1;
      min-width: 0;
      padding-bottom: 20rpx;
    }
    
    .timeline-choice {
      font-size: 26rpx;
      color: $text-primary;
      display: block;
      line-height: 1.4;
    }
    
    .timeline-time {
      font-size: 22rpx;
      color: $text-tertiary;
      margin-top: 4rpx;
      display: block;
    }
  }
  
  // 物品收藏网格
  .inventory-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12rpx;
    
    .inventory-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8rpx;
      padding: 16rpx 8rpx;
      @include glass-effect(0.06);
      border-radius: $radius-lg;
    }
    
    .inventory-icon {
      font-size: 36rpx;
    }
    
    .inventory-name {
      font-size: 20rpx;
      color: $text-secondary;
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;
    }
  }
  
  // 已购入提示框
  .owned-notice {
    .owned-notice-box {
      display: flex;
      align-items: center;
      gap: 16rpx;
      padding: 20rpx 24rpx;
      background: rgba($color-success, 0.06);
      border: 1rpx solid rgba($color-success, 0.2);
      border-radius: $radius-xl;
    }
    
    .owned-notice-icon {
      font-size: 36rpx;
    }
    
    .owned-notice-info {
      flex: 1;
    }
    
    .owned-notice-title {
      display: block;
      font-size: 28rpx;
      font-weight: 600;
      color: $color-success;
      margin-bottom: 4rpx;
    }
    
    .owned-notice-desc {
      display: block;
      font-size: 24rpx;
      color: rgba($color-success, 0.7);
    }
  }
  
  // 详情面板座右铭
  .detail-motto-card {
    display: flex;
    align-items: flex-start;
    gap: 6rpx;
    padding: 20rpx 24rpx;
    background: linear-gradient(135deg, rgba($neon-magenta, 0.06), rgba($neon-magenta, 0.02));
    border-radius: $radius-xl;
    border-left: 4rpx solid rgba($neon-magenta, 0.5);
  }
  
  .detail-motto-mark {
    font-size: 40rpx;
    font-weight: 700;
    color: $neon-magenta;
    line-height: 1;
    opacity: 0.4;
    flex-shrink: 0;
    
    &.end {
      align-self: flex-end;
    }
  }
  
  .detail-motto-text {
    font-size: 26rpx;
    color: $text-secondary;
    line-height: 1.6;
    font-style: italic;
    flex: 1;
    padding: 6rpx 0;
  }
  
  // 资源概览
  .resource-grid {
    display: flex;
    gap: 12rpx;
    
    .resource-item {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 12rpx;
      padding: 16rpx 14rpx;
      @include glass-effect(0.06);
      border-radius: $radius-lg;
      
      .resource-icon {
        font-size: 28rpx;
      }
      
      .resource-info {
        display: flex;
        flex-direction: column;
        gap: 2rpx;
      }
      
      .resource-value {
        font-size: 28rpx;
        font-weight: 700;
        color: $text-primary;
      }
      
      .resource-label {
        font-size: 20rpx;
        color: $text-tertiary;
      }
    }
  }
  
  // 成就徽章网格
  .detail-achievement-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
    
    .detail-achievement-item {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 10rpx 16rpx;
      background: linear-gradient(135deg, rgba($neon-amber, 0.08), rgba($neon-amber, 0.04));
      border: 1rpx solid rgba($neon-amber, 0.2);
      border-radius: 20rpx;
      
      .detail-ach-icon {
        font-size: 24rpx;
      }
      
      .detail-ach-name {
        font-size: 22rpx;
        font-weight: 600;
        color: $neon-amber;
      }
    }
  }
  
  // 物品收藏列表（增强版）
  .detail-inventory-list {
    display: flex;
    flex-direction: column;
    gap: 10rpx;
    
    .detail-inv-item {
      display: flex;
      align-items: center;
      gap: 14rpx;
      padding: 14rpx 18rpx;
      @include glass-effect(0.06);
      border-radius: $radius-lg;
      
      .detail-inv-icon {
        font-size: 32rpx;
        flex-shrink: 0;
      }
      
      .detail-inv-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4rpx;
      }
      
      .detail-inv-name {
        font-size: 24rpx;
        font-weight: 600;
        color: $text-primary;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .detail-inv-rarity {
        font-size: 20rpx;
        font-weight: 500;
        
        &.rarity-text-legendary { color: $rarity-legendary; }
        &.rarity-text-epic { color: $rarity-epic; }
        &.rarity-text-rare { color: $rarity-rare; }
        &.rarity-text-uncommon { color: $rarity-uncommon; }
        &.rarity-text-common { color: $rarity-common; }
      }
      
      .detail-inv-qty {
        font-size: 22rpx;
        font-weight: 700;
        color: $text-secondary;
        flex-shrink: 0;
      }
    }
  }
}

// 操作面板内容样式 - 暗色主题
.action-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  
  .action-item {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 28rpx;
    @include glass-effect(0.06);
    border-radius: $radius-xl;
    transition: all $transition-normal;
    min-height: $touch-target-min;
    
    &:active {
      transform: scale(0.98);
      background: rgba(255, 255, 255, 0.1);
    }
    
    &.danger {
      background: rgba($color-danger, 0.08);
      border-color: rgba($color-danger, 0.2);
      
      .action-text {
        color: $color-danger;
      }
    }
    
    .action-icon {
      font-size: 36rpx;
    }
    
    .action-text {
      font-size: 28rpx;
      color: $text-primary;
      font-weight: 500;
    }
  }
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba($bg-deep, 0.9);
  backdrop-filter: blur(40rpx);
  -webkit-backdrop-filter: blur(40rpx);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 80rpx;
  height: 80rpx;
  border: 6rpx solid rgba(255, 255, 255, 0.1);
  border-top-color: $neon-cyan;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24rpx;
  @include neon-glow($neon-cyan, 0.2);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 28rpx;
  color: $text-secondary;
}

// 卡片底部主操作按钮文字样式
.main-action-icon {
  font-size: 30rpx;
  margin-right: 8rpx;
}

.main-action-text {
  font-size: 30rpx;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2rpx;
}

// ====== 卡片下方操作栏（固定在 TabBar 上方） ======
.card-actions-bar {
  position: fixed;
  bottom: calc(50px + #{$safe-area-bottom}); // TabBar 高度 + 安全区
  left: 50%;
  transform: translateX(-50%) translateY(0);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 12rpx 42rpx;
  // 与 card-area 的 padding 28rpx 对齐，确保操作栏不超出卡片
  width: calc(100% - 56rpx);
  max-width: 480px;
  box-sizing: border-box;
  z-index: 100;
  transition: opacity 0.25s ease, transform 0.25s ease;
  opacity: 1;
  
  &.hidden {
    opacity: 0;
    transform: translateX(-50%) translateY(20rpx);
    pointer-events: none;
  }
}

.main-action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 76rpx;
  border-radius: $radius-full;
  background: linear-gradient(135deg, $neon-cyan 0%, $neon-magenta 100%);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba($neon-cyan, 0.25), 0 4rpx 20rpx rgba($neon-magenta, 0.15);
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.97);
    box-shadow: 0 2rpx 12rpx rgba($neon-cyan, 0.4), 0 2rpx 12rpx rgba($neon-magenta, 0.3);
  }
}

.main-action-btn.disabled {
  opacity: 0.5;
  pointer-events: none;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: none;
}

.main-action-btn.just-bought {
  background: linear-gradient(135deg, $color-success 0%, darken($color-success, 10%) 100%);
  box-shadow: 0 4rpx 20rpx rgba($color-success, 0.3);
}

.main-action-btn.is-followed {
  background: rgba(255, 255, 255, 0.08);
  border: 1rpx solid rgba(255, 255, 255, 0.15);
  box-shadow: none;
}

// 选择倒计时状态栏样式
// ===== 外部选项列表（playing 模式） =====
.external-choices-area {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  width: 100%;
  margin-bottom: 12rpx;
  padding: 0; // 选项宽度由父容器 padding 控制
  
  .ext-choice-item {
    display: flex;
    align-items: center;
    padding: 16rpx 24rpx;
    border-radius: 20rpx;
    @include glass-effect(0.15);
    border: 1rpx solid rgba(255, 255, 255, 0.12);
    transition: all 0.25s ease;
    cursor: pointer;
    
    &:active {
      transform: scale(0.97);
    }
    
    &.is-selected {
      border-color: rgba($neon-cyan, 0.6);
      background: linear-gradient(135deg, rgba($neon-cyan, 0.2) 0%, rgba($neon-magenta, 0.1) 100%);
      box-shadow: 0 0 16rpx rgba($neon-cyan, 0.2);
    }
    
    &.is-not-selected {
      opacity: 0.45;
      transform: scale(0.97);
    }
    
    &.cant-afford {
      border-color: rgba(255, 80, 80, 0.5);
      box-shadow: 0 0 12rpx rgba(255, 80, 80, 0.15);
    }
    
    &.disabled {
      opacity: 0.3;
      pointer-events: none;
    }
    
    .ext-choice-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6rpx;
      
      .ext-choice-text {
        font-size: 26rpx;
        color: rgba(255, 255, 255, 0.9);
        line-height: 1.4;
      }
      
      .ext-choice-selected-info {
        display: flex;
        align-items: center;
        gap: 10rpx;
        margin-top: 4rpx;
        
        .ext-multiplier-badge {
          background: linear-gradient(135deg, $neon-cyan, $neon-magenta);
          padding: 2rpx 12rpx;
          border-radius: 12rpx;
          
          .ext-mult-text {
            font-size: 22rpx;
            font-weight: 700;
            color: #fff;
          }
        }
        
        .ext-cost-tags {
          display: flex;
          gap: 6rpx;
        }
        
        .ext-tap-hint {
          font-size: 20rpx;
          color: rgba($neon-cyan, 0.8);
          font-weight: 500;
        }
        
        .ext-max-hint {
          font-size: 20rpx;
          color: rgba(255, 255, 255, 0.4);
        }
      }
      
      .ext-choice-cost {
        display: flex;
        gap: 6rpx;
        margin-top: 4rpx;
      }
      
      .ext-cost-tag {
        font-size: 20rpx;
        padding: 2rpx 8rpx;
        border-radius: 8rpx;
        font-weight: 600;
        
        &.time {
          color: rgba($neon-cyan, 0.9);
          background: rgba($neon-cyan, 0.12);
        }
        &.energy {
          color: rgba($neon-magenta, 0.9);
          background: rgba($neon-magenta, 0.12);
        }
      }
    }
  }
}

.choice-countdown-status {
  position: relative;
  overflow: hidden;
  cursor: default;
  
  &.has-selection {
    background: linear-gradient(135deg, rgba($neon-cyan, 0.25) 0%, rgba($neon-magenta, 0.15) 100%) !important;
    border-color: rgba($neon-cyan, 0.3) !important;
  }
  
  &.is-counting {
    background: linear-gradient(135deg, rgba($neon-cyan, 0.3) 0%, rgba($neon-magenta, 0.2) 100%) !important;
    box-shadow: 0 4rpx 20rpx rgba($neon-cyan, 0.25) !important;
    animation: countdown-pulse 1.5s ease-in-out infinite alternate;
  }
  
  .confirm-cost-tags {
    display: flex;
    align-items: center;
    gap: 6rpx;
    margin-left: 8rpx;
    
    .confirm-cost-tag {
      font-size: 20rpx;
      color: rgba(255, 255, 255, 0.85);
      background: rgba(0, 0, 0, 0.2);
      padding: 2rpx 8rpx;
      border-radius: 8rpx;
      font-weight: 600;
    }
  }
}

@keyframes countdown-pulse {
  0% { box-shadow: 0 4rpx 20rpx rgba($neon-cyan, 0.2); }
  100% { box-shadow: 0 4rpx 28rpx rgba($neon-magenta, 0.3); }
}

.secondary-action-btn {
  padding: 0 28rpx;
  height: 76rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-full;
  @include glass-effect(0.12);
  border: 1rpx solid rgba(255, 255, 255, 0.15);
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  &:active {
    transform: scale(0.97);
    background: rgba(255, 255, 255, 0.15);
  }
  
  .secondary-action-text {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.7);
    white-space: nowrap;
  }
}

.action-timer-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0 0 $radius-full $radius-full;
  overflow: hidden;
  
  .timer-fill {
    height: 100%;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 2rpx;
    transition: width 0.1s linear;
  }
}

.footer-icon-btn {
  width: 76rpx;
  height: 76rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  @include glass-effect(0.12);
  border: 1rpx solid rgba(255, 255, 255, 0.12);
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  &:active {
    transform: scale(0.92);
    background: rgba($neon-cyan, 0.15);
    border-color: rgba($neon-cyan, 0.3);
  }
  
  .footer-icon {
    font-size: 30rpx;
    line-height: 1;
  }
}

// ====== 页面级底部弹出面板 ======
.bottom-sheet {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0);
  pointer-events: none;
  transition: background 0.3s ease;
  
  &.visible {
    background: rgba(0, 0, 0, 0.5);
    pointer-events: auto;
  }
}

.sheet-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 75vh;
  background: linear-gradient(180deg, rgba(20, 26, 48, 0.98) 0%, rgba(10, 14, 26, 0.99) 100%);
  backdrop-filter: blur(40rpx) saturate(150%);
  -webkit-backdrop-filter: blur(40rpx) saturate(150%);
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
  border-radius: 32rpx 32rpx 0 0;
  transform: translateY(100%);
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
  display: flex;
  flex-direction: column;
  
  &.visible {
    transform: translateY(0);
  }
}

.sheet-handle {
  display: flex;
  justify-content: center;
  padding: 16rpx 0 8rpx;
  cursor: pointer;
  
  .handle-bar {
    width: 64rpx;
    height: 6rpx;
    border-radius: 3rpx;
    background: rgba(255, 255, 255, 0.2);
  }
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 32rpx 20rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.08);
  
  .sheet-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #fff;
  }
  
  .sheet-close {
    font-size: 32rpx;
    color: rgba(255, 255, 255, 0.5);
    padding: 10rpx;
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:active {
      color: rgba(255, 255, 255, 0.8);
    }
  }
}

.sheet-body {
  flex: 1;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom, 0px));
  overflow-y: auto;
  min-height: 0;
}

// 操作列表样式
.action-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx;
  @include glass-effect(0.06);
  border: 1rpx solid rgba(255, 255, 255, 0.06);
  border-radius: 16rpx;
  transition: all 0.2s;
  
  &:active {
    background: rgba($neon-cyan, 0.1);
    border-color: rgba($neon-cyan, 0.2);
  }
  
  &.danger {
    background: rgba($color-danger, 0.08);
    border-color: rgba($color-danger, 0.15);
    
    .action-text {
      color: $color-danger;
    }
  }
  
  .action-icon {
    font-size: 36rpx;
  }
  
  .action-text {
    font-size: 28rpx;
    color: $text-primary;
  }
}
</style>
