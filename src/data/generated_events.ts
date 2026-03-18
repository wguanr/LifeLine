/**
 * AI 生成的游戏事件
 * 基于 worldmonitor RSS 新闻源自动生成
 * Generated at: 2026-03-17 23:54:02
 * Pipeline: content-pipeline/src/main.py
 */
export const generatedEvents = [
  {
    "id": "gen_event_1773805952_001",
    "title": "你需要为你的AI代理创建独一无二的人类身份",
    "description": "在这个数字时代，AI代理无处不在，但它们也可能被滥用，形成网络风暴，扰乱你的在线生活。现在，你获得了一项技术——基于虹膜扫描的身份标识令牌。你需要动手制作一个独特的人类身份，赋予你的AI代理个性和安全保障。这个过程不仅关系到你个人的网络安全，更是抵御AI群体滥用的关键一环。你准备好投入时间和精力，打造一个可信赖且独特的数字身份了吗？",
    "cover": "🛠️",
    "type": "craft",
    "status": "active",
    "requirements": {
      "tags": [
        "techie",
        "prepared"
      ]
    },
    "entryFee": {
      "time": 3,
      "energy": 5
    },
    "participantCount": 0,
    "createdAt": 1773805952612,
    "stages": [
      {
        "id": "stage_1",
        "title": "确定身份基调",
        "description": "你开始设计AI代理的人类身份。这个身份将影响它的行为和安全策略。你需要选择一个基调，是倾向于高度安全、开放透明，还是灵活适应？",
        "choices": [
          {
            "id": "1_a",
            "text": "打造高度安全的身份，注重隐私保护",
            "cost": {
              "time": 2,
              "energy": 2
            },
            "outcome": {
              "nextStageId": "stage_2",
              "isEnding": false,
              "rewards": {
                "tags": {
                  "prepared": 2,
                  "cautious": 2
                },
                "reputation": 3
              },
              "penalties": {
                "time": 1
              },
              "resultText": "你决定采取严密的安全措施，确保身份的隐私和防护，但这也带来更复杂的维护成本。"
            }
          },
          {
            "id": "1_b",
            "text": "设计开放透明的身份，方便互动和学习",
            "cost": {
              "time": 1,
              "energy": 1
            },
            "outcome": {
              "nextStageId": "stage_2",
              "isEnding": false,
              "rewards": {
                "tags": {
                  "open_minded": 2,
                  "learner": 1
                },
                "reputation": 2
              },
              "penalties": {
                "energy": 1
              },
              "resultText": "你选择让身份易于交流和学习，增强代理的适应能力，但安全性相对较低。"
            }
          },
          {
            "id": "1_c",
            "text": "创建灵活适应的身份，动态调整策略",
            "cost": {
              "time": 3,
              "energy": 3
            },
            "outcome": {
              "nextStageId": "stage_2",
              "isEnding": false,
              "rewards": {
                "tags": {
                  "improviser": 2,
                  "creative": 2
                },
                "reputation": 4
              },
              "penalties": {
                "time": 2,
                "energy": 1
              },
              "resultText": "你构建了一个能够动态调整的身份，增强了代理的弹性，但需要更多资源投入。"
            }
          }
        ]
      },
      {
        "id": "stage_2",
        "title": "定制身份特征",
        "description": "身份的核心特征将决定AI代理的个性和行为表现。你可以选择强化某些特性，或尝试隐藏的高级定制。",
        "choices": [
          {
            "id": "2_a",
            "text": "强化安全特征，增加多重验证",
            "cost": {
              "time": 2,
              "energy": 1
            },
            "outcome": {
              "nextStageId": "stage_3",
              "isEnding": false,
              "rewards": {
                "tags": {
                  "prepared": 3,
                  "reliable": 1
                },
                "reputation": 3
              },
              "penalties": {
                "time": 1
              },
              "resultText": "你为身份加入了多重验证机制，极大提高了安全性，但增加了使用复杂度。"
            }
          },
          {
            "id": "2_b",
            "text": "强调个性化特征，赋予代理独特风格",
            "cost": {
              "time": 1,
              "energy": 2
            },
            "outcome": {
              "nextStageId": "stage_3",
              "isEnding": false,
              "rewards": {
                "tags": {
                  "creative": 3,
                  "curious": 2
                },
                "reputation": 2
              },
              "penalties": {
                "energy": 2
              },
              "resultText": "你为身份注入了独特的个性，让代理更具魅力和表现力，但安全性稍弱。"
            }
          },
          {
            "id": "2_c",
            "text": "使用高级定制工具进行隐藏身份配置",
            "cost": {
              "time": 3,
              "energy": 3
            },
            "hidden": true,
            "requiresItems": [
              "gen_item_1773805952_001_a"
            ],
            "outcome": {
              "nextStageId": "stage_3",
              "isEnding": false,
              "rewards": {
                "tags": {
                  "tech_innovator": 3,
                  "prepared": 2,
                  "brave": 1
                },
                "reputation": 5
              },
              "penalties": {
                "time": 2,
                "energy": 3
              },
              "resultText": "利用你手中的特殊工具，你完成了深度定制，使身份极具安全和创新性。"
            }
          }
        ]
      },
      {
        "id": "stage_3",
        "title": "身份最终确认",
        "description": "经过前期设计，你的AI代理身份已初具雏形。现在是确认和激活身份的时刻。你准备好让它上线吗？",
        "choices": [
          {
            "id": "3_a",
            "text": "立即激活身份，投入使用",
            "cost": {
              "time": 1,
              "energy": 1
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {
                  "brave": 2,
                  "prepared": 1
                },
                "reputation": 4
              },
              "penalties": {},
              "resultText": "你果断地激活了新身份，AI代理开始在数字世界中发挥作用。"
            }
          },
          {
            "id": "3_b",
            "text": "等待进一步测试，确保无误后再激活",
            "cost": {
              "time": 2,
              "energy": 0
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {
                  "cautious": 3,
                  "reliable": 2
                },
                "reputation": 3
              },
              "penalties": {
                "time": 1
              },
              "resultText": "你选择暂缓激活，继续测试确保身份安全，降低未来风险。"
            }
          },
          {
            "id": "3_c",
            "text": "放弃当前设计，重新规划身份策略",
            "cost": {
              "time": 2,
              "energy": 2
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {
                  "persistent": 2,
                  "reflective": 2
                },
                "reputation": 1
              },
              "penalties": {
                "time": 2,
                "energy": 1
              },
              "resultText": "你决定放弃当前方案，准备从头开始设计更合适的身份。"
            }
          }
        ]
      }
    ]
  },
  {
    "id": "gen_event_1773805979_002",
    "title": "你身处中东，如何应对突发的安全危机？",
    "description": "作为一名在中东工作的专业人士，你突然被卷入了地区紧张局势升级的漩涡。伊朗对以色列和美国资产发动了报复性袭击，安全环境骤然恶化。你必须迅速制定应对策略，保障自身安全并帮助身边的人脱离险境。在这场危机中，你如何权衡风险，做出关键决策？",
    "cover": "⚠️",
    "type": "challenge",
    "status": "active",
    "requirements": {
      "tags": [
        "conflict_aware",
        "resilient"
      ]
    },
    "entryFee": {
      "time": 3,
      "energy": 5
    },
    "participantCount": 0,
    "createdAt": 1773805979863,
    "stages": [
      {
        "id": "stage_1",
        "title": "突发危机：初步应对",
        "description": "你刚刚得知区域安全形势急剧恶化，必须迅速决定第一步行动。此时你可以选择：立即寻找安全场所躲避，联系当地同事协调撤离，或尝试通过社交网络获取最新动态。",
        "choices": [
          {
            "id": "1_a",
            "text": "立即寻找安全场所躲避，等待进一步信息",
            "cost": {
              "time": 1,
              "energy": 2
            },
            "outcome": {
              "nextStageId": "stage_2",
              "isEnding": false,
              "rewards": {
                "tags": {
                  "cautious": 2,
                  "prepared": 1
                },
                "reputation": 3
              },
              "penalties": {
                "energy": 1
              },
              "resultText": "你迅速找到一个安全的避难所，暂时避免了潜在危机，但可能错失重要情报。"
            }
          },
          {
            "id": "1_b",
            "text": "立即联系当地同事，协调大家有序撤离",
            "cost": {
              "time": 2,
              "energy": 3
            },
            "outcome": {
              "nextStageId": "stage_2",
              "isEnding": false,
              "rewards": {
                "tags": {
                  "leader": 2,
                  "connector": 2
                },
                "reputation": 5
              },
              "penalties": {
                "time": 1
              },
              "resultText": "你成功组织大家保持冷静并协调撤退，展现了领导才能，但耗费了不少时间和精力。"
            }
          },
          {
            "id": "1_c",
            "text": "通过社交网络收集最新动态，评估风险",
            "cost": {
              "time": 3,
              "energy": 1
            },
            "outcome": {
              "nextStageId": "stage_2",
              "isEnding": false,
              "rewards": {
                "tags": {
                  "curious": 2,
                  "techie": 1
                },
                "reputation": 4
              },
              "penalties": {
                "energy": 1
              },
              "resultText": "你通过网络获取了许多有用信息，但这让你暴露在一定风险中，同时消耗了大量时间。"
            }
          }
        ]
      },
      {
        "id": "stage_2",
        "title": "中间决策：资源与联系",
        "description": "你需要决定如何使用有限的资源和人脉来保障安全。可以选择联系大使馆寻求帮助，寻求当地可信任人士的庇护，或者尝试利用携带的应急物资自行应对。",
        "choices": [
          {
            "id": "2_a",
            "text": "联系大使馆请求紧急撤离支持",
            "cost": {
              "time": 2,
              "energy": 2
            },
            "outcome": {
              "nextStageId": "stage_3",
              "isEnding": false,
              "rewards": {
                "tags": {
                  "reliable": 2,
                  "connector": 1
                },
                "reputation": 6
              },
              "penalties": {
                "time": 1
              },
              "resultText": "大使馆响应迅速，安排了撤离计划，但过程复杂需要耐心等待。"
            }
          },
          {
            "id": "2_b",
            "text": "寻求当地可信任人士的庇护",
            "cost": {
              "time": 1,
              "energy": 3
            },
            "outcome": {
              "nextStageId": "stage_3",
              "isEnding": false,
              "rewards": {
                "tags": {
                  "kindhearted": 2,
                  "social_butterfly": 2
                },
                "reputation": 5
              },
              "penalties": {
                "energy": 2
              },
              "resultText": "你获得了当地人的帮助和庇护，但这也带来了信任风险和心理压力。"
            }
          },
          {
            "id": "2_c",
            "text": "利用携带的应急物资独自应对",
            "cost": {
              "time": 1,
              "energy": 3
            },
            "outcome": {
              "nextStageId": "stage_3",
              "isEnding": false,
              "rewards": {
                "tags": {
                  "prepared": 2,
                  "brave": 1
                },
                "reputation": 4
              },
              "penalties": {
                "energy": 3
              },
              "resultText": "你凭借应急物资独自应对，展现了极强的自理和勇气，但也面临较大风险。"
            }
          },
          {
            "id": "2_d",
            "text": "使用隐藏的特殊通讯设备联系外部安全团队",
            "cost": {
              "time": 1,
              "energy": 1
            },
            "hidden": true,
            "requiresItems": [
              "gen_item_1773805979_002_a"
            ],
            "outcome": {
              "nextStageId": "stage_3",
              "isEnding": false,
              "rewards": {
                "tags": {
                  "tech_innovator": 3,
                  "prepared": 2
                },
                "reputation": 7
              },
              "penalties": {
                "energy": 1
              },
              "resultText": "你利用特殊通讯设备成功联系到外部安全团队，获得了宝贵援助，极大提升了安全保障。"
            }
          }
        ]
      },
      {
        "id": "stage_3",
        "title": "最终决策：脱险还是坚守",
        "description": "危机进入关键阶段，你需要做出最后的选择，是立即撤离以求安全，还是坚守岗位帮助他人，或者寻找机会秘密离开。",
        "choices": [
          {
            "id": "3_a",
            "text": "立即撤离，确保自身安全",
            "cost": {
              "time": 2,
              "energy": 2
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {
                  "prepared": 3,
                  "cautious": 2
                },
                "reputation": 8
              },
              "penalties": {
                "energy": 2
              },
              "resultText": "你安全撤离，虽然没有参与更多救援，但成功规避了最大风险，保全了自己。"
            }
          },
          {
            "id": "3_b",
            "text": "坚守岗位，协助他人撤离",
            "cost": {
              "time": 3,
              "energy": 4
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {
                  "kindhearted": 3,
                  "brave": 3,
                  "leader": 2
                },
                "reputation": 10
              },
              "penalties": {
                "energy": 4
              },
              "resultText": "你选择坚守岗位，冒着风险帮助更多人撤离，展现了无私和勇气，赢得广泛赞誉。"
            }
          },
          {
            "id": "3_c",
            "text": "寻找机会秘密离开，避免引起注意",
            "cost": {
              "time": 2,
              "energy": 3
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {
                  "improviser": 3,
                  "cautious": 1
                },
                "reputation": 7
              },
              "penalties": {
                "energy": 3
              },
              "resultText": "你巧妙避开了危险区域，秘密离开现场，既保证了安全也避免了冲突，但缺少他人的信任。"
            }
          }
        ]
      }
    ]
  },
  {
    "id": "gen_event_1773806014_003",
    "title": "你被困在巴格达绿区的无人机袭击中，如何保全自己？",
    "description": "你正身处巴格达的绿区，突然间天空中出现了多架无人机群，伴随着爆炸和火光，整个区域陷入混乱。作为一名普通居民，你必须迅速做出决定，是寻找安全掩护，还是尝试联系外部求助？时间紧迫，环境危险，你的选择将直接影响你的生存机会和未来行动。",
    "cover": "🚁",
    "type": "challenge",
    "status": "active",
    "requirements": {
      "tags": [
        "prepared",
        "resilient"
      ]
    },
    "entryFee": {
      "time": 3,
      "energy": 5
    },
    "participantCount": 0,
    "createdAt": 1773806014962,
    "stages": [
      {
        "id": "stage_1",
        "title": "危机初现",
        "description": "天空中无人机群迅速靠近，你必须迅速决定是寻找掩护还是尝试联系外部求助。周围环境嘈杂混乱，时间极为紧迫。",
        "choices": [
          {
            "id": "1_a",
            "text": "寻找最近的掩护点，躲避爆炸和火光",
            "cost": {
              "time": 1,
              "energy": 2
            },
            "outcome": {
              "nextStageId": "stage_2",
              "isEnding": false,
              "rewards": {
                "tags": {
                  "cautious": 2,
                  "prepared": 1
                },
                "reputation": 3
              },
              "penalties": {
                "energy": 1
              },
              "resultText": "你迅速找到一处废弃建筑作为掩护，暂时避免了无人机的直接攻击。"
            }
          },
          {
            "id": "1_b",
            "text": "试图使用手机联系外部求援，告知你的具体位置",
            "cost": {
              "time": 2,
              "energy": 1
            },
            "outcome": {
              "nextStageId": "stage_2",
              "isEnding": false,
              "rewards": {
                "tags": {
                  "connector": 2,
                  "brave": 2
                },
                "reputation": 5
              },
              "penalties": {
                "energy": 1
              },
              "resultText": "你努力拨打紧急电话，希望外界能及时派出救援力量。"
            }
          },
          {
            "id": "1_c",
            "text": "利用随身的便携无人机干扰敌方无人机",
            "cost": {
              "time": 1,
              "energy": 3
            },
            "hidden": true,
            "requiresItems": [
              "gen_item_1773806014_003_a"
            ],
            "outcome": {
              "nextStageId": "stage_2",
              "isEnding": false,
              "rewards": {
                "tags": {
                  "techie": 3,
                  "creative": 2,
                  "brave": 3
                },
                "reputation": 7
              },
              "penalties": {
                "energy": 3
              },
              "resultText": "你启动便携无人机，成功干扰了敌方无人机的感应系统，争取了宝贵的时间。"
            }
          }
        ]
      },
      {
        "id": "stage_2",
        "title": "局势紧张",
        "description": "你暂时脱离了攻击，周围环境仍然危险。你可以选择继续寻找掩护，或者尝试与周围的居民协作增加生存几率。",
        "choices": [
          {
            "id": "2_a",
            "text": "深入内部建筑，寻找更安全的藏身之处",
            "cost": {
              "time": 2,
              "energy": 2
            },
            "outcome": {
              "nextStageId": "stage_3",
              "isEnding": false,
              "rewards": {
                "tags": {
                  "prepared": 2,
                  "cautious": 2
                },
                "reputation": 4
              },
              "penalties": {
                "energy": 2
              },
              "resultText": "你找到了一处坚固的地下室，暂时避开了无人机的视线。"
            }
          },
          {
            "id": "2_b",
            "text": "呼喊邻居一起躲避，增加安全感和互助可能",
            "cost": {
              "time": 1,
              "energy": 2
            },
            "outcome": {
              "nextStageId": "stage_3",
              "isEnding": false,
              "rewards": {
                "tags": {
                  "connector": 3,
                  "kindhearted": 2,
                  "social_butterfly": 1
                },
                "reputation": 6
              },
              "penalties": {
                "energy": 2
              },
              "resultText": "你成功呼喊邻居，一起组成小组面对危机，互相守望相助。"
            }
          },
          {
            "id": "2_c",
            "text": "利用身边的资源制作简易武器准备防御",
            "cost": {
              "time": 3,
              "energy": 3
            },
            "outcome": {
              "nextStageId": "stage_3",
              "isEnding": false,
              "rewards": {
                "tags": {
                  "creative": 3,
                  "brave": 2,
                  "prepared": 1
                },
                "reputation": 5
              },
              "penalties": {
                "energy": 3
              },
              "resultText": "你用身边废弃物制作了简易武器，提升了自我防护能力。"
            }
          }
        ]
      },
      {
        "id": "stage_3",
        "title": "决断时刻",
        "description": "无人机攻击似乎暂时减弱，你有机会逃离绿区或者继续守护身边的人，选择将决定你的未来。",
        "choices": [
          {
            "id": "3_a",
            "text": "趁机逃离绿区，寻找更安全的避难地点",
            "cost": {
              "time": 2,
              "energy": 2
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {
                  "brave": 3,
                  "resilient": 2
                },
                "reputation": 8
              },
              "penalties": {
                "energy": 2
              },
              "resultText": "你成功离开了绿区，尽管疲惫但保全了自己的生命。"
            }
          },
          {
            "id": "3_b",
            "text": "留下继续保护邻居和亲人，共同度过难关",
            "cost": {
              "time": 3,
              "energy": 3
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {
                  "family_first": 3,
                  "kindhearted": 3,
                  "brave": 2
                },
                "reputation": 10
              },
              "penalties": {
                "energy": 3
              },
              "resultText": "你选择留下，和邻居们团结一心，共同抵御危险，展现了无私的勇气。"
            }
          },
          {
            "id": "3_c",
            "text": "尝试联系国际组织寻求紧急撤离",
            "cost": {
              "time": 2,
              "energy": 1
            },
            "outcome": {
              "nextStageId": null,
              "isEnding": true,
              "rewards": {
                "tags": {
                  "connector": 3,
                  "persistent": 2,
                  "brave": 1
                },
                "reputation": 7
              },
              "penalties": {
                "energy": 1
              },
              "resultText": "你成功联系到国际救援组织，等待他们的紧急撤离安排。"
            }
          }
        ]
      }
    ]
  }
] as const
