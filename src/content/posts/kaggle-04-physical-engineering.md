---
title: "PLE：能调用模型，离能评测智能体还有一段距离"
description: "一次成功的 GPU 推理没有建立完整工程评测环境。环境就绪度应成为独立结论，而不是被包装成任务能力。"
date: "2026-11-26"
category: "Kaggle"
tags: ["智能体", "Google", "竞赛复盘"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 4, "topic": "智能体", "status": "验证受阻", "result": "无官方评分；完整 Docker 评测环境未建立", "evidenceDate": "2026-11-25", "source": "https://leebin-try.github.io/kaggle/sources/#case-04", "competitionUrl": "https://www.kaggle.com/competitions/physical-engineerings-last-exam", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/04_physical_engineerings_last_exam/docs/solution.md"}
---

这篇记录最重要的结论，是**还没有可以支持能力判断的完整评测**。Physical-Engineering's Last Exam 需要智能体在工程任务环境中操作、交付文件并接受评分。把模型服务启动起来，只打通了其中一层。

## 系统边界：模型、工具与任务环境

官方模板通过任务桥接层连接 Docker 任务环境，模型和工具由 Pi harness 协调。一个任务的文件、容器、执行权限、交付路径和评分器共同构成评测对象。单独替换模型或调整提示词，不能替代这些条件。

已完成的远程探针在 T4 环境上运行过小型 Qwen 模型，验证了 CUDA 推理。模型只使用了一个 GPU；这不是完整工程任务，也不是双 GPU 工程能力评测。

## 为什么没有继续用“先跑一点”掩盖问题

当时的 Kaggle 环境缺少 Docker 执行文件、daemon socket 和所需能力，非特权命名空间也未建立出可用路径。在零付费支出的约束下，没有得到合适的完整 Docker 宿主环境。

因此，目前没有完整公开开发任务的评分，没有可确认的官方 Writeup 评估结果，也没有官方比赛得分。仓库、静态检查和模型回复都真实存在，但它们回答的是别的问题。

## 观点：评测基础设施本身应有验收标准

对普通分类器，一份输入表和标签就能开始离线验证；对工程智能体，环境行为也是问题定义的一部分。环境不一致时，即便产生了答案，也可能根本无法与官方结果比较。

我倾向于把验收拆成三个问题：任务能否在隔离环境里启动；智能体能否读取输入并把产物放到正确位置；评分器能否真正读取产物并产生结果。只有最后一环走通，才进入模型能力比较。

## 可迁移的经验

这个案例适合提醒所有带浏览器、容器、游戏或工具执行的任务：先证明评测闭环，再投入大模型调参。下一步应是获得合适且已授权的远程 Docker 环境，运行真实开发任务并保留产物与评分日志。在这之前，把状态留为“验证受阻”本身就是必要的工程结论。

## 资料与证据

- [官方比赛页面](https://www.kaggle.com/competitions/physical-engineerings-last-exam)
- [本篇依据的实验记录（私有源仓库，需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/04_physical_engineerings_last_exam/docs/solution.md)
- [对应代码与版本（需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/04_physical_engineerings_last_exam/)

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#case-04)列出了本文的结果口径、记录日期与可核对范围。
