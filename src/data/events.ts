import type { GameEvent, ItemDrop } from '@/types'

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
              rewards: { reputation: 5, tags: ['social_butterfly'] },
              resultText: '"哇！真的是你！"老同学惊喜地站起来，热情地和你拥抱。'
            }
          },
          {
            id: 'choice_ignore',
            text: '📱 假装没看见，继续点单',
            outcome: {
              nextStageId: 'stage_2b',
              rewards: { time: 10 },
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
              rewards: { reputation: 15, tags: ['connector'], itemDrops: [
                { itemId: 'item_coffee_coupon', dropRate: 0.6 },
                { itemId: 'item_notebook', dropRate: 0.25 }
              ] },
              resultText: '你们加了微信，约好下周一起吃饭。说不定这是一个新的职业机会！'
            }
          },
          {
            id: 'choice_brief',
            text: '⏰ 简单寒暄后告别，赶时间',
            outcome: {
              isEnding: true,
              rewards: { reputation: 3, time: 20, itemDrops: [
                { itemId: 'item_coffee_coupon', dropRate: 0.3 }
              ] },
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
              rewards: { reputation: 2, itemDrops: [
                { itemId: 'item_coffee_coupon', dropRate: 0.15 }
              ] },
              resultText: '"嗨！改天聊！"你们简单打了个招呼。气氛有点尴尬。'
            }
          },
          {
            id: 'choice_pretend',
            text: '🚶 假装没看见，快步离开',
            outcome: {
              isEnding: true,
              penalties: { reputation: 5 },
              resultText: '你低头快步走出咖啡店。希望对方没注意到你...'
            }
          }
        ]
      }
    ],
    participantCount: 2847,
    createdAt: Date.now() - 86400000
  },

  // ==================== 生活类事件（基于选择决策哲学框架重新设计） ====================
  {
    id: 'evt_subway_seat',
    title: '通勤时刻',
    description: '早高峰的地铁上，你好不容易抢到一个座位，正准备利用通勤时间处理紧急工作。这时一位抱着孩子的妈妈挤到了你面前。',
    cover: '/static/events/subway.png',
    type: 'social',
    status: 'active',
    requirements: {},
    entryFee: { energy: 10 },
    stages: [
      {
        id: 'stage_1',
        title: '拥挤的车厢',
        description: '那位妈妈看起来很疲惫，怀里的孩子在哭闹。你的手机上还有三封未回复的紧急邮件，今天下午就是季度汇报的截止时间。周围的人都在低头看手机，没有人动。',
        choices: [
          {
            id: 'choice_empathy',
            text: '💺 立刻起身让座——看到孩子哭，心里就难受',
            cost: { energy: 5 },
            outcome: {
              nextStageId: 'stage_empathy',
              rewards: { reputation: 10, tags: ['empathetic'] },
              resultText: '你几乎没有犹豫就站了起来。妈妈感激地坐下，孩子渐渐安静了。你扶着扶手，心里觉得踏实。'
            }
          },
          {
            id: 'choice_pragmatic',
            text: '💻 戴上降噪耳机，专注处理工作——季度汇报不能出差错',
            cost: { energy: 5 },
            outcome: {
              nextStageId: 'stage_pragmatic',
              rewards: { time: 15, tags: ['focused'] },
              resultText: '你戴上耳机，打开邮件开始回复。周围的噪音渐渐远去，你的注意力完全集中在屏幕上。'
            }
          },
          {
            id: 'choice_principle',
            text: '📢 让座并环顾四周——这不该只是一个人的事',
            cost: { energy: 10 },
            outcome: {
              nextStageId: 'stage_principle',
              rewards: { reputation: 8, tags: ['principled'] },
              resultText: '你站起来让座，然后看向周围的乘客。"这位妈妈抱着孩子挺辛苦的，大家方便的话可以帮忙腾个位置。"'
            }
          },
          {
            id: 'choice_creative',
            text: '🚉 示意妈妈稍等，提前一站下车换乘——换条路线也不迟',
            cost: { time: 10 },
            outcome: {
              nextStageId: 'stage_creative',
              rewards: { tags: ['adaptable'] },
              resultText: '你微笑着对妈妈说"您坐这儿吧，我下一站就到了。"其实你还有四站，但换乘也不过多花十分钟。'
            }
          }
        ]
      },

      // ====== 共情本能路线：直觉 & 利他 ======
      {
        id: 'stage_empathy',
        title: '无声的温暖',
        description: '你站在车厢里，扶着扶手。妈妈轻声哄着孩子，孩子渐渐睡着了。她抬头看了你一眼，眼里满是感激。到站的时候，她站起来想把座位还给你。',
        choices: [
          {
            id: 'choice_empathy_quiet',
            text: '😊 摇摇头，示意她继续坐——不用在意，举手之劳',
            outcome: {
              isEnding: true,
              rewards: { reputation: 10, energy: 5, itemDrops: [
                { itemId: 'item_plant_pot', dropRate: 0.35 }
              ] },
              resultText: '你摇了摇头，微笑着走出车厢。阳光照在脸上，你觉得今天的空气格外清新。有时候，不需要理由，不需要回报，只是因为你看见了。'
            }
          },
          {
            id: 'choice_empathy_connect',
            text: '💬 趁机聊几句——她看起来也不容易',
            cost: { time: 10 },
            outcome: {
              isEnding: true,
              rewards: { reputation: 15, tags: ['connector'], itemDrops: [
                { itemId: 'item_activity_coupon', dropRate: 0.2 },
                { itemId: 'item_plant_pot', dropRate: 0.4 }
              ] },
              resultText: '你们聊了几句。她是独自带孩子去看病的，丈夫在外地出差。"谢谢你，今天遇到你真好。"她说。你在心里默默祝福她一切顺利。城市很大，但善意让距离变短了。'
            }
          }
        ]
      },

      // ====== 务实主义路线：理性 & 利我 ======
      {
        id: 'stage_pragmatic',
        title: '效率与代价',
        description: '你成功回复了两封紧急邮件，季度汇报的数据也整理好了。但你注意到那位妈妈一直站着，孩子哭得更厉害了。旁边一位老人站起来给她让了座。你的目光和老人交汇了一瞬。',
        choices: [
          {
            id: 'choice_pragmatic_reflect',
            text: '🤔 工作处理完了，心里却有些说不清的滋味',
            outcome: {
              isEnding: true,
              rewards: { time: 20, reputation: 3, itemDrops: [
                { itemId: 'item_notebook', dropRate: 0.4 }
              ] },
              resultText: '下午的季度汇报很顺利，老板对你的数据准备赞不绝口。晚上回家的路上，你又想起了那位老人的眼神——不是责备，更像是一种平静的理解。你打开手机，给一个公益项目捐了一笔钱。每个人表达善意的方式不同，你选择了自己的方式。'
            }
          },
          {
            id: 'choice_pragmatic_firm',
            text: '📊 专注是一种能力——我用我的方式创造价值',
            outcome: {
              isEnding: true,
              rewards: { time: 25, tags: ['determined'], itemDrops: [
                { itemId: 'item_notebook', dropRate: 0.5 },
                { itemId: 'item_coffee_coupon', dropRate: 0.3 }
              ] },
              resultText: '季度汇报你拿了部门第一，老板暗示下个月会有晋升机会。你知道，每个人都有自己的战场。今天你选择了在自己的战场上全力以赴。这不是冷漠，这是一个成年人的取舍。'
            }
          }
        ]
      },

      // ====== 原则主义路线：理性 & 利他 ======
      {
        id: 'stage_principle',
        title: '涟漪效应',
        description: '你的话让车厢里安静了一瞬。有人抬起头，有人假装没听见。过了几秒，一个年轻人也站了起来，把座位让给了旁边一位拄拐的老人。"谢谢你开口，"他小声对你说，"我其实一直想站起来，但不好意思。"',
        choices: [
          {
            id: 'choice_principle_lead',
            text: '🌊 有时候，只需要一个人先开口',
            outcome: {
              isEnding: true,
              rewards: { reputation: 20, tags: ['leader'], itemDrops: [
                { itemId: 'item_activity_coupon', dropRate: 0.15 },
                { itemId: 'item_plant_pot', dropRate: 0.45 }
              ] },
              resultText: '那天的车厢和平时不太一样。有人开始聊天，有人帮忙拿行李，一个小女孩把手里的糖分给了旁边的小朋友。你不确定这些是不是因为你，但你知道——改变一个空间的氛围，有时候只需要一个人愿意打破沉默。'
            }
          },
          {
            id: 'choice_principle_think',
            text: '📝 这件事让你开始思考：公共空间的规则到底该由谁来维护？',
            cost: { energy: 5 },
            outcome: {
              isEnding: true,
              rewards: { reputation: 15, tags: ['thinker'], itemDrops: [
                { itemId: 'item_notebook', dropRate: 0.55 }
              ] },
              resultText: '下了地铁，你在备忘录里写下了一些想法。关于公共空间、关于沉默的代价、关于"旁观者效应"。也许有一天，你会把这些想法变成一篇文章，或者一个项目。改变世界的方式有很多种，不一定都要在地铁上。'
            }
          }
        ]
      },

      // ====== 灵活变通路线：直觉 & 利我 ======
      {
        id: 'stage_creative',
        title: '意外的风景',
        description: '你在一个陌生的站台下了车。这个站你从来没来过，站厅里有一面巨大的壁画，画的是这座城市一百年前的样子。你有十分钟的换乘时间。',
        choices: [
          {
            id: 'choice_creative_explore',
            text: '🎨 驻足欣赏壁画——难得发现这样的风景',
            cost: { time: 5 },
            outcome: {
              isEnding: true,
              rewards: { reputation: 8, energy: 10, tags: ['explorer'], itemDrops: [
                { itemId: 'item_travel_bag', dropRate: 0.2 },
                { itemId: 'item_plant_pot', dropRate: 0.35 }
              ] },
              resultText: '你站在壁画前，看着一百年前的街道和人群。那时候没有地铁，没有智能手机，人们走在泥路上，但笑容和现在一样。你拍了张照片，发现这个站台藏着好几处这样的艺术作品。有时候，绕一点路，反而能看到不一样的风景。你决定以后每周随机选一个陌生的站下车看看。'
            }
          },
          {
            id: 'choice_creative_rush',
            text: '🏃 快步换乘——冒险归冒险，不能真的迟到',
            outcome: {
              isEnding: true,
              rewards: { time: 10, tags: ['adaptable'], itemDrops: [
                { itemId: 'item_coffee_coupon', dropRate: 0.25 }
              ] },
              resultText: '你小跑着穿过换乘通道，刚好赶上下一班车。坐下来的时候，你发现心情意外地轻松。那位妈妈有了座位，你也没有耽误太多时间。生活中很多看似两难的选择，其实都有第三条路——只要你愿意动动脑筋，跳出非此即彼的框架。'
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
          { id: 'choice_overtime', text: '💼 答应加班，给朋友发消息道歉', cost: { time: 180, energy: 30 }, outcome: { nextStageId: 'stage_2a', rewards: { time: 100, tags: ['workaholic'] }, resultText: '你发了消息给朋友："抱歉，公司有急事..."' } },
          { id: 'choice_refuse', text: '🙅 委婉拒绝，说已经有重要约会', outcome: { nextStageId: 'stage_2b', rewards: { reputation: 10, tags: ['work_life_balance'] }, resultText: '"不好意思老板，今天真的有重要的事..."' } },
          { id: 'choice_negotiate', text: '🤝 提议明天一早来加班完成', cost: { energy: 10 }, outcome: { nextStageId: 'stage_2c', rewards: { reputation: 5, time: 20, tags: ['negotiator'] }, resultText: '"老板，我可以明天早上7点来，保证中午前完成，您看行吗？"' } }
        ]
      },
      {
        id: 'stage_2a',
        title: '深夜办公室',
        description: '你完成了项目，老板很满意，说下个月考虑给你加薪。但朋友的回复只有一个"哦"。',
        choices: [
          { id: 'choice_go_home', text: '🚕 叹口气，打车回家', outcome: { isEnding: true, rewards: { time: 50, itemDrops: [{ itemId: 'item_coffee_coupon', dropRate: 0.5 }, { itemId: 'item_notebook', dropRate: 0.3 }] }, penalties: { reputation: 15 }, resultText: '凌晨1点，你终于到家。手机里朋友圈刷到了聚会的照片，大家玩得很开心...' } }
        ]
      },
      {
        id: 'stage_2b',
        title: '愉快的聚会',
        description: '朋友们很开心你能来。你们聊到很晚，感觉压力都释放了。',
        choices: [
          { id: 'choice_enjoy', text: '🎉 这才是生活！', outcome: { isEnding: true, rewards: { energy: 20, reputation: 15, itemDrops: [{ itemId: 'item_takeout_coupon', dropRate: 0.45 }, { itemId: 'item_yoga_mat', dropRate: 0.15 }] }, resultText: '周一老板虽然有点不高兴，但也没说什么。朋友们都说你变了，变得更懂生活了。' } }
        ]
      },
      {
        id: 'stage_2c',
        title: '双赢方案',
        description: '老板想了想，同意了你的提议。你准时赴约，第二天早起完成了工作。',
        choices: [
          { id: 'choice_perfect', text: '✨ 完美解决！', outcome: { isEnding: true, rewards: { time: 30, reputation: 20, energy: 10, itemDrops: [{ itemId: 'item_coffee_coupon', dropRate: 0.55 }, { itemId: 'item_notebook', dropRate: 0.35 }, { itemId: 'item_travel_bag', dropRate: 0.1 }] }, resultText: '老板对你的责任心很满意，朋友们也玩得很开心。这就是成年人的智慧！' } }
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
          { id: 'choice_coding', text: '💻 学习编程，提升工作效率', cost: { time: 60, energy: 20 }, outcome: { nextStageId: 'stage_2', rewards: { tags: ['techie'] }, resultText: '你开始学习Python编程，发现自动化真的能节省很多时间！' } },
          { id: 'choice_cooking', text: '🍳 学习烹饪，享受美食生活', cost: { time: 45, energy: 15 }, outcome: { nextStageId: 'stage_2', rewards: { tags: ['foodie'] }, resultText: '你跟着视频学做了第一道菜，虽然卖相一般，但味道还不错！' } },
          { id: 'choice_fitness', text: '🏃 学习健身，塑造好身材', cost: { time: 60, energy: 30 }, outcome: { nextStageId: 'stage_2', rewards: { tags: ['fitness_lover'] }, resultText: '你开始跟着健身教程锻炼，第二天浑身酸痛，但感觉很充实！' } }
        ]
      },
      {
        id: 'stage_2',
        title: '坚持的考验',
        description: '课程进行到一半，你感觉有些疲惫。工作也很忙，是继续坚持还是暂时休息？',
        choices: [
          { id: 'choice_continue', text: '💪 坚持完成课程', cost: { energy: 20 }, outcome: { isEnding: true, rewards: { reputation: 25, tags: ['persistent'], itemDrops: [{ itemId: 'item_notebook', dropRate: 0.6 }, { itemId: 'item_yoga_mat', dropRate: 0.2 }, { itemId: 'item_travel_bag', dropRate: 0.08 }] }, resultText: '你坚持完成了整个课程！虽然很累，但收获满满。朋友们都说你变得不一样了。' } },
          { id: 'choice_rest', text: '😴 先休息，改天继续', outcome: { isEnding: true, rewards: { energy: 15, itemDrops: [{ itemId: 'item_takeout_coupon', dropRate: 0.3 }] }, resultText: '你决定休息一下。但不知不觉，这个课程就被搁置了...也许下次会完成吧。' } }
        ]
      }
    ],
    participantCount: 1256,
    createdAt: Date.now() - 43200000
  },

  // ==================== 新增：冒险类事件 ====================
  {
    id: 'evt_midnight_delivery',
    title: '深夜外卖',
    description: '凌晨1点，你饿得睡不着。外卖平台上有一家评分4.9的神秘小店，评论都说"改变人生的味道"。',
    cover: '/static/events/delivery.png',
    type: 'story',
    status: 'active',
    requirements: {},
    entryFee: { time: 10, energy: 5 },
    stages: [
      {
        id: 'stage_1',
        title: '深夜的诱惑',
        description: '这家店只在凌晨营业，菜单上只有三个选项，每个都标着"限量"。配送费居然要38元。',
        choices: [
          { id: 'choice_order', text: '🍜 管它呢，下单！', cost: { time: 30 }, outcome: { nextStageId: 'stage_2a', rewards: { tags: ['adventurous'] }, resultText: '你果断下了单。配送预计45分钟，你开始期待...' } },
          { id: 'choice_cook', text: '🍳 算了，自己煮碗泡面', cost: { energy: 5 }, outcome: { nextStageId: 'stage_2b', rewards: { energy: 10 }, resultText: '你打开橱柜，发现只剩最后一包泡面了。' } },
          { id: 'choice_sleep', text: '😤 忍住！减肥要紧', outcome: { isEnding: true, rewards: { energy: 20, itemDrops: [{ itemId: 'item_yoga_mat', dropRate: 0.2 }] }, resultText: '你翻来覆去，最终在饥饿中睡着了。第二天早上称体重，轻了0.5kg。值了？' } }
        ]
      },
      {
        id: 'stage_2a',
        title: '等待的煎熬',
        description: '外卖迟到了20分钟。你正准备打电话投诉，门铃响了。打开一看——骑手居然是你的前同事老张。',
        choices: [
          { id: 'choice_chat_zhang', text: '😮 老张？！你怎么在送外卖？', outcome: { nextStageId: 'stage_3a', rewards: { reputation: 5 }, resultText: '"嘿！好久不见！"老张笑着说，"这是我的副业，白天我在做自己的创业项目。"' } },
          { id: 'choice_take_food', text: '📦 接过外卖，礼貌道谢', outcome: { isEnding: true, rewards: { energy: 15, itemDrops: [{ itemId: 'item_takeout_coupon', dropRate: 0.5 }] }, resultText: '你接过外卖，味道确实惊艳。但总觉得错过了什么故事。' } }
        ]
      },
      {
        id: 'stage_2b',
        title: '泡面哲学',
        description: '水烧开了，泡面的香气弥漫。你突然想起小时候，爸妈加班时你一个人在家煮泡面的日子。',
        choices: [
          { id: 'choice_enjoy_noodle', text: '🍜 加个蛋，享受这份简单', outcome: { isEnding: true, rewards: { energy: 15, reputation: 3, itemDrops: [{ itemId: 'item_takeout_coupon', dropRate: 0.35 }, { itemId: 'item_plant_pot', dropRate: 0.15 }] }, resultText: '热腾腾的泡面，配上一个溏心蛋。有时候，幸福就是这么简单。你拍了张照发朋友圈，收获了32个赞。' } }
        ]
      },
      {
        id: 'stage_3a',
        title: '深夜长谈',
        description: '老张说他辞职后一直在做AI相关的创业，白天写代码晚上送外卖攒启动资金。他问你要不要一起干。',
        choices: [
          { id: 'choice_join', text: '🚀 有意思！详细聊聊', cost: { time: 60 }, outcome: { isEnding: true, rewards: { reputation: 30, tags: ['adventurous', 'connector'], itemDrops: [{ itemId: 'item_notebook', dropRate: 0.55 }, { itemId: 'item_coffee_coupon', dropRate: 0.65 }, { itemId: 'item_travel_bag', dropRate: 0.12 }] }, resultText: '你们聊到凌晨4点。老张的项目确实有前景，你答应周末去他的"车库办公室"看看。也许这就是命运的安排。' } },
          { id: 'choice_decline', text: '😅 我还是安稳上班吧', outcome: { isEnding: true, rewards: { reputation: 5, energy: 10, itemDrops: [{ itemId: 'item_takeout_coupon', dropRate: 0.4 }] }, resultText: '"理解理解。"老张笑着离开了。三个月后你在新闻上看到他的公司拿到了天使轮...' } }
        ]
      }
    ],
    participantCount: 8234,
    createdAt: Date.now() - 36000000
  },

  // ==================== 新增：职场类事件 ====================
  {
    id: 'evt_meeting_disaster',
    title: '会议翻车',
    description: '重要客户演示会上，你的PPT突然打不开了。所有人都在看着你，投影仪上显示着蓝屏。',
    cover: '/static/events/meeting.png',
    type: 'challenge',
    status: 'active',
    requirements: {},
    entryFee: { energy: 20 },
    stages: [
      {
        id: 'stage_1',
        title: '危机时刻',
        description: '客户的VP正在看手表，你的老板脸色已经变了。IT说最快也要15分钟才能到。你只有自己想办法。',
        choices: [
          { id: 'choice_whiteboard', text: '🎨 用白板手绘方案，即兴演讲', cost: { energy: 25 }, outcome: { nextStageId: 'stage_2a', rewards: { reputation: 20, tags: ['improviser'] }, resultText: '你深吸一口气，走到白板前开始画图。"各位，让我换一种更直观的方式来展示..."' } },
          { id: 'choice_phone', text: '📱 用手机打开备份，投屏演示', cost: { energy: 10 }, outcome: { nextStageId: 'stage_2b', rewards: { reputation: 10, tags: ['prepared'] }, resultText: '你掏出手机，打开云盘里的备份文件。虽然屏幕小了点，但至少能看。' } },
          { id: 'choice_stall', text: '☕ 提议先休息10分钟，等IT来修', cost: { time: 15 }, outcome: { nextStageId: 'stage_2c', rewards: { time: 10 }, resultText: '"各位，要不我们先喝杯咖啡？"你尴尬地笑了笑。' } }
        ]
      },
      {
        id: 'stage_2a',
        title: '白板奇迹',
        description: '你的即兴演讲出乎意料地好。没有PPT的束缚，你反而讲得更自然、更有感染力。客户VP放下了手表，开始认真听。',
        choices: [
          { id: 'choice_close_deal', text: '🤝 趁热打铁，当场敲定合作', cost: { energy: 15 }, outcome: { isEnding: true, rewards: { reputation: 40, energy: 10, tags: ['closer'], itemDrops: [{ itemId: 'item_notebook', dropRate: 0.7 }, { itemId: 'item_coffee_coupon', dropRate: 0.5 }, { itemId: 'item_travel_bag', dropRate: 0.15 }] }, resultText: '客户VP站起来鼓掌："这是我见过最真诚的提案。"当天就签了合同。你的老板事后说："以后别做PPT了。"' } }
        ]
      },
      {
        id: 'stage_2b',
        title: '小屏幕大智慧',
        description: '手机投屏虽然不够完美，但你的准备工作让客户印象深刻。"看得出你们很重视这次合作。"',
        choices: [
          { id: 'choice_followup', text: '📧 会后立即发送完整方案', outcome: { isEnding: true, rewards: { reputation: 25, tags: ['reliable'], itemDrops: [{ itemId: 'item_notebook', dropRate: 0.55 }, { itemId: 'item_coffee_coupon', dropRate: 0.4 }] }, resultText: '你在会后30分钟内就发出了完整方案。客户回复："效率很高，我们内部讨论一下。"一周后，合同到了。' } }
        ]
      },
      {
        id: 'stage_2c',
        title: '尴尬的等待',
        description: '休息期间，客户VP接了个电话，表情不太好。你的老板把你拉到角落："你最好想想办法..."',
        choices: [
          { id: 'choice_save', text: '🏃 冲回工位重新做一份简版PPT', cost: { time: 20, energy: 20 }, outcome: { isEnding: true, rewards: { reputation: 15, tags: ['resilient'], itemDrops: [{ itemId: 'item_coffee_coupon', dropRate: 0.45 }] }, resultText: '你用10分钟做了一份极简版PPT，虽然不够精美，但核心数据都在。客户说："下次准备充分点。"勉强过关。' } },
          { id: 'choice_give_up', text: '😞 向客户道歉，提议改期', outcome: { isEnding: true, penalties: { reputation: 20 }, resultText: '客户VP说："我们的时间很宝贵。"会议改期后，这个客户最终选择了竞争对手...' } }
        ]
      }
    ],
    participantCount: 4567,
    createdAt: Date.now() - 120000000
  },

  // ==================== 新增：情感类事件 ====================
  {
    id: 'evt_old_photo',
    title: '旧照片',
    description: '搬家整理时，你在箱底发现了一本泛黄的相册。翻开第一页，是你和爷爷的合照。爷爷已经走了三年了。',
    cover: '/static/events/photo.png',
    type: 'story',
    status: 'active',
    requirements: {},
    entryFee: { time: 20 },
    stages: [
      {
        id: 'stage_1',
        title: '记忆的闸门',
        description: '照片里的你还是个小学生，爷爷抱着你站在老家的院子里。那棵石榴树现在应该很大了吧。',
        choices: [
          { id: 'choice_continue_look', text: '📖 继续翻看相册', cost: { time: 30 }, outcome: { nextStageId: 'stage_2a', rewards: { reputation: 5 }, resultText: '你一页一页地翻着，每张照片都是一段故事。眼眶不知不觉湿了。' } },
          { id: 'choice_call_family', text: '📞 给爸妈打个电话', cost: { time: 15, energy: 5 }, outcome: { nextStageId: 'stage_2b', rewards: { reputation: 10, tags: ['family_first'] }, resultText: '电话响了三声就接了。"妈，我在整理东西，看到爷爷的照片了..."' } },
          { id: 'choice_put_away', text: '📦 先收起来，继续搬家', outcome: { isEnding: true, rewards: { time: 30, itemDrops: [{ itemId: 'item_plant_pot', dropRate: 0.2 }] }, resultText: '你把相册小心地放进新家的书柜里。总有一天会好好看的。总有一天。' } }
        ]
      },
      {
        id: 'stage_2a',
        title: '时光碎片',
        description: '最后一页夹着一封信，是爷爷的字迹："等你长大了再看。"信封上写着你的名字。',
        choices: [
          { id: 'choice_read_letter', text: '✉️ 打开信封', cost: { energy: 10 }, outcome: { isEnding: true, rewards: { reputation: 30, tags: ['sentimental', 'family_first'], itemDrops: [{ itemId: 'item_notebook', dropRate: 0.5 }, { itemId: 'item_plant_pot', dropRate: 0.4 }, { itemId: 'item_activity_coupon', dropRate: 0.1 }] }, resultText: '"孩子，爷爷不知道你什么时候会看到这封信。人这一辈子，最重要的不是赚多少钱，而是身边有没有真心对你的人。照顾好自己，也照顾好你爱的人。"你哭了很久。但心里，好像有什么东西变得更坚定了。' } }
        ]
      },
      {
        id: 'stage_2b',
        title: '电话那头',
        description: '妈妈在电话那头沉默了一会儿，然后说："你爷爷最疼你了。上次回来是什么时候？"',
        choices: [
          { id: 'choice_go_home', text: '🏠 这周末我回去看看', cost: { time: 60 }, outcome: { isEnding: true, rewards: { reputation: 25, energy: 20, tags: ['family_first'], itemDrops: [{ itemId: 'item_plant_pot', dropRate: 0.55 }, { itemId: 'item_activity_coupon', dropRate: 0.2 }] }, resultText: '周末你回了老家。院子里的石榴树结满了果实，妈妈做了你最爱吃的红烧肉。你在爷爷的遗像前放了一颗石榴。"爷爷，我回来了。"' } },
          { id: 'choice_busy', text: '😔 最近太忙了，下次吧', outcome: { isEnding: true, rewards: { time: 20, itemDrops: [{ itemId: 'item_coffee_coupon', dropRate: 0.2 }] }, penalties: { reputation: 5 }, resultText: '"好吧，你忙你的。"妈妈的语气有点失落。你挂了电话，看着窗外的城市夜景，突然觉得很孤独。' } }
        ]
      }
    ],
    participantCount: 12450,
    createdAt: Date.now() - 200000000
  },

  // ==================== 新增：奇遇类事件 ====================
  {
    id: 'evt_stray_cat',
    title: '流浪猫',
    description: '下班路上，一只橘猫蹲在你家楼下，用一双圆溜溜的大眼睛盯着你看。它看起来又脏又瘦。',
    cover: '/static/events/cat.png',
    type: 'social',
    status: 'active',
    requirements: {},
    entryFee: { energy: 8 },
    stages: [
      {
        id: 'stage_1',
        title: '命运的相遇',
        description: '橘猫"喵"了一声，蹭了蹭你的裤腿。你注意到它的左耳有个小缺口，可能是打架留下的。',
        choices: [
          { id: 'choice_feed', text: '🐟 去便利店买罐猫粮喂它', cost: { time: 15, energy: 5 }, outcome: { nextStageId: 'stage_2a', rewards: { reputation: 10, tags: ['animal_lover'] }, resultText: '你买了一罐金枪鱼猫粮。橘猫吃得狼吞虎咽，吃完还舔了舔你的手。' } },
          { id: 'choice_adopt', text: '🏠 直接抱回家！', cost: { energy: 15 }, outcome: { nextStageId: 'stage_2b', rewards: { reputation: 15, tags: ['animal_lover', 'adventurous'] }, resultText: '你小心翼翼地抱起橘猫。它居然没有挣扎，反而在你怀里打起了呼噜。' } },
          { id: 'choice_walk_away', text: '🚶 拍张照发朋友圈，然后走了', outcome: { isEnding: true, rewards: { reputation: 2, itemDrops: [{ itemId: 'item_plant_pot', dropRate: 0.1 }] }, resultText: '你发了条朋友圈："遇到一只好可爱的橘猫！"收获了58个赞。但第二天路过时，猫已经不在了。' } }
        ]
      },
      {
        id: 'stage_2a',
        title: '每日之约',
        description: '从那天起，橘猫每天都在楼下等你。邻居说："这猫认你了。"',
        choices: [
          { id: 'choice_finally_adopt', text: '🐱 好吧，你赢了，跟我回家', cost: { energy: 10 }, outcome: { isEnding: true, rewards: { reputation: 20, energy: 15, tags: ['animal_lover', 'persistent'], itemDrops: [{ itemId: 'item_plant_pot', dropRate: 0.45 }, { itemId: 'item_yoga_mat', dropRate: 0.15 }] }, resultText: '你给它取名"橘座"。带去宠物医院检查，医生说它很健康，就是太胖了。等等，它不是很瘦吗？...原来是你喂太多了。橘座成了你最忠实的室友。' } },
          { id: 'choice_find_owner', text: '📋 发帖帮它找领养家庭', outcome: { isEnding: true, rewards: { reputation: 15, tags: ['kindhearted'], itemDrops: [{ itemId: 'item_activity_coupon', dropRate: 0.25 }, { itemId: 'item_plant_pot', dropRate: 0.3 }] }, resultText: '你在小区群里发了领养信息。一个小女孩的妈妈联系了你，小女孩看到橘猫的照片就哭着说"我要它！"。一周后你收到了小女孩画的感谢卡。' } }
        ]
      },
      {
        id: 'stage_2b',
        title: '新室友',
        description: '橘猫在你家里巡视了一圈，跳上沙发，占据了最好的位置，然后睡着了。你看着它，觉得生活突然有了点不一样的意义。',
        choices: [
          { id: 'choice_name_it', text: '✨ 给它取个名字：橘座大人', outcome: { isEnding: true, rewards: { reputation: 20, energy: 25, tags: ['animal_lover'], itemDrops: [{ itemId: 'item_plant_pot', dropRate: 0.5 }, { itemId: 'item_yoga_mat', dropRate: 0.2 }, { itemId: 'item_activity_coupon', dropRate: 0.08 }] }, resultText: '橘座大人很快适应了新家。它最喜欢赴在你的键盘上，每次你加班它都陪着你。有时候你觉得，是它收养了你。' } }
        ]
      }
    ],
    participantCount: 15678,
    createdAt: Date.now() - 50000000
  },

  // ==================== 新增：科技类事件 ====================
  {
    id: 'evt_ai_experiment',
    title: 'AI实验室',
    description: '你收到一封神秘邮件，邀请你参加一个AI公司的内测体验。据说他们开发了一个能"预测人生选择"的AI。',
    cover: '/static/events/ai.png',
    type: 'challenge',
    status: 'active',
    requirements: {},
    entryFee: { time: 25, energy: 15 },
    stages: [
      {
        id: 'stage_1',
        title: '神秘邀请',
        description: '邮件里说，只要完成一系列测试，就能获得这个AI的终身使用权。地址在市中心一栋不起眼的写字楼里。',
        choices: [
          { id: 'choice_go', text: '🏢 好奇心驱使，前往体验', cost: { time: 30, energy: 10 }, outcome: { nextStageId: 'stage_2a', rewards: { tags: ['curious'] }, resultText: '你来到了一间极简风格的白色房间。一个屏幕亮了起来："欢迎，测试者。"' } },
          { id: 'choice_research', text: '🔍 先查查这家公司的背景', cost: { time: 20 }, outcome: { nextStageId: 'stage_2b', rewards: { tags: ['cautious'] }, resultText: '你搜索了半天，只找到一个极简的官网和几篇模糊的报道。这家公司似乎刻意保持低调。' } },
          { id: 'choice_ignore', text: '🗑️ 垃圾邮件，删除', outcome: { isEnding: true, rewards: { time: 15, itemDrops: [{ itemId: 'item_coffee_coupon', dropRate: 0.15 }] }, resultText: '你删除了邮件。三个月后，这家公司上了热搜——他们的AI准确预测了股市走向。你看着新闻，默默关掉了手机。' } }
        ]
      },
      {
        id: 'stage_2a',
        title: '人生模拟',
        description: 'AI问了你一系列奇怪的问题："如果时间可以倒流，你最想改变什么？""你觉得自己五年后在做什么？"然后它给出了一个预测。',
        choices: [
          { id: 'choice_accept', text: '🤯 这个预测...太准了', cost: { energy: 15 }, outcome: { isEnding: true, rewards: { reputation: 35, tags: ['techie', 'open_minded'], itemDrops: [{ itemId: 'item_notebook', dropRate: 0.6 }, { itemId: 'item_travel_bag', dropRate: 0.18 }] }, resultText: 'AI预测你会在两年内转行做自己真正热爱的事。你走出大楼，看着天空，第一次认真思考：我真正热爱的是什么？这个问题，比任何AI都重要。' } },
          { id: 'choice_question', text: '🤔 我不信，这只是概率游戏', outcome: { isEnding: true, rewards: { reputation: 15, tags: ['skeptic'], itemDrops: [{ itemId: 'item_coffee_coupon', dropRate: 0.35 }, { itemId: 'item_notebook', dropRate: 0.25 }] }, resultText: '"有趣的观点。"AI说，"但请记住这个数字：42。"你笑着离开了。一个月后，你在一次关键决策中，莫名其妙地想起了42这个数字。巧合？' } }
        ]
      },
      {
        id: 'stage_2b',
        title: '深入调查',
        description: '你发现这家公司的创始人是一位前Google AI研究员，去年刚从硅谷回国。公司虽然低调，但投资方都是顶级VC。',
        choices: [
          { id: 'choice_go_anyway', text: '🚀 看起来靠谱，去体验一下', cost: { time: 30, energy: 10 }, outcome: { isEnding: true, rewards: { reputation: 25, tags: ['cautious', 'techie'], itemDrops: [{ itemId: 'item_notebook', dropRate: 0.5 }, { itemId: 'item_coffee_coupon', dropRate: 0.4 }, { itemId: 'item_travel_bag', dropRate: 0.1 }] }, resultText: '你最终还是去了。体验结束后，创始人亲自出来和你聊了聊。他说："你的谨慎让我印象深刻。我们正在招产品经理，有兴趣吗？"' } },
          { id: 'choice_pass', text: '😐 还是算了，风险太大', outcome: { isEnding: true, rewards: { time: 20, energy: 10, itemDrops: [{ itemId: 'item_coffee_coupon', dropRate: 0.2 }] }, resultText: '你决定不去。安全第一。但你把这家公司加入了关注列表。也许未来会有机会。' } }
        ]
      }
    ],
    participantCount: 6789,
    createdAt: Date.now() - 80000000
  },

  // ==================== 新增：日常类事件 ====================
  {
    id: 'evt_rainy_day',
    title: '暴雨突袭',
    description: '你正走在回家的路上，天空突然变暗，豆大的雨点砸了下来。你没带伞，最近的地铁站还有500米。',
    cover: '/static/events/rain.png',
    type: 'story',
    status: 'active',
    requirements: {},
    entryFee: { energy: 5 },
    stages: [
      {
        id: 'stage_1',
        title: '措手不及',
        description: '雨越下越大，路上的人都在跑。你看到旁边有一家书店，门口有个卖伞的小摊。',
        choices: [
          { id: 'choice_run', text: '🏃 冲！500米而已', cost: { energy: 15 }, outcome: { isEnding: true, rewards: { energy: 5, tags: ['brave'], itemDrops: [{ itemId: 'item_yoga_mat', dropRate: 0.25 }] }, resultText: '你像百米冲刺一样跑到地铁站，全身湿透。但不知道为什么，你笑了出来。旁边的人都用奇怪的眼神看你。这种淋雨的感觉，好久没有了。' } },
          { id: 'choice_bookstore', text: '📚 躲进书店等雨停', cost: { time: 40 }, outcome: { nextStageId: 'stage_2a', rewards: { tags: ['reader'] }, resultText: '你推开书店的门，铃铛叮当响了一声。店里很安静，飘着咖啡和旧书的味道。' } },
          { id: 'choice_buy_umbrella', text: '☂️ 买把伞，从容走回去', cost: { time: 5 }, outcome: { isEnding: true, rewards: { reputation: 5, itemDrops: [{ itemId: 'item_plant_pot', dropRate: 0.2 }] }, resultText: '你花20块买了一把透明伞。雨中漫步，看着城市的霓虹灯在雨幕中模糊成一片光晕。你拍了张照，这是今年最美的一张。' } }
        ]
      },
      {
        id: 'stage_2a',
        title: '书店奇遇',
        description: '书店老板是个留着白胡子的老爷爷，他递给你一杯热茶："淋雨了吧？坐坐，看看书。"你随手拿起一本书，是《小王子》。',
        choices: [
          { id: 'choice_read', text: '📖 坐下来，安静地读一会儿', cost: { time: 30 }, outcome: { isEnding: true, rewards: { reputation: 15, energy: 20, tags: ['reader', 'sentimental'], itemDrops: [{ itemId: 'item_notebook', dropRate: 0.55 }, { itemId: 'item_plant_pot', dropRate: 0.3 }] }, resultText: '"真正重要的东西，用眼睛是看不见的。"你读完最后一页，雨也停了。老爷爷说："这本书送你了。"你走出书店，空气清新得像刚洗过的世界。这个雨天，意外地美好。' } },
          { id: 'choice_browse', text: '👀 随便逛逛，看看有什么好书', outcome: { isEnding: true, rewards: { reputation: 8, energy: 10, itemDrops: [{ itemId: 'item_notebook', dropRate: 0.35 }] }, resultText: '你在书架间穿梭，发现了好几本想读的书。最后买了两本，老爷爷还送了你一个书签。"常来啊。"他笑着说。你决定以后每周来一次。' } }
        ]
      }
    ],
    participantCount: 9876,
    createdAt: Date.now() - 150000000
  },

  // ==================== 新增：社交困境 ====================
  {
    id: 'evt_friend_borrow',
    title: '朋友借钱',
    description: '大学室友突然发来消息："兄弟，能借我5000吗？急用，下个月一定还。"你们毕业后联系不多，上次见面还是两年前。',
    cover: '/static/events/money.png',
    type: 'challenge',
    status: 'active',
    requirements: {},
    entryFee: { time: 10, energy: 10 },
    stages: [
      {
        id: 'stage_1',
        title: '突如其来',
        description: '你看着消息，回忆起大学时他帮过你很多忙。但5000块也不是小数目，而且"急用"到底是什么情况？',
        choices: [
          { id: 'choice_lend', text: '💰 二话不说，直接转账', cost: { energy: 5 }, outcome: { nextStageId: 'stage_2a', rewards: { reputation: 15, tags: ['generous'] }, resultText: '你转了5000块过去。"谢谢兄弟！救命了！"他发了一连串感谢的表情。' } },
          { id: 'choice_ask', text: '🤔 先问清楚情况再说', cost: { time: 10 }, outcome: { nextStageId: 'stage_2b', rewards: { tags: ['cautious'] }, resultText: '"怎么了？出什么事了？"你回复道。' } },
          { id: 'choice_refuse', text: '😅 编个理由婉拒', outcome: { isEnding: true, rewards: { time: 10, itemDrops: [{ itemId: 'item_coffee_coupon', dropRate: 0.15 }] }, penalties: { reputation: 8 }, resultText: '"不好意思兄弟，我最近也紧张..."你编了个理由。对方回了个"好吧"就没再说话。你心里有点不是滋味。' } }
        ]
      },
      {
        id: 'stage_2a',
        title: '后续',
        description: '一个月过去了，他没有提还钱的事。你要不要主动问？',
        choices: [
          { id: 'choice_remind', text: '💬 委婉地提一下', outcome: { isEnding: true, rewards: { reputation: 10, itemDrops: [{ itemId: 'item_coffee_coupon', dropRate: 0.3 }] }, resultText: '"上次那个钱不急，你方便的时候还就行。"他立刻回复："对不起！差点忘了！"当天就转了回来，还多转了500说请你吃饭。有时候，信任是最好的投资。' } },
          { id: 'choice_wait', text: '😶 算了，等他自己想起来', outcome: { isEnding: true, rewards: { reputation: 5, itemDrops: [{ itemId: 'item_takeout_coupon', dropRate: 0.2 }] }, penalties: { reputation: 3 }, resultText: '又过了两个月，他突然转了5500过来："加了利息！太不好意思了！"你笑了笑，觉得这个朋友没白交。' } }
        ]
      },
      {
        id: 'stage_2b',
        title: '真相',
        description: '他说妈妈突然住院了，需要交押金。他在外地工作，一时凑不齐。你能感觉到他的焦急。',
        choices: [
          { id: 'choice_help_more', text: '💪 不止5000，我再多给你点', cost: { energy: 10 }, outcome: { isEnding: true, rewards: { reputation: 30, tags: ['generous', 'kindhearted'], itemDrops: [{ itemId: 'item_activity_coupon', dropRate: 0.2 }, { itemId: 'item_plant_pot', dropRate: 0.4 }] }, resultText: '你转了8000过去。"多的别急着还，先给阿姨看病。"他在电话那头哭了。三个月后他还了钱，还专门从老家寄了一箱土特产。你们的友谊，比大学时更深了。' } },
          { id: 'choice_lend_5000', text: '💰 5000没问题，马上转', outcome: { isEnding: true, rewards: { reputation: 20, tags: ['reliable'], itemDrops: [{ itemId: 'item_plant_pot', dropRate: 0.3 }, { itemId: 'item_coffee_coupon', dropRate: 0.25 }] }, resultText: '你立刻转了账。"谢谢你，真的谢谢你。"他的声音有些颤抖。有些友情，不会因为时间和距离而褪色。' } }
        ]
      }
    ],
    participantCount: 7234,
    createdAt: Date.now() - 300000000
  },

  // ==================== 新增：神秘市集（演示ClaimItem + 隐藏分支） ====================
  {
    id: 'evt_mystery_market',
    title: '神秘夜市',
    description: '周末晚上，你在小巷子里发现了一个从未见过的夜市。摆主们卖的东西很特别，有些似乎不属于这个时代。',
    cover: '/static/events/market.png',
    type: 'exploration',
    status: 'active',
    requirements: {},
    entryFee: { time: 20, energy: 10 },
    stages: [
      {
        id: 'stage_1',
        title: '夜市入口',
        description: '夜市入口挂着一串复古的灯笼，摆主们的吼卖声此起彼伏。一个老婆婆向你招手：“小伙子，过来看看，有缘人才能看到我的摆子。”',
        choices: [
          {
            id: 'choice_granny',
            text: '🧙‍♀️ 走向老婆婆的摆位',
            cost: { time: 10 },
            outcome: {
              nextStageId: 'stage_2a',
              claimableItems: [
                { itemId: 'item_notebook', promptText: '老婆婆送给你一本神秘的笔记本，说“记录下你看到的一切”', quantity: 1 }
              ],
              rewards: { reputation: 5, tags: ['curious'] },
              resultText: '老婆婆的摆位上摆满了奇奇怪怪的小物件。她笑着递给你一本旧笔记本：“拿着吧，会有用的。”'
            }
          },
          {
            id: 'choice_food_stall',
            text: '🍜 先去小吃摆填填肚子',
            cost: { time: 15, energy: 5 },
            outcome: {
              nextStageId: 'stage_2b',
              claimableItems: [
                { itemId: 'item_takeout_coupon', promptText: '摆主送你一张神秘美食券，“下次来可以免费吃一碗”', quantity: 1 }
              ],
              rewards: { energy: 10, tags: ['foodie'] },
              resultText: '你吃了一碗神奇的面条，味道好得让你想哭。摆主笑着递给你一张券：“下次再来。”'
            }
          },
          {
            id: 'choice_hidden_alley',
            text: '🔍 注意到角落里一个不起眼的小巷子...',
            hidden: true,
            requiresItems: ['item_notebook'],
            hiddenHint: '你的笔记本上隐约浮现出一行字：“左转三步，右转七步”',
            cost: { time: 5 },
            outcome: {
              nextStageId: 'stage_secret',
              rewards: { reputation: 15, tags: ['adventurous', 'curious'] },
              resultText: '你按照笔记本上的指引走进小巷子，发现了一个隐藏的地下市场！'
            }
          }
        ]
      },
      {
        id: 'stage_2a',
        title: '老婆婆的宝贝',
        description: '老婆婆摆位上的东西越看越神奇。一个水晶球里似乎有什么在动，一本书的页面会自己翻动。',
        choices: [
          {
            id: 'choice_crystal',
            text: '🔮 仔细看看水晶球',
            cost: { time: 10 },
            outcome: {
              isEnding: true,
              claimableItems: [
                { itemId: 'item_plant_pot', promptText: '老婆婆神秘地拿出一个小花盆：“这个送你，它会带给你好运”', quantity: 1, required: false }
              ],
              rewards: { reputation: 20, tags: ['open_minded', 'curious'] },
              resultText: '水晶球里映出了你未来的影像——你看到自己在一个陌生的城市，笑得很开心。老婆婆说：“记住这个画面，它会实现的。”'
            }
          },
          {
            id: 'choice_book',
            text: '📚 翻开那本会动的书',
            cost: { time: 15, energy: 5 },
            outcome: {
              isEnding: true,
              rewards: { reputation: 25, energy: 15, tags: ['reader', 'sentimental'], itemDrops: [{ itemId: 'item_notebook', dropRate: 0.45 }, { itemId: 'item_plant_pot', dropRate: 0.25 }] },
              resultText: '书页自动翻到了一页，上面写着你的名字和一段话：“人生没有白走的路，每一步都算数。”你合上书，心里莫名地平静了。'
            }
          },
          {
            id: 'choice_secret_item',
            text: '✨ 注意到摆位下面藏着一个古老的箱子...',
            hidden: true,
            requiresItems: ['item_coffee_coupon', 'item_notebook'],
            hiddenHint: '你的咖啡券和笔记本同时发出微光，指向摆位下方',
            cost: { energy: 10 },
            outcome: {
              isEnding: true,
              claimableItems: [
                { itemId: 'item_yoga_mat', promptText: '箱子里是一张古老的羊皮卷轴，散发着宁静的气息', quantity: 1 },
                { itemId: 'item_plant_pot', promptText: '还有一个精美的小花盆，里面的花永远不会凋谢', quantity: 1, required: false }
              ],
              rewards: { reputation: 50, tags: ['adventurous', 'curious', 'open_minded'] },
              resultText: '你发现了老婆婆的私藏宝箱！她惊讶地看着你：“五十年来，你是第一个找到这个箱子的人。这些都是你的了。”'
            }
          }
        ]
      },
      {
        id: 'stage_2b',
        title: '美食街深处',
        description: '吃完面条后，你发现夜市比想象中大得多。远处传来了奇怪的音乐声。',
        choices: [
          {
            id: 'choice_music',
            text: '🎵 循着音乐声走去',
            cost: { time: 15 },
            outcome: {
              isEnding: true,
              claimableItems: [
                { itemId: 'item_activity_coupon', promptText: '街头艺人送你一张神秘活动券：“下次满月夜，来这里找我”', quantity: 1 }
              ],
              rewards: { reputation: 15, energy: 10, tags: ['adventurous'] },
              resultText: '你找到了一个街头艺人，他在演奏一种你从未见过的乐器。音乐让你感到前所未有的平静。'
            }
          },
          {
            id: 'choice_explore_more',
            text: '🚶 继续深入探索夜市',
            cost: { time: 20, energy: 10 },
            outcome: {
              isEnding: true,
              rewards: { reputation: 20, tags: ['adventurous', 'persistent'], itemDrops: [{ itemId: 'item_travel_bag', dropRate: 0.15 }, { itemId: 'item_notebook', dropRate: 0.4 }] },
              resultText: '你在夜市深处发现了一个古董店，店主说这里每个月只开一晚。你们聊了很久，他说下次会给你留一件特别的东西。'
            }
          },
          {
            id: 'choice_hidden_passage',
            text: '🗝️ 用笔记本上的线索找到隐藏通道',
            hidden: true,
            requiresItems: ['item_notebook'],
            hiddenHint: '笔记本的某一页突然发光，显示出一张地图',
            cost: { time: 10, energy: 5 },
            outcome: {
              nextStageId: 'stage_secret',
              rewards: { reputation: 10, tags: ['curious'] },
              resultText: '笔记本上的地图引导你找到了一个隐藏的地下通道！'
            }
          }
        ]
      },
      {
        id: 'stage_secret',
        title: '地下市场',
        description: '你走进了一个地下空间，这里是一个更加神秘的市场。摆主们卖的东西更加离奇——装在瓶子里的星光、能听到回忆的耳机、会自己写字的钢笔...',
        choices: [
          {
            id: 'choice_starlight',
            text: '⭐ 买一瓶星光',
            cost: { time: 10, energy: 10 },
            outcome: {
              isEnding: true,
              claimableItems: [
                { itemId: 'item_plant_pot', promptText: '卖星光的少女额外送你一个“星光花盆”，用星光浇水就能开花', quantity: 1, required: false },
                { itemId: 'item_coffee_coupon', promptText: '她还给了你一张“星光咖啡券”，可以在任何咖啡店兑换一杯会发光的咖啡', quantity: 1 }
              ],
              rewards: { reputation: 40, energy: 20, tags: ['adventurous', 'open_minded', 'sentimental'] },
              resultText: '你打开瓶子，星光洒满了整个地下市场。所有人都抬头看着，就像在看真正的星空。这一刻，你觉得世界充满了魔法。'
            }
          },
          {
            id: 'choice_memory_earphone',
            text: '🎧 试试回忆耳机',
            cost: { time: 15 },
            outcome: {
              isEnding: true,
              claimableItems: [
                { itemId: 'item_yoga_mat', promptText: '卖耳机的老人说：“听完回忆后，你需要这个来平复心情”，递给你一张冥想垫', quantity: 1 }
              ],
              rewards: { reputation: 35, tags: ['sentimental', 'family_first'] },
              resultText: '你戴上耳机，听到了小时候妈妈唱的摇篮曲。泪水不知不觉地流了下来。老人说：“每个人都有忘不掉的声音。”'
            }
          },
          {
            id: 'choice_ultimate_secret',
            text: '🌟 地下市场最深处的封印之门',
            hidden: true,
            requiresItems: ['item_travel_bag', 'item_yoga_mat'],
            hiddenHint: '你的旅行包和瑜伽垫开始共振，指向市场最深处的一扇古老石门',
            cost: { time: 20, energy: 15 },
            outcome: {
              isEnding: true,
              claimableItems: [
                { itemId: 'item_travel_bag', promptText: '石门后是一个时空裂缝，你获得了一个“时空旅行包”，据说可以装下无限的东西', quantity: 1 },
                { itemId: 'item_notebook', promptText: '还有一本“时空日志”，能记录跨越时空的经历', quantity: 1 },
                { itemId: 'item_coffee_coupon', promptText: '以及一张“时空咖啡券”，可以在任何时代的咖啡店使用', quantity: 2 }
              ],
              rewards: { reputation: 80, energy: 30, tags: ['adventurous', 'curious', 'open_minded', 'persistent'] },
              resultText: '你推开石门，发现了一个连接不同时空的裂缝。你短暂地看到了过去和未来的自己。回来后，你发现自己对世界的理解完全不同了。这是整个夜市最大的秘密。'
            }
          }
        ]
      }
    ],
    participantCount: 3456,
    createdAt: Date.now() - 100000000
  }
]
