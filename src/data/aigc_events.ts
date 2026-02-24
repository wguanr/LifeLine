/**
 * AIGC 生成的现实世界事件卡片
 * 基于过去一年全球核心新闻事件自动生成
 * Generated at: 2026-02-24 05:17:40
 */

export interface AigcSource {
  type: 'aigc'
  newsTitle: string
  newsDate: string
  region: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
}

export const aigcEvents = [
  {
    "id": "aigc_event_001",
    "title": "全球关税战：生活成本骤升",
    "description": "4月2日，因全球关税战爆发，你发现心仪的进口商品价格突然上涨，生活支出压力增大。面对物价涨势和供应链波动，你需要权衡选择，调整消费和生活方式。",
    "cover": "⚖️",
    "type": "challenge",
    "status": "active",
    "requirements": {},
    "entryFee": {
      "time": 1,
      "energy": 2
    },
    "stages": [
      {
        "id": "stage_1",
        "title": "面对商品涨价",
        "description": "",
        "choices": [
          {
            "id": "1_a",
            "text": "继续购买，保持生活品质",
            "cost": {
              "energy": 3
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": [
                  {
                    "id": "persistent",
                    "value": 2
                  },
                  {
                    "id": "workaholic",
                    "value": 1
                  }
                ],
                "items": []
              },
              "resultText": "你坚持购买进口商品，体验得到短暂满足，但消费压力加大。"
            }
          },
          {
            "id": "1_b",
            "text": "减少进口商品消费，尝试本地替代",
            "cost": {
              "time": 2
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": [
                  {
                    "id": "minimalist",
                    "value": 2
                  },
                  {
                    "id": "creative",
                    "value": 1
                  }
                ],
                "items": []
              },
              "resultText": "你调整生活习惯，支持本地产品，体现环保和节俭。"
            }
          }
        ]
      },
      {
        "id": "stage_2",
        "title": "供应链波动影响",
        "description": "",
        "choices": [
          {
            "id": "2_a",
            "text": "主动寻找新供应商，保证物资充足",
            "cost": {
              "time": 3,
              "energy": 2
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": [
                  {
                    "id": "connector",
                    "value": 3
                  },
                  {
                    "id": "negotiator",
                    "value": 2
                  }
                ],
                "items": [
                  "新供应商联系"
                ]
              },
              "resultText": "你积极调整资源渠道，确保生活稳定。"
            }
          },
          {
            "id": "2_b",
            "text": "接受短期物资紧张，减少非必要消费",
            "cost": {
              "energy": 1
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": [
                  {
                    "id": "persistent",
                    "value": 1
                  },
                  {
                    "id": "minimalist",
                    "value": 1
                  }
                ],
                "items": []
              },
              "resultText": "你耐心等待市场平稳，锻炼自我控制力。"
            }
          }
        ]
      },
      {
        "id": "stage_3",
        "title": "面对中国稀土出口暂停",
        "description": "",
        "choices": [
          {
            "id": "3_a",
            "text": "关注新闻，学习国际贸易知识",
            "cost": {
              "time": 2
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": [
                  {
                    "id": "learner",
                    "value": 3
                  },
                  {
                    "id": "techie",
                    "value": 2
                  }
                ],
                "items": []
              },
              "resultText": "你主动了解局势，提升自身竞争力。"
            }
          },
          {
            "id": "3_b",
            "text": "忽略国际形势，专注个人生活",
            "cost": {
              "energy": 0
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": [
                  {
                    "id": "work_life_balance",
                    "value": 2
                  }
                ],
                "items": []
              },
              "resultText": "你选择保持内心平静，避免压力过大。"
            }
          }
        ]
      },
      {
        "id": "stage_4",
        "title": "中美达成90天减税协议",
        "description": "",
        "choices": [
          {
            "id": "4_a",
            "text": "抓住机会，适时增加进口消费",
            "cost": {
              "energy": 2
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": [
                  {
                    "id": "persistent",
                    "value": 2
                  }
                ],
                "items": [
                  "进口商品优惠券"
                ]
              },
              "resultText": "你利用政策红利，改善生活品质。"
            }
          },
          {
            "id": "4_b",
            "text": "保持谨慎，继续节约消费",
            "cost": {
              "energy": 1
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": [
                  {
                    "id": "minimalist",
                    "value": 2
                  },
                  {
                    "id": "persistent",
                    "value": 1
                  }
                ],
                "items": []
              },
              "resultText": "你保持理性，防范未来风险。"
            }
          }
        ]
      }
    ],
    "participantCount": 15842,
    "createdAt": 1717449600,
    "source": {
      "type": "aigc",
      "newsTitle": "特朗普打响全球关税战",
      "newsDate": "2025-04-02",
      "region": "全球",
      "urgency": "critical"
    }
  },
  {
    "id": "aigc_event_001",
    "title": "战争阴影下的日常抉择",
    "description": "作为生活在冲突边缘的普通人，你必须在不断变化的局势中做出选择，权衡生活安全与内心信念，面对战争带来的种种挑战。",
    "cover": "⚔️",
    "type": "story",
    "status": "active",
    "requirements": {},
    "entryFee": {
      "time": 5,
      "energy": 10
    },
    "stages": [
      {
        "id": "stage_1",
        "title": "战事升级，你的首要反应",
        "description": "",
        "choices": [
          {
            "id": "choice_1_1",
            "text": "尽快囤积生活必需品，准备可能的断供",
            "cost": {
              "time": 2,
              "energy": 5
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "minimalist": -1,
                  "persistent": 1
                },
                "items": [
                  "必需品储备"
                ]
              },
              "resultText": "你成功准备了充足的物资，但内心压力也随之增加。"
            }
          },
          {
            "id": "choice_1_2",
            "text": "保持日常，坚信和平即将到来",
            "cost": {
              "energy": 3
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "kindhearted": 1,
                  "persistent": -1
                },
                "items": []
              },
              "resultText": "保持乐观让你心态平和，但可能错过准备的最佳时间。"
            }
          }
        ]
      },
      {
        "id": "stage_2",
        "title": "无人机袭击使局势紧张，你如何应对？",
        "description": "",
        "choices": [
          {
            "id": "choice_2_1",
            "text": "关注新闻，积极传播真相，帮助邻里了解情况",
            "cost": {
              "time": 3,
              "energy": 4
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "connector": 2,
                  "social_butterfly": 1,
                  "workaholic": 1
                },
                "items": []
              },
              "resultText": "你成为社区的信息枢纽，获得邻居的信任与支持。"
            }
          },
          {
            "id": "choice_2_2",
            "text": "关闭所有新闻，保护自己免受负面情绪影响",
            "cost": {
              "energy": 2
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "work_life_balance": 1,
                  "persistent": -1
                },
                "items": []
              },
              "resultText": "你避免了焦虑，但也可能错过重要信息。"
            }
          }
        ]
      },
      {
        "id": "stage_3",
        "title": "欧盟提供巨额贷款支持，社会反应复杂",
        "description": "",
        "choices": [
          {
            "id": "choice_3_1",
            "text": "参与社区志愿活动，帮助受战争影响的人",
            "cost": {
              "time": 4,
              "energy": 6
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "helpful": 2,
                  "warmhearted": 2
                },
                "items": []
              },
              "resultText": "你的付出温暖了许多受难者，也让自己更加坚强。"
            }
          },
          {
            "id": "choice_3_2",
            "text": "关注经济影响，考虑调整个人理财计划",
            "cost": {
              "time": 2
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "negotiator": 1,
                  "workaholic": 1
                },
                "items": [
                  "投资规划"
                ]
              },
              "resultText": "你提前做好财务准备，面对不确定性更有底气。"
            }
          }
        ]
      },
      {
        "id": "stage_4",
        "title": "停火谈判呼声高涨，你的态度是？",
        "description": "",
        "choices": [
          {
            "id": "choice_4_1",
            "text": "支持谈判，期待和平与稳定",
            "cost": {
              "energy": 3
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {
                  "kindhearted": 2,
                  "persistent": -1
                },
                "items": []
              },
              "resultText": "你渴望和平，但也意识到过程的艰难。"
            }
          },
          {
            "id": "choice_4_2",
            "text": "保持警惕，担心谈判可能带来的风险",
            "cost": {
              "energy": 4
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {
                  "persistent": 2,
                  "negotiator": 1
                },
                "items": []
              },
              "resultText": "你的谨慎让你更理智地看待局势，但也增加了心理负担。"
            }
          }
        ]
      }
    ],
    "participantCount": 12500,
    "createdAt": 1742246400,
    "source": {
      "type": "aigc",
      "newsTitle": "俄乌战争进入第四年",
      "newsDate": "2025-06-15",
      "region": "欧洲/俄罗斯",
      "urgency": "critical"
    }
  },
  {
    "id": "aigc_event_001",
    "title": "AI巨变下的职场挑战",
    "description": "最近AI技术进步迅速，你发现公司引入了DeepSeek的新AI系统，工作流程面临巨大变革。面对不确定的未来，你需要做出选择，适应或抗拒这场技术浪潮。",
    "cover": "🤖",
    "type": "challenge",
    "status": "active",
    "requirements": {},
    "entryFee": {
      "time": 2,
      "energy": 3
    },
    "stages": [
      {
        "id": "stage_1",
        "title": "初识AI冲击",
        "description": "",
        "choices": [
          {
            "id": "c1",
            "text": "主动学习AI相关技能，提升竞争力",
            "cost": {
              "time": 3,
              "energy": 4
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {},
                "items": []
              },
              "resultText": ""
            }
          },
          {
            "id": "c2",
            "text": "保持现状，继续用传统方式完成工作",
            "cost": {
              "time": 2,
              "energy": 2
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {},
                "items": []
              },
              "resultText": ""
            }
          }
        ]
      },
      {
        "id": "stage_2",
        "title": "面对裁员传闻",
        "description": "",
        "choices": [
          {
            "id": "c1",
            "text": "积极参与公司内部AI转型讨论，争取话语权",
            "cost": {
              "time": 2,
              "energy": 3
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {},
                "items": []
              },
              "resultText": ""
            }
          },
          {
            "id": "c2",
            "text": "开始寻找AI无法取代的职业技能",
            "cost": {
              "time": 4,
              "energy": 5
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {},
                "items": []
              },
              "resultText": ""
            }
          },
          {
            "id": "c3",
            "text": "对AI裁员传闻感到焦虑，影响工作效率",
            "cost": {
              "time": 0,
              "energy": 0
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {},
                "items": []
              },
              "resultText": ""
            }
          }
        ]
      },
      {
        "id": "stage_3",
        "title": "芯片出口管制影响",
        "description": "",
        "choices": [
          {
            "id": "c1",
            "text": "关注政策动态，及时调整职业规划",
            "cost": {
              "time": 2,
              "energy": 2
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {},
                "items": []
              },
              "resultText": ""
            }
          },
          {
            "id": "c2",
            "text": "对国际争端漠不关心，专注当前工作",
            "cost": {
              "time": 1,
              "energy": 1
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {},
                "items": []
              },
              "resultText": ""
            }
          }
        ]
      },
      {
        "id": "stage_4",
        "title": "AI替代岗位的未来",
        "description": "",
        "choices": [
          {
            "id": "c1",
            "text": "拥抱AI，尝试与AI协作完成任务",
            "cost": {
              "time": 3,
              "energy": 4
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {},
                "items": []
              },
              "resultText": ""
            }
          },
          {
            "id": "c2",
            "text": "抵制AI应用，维护传统工作方式",
            "cost": {
              "time": 2,
              "energy": 3
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {},
                "items": []
              },
              "resultText": ""
            }
          },
          {
            "id": "c3",
            "text": "转向人文关怀和创造性工作，避免被替代",
            "cost": {
              "time": 4,
              "energy": 5
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {},
                "items": []
              },
              "resultText": ""
            }
          }
        ]
      }
    ],
    "participantCount": 14750,
    "createdAt": 1736956800,
    "source": {
      "type": "aigc",
      "newsTitle": "DeepSeek震撼AI行业",
      "newsDate": "2025-01-20",
      "region": "全球",
      "urgency": "high"
    }
  },
  {
    "id": "aigc_event_001",
    "title": "中东紧张局势升级",
    "description": "2025年6月，以色列与伊朗爆发十二日战争，你作为一名普通中东居民，如何在动荡中保障自身安全与生活？你需要在冲突升级、资源短缺和信息混乱中做出选择，影响你的标签和资源。",
    "cover": "🕊️",
    "type": "challenge",
    "status": "active",
    "requirements": {},
    "entryFee": {
      "time": 10,
      "energy": 5
    },
    "stages": [
      {
        "id": "stage_1",
        "title": "阶段1",
        "description": "战争爆发，街区警报四起，你的第一反应是？",
        "choices": [
          {
            "id": "choice_1_1",
            "text": "寻找避难所，确保家人安全",
            "cost": {
              "time": 2,
              "energy": 3
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "kindhearted": 2,
                  "persistent": 1
                },
                "items": [
                  "避难包"
                ]
              },
              "resultText": ""
            }
          },
          {
            "id": "choice_1_2",
            "text": "获取最新新闻，了解局势发展",
            "cost": {
              "time": 1,
              "energy": 2
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "learner": 2,
                  "techie": 1
                },
                "items": []
              },
              "resultText": ""
            }
          },
          {
            "id": "choice_1_3",
            "text": "联络朋友，共同制定应对计划",
            "cost": {
              "time": 2,
              "energy": 2
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "connector": 3,
                  "social_butterfly": 1
                },
                "items": []
              },
              "resultText": ""
            }
          }
        ]
      },
      {
        "id": "stage_2",
        "title": "阶段2",
        "description": "物资短缺，市场供应不稳定，你选择如何应对？",
        "choices": [
          {
            "id": "choice_2_1",
            "text": "节省物资，采取极简生活方式",
            "cost": {
              "time": 1,
              "energy": 1
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "minimalist": 3,
                  "persistent": 1
                },
                "items": []
              },
              "resultText": ""
            }
          },
          {
            "id": "choice_2_2",
            "text": "尝试探索备用货源和邻里互助",
            "cost": {
              "time": 3,
              "energy": 3
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "explorer": 2,
                  "helpful": 2
                },
                "items": [
                  "备用食物"
                ]
              },
              "resultText": ""
            }
          },
          {
            "id": "choice_2_3",
            "text": "寻找食品替代品，尝试新口味",
            "cost": {
              "time": 2,
              "energy": 2
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "foodie": 3,
                  "creative": 1
                },
                "items": []
              },
              "resultText": ""
            }
          }
        ]
      },
      {
        "id": "stage_3",
        "title": "阶段3",
        "description": "信息混乱中，你收到邻居求助电话，你会？",
        "choices": [
          {
            "id": "choice_3_1",
            "text": "立即赶去支援，协助安全撤离",
            "cost": {
              "time": 3,
              "energy": 4
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "warmhearted": 3,
                  "helpful": 3
                },
                "items": []
              },
              "resultText": ""
            }
          },
          {
            "id": "choice_3_2",
            "text": "提供远程信息和心理支持",
            "cost": {
              "time": 2,
              "energy": 2
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "kindhearted": 2,
                  "connector": 2
                },
                "items": []
              },
              "resultText": ""
            }
          }
        ]
      },
      {
        "id": "stage_4",
        "title": "阶段4",
        "description": "停火达成，但未来仍不明朗，你如何调整心态？",
        "choices": [
          {
            "id": "choice_4_1",
            "text": "积极学习，准备应对可能的后续挑战",
            "cost": {
              "time": 3,
              "energy": 2
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {
                  "learner": 3,
                  "persistent": 2
                },
                "items": []
              },
              "resultText": ""
            }
          },
          {
            "id": "choice_4_2",
            "text": "专注身体锻炼，保持健康和活力",
            "cost": {
              "time": 3,
              "energy": 3
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {
                  "fitness_lover": 3,
                  "work_life_balance": 1
                },
                "items": []
              },
              "resultText": ""
            }
          },
          {
            "id": "choice_4_3",
            "text": "与朋友聚会，缓解紧张情绪",
            "cost": {
              "time": 2,
              "energy": 3
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {
                  "social_butterfly": 3,
                  "warmhearted": 1
                },
                "items": []
              },
              "resultText": ""
            }
          }
        ]
      }
    ],
    "participantCount": 18320,
    "createdAt": 1750195200,
    "source": {
      "type": "aigc",
      "newsTitle": "以色列与伊朗爆发十二日战争",
      "newsDate": "2025-06-12",
      "region": "中东",
      "urgency": "critical"
    }
  },
  {
    "id": "aigc_event_001",
    "title": "克什米尔危机下的日常抉择",
    "description": "作为南亚一名普通居民，突如其来的军事冲突影响了你的生活。水源短缺、物资紧张，你需要做出关键选择，平衡生活与安全，影响你的人生标签。",
    "cover": "⚔️",
    "type": "challenge",
    "status": "active",
    "requirements": {},
    "entryFee": {
      "time": 30,
      "energy": 20
    },
    "stages": [
      {
        "id": "stage_1",
        "title": "水资源紧张",
        "description": "印度暂停河水条约，家里的灌溉水源变得紧缺。",
        "choices": [
          {
            "id": "choice_1_1",
            "text": "减少家中用水，尝试节约每一滴水",
            "cost": {
              "time": 5,
              "energy": 10
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "minimalist": 2,
                  "persistent": 1
                },
                "items": []
              },
              "resultText": ""
            }
          },
          {
            "id": "choice_1_2",
            "text": "购买贵价瓶装水，确保生活不受影响",
            "cost": {
              "time": 3,
              "energy": 5
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "workaholic": 1,
                  "fitness_lover": -1
                },
                "items": [
                  "瓶装水"
                ]
              },
              "resultText": ""
            }
          }
        ]
      },
      {
        "id": "stage_2",
        "title": "物资供应受限",
        "description": "市场上的食品和生活用品变得紧缺，价格上涨。",
        "choices": [
          {
            "id": "choice_2_1",
            "text": "自己动手种植蔬菜，减少依赖外部供应",
            "cost": {
              "time": 15,
              "energy": 15
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "creative": 2,
                  "persistent": 2,
                  "minimalist": 1
                },
                "items": [
                  "家庭菜园"
                ]
              },
              "resultText": ""
            }
          },
          {
            "id": "choice_2_2",
            "text": "社交平台上组织邻里共享资源",
            "cost": {
              "time": 10,
              "energy": 20
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "connector": 3,
                  "social_butterfly": 2,
                  "kindhearted": 2
                },
                "items": []
              },
              "resultText": ""
            }
          },
          {
            "id": "choice_2_3",
            "text": "高价购买必需品，确保家人生活稳定",
            "cost": {
              "time": 5,
              "energy": 5
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "workaholic": 1,
                  "minimalist": -1
                },
                "items": [
                  "必需品"
                ]
              },
              "resultText": ""
            }
          }
        ]
      },
      {
        "id": "stage_3",
        "title": "安全忧虑加剧",
        "description": "军事冲突带来的安全压力让你感到焦虑和不安。",
        "choices": [
          {
            "id": "choice_3_1",
            "text": "积极学习自我保护知识，提升安全意识",
            "cost": {
              "time": 10,
              "energy": 10
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "learner": 3,
                  "persistent": 1
                },
                "items": [
                  "安全手册"
                ]
              },
              "resultText": ""
            }
          },
          {
            "id": "choice_3_2",
            "text": "参与社区安全巡逻，守护邻里安全",
            "cost": {
              "time": 20,
              "energy": 25
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "helpful": 3,
                  "kindhearted": 2,
                  "persistent": 1
                },
                "items": []
              },
              "resultText": ""
            }
          },
          {
            "id": "choice_3_3",
            "text": "减少外出，保持低调避免风险",
            "cost": {
              "time": 5,
              "energy": 5
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "minimalist": 1,
                  "persistent": -1
                },
                "items": []
              },
              "resultText": ""
            }
          }
        ]
      },
      {
        "id": "stage_4",
        "title": "和平呼声",
        "description": "冲突暂告一段落，你可以选择为和平贡献自己的一份力量。",
        "choices": [
          {
            "id": "choice_4_1",
            "text": "参与线上和平倡议，传播和平理念",
            "cost": {
              "time": 10,
              "energy": 10
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {
                  "connector": 2,
                  "warmhearted": 3,
                  "learner": 1
                },
                "items": []
              },
              "resultText": ""
            }
          },
          {
            "id": "choice_4_2",
            "text": "专注家庭和事业，暂时回避政治话题",
            "cost": {
              "time": 0,
              "energy": 0
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {
                  "work_life_balance": 2,
                  "workaholic": -1
                },
                "items": []
              },
              "resultText": ""
            }
          }
        ]
      }
    ],
    "participantCount": 17500,
    "createdAt": 1746854400,
    "source": {
      "type": "aigc",
      "newsTitle": "印度与巴基斯坦军事冲突",
      "newsDate": "2025-05-10",
      "region": "南亚",
      "urgency": "critical"
    }
  },
  {
    "id": "aigc_event_rare_earth_restriction",
    "title": "稀土出口受限的个人挑战",
    "description": "你是一名依赖进口稀土材料的小型电子企业主，面临突然的供应链中断。如何调整生产与市场策略，渡过这场稀土出口限制带来的危机？",
    "cover": "⛏️",
    "type": "challenge",
    "status": "active",
    "requirements": {},
    "entryFee": {
      "time": 2,
      "energy": 3
    },
    "stages": [
      {
        "id": "stage_1",
        "title": "评估影响",
        "description": "",
        "choices": [
          {
            "id": "choice_1_1",
            "text": "寻找替代材料供应商",
            "cost": {
              "time": 3,
              "energy": 2
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "persistent": 2,
                  "negotiator": 1
                },
                "items": []
              },
              "resultText": "虽然耗费精力，但你找到部分替代材料，缓解供应压力。"
            }
          },
          {
            "id": "choice_1_2",
            "text": "减少产品种类，集中优势产品生产",
            "cost": {
              "time": 2,
              "energy": 1
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "minimalist": 2,
                  "work_life_balance": 1
                },
                "items": []
              },
              "resultText": "专注核心产品，降低库存压力，保持稳定运营。"
            }
          },
          {
            "id": "choice_1_3",
            "text": "暂时停产等待政策缓解",
            "cost": {
              "time": 1,
              "energy": 1
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "persistent": -1,
                  "workaholic": -1
                },
                "items": []
              },
              "resultText": "保守选择，但业务停滞，面临收入减少风险。"
            }
          }
        ]
      },
      {
        "id": "stage_2",
        "title": "调整客户沟通",
        "description": "",
        "choices": [
          {
            "id": "choice_2_1",
            "text": "主动向客户解释情况，争取理解与支持",
            "cost": {
              "time": 2,
              "energy": 2
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "connector": 2,
                  "kindhearted": 1
                },
                "items": []
              },
              "resultText": "客户反应积极，信任增强，合作关系稳固。"
            }
          },
          {
            "id": "choice_2_2",
            "text": "保持沉默，等待局势明朗",
            "cost": {
              "time": 1,
              "energy": 1
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "persistent": -1,
                  "social_butterfly": -1
                },
                "items": []
              },
              "resultText": "客户疑虑加重，部分订单流失。"
            }
          },
          {
            "id": "choice_2_3",
            "text": "主动涨价以应对成本上涨",
            "cost": {
              "time": 1,
              "energy": 1
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "workaholic": 1,
                  "negotiator": 1
                },
                "items": []
              },
              "resultText": "收入暂时提升，但客户满意度下降。"
            }
          }
        ]
      },
      {
        "id": "stage_3",
        "title": "寻找长远对策",
        "description": "",
        "choices": [
          {
            "id": "choice_3_1",
            "text": "投资研发，减少对稀土依赖",
            "cost": {
              "time": 4,
              "energy": 4
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {
                  "learner": 3,
                  "creative": 2,
                  "persistent": 2
                },
                "items": [
                  "研发报告"
                ]
              },
              "resultText": "技术创新启动，企业未来更具竞争力。"
            }
          },
          {
            "id": "choice_3_2",
            "text": "扩大出口到其他国家分散风险",
            "cost": {
              "time": 3,
              "energy": 3
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {
                  "explorer": 2,
                  "connector": 2
                },
                "items": []
              },
              "resultText": "拓展新市场，减少对单一客户依赖。"
            }
          },
          {
            "id": "choice_3_3",
            "text": "维持现状，观望市场变化",
            "cost": {
              "time": 1,
              "energy": 1
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {
                  "persistent": -1
                },
                "items": []
              },
              "resultText": "缺乏主动调整，面临潜在风险。"
            }
          }
        ]
      }
    ],
    "participantCount": 13456,
    "createdAt": 1749830400,
    "source": {
      "type": "aigc",
      "newsTitle": "中国稀土武器化反制美国",
      "newsDate": "2025-04-15",
      "region": "中美",
      "urgency": "high"
    }
  },
  {
    "id": "aigc_event_001",
    "title": "加沙和平的微光",
    "description": "你生活在加沙，一场停火协议带来短暂的宁静，但和平的道路充满挑战。你需要在三阶段的和平计划中做出选择，影响你的生活和社区的未来。",
    "cover": "🕊️",
    "type": "story",
    "status": "active",
    "requirements": {},
    "entryFee": {
      "time": 2,
      "energy": 3
    },
    "stages": [
      {
        "id": "stage_1",
        "title": "第一阶段：停火与人质交换",
        "description": "",
        "choices": [
          {
            "id": "choice_1_1",
            "text": "支持停火，帮助组织社区守望互助",
            "cost": {
              "time": 2,
              "energy": 4
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "kindhearted": 2,
                  "connector": 1
                },
                "items": [
                  "社区信任"
                ]
              },
              "resultText": "你积极参与停火支持活动，赢得邻里信任。"
            }
          },
          {
            "id": "choice_1_2",
            "text": "保持中立，专注个人和家人安全",
            "cost": {
              "time": 1,
              "energy": 1
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "minimalist": 1,
                  "persistent": 1
                },
                "items": []
              },
              "resultText": "你选择保守应对，暂时避免卷入冲突。"
            }
          },
          {
            "id": "choice_1_3",
            "text": "质疑停火成效，准备应对后续冲突",
            "cost": {
              "time": 2,
              "energy": 3
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "persistent": 2,
                  "learner": 1
                },
                "items": []
              },
              "resultText": "你保持警惕，学习提高自我保护能力。"
            }
          }
        ]
      },
      {
        "id": "stage_2",
        "title": "第二阶段：武装解除与国际力量",
        "description": "",
        "choices": [
          {
            "id": "choice_2_1",
            "text": "参与和平倡议，尝试与多方沟通",
            "cost": {
              "time": 3,
              "energy": 5
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "negotiator": 3,
                  "connector": 2,
                  "kindhearted": 1
                },
                "items": [
                  "和平倡议信函"
                ]
              },
              "resultText": "你积极推动对话，争取和平进展。"
            }
          },
          {
            "id": "choice_2_2",
            "text": "对国际力量持怀疑态度，专注社区自救",
            "cost": {
              "time": 2,
              "energy": 3
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "persistent": 2,
                  "work_life_balance": 1
                },
                "items": [
                  "自救工具包"
                ]
              },
              "resultText": "你增强社区的自我防护能力，准备应对风险。"
            }
          },
          {
            "id": "choice_2_3",
            "text": "选择观望，等待局势明朗",
            "cost": {
              "time": 1,
              "energy": 1
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "minimalist": 1
                },
                "items": []
              },
              "resultText": "你保持低调，避免卷入复杂局势。"
            }
          }
        ]
      },
      {
        "id": "stage_3",
        "title": "第三阶段：重建与未来展望",
        "description": "",
        "choices": [
          {
            "id": "choice_3_1",
            "text": "积极参与社区重建，恢复基础设施",
            "cost": {
              "time": 4,
              "energy": 6
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {
                  "creative": 3,
                  "work_life_balance": 2,
                  "kindhearted": 2
                },
                "items": [
                  "重建工具包"
                ]
              },
              "resultText": "你成为重建的中坚力量，赢得社区尊敬。"
            }
          },
          {
            "id": "choice_3_2",
            "text": "关注家庭和个人生活，减少对外投入",
            "cost": {
              "time": 2,
              "energy": 3
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {
                  "minimalist": 3,
                  "work_life_balance": 3
                },
                "items": []
              },
              "resultText": "你优先照顾亲人，保持生活平衡。"
            }
          },
          {
            "id": "choice_3_3",
            "text": "尝试通过网络宣传和平理念，吸引外界关注",
            "cost": {
              "time": 3,
              "energy": 4
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {
                  "techie": 2,
                  "social_butterfly": 2,
                  "learner": 1
                },
                "items": [
                  "和平宣传材料"
                ]
              },
              "resultText": "你利用网络扩大和平声音，连接更多人。"
            }
          }
        ]
      }
    ],
    "participantCount": 18500,
    "createdAt": 1743628800,
    "source": {
      "type": "aigc",
      "newsTitle": "加沙停火与三阶段和平计划",
      "newsDate": "2025-10-01",
      "region": "中东",
      "urgency": "high"
    }
  },
  {
    "id": "aigc_event_001",
    "title": "苏丹内战中的抉择",
    "description": "你身处苏丹内战阴影下，目睹亲友流离失所，生活陷入困境。面对残酷现实，你必须做出选择，保护自己与家人，同时保持人性与希望。",
    "cover": "🕊️",
    "type": "story",
    "status": "active",
    "requirements": {},
    "entryFee": {
      "time": 5,
      "energy": 10
    },
    "stages": [
      {
        "id": "stage_1",
        "title": "灾难初现",
        "description": "",
        "choices": [
          {
            "id": "choice_1_1",
            "text": "离开家园，寻找安全避难所",
            "cost": {
              "time": 10,
              "energy": 15
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "traveler": 2,
                  "persistent": 1
                },
                "items": []
              },
              "resultText": "你踏上漫长旅程，经历艰难困苦，但保持了生存的希望。"
            }
          },
          {
            "id": "choice_1_2",
            "text": "留在家中，守护亲人和家园",
            "cost": {
              "energy": 20
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "kindhearted": 2,
                  "persistent": 1
                },
                "items": []
              },
              "resultText": "你尽力保护家人，承担更多责任，精神压力巨大。"
            }
          }
        ]
      },
      {
        "id": "stage_2",
        "title": "资源短缺",
        "description": "",
        "choices": [
          {
            "id": "choice_2_1",
            "text": "加入社区分配物资，帮助邻居",
            "cost": {
              "energy": 15
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "helpful": 3,
                  "kindhearted": 1
                },
                "items": []
              },
              "resultText": "你的善举赢得了社区的信任与尊重。"
            }
          },
          {
            "id": "choice_2_2",
            "text": "优先保障自己和家人，减少援助他人",
            "cost": {
              "energy": 5
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "minimalist": 1,
                  "persistent": 1
                },
                "items": []
              },
              "resultText": "你保护了亲人，但与邻居关系疏远。"
            }
          },
          {
            "id": "choice_2_3",
            "text": "尝试与冲突双方谈判，争取安全通道",
            "cost": {
              "time": 10,
              "energy": 20
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "negotiator": 3,
                  "persistent": 1
                },
                "items": []
              },
              "resultText": "虽然努力未必成功，但体现了你的勇气与智慧。"
            }
          }
        ]
      },
      {
        "id": "stage_3",
        "title": "精神考验",
        "description": "",
        "choices": [
          {
            "id": "choice_3_1",
            "text": "通过阅读和学习保持心灵平静",
            "cost": {
              "time": 8
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "learner": 2,
                  "work_life_balance": 1
                },
                "items": []
              },
              "resultText": "你的内心获得力量，精神状态稳定。"
            }
          },
          {
            "id": "choice_3_2",
            "text": "参与社区支持小组，分享痛苦与希望",
            "cost": {
              "time": 6,
              "energy": 10
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "connector": 2,
                  "warmhearted": 2
                },
                "items": []
              },
              "resultText": "你成为社区中的温暖力量，彼此支持。"
            }
          },
          {
            "id": "choice_3_3",
            "text": "选择逃避现实，沉浸于电子设备中",
            "cost": {
              "energy": 5
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "techie": 2
                },
                "items": []
              },
              "resultText": "暂时逃离痛苦，但可能错失行动机会。"
            }
          }
        ]
      },
      {
        "id": "stage_4",
        "title": "未来抉择",
        "description": "",
        "choices": [
          {
            "id": "choice_4_1",
            "text": "积极参与国际援助组织，推动和平",
            "cost": {
              "time": 12,
              "energy": 15
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {
                  "persistent": 2,
                  "kindhearted": 3,
                  "connector": 1
                },
                "items": []
              },
              "resultText": "你成为和平的推动者，努力改变未来。"
            }
          },
          {
            "id": "choice_4_2",
            "text": "选择移民他国，开始新的生活",
            "cost": {
              "time": 15,
              "energy": 20
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {
                  "traveler": 3,
                  "explorer": 2
                },
                "items": []
              },
              "resultText": "你迈出新步伐，开启未知旅程。"
            }
          },
          {
            "id": "choice_4_3",
            "text": "留在故土，重建家园",
            "cost": {
              "time": 20,
              "energy": 25
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {
                  "persistent": 3,
                  "workaholic": 2
                },
                "items": []
              },
              "resultText": "你选择肩负责任，努力振兴家乡。"
            }
          }
        ]
      }
    ],
    "participantCount": 13200,
    "createdAt": 1750195200,
    "source": {
      "type": "aigc",
      "newsTitle": "苏丹内战造成40万人死亡",
      "newsDate": "2025-10-15",
      "region": "非洲",
      "urgency": "high"
    }
  },
  {
    "id": "aigc_event_001",
    "title": "新教皇诞生，信仰新篇",
    "description": "教皇方济各去世后，全球天主教界迎来第一位美国教皇利奥十四世。你作为普通信徒，感受到宗教变革带来的希望与挑战，开始思考信仰与现实的关系。",
    "cover": "✝️",
    "type": "story",
    "status": "active",
    "requirements": {},
    "entryFee": {
      "time": 10,
      "energy": 5
    },
    "stages": [
      {
        "id": "stage1",
        "title": "听闻教皇去世消息",
        "description": "",
        "choices": [
          {
            "id": "stage1_choice1",
            "text": "深感悲痛，祈祷教皇灵魂安息",
            "cost": {
              "time": 5,
              "energy": 3
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "kindhearted": 2,
                  "warmhearted": 1
                },
                "items": []
              },
              "resultText": ""
            }
          },
          {
            "id": "stage1_choice2",
            "text": "理性思考宗教未来走向",
            "cost": {
              "time": 7,
              "energy": 4
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "learner": 2,
                  "persistent": 1
                },
                "items": []
              },
              "resultText": ""
            }
          }
        ]
      },
      {
        "id": "stage2",
        "title": "关注新教皇选举",
        "description": "",
        "choices": [
          {
            "id": "stage2_choice1",
            "text": "积极参与教会讨论，表达期待",
            "cost": {
              "time": 8,
              "energy": 5
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "connector": 2,
                  "social_butterfly": 1
                },
                "items": []
              },
              "resultText": ""
            }
          },
          {
            "id": "stage2_choice2",
            "text": "保持观望，关注新闻动态",
            "cost": {
              "time": 3,
              "energy": 2
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "learner": 1
                },
                "items": []
              },
              "resultText": ""
            }
          }
        ]
      },
      {
        "id": "stage3",
        "title": "接受新教皇理念",
        "description": "",
        "choices": [
          {
            "id": "stage3_choice1",
            "text": "支持利奥十四世关注工人阶级福祉",
            "cost": {
              "time": 6,
              "energy": 4
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "kindhearted": 2,
                  "helpful": 2
                },
                "items": []
              },
              "resultText": ""
            }
          },
          {
            "id": "stage3_choice2",
            "text": "保持个人信仰，独立思考",
            "cost": {
              "time": 5,
              "energy": 3
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "persistent": 2,
                  "creative": 1
                },
                "items": []
              },
              "resultText": ""
            }
          }
        ]
      },
      {
        "id": "stage4",
        "title": "参与社区活动",
        "description": "",
        "choices": [
          {
            "id": "stage4_choice1",
            "text": "组织祷告会，凝聚信徒力量",
            "cost": {
              "time": 10,
              "energy": 7
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {
                  "connector": 3,
                  "warmhearted": 2
                },
                "items": []
              },
              "resultText": ""
            }
          },
          {
            "id": "stage4_choice2",
            "text": "参与公益慈善，践行教皇精神",
            "cost": {
              "time": 12,
              "energy": 8
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {
                  "helpful": 3,
                  "kindhearted": 3
                },
                "items": []
              },
              "resultText": ""
            }
          }
        ]
      }
    ],
    "participantCount": 18500,
    "createdAt": 1746758400,
    "source": {
      "type": "aigc",
      "newsTitle": "教皇方济各去世，首位美国教皇诞生",
      "newsDate": "2025-05-08",
      "region": "全球",
      "urgency": "medium"
    }
  },
  {
    "id": "aigc_event_001",
    "title": "柬泰边境冲突升级",
    "description": "你身处东南亚边境小镇，感受到了柬埔寨和泰国因古庙争端引发的冲突带来的紧张气氛。街头安保加强，物资短缺，家人和邻居的安全成为你的首要关注。你需要在这场局势动荡中做出选择，保护自己和家人。",
    "cover": "⚔️",
    "type": "story",
    "status": "active",
    "requirements": {},
    "entryFee": {
      "time": 10,
      "energy": 5
    },
    "stages": [
      {
        "id": "stage_1",
        "title": "冲突初现",
        "description": "",
        "choices": [
          {
            "id": "c1_s1",
            "text": "购买额外生活物资储备",
            "cost": {
              "time": 2,
              "energy": 3
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "persistent": 1
                },
                "items": [
                  "储备粮食",
                  "饮用水"
                ]
              },
              "resultText": "你提前储备了生活必需品，准备应对可能的物资短缺。"
            }
          },
          {
            "id": "c2_s1",
            "text": "关注新闻，保持信息灵通",
            "cost": {
              "time": 1,
              "energy": 2
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "learner": 2,
                  "connector": 1
                },
                "items": []
              },
              "resultText": "你时刻关注局势变化，确保自己掌握最新消息。"
            }
          },
          {
            "id": "c3_s1",
            "text": "保持日常生活，避免恐慌",
            "cost": {
              "time": 0,
              "energy": 1
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "work_life_balance": 1
                },
                "items": []
              },
              "resultText": "你尝试保持平静，专注于工作和家庭，避免过度焦虑。"
            }
          }
        ]
      },
      {
        "id": "stage_2",
        "title": "停火协议签署",
        "description": "",
        "choices": [
          {
            "id": "c1_s2",
            "text": "参与社区和平倡议",
            "cost": {
              "time": 3,
              "energy": 4
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "kindhearted": 2,
                  "connector": 2
                },
                "items": []
              },
              "resultText": "你积极参与和平倡议，帮助邻里缓解紧张情绪。"
            }
          },
          {
            "id": "c2_s2",
            "text": "继续保持警惕，准备应对突发事件",
            "cost": {
              "time": 2,
              "energy": 3
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "persistent": 2
                },
                "items": []
              },
              "resultText": "你未放松警惕，随时准备面对可能的冲突升级。"
            }
          },
          {
            "id": "c3_s2",
            "text": "选择离开边境地区，前往安全城市",
            "cost": {
              "time": 5,
              "energy": 6
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": false,
              "rewards": {
                "tags": {
                  "traveler": 2,
                  "minimalist": 1
                },
                "items": []
              },
              "resultText": "你决定暂时离开危险地区，寻求安全环境。"
            }
          }
        ]
      },
      {
        "id": "stage_3",
        "title": "停火破裂，冲突升级",
        "description": "",
        "choices": [
          {
            "id": "c1_s3",
            "text": "帮助受害者提供紧急援助",
            "cost": {
              "time": 4,
              "energy": 5
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {
                  "helpful": 3,
                  "warmhearted": 2
                },
                "items": []
              },
              "resultText": "你积极参与救助受冲突影响的人们，贡献自己的力量。"
            }
          },
          {
            "id": "c2_s3",
            "text": "加强自我防护，强化家庭安全",
            "cost": {
              "time": 3,
              "energy": 4
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {
                  "persistent": 1
                },
                "items": [
                  "防护装备"
                ]
              },
              "resultText": "你购买防护装备，确保家人安全。"
            }
          },
          {
            "id": "c3_s3",
            "text": "通过网络宣传，呼吁和平解决",
            "cost": {
              "time": 2,
              "energy": 3
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {
                  "creative": 2,
                  "connector": 2
                },
                "items": []
              },
              "resultText": "你用社交媒体发声，传播和平理念。"
            }
          }
        ]
      }
    ],
    "participantCount": 14000,
    "createdAt": 1752201600,
    "source": {
      "type": "aigc",
      "newsTitle": "柬泰边境冲突升级",
      "newsDate": "2025-07-10",
      "region": "东南亚",
      "urgency": "medium"
    }
  }
] as const

export default aigcEvents
