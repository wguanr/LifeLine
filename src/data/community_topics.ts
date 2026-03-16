import type { Topic, TopicPost } from '@/types'

const now = Date.now()
const h = (hours: number) => now - hours * 3600000
const d = (days: number) => now - days * 86400000

// ==================== Mock 帖子数据 ====================

export const mockPosts: TopicPost[] = [
  // ---- 话题1: 城市生存指南 ----
  {
    id: 'post_001', topicId: 'topic_01',
    authorId: 'sim_user_01', authorName: '都市漫游者', authorAvatar: '🏙️', authorLevel: 3,
    content: '分享一个经验：每天通勤时间超过1小时的人，可以试试把通勤变成"移动学习时间"。我用这个方法半年读完了12本书。',
    investedResources: 45, likeCount: 23, boostCount: 120, totalValue: 165,
    replyTo: null, replyCount: 2, createdAt: h(2)
  },
  {
    id: 'post_002', topicId: 'topic_01',
    authorId: 'sim_user_02', authorName: '精打细算', authorAvatar: '💰', authorLevel: 2,
    content: '租房的时候一定要算总成本，不只是房租。通勤费、外卖频率、周边超市价格都要考虑进去。我搬到远一点但生活成本低的地方，每月反而多存了2000。',
    investedResources: 30, likeCount: 18, boostCount: 85, totalValue: 115,
    replyTo: null, replyCount: 1, createdAt: h(5)
  },
  {
    id: 'post_003', topicId: 'topic_01',
    authorId: 'sim_user_03', authorName: '夜猫子', authorAvatar: '🦉', authorLevel: 1,
    content: '有人和我一样，觉得城市最好的时刻是凌晨两点吗？街上没人，空气清新，整个城市像是只属于你一个人。',
    investedResources: 15, likeCount: 31, boostCount: 40, totalValue: 55,
    replyTo: null, replyCount: 1, createdAt: h(8)
  },
  {
    id: 'post_004', topicId: 'topic_01',
    authorId: 'sim_user_04', authorName: '健身达人', authorAvatar: '💪', authorLevel: 2,
    content: '城市里免费健身的方法：爬楼梯代替电梯、骑车代替打车、公园跑步代替健身房。省钱又健康。',
    investedResources: 20, likeCount: 12, boostCount: 25, totalValue: 45,
    replyTo: null, replyCount: 0, createdAt: h(12)
  },
  // 回复
  {
    id: 'post_005', topicId: 'topic_01',
    authorId: 'sim_user_05', authorName: '通勤战士', authorAvatar: '🚇', authorLevel: 1,
    content: '确实，我现在地铁上都在听播客，感觉通勤时间不再浪费了。推荐一个频道：《随机波动》。',
    investedResources: 8, likeCount: 7, boostCount: 0, totalValue: 8,
    replyTo: 'post_001', replyCount: 0, createdAt: h(1)
  },
  {
    id: 'reply_001_02', topicId: 'topic_01',
    authorId: 'sim_user_12', authorName: '安全第一', authorAvatar: '🔒', authorLevel: 1,
    content: '我也是这样！现在通勤时间变成了我最期待的学习时间。',
    investedResources: 5, likeCount: 3, boostCount: 0, totalValue: 5,
    replyTo: 'post_001', replyCount: 0, createdAt: h(0.5)
  },
  {
    id: 'reply_002_01', topicId: 'topic_01',
    authorId: 'sim_user_03', authorName: '夜猫子', authorAvatar: '🦉', authorLevel: 1,
    content: '这个思路太好了，我之前只看房租，没算过总成本。',
    investedResources: 5, likeCount: 4, boostCount: 0, totalValue: 5,
    replyTo: 'post_002', replyCount: 0, createdAt: h(4)
  },
  {
    id: 'reply_003_01', topicId: 'topic_01',
    authorId: 'sim_user_04', authorName: '健身达人', authorAvatar: '💪', authorLevel: 2,
    content: '凌晨两点跑步的感觉真的很棒，整个城市都是你的跑道。',
    investedResources: 8, likeCount: 6, boostCount: 0, totalValue: 8,
    replyTo: 'post_003', replyCount: 0, createdAt: h(7)
  },

  // ---- 话题2 回复 ----
  {
    id: 'reply_010_01', topicId: 'topic_02',
    authorId: 'sim_user_07', authorName: '职场老鸟', authorAvatar: '🦅', authorLevel: 3,
    content: '深有同感。我以前也是“老好人”，后来发现谁都不感激你，反而觉得理所应当。',
    investedResources: 12, likeCount: 15, boostCount: 20, totalValue: 32,
    replyTo: 'post_010', replyCount: 0, createdAt: h(2)
  },
  {
    id: 'reply_010_02', topicId: 'topic_02',
    authorId: 'sim_user_08', authorName: '心理咨询师小王', authorAvatar: '🧠', authorLevel: 4,
    content: '“说不”的能力本质上是自尊的体现。当你尊重自己的需求时，别人也会更尊重你。',
    investedResources: 15, likeCount: 22, boostCount: 30, totalValue: 45,
    replyTo: 'post_010', replyCount: 0, createdAt: h(1.5)
  },
  {
    id: 'reply_010_03', topicId: 'topic_02',
    authorId: 'sim_user_11', authorName: '一人食', authorAvatar: '🍳', authorLevel: 2,
    content: '学会说“不”之后，我的生活质量提升了很多，不再被无效社交消耗。',
    investedResources: 8, likeCount: 9, boostCount: 0, totalValue: 8,
    replyTo: 'post_010', replyCount: 0, createdAt: h(1)
  },
  {
    id: 'reply_011_01', topicId: 'topic_02',
    authorId: 'sim_user_06', authorName: '社恐自救', authorAvatar: '🐚', authorLevel: 2,
    content: '“友好但不亲密”这个度真的很难把握，但确实是最舒服的状态。',
    investedResources: 10, likeCount: 8, boostCount: 0, totalValue: 10,
    replyTo: 'post_011', replyCount: 0, createdAt: h(5)
  },
  {
    id: 'reply_012_01', topicId: 'topic_02',
    authorId: 'sim_user_19', authorName: '情绪观察者', authorAvatar: '🌊', authorLevel: 2,
    content: '“什么是我的责任，什么不是”这句话我要写在备忘录里。太多人在背负别人的情绪。',
    investedResources: 12, likeCount: 18, boostCount: 15, totalValue: 27,
    replyTo: 'post_012', replyCount: 0, createdAt: h(0.5)
  },

  // ---- 话题3 回复 ----
  {
    id: 'reply_020_01', topicId: 'topic_03',
    authorId: 'sim_user_10', authorName: '手作匠人', authorAvatar: '🎨', authorLevel: 2,
    content: '技术博客转副业这条路确实可行，我身边也有朋友这样做成功的。',
    investedResources: 8, likeCount: 5, boostCount: 0, totalValue: 8,
    replyTo: 'post_020', replyCount: 0, createdAt: h(3)
  },
  {
    id: 'reply_020_02', topicId: 'topic_03',
    authorId: 'sim_user_15', authorName: '三年老员工', authorAvatar: '👔', authorLevel: 2,
    content: '请问博客是在哪个平台写的？我也想尝试技术写作副业。',
    investedResources: 5, likeCount: 2, boostCount: 0, totalValue: 5,
    replyTo: 'post_020', replyCount: 0, createdAt: h(2)
  },

  // ---- 话题4 回复 ----
  {
    id: 'reply_030_01', topicId: 'topic_04',
    authorId: 'sim_user_12', authorName: '安全第一', authorAvatar: '🔒', authorLevel: 1,
    content: '独居第五年，现在已经完全享受一个人的时光了。自由是最大的奢侈品。',
    investedResources: 10, likeCount: 12, boostCount: 0, totalValue: 10,
    replyTo: 'post_030', replyCount: 0, createdAt: h(1)
  },

  // ---- 话题5 回复 ----
  {
    id: 'reply_040_01', topicId: 'topic_05',
    authorId: 'sim_user_14', authorName: '深度阅读者', authorAvatar: '📚', authorLevel: 2,
    content: '我也做过类似的实验，卸载微博一个月后发现什么都没错过。信息焦虑是被制造出来的。',
    investedResources: 12, likeCount: 15, boostCount: 10, totalValue: 22,
    replyTo: 'post_040', replyCount: 0, createdAt: h(0.5)
  },

  // ---- 话题6 回复 ----
  {
    id: 'reply_050_01', topicId: 'topic_06',
    authorId: 'sim_user_09', authorName: '斜杠青年', authorAvatar: '⚡', authorLevel: 3,
    content: '补充一点：前三个月一定要找一个“导师”，不一定是领导，但要是愿意带你的前辈。',
    investedResources: 10, likeCount: 8, boostCount: 0, totalValue: 10,
    replyTo: 'post_050', replyCount: 0, createdAt: h(2)
  },

  // ---- 话题9 回复 ----
  {
    id: 'reply_080_01', topicId: 'topic_09',
    authorId: 'sim_user_13', authorName: '数字极简', authorAvatar: '📵', authorLevel: 3,
    content: '费曼学习法我用了半年，确实有效。我现在每学完一个概念都会写一篇“向小学生解释”的短文。',
    investedResources: 12, likeCount: 10, boostCount: 5, totalValue: 17,
    replyTo: 'post_080', replyCount: 0, createdAt: h(2)
  },

  // ---- 话题10 回复 ----
  {
    id: 'reply_090_01', topicId: 'topic_10',
    authorId: 'sim_user_16', authorName: '养生朋克', authorAvatar: '🧘', authorLevel: 2,
    content: '“情绪是信息，不是指令”这句话太精辟了。我要贴在电脑旁边。',
    investedResources: 8, likeCount: 14, boostCount: 0, totalValue: 8,
    replyTo: 'post_090', replyCount: 0, createdAt: h(0.5)
  },

  // ---- 话题2: 人际关系的边界感 ----
  {
    id: 'post_010', topicId: 'topic_02',
    authorId: 'sim_user_06', authorName: '社恐自救', authorAvatar: '🐚', authorLevel: 2,
    content: '学会说"不"是成年人最重要的技能之一。以前我总怕拒绝别人会伤害关系，后来发现，真正好的关系反而建立在互相尊重边界的基础上。',
    investedResources: 50, likeCount: 45, boostCount: 200, totalValue: 250,
    replyTo: null, replyCount: 3, createdAt: h(3)
  },
  {
    id: 'post_011', topicId: 'topic_02',
    authorId: 'sim_user_07', authorName: '职场老鸟', authorAvatar: '🦅', authorLevel: 3,
    content: '同事关系最好保持在"友好但不亲密"的距离。太近了容易产生利益冲突，太远了又影响协作。',
    investedResources: 35, likeCount: 28, boostCount: 90, totalValue: 125,
    replyTo: null, replyCount: 1, createdAt: h(6)
  },
  {
    id: 'post_012', topicId: 'topic_02',
    authorId: 'sim_user_08', authorName: '心理咨询师小王', authorAvatar: '🧠', authorLevel: 4,
    content: '边界感不是冷漠，而是清楚地知道"什么是我的责任，什么不是"。很多人际关系的痛苦来源于承担了不属于自己的情绪负担。',
    investedResources: 60, likeCount: 52, boostCount: 150, totalValue: 210,
    replyTo: null, replyCount: 1, createdAt: h(1)
  },

  // ---- 话题3: 副业探索 ----
  {
    id: 'post_020', topicId: 'topic_03',
    authorId: 'sim_user_09', authorName: '斜杠青年', authorAvatar: '⚡', authorLevel: 3,
    content: '做了两年副业的总结：不要追风口，找到自己擅长且市场需要的交叉点。我从写技术博客开始，现在每月副业收入稳定在主业的60%。',
    investedResources: 55, likeCount: 67, boostCount: 300, totalValue: 355,
    replyTo: null, replyCount: 2, createdAt: h(4)
  },
  {
    id: 'post_021', topicId: 'topic_03',
    authorId: 'sim_user_10', authorName: '手作匠人', authorAvatar: '🎨', authorLevel: 2,
    content: '把爱好变成副业的关键：先免费做，积累作品和口碑，等有人主动问价的时候再开始收费。急于变现反而会毁掉热情。',
    investedResources: 40, likeCount: 34, boostCount: 110, totalValue: 150,
    replyTo: null, replyCount: 0, createdAt: h(10)
  },

  // ---- 话题4: 独居生活 ----
  {
    id: 'post_030', topicId: 'topic_04',
    authorId: 'sim_user_11', authorName: '一人食', authorAvatar: '🍳', authorLevel: 2,
    content: '独居第三年，最大的感悟是：学会和自己相处比学会和别人相处更难，也更重要。现在我很享受一个人做饭、看书、发呆的时光。',
    investedResources: 35, likeCount: 41, boostCount: 180, totalValue: 215,
    replyTo: null, replyCount: 1, createdAt: h(2)
  },
  {
    id: 'post_031', topicId: 'topic_04',
    authorId: 'sim_user_12', authorName: '安全第一', authorAvatar: '🔒', authorLevel: 1,
    content: '独居安全tips：门口放两双鞋、阳台晾男女混合衣物、快递不写真名、外卖备注"放门口"。',
    investedResources: 25, likeCount: 56, boostCount: 95, totalValue: 120,
    replyTo: null, replyCount: 0, createdAt: h(7)
  },

  // ---- 话题5: 信息焦虑 ----
  {
    id: 'post_040', topicId: 'topic_05',
    authorId: 'sim_user_13', authorName: '数字极简', authorAvatar: '📵', authorLevel: 3,
    content: '我做了一个实验：卸载所有新闻App一个月。结果发现，真正重要的消息总会通过朋友告诉你，而99%的"热点"对你的生活毫无影响。',
    investedResources: 50, likeCount: 72, boostCount: 250, totalValue: 300,
    replyTo: null, replyCount: 1, createdAt: h(1)
  },
  {
    id: 'post_041', topicId: 'topic_05',
    authorId: 'sim_user_14', authorName: '深度阅读者', authorAvatar: '📚', authorLevel: 2,
    content: '对抗信息焦虑的方法：用书替代短视频，用长文替代标题党，用思考替代转发。信息的质量比数量重要一万倍。',
    investedResources: 40, likeCount: 38, boostCount: 130, totalValue: 170,
    replyTo: null, replyCount: 0, createdAt: h(5)
  },

  // ---- 话题6: 职场新人 ----
  {
    id: 'post_050', topicId: 'topic_06',
    authorId: 'sim_user_15', authorName: '三年老员工', authorAvatar: '👔', authorLevel: 2,
    content: '给职场新人的建议：前三个月少说多做，但不是闷头干活。观察公司的潜规则、了解每个人的角色、搞清楚决策链条，这些比完成KPI更重要。',
    investedResources: 45, likeCount: 55, boostCount: 180, totalValue: 225,
    replyTo: null, replyCount: 1, createdAt: h(3)
  },

  // ---- 话题7: 健康管理 ----
  {
    id: 'post_060', topicId: 'topic_07',
    authorId: 'sim_user_16', authorName: '养生朋克', authorAvatar: '🧘', authorLevel: 2,
    content: '熬夜之后喝枸杞水不叫养生，叫自我安慰。真正的健康管理是：固定作息 > 运动 > 饮食 > 补剂。顺序不能乱。',
    investedResources: 35, likeCount: 48, boostCount: 160, totalValue: 195,
    replyTo: null, replyCount: 0, createdAt: h(4)
  },

  // ---- 话题8: 消费主义反思 ----
  {
    id: 'post_070', topicId: 'topic_08',
    authorId: 'sim_user_17', authorName: '断舍离实践者', authorAvatar: '🗑️', authorLevel: 3,
    content: '清理了家里200多件"以后可能用到"的东西后，我发现：我们拥有的大部分物品，其实是在拥有我们。它们占据空间、消耗注意力、制造焦虑。',
    investedResources: 55, likeCount: 63, boostCount: 220, totalValue: 275,
    replyTo: null, replyCount: 0, createdAt: h(2)
  },

  // ---- 话题9: 学习方法论 ----
  {
    id: 'post_080', topicId: 'topic_09',
    authorId: 'sim_user_18', authorName: '终身学习者', authorAvatar: '🎓', authorLevel: 4,
    content: '费曼学习法的核心不是"教别人"，而是"发现自己不懂的地方"。当你尝试用最简单的语言解释一个概念时，你会立刻发现自己理解的漏洞。',
    investedResources: 60, likeCount: 71, boostCount: 280, totalValue: 340,
    replyTo: null, replyCount: 1, createdAt: h(3)
  },

  // ---- 话题10: 情绪管理 ----
  {
    id: 'post_090', topicId: 'topic_10',
    authorId: 'sim_user_19', authorName: '情绪观察者', authorAvatar: '🌊', authorLevel: 2,
    content: '愤怒的时候不要做决定，高兴的时候不要许承诺。情绪是信息，不是指令。学会观察情绪而不是被情绪驱动，是情商的核心。',
    investedResources: 45, likeCount: 58, boostCount: 190, totalValue: 235,
    replyTo: null, replyCount: 1, createdAt: h(1)
  },

  // ---- 话题11-20 的主贴 ----
  {
    id: 'post_100', topicId: 'topic_11',
    authorId: 'sim_user_20', authorName: '远程工作者', authorAvatar: '🏠', authorLevel: 3,
    content: '远程办公最大的挑战不是效率，而是孤独感。建议每周至少安排2次线下社交，哪怕只是去咖啡馆工作也好。',
    investedResources: 40, likeCount: 35, boostCount: 140, totalValue: 180,
    replyTo: null, replyCount: 0, createdAt: h(5)
  },
  {
    id: 'post_110', topicId: 'topic_12',
    authorId: 'sim_user_01', authorName: '都市漫游者', authorAvatar: '🏙️', authorLevel: 3,
    content: '旅行不一定要去远方。试试用"游客视角"重新看你生活的城市，你会发现很多被忽略的美好角落。',
    investedResources: 35, likeCount: 42, boostCount: 130, totalValue: 165,
    replyTo: null, replyCount: 0, createdAt: h(6)
  },
  {
    id: 'post_120', topicId: 'topic_13',
    authorId: 'sim_user_06', authorName: '社恐自救', authorAvatar: '🐚', authorLevel: 2,
    content: '社交恐惧的本质是对"被评价"的恐惧。当你意识到大多数人其实根本没在关注你的时候，社交就变得轻松多了。',
    investedResources: 45, likeCount: 50, boostCount: 170, totalValue: 215,
    replyTo: null, replyCount: 0, createdAt: h(3)
  },
  {
    id: 'post_130', topicId: 'topic_14',
    authorId: 'sim_user_09', authorName: '斜杠青年', authorAvatar: '⚡', authorLevel: 3,
    content: '时间管理的终极秘诀：不是把每分钟都填满，而是学会区分"重要"和"紧急"。大部分紧急的事其实不重要。',
    investedResources: 50, likeCount: 44, boostCount: 160, totalValue: 210,
    replyTo: null, replyCount: 0, createdAt: h(4)
  },
  {
    id: 'post_140', topicId: 'topic_15',
    authorId: 'sim_user_11', authorName: '一人食', authorAvatar: '🍳', authorLevel: 2,
    content: '厨房是最好的解压空间。切菜的节奏、油锅的声音、食物的香气，这些感官体验能把你从焦虑中拉回当下。',
    investedResources: 30, likeCount: 39, boostCount: 120, totalValue: 150,
    replyTo: null, replyCount: 0, createdAt: h(7)
  },
  {
    id: 'post_150', topicId: 'topic_16',
    authorId: 'sim_user_13', authorName: '数字极简', authorAvatar: '📵', authorLevel: 3,
    content: '我把手机屏幕设成灰度模式一个月，App使用时间直接减少了40%。颜色是吸引注意力的第一要素。',
    investedResources: 40, likeCount: 55, boostCount: 180, totalValue: 220,
    replyTo: null, replyCount: 0, createdAt: h(2)
  },
  {
    id: 'post_160', topicId: 'topic_17',
    authorId: 'sim_user_15', authorName: '三年老员工', authorAvatar: '👔', authorLevel: 2,
    content: '跳槽的最佳时机不是"受不了"的时候，而是"还不错但看到了更好机会"的时候。前者是逃避，后者是选择。',
    investedResources: 45, likeCount: 61, boostCount: 200, totalValue: 245,
    replyTo: null, replyCount: 0, createdAt: h(3)
  },
  {
    id: 'post_170', topicId: 'topic_18',
    authorId: 'sim_user_18', authorName: '终身学习者', authorAvatar: '🎓', authorLevel: 4,
    content: '读书笔记的正确打开方式：不是摘抄金句，而是写下"这段话让我想到了什么"。知识只有和你的经验产生连接，才真正属于你。',
    investedResources: 50, likeCount: 47, boostCount: 170, totalValue: 220,
    replyTo: null, replyCount: 0, createdAt: h(5)
  },
  {
    id: 'post_180', topicId: 'topic_19',
    authorId: 'sim_user_19', authorName: '情绪观察者', authorAvatar: '🌊', authorLevel: 2,
    content: '亲密关系中最重要的不是"找到对的人"，而是"成为对的人"。当你自己足够完整的时候，你吸引到的也是完整的人。',
    investedResources: 55, likeCount: 68, boostCount: 230, totalValue: 285,
    replyTo: null, replyCount: 0, createdAt: h(2)
  },
  {
    id: 'post_190', topicId: 'topic_20',
    authorId: 'sim_user_17', authorName: '断舍离实践者', authorAvatar: '🗑️', authorLevel: 3,
    content: '理财的第一步不是学投资，而是记账。当你清楚地知道钱花在了哪里，很多不必要的支出自然就消失了。',
    investedResources: 40, likeCount: 53, boostCount: 175, totalValue: 215,
    replyTo: null, replyCount: 0, createdAt: h(4)
  }
]

// ==================== Mock 话题数据（20个） ====================

export const mockTopics: Topic[] = [
  {
    id: 'topic_01', title: '城市生存指南', summary: '分享在大城市生活的实用技巧、省钱妙招和生存智慧。从租房到通勤，从社交到独处。',
    icon: '🏙️', creatorId: 'sim_user_01', creatorName: '都市漫游者', creatorAvatar: '🏙️',
    tags: ['traveler', 'minimalist'], totalPool: 3850, participantCount: 86, postCount: 234,
    topPosts: [mockPosts[0], mockPosts[1], mockPosts[2]], pinned: true,
    createdAt: d(15), lastActiveAt: h(1)
  },
  {
    id: 'topic_02', title: '人际关系的边界感', summary: '如何在亲密与独立之间找到平衡？探讨家人、朋友、同事之间的边界设定。',
    icon: '🤝', creatorId: 'sim_user_06', creatorName: '社恐自救', creatorAvatar: '🐚',
    tags: ['helpful', 'learner'], totalPool: 4200, participantCount: 112, postCount: 189,
    topPosts: [mockPosts[5], mockPosts[7], mockPosts[6]], pinned: true,
    createdAt: d(12), lastActiveAt: h(1)
  },
  {
    id: 'topic_03', title: '副业探索实验室', summary: '记录副业从0到1的过程，分享踩过的坑和有效的方法论。',
    icon: '💡', creatorId: 'sim_user_09', creatorName: '斜杠青年', creatorAvatar: '⚡',
    tags: ['explorer', 'learner'], totalPool: 5100, participantCount: 145, postCount: 312,
    topPosts: [mockPosts[8], mockPosts[9]], pinned: false,
    createdAt: d(20), lastActiveAt: h(4)
  },
  {
    id: 'topic_04', title: '独居生活图鉴', summary: '一个人住的快乐与挑战。分享独居的安全tips、生活技巧和心理调适方法。',
    icon: '🏠', creatorId: 'sim_user_11', creatorName: '一人食', creatorAvatar: '🍳',
    tags: ['minimalist', 'foodie'], totalPool: 3200, participantCount: 78, postCount: 156,
    topPosts: [mockPosts[10], mockPosts[11]], pinned: false,
    createdAt: d(10), lastActiveAt: h(2)
  },
  {
    id: 'topic_05', title: '信息焦虑自救手册', summary: '在信息爆炸的时代，如何筛选有价值的信息、避免注意力被劫持？',
    icon: '📱', creatorId: 'sim_user_13', creatorName: '数字极简', creatorAvatar: '📵',
    tags: ['minimalist', 'learner'], totalPool: 4600, participantCount: 98, postCount: 267,
    topPosts: [mockPosts[12], mockPosts[13]], pinned: false,
    createdAt: d(18), lastActiveAt: h(1)
  },
  {
    id: 'topic_06', title: '职场新人生存法则', summary: '从校园到职场的过渡期指南。如何快速适应、建立人脉、避免常见陷阱。',
    icon: '👔', creatorId: 'sim_user_15', creatorName: '三年老员工', creatorAvatar: '👔',
    tags: ['helpful', 'explorer'], totalPool: 3900, participantCount: 134, postCount: 278,
    topPosts: [mockPosts[14]], pinned: false,
    createdAt: d(25), lastActiveAt: h(3)
  },
  {
    id: 'topic_07', title: '健康管理日志', summary: '用数据和习惯管理健康。睡眠、运动、饮食、心理健康的实践分享。',
    icon: '🧘', creatorId: 'sim_user_16', creatorName: '养生朋克', creatorAvatar: '🧘',
    tags: ['foodie', 'minimalist'], totalPool: 3400, participantCount: 92, postCount: 198,
    topPosts: [mockPosts[15]], pinned: false,
    createdAt: d(14), lastActiveAt: h(4)
  },
  {
    id: 'topic_08', title: '消费主义反思', summary: '我们真的需要这么多东西吗？探讨消费观念、极简生活和理性消费。',
    icon: '🛒', creatorId: 'sim_user_17', creatorName: '断舍离实践者', creatorAvatar: '🗑️',
    tags: ['minimalist'], totalPool: 4100, participantCount: 88, postCount: 176,
    topPosts: [mockPosts[16]], pinned: false,
    createdAt: d(16), lastActiveAt: h(2)
  },
  {
    id: 'topic_09', title: '学习方法论', summary: '如何高效学习？费曼技巧、间隔重复、主动回忆等方法的实战经验。',
    icon: '📖', creatorId: 'sim_user_18', creatorName: '终身学习者', creatorAvatar: '🎓',
    tags: ['learner'], totalPool: 4800, participantCount: 156, postCount: 345,
    topPosts: [mockPosts[17]], pinned: false,
    createdAt: d(22), lastActiveAt: h(3)
  },
  {
    id: 'topic_10', title: '情绪管理工具箱', summary: '愤怒、焦虑、悲伤、迷茫...如何识别和管理自己的情绪？分享实用的情绪调节技巧。',
    icon: '🌊', creatorId: 'sim_user_19', creatorName: '情绪观察者', creatorAvatar: '🌊',
    tags: ['helpful', 'learner'], totalPool: 3700, participantCount: 105, postCount: 223,
    topPosts: [mockPosts[18]], pinned: false,
    createdAt: d(11), lastActiveAt: h(1)
  },
  {
    id: 'topic_11', title: '远程办公生存指南', summary: '在家办公的效率技巧、工具推荐和心理健康维护。',
    icon: '💻', creatorId: 'sim_user_20', creatorName: '远程工作者', creatorAvatar: '🏠',
    tags: ['explorer', 'minimalist'], totalPool: 2800, participantCount: 67, postCount: 134,
    topPosts: [mockPosts[19]], pinned: false,
    createdAt: d(8), lastActiveAt: h(5)
  },
  {
    id: 'topic_12', title: '城市微旅行', summary: '不用请假也能旅行。发现身边的小众景点、周末好去处和城市探索路线。',
    icon: '🗺️', creatorId: 'sim_user_01', creatorName: '都市漫游者', creatorAvatar: '🏙️',
    tags: ['traveler', 'explorer'], totalPool: 2600, participantCount: 73, postCount: 145,
    topPosts: [mockPosts[20]], pinned: false,
    createdAt: d(9), lastActiveAt: h(6)
  },
  {
    id: 'topic_13', title: '社交恐惧互助会', summary: '社恐不是病，但确实影响生活。分享克服社交焦虑的方法和小胜利。',
    icon: '🐚', creatorId: 'sim_user_06', creatorName: '社恐自救', creatorAvatar: '🐚',
    tags: ['helpful'], totalPool: 3100, participantCount: 89, postCount: 167,
    topPosts: [mockPosts[21]], pinned: false,
    createdAt: d(13), lastActiveAt: h(3)
  },
  {
    id: 'topic_14', title: '时间管理实验', summary: '番茄钟、时间块、GTD...各种时间管理方法的实践记录和效果对比。',
    icon: '⏰', creatorId: 'sim_user_09', creatorName: '斜杠青年', creatorAvatar: '⚡',
    tags: ['learner', 'minimalist'], totalPool: 3300, participantCount: 95, postCount: 201,
    topPosts: [mockPosts[22]], pinned: false,
    createdAt: d(17), lastActiveAt: h(4)
  },
  {
    id: 'topic_15', title: '一人食谱', summary: '为独居者设计的简单美味食谱。快手菜、一锅出、零失败料理。',
    icon: '🍳', creatorId: 'sim_user_11', creatorName: '一人食', creatorAvatar: '🍳',
    tags: ['foodie'], totalPool: 2400, participantCount: 64, postCount: 112,
    topPosts: [mockPosts[23]], pinned: false,
    createdAt: d(7), lastActiveAt: h(7)
  },
  {
    id: 'topic_16', title: '数字断舍离', summary: '清理数字生活：退订邮件、整理文件、减少App、管理密码。',
    icon: '📵', creatorId: 'sim_user_13', creatorName: '数字极简', creatorAvatar: '📵',
    tags: ['minimalist'], totalPool: 2900, participantCount: 71, postCount: 143,
    topPosts: [mockPosts[24]], pinned: false,
    createdAt: d(6), lastActiveAt: h(2)
  },
  {
    id: 'topic_17', title: '跳槽决策树', summary: '什么时候该跳槽？如何评估新机会？谈薪技巧和入职避坑指南。',
    icon: '🚀', creatorId: 'sim_user_15', creatorName: '三年老员工', creatorAvatar: '👔',
    tags: ['explorer'], totalPool: 3500, participantCount: 108, postCount: 234,
    topPosts: [mockPosts[25]], pinned: false,
    createdAt: d(19), lastActiveAt: h(3)
  },
  {
    id: 'topic_18', title: '读书笔记方法论', summary: '如何做有效的读书笔记？卡片笔记、思维导图、康奈尔笔记法的实践。',
    icon: '📝', creatorId: 'sim_user_18', creatorName: '终身学习者', creatorAvatar: '🎓',
    tags: ['learner'], totalPool: 2700, participantCount: 82, postCount: 156,
    topPosts: [mockPosts[26]], pinned: false,
    createdAt: d(11), lastActiveAt: h(5)
  },
  {
    id: 'topic_19', title: '亲密关系修炼', summary: '恋爱、婚姻、家庭关系中的沟通技巧和自我成长。',
    icon: '💕', creatorId: 'sim_user_19', creatorName: '情绪观察者', creatorAvatar: '🌊',
    tags: ['helpful'], totalPool: 3600, participantCount: 97, postCount: 189,
    topPosts: [mockPosts[27]], pinned: false,
    createdAt: d(14), lastActiveAt: h(2)
  },
  {
    id: 'topic_20', title: '理财入门指南', summary: '从记账开始的理财之路。预算管理、储蓄策略、基础投资知识。',
    icon: '💰', creatorId: 'sim_user_17', creatorName: '断舍离实践者', creatorAvatar: '🗑️',
    tags: ['minimalist', 'learner'], totalPool: 3000, participantCount: 85, postCount: 178,
    topPosts: [mockPosts[28]], pinned: false,
    createdAt: d(10), lastActiveAt: h(4)
  }
]
