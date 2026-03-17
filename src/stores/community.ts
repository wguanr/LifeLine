import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Topic, TopicPost, CommunityAction } from '@/types'
import { mockTopics, mockPosts } from '@/data/community_topics'
import { useUserStore } from './user'

// ==================== 资源消耗常量 ====================

export const COMMUNITY_COSTS = {
  post: { time: 10, energy: 5 },
  reply: { time: 5, energy: 3 },
  like: { time: 1, energy: 0 },
  boostMin: { time: 5, energy: 0 }
} as const

export const useCommunityStore = defineStore('community', () => {
  // ==================== State ====================

  const topics = ref<Topic[]>([])
  const allPosts = ref<TopicPost[]>([])
  const currentTopicId = ref<string | null>(null)
  const userActions = ref<CommunityAction[]>([])
  const initialized = ref(false)

  // ==================== Getters ====================

  /** 话题按资源池降序排列（置顶优先） */
  const sortedTopics = computed<Topic[]>(() => {
    return [...topics.value].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return b.totalPool - a.totalPool
    })
  })

  /** 当前话题 */
  const currentTopic = computed<Topic | null>(() => {
    if (!currentTopicId.value) return null
    return topics.value.find(t => t.id === currentTopicId.value) ?? null
  })

  /** 当前话题的帖子（按 totalValue 降序，仅主贴） */
  const currentTopicPosts = computed<TopicPost[]>(() => {
    if (!currentTopicId.value) return []
    return allPosts.value
      .filter(p => p.topicId === currentTopicId.value && p.replyTo === null)
      .sort((a, b) => b.totalValue - a.totalValue)
  })

  /** 用户已点赞的帖子 ID 集合 */
  const userLikedPostIds = computed<Set<string>>(() => {
    const ids = new Set<string>()
    userActions.value
      .filter(a => a.type === 'like' && a.postId)
      .forEach(a => ids.add(a.postId!))
    return ids
  })

  /** 获取某帖子的回复列表（按 totalValue 降序） */
  function getReplies(postId: string): TopicPost[] {
    return allPosts.value
      .filter(p => p.replyTo === postId)
      .sort((a, b) => b.totalValue - a.totalValue)
  }

  // ==================== Actions ====================

  /** 初始化 mock 数据 */
  function initData() {
    if (initialized.value) return
    topics.value = [...mockTopics]
    allPosts.value = [...mockPosts]

    // 动态计算所有话题的 topPosts（按 totalValue 排序取前3条主贴）
    topics.value.forEach(topic => updateTopPosts(topic))

    // 从 localStorage 恢复用户行为
    const saved = uni.getStorageSync('community_actions')
    if (saved) {
      try { userActions.value = JSON.parse(saved) } catch { /* ignore */ }
    }
    initialized.value = true
  }

  /** 持久化用户行为 */
  function saveActions() {
    uni.setStorageSync('community_actions', JSON.stringify(userActions.value))
  }

  /** 进入话题详情 */
  function enterTopic(topicId: string) {
    currentTopicId.value = topicId
  }

  /** 离开话题详情 */
  function leaveTopic() {
    currentTopicId.value = null
  }

  /** 发帖 */
  function createPost(topicId: string, content: string): boolean {
    const userStore = useUserStore()
    const cost = COMMUNITY_COSTS.post

    // 检查资源
    if (userStore.wallet.time < cost.time || userStore.wallet.energy < cost.energy) {
      uni.showToast({ title: '资源不足', icon: 'none' })
      return false
    }

    // 扣除资源
    userStore.wallet.time -= cost.time
    userStore.wallet.energy -= cost.energy

    const user = userStore.currentUser
    const newPost: TopicPost = {
      id: `post_user_${Date.now()}`,
      topicId,
      authorId: user.id,
      authorName: user.nickname,
      authorAvatar: '🎮',
      authorLevel: user.clearanceLevel,
      content,
      investedResources: cost.time + cost.energy,
      likeCount: 0,
      boostCount: 0,
      totalValue: cost.time + cost.energy,
      replyTo: null,
      replyCount: 0,
      createdAt: Date.now()
    }

    allPosts.value.unshift(newPost)

    // 更新话题统计
    const topic = topics.value.find(t => t.id === topicId)
    if (topic) {
      topic.postCount++
      topic.totalPool += newPost.totalValue
      topic.lastActiveAt = Date.now()
      // 用户首次在该话题发帖时增加参与人数
      const hasPostedBefore = userActions.value.some(a => a.topicId === topicId && (a.type === 'post' || a.type === 'reply'))
      if (!hasPostedBefore) topic.participantCount++
      // 更新 topPosts 预览
      updateTopPosts(topic)
    }

    // 记录行为
    userActions.value.push({
      type: 'post', topicId, postId: newPost.id,
      cost: { time: cost.time, energy: cost.energy },
      timestamp: Date.now()
    })
    saveActions()

    return true
  }

  /** 回复帖子 */
  function replyToPost(topicId: string, parentPostId: string, content: string): boolean {
    const userStore = useUserStore()
    const cost = COMMUNITY_COSTS.reply

    if (userStore.wallet.time < cost.time || userStore.wallet.energy < cost.energy) {
      uni.showToast({ title: '资源不足', icon: 'none' })
      return false
    }

    userStore.wallet.time -= cost.time
    userStore.wallet.energy -= cost.energy

    const user = userStore.currentUser
    const newReply: TopicPost = {
      id: `reply_user_${Date.now()}`,
      topicId,
      authorId: user.id,
      authorName: user.nickname,
      authorAvatar: '🎮',
      authorLevel: user.clearanceLevel,
      content,
      investedResources: cost.time + cost.energy,
      likeCount: 0,
      boostCount: 0,
      totalValue: cost.time + cost.energy,
      replyTo: parentPostId,
      replyCount: 0,
      createdAt: Date.now()
    }

    allPosts.value.unshift(newReply)

    // 更新父帖子回复数
    const parentPost = allPosts.value.find(p => p.id === parentPostId)
    if (parentPost) parentPost.replyCount++

    // 更新话题统计
    const topic = topics.value.find(t => t.id === topicId)
    if (topic) {
      topic.postCount++
      topic.totalPool += newReply.totalValue
      topic.lastActiveAt = Date.now()
      // 用户首次在该话题发言时增加参与人数
      const hasPostedBefore = userActions.value.some(a => a.topicId === topicId && (a.type === 'post' || a.type === 'reply'))
      if (!hasPostedBefore) topic.participantCount++
    }

    userActions.value.push({
      type: 'reply', topicId, postId: newReply.id,
      cost: { time: cost.time, energy: cost.energy },
      timestamp: Date.now()
    })
    saveActions()

    return true
  }

  /** 点赞帖子 */
  function likePost(topicId: string, postId: string): boolean {
    // 检查是否已点赞
    if (userLikedPostIds.value.has(postId)) {
      uni.showToast({ title: '已经点赞过了', icon: 'none' })
      return false
    }

    const userStore = useUserStore()
    const cost = COMMUNITY_COSTS.like

    if (userStore.wallet.time < cost.time) {
      uni.showToast({ title: '资源不足（需要 ⏱' + cost.time + '）', icon: 'none' })
      return false
    }

    userStore.wallet.time -= cost.time

    // 更新帖子
    const post = allPosts.value.find(p => p.id === postId)
    if (post) {
      post.likeCount++
    }

    // 更新话题资源池
    const topic = topics.value.find(t => t.id === topicId)
    if (topic) {
      topic.totalPool += cost.time
      topic.lastActiveAt = Date.now()
    }

    userActions.value.push({
      type: 'like', topicId, postId,
      cost: { time: cost.time },
      timestamp: Date.now()
    })
    saveActions()

    return true
  }

  /** 助力帖子 */
  function boostPost(topicId: string, postId: string, amount: number): boolean {
    if (amount < COMMUNITY_COSTS.boostMin.time) {
      uni.showToast({ title: `最少投入 ${COMMUNITY_COSTS.boostMin.time} 时间`, icon: 'none' })
      return false
    }

    const userStore = useUserStore()
    if (userStore.wallet.time < amount) {
      uni.showToast({ title: '资源不足', icon: 'none' })
      return false
    }

    userStore.wallet.time -= amount

    // 更新帖子
    const post = allPosts.value.find(p => p.id === postId)
    if (post) {
      post.boostCount += amount
      post.totalValue += amount
    }

    // 更新话题资源池
    const topic = topics.value.find(t => t.id === topicId)
    if (topic) {
      topic.totalPool += amount
      topic.lastActiveAt = Date.now()
      updateTopPosts(topic)
    }

    userActions.value.push({
      type: 'boost', topicId, postId,
      cost: { time: amount },
      timestamp: Date.now()
    })
    saveActions()

    return true
  }

  /** 更新话题的 topPosts 预览 */
  function updateTopPosts(topic: Topic) {
    const topicPosts = allPosts.value
      .filter(p => p.topicId === topic.id && p.replyTo === null)
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 3)
    topic.topPosts = topicPosts
  }

  return {
    // state
    topics,
    allPosts,
    currentTopicId,
    userActions,
    // getters
    sortedTopics,
    currentTopic,
    currentTopicPosts,
    userLikedPostIds,
    // actions
    initData,
    enterTopic,
    leaveTopic,
    getReplies,
    createPost,
    replyToPost,
    likePost,
    boostPost
  }
})
