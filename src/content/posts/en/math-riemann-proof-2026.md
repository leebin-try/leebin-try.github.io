---
title: "Reading the November 20 Riemann proof: from prime-sum errors to theta lifts"
description: "Follow weighted prime sums, lattice covolumes, the main inequality and a zero-free half-plane. A mathematical guide with derivations, source files, prerequisites, courses and exercises."
date: "2026-11-26T05:26:13Z"
category: "Math"
tags: ["Math", "Riemann hypothesis", "Analytic number theory", "Formal proofs"]
cover: "terminal"
coverImage: "/math/riemann-2026/cover.svg"
coverAlt: "Original schematic of the critical strip, the line with real part one half, and a reading route from weighted prime sums through lattices to a zero-free half-plane."
coverCaption: "Original explanatory artwork. The points illustrate the critical line; they are not computed zero checks or a figure reproduced from the proof."
sample: false
draft: false
featured: false
lang: "en"
math: {"kind":"reading-guide","topic":"analytic-number-theory","evidenceDate":"2026-11-26","source":"https://alpo.ge/remark.pdf","verificationSource":"https://math.mit.edu/~drew/grh/","proofCommit":"72fead102f663d5c7a407964a13dc0cf9d977207"}
---

**A useful way into this proof is a squeeze: the same arithmetic lattice cannot have a covolume that is too large, or too small. Compare the two bounds, cancel a large common contribution, and what remains is an error in a weighted sum over prime powers. Bound that error, and complex analysis can exclude zeros to the right of the critical line.**

That explains more than saying that the proof uses automorphic forms, Galois representations and AI. It tells us what those tools must accomplish together. The aim of this guide is to help a reader with calculus and linear algebra explain the chain of reasoning, calculate several of its bridges, and identify the prerequisites for going further.

Read it in three passes. First follow the problem, the weighted sum and the volume comparison. Next work through the algebra of the main inequality. Finally open the pinned Lean files and choose a technical branch: theta lifts or denominator control. Long equations and wide tables scroll within their own frames; every diagram links to its full-size original.

## 1. Identify the proof and the version being read

This article concerns the proof announced by **Levent Alpöge on November 20, 2026**, developed with Claude. The four-page announcement gives research context and clues; the complete argument was released as a Lean formalization. [Author announcement][announcement]

As checked on **November 26, 2026**, the Lean FRO and Mathlib Initiative have issued a joint statement certifying the statement and formal proof. Andrew Sutherland's original-proof verification page records completed independent checks. [Community statement][community], [verification record][verification]

Distinguish formal verification, a concise mathematical explanation that people can read, and an institution's recognition or prize procedures. There is public evidence for the first. Describing the result as merely unchecked AI output would miss that evidence; passing those checks also does not imply that every task in the other two categories is complete.

**The principal mathematical reading aid here is the shorter rewriting released on November 25**, pinned to commit `72fead102f663d5c7a407964a13dc0cf9d977207`. Its authors say that it follows the original method while rewriting many steps. The two developments should not be presented as line-for-line equivalents. A separate MIT record covers checks of the shorter version. [Repository][repo], [shorter-proof checks][short-verification]

This is therefore a guide to understanding the November 20 result through a more manageable version of its mathematical architecture. For this post, the listed entry points and interfaces were source-read. The full Lean development was not rebuilt here, and all underlying mathematical lemmas were not independently re-proved. Reported verification, derivations in this article and teaching analogies have distinct scopes.

## 2. What the Riemann hypothesis constrains to one half

Write a complex number as $s=\sigma+it$. Its real and imaginary parts are separate coordinates. The equation $\operatorname{Re}s=1/2$ describes a vertical line, not a single point.

Initially, for $\operatorname{Re}s>1$, define

$$
\zeta(s)=\sum_{n=1}^{\infty}\frac1{n^s}
=\prod_{p\ \mathrm{prime}}\frac1{1-p^{-s}}.
$$

Here $n^{-s}=e^{-s\log n}$, so the complex exponent brings oscillation into the sum. The Euler product follows from unique prime factorization: expand each geometric series and every positive integer occurs once. Absolute convergence makes the rearrangement legitimate.

That region does not yet contain the zeros of greatest interest. **Analytic continuation** extends the function to a holomorphic function away from a pole at $s=1$. It does not say that the original series converges everywhere, and it is not permission to assign arbitrary values to divergent sums. The extension must agree with the original function where the latter is defined, a demanding condition because holomorphic continuation is unique.

The continued function has the trivial zeros $-2,-4,-6,\ldots$. RH says that every other zero has $\sigma=1/2$. The traditional problem statement is available from [Clay][clay]. Checking many zeros and proving a statement about all complex zeros have different quantifiers.

For the final step, introduce the completed function

$$
\xi(s)=\tfrac12s(s-1)\pi^{-s/2}\Gamma(s/2)\zeta(s),
\qquad \xi(s)=\xi(1-s).
$$

The prefactors handle poles and gamma-factor issues, producing an entire function with a clean symmetry. Nontrivial zeros are paired under $s\mapsto1-s$. **Symmetry gives pairs; it does not force every member of a pair onto the axis.** A rectangle can be symmetric about a vertical line while none of its vertices lies on it.

The difficult task is to exclude every zero with real part greater than $1/2$. Symmetry then excludes those on the left. The shorter development isolates this final passage in [New/Main.lean][main].

## 3. Why prime counting becomes a question about zeros

The counting function $\pi(x)$ is intuitive, but prime powers behave better in the algebra. Define the von Mangoldt function by

$$
\Lambda(n)=
\begin{cases}
\log p,&n=p^k,\quad k\ge1,\\
0,&\text{otherwise}.
\end{cases}
$$

Thus $\Lambda(8)=\log2$, $\Lambda(9)=\log3$ and $\Lambda(12)=0$. Prime powers are required by the logarithmic derivative of the Euler product. In the region of absolute convergence,

$$
-\frac{\zeta'(s)}{\zeta(s)}
=\sum_p\sum_{k\ge1}(\log p)p^{-ks}
=\sum_{n\ge1}\frac{\Lambda(n)}{n^s}.
$$

The left side has poles at zeros; the right side is built from prime powers. **This is a calculable interface between arithmetic and zeros**, an identity between two descriptions of the same function.

Let $\psi(x)=\sum_{n\le x}\Lambda(n)$. The prime number theorem gives $\psi(x)\sim x$; the finer issue is the size of $\psi(x)-x$. The classical RH error scale is $\sqrt{x}$ with logarithmic factors. In an explicit formula, a zero with real part $\beta$ contributes oscillation on the scale $x^\beta$.

That observation alone is not a proof excluding zeros. Contributions can oscillate and cancel. To infer that a zero is absent, an argument must specify the transform, its convergence and continuation, and the singularity that cannot disappear. The one-sided criterion below supplies that missing bridge.

A smoothing calculation makes the change of language concrete. Put

$$
S(x)=\sum_{n\le x}\Lambda(n)\left(\frac{x}{n}-1\right).
$$

For $\operatorname{Re}s>1$, termwise integration gives

$$
\int_1^\infty S(x)x^{-s-1}\,dx
=-\frac{\zeta'(s)}{\zeta(s)}\frac1{s(s-1)}.
$$

Check a single summand first: $\int_n^\infty(x/n-1)x^{-s-1}dx=n^{-s}/[s(s-1)]$. Then sum. The smoothing creates a useful denominator in the transform. Dividing $S(x)$ by $x$ changes the zero-related scale from $x^\beta$ to $x^{\beta-1}$. This normalization explains the negative exponent $-1/2+\varepsilon$ encountered later.

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/math/riemann-2026/three-languages.svg" target="_blank" rel="noopener" aria-label="Enlarge: interfaces between arithmetic, analysis and geometry"><img src="/math/riemann-2026/three-languages.svg" alt="Prime-power arithmetic connects to zeros through logarithmic derivatives and transforms; geometric integral structures and covolumes supply the required inequalities." width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>Figure 1 · Different languages need precise interfaces.</strong> An original reading map. Arrows represent dependencies, not substitutes for proofs of the connecting statements. <a href="/math/riemann-2026/three-languages.svg">Open full figure</a>.</figcaption>
</figure>

## 4. The actual weighted sum cannot be replaced by a plain psi

The function $\psi$ is useful for intuition. Reading the development requires its actual objects. Fix a modulus $q$ and a suitable auxiliary prime $d$, and write the quadratic character as $\chi_d(n)=(n/d)$. In this article's notation,

$$
\lambda_{d,q}(n)=\Lambda(n)(1-\chi_d(n))\,\mathbf1_{n\equiv1\pmod q}.
$$

The normalized remainder is

$$
R_{d,q}(x)=
\sum_{n\le x}\lambda_{d,q}(n)\left(\frac1n-\frac1x\right)
-\frac{\log x}{\varphi(q)}-c_{d,q}.
$$

Here $\varphi$ is Euler's totient and $c_{d,q}$ is fixed by the relevant logarithmic derivative, not fitted to a numerical curve. Character value $1$ suppresses a term, value $-1$ doubles it, and the residue-class condition selects another arithmetic direction. The objects and identities are in [PrimeSums.lean][prime-sums] and [OneSidedBound.lean][one-sided].

These weights have work to do. The proof addresses Dirichlet $L$-functions, so characters separate arithmetic information; auxiliary quadratic twists also clear unwanted interference in the zero-exclusion step. A numerical experiment without the character or residue-class restriction cannot stand in for this theorem.

The construction first handles moduli $q$ divisible by $18480$ and auxiliary primes $d\equiv q/2-1\pmod q$. For an arbitrary original modulus $N$, the final theorem induces the character to $q=18480N$ and returns to the original function. This technical constant organizes admissible arithmetic parameters; the chain length and budget determine the error exponent. [Final reduction][one-sided]

The decisive target has the following shape: for every permitted fixed pair $(d,q)$ and every $\varepsilon>0$, eventually

$$
R_{d,q}(x)\le x^{-1/2+\varepsilon}.
$$

It is an **upper bound**, not an absolute-value bound. Its threshold may depend on the fixed parameters; do not silently make it uniform in all $d,q$. Finally, every positive $\varepsilon$ matters. Proving only $\varepsilon=0.1$ would not exclude the entire half-plane to the right of $1/2$.

A Dirichlet $L$-function begins as

$$
L(s,\chi)=\sum_{n\ge1}\frac{\chi(n)}{n^s}
\qquad(\operatorname{Re}s>1),
$$

followed by continuation. The character is a periodic multiplicative arithmetic function, not an arbitrary label. The scope here is GRH for **Dirichlet characters**, not an automatic assertion about every automorphic $L$-function. Read the pinned [Statements.lean][statements] to see exactly what is quantified.

## 5. How a one-sided bound can exclude zeros

For a general function, an upper bound is insufficient: $E(x)=-x^{100}$ satisfies $E(x)\le x^{-1/2}$ for $x\ge1$ while having enormous absolute value. An analytic theorem cannot be omitted between an error estimate and a zero-free region.

Here the remainder has a special transform structure. Read [Zeros/Criterion.lean][criterion] as a chain of obligations, rather than just remembering the name Landau:

1. Suppose a target zero $\rho$ lies to the right of some $\beta>1/2$.
2. Choose an auxiliary prime $d$ in the required congruence class so that suitable twisted $L$-functions have no interfering zeros in the relevant region. That selection has its own zero-density argument; it does not assume GRH again.
3. Continue the transform of $R_{d,q}(e^v)$ meromorphically. Once the auxiliary interference is removed, its residues encode multiplicities of the target zeros.
4. At real points the residues have the required nonnegative sign, and the one-sided estimate supplies an exponential growth bound.
5. A Landau-type conclusion forces the residues in the right-hand region to vanish, contradicting the positive multiplicity of the proposed zero.

The underlying principle is that a nonnegative object constrains where its transform can cease to converge; its boundary singularity cannot simply be removed. The exact development in [Lib/Analytic/Landau.lean][landau] specifies the transform, growth assumptions and signs of real-point residues. It is not a theorem about arbitrary functions with an upper bound.

The family of auxiliary twists is essential. A bound for a single attractive-looking function $R$ would not automatically allow the proof to choose $d$ to clear the required region. Preserve those quantifiers when summarizing the argument.

For any proposed zero with real part greater than $1/2$, choose

$$
\frac12<\beta<\operatorname{Re}\rho.
$$

The arbitrarily small exponent allowance supplies the criterion's bound, excludes that zero, and then the functional equation gives the critical line. This is how a family of estimates approaching a boundary yields an exact statement. It is not numerical rounding of a real part to one half.

## 6. Calculate a lattice before reading covolume plus twice the index

A lattice is the integer span of real-linearly independent vectors. If $v_1,\ldots,v_r$ is a basis, the volume of its fundamental parallelotope is the covolume, with

$$
\operatorname{covol}(L)^2
=\det\big(\langle v_i,v_j\rangle\big).
$$

The right side is a Gram determinant. Norms, determinants and volume therefore describe the same quantity in different forms.

Take $L=\mathbb Z^2$ and $L'=2\mathbb Z\times3\mathbb Z$. A basis is $(2,0),(0,3)$, so the covolume is $6$. The Gram matrix is $\operatorname{diag}(4,9)$ and its determinant is $36$. The index $[L:L']=6$ counts residue classes modulo the sublattice.

More generally, if $L'\subset L$ has finite index $I$,

$$
\operatorname{covol}(L')=I\operatorname{covol}(L),
\qquad
\log\operatorname{covol}(L')^2
=\log\operatorname{covol}(L)^2+2\log I.
$$

**The factor two comes from taking the logarithm of squared volume.** The actual twisted lattices are much more elaborate, but this identity makes the correction recognizable.

Hadamard's inequality says that the Gram determinant is no greater than the product of the squared lengths. Many independent short vectors therefore produce a volume upper bound. One short vector is not enough, and a thousand copies of it are not enough either. The zero vector is certainly short, but provides no dimension. That is why a separate theorem about having enough vectors is required.

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/math/riemann-2026/lattice.svg" target="_blank" rel="noopener" aria-label="Enlarge: lattice index and covolume"><img src="/math/riemann-2026/lattice.svg" alt="A two-dimensional sublattice generated by twice the first coordinate and three times the second has index and covolume six, with Gram determinant thirty-six." width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>Figure 2 · A lattice you can calculate completely.</strong> A teaching example for the index correction, not a reduction of the full automorphic construction to two dimensions. <a href="/math/riemann-2026/lattice.svg">Open full figure</a>.</figcaption>
</figure>

## 7. Three inputs: short, enough, and not collectively too short

The shorter proof organizes the comparison around source and target spaces and chains of theta lifts. Write $D$ for the target dimension and $n$ for the number of selected independent vectors. Neither is the auxiliary prime $d$.

### A: short forms and index control

Shortness is not a small value of an arbitrary function at a point. Integral source forms pass through a normalized Poincaré map and a chain of lifts, with controlled squared norms. The estimates cover the relevant complex embeddings and record integrality losses at finite primes.

Both kinds of control are needed. A denominator can make a real number look tiny: $1/2^{100}$ is not a very small nonzero integer. A must account for the norm benefit and the price of integrality together. [ShortAndEnough.lean][short-enough]

### B: the short forms must cover enough dimensions

Spanning the source does not prove that its image covers the target. B supplies a controlled collection of translates whose images span almost all of the target. The comparison will use the simpler consequence

$$
\frac D2\le n\le D.
$$

The development actually obtains a fraction closer to one; one half is enough for the final algebra. B prevents the upper bound from controlling only a small exceptional subspace. Its inputs include second moments, correlation bounds and a spanning argument, rather than a count of generated proof files. [Spanning theorem][spanning]

### C: integral families cannot be collectively too short

C gives a lower bound for the corrected covolume of a nearly full-dimensional independent family. It uses twisted lifts, determinant comparisons, auxiliary vectors completing a basis and height control.

This is a **conditional bound on a family's volume**, not a positive minimum length for every vector in a complex space. Arbitrary complex vectors can be rescaled. Integral structures and index constraints give the bound content. C must also pay for completion when the family is not a full basis. [LongForms.lean][long-forms]

Before proceeding, explain which upper bound A supplies, which dimension fraction B preserves, and why C is not defeated by rescaling a vector. Those questions identify what the main inequality is actually comparing.

## 8. Work through the algebra of the main inequality

This is the place to use pencil and paper. We retain the actual interfaces while renaming quantities for readability:

| Here | Source name | Role |
| --- | --- | --- |
| $D$ | `targetDim` | Target dimension |
| $M$ | `mainAmount` | Large shared contribution, nonnegative |
| $R$ | `totalRemainder` | Remainder to control |
| $m$ | Chain length | Multiplies the remainder benefit |
| $L$ | $fa(\log b)^4$ | Norm/covolume error scale |
| $I$ | `indexPerDim` | Index budget per dimension |

The parameter $f$ counts the infinite places of the chosen number field in the data, $a$ is a large order parameter with $a=xb$, and $b$ is a weight scale. They belong to one admissible data set, not independent free variables. All logarithms here are natural.

A bounds the logarithm of each squared norm by $M-mR+L$. Hadamard gives a covolume bound

$$
c\le n(M-mR+L).
$$

The index budget satisfies $\delta\le DI$, while C yields

$$
D(M-3L)\le c+2\delta.
$$

Consequently,

$$
D(M-3L)\le n(M-mR+L)+2DI.
$$

Do not jump straight to “the main terms cancel.” Rearranging actually gives

$$
nmR\le(n-D)M+(n+3D)L+2DI.
$$

Now $n\le D$ and $M\ge0$ make the first term nonpositive. Using $n+3D\le4D$ gives

$$
nmR\le D(4L+2I).
$$

B supplies $n\ge D/2>0$, hence

$$
mR\le8L+4I.
$$

The cancellation does not require the coincidence $n=D$: the missing dimensions are handled by a sign. This also explains why nonnegativity of $M$ had to be proved.

For the actual parameters,

$$
I=10\log(1+2b^2)\,fa(\log b)^3.
$$

For sufficiently large $b$, an additional logarithmic factor absorbs these losses. The resulting source theorem is

$$
\boxed{m\,\mathrm{totalRemainder}\le fa(\log b)^5.}
$$

Compare this calculation with `star_inequality` in [MainInequality.lean][main-inequality]. **Deriving this algebra means understanding how three major inputs combine. It does not mean proving A, B and C.** Record progress at specific bridges instead of claiming that the whole proof has become clear at once.

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/math/riemann-2026/proof-map.svg" target="_blank" rel="noopener" aria-label="Enlarge: mathematical interfaces in the proof"><img src="/math/riemann-2026/proof-map.svg" alt="A supplies short vectors and index control, B supplies many independent vectors, and C supplies a covolume lower bound. Their main inequality leads through parameter choices and an analytic criterion to a zero-free half-plane and symmetry." width="1200" height="740" loading="lazy" decoding="async" /></a>
<figcaption><strong>Figure 3 · The difficulty lies in proving the interfaces.</strong> This original map follows the pinned readable rewriting. It is not a record of a complete kernel replay performed for this site. <a href="/math/riemann-2026/proof-map.svg">Open full figure</a>.</figcaption>
</figure>

## 9. Why a chain of square-root length gives the critical exponent

The main inequality bounds a total remainder, while the analytic criterion needs $R_{d,q}(x)$. The next bridge gives, for admissible data,

$$
R_{d,q}(x)\le
\frac{\varphi(q)(\log b)^6}{m}
+|R_{d,q}(x_1)|
+\log b\,|R_{d,1}(x_1)|.
$$

The larger cutoff $x_1$ is not there merely to compute more primes. Its remainder serves as a reference that an existing prime number theorem can make small. [OneSidedBound.lean][one-sided]

After fixing the arithmetic parameters, an existence theorem supplies admissible data for sufficiently large integer $x$, with

$$
m\ge\sqrt{x},\qquad \log b\le2x^\eta,
\qquad \log x_1\ge x^{\eta/12},
$$

where $\eta>0$ is small. The construction imposes further conditions on $m$; it is not an independently adjustable dial that can be made arbitrarily large at no cost.

Substitution in the first term gives

$$
\frac{\varphi(q)(\log b)^6}{m}
\le64\varphi(q)x^{-1/2+6\eta}.
$$

The known prime number theorem controls the two remainders at $x_1$. Since $\log x_1$ is very large relative to $x$, sufficiently strong fixed inverse-logarithmic estimates there become $x^{-2}$ estimates here. **This does not assume the square-root error term being proved**: the scales and quantifiers differ.

One first obtains an integer estimate with a constant. Control the floor error, choose $7\eta\le\varepsilon$, and absorb the constant for sufficiently large $x$. Only then does the final real-variable statement become

$$
R_{d,q}(x)\le x^{-1/2+\varepsilon}
$$

The meaning of $\sqrt{x}$ is thus specific: **the main inequality multiplies the remainder by $m$, while the construction keeps all costs inside a common budget; division by $m$ leaves a square-root denominator.** A headline that AI suggested taking a square root does not explain why the argument closes. The denominator and its error budget have to be shown together.

## 10. What a theta lift actually does

Begin with the elementary theta function

$$
\theta(t)=\sum_{n\in\mathbb Z}e^{-\pi n^2t},\qquad t>0.
$$

Poisson summation gives $\theta(t)=t^{-1/2}\theta(1/t)$. A lattice sum and a Fourier transform describe the same object at different scales. This is an excellent introduction, but not the full definition of the lifts in this proof.

More generally, a theta kernel relates symmetries of two groups. Schematically, a lift can look like

$$
(\Theta\phi)(g)=\int_{[H]}\theta(g,h)\phi(h)\,dh.
$$

The kernel, spaces, measures and convergence conditions must all be specified. The construction transports an automorphic form while retaining trackable arithmetic information. In appropriate definite settings, expressions can be written as finite class sums, helping explain how abstract representation theory feeds concrete norm and integrality estimates.

An automorphic form can initially be thought of as a function satisfying precise transformation laws; modular forms provide a low-rank entrance. Higher-rank automorphic forms are not periodic functions copied into more variables: representations, local types and weights determine the identities available.

This argument iterates lifts and studies norms and determinants of the composite maps. **The benefit is not that increasing dimension automatically increases accuracy. It is the accumulation of quantified vanishing, divisibility and norm relations.** Every lift also has costs. The chain is useful only when those costs can be tracked against the gain. [Chain norms][chain], [reading guide][guide]

For a reader with Fourier analysis, the next questions are concrete: how is the kernel compatible with group actions? Can a composite lift vanish? What period or integral does a seesaw identity exchange? How does a Rallis-type relation turn a norm into estimable $L$-values? These questions lead further than memorizing a list of theorem names.

## 11. Why denominators bring in Galois representations and Selmer groups

Projection is an easy difficulty to underestimate. Even with integral input and an integral operator, projection to an eigenspace need not preserve integral vectors.

For a prime $\ell$, take the elementary example

$$
A=\begin{pmatrix}0&1\\0&\ell\end{pmatrix},
\qquad A^2=\ell A,
\qquad P=A/\ell.
$$

Then $P^2=P$, so it is an algebraic projection, but $P(0,1)=(1/\ell,1)$. This is not the orthogonal projection used in the development. It demonstrates the precise point that **linearity of a projection does not imply preservation of integrality**.

For automorphic forms, eigensystems can become congruent modulo $\ell$. Such congruences affect projection denominators. Ignoring them in a covolume comparison can count an integrality benefit that does not exist.

Galois representations organize the arithmetic eigenvalues in another language. Extension classes can be described by $H^1$; imposing local conditions leads to Selmer-type groups. The needed contribution is not merely that these groups are important. One must bound the relevant classes or their lengths, then turn that information into a bound on the losses at finite primes.

This branch culminates in [FitTwistsExist.lean][twists]. Suitable twists are selected for each relevant prime and comparison isomorphism so that projection denominators fit the total budget, while required ratios of $L$-values have controlled height. The family being controlled cannot be replaced by an estimate on a single complex absolute value.

An Iwasawa tower organizes compatible layers of number-field extensions and the arithmetic groups varying through them. The local representation and integral-structure conditions bring in $\ell$-adic and Hodge theory. Their role is quantitative control of **integrality, denominators and heights**, not added mathematical ornament.

This section explains responsibilities, not an independent proof of that branch. To go deeper, select an interface: trace the existence of suitable twists to a Selmer-length bound, then to its local conditions. A theorem elsewhere carrying the same group name is not enough; its objects and assumptions must match.

## 12. What Lean verification establishes, and how to read with it

In Lean, propositions are expressed as types and proofs as terms of those types. Tactics help build a term; the kernel checks whether it meets the rules. AI can help propose ideas or produce the term, but persuasive prose is not the acceptance criterion.

### Start at the conclusion, not the first import

The pinned entry point contains

```lean
theorem riemannHypothesis : RiemannHypothesis :=
  New.zeta_zeros_on_line New.grh
```

The dependencies are visible: `New.grh` supplies right-half-plane nonvanishing, and `New.zeta_zeros_on_line` applies symmetry. The short second step does not make the first step easy. [Main.lean][entry]

Next read `Statements.lean`. Check the definitions of complex numbers, zeta and characters, the treatment of trivial zeros and poles, and whether the final theorem retains any unproved hypotheses. Mathlib represents functions as total functions, with conventional values at poles. The formal clause `s ≠ 1` excludes such a special point; it is not another number-theoretic conjecture. [Mathlib definition][mathlib]

### Compilation, axioms and statement matching have separate responsibilities

The command `#print axioms riemannHypothesis` exposes the theorem's axiom dependencies. The independent audit reports `propext`, `Classical.choice` and `Quot.sound`. [Audit output][axioms]

At a first reading, propositional extensionality identifies equivalent propositions in the appropriate way; choice supports classical selection; quotient soundness supports quotients by equivalence relations. None is a disguised assumption of RH.

A compilation message alone does not perform every check. One must also verify that the theorem is the intended statement, all hypotheses have been discharged, no additional unproved axiom was introduced, and the kernel accepts the actual term. Statement-comparison tools and independent kernels provide evidence for different obligations. Think of checking the specification and checking the derivation as distinct tasks.

### Find an interface, then expand its dependencies

Understanding the architecture does not require starting by rebuilding the original archive. Read the entry point, main inequality, parameter choice and analytic criterion; then choose a substantial input to investigate. A complete formal replay requires that version's pinned toolchain and dependencies. Compiling a small Lean exercise does not replay the RH development.

[Mathematics in Lean][mil] offers an entry through working examples; [Theorem Proving in Lean 4][tpil] explains types, quantifiers and axioms systematically. Translate in both directions: which object a quantifier governs, and what a lemma supplies mathematically. Learning to make a tactic clear a goal is not the whole reading skill.

## 13. Follow dependencies instead of directory order

Open the following files at the fixed commit. This is an actionable reading order and a statement of the guide's scope.

| Order | File | Question to answer |
| --- | --- | --- |
| 1 | [Statements.lean][statements], [Main.lean][entry] | What are the final quantifiers, exceptions and conclusions? |
| 2 | [New/Main.lean][main] | How does right-side nonvanishing give the critical line? |
| 3 | [Zeros/Criterion.lean][criterion], [Landau.lean][landau] | Why can a one-sided bound detect zeros, and where are the extra conditions? |
| 4 | [OneSidedBound.lean][one-sided] | How does the total remainder yield the needed $R_{d,q}$ bound? |
| 5 | [MainInequality.lean][main-inequality] | How is the common term removed, and where is the dimension fraction used? |
| 6 | [ShortAndEnough.lean][short-enough] | What are A's norm/index estimates and B's spanning estimate? |
| 7 | [LongForms.lean][long-forms] | Which integral and twisting conditions support C? |
| 8 | [FitTwistsExist.lean][twists] | Which existence theorem supplies the denominator budget? |

For every file, write three lines: **its inputs, its output, and where the output is used**. Record the object and quantifier attached to each variable. The chain length `m`, selected-family size `n`, and target dimension are not interchangeable large parameters; their relations make the cancellation possible.

For a library result, inspect the version and hypotheses before deciding whether to open its proof. Temporarily treating a checked interface as a lemma is reasonable when learning the architecture. Independent verification eventually requires expanding the nontrivial inputs on which the argument rests. Both readings are useful, with different completion criteria.

## 14. Courses organized around things you can actually do

This is not a promise that bookmarking a syllabus makes RH understandable. Each stage has a deliverable. The links lead to official materials; their order is this article's teaching recommendation.

### First: turn analysis and linear algebra into derivations

| Subject | Course | Deliverable |
| --- | --- | --- |
| Limits, series, uniform convergence and asymptotic quantifiers | [MIT 18.100A Real Analysis][real-course] | Identify which fixed parameters a threshold may depend on; justify a sum/integral exchange |
| Bases, projections, positive matrices and Gram determinants | [MIT 18.06 Linear Algebra][linear-course] | Calculate the lattice example and derive the index correction for squared volume |
| Continuation, residues, zeros, poles and contour integration | [MIT 18.04 Complex Variables][complex-course] | Derive the logarithmic derivative and smoothed Mellin identity with their domains |
| Lebesgue integration, Fourier series and integrals | [MIT 18.103 Fourier Analysis][fourier-course] | Explain transform convergence, positivity and why the Gaussian suits theta functions |

An engineering or machine-learning background may make matrices and Fourier transforms familiar. The gaps are often convergence in a specified space, fixed versus uniform parameters, and uniqueness of continuation. Numerical intuition is useful; quantifiers and convergence conditions determine when it can become a proof step.

### Second: acquire the number-theoretic and automorphic language

| Subject | Course | Deliverable |
| --- | --- | --- |
| Groups, rings, fields, modules and initial representation language | [MIT 18.701 Algebra I][algebra-course] | Explain a character's multiplicativity and periodicity; distinguish a vector space from an integral lattice |
| Algebraic integers, factorization, valuations, class groups and $L$-functions | [MIT 18.785 Number Theory I][number-course] | Describe an integrality condition at a finite prime and its place in the product formula |
| Modular forms, modular curves and related representations | [MIT 18.786 Number Theory II, 2024][modular-course] | Understand a low-rank example before identifying its higher-rank counterparts |

These courses do not replace all the advanced inputs. Theta correspondence, arithmetic heights, Galois cohomology, Selmer groups, Iwasawa theory and $\ell$-adic Hodge theory require further study within a selected branch. Do not open every subject at once. Start from a lemma you need to check and build its shortest useful prerequisite chain.

### Third: reconnect formal statements with mathematical statements

Use [Mathematics in Lean][mil] for equalities, quantifiers, sets and elementary number theory, followed by [Theorem Proving in Lean 4][tpil] for dependent types, structures and axioms. The deliverable is a complete translation of a theorem's statement, a trace of its supporting lemmas, and an explanation of why an unfinished proof is not a closed theorem.

A strong first reading project is `New.zeros_on_line`, rather than the entire RH build. Assume nonvanishing on the right, reflect a left-hand zero using the functional equation, and combine two inequalities to obtain real part exactly one half. It is short, genuinely mathematical, and reveals whether the next obstacle is complex analysis or Lean syntax.

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/math/riemann-2026/learning-map.svg" target="_blank" rel="noopener" aria-label="Enlarge: prerequisites and learning deliverables"><img src="/math/riemann-2026/learning-map.svg" alt="The learning map covers real and linear analysis, complex analysis, number theory, automorphic forms, arithmetic geometry and Lean reading, each tied to a concrete deliverable." width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>Figure 4 · Check understanding through a deliverable.</strong> Completing courses does not guarantee an independent verification of the full proof. Learn the interfaces, then investigate one branch. <a href="/math/riemann-2026/learning-map.svg">Open full figure</a>.</figcaption>
</figure>

## 15. Six exercises that locate your current level

1. **Euler product.** Expand it in the region of absolute convergence. Explain why $\Lambda(12)=0$ but $\Lambda(8)$ is required. Saying that primes are building blocks does not finish the derivation.
2. **Smoothing.** Compute $\int_n^\infty(x/n-1)x^{-s-1}dx$ and state $\operatorname{Re}s>1$. Explain why division by $x$ subtracts one from the zero-related exponent.
3. **Volume and index.** Calculate the Gram determinant, covolume and index of $2\mathbb Z\times3\mathbb Z$. Form a second lattice with basis $(2,0),(1,3)$: does the volume change, and why does the angle affect the slack in Hadamard's bound?
4. **The main inequality.** Derive $mR\le8L+4I$ from Section 8. Name the uses of $M\ge0$, $n\le D$ and $n\ge D/2$; do not just discard unspecified lower-order terms.
5. **Projection denominators.** Verify $P^2=P$ for Section 11's matrix and compute $P(0,1)$. Explain why a complex norm bound does not automatically control denominators at finite primes.
6. **Zero exclusion.** For a proposed zero with real part $0.6$, choose $\beta\in(0.5,0.6)$, identify a suitable positive exponent allowance, and explain why the analytic criterion is needed beyond a finite numerical plot.

The first four exercises test an independent account of the central architecture. Generalizing the fifth requires integral arithmetic structures. Checking every condition in the sixth leads into analytic number theory. This provides a concrete progress scale rather than an impression that the entire argument feels understandable.

## 16. A reproducible small computation that illustrates definitions

For this post, a Python standard-library program computed several values of $\psi(x)$. For each prime $p$, it assigns $\log p$ to $p,p^2,p^3,\ldots$, then accumulates. No model was downloaded, no language model supplied the numerical values, and the proof development was not executed.

| $x$ | $\psi(x)$ | $\psi(x)-x$ | $(\psi(x)-x)/\sqrt{x}$ |
| --- | --- | --- | --- |
| 10 | 7.832014181 | -2.167985819 | -0.685577312 |
| 100 | 94.045311229 | -5.954688771 | -0.595468877 |
| 1,000 | 996.680912247 | -3.319087753 | -0.104958771 |
| 10,000 | 10013.396693263 | 13.396693263 | 0.133966933 |
| 100,000 | 100051.564025658 | 51.564025658 | 0.163059766 |

The values illustrate prime-power weights, normalization and sign changes. They do not give an infinite-range uniform bound, and do not compute the proof's character-weighted, residue-class-restricted $R_{d,q}$ with its fixed constant. **The difference between a teaching computation and the theorem's object belongs next to the numbers.**

[Download raw CSV](/math/riemann-2026/prime-powers.csv) · [Generation source][asset-source] · [Figure provenance and hashes](/math/riemann-2026/manifest.json). Nine displayed decimals reflect floating-point output, not an interval-arithmetic certification of every final digit.

Run `python3 scripts/build-math-assets.py --check` in this repository to compare the teaching assets with their deterministic generator. That is an asset-reproduction check, not formal verification of RH. A learner can start with small Lean lemmas; a full verifier should use the pinned development and its independent verification scripts.

## 17. Understanding includes knowing where the difficulty remains

The route can now be retold: exclude zeros of $L$-functions in $\operatorname{Re}s>1/2$; use an analytic criterion to reduce this to a family of one-sided weighted prime-sum bounds; encode the remainder in norms and covolumes after theta lifting; combine short forms, enough forms and a covolume lower bound; choose parameters to obtain $x^{-1/2+\varepsilon}$; apply the functional equation to reach the critical line.

Three obligations are especially easy to hide in a slogan: **both estimates must concern the same corrected covolume, the short forms must span enough dimensions, and the denominator losses must fit the budget**. They explain why a final RH declaration can be short while its mathematics is long.

First aim to check interfaces and the crucial algebra. Then aim to verify one technical branch. Learning toward a clearly identified gap works better than collecting every relevant term. The courses, source files and exercises above turn those gaps into next actions.

Apply the same standard to future updates. Does a shorter development retain the same final statement? Which inputs were re-proved or simplified? Has a human-readable account supplied bridges it previously listed as assumptions? Answers should refer to a version and a result; updating a date is not another independent verification.

## 18. Primary sources and further reading

The links and status were checked on **November 26, 2026**. Code links pin a commit; report pages may continue to change. The original large proof archive was not downloaded or mirrored for this post.

- [Alpöge's November 20 announcement][announcement]: the initial claim and clues to its ideas, rather than a complete conventional mathematical paper.
- [Lean FRO / Mathlib Initiative statement][community]: the community's certification of the formal statement and proof.
- [Sutherland's original-proof checks][verification] and [shorter-proof checks][short-verification]: keep versions, kernel results, statement comparison and axiom audits separate.
- [Shorter repository][repo] and [readable GUIDE][guide]: the primary source for this article's code-reading route, at the pinned commit.
- [Rubinstein's project page][rubinstein]: describes the scope of his checks and explanatory draft. Inputs explicitly left unfinished there should not be presented as another completed conventional proof.
- [Zhang's preliminary mathematical note][zhang]: a route into concepts and literature. The specific inequalities in this guide are checked against the linked Lean interfaces.
- [Clay's problem description][clay] and [Mathlib's RiemannHypothesis definition][mathlib]: compare the traditional mathematical question with its formal target.
- Official courses and Lean textbooks are linked in Section 14. The diagrams, elementary algebra examples and finite numerical table are new teaching material prepared for this guide.

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
