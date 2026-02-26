/**
 * 虚拟用户数据 - 用于模拟多用户参与事件场景
 * 
 * 包含不同类型的用户：
 * - 大R用户（高投入，容易成为 Influencer）
 * - 中等用户（正常投入）
 * - 小用户（低投入）
 */

import type { InvestmentRecord, InfluencerChoice } from '@/types'

export interface SimulatedUser {
  userId: string
  nickname: string
  avatar: string
  bio: string
  topTags: Array<{ tagId: string; name: string; icon: string }>
  /** 用户类型：whale=大R, normal=中等, casual=小用户 */
  userType: 'whale' | 'normal' | 'casual'
}

/** 预定义的虚拟用户 */
export const simulatedUsers: SimulatedUser[] = [
  {
    userId: 'sim_whale_01',
    nickname: '深度玩家·星辰',
    avatar: '🌟',
    bio: '每一个选择都是对未来的投资。不做旁观者，只做参与者。',
    topTags: [
      { tagId: 'strategist', name: '策略家', icon: '🧠' },
      { tagId: 'investor', name: '投资者', icon: '💰' },
      { tagId: 'leader', name: '领导者', icon: '👑' }
    ],
    userType: 'whale'
  },
  {
    userId: 'sim_whale_02',
    nickname: '氪金大佬·暗影',
    avatar: '🔮',
    bio: '用资源说话，用选择证明。我的每一步都经过深思熟虑。',
    topTags: [
      { tagId: 'collector', name: '收藏家', icon: '🏆' },
      { tagId: 'risk_taker', name: '冒险家', icon: '🎲' },
      { tagId: 'trendsetter', name: '潮流引领者', icon: '🔥' }
    ],
    userType: 'whale'
  },
  {
    userId: 'sim_normal_01',
    nickname: '理性派·小林',
    avatar: '📊',
    bio: '数据驱动决策，理性面对每一个选择。',
    topTags: [
      { tagId: 'analyst', name: '分析师', icon: '📈' },
      { tagId: 'learner', name: '学习者', icon: '📚' },
      { tagId: 'minimalist', name: '极简主义', icon: '🎯' }
    ],
    userType: 'normal'
  },
  {
    userId: 'sim_normal_02',
    nickname: '热心肠·阿暖',
    avatar: '☀️',
    bio: '帮助他人就是帮助自己，温暖是最好的投资。',
    topTags: [
      { tagId: 'helpful', name: '乐于助人', icon: '🤝' },
      { tagId: 'social', name: '社交达人', icon: '💬' },
      { tagId: 'foodie', name: '美食家', icon: '🍜' }
    ],
    userType: 'normal'
  },
  {
    userId: 'sim_normal_03',
    nickname: '探险家·风行',
    avatar: '🧭',
    bio: '世界那么大，每一条路都值得走一走。',
    topTags: [
      { tagId: 'traveler', name: '旅行者', icon: '✈️' },
      { tagId: 'explorer', name: '探索者', icon: '🔍' },
      { tagId: 'photographer', name: '摄影师', icon: '📷' }
    ],
    userType: 'normal'
  },
  {
    userId: 'sim_casual_01',
    nickname: '路过的·小透明',
    avatar: '👻',
    bio: '随便看看，随便选选。',
    topTags: [
      { tagId: 'casual', name: '休闲玩家', icon: '🎮' }
    ],
    userType: 'casual'
  },
  {
    userId: 'sim_casual_02',
    nickname: '佛系青年·阿空',
    avatar: '🍃',
    bio: '顺其自然，随遇而安。',
    topTags: [
      { tagId: 'minimalist', name: '极简主义', icon: '🎯' },
      { tagId: 'peaceful', name: '平和', icon: '🕊️' }
    ],
    userType: 'casual'
  }
]

/**
 * 为指定事件生成虚拟用户的投入和选择数据
 * 
 * @param eventId 事件ID
 * @param stages 事件的阶段数据（用于生成合理的选择）
 * @param currentStageIndex 当前用户所在的阶段索引（虚拟用户会模拟到这个阶段）
 */
export function generateSimulatedParticipation(
  eventId: string,
  stages: Array<{ id: string; title: string; choices: Array<{ id: string; text: string; cost?: { time?: number; energy?: number }; outcome: { resultText: string } }> }>,
  currentStageIndex: number,
  entryFee?: { time?: number; energy?: number }
): Array<{
  userId: string
  nickname: string
  avatar: string
  bio: string
  topTags: Array<{ tagId: string; name: string; icon: string }>
  investments: InvestmentRecord[]
  choices: InfluencerChoice[]
}> {
  const now = Date.now()
  const result: Array<{
    userId: string
    nickname: string
    avatar: string
    bio: string
    topTags: Array<{ tagId: string; name: string; icon: string }>
    investments: InvestmentRecord[]
    choices: InfluencerChoice[]
  }> = []

  for (const simUser of simulatedUsers) {
    const investments: InvestmentRecord[] = []
    const choices: InfluencerChoice[] = []

    // 入场费投入
    const entryFeeValue = entryFee
      ? (entryFee.time ?? 0) + (entryFee.energy ?? 0) * 1.5
      : 0

    if (entryFeeValue > 0) {
      investments.push({
        type: 'entry_fee',
        value: entryFeeValue,
        timestamp: now - (currentStageIndex + 1) * 600000,
        description: '参与事件入场费'
      })
    }

    // 根据用户类型决定投入倍率
    const multiplier = simUser.userType === 'whale' ? 5.0
      : simUser.userType === 'normal' ? 1.0
      : 0.3

    // 模拟每个阶段的选择（到当前阶段为止）
    const stagesToSimulate = Math.min(currentStageIndex + 1, stages.length)
    
    for (let i = 0; i < stagesToSimulate; i++) {
      const stage = stages[i]
      if (!stage || !stage.choices || stage.choices.length === 0) continue

      // 随机选择一个选项（排除隐藏选项）
      const availableChoices = stage.choices.filter((c: any) => !c.hidden)
      if (availableChoices.length === 0) continue

      const choiceIndex = Math.floor(Math.random() * availableChoices.length)
      const chosen = availableChoices[choiceIndex]

      // 记录选择消耗
      const choiceCost = chosen.cost
        ? (chosen.cost.time ?? 0) + (chosen.cost.energy ?? 0) * 1.5
        : 0

      // 大R用户额外加码投入
      const extraBoost = simUser.userType === 'whale'
        ? Math.round(choiceCost * 2 + Math.random() * 100)
        : simUser.userType === 'normal'
        ? Math.round(Math.random() * 20)
        : 0

      if (choiceCost > 0) {
        investments.push({
          type: 'choice_cost',
          value: Math.round(choiceCost * multiplier),
          timestamp: now - (stagesToSimulate - i) * 300000,
          stageId: stage.id,
          description: `阶段"${stage.title}"选择消耗`
        })
      }

      if (extraBoost > 0) {
        investments.push({
          type: 'boost',
          value: extraBoost,
          timestamp: now - (stagesToSimulate - i) * 300000 + 1000,
          stageId: stage.id,
          description: `阶段"${stage.title}"额外加码`
        })
      }

      choices.push({
        stageId: stage.id,
        choiceId: chosen.id,
        choiceText: chosen.text,
        resultText: chosen.outcome?.resultText,
        timestamp: now - (stagesToSimulate - i) * 300000
      })
    }

    result.push({
      userId: simUser.userId,
      nickname: simUser.nickname,
      avatar: simUser.avatar,
      bio: simUser.bio,
      topTags: simUser.topTags,
      investments,
      choices
    })
  }

  return result
}
