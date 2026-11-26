# Research receipt: reading the November 20 Riemann proof

Checked on 2026-11-26. This receipt records research for the paired `math-riemann-proof-2026` article, not a new verification of the Riemann hypothesis.

## Scope and identification

The user identified the November 20, 2026 announcement. The article covers Levent Alpöge's work with Claude, not the separate Masullo manuscript announced around the same date. It uses the November 25 shorter rewriting to explain the architecture and explicitly distinguishes it from the original development.

The inspected shorter repository is `lsernau/grh-lean`, commit `72fead102f663d5c7a407964a13dc0cf9d977207`. The repository describes its proof and documents as AI-written research artifacts following the original method, with many rewritten steps. Its own status says that machine checks have passed and that it is not accompanied by a completed conventional paper.

## Primary status evidence

| Source | Observation used | Boundary |
| --- | --- | --- |
| [Alpöge announcement](https://alpo.ge/remark.pdf) | Identifies the announced result, collaboration and clues about multiplicity and theta chains | Four-page announcement, not the complete ordinary mathematical exposition |
| [Lean FRO / Mathlib Initiative, Nov 21](https://leanprover-community.github.io/blog/posts/riemann-hypothesis/) | Public certification of statement and formal-proof correctness | Attributed certification, not a local replay |
| [Sutherland, original proof](https://math.mit.edu/~drew/grh/) | Completed build, axiom, kernel and statement-comparison checks; page updated Nov 25, 22:05 UTC | Original archive only |
| [Sutherland, shorter proof](https://math.mit.edu/~drew/shortgrh/) | Both editions checked; page updated Nov 26, 02:50 UTC | Shorter commit and its pinned toolchain, not interchangeable with original logs |
| [Axiom audit output](https://math.mit.edu/~drew/grh/audit.log) | Three standard axioms in the reported final theorem dependencies | Reported output, not generated here |
| [Mathlib RH definition](https://leanprover-community.github.io/mathlib4_docs/Mathlib/NumberTheory/LSeries/RiemannZeta.html) | Definition and treatment of trivial zeros/pole | Current documentation; pinned theorem statements were inspected separately |
| [Rubinstein project page](https://www.math.uwaterloo.ca/~mrubinst/alpoge_claude_grh/) | Separates his machine checks from unfinished inputs in his explanatory manuscript | Do not present its draft as another complete conventional proof |
| [Robin Zhang preliminary note](https://www.ihes.fr/~rzhang/files/GRH%20note.pdf) | Additional reading and provenance/literature route | Not the source of a claimed independent validation in this article |

## Pinned mathematical sources read

All paths below are in `grh/` at the commit above. Selected definitions, overviews and top-level proof interfaces were inspected. No claim is made to have independently checked every subordinate proof.

- `src/Statements.lean`, `src/Main.lean`: the five final statements and their entry points.
- `src/New/Main.lean`: right-half-plane nonvanishing to critical-line zeros.
- `src/New/Reduction/PrimeSums.lean`: weighted prime powers, main amount and total remainder.
- `src/New/Reduction/Zeros/Criterion.lean`, `src/Lib/Analytic/Landau.lean`: one-sided criterion, auxiliary twists and residue-sign requirements.
- `src/New/Reduction/OneSidedBound.lean`: the comparison with the large cutoff, parameter scales, integer-to-real passage and final nonvanishing theorem.
- `src/New/Reduction/MainInequality.lean`: the full top-level `star_inequality` proof was read and its algebra re-expressed in the post.
- `src/New/Reduction/ShortAndEnough.lean`: statements and roles of A/B.
- `src/New/Spanning/SecondMoment/SpanningTheorem.lean`: second-moment and spanning inputs.
- `src/New/Determinant/Twist/LongForms.lean`: C and its twisted covolume/height inputs.
- `src/New/Determinant/Chain/NormOfChain.lean`: chain determinant, Rallis-type products and volume relations.
- `src/New/Congruences/FitTwistsExist.lean`: the existence of twists fitting denominator and height budgets.
- `README.md`, `GUIDE.md`: version, scope, reading order, objects and glossary.

## Original work for this post

- Derived the smoothed Mellin identity from a single summand with its convergence restriction.
- Expanded the main comparison into the inequalities ending in `m R ≤ 8 L + 4 I`, preserving the roles of nonnegative main amount and the dimension fraction.
- Used a two-dimensional lattice and a non-integral algebraic projector as explicitly marked teaching examples, not replicas of the full arithmetic construction.
- Created five original schematic SVGs, including a cover; the cover's points are not computed zeros.
- Computed the finite `psi(x)` table with Python standard-library prime-power weights for five cutoffs up to 100000. Raw CSV, deterministic source and provenance manifest are public. The values do not compute the character-weighted remainder in the proof.
- Added seven verified official MIT course links and two official Lean textbook links, each tied to a learning deliverable. Their suggested order is editorial advice.

## Not performed

The original multipart Lean archive was not downloaded. No full original or shortened Lean build, kernel replay or independent checker run was performed for the article. No new mathematical theorem is claimed. Website builds and browser checks validate publication and presentation, not the proof's correctness.

## Publication checks

Before publication, `npm run check` passed: 53 files with no type errors or warnings, 73 built pages, 28 paired articles, Math formula/source/numerical parity and deterministic teaching-asset checks, and 149 browser checks (22 behavior, 127 design). Math joins the width matrix at 320, 390, 768, 1024 and 1440px in both languages, and the theme checks include the mathematical article. Actual desktop/mobile previews, including dark mathematical reading, are in `docs/previews/math-*.png`. The GitHub Pages workflow and live inspection establish publication separately.
