import type { GameEvent } from '@/types'

export const mockEvents: GameEvent[] = [
  // ==================== 社交类事件 ====================
  {
    id: 'evt_coffee_encounter',
    title: '咖啡店偶遇',
    description: '在常去的咖啡店，你发现一个熟悉的身影——是很久没联系的老同学。要不要上前打个招呼？',
    cover: '/static/events/coffee.png',
    type: 'social',
    status: 'active',
    requirements: {},
    entryFee: { time: 15, energy: 5 },
    stages: [
      {
        id: 'stage_1',
        title: '意外重逢',
        description: '老同学正在专注地看着笔记本电脑，似乎在忙什么。你们已经三年没见了。',
        choices: [
          {
            id: 'choice_greet',
            text: '👋 主动上前打招呼',
            cost: { time: 15 },
            outcome: {
              nextStageId: 'stage_2a',
              rewards: {
                reputation: 5,
                tags: ['social_butterfly']
              },
              resultText: '"哇！真的是你！"老同学惊喜地站起来，热情地和你拥抱。'
            }
          },
          {
            id: 'choice_ignore',
            text: '📱 假装没看见，继续点单',
            outcome: {
              nextStageId: 'stage_2b',
              rewards: {
                time: 10
              },
              resultText: '你默默点了咖啡，找了个角落坐下。'
            }
          }
        ]
      },
      {
        id: 'stage_2a',
        title: '久别重逢',
        description: '"好久不见！最近怎么样？"你们聊了起来，发现对方现在在一家不错的互联网公司工作，正好在招人。',
        choices: [
          {
            id: 'choice_exchange',
            text: '📲 交换联系方式，约下次聚会',
            outcome: {
              isEnding: true,
              rewards: {
                reputation: 15,
                tags: ['connector']
              },
              resultText: '你们加了微信，约好下周一起吃饭。说不定这是一个新的职业机会！'
            }
          },
          {
            id: 'choice_brief',
            text: '⏰ 简单寒暄后告别，赶时间',
            outcome: {
              isEnding: true,
              rewards: {
                reputation: 3,
                time: 20
              },
              resultText: '"下次再聊！"你匆匆离开。虽然节省了时间，但也许错过了什么。'
            }
          }
        ]
      },
      {
        id: 'stage_2b',
        title: '擦肩而过',
        description: '你拿着咖啡准备离开，突然老同学抬头看到了你。',
        choices: [
          {
            id: 'choice_wave',
            text: '😅 尴尬地挥挥手打招呼',
            outcome: {
              isEnding: true,
              rewards: {
                reputation: 2
              },
              resultText: '"嗨！改天聊！"你们简单打了个招呼。气氛有点尴尬。'
            }
          },
          {
            id: 'choice_pretend',
            text: '🚶 假装没看见，快步离开',
            outcome: {
              isEnding: true,
              penalties: {
                reputation: 5
              },
              resultText: '你低头快步走出咖啡店。希望对方没注意到你...'
            }
          }
        ]
      }
    ],
    participantCount: 2847,
    createdAt: Date.now() - 86400000
  },

  // ==================== 生活类事件 ====================
  {
    id: 'evt_subway_seat',
    title: '地铁让座',
    description: '早高峰的地铁上，你好不容易抢到一个座位。这时一位抱着孩子的妈妈挤到了你面前。',
    cover: '/static/events/subway.png',
    type: 'social',
    status: 'active',
    requirements: {},
    entryFee: { energy: 10 },
    stages: [
      {
        id: 'stage_1',
        title: '拥挤的车厢',
        description: '那位妈妈看起来很疲惫，怀里的孩子也在哭闹。周围的人都在低头看手机。',
        choices: [
          {
            id: 'choice_give',
            text: '💺 起身让座',
            cost: { energy: 5 },
            outcome: {
              nextStageId: 'stage_2a',
              rewards: {
                reputation: 15,
                tags: ['kindhearted']
              },
              resultText: '"谢谢你！"妈妈感激地坐下，孩子也安静了。'
            }
          },
          {
            id: 'choice_pretend',
            text: '📱 假装没看见，继续看手机',
            outcome: {
              nextStageId: 'stage_2b',
              rewards: {
                energy: 5
              },
              resultText: '你假装专注地看着手机...'
            }
          },
          {
            id: 'choice_help',
            text: '🤱 帮忙抱一下孩子，让妈妈休息',
            cost: { energy: 10 },
            outcome: {
              nextStageId: 'stage_2c',
              rewards: {
                reputation: 25,
                tags: ['kindhearted', 'warmhearted']
              },
              resultText: '妈妈惊讶又感动地把孩子递给你，自己终于能喘口气。'
            }
          }
        ]
      },
      {
        id: 'stage_2a',
        title: '感谢的微笑',
        description: '周围有人向你投来赞许的目光。那位妈妈一直在说谢谢。',
        choices: [
          {
            id: 'choice_smile',
            text: '😊 微笑点头，戴上耳机',
            outcome: {
              isEnding: true,
              rewards: {
                reputation: 5
              },
              resultText: '你感觉今天的心情特别好。做好事的感觉真不错。'
            }
          }
        ]
      },
      {
        id: 'stage_2b',
        title: '内心的纠结',
        description: '你假装专注地看着手机，但心里有点不是滋味。旁边有人小声议论。',
        choices: [
          {
            id: 'choice_finally_give',
            text: '😓 算了，还是让座吧',
            outcome: {
              isEnding: true,
              rewards: {
                reputation: 8
              },
              resultText: '你最终还是站了起来。虽然晚了点，但做对的事永远不晚。'
            }
          },
          {
            id: 'choice_stay',
            text: '😤 凭什么要我让，继续坐着',
            outcome: {
              isEnding: true,
              penalties: {
                reputation: 10
              },
              resultText: '那位妈妈在下一站下车了。你松了口气，但心里有点空落落的。'
            }
          }
        ]
      },
      {
        id: 'stage_2c',
        title: '意外的收获',
        description: '妈妈非常感动，你们聊了起来。原来她是一位儿童教育专家。',
        choices: [
          {
            id: 'choice_chat',
            text: '💬 继续聊天，交换联系方式',
            outcome: {
              isEnding: true,
              rewards: {
                reputation: 15,
                tags: ['connector'],
                items: ['item_activity_coupon']
              },
              resultText: '她给了你一张她公司的亲子活动券，说以后有孩子了可以用。你们成了朋友。'
            }
          }
        ]
      }
    ],
    participantCount: 5621,
    createdAt: Date.now() - 172800000
  },

  // ==================== 工作类事件 ====================
  {
    id: 'evt_overtime_request',
    title: '加班请求',
    description: '周五下午5点，老板突然走过来说有个紧急项目需要今晚完成。而你已经和朋友约好了晚上的聚会。',
    cover: '/static/events/office.png',
    type: 'challenge',
    status: 'active',
    requirements: {},
    entryFee: { time: 20, energy: 15 },
    stages: [
      {
        id: 'stage_1',
        title: '两难选择',
        description: '老板说这个项目很重要，完成后会有额外奖金。但你已经放了朋友两次鸽子了。',
        choices: [
          {
            id: 'choice_overtime',
            text: '💼 答应加班，给朋友发消息道歉',
            cost: { time: 180, energy: 30 },
            outcome: {
              nextStageId: 'stage_2a',
              rewards: {
                time: 100,
                tags: ['workaholic']
              },
              resultText: '你发了消息给朋友："抱歉，公司有急事..."'
            }
          },
          {
            id: 'choice_refuse',
            text: '🙅 委婉拒绝，说已经有重要约会',
            outcome: {
              nextStageId: 'stage_2b',
              rewards: {
                reputation: 10,
                tags: ['work_life_balance']
              },
              resultText: '"不好意思老板，今天真的有重要的事..."'
            }
          },
          {
            id: 'choice_negotiate',
            text: '🤝 提议明天一早来加班完成',
            cost: { energy: 10 },
            outcome: {
              nextStageId: 'stage_2c',
              rewards: {
                reputation: 5,
                time: 20,
                tags: ['negotiator']
              },
              resultText: '"老板，我可以明天早上7点来，保证中午前完成，您看行吗？"'
            }
          }
        ]
      },
      {
        id: 'stage_2a',
        title: '深夜办公室',
        description: '你完成了项目，老板很满意，说下个月考虑给你加薪。但朋友的回复只有一个"哦"。',
        choices: [
          {
            id: 'choice_go_home',
            text: '🚕 叹口气，打车回家',
            outcome: {
              isEnding: true,
              rewards: {
                time: 50
              },
              penalties: {
                reputation: 15
              },
              resultText: '凌晨1点，你终于到家。手机里朋友圈刷到了聚会的照片，大家玩得很开心...'
            }
          }
        ]
      },
      {
        id: 'stage_2b',
        title: '愉快的聚会',
        description: '朋友们很开心你能来。你们聊到很晚，感觉压力都释放了。',
        choices: [
          {
            id: 'choice_enjoy',
            text: '🎉 这才是生活！',
            outcome: {
              isEnding: true,
              rewards: {
                energy: 20,
                reputation: 15
              },
              resultText: '周一老板虽然有点不高兴，但也没说什么。朋友们都说你变了，变得更懂生活了。'
            }
          }
        ]
      },
      {
        id: 'stage_2c',
        title: '双赢方案',
        description: '老板想了想，同意了你的提议。你准时赴约，第二天早起完成了工作。',
        choices: [
          {
            id: 'choice_perfect',
            text: '✨ 完美解决！',
            outcome: {
              isEnding: true,
              rewards: {
                time: 30,
                reputation: 20,
                energy: 10
              },
              resultText: '老板对你的责任心很满意，朋友们也玩得很开心。这就是成年人的智慧！'
            }
          }
        ]
      }
    ],
    participantCount: 3892,
    createdAt: Date.now() - 259200000
  },

  // ==================== 成长类事件 ====================
  {
    id: 'evt_skill_learning',
    title: '新技能学习',
    description: '你发现一个很棒的在线课程，可以学习一项新技能。但需要投入不少时间和精力。',
    cover: '/static/events/learning.png',
    type: 'story',
    status: 'active',
    requirements: {},
    entryFee: { time: 30 },
    stages: [
      {
        id: 'stage_1',
        title: '选择方向',
        description: '有几个不同的课程可以选择，每个都很有吸引力。',
        choices: [
          {
            id: 'choice_coding',
            text: '💻 学习编程，提升工作效率',
            cost: { time: 60, energy: 20 },
            outcome: {
              nextStageId: 'stage_2',
              rewards: {
                tags: ['techie']
              },
              resultText: '你开始学习Python编程，发现自动化真的能节省很多时间！'
            }
          },
          {
            id: 'choice_cooking',
            text: '🍳 学习烹饪，享受美食生活',
            cost: { time: 45, energy: 15 },
            outcome: {
              nextStageId: 'stage_2',
              rewards: {
                tags: ['foodie']
              },
              resultText: '你跟着视频学做了第一道菜，虽然卖相一般，但味道还不错！'
            }
          },
          {
            id: 'choice_fitness',
            text: '🏃 学习健身，塑造好身材',
            cost: { time: 60, energy: 30 },
            outcome: {
              nextStageId: 'stage_2',
              rewards: {
                tags: ['fitness_lover']
              },
              resultText: '你开始跟着健身教程锻炼，第二天浑身酸痛，但感觉很充实！'
            }
          }
        ]
      },
      {
        id: 'stage_2',
        title: '坚持的考验',
        description: '课程进行到一半，你感觉有些疲惫。工作也很忙，是继续坚持还是暂时休息？',
        choices: [
          {
            id: 'choice_continue',
            text: '💪 坚持完成课程',
            cost: { energy: 20 },
            outcome: {
              isEnding: true,
              rewards: {
                reputation: 25,
                tags: ['persistent']
              },
              resultText: '你坚持完成了整个课程！虽然很累，但收获满满。朋友们都说你变得不一样了。'
            }
          },
          {
            id: 'choice_rest',
            text: '😴 先休息，改天继续',
            outcome: {
              isEnding: true,
              rewards: {
                energy: 15
              },
              resultText: '你决定休息一下。但不知不觉，这个课程就被搁置了...也许下次会完成吧。'
            }
          }
        ]
      }
    ],
    participantCount: 1256,
    createdAt: Date.now() - 43200000
  }
]
