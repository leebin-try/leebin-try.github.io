---
title: "把一个分数拆开：排序、概率、阈值与训练曲线分别说明什么"
description: "AUC、log loss、MCC、QWK、Dice 和 MCRMSE 衡量不同对象。指标的名字，应该决定我们怎样解释提升与停止。"
date: "2026-11-26"
category: "Kaggle"
tags: ["通用方法", "评价指标", "学习曲线"]
cover: "terminal"
sample: false
draft: false
featured: false
kaggle: {"kind": "method", "source": "https://leebin-try.github.io/kaggle/sources/#protocol", "evidenceDate": "2026-11-25", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/PROJECT_STANDARD.md"}
---

0.9999 的 AUC、0.82657 的 log loss、0.59760 的 MCRMSE，看起来大小差很多，却没有一条共同刻度能把这些模型排成强弱。它们甚至有不同优化方向。

我更愿意先问：**这个分数在评价排序、概率、硬决策，还是几何误差？** 答案会影响阈值、校准、检查点选择，以及我们能向读者说什么。

## 排序正确，概率仍可能不够好

[Aerial Cactus](/posts/kaggle-14-aerial-cactus/) 的停止 AUC 已到 1.0，BCE 还继续降低。只要正负排序不变，模型可以从不太确定变得更确定，AUC 却不变。因此，AUC 平台不能直接解释为概率损失平台。

log loss 会惩罚对错误答案的过高置信度。[LLM 偏好预测](/posts/kaggle-09-llm-preference/) 输出三类概率，列顺序、归一化、融合温度都影响最终含义。把最大的概率转成标签后再只看 accuracy，会丢掉比赛正在考查的一部分能力。

## 连续模型，未必用连续指标交付

[CMI](/posts/kaggle-15-cmi/) 用回归输出连续数值，却要通过有序阈值得到四类，再计算 QWK；[毒蘑菇](/posts/kaggle-12-mushrooms/) 的 MCC 也依赖硬标签。停止 RMSE 或 log loss 的最优点，不必然等于阈值后比赛指标的最优点。

阈值应该在声明过的开发预测上选择，并与最后的独立检查隔开。它是模型的一部分，不是得到官方成绩之后可以随意修改的装饰。

## 平均分会隐藏少数类或第二个目标

CMI 的 audit 中，最高严重度七个人全没判对，总体 QWK 仍不为零。[CommonLit](/posts/kaggle-16-commonlit/) 的措辞误差高于内容误差，但两个目标平均后，弱点变得不那么显眼。

这类复盘至少应该带上支持数、混淆矩阵或分目标指标。某一类缺席时，结果是“无法估计”，不是召回率为零；某一类只有几个样本时，也不能把很小的差异当成稳定能力。

## 几何问题还多一层：度量对象是否一致

图像掩码重叠、器官三维边界与图片分类准确率不同。GI 的内部原生像素 Dice 不能直接冒充官方 Dice3DHausdorff。缩放、阈值与 RLE 编码顺序也会决定最终被度量的几何对象。

[Carvana](/posts/kaggle-17-carvana/) 的静态标签核对，提示我们应该先确认序列化语义。一个数值范围合法的字符串，并不代表它描述了正确方向的掩码。

## 怎样读训练曲线才不越界

训练损失是在带增强、不断更新的模型上测得；验证损失通常在固定的评估状态上测得，二者不一定是同一种测量。MixUp、标签平滑和分辨率变化还会进一步改变上下文。

最佳轮次落在上限，或 patience 尚未完整观察，都应保留“收敛未解决”。全量重训没有独立验证，不能根据它的训练曲线补造一条验证轨迹。混合精度处理过多少批次，也不等于成功更新了多少次参数；跳过的更新要单列。

最后，把分数、曲线与决定放在一起记录：哪一条指标用来停，哪一条用来选，哪一条来自官方。这样才能解释为什么某次更低的损失没有带来更好的决策，而不必用“过拟合”三个字包办所有原因。

## 资料与证据

- [训练日志、曲线与充分性标准](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/PROJECT_STANDARD.md#learning-curves-and-training-sufficiency)
- 各案例的原始曲线口径与分数出处见对应复盘中的资料链接。

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#protocol)列出了本文的结果口径、记录日期与可核对范围。
