/**
 * AIGC 生成的现实世界关联物品
 * 每个物品与一个现实事件关联
 * Generated at: 2026-02-24 05:17:40
 */

export const aigcItems = [
  {
    "id": "aigc_item_tariff_wall",
    "name": "迷你关税壁垒",
    "description": "一面象征关税障碍的微型围墙模型，代表贸易摩擦。",
    "icon": "🧱",
    "rarity": "rare",
    "category": "collectible",
    "mintCost": {
      "time": 120,
      "energy": 50
    },
    "effects": [
      {
        "type": "trade_impact",
        "value": -10,
        "description": "增加贸易成本，降低收益"
      },
      {
        "type": "negotiation_bonus",
        "value": 5,
        "description": "提升谈判中的策略优势"
      }
    ],
    "tags": [
      "negotiator",
      "persistent",
      "workaholic"
    ],
    "featureTags": [
      "象征贸易阻碍",
      "提升谈判能力",
      "代表经济风险"
    ],
    "story": "2025年4月，特朗普宣布大规模关税，激起全球贸易震荡。这面迷你墙象征着加征关税构建的贸易壁垒，提醒着玩家贸易环境的复杂和不可预测。",
    "visible": true,
    "createdAt": 1710000000000,
    "source": {
      "type": "aigc",
      "relatedEventId": "aigc_event_001",
      "newsTitle": "特朗普打响全球关税战"
    }
  },
  {
    "id": "aigc_item_rare_earth_fragment",
    "name": "稀土碎片",
    "description": "从中国暂停出口的稀土中提炼出的神秘碎片。",
    "icon": "🪨",
    "rarity": "epic",
    "category": "material",
    "mintCost": {
      "time": 200,
      "energy": 80
    },
    "effects": [
      {
        "type": "resource_control",
        "value": 15,
        "description": "掌控关键资源，提升制造效率"
      },
      {
        "type": "trade_leverage",
        "value": 10,
        "description": "增强谈判时的筹码"
      }
    ],
    "tags": [
      "persistent",
      "techie",
      "negotiator"
    ],
    "featureTags": [
      "关键战略资源",
      "制造核心材料",
      "贸易谈判利器"
    ],
    "story": "中国暂停稀土出口作为反制措施，迫使全球供应链重组。这片稀土碎片承载着资源争夺的激烈博弈，是玩家掌握战略优势的象征。",
    "visible": true,
    "createdAt": 1710000000000,
    "source": {
      "type": "aigc",
      "relatedEventId": "aigc_event_001",
      "newsTitle": "特朗普打响全球关税战"
    }
  },
  {
    "id": "aigc_item_reduction_agreement",
    "name": "90天减税协议文书",
    "description": "记录中美暂时缓和贸易战的关键减税协议文档。",
    "icon": "📜",
    "rarity": "uncommon",
    "category": "collectible",
    "mintCost": {
      "time": 60,
      "energy": 30
    },
    "effects": [
      {
        "type": "trade_stability",
        "value": 20,
        "description": "短期内提升贸易稳定性"
      },
      {
        "type": "conflict_decrease",
        "value": 15,
        "description": "缓和对抗，减少冲突风险"
      }
    ],
    "tags": [
      "negotiator",
      "connector",
      "persistent"
    ],
    "featureTags": [
      "缓和贸易冲突",
      "提升稳定性",
      "短期协议文书"
    ],
    "story": "2025年5月，中美达成90天减税协议，暂时缓解关税战带来的紧张局势。这份协议文书象征着谈判与妥协的可能，为玩家带来贸易环境改善的契机。",
    "visible": true,
    "createdAt": 1710000000000,
    "source": {
      "type": "aigc",
      "relatedEventId": "aigc_event_001",
      "newsTitle": "特朗普打响全球关税战"
    }
  },
  {
    "id": "aigc_item_001",
    "name": "库尔斯克战役微型模型",
    "description": "一座微缩的库尔斯克战役前线模型，象征着战争中的阵地争夺。",
    "icon": "🗺️",
    "rarity": "rare",
    "category": "collectible",
    "mintCost": {
      "time": 30,
      "energy": 20
    },
    "effects": [
      {
        "type": "defenseBoost",
        "value": 5,
        "description": "提升队伍防御力5%"
      }
    ],
    "tags": [
      "persistent",
      "negotiator",
      "workaholic"
    ],
    "featureTags": [
      "坚韧不拔",
      "战略要地",
      "历史象征"
    ],
    "story": "库尔斯克战役作为俄乌战争的关键战役之一，象征着激烈的阵地争夺和双方的顽强抵抗。这座微型模型让玩家感受到战争前线的紧张与坚守。",
    "visible": true,
    "createdAt": 1686825600000,
    "source": {
      "type": "aigc",
      "relatedEventId": "aigc_event_001",
      "newsTitle": "俄乌战争进入第四年"
    }
  },
  {
    "id": "aigc_item_002",
    "name": "蜘蛛网无人机模型",
    "description": "象征乌克兰‘蜘蛛网行动’的微型无人机模型，体现隐秘打击力量。",
    "icon": "🕷️",
    "rarity": "epic",
    "category": "equipment",
    "mintCost": {
      "time": 45,
      "energy": 40
    },
    "effects": [
      {
        "type": "attackBoost",
        "value": 10,
        "description": "提升远程攻击力10%"
      },
      {
        "type": "stealth",
        "value": 7,
        "description": "增加隐蔽能力7%"
      }
    ],
    "tags": [
      "techie",
      "persistent",
      "creative"
    ],
    "featureTags": [
      "隐秘打击",
      "高科技",
      "战略远程"
    ],
    "story": "‘蜘蛛网行动’利用无人机深入敌后精准打击，改变了战场格局。这款无人机模型象征着战场上的新兴科技和无人作战力量。",
    "visible": true,
    "createdAt": 1686825600000,
    "source": {
      "type": "aigc",
      "relatedEventId": "aigc_event_001",
      "newsTitle": "俄乌战争进入第四年"
    }
  },
  {
    "id": "aigc_item_003",
    "name": "欧盟援助信物",
    "description": "象征欧盟对乌克兰巨额贷款支持的纪念徽章，代表国际援助力量。",
    "icon": "💶",
    "rarity": "uncommon",
    "category": "collectible",
    "mintCost": {
      "time": 20,
      "energy": 10
    },
    "effects": [
      {
        "type": "resourceBoost",
        "value": 15,
        "description": "增加获取资源15%"
      }
    ],
    "tags": [
      "connector",
      "kindhearted",
      "persistent"
    ],
    "featureTags": [
      "国际援助",
      "资金支持",
      "坚实后盾"
    ],
    "story": "欧盟向乌克兰提供了超过千亿美元的贷款支持，成为其坚实的国际后盾。这枚信物见证了国际社会的团结与援助。",
    "visible": true,
    "createdAt": 1686825600000,
    "source": {
      "type": "aigc",
      "relatedEventId": "aigc_event_001",
      "newsTitle": "俄乌战争进入第四年"
    }
  },
  {
    "id": "aigc_item_001",
    "name": "深寻之芯",
    "description": "一颗象征DeepSeek突破的AI芯片模型，代表技术自立与创新。",
    "icon": "💡",
    "rarity": "legendary",
    "category": "collectible",
    "mintCost": {
      "time": 120,
      "energy": 200
    },
    "effects": [
      {
        "type": "innovation_boost",
        "value": 15,
        "description": "提升AI模型训练速度15%"
      },
      {
        "type": "resource_saving",
        "value": 10,
        "description": "减少硬件资源消耗10%"
      }
    ],
    "tags": [
      "techie",
      "persistent",
      "creative"
    ],
    "featureTags": [
      "技术突破",
      "自主创新",
      "节能高效",
      "行业震撼"
    ],
    "story": "2025年，DeepSeek发布了无需依赖顶级Nvidia芯片的AI系统，这颗象征其核心突破的‘深寻之芯’成为技术自立与创新的标志，激励无数开发者追求突破极限。",
    "visible": true,
    "createdAt": 1736985600,
    "source": {
      "type": "aigc",
      "relatedEventId": "aigc_event_001",
      "newsTitle": "DeepSeek震撼AI行业"
    }
  },
  {
    "id": "aigc_item_002",
    "name": "出口管制围墙",
    "description": "一面微型围墙模型，象征中美芯片出口管制的博弈壁垒。",
    "icon": "🧱",
    "rarity": "rare",
    "category": "collectible",
    "mintCost": {
      "time": 60,
      "energy": 80
    },
    "effects": [
      {
        "type": "trade_restriction",
        "value": 20,
        "description": "降低对手资源交换效率20%"
      }
    ],
    "tags": [
      "negotiator",
      "persistent"
    ],
    "featureTags": [
      "贸易壁垒",
      "国际博弈",
      "限制流通",
      "战略防御"
    ],
    "story": "面对中美芯片出口管制，这面‘出口管制围墙’凝聚了贸易摩擦与政治博弈的紧张氛围，提醒玩家在资源争夺中须慎重策略布局。",
    "visible": true,
    "createdAt": 1736985600,
    "source": {
      "type": "aigc",
      "relatedEventId": "aigc_event_001",
      "newsTitle": "DeepSeek震撼AI行业"
    }
  },
  {
    "id": "aigc_item_003",
    "name": "劳动力变革之匙",
    "description": "象征AI取代岗位引发社会变革的钥匙，开启未来职业新篇章。",
    "icon": "🔑",
    "rarity": "epic",
    "category": "collectible",
    "mintCost": {
      "time": 90,
      "energy": 150
    },
    "effects": [
      {
        "type": "job_transition",
        "value": 25,
        "description": "加速职业适应与转型25%"
      },
      {
        "type": "social_discussion",
        "value": 10,
        "description": "提升团队协作与沟通能力10%"
      }
    ],
    "tags": [
      "work_life_balance",
      "learner",
      "connector"
    ],
    "featureTags": [
      "职业变革",
      "社会讨论",
      "适应转型",
      "未来展望"
    ],
    "story": "随着AI大规模取代岗位，人们握紧这把‘劳动力变革之匙’，勇于面对新职业形态，开启社会与个人的全新未来。",
    "visible": true,
    "createdAt": 1736985600,
    "source": {
      "type": "aigc",
      "relatedEventId": "aigc_event_001",
      "newsTitle": "DeepSeek震撼AI行业"
    }
  },
  {
    "id": "aigc_item_001",
    "name": "雄狮之爪",
    "description": "象征以色列'雄狮崛起'行动的利爪模型，象征坚决打击与快速反应。",
    "icon": "🦁",
    "rarity": "epic",
    "category": "collectible",
    "mintCost": {
      "time": 120,
      "energy": 50
    },
    "effects": [
      {
        "type": "attack_boost",
        "value": 15,
        "description": "提升行动效率和攻击力"
      },
      {
        "type": "speed",
        "value": 10,
        "description": "提高行动速度"
      }
    ],
    "tags": [
      "persistent",
      "negotiator",
      "workaholic"
    ],
    "featureTags": [
      "坚决果断",
      "快速反应",
      "战略进攻"
    ],
    "story": "2025年6月，以色列发动的'雄狮崛起'行动如同猛兽的利爪，精准而致命地打击了伊朗的重要核设施和军事目标，象征着坚定的决心与强大的攻势力量。",
    "visible": true,
    "createdAt": 1718534400000,
    "source": {
      "type": "aigc",
      "relatedEventId": "aigc_event_001",
      "newsTitle": "以色列与伊朗爆发十二日战争"
    }
  },
  {
    "id": "aigc_item_002",
    "name": "午夜之锤",
    "description": "美国B2轰炸机'午夜之锤'行动的象征模型，代表隐秘精准的空袭打击。",
    "icon": "🔨",
    "rarity": "rare",
    "category": "equipment",
    "mintCost": {
      "time": 100,
      "energy": 40
    },
    "effects": [
      {
        "type": "stealth_attack",
        "value": 20,
        "description": "提升隐秘攻击力和打击效率"
      }
    ],
    "tags": [
      "techie",
      "persistent",
      "negotiator"
    ],
    "featureTags": [
      "精准打击",
      "隐秘行动",
      "高科技装备"
    ],
    "story": "在这场战争中，美国B2轰炸机执行的'午夜之锤'行动，以隐秘而精准的空袭摧毁了伊朗的关键核设施，令敌军措手不及，体现了冷战时代的高科技优势。",
    "visible": true,
    "createdAt": 1718534400000,
    "source": {
      "type": "aigc",
      "relatedEventId": "aigc_event_001",
      "newsTitle": "以色列与伊朗爆发十二日战争"
    }
  },
  {
    "id": "aigc_item_003",
    "name": "转移的浓缩铀",
    "description": "象征伊朗秘密转移的浓缩铀样品，代表隐藏的核威胁与未来的不确定性。",
    "icon": "⚛️",
    "rarity": "legendary",
    "category": "material",
    "mintCost": {
      "time": 150,
      "energy": 70
    },
    "effects": [
      {
        "type": "nuclear_potential",
        "value": 30,
        "description": "提升未来爆发力和战略威胁"
      },
      {
        "type": "concealment",
        "value": 25,
        "description": "增强隐藏能力与防侦察"
      }
    ],
    "tags": [
      "persistent",
      "negotiator",
      "techie"
    ],
    "featureTags": [
      "隐秘转移",
      "核威胁",
      "战略筹码"
    ],
    "story": "尽管双方停火，伊朗秘密转移的浓缩铀象征着未消除的核威胁与未来的不确定局势，成为和平中的潜在火种，提醒玩家关注隐藏的战略风险。",
    "visible": true,
    "createdAt": 1718534400000,
    "source": {
      "type": "aigc",
      "relatedEventId": "aigc_event_001",
      "newsTitle": "以色列与伊朗爆发十二日战争"
    }
  },
  {
    "id": "aigc_item_001",
    "name": "克什米尔之火",
    "description": "象征克什米尔冲突的燃烧火焰标本，凝聚着悲痛与激烈对峙。",
    "icon": "🔥",
    "rarity": "epic",
    "category": "collectible",
    "mintCost": {
      "time": 120,
      "energy": 60
    },
    "effects": [
      {
        "type": "morale",
        "value": -10,
        "description": "触碰时会降低周围队友的士气，反映冲突带来的压抑感"
      }
    ],
    "tags": [
      "persistent",
      "negotiator"
    ],
    "featureTags": [
      "冲突象征",
      "痛苦记忆",
      "历史转折"
    ],
    "story": "2025年5月，克什米尔地区的恐怖袭击引爆了印巴之间半个世纪以来最激烈的军事冲突。此物品象征这场悲痛与激烈对峙，凝结着人们对和平的渴望与对战争的警醒。",
    "visible": true,
    "createdAt": 1712908800,
    "source": {
      "type": "aigc",
      "relatedEventId": "aigc_event_001",
      "newsTitle": "印度与巴基斯坦军事冲突"
    }
  },
  {
    "id": "aigc_item_002",
    "name": "无人机残骸",
    "description": "被击落的无人机碎片，见证了现代战争科技的残酷对抗。",
    "icon": "🛸",
    "rarity": "rare",
    "category": "material",
    "mintCost": {
      "time": 80,
      "energy": 40
    },
    "effects": [
      {
        "type": "tech_attack",
        "value": 15,
        "description": "提升科技武器攻击力，反映无人机在战场上的重要角色"
      }
    ],
    "tags": [
      "techie",
      "persistent"
    ],
    "featureTags": [
      "科技残骸",
      "战争遗物",
      "高科技象征"
    ],
    "story": "在印巴冲突中，无人机与导弹的反击使战斗进入新阶段。这段残骸记录了现代战争科技带来的生死较量与不断升级的军事手段。",
    "visible": true,
    "createdAt": 1712908800,
    "source": {
      "type": "aigc",
      "relatedEventId": "aigc_event_001",
      "newsTitle": "印度与巴基斯坦军事冲突"
    }
  },
  {
    "id": "aigc_item_003",
    "name": "断流水阀",
    "description": "象征印度暂停印度河水条约的水阀，威胁巴基斯坦农田灌溉。",
    "icon": "🚰",
    "rarity": "legendary",
    "category": "equipment",
    "mintCost": {
      "time": 150,
      "energy": 100
    },
    "effects": [
      {
        "type": "resource_block",
        "value": 20,
        "description": "限制对手资源恢复速度，象征水源断流的威胁"
      }
    ],
    "tags": [
      "negotiator",
      "persistent"
    ],
    "featureTags": [
      "资源控制",
      "战略威胁",
      "历史条约影响"
    ],
    "story": "印度暂停1960年印度河水条约，威胁巴基斯坦80%农田灌溉水源。此物品象征水资源在冲突中的战略价值与双方博弈的关键。",
    "visible": true,
    "createdAt": 1712908800,
    "source": {
      "type": "aigc",
      "relatedEventId": "aigc_event_001",
      "newsTitle": "印度与巴基斯坦军事冲突"
    }
  },
  {
    "id": "aigc_item_rare_earth_core",
    "name": "稀土核心晶体",
    "description": "集聚全球稀土能量的神秘晶体，代表中国掌控的关键资源。",
    "icon": "🪨",
    "rarity": "legendary",
    "category": "collectible",
    "mintCost": {
      "time": 300,
      "energy": 500
    },
    "effects": [
      {
        "type": "trade_power",
        "value": 20,
        "description": "提升与其他势力贸易谈判优势20%"
      },
      {
        "type": "economic_warfare",
        "value": 15,
        "description": "在经济制裁中提高抵抗力15%"
      }
    ],
    "tags": [
      "negotiator",
      "persistent",
      "workaholic"
    ],
    "featureTags": [
      "关键资源",
      "经济武器",
      "战略控制",
      "全球影响力"
    ],
    "story": "2025年，中国稀土核心晶体象征着其对全球稀土市场的掌控。这块晶体凝聚了中国在磁铁及7种稀土矿物出口中断背后的决心，成为反制美国经济霸权的利器，左右着全球高科技产业的命脉。",
    "visible": true,
    "createdAt": 1710000000000,
    "source": {
      "type": "aigc",
      "relatedEventId": "aigc_event_rare_earth_restriction",
      "newsTitle": "中国稀土武器化反制美国"
    }
  },
  {
    "id": "aigc_item_trade_wall_model",
    "name": "稀土贸易壁垒模型",
    "description": "象征贸易壁垒的微型围墙，体现稀土出口限制的强硬姿态。",
    "icon": "🧱",
    "rarity": "rare",
    "category": "equipment",
    "mintCost": {
      "time": 150,
      "energy": 200
    },
    "effects": [
      {
        "type": "defense",
        "value": 10,
        "description": "提升经济制裁抵抗10%"
      },
      {
        "type": "diplomacy",
        "value": -5,
        "description": "降低与部分势力的外交好感度5%"
      }
    ],
    "tags": [
      "negotiator",
      "persistent"
    ],
    "featureTags": [
      "贸易制约",
      "战略防御",
      "经济壁垒"
    ],
    "story": "这座微型贸易壁垒模型，灵感源自中国通过暂停稀土出口对美国施加的经济压力。它象征着复杂国际博弈中的防线，以及贸易政策的强硬执行，为持有者带来经济防护的力量。",
    "visible": true,
    "createdAt": 1710000000000,
    "source": {
      "type": "aigc",
      "relatedEventId": "aigc_event_rare_earth_restriction",
      "newsTitle": "中国稀土武器化反制美国"
    }
  },
  {
    "id": "aigc_item_magnetic_shield",
    "name": "磁铁盾牌",
    "description": "由稀土磁铁打造的盾牌，象征中国磁性材料出口的战略地位。",
    "icon": "🛡️",
    "rarity": "epic",
    "category": "equipment",
    "mintCost": {
      "time": 200,
      "energy": 300
    },
    "effects": [
      {
        "type": "shield",
        "value": 25,
        "description": "提升25点防御力，抵挡经济打击"
      },
      {
        "type": "resource_control",
        "value": 10,
        "description": "增强对稀土资源的控制力10%"
      }
    ],
    "tags": [
      "persistent",
      "workaholic",
      "negotiator"
    ],
    "featureTags": [
      "战略资源",
      "防御力强",
      "经济反制"
    ],
    "story": "磁铁盾牌象征着中国对磁性稀土材料的出口控制。这件装备不仅是防御的象征，也体现了通过关键资源形成的经济战略优势，坚定地抵御外部压力与挑战。",
    "visible": true,
    "createdAt": 1710000000000,
    "source": {
      "type": "aigc",
      "relatedEventId": "aigc_event_rare_earth_restriction",
      "newsTitle": "中国稀土武器化反制美国"
    }
  },
  {
    "id": "aigc_item_ceasefire_scroll",
    "name": "停火卷轴",
    "description": "象征加沙冲突双方达成的短暂停火协议，寄托和平希望。",
    "icon": "🕊️",
    "rarity": "rare",
    "category": "collectible",
    "mintCost": {
      "time": 3
    },
    "effects": [
      {
        "type": "peace_duration",
        "value": 5,
        "description": "延长游戏中和平状态时间5回合"
      }
    ],
    "tags": [
      "negotiator",
      "kindhearted",
      "connector"
    ],
    "featureTags": [
      "象征和平",
      "缓解冲突",
      "短暂宁静"
    ],
    "story": "这卷轴记载了2025年10月以色列与哈马斯达成的停火协议，虽然和平脆弱，却是多年战斗中的宝贵喘息机会。卷轴象征着双方短暂的和解与和平的渴望。",
    "visible": true,
    "createdAt": 1696156800000,
    "source": {
      "type": "aigc",
      "relatedEventId": "aigc_event_001",
      "newsTitle": "加沙停火与三阶段和平计划"
    }
  },
  {
    "id": "aigc_item_broken_weapon_fragment",
    "name": "断裂武器碎片",
    "description": "象征哈马斯拒绝解除武装的残骸，代表冲突的持续与无奈。",
    "icon": "⚔️",
    "rarity": "epic",
    "category": "material",
    "mintCost": {
      "energy": 8
    },
    "effects": [
      {
        "type": "conflict_intensity",
        "value": 3,
        "description": "提升敌对势力的攻击强度3点"
      }
    ],
    "tags": [
      "persistent",
      "workaholic"
    ],
    "featureTags": [
      "冲突象征",
      "武装抵抗",
      "紧张氛围"
    ],
    "story": "这块断裂的武器碎片来自哈马斯装备，象征着他们拒绝解除武装的坚决态度，也反映了加沙地区持续的紧张与冲突局势。",
    "visible": true,
    "createdAt": 1696156800000,
    "source": {
      "type": "aigc",
      "relatedEventId": "aigc_event_001",
      "newsTitle": "加沙停火与三阶段和平计划"
    }
  },
  {
    "id": "aigc_item_reconstruction_blueprint",
    "name": "重建蓝图",
    "description": "描绘加沙未来基础设施与治理重建的规划蓝图，承载希望与挑战。",
    "icon": "📐",
    "rarity": "uncommon",
    "category": "equipment",
    "mintCost": {
      "time": 5,
      "energy": 5
    },
    "effects": [
      {
        "type": "infrastructure_recovery",
        "value": 4,
        "description": "加速区域基础设施恢复4个单位"
      }
    ],
    "tags": [
      "creative",
      "learner",
      "work_life_balance"
    ],
    "featureTags": [
      "重建希望",
      "规划蓝图",
      "未来愿景"
    ],
    "story": "这张蓝图象征着加沙地区未来的重建计划，虽然现实充满阻碍，但它寄托着恢复治理和基础设施的愿望，是和平愿景的具象体现。",
    "visible": true,
    "createdAt": 1696156800000,
    "source": {
      "type": "aigc",
      "relatedEventId": "aigc_event_001",
      "newsTitle": "加沙停火与三阶段和平计划"
    }
  },
  {
    "id": "aigc_item_001",
    "name": "断裂的和平鸽雕像",
    "description": "象征苏丹内战撕裂和平的破碎雕像，承载沉重的历史记忆。",
    "icon": "🕊️",
    "rarity": "epic",
    "category": "collectible",
    "mintCost": {
      "time": 120,
      "energy": 30
    },
    "effects": [
      {
        "type": "morale",
        "value": -10,
        "description": "使用后降低周围单位的士气，反映战争的阴影"
      }
    ],
    "tags": [
      "kindhearted",
      "learner"
    ],
    "featureTags": [
      "和平象征",
      "历史沉重",
      "战争记忆",
      "反思"
    ],
    "story": "这尊断裂的和平鸽雕像记录了苏丹内战的惨烈，40万生命逝去，和平被撕裂。它提醒人们珍惜安宁，也警醒未来避免重蹈覆辙。",
    "visible": true,
    "createdAt": 1686787200000,
    "source": {
      "type": "aigc",
      "relatedEventId": "aigc_event_001",
      "newsTitle": "苏丹内战造成40万人死亡"
    }
  },
  {
    "id": "aigc_item_002",
    "name": "血迹染红的法希尔地图",
    "description": "标记法希尔最后一战及屠杀地点的古旧地图，血迹隐约可见。",
    "icon": "🗺️",
    "rarity": "rare",
    "category": "collectible",
    "mintCost": {
      "time": 90,
      "energy": 20
    },
    "effects": [
      {
        "type": "awareness",
        "value": 15,
        "description": "提升对战场局势的洞察力，增加战略判断"
      }
    ],
    "tags": [
      "learner",
      "persistent"
    ],
    "featureTags": [
      "战场见证",
      "历史记录",
      "阴暗真相",
      "战略洞察"
    ],
    "story": "这张法希尔地图被血迹染红，记录了RSF攻占苏丹达尔富尔最后据点时的惨烈屠杀。血的痕迹从太空都能看到，是战争的血腥证据。",
    "visible": true,
    "createdAt": 1686787200000,
    "source": {
      "type": "aigc",
      "relatedEventId": "aigc_event_001",
      "newsTitle": "苏丹内战造成40万人死亡"
    }
  },
  {
    "id": "aigc_item_003",
    "name": "流离失所者的破旧行囊",
    "description": "象征1200万流离失所者的简陋背包，饱含无数逃难故事。",
    "icon": "🎒",
    "rarity": "uncommon",
    "category": "equipment",
    "mintCost": {
      "time": 60,
      "energy": 15
    },
    "effects": [
      {
        "type": "endurance",
        "value": 10,
        "description": "提升角色耐力，象征坚韧的生存意志"
      }
    ],
    "tags": [
      "persistent",
      "kindhearted"
    ],
    "featureTags": [
      "生存象征",
      "坚韧不拔",
      "逃难故事",
      "同情心"
    ],
    "story": "这只破旧的行囊代表苏丹内战中1200万流离失所者的苦难与坚韧。它承载着逃难者的希望与绝望，提醒世人战争带来的深刻伤痛。",
    "visible": true,
    "createdAt": 1686787200000,
    "source": {
      "type": "aigc",
      "relatedEventId": "aigc_event_001",
      "newsTitle": "苏丹内战造成40万人死亡"
    }
  },
  {
    "id": "aigc_item_001",
    "name": "权杖之光",
    "description": "象征教皇权威的权杖，刻有利奥十四世的徽章。",
    "icon": "⚜️",
    "rarity": "legendary",
    "category": "equipment",
    "mintCost": {
      "time": 60,
      "energy": 40
    },
    "effects": [
      {
        "type": "influence",
        "value": 20,
        "description": "提升交涉成功率20%"
      },
      {
        "type": "leadership",
        "value": 15,
        "description": "增强团队凝聚力15%"
      }
    ],
    "tags": [
      "connector",
      "negotiator",
      "persistent"
    ],
    "featureTags": [
      "权威象征",
      "领导力提升",
      "精神引导",
      "历史传承"
    ],
    "story": "利奥十四世的权杖融汇了教皇的权威与责任，象征着他作为首位美国教皇领导全球教会的坚毅与智慧。这权杖记录了他关注工人阶级福祉的信念，激励信徒前行。",
    "visible": true,
    "createdAt": 1710000000000,
    "source": {
      "type": "aigc",
      "relatedEventId": "aigc_event_001",
      "newsTitle": "教皇方济各去世，首位美国教皇诞生"
    }
  },
  {
    "id": "aigc_item_002",
    "name": "枢机主教徽章",
    "description": "象征枢机主教身份的徽章，刻有芝加哥象征元素。",
    "icon": "🛡️",
    "rarity": "rare",
    "category": "collectible",
    "mintCost": {
      "time": 30
    },
    "effects": [
      {
        "type": "diplomacy",
        "value": 10,
        "description": "提升外交关系10%"
      }
    ],
    "tags": [
      "negotiator",
      "connector",
      "learner"
    ],
    "featureTags": [
      "身份象征",
      "文化融合",
      "威望提升"
    ],
    "story": "这枚徽章代表罗伯特·普雷沃斯特枢机的身份，融合了芝加哥的城市精神与教会传统，见证了他从枢机主教到教皇的历史性跃迁。",
    "visible": true,
    "createdAt": 1710000000000,
    "source": {
      "type": "aigc",
      "relatedEventId": "aigc_event_001",
      "newsTitle": "教皇方济各去世，首位美国教皇诞生"
    }
  },
  {
    "id": "aigc_item_003",
    "name": "工人之心勋章",
    "description": "象征利奥十四世关注工人阶级的勋章，刻有锤子和麦穗图案。",
    "icon": "🏅",
    "rarity": "epic",
    "category": "collectible",
    "mintCost": {
      "energy": 50
    },
    "effects": [
      {
        "type": "morale",
        "value": 15,
        "description": "提升团队士气15%"
      },
      {
        "type": "empathy",
        "value": 12,
        "description": "增强同理心12%"
      }
    ],
    "tags": [
      "kindhearted",
      "warmhearted",
      "helpful"
    ],
    "featureTags": [
      "关怀工人",
      "社会责任",
      "激励人心",
      "团结精神"
    ],
    "story": "这是利奥十四世为纪念他关注工人阶级福祉而设计的勋章，象征着他对社会公平的追求与慈悲心，激励玩家关怀身边的人。",
    "visible": true,
    "createdAt": 1710000000000,
    "source": {
      "type": "aigc",
      "relatedEventId": "aigc_event_001",
      "newsTitle": "教皇方济各去世，首位美国教皇诞生"
    }
  },
  {
    "id": "aigc_item_001",
    "name": "百年古庙模型",
    "description": "象征柬泰争端的古庙微缩模型，见证了边境纷争的历史。",
    "icon": "🏯",
    "rarity": "rare",
    "category": "collectible",
    "mintCost": {
      "time": 120
    },
    "effects": [
      {
        "type": "diplomacy",
        "value": 5,
        "description": "提升谈判成功率"
      },
      {
        "type": "awareness",
        "value": 3,
        "description": "增加冲突事件识别能力"
      }
    ],
    "tags": [
      "negotiator",
      "learner",
      "connector"
    ],
    "featureTags": [
      "历史象征",
      "文化遗产",
      "边境冲突",
      "和平希望"
    ],
    "story": "这座百年古庙模型代表了柬埔寨与泰国数十年边境古庙争端的核心，是双方文化和历史的交汇点。它见证了冲突与停火，并提醒人们和平的珍贵。",
    "visible": true,
    "createdAt": 1728758400,
    "source": {
      "type": "aigc",
      "relatedEventId": "aigc_event_001",
      "newsTitle": "柬泰边境冲突升级"
    }
  },
  {
    "id": "aigc_item_002",
    "name": "地雷残片",
    "description": "冲突遗留的地雷爆炸残片，警示战争的残酷和无辜伤亡。",
    "icon": "💣",
    "rarity": "epic",
    "category": "material",
    "mintCost": {
      "energy": 50
    },
    "effects": [
      {
        "type": "danger",
        "value": 7,
        "description": "增加陷阱触发概率"
      },
      {
        "type": "awareness",
        "value": 4,
        "description": "提升危机感知"
      }
    ],
    "tags": [
      "persistent",
      "learner",
      "kindhearted"
    ],
    "featureTags": [
      "战争残酷",
      "安全警示",
      "生命价值"
    ],
    "story": "这块地雷残片来自致命的爆炸现场，象征战争对士兵和平民的威胁。它提醒玩家珍惜和平，关注和避免战区危险。",
    "visible": true,
    "createdAt": 1728758400,
    "source": {
      "type": "aigc",
      "relatedEventId": "aigc_event_001",
      "newsTitle": "柬泰边境冲突升级"
    }
  },
  {
    "id": "aigc_item_003",
    "name": "停火协议文书",
    "description": "记录吉隆坡停火协议的文书，象征脆弱的和平与谈判希望。",
    "icon": "📄",
    "rarity": "uncommon",
    "category": "collectible",
    "mintCost": {
      "time": 60
    },
    "effects": [
      {
        "type": "negotiation",
        "value": 6,
        "description": "增强和平谈判能力"
      },
      {
        "type": "stability",
        "value": 3,
        "description": "提升局势稳定性"
      }
    ],
    "tags": [
      "negotiator",
      "connector",
      "persistent"
    ],
    "featureTags": [
      "和平象征",
      "外交努力",
      "协议精神"
    ],
    "story": "这份停火协议文书记录了柬泰双方在吉隆坡达成的和平共识，虽短暂但承载着双方对终结冲突的渴望与努力。",
    "visible": true,
    "createdAt": 1728758400,
    "source": {
      "type": "aigc",
      "relatedEventId": "aigc_event_001",
      "newsTitle": "柬泰边境冲突升级"
    }
  }
] as const

export default aigcItems
