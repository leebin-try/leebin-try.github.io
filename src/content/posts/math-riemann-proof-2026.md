---
title: "读懂 11 月 20 日的黎曼猜想证明：从素数误差到 θ 提升"
description: "沿着素数加权和、格的体积比较、主不等式和无零点半平面，拆解证明的数学结构；附概念解释、逐文件阅读顺序、课程与练习。"
date: "2026-11-26T05:26:13Z"
category: "Math"
tags: ["Math", "黎曼猜想", "解析数论", "形式化证明"]
cover: "terminal"
coverImage: "/math/riemann-2026/cover.svg"
coverAlt: "原创数学示意图：临界带、实部二分之一的直线，以及从素数加权和到格与无零点半平面的阅读路线。"
coverCaption: "本站原创概念图；图中的点用于说明临界线，不是数值验零结果，也不是原论文配图。"
sample: false
draft: false
featured: false
lang: "zh"
math: {"kind":"reading-guide","topic":"analytic-number-theory","evidenceDate":"2026-11-26","source":"https://alpo.ge/remark.pdf","verificationSource":"https://math.mit.edu/~drew/grh/","proofCommit":"72fead102f663d5c7a407964a13dc0cf9d977207"}
---

**读懂这次证明，最有价值的起点是一个“夹逼”：同一个算术格的体积，一边不能太大，另一边不能太小。两边的大主项相消，剩下的恰好是一个素数加权和的误差。控制住它，才能通过复分析把零点逼回临界线。**

这句话比“用了自守形式、伽罗瓦表示和 AI”多说了一步：它指出这些工具最终要共同完成什么。本文的目标，是让有微积分和线性代数基础的读者能够解释这条因果链，亲手算出其中几座桥梁，并知道继续读原证明时应该补什么。

阅读可以分三次：第一次抓住命题、加权和与体积比较；第二次跟着主不等式做代数；第三次对照 Lean 文件，向 θ 提升与分母控制两个技术分支深入。长公式和宽表格可在各自区域横向滚动，所有图示都提供原图。

## 1. 先确认我们在读哪一份证明

本文讨论 Levent Alpöge 于 **2026 年 11 月 20 日**公布、与 Claude 合作完成的证明。当天的四页说明是研究公告和思路线索，完整论证以 Lean 形式化工程发布。[作者公告][announcement]

截至本文核实日 **2026 年 11 月 26 日**，Lean FRO 与 Mathlib Initiative 已发表联合声明，确认命题陈述及证明的正确性；Andrew Sutherland 的页面列出已完成的独立核验。[社区声明][community]、[原版核验记录][verification]

这里要把三件事分别理解：形式化证明是否通过检查、数学家是否已经拥有简洁的人类可读解释、某个机构是否完成其认定或奖励程序。第一件已有上述公开证据，不能再简单说成“只是一份没人核验的 AI 输出”；但第一件也不等于后两件已经全部完成。

**本文使用 11 月 25 日发布的较短重写版作为主要数学阅读入口**，固定在提交 `72fead102f663d5c7a407964a13dc0cf9d977207`。该仓库明确说明它沿用原证明的方法，同时重写了不少步骤；本文不会把两个版本说成逐行相同。MIT 的另一份记录覆盖了这个版本的核验。[重写版说明][repo]、[较短版核验][short-verification]

因此，下文是“围绕 11 月 20 日证明，借助较短版本理解数学结构”的长篇阅读指南。本站阅读了所列的入口文件与关键接口，没有在这里重新编译全部 Lean 工程，也没有完成所有底层数学引理的独立复核。原始核验、本文推导和教学类比分别标明。

## 2. 黎曼猜想究竟把什么约束在二分之一

设复数 $s=\sigma+it$。实部 $\sigma$ 和虚部 $t$ 是两个独立坐标，$\operatorname{Re}s=1/2$ 表示复平面上的一条竖直直线，不是一个点。

最初可以在 $\operatorname{Re}s>1$ 定义

$$
\zeta(s)=\sum_{n=1}^{\infty}\frac1{n^s}
=\prod_{p\ \mathrm{prime}}\frac1{1-p^{-s}}.
$$

这里 $n^{-s}=e^{-s\log n}$；复指数把振荡也引入了求和。右边的欧拉乘积来自整数的唯一素因子分解：展开每一个几何级数，每个正整数恰好出现一次。绝对收敛是允许这样重排的关键条件。

这一定义区域还没有包含大多数我们关心的零点。需要**解析延拓**：把函数延伸成除 $s=1$ 的极点外处处全纯的函数。它不是宣布原级数在所有地方都收敛，更不是随意给发散和赋值。延拓后的函数要与原区域上的函数一致，复分析中的唯一性保证这项要求非常强。

延拓后，$-2,-4,-6,\ldots$ 是平凡零点。黎曼猜想关心的是其余零点：它们都应该满足 $\sigma=1/2$。问题的正式说明可看 [Clay 的问题页面][clay]；不要把“检查了许多零点”与“对全部复数证明了命题”混为一谈。

理解最后一步还需要完成函数

$$
\xi(s)=\tfrac12s(s-1)\pi^{-s/2}\Gamma(s/2)\zeta(s),
\qquad \xi(s)=\xi(1-s).
$$

前面的因子处理极点和伽马因子带来的问题，让对称性以整函数的形式出现。它说明非平凡零点在 $s\mapsto1-s$ 下成对。**对称性本身只说明左右成对，不说明每个零点都在对称轴上。** 一个关于中线对称的矩形，四个顶点也不会因此落在中线上。

真正困难的任务，是先排除所有实部大于 $1/2$ 的零点；然后利用对称性排除左边，才得到都在中线上。较短版本的 [New/Main.lean][main] 把这最后一步单独写了出来。

## 3. 为什么一个关于素数的问题会变成零点问题

素数计数函数 $\pi(x)$ 很直观，却不最方便参与代数运算。更常用的权重是冯·曼戈尔特函数：

$$
\Lambda(n)=
\begin{cases}
\log p,&n=p^k,\quad k\ge1,\\
0,&\text{otherwise}.
\end{cases}
$$

例如 $\Lambda(8)=\log2$，$\Lambda(9)=\log3$，而 $\Lambda(12)=0$。必须把素数幂也纳入，原因可以直接从欧拉乘积算出：在绝对收敛区域取对数、求导，得到

$$
-\frac{\zeta'(s)}{\zeta(s)}
=\sum_p\sum_{k\ge1}(\log p)p^{-ks}
=\sum_{n\ge1}\frac{\Lambda(n)}{n^s}.
$$

左边的对数导数在零点处出现极点；右边却完全由素数幂构成。**这就是素数与零点之间可计算的接口。** 两边不是因为“都很神秘”而相关，而是同一个函数的两种精确表示。

定义 $\psi(x)=\sum_{n\le x}\Lambda(n)$，素数定理说 $\psi(x)\sim x$。更细的问题是 $\psi(x)-x$ 的规模。经典 RH 误差界的尺度为 $\sqrt{x}$，附带对数因子；直观上，实部为 $\beta$ 的零点会在显式公式里带来 $x^{\beta}$ 级别的振荡。

但这还不是一个完整排零点论证。不同零点的贡献会振荡、可能抵消；要从“总和很小”严格推出“某个零点不存在”，必须说明使用的变换、收敛区域以及无法被抵消的奇点。后面的一侧界判据就是负责这一步的。

先看一个可以自行验证的平滑过程。令

$$
S(x)=\sum_{n\le x}\Lambda(n)\left(\frac{x}{n}-1\right).
$$

当 $\operatorname{Re}s>1$ 时，逐项积分可得

$$
\int_1^\infty S(x)x^{-s-1}\,dx
=-\frac{\zeta'(s)}{\zeta(s)}\frac1{s(s-1)}.
$$

你可以先计算一个 $n$ 的贡献：$\int_n^\infty(x/n-1)x^{-s-1}dx=n^{-s}/[s(s-1)]$，再求和。平滑权重在变换侧提供了分母，使分析更容易处理。将 $S(x)$ 除以 $x$ 后，零点所对应的尺度也从 $x^\beta$ 变为 $x^{\beta-1}$；后文的 $x^{-1/2+\varepsilon}$ 正是在这种归一化下出现的。

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/math/riemann-2026/three-languages.svg" target="_blank" rel="noopener" aria-label="放大：算术、分析与几何的接口"><img src="/math/riemann-2026/three-languages.svg" alt="三种语言的接口：算术中的素数幂和，经对数导数与变换连接分析中的零点；几何中的整数结构与体积比较提供所需不等式。" width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>图 1 · 三种语言必须通过精确接口连接。</strong> 图示是本站原创阅读地图；箭头表达证明依赖，不替代桥梁自身的证明。<a href="/math/riemann-2026/three-languages.svg">打开原图</a>。</figcaption>
</figure>

## 4. 证明实际控制的加权和，不能只用一个 ψ 代替

为了理解直觉，可以先看 $\psi$；为了读原文，必须换成实际使用的对象。较短版固定一个模数 $q$、一个满足条件的辅助素数 $d$，并采用二次特征 $\chi_d(n)=(n/d)$。写成本文的记号：

$$
\lambda_{d,q}(n)=\Lambda(n)(1-\chi_d(n))\,\mathbf1_{n\equiv1\pmod q}.
$$

再定义归一化余项

$$
R_{d,q}(x)=
\sum_{n\le x}\lambda_{d,q}(n)\left(\frac1n-\frac1x\right)
-\frac{\log x}{\varphi(q)}-c_{d,q}.
$$

$\varphi(q)$ 是欧拉函数，$c_{d,q}$ 是由相应对数导数确定的常数，并不是看着数值曲线临时拟合的截距。特征值为 $1$ 的项被抑制，值为 $-1$ 的项被加倍；剩余类条件再筛选算术信息。[PrimeSums.lean][prime-sums] 与 [OneSidedBound.lean][one-sided] 给出这些对象及它们之间的关系。

为什么引入看似麻烦的权重？因为这套证明要同时处理狄利克雷 $L$ 函数，而特征能分离不同算术方向；辅助二次扭曲还要在排零点步骤中消除不想要的干扰。用一个没有特征、没有剩余类限制的数值实验，不能直接替代这个命题。

可读版先对模数 $q$ 为 $18480$ 的正倍数、辅助素数满足 $d\equiv q/2-1\pmod q$ 的情形建立构造。最后对任意原始模数 $N$，改在 $q=18480N$ 上诱导特征，再回到原函数；这一步也写在最终定理中。这个技术常数用于组织允许的算术参数，决定误差指数的则是后面的链长与预算。[最终归约][one-sided]

形式化工程最终证明的核心目标可以写成：对每个允许的固定 $(d,q)$ 和每个 $\varepsilon>0$，存在足够大的阈值，使

$$
R_{d,q}(x)\le x^{-1/2+\varepsilon}.
$$

注意三点。第一，这是**上界**，不是绝对值界。第二，阈值允许依赖固定参数，不能悄悄改成对所有 $d,q$ 同时统一。第三，“每个 $\varepsilon>0$”不可替换成只证明 $\varepsilon=0.1$；只有可以任意接近 $1/2$，才足以排除整片右半平面。

狄利克雷 $L$ 函数是

$$
L(s,\chi)=\sum_{n\ge1}\frac{\chi(n)}{n^s}
\qquad(\operatorname{Re}s>1),
$$

再做适当延拓。这里 $\chi$ 是周期性、乘法性的算术函数，不是任意取值的标签。本文讨论的广义黎曼猜想范围是**狄利克雷特征对应的 $L$ 函数**；不能自动把它扩写成所有自守 $L$ 函数的广义断言。[固定版本的命题文件][statements] 可以直接检查结论究竟量化了什么。

## 5. 单侧上界为什么足以排零点

对任意函数，单侧上界当然不够。例如 $E(x)=-x^{100}$ 满足 $E(x)\le x^{-1/2}$（$x\ge1$），但它的绝对值极大。因此，“证明某个误差不太大，所以没有零点”中间不能省略分析定理。

这里用到的是带有特殊变换结构的单侧判据。阅读 [Zeros/Criterion.lean][criterion] 时，应把它拆成以下依赖，而不是只背“Landau 引理”这个名字：

1. 假设存在一个实部大于某个 $\beta>1/2$ 的目标零点 $\rho$。
2. 在指定同余类中选择辅助素数 $d$，使需要处理的区域中，辅助扭曲的 $L$ 函数没有相应零点。这一选择有自己的零密度论证，不是再假设一次 GRH。
3. 把 $R_{d,q}(e^v)$ 的变换写成亚纯函数。去掉辅助零点的干扰后，极点的留数对应原目标函数的零点重数。
4. 在实轴上，这些留数满足判据需要的非负条件；同时，最终的一侧界给出指数增长限制。
5. Landau 型结论迫使右侧区域的留数为零，与目标零点有正重数矛盾。

其中的基本思想是：**对非负对象，收敛边界上的奇点不可以任意消失；符号条件让分析延拓受到额外限制。** 工程中的精确版本见 [Lib/Analytic/Landau.lean][landau]：它明确列出变换、增长条件、实点留数的符号，不能把它误读成对任意有上界的函数都成立。

这个步骤还解释了为什么辅助素数与特征并非装饰。如果你只记得 $R(x)$ 的上界，却丢掉它对整族二次扭曲成立的量词，就无法按需选择 $d$ 清理奇点，整座分析桥梁会断开。

最终，对任意假想的 $\operatorname{Re}\rho>1/2$，选

$$
\frac12<\beta<\operatorname{Re}\rho.
$$

使用任意小指数余量得到判据需要的界，就排除了这个零点。再用函数方程，得到临界带中的零点实部等于 $1/2$。这是“任意小误差指数”走向“精确直线”的逻辑，不是让一个数值近似最终四舍五入成二分之一。

## 6. 先用二维格理解“体积加两倍指标”

进入自守形式之前，先把格的体积算一遍。欧氏空间中的格，是一组实线性无关向量的整数线性组合。若基向量为 $v_1,\ldots,v_r$，其基本平行多面体的体积称为余体积：

$$
\operatorname{covol}(L)^2
=\det\big(\langle v_i,v_j\rangle\big).
$$

右边是 Gram 行列式。这是为什么证明会同时出现范数、行列式和体积：它们正在从不同方向描述同一个量。

取 $L=\mathbb Z^2$，子格 $L'=2\mathbb Z\times3\mathbb Z$。基向量是 $(2,0)$ 和 $(0,3)$，余体积为 $6$；Gram 矩阵为 $\operatorname{diag}(4,9)$，其行列式为 $36$。指标 $[L:L']=6$，表示一个基本区域中有多少个模掉子格后的整数类。

一般地，若 $L'\subset L$ 的有限指标为 $I$，则

$$
\operatorname{covol}(L')=I\operatorname{covol}(L),
\qquad
\log\operatorname{covol}(L')^2
=\log\operatorname{covol}(L)^2+2\log I.
$$

**两倍指标损失来自平方体积的对数，不是随手写上的常数。** 实际证明中的扭曲格比二维例子复杂得多，但这条简单恒等式能帮你识别“体积上界加两倍指标预算”这类表达的来源。

还要理解 Hadamard 不等式：Gram 行列式不超过各个向量长度平方的乘积。于是，如果能找到许多独立的短向量，就能给它们张成的格一个体积上界。

然而，**只找到一个短向量，甚至找到很多个彼此重合的短向量，都不够。** 一个零向量当然短，却没有提供任何有效维度。后面单独出现的“足够多”定理，就是为了解决这个问题。

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/math/riemann-2026/lattice.svg" target="_blank" rel="noopener" aria-label="放大：二维格的指标与余体积"><img src="/math/riemann-2026/lattice.svg" alt="二维教学例子：子格由二倍第一坐标和三倍第二坐标生成，指标与余体积都是六，Gram 行列式为三十六。" width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>图 2 · 可以亲手算完的格。</strong> 这是解释指标修正的教学例子，不是把高秩自守构造降成二维就完成了证明。<a href="/math/riemann-2026/lattice.svg">打开原图</a>。</figcaption>
</figure>

## 7. 三块核心输入：短、足够多、不能整体太短

在较短版本中，证明围绕源空间、目标空间以及 θ 提升链组织。我们把目标空间维数记为 $D$，选出的独立向量个数记为 $n$。这两者不要与辅助素数 $d$ 混淆。

### A：短向量与指标控制

“短”不是说原始函数在某个点的绝对值小，而是说：从源空间的整数形式出发，经规范化的 Poincaré 映射和提升链后，获得可控制的平方范数。这个控制还要对相关的复嵌入成立，并伴随有限素数处的整性和指标损失。

为什么同时管复数范数和有限素数？因为分母可以让一个数在实数意义下看起来很小。若你把 $1/2^{100}$ 当成任意小的“整数证据”，就已经遗失了最重要的算术约束。A 必须同时记录小范数的收益和整性损失。[ShortAndEnough.lean][short-enough]

### B：短向量必须覆盖足够多维度

源空间能被好向量张成，不代表其映射覆盖整个目标空间。B 通过一组受控的平移，证明这些像张成目标空间中接近全部的维度。阅读主不等式时，最直接用到的是

$$
\frac D2\le n\le D.
$$

工程给出的比例更接近 $1$；二分之一是后续代数足够使用的简化界。B 的角色，是避免上界只控制到一个太小的特殊子空间。它的数学输入包括二阶矩、相关性估计与张成性质，而非单纯数一数生成了多少文件。[张成定理][spanning]

### C：满足整性条件的大家族不能整体太短

C 为接近满维的独立目标形式给出修正余体积下界。它使用扭曲后的提升、行列式比较、补全基以及高度控制。这里的“长”是**一个带条件的家族的体积下界**，不是任意复向量都必须有一个正的最小长度。

普通复向量可以任意缩放；格和整性条件才使“不能太短”成为有内容的命题。C 还要允许未覆盖全部维度的家族，并记录补全与投影所付的成本。[LongForms.lean][long-forms]

把三块放在一起，你应当能够回答：A 给了哪种上界，B 保住了哪个维数比例，C 为什么不是一个显然会被缩放击破的断言。若这三个问题没回答清楚，就还没有真正理解主不等式在比较什么。

## 8. 主不等式的代数，可以亲手推到最后

这是本文最值得拿纸笔的一段。下面沿用实际接口，但为了便于阅读，用短符号重命名：

| 本文记号 | 文件中的名称 | 作用 |
| --- | --- | --- |
| $D$ | `targetDim` | 目标空间维数 |
| $M$ | `mainAmount` | 两边共同的大主项，且非负 |
| $R$ | `totalRemainder` | 希望控制的总余项 |
| $m$ | 提升链长度 | 放大余项收益 |
| $L$ | $fa(\log b)^4$ | 范数与体积误差尺度 |
| $I$ | `indexPerDim` | 每维指标预算 |

$f$ 计数数据中所选数域的无穷位置，$a$ 是较大阶参数（满足 $a=xb$），$b$ 是权重尺度；它们共同属于允许数据，不是互不约束的自由变量。这里的 $\log$ 都是自然对数。

A 给出向量平方范数的对数上界 $M-mR+L$。通过 Hadamard 不等式，选出的 $n$ 个独立向量具有体积上界

$$
c\le n(M-mR+L).
$$

指标预算满足 $\delta\le DI$。C 则给出

$$
D(M-3L)\le c+2\delta.
$$

合并就是

$$
D(M-3L)\le n(M-mR+L)+2DI.
$$

不要直接说“主项相消，显然完成”。移项后实际得到

$$
nmR\le(n-D)M+(n+3D)L+2DI.
$$

这时 $n\le D$、$M\ge0$ 才让第一项不大于零；再用 $n+3D\le4D$，得到

$$
nmR\le D(4L+2I).
$$

最后，B 给出 $n\ge D/2>0$，所以

$$
mR\le8L+4I.
$$

也就是说，“主项消掉”并非要求 $n=D$ 的形式巧合；不足的那部分主项由符号和维数关系控制。这个细节让你知道为什么 $M$ 的非负性也必须被证明。

实际参数中

$$
I=10\log(1+2b^2)\,fa(\log b)^3.
$$

当 $b$ 足够大时，这些损失能被再多一个对数因子吸收，形成文件里的主不等式

$$
\boxed{m\,\mathrm{totalRemainder}\le fa(\log b)^5.}
$$

这部分代数可逐行对照 [MainInequality.lean][main-inequality] 的 `star_inequality`。**会推这一段，意味着你已读懂三个大输入如何合成结论；并不意味着你已经证明 A、B、C。** 数学阅读的进展，应该记录在具体桥梁上，而不是用“懂了整篇”一笔带过。

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/math/riemann-2026/proof-map.svg" target="_blank" rel="noopener" aria-label="放大：证明的核心接口地图"><img src="/math/riemann-2026/proof-map.svg" alt="A 提供短向量与指标，B 提供足够多独立向量，C 提供体积下界；三者合成主不等式，经链长和解析判据排除右侧零点，最后使用对称性。" width="1200" height="740" loading="lazy" decoding="async" /></a>
<figcaption><strong>图 3 · 难点集中在接口的证明，而不在最后一句 RH。</strong> 路线按固定提交的可读重写版整理，不能当作本站完成了完整形式化重放的记录。<a href="/math/riemann-2026/proof-map.svg">打开原图</a>。</figcaption>
</figure>

## 9. 为什么 √x 的链长会把指数推到二分之一

主不等式控制的是总余项，读者真正想要的却是 $R_{d,q}(x)$。下一座桥把二者联系起来。对允许的数据，工程得到

$$
R_{d,q}(x)\le
\frac{\varphi(q)(\log b)^6}{m}
+|R_{d,q}(x_1)|
+\log b\,|R_{d,1}(x_1)|.
$$

这个公式说明为什么有一个更大的截断 $x_1$：不是为了“多算一些素数”，而是把远处的余项作为可以用既有素数定理压小的参照。[OneSidedBound.lean][one-sided]

参数存在性定理允许在固定算术参数后，对足够大的整数 $x$ 选择数据，使

$$
m\ge\sqrt{x},\qquad \log b\le2x^\eta,
\qquad \log x_1\ge x^{\eta/12},
$$

其中 $\eta>0$ 足够小。实际 $m$ 还按构造要求选取；不能把它当成与其他参数独立、可以随意设为任意大的旋钮。

将这些界代回第一项，得到

$$
\frac{\varphi(q)(\log b)^6}{m}
\le64\varphi(q)x^{-1/2+6\eta}.
$$

对 $x_1$ 处的两项，使用既有的素数定理余项估计。因为 $\log x_1$ 已经相对 $x$ 很大，所需的任意固定负对数幂界可以变成这里的 $x^{-2}$ 界。**这一步没有先使用待证明的平方根误差界**；两者的尺度与量词不同。

于是先得到带常数的整数上界。再控制取整误差、选取 $7\eta\le\varepsilon$，并让足够大的 $x$ 吸收常数，才能写成

$$
R_{d,q}(x)\le x^{-1/2+\varepsilon}
$$

对足够大的实数 $x$ 成立。

所以，链长 $\sqrt{x}$ 的意义是：**主不等式对余项产生了 $m$ 倍放大，而成本仍被统一预算约束，除回 $m$ 后留下 $x^{-1/2}$。** 只有把这个分母与误差预算一起展示，“平方根链长”才是解释；单独说一句“AI 想到开平方”并没有说明证明为什么闭合。

## 10. θ 提升到底在做什么

可以先从最简单的 θ 函数出发：

$$
\theta(t)=\sum_{n\in\mathbb Z}e^{-\pi n^2t},\qquad t>0.
$$

Poisson 求和给出 $\theta(t)=t^{-1/2}\theta(1/t)$。它把格点求和与 Fourier 变换连接起来，也展示了同一对象在两个尺度下的关系。这是很好的入门例子，却不是本次证明中所有 θ 提升的完整定义。

在更一般的情形中，θ 核把两个群的对称性联系起来。示意地，可以把提升写成

$$
(\Theta\phi)(g)=\int_{[H]}\theta(g,h)\phi(h)\,dh.
$$

这不是随意给出的积分公式：核、空间、测度和收敛条件都需要指定。它的价值在于，将一侧的自守形式搬运到另一侧，同时保留可追踪的算术信息。某些确定的情形可转写成有限类和；这也解释了为什么抽象表示论最终能参与范数与整性的具体计算。

“自守”可以暂时理解为带有严格变换规律的函数；模形式是熟悉的低秩入口。高秩自守形式并非把一个周期函数机械复制到更多变量，其表示、局部类型与无穷处权重都决定可用的恒等式。

本次路线反复使用提升，形成一个链，并研究复合映射的范数和行列式。**提升的收益不是“维度越来越高，所以答案越来越精确”，而是能累积可计量的消失性、整除性和范数关系。** 同时，每次提升也增加成本，最终只有这些成本可以与收益同步核算，链才有用。[范数链文件][chain]、[可读版阅读说明][guide]

如果你已经学过 Fourier 分析，下一步应该问：核怎样与群作用相容？复合提升是否可能为零？seesaw 恒等式交换了哪两个积分或周期？Rallis 型公式如何把范数变成可以估算的 $L$ 值？这些问题比把一串定理名称背熟更接近读懂证明。

## 11. 分母控制为何需要伽罗瓦表示与 Selmer 群

一个容易低估的困难是投影。即使原对象和算子具有整数系数，投影到某个特征子空间后，也未必仍然是整数。

看一个完全初等的例子：令 $\ell$ 为素数，

$$
A=\begin{pmatrix}0&1\\0&\ell\end{pmatrix},
\qquad A^2=\ell A,
\qquad P=A/\ell.
$$

于是 $P^2=P$，它是一个代数投影，但 $P(0,1)=(1/\ell,1)$ 有分母。这个例子不是原证明里的正交投影，只是准确地展示：**“投影是线性的”不推出“投影保持整性”。**

在自守形式中，模 $\ell$ 后相近的特征系统可能产生同余，而同余会影响投影分母。算术格的体积比较若忽略这些分母，就可能把原本不存在的整性优势算进去。

伽罗瓦表示把自守形式的算术特征值组织成另一种结构；扩张类可以由 $H^1$ 描述，附加局部条件得到 Selmer 型群。这里真正需要的不是“Selmer 群很重要”这句口号，而是对相应类的数量或长度给出界，进而控制投影要付出的有限素数损失。

这条分支在 [FitTwistsExist.lean][twists] 汇合：为每个相关素数及比较同构选出合适的扭曲，让链中所需的分母总成本落在预算之内，同时控制所需 $L$ 值比值的高度。注意它对一族扭曲统一追踪的对象，不能替换成只估算一个复数绝对值。

Iwasawa 塔可以理解为一系列相容的数域扩张层，把算术群在各层如何变化组织起来。$\ell$ 进与 Hodge 理论处理局部表示、整结构和比较条件。这些工具之所以进入证明，是因为它们服务于**整性、分母及高度的定量控制**，而不是为了让推导显得足够高级。

这一节给出的是工具职责，不是这条技术分支的独立证明。真正深入时，应选择一个接口继续下钻，例如从“有合适的扭曲”追到 Selmer 长度界，再追到相关局部条件；不要在没有核对对象定义时，把别处名称相同的 Selmer 定理直接套进来。

## 12. Lean 核验说明了什么，又怎样参与理解

Lean 的基本分工可以这样理解：命题被表达成类型，证明是具有该类型的项；tactic 帮助构造项，内核再检查这个项是否真的满足规则。AI 可以参与提出思路与生成证明，但接受它的最终依据不是文本看起来是否有说服力。

### 先读结论，而不是从第一个 import 顺着翻

固定版本的入口含有下面这一行：

```lean
theorem riemannHypothesis : RiemannHypothesis :=
  New.zeta_zeros_on_line New.grh
```

它把依赖拆得很清楚：`New.grh` 提供右半平面的非消失，`New.zeta_zeros_on_line` 利用对称性转成 RH。后者短，并不意味着前者简单。[Main.lean][entry]

然后读 `Statements.lean`，检查复数、ζ、狄利克雷特征来自哪套定义、是否排除了平凡零点与极点、最终定理是否还带有未解除的假设。Mathlib 把函数定义成总函数，在极点处有约定值，因此形式化陈述中的 `s ≠ 1` 需要读成排除该特殊点，而不是数学上的额外猜想。[Mathlib 的定义][mathlib]

### 编译、公理和命题匹配是不同的检查

`#print axioms riemannHypothesis` 用来查看最终定理的公理依赖；标准公理与额外假设必须区分。独立报告记录的列表为 `propext`、`Classical.choice`、`Quot.sound`。[公理核验输出][axioms]

理解它们不需要先掌握整个类型论：命题外延性让等价命题按合适规则识别，选择公理提供经典选择，商类型的健全性支持按等价关系取商。它们不是“先假设 RH”三个不同的拼写。

但仅看一条编译成功消息仍不够：还要确认最终命题确实是目标命题、假设都已解除、没有新增未证公理，并由内核检查实际证明项。命题比较工具与独立内核正是为这些不同责任提供证据。阅读时可以把它们理解成“规格核对”和“推导核对”，不要混成一个检查按钮。

### 找到关键接口，再逐层展开

如果你想解释证明，就不必先重建原版所有模块。先读入口、主不等式、参数选择与分析判据，再选择一个关键技术输入继续深入。真正运行完整形式化核验时，应严格使用对应版本固定的工具链和依赖；本地只做一个简短 Lean 练习，并不构成对完整工程的复核。

Lean 入门可从 [Mathematics in Lean][mil] 开始；类型、量词和公理的系统解释在 [Theorem Proving in Lean 4][tpil]。学习时要同时做数学与逻辑两种翻译：一句量词到底作用于谁，以及一个 lemma 实际提供了什么，而不是只学会让 tactic 消掉界面上的目标。

## 13. 按依赖阅读，比按文件夹顺序阅读更有效

建议用以下顺序打开固定提交中的文件。它是一张可操作的阅读清单，也规定了本文解读的边界。

| 顺序 | 文件 | 读完应能回答的问题 |
| --- | --- | --- |
| 1 | [Statements.lean][statements]、[Main.lean][entry] | 最终量词、例外和结论是什么？ |
| 2 | [New/Main.lean][main] | 如何从右半平面非消失得到临界线？ |
| 3 | [Zeros/Criterion.lean][criterion]、[Landau.lean][landau] | 单侧界为何能识别零点，额外条件在哪里？ |
| 4 | [OneSidedBound.lean][one-sided] | 总余项如何变成所需的 $R_{d,q}$ 上界？ |
| 5 | [MainInequality.lean][main-inequality] | 主项如何消去，维数比例在哪里使用？ |
| 6 | [ShortAndEnough.lean][short-enough] | A 的范数与指标界、B 的张成界分别是什么？ |
| 7 | [LongForms.lean][long-forms] | C 的下界需要什么整性与扭曲条件？ |
| 8 | [FitTwistsExist.lean][twists] | 分母总预算由哪个存在性结论供给？ |

每读一个文件，写三行笔记：**输入是什么，输出是什么，输出在哪个后续文件使用。** 再为每个变量记下所属对象与量词。`m` 是链长，`n` 是选出的向量数，`targetDim` 是目标维数；把它们误当成同一个“大参数”，就会看不懂为什么可以约掉某些项。

遇到现成库定理时，先核对所需版本与假设，再决定是否继续读证明。若只是理解结构，可以把已核对的接口临时当作引理使用；若要独立复核，就必须最终展开所依赖的非平凡输入。这两种阅读都有价值，但完成标准不同。

## 14. 需要哪些课程：按产出组织学习路线

下面不是“把这些课程收藏起来，就读懂了 RH”的书单。每一层都有具体产出，用来判断是否具备继续读某个接口的能力。课程链接指向官方材料，顺序是本文的教学建议。

### 第一层：把分析与线性代数变成推导能力

| 学习内容 | 可用课程 | 应完成的产出 |
| --- | --- | --- |
| 极限、级数、一致收敛、渐近量词 | [MIT 18.100A 实分析][real-course] | 解释一个阈值能依赖哪些固定参数；判断何时能交换求和与积分 |
| 基、投影、正定矩阵、Gram 行列式 | [MIT 18.06 线性代数][linear-course] | 算出二维格的体积，证明一次指标变换与平方体积的关系 |
| 解析延拓、留数、零点与极点、围道积分 | [MIT 18.04 复变函数][complex-course] | 推导对数导数与平滑 Mellin 变换，不把形式计算当成无条件恒等式 |
| Lebesgue 积分、Fourier 级数与积分 | [MIT 18.103 Fourier 分析][fourier-course] | 理解正性与变换收敛，解释 Gaussian 的变换为什么适合 θ 函数 |

如果你是工程或机器学习背景，矩阵计算与 Fourier 变换可能熟悉，但“在哪个空间收敛”“对所有参数还是固定参数”“解析延拓为什么唯一”通常需要认真补课。数值直觉在这里有用，量词和收敛条件决定它何时能进入证明。

### 第二层：建立数论与自守形式的语言

| 学习内容 | 可用课程 | 应完成的产出 |
| --- | --- | --- |
| 群、环、域、模与表示的初步语言 | [MIT 18.701 代数 I][algebra-course] | 解释一个特征为何同时具有乘法性与周期性，区分向量空间与整数格 |
| 代数整数、分解、赋值、类群、$L$ 函数 | [MIT 18.785 数论 I][number-course] | 说清一个有限素数处的整性条件，以及它怎样进入乘积公式 |
| 模形式、模曲线及相关表示 | [MIT 18.786 数论 II，2024][modular-course] | 先理解低秩的模形式例子，再识别高秩提升中的对应对象 |

这层仍不是所有高级输入的替代品。θ 对应、算术高度、伽罗瓦上同调、Selmer 群、Iwasawa 理论与 $\ell$ 进 Hodge 理论，需要在选定技术分支之后继续学习。不要把这些内容同时摊开：先从当前要核对的一个 lemma 出发，建立最短依赖链。

### 第三层：把形式化语言接回数学语言

用 [Mathematics in Lean][mil] 练习等式、量词、集合和基础数论，再用 [Theorem Proving in Lean 4][tpil] 理解依赖类型、结构与公理。产出应是：能把一个定理陈述完整翻译成自然语言，能跟踪它使用的引理，并能解释没有完成的证明为什么不能被当成最终闭合定理。

最合适的第一个阅读项目不是“重跑所有 RH 代码”，而是读完 `New.zeros_on_line`：假设右侧无零点，利用函数方程将左侧零点映射到右侧，再用两个不等式得出实部恰为二分之一。它短、有真实数学内容，也能让你发现自己到底卡在复分析还是 Lean 语法。

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/math/riemann-2026/learning-map.svg" target="_blank" rel="noopener" aria-label="放大：先修知识与学习产出"><img src="/math/riemann-2026/learning-map.svg" alt="学习路线覆盖实分析与线性代数、复分析、数论、自守形式、算术几何与 Lean 阅读；每部分都对应一个可检查的学习产出。" width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>图 4 · 用产出检验理解。</strong> 图示不是课程完成后必能独立复核全部证明的保证；先看懂接口，再选择分支深入。<a href="/math/riemann-2026/learning-map.svg">打开原图</a>。</figcaption>
</figure>

## 15. 六道练习，定位自己究竟懂到了哪一层

1. **欧拉乘积。** 在绝对收敛区域展开乘积，说明为什么 $\Lambda(12)=0$，却必须保留 $\Lambda(8)$。若只写“素数是整数的积木”，还没有完成这项推导。
2. **平滑变换。** 算出 $\int_n^\infty(x/n-1)x^{-s-1}dx$，注明 $\operatorname{Re}s>1$。再说明为什么归一化除以 $x$ 后，零点实部对应的误差指数也减去 $1$。
3. **体积与指标。** 对 $2\mathbb Z\times3\mathbb Z$ 算 Gram 行列式、余体积和指标。再用 $(2,0),(1,3)$ 生成另一个格，检查体积是否改变，以及为什么基的夹角会改变 Hadamard 上界的松紧。
4. **主不等式。** 从第 8 节的比较式推到 $mR\le8L+4I$。必须指出每一步用了 $M\ge0$、$n\le D$ 还是 $n\ge D/2$；不能只说忽略低阶项。
5. **投影分母。** 验证第 11 节的矩阵满足 $P^2=P$，再计算 $P(0,1)$。说明为什么控制复数范数，并不能自动控制有限素数处的分母。
6. **最终排零点。** 假设某个零点实部为 $0.6$，选 $\beta\in(0.5,0.6)$，解释应该用哪一种 $\varepsilon$ 余量，并指出为什么还需要分析判据，而不是只看一个有限区间的数值图。

做完前四题，通常能独立复述核心框架。能完整处理第五题的推广，需要算术整结构。第六题若要逐条检查全部条件，则要深入解析数论的判据。这给出了实际的进展标尺，不是一个读后自评“感觉懂了”的印象。

## 16. 一个可复现的小实验：看见定义，别拿它冒充证明

本站用 Python 标准库计算了 $\psi(x)$ 的几个值。程序对每个素数 $p$，给 $p,p^2,p^3,\ldots$ 赋权 $\log p$，再累加。没有下载模型、调用大模型求数值或运行原证明工程。

| $x$ | $\psi(x)$ | $\psi(x)-x$ | $(\psi(x)-x)/\sqrt{x}$ |
| --- | --- | --- | --- |
| 10 | 7.832014181 | -2.167985819 | -0.685577312 |
| 100 | 94.045311229 | -5.954688771 | -0.595468877 |
| 1,000 | 996.680912247 | -3.319087753 | -0.104958771 |
| 10,000 | 10013.396693263 | 13.396693263 | 0.133966933 |
| 100,000 | 100051.564025658 | 51.564025658 | 0.163059766 |

这些值能帮助你核对素数幂权重和归一化的含义，也能看见误差会换符号。它们没有给出无穷范围的统一界；更没有计算证明里带特征、剩余类和固定常数的 $R_{d,q}$。**教学实验与证明对象之间的差异，必须与数值本身一起展示。**

[下载原始 CSV](/math/riemann-2026/prime-powers.csv) · [查看生成程序][asset-source] · [查看图示来源与指纹](/math/riemann-2026/manifest.json)。数据保留九位小数，是浮点计算的显示精度，不是对每个末位都做了区间算术认证。

在本仓库执行 `python3 scripts/build-math-assets.py --check` 可以检查这些教学素材与确定性生成程序一致。它是素材复现检查，不是 RH 形式化核验。想实践 Lean 的读者，应从小引理开始；需要完整复核的人，应转到固定版本及其独立核验脚本。

## 17. 理解证明，意味着知道难点被放在了哪里

现在可以把路线完整复述一次：我们想排除 $L$ 函数在 $\operatorname{Re}s>1/2$ 的零点；分析判据把任务变成一族素数加权和的单侧界；算术构造把余项编码进 θ 提升后格的范数与体积；短向量、足够多向量和体积下界共同推出主不等式；参数选择把它转成 $x^{-1/2+\varepsilon}$；最后由函数方程回到临界线。

其中最容易被一句话遮住的地方有三个：**上界与下界必须对应同一个修正体积，短向量必须覆盖足够多维度，分母损失必须真正落入预算。** 这也解释了为什么最后写成 RH 的那几行很短，而它背后的数学很长。

我的阅读建议是，先争取“能检查接口与关键代数”，再争取“能复核一条技术分支”。沿着某个清楚的缺口继续学习，比把所有相关名词都收藏一遍更有效。本文给出的课程、文件与练习，就是为了把这个缺口变成可行动的下一步。

对后续更新，也应采用同样标准：新的短证明是否保留同样的最终陈述？哪些输入被重新证明或简化？人类可读稿是否已经补齐原本列为假设的桥梁？答案应来自具体版本和具体结果，而不是把发布日期更新一次，就自动宣称又完成了一次独立复核。

## 18. 原始资料与继续阅读

下列状态与链接于 **2026 年 11 月 26 日**核实。代码链接固定提交；报告网站仍可能更新。本文没有下载或镜像原版的大型证明归档。

- [Alpöge：11 月 20 日公告][announcement]：辨认原始主张及思路线索，四页文字不等于完整传统论文。
- [Lean FRO / Mathlib Initiative 联合声明][community]：形式化命题与证明的社区确认。
- [Sutherland：原版核验][verification]、[较短版核验][short-verification]：分别看版本、内核检查、命题比较与公理审计，勿混用状态。
- [较短版仓库][repo]、[可读版 GUIDE][guide]：本文代码阅读路径的主要来源；固定提交见文章开头。
- [Rubinstein 的项目页][rubinstein]：包含其核验与数学解释稿的范围说明。解释稿列出的未完成输入不能当作另一份已完成的传统证明。
- [Zhang 的初步数学说明][zhang]：为进一步追踪概念与文献提供入口；本文的具体不等式仍以所链接的 Lean 文件为对照。
- [Clay 的问题说明][clay]、[Mathlib 的 RiemannHypothesis 定义][mathlib]：分别核对传统数学命题与形式化目标。
- 课程、练习与 Lean 教材链接见第 14 节。本站的图示、代数教学例子与有限数值表是为阅读而新作的材料。

[announcement]: https://alpo.ge/remark.pdf
[community]: https://leanprover-community.github.io/blog/posts/riemann-hypothesis/
[verification]: https://math.mit.edu/~drew/grh/
[short-verification]: https://math.mit.edu/~drew/shortgrh/
[repo]: https://github.com/lsernau/grh-lean/tree/72fead102f663d5c7a407964a13dc0cf9d977207
[entry]: https://github.com/lsernau/grh-lean/blob/72fead102f663d5c7a407964a13dc0cf9d977207/grh/src/Main.lean
[statements]: https://github.com/lsernau/grh-lean/blob/72fead102f663d5c7a407964a13dc0cf9d977207/grh/src/Statements.lean
[main]: https://github.com/lsernau/grh-lean/blob/72fead102f663d5c7a407964a13dc0cf9d977207/grh/src/New/Main.lean
[prime-sums]: https://github.com/lsernau/grh-lean/blob/72fead102f663d5c7a407964a13dc0cf9d977207/grh/src/New/Reduction/PrimeSums.lean
[criterion]: https://github.com/lsernau/grh-lean/blob/72fead102f663d5c7a407964a13dc0cf9d977207/grh/src/New/Reduction/Zeros/Criterion.lean
[landau]: https://github.com/lsernau/grh-lean/blob/72fead102f663d5c7a407964a13dc0cf9d977207/grh/src/Lib/Analytic/Landau.lean
[one-sided]: https://github.com/lsernau/grh-lean/blob/72fead102f663d5c7a407964a13dc0cf9d977207/grh/src/New/Reduction/OneSidedBound.lean
[short-enough]: https://github.com/lsernau/grh-lean/blob/72fead102f663d5c7a407964a13dc0cf9d977207/grh/src/New/Reduction/ShortAndEnough.lean
[spanning]: https://github.com/lsernau/grh-lean/blob/72fead102f663d5c7a407964a13dc0cf9d977207/grh/src/New/Spanning/SecondMoment/SpanningTheorem.lean
[long-forms]: https://github.com/lsernau/grh-lean/blob/72fead102f663d5c7a407964a13dc0cf9d977207/grh/src/New/Determinant/Twist/LongForms.lean
[main-inequality]: https://github.com/lsernau/grh-lean/blob/72fead102f663d5c7a407964a13dc0cf9d977207/grh/src/New/Reduction/MainInequality.lean
[chain]: https://github.com/lsernau/grh-lean/blob/72fead102f663d5c7a407964a13dc0cf9d977207/grh/src/New/Determinant/Chain/NormOfChain.lean
[twists]: https://github.com/lsernau/grh-lean/blob/72fead102f663d5c7a407964a13dc0cf9d977207/grh/src/New/Congruences/FitTwistsExist.lean
[guide]: https://github.com/lsernau/grh-lean/blob/72fead102f663d5c7a407964a13dc0cf9d977207/grh/GUIDE.md
[mathlib]: https://leanprover-community.github.io/mathlib4_docs/Mathlib/NumberTheory/LSeries/RiemannZeta.html
[axioms]: https://math.mit.edu/~drew/grh/audit.log
[clay]: https://www.claymath.org/millennium/riemann-hypothesis/
[rubinstein]: https://www.math.uwaterloo.ca/~mrubinst/alpoge_claude_grh/
[zhang]: https://www.ihes.fr/~rzhang/files/GRH%20note.pdf
[real-course]: https://ocw.mit.edu/courses/18-100a-real-analysis-fall-2020/
[linear-course]: https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/
[complex-course]: https://ocw.mit.edu/courses/18-04-complex-variables-with-applications-spring-2018/
[fourier-course]: https://ocw.mit.edu/courses/18-103-fourier-analysis-fall-2013/
[algebra-course]: https://ocw.mit.edu/courses/18-701-algebra-i-fall-2010/
[number-course]: https://ocw.mit.edu/courses/18-785-number-theory-i-fall-2021/
[modular-course]: https://math.mit.edu/classes/18.786/2024/
[mil]: https://leanprover-community.github.io/mathematics_in_lean/
[tpil]: https://leanprover.github.io/theorem_proving_in_lean4/
[asset-source]: https://github.com/leebin-try/leebin-try.github.io/blob/main/scripts/build-math-assets.py
