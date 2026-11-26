# Website design standard

This is the design contract for BIN / JOURNAL. It applies to the homepage, topic hubs, archives, articles and research reports in both languages. Read it before changing their presentation. The measurable acceptance limits and representative routes live in [design-contract.json](design-contract.json); browser checks live in [tests/design](tests/design).

## Principles

1. **Consistency follows component role.** Repeated cards share proportions, alignment and spacing. A feature, a case study and a chart serve different purposes and may have different dimensions.
2. **Hierarchy must explain importance.** The homepage directs attention; topic hubs help compare cases; articles support sustained reading. Size changes should communicate those roles, rather than depend on the image file or topic name.
3. **Preserve the information in an image.** Analytical axes, labels and diagram steps must remain complete. Decorative artwork can fill a frame; evidence images must not be cropped to make a grid look uniform.
4. **Density comes from useful content and disciplined spacing.** Use clear headings, concise metadata and compact related groups. Do not create empty hero areas or large gaps to make a short article appear substantial. Do not compensate with unreadably small text.
5. **Responsive layouts preserve meaning.** Columns may collapse and desktop contents may become expandable. Content, navigation, evidence and language access must remain available.
6. **Motion supports orientation.** Keep it brief and finite, avoid moving text while the user reads, and respect reduced motion. Reading must not depend on an animation completing or JavaScript running.
7. **Every claim needs the right evidence.** A polished layout cannot replace a clear problem, method, evaluation and conclusion. Planned work and verified results must be visibly distinct.

## Component size policy

| Component | Required consistency | Intentional variation |
| --- | --- | --- |
| Homepage feature | One coherent image/text composition; diagrams remain complete | Larger prominence than ordinary cards; its frame can differ from 16:9 |
| Standard article cards | 16:9 image frame for every topic, sample post and breakpoint; equal cover dimensions within a grid | Width follows the grid columns; text height may follow content |
| Kaggle case cards | 16:9 cover, consistent dimensions within the case grid, aligned outer edges | Two desktop columns accommodate status, score and explanation; these cards need not match the three-column article archive in pixels |
| Article cover | Full article-row width, intact image, maximum height 480px | Scales on narrow screens; a height cap may leave space around the intact image |
| Inline analytical figure | Original image geometry, complete labels, caption and useful alternative text | Width/height follow information density and source aspect ratio; a diagram and a wide learning curve need not be equal |
| Logo or icon | Stable size within its own navigation or control component | A logo is not an article cover and does not inherit the cover frame |

The current desktop grid choices are defaults, not universal column-count requirements. Change them only for a documented content or reading benefit. Match page margins and visual language across sections; do not force unrelated blocks to have identical heights.

## Enforced rules and their scope

| ID | Requirement | Automatic coverage |
| --- | --- | --- |
| DS-01 | Standard card covers are 16:9, fill their cover slot and align in the same grid | Rendered rectangles at 320, 390, 768, 1024 and 1440px, in English and Chinese; 1px rounding tolerance |
| DS-02 | Images load, declare positive width/height and expose alt attributes; informative article/figure images have nonempty alternatives | All main-content images on the representative route matrix, decoded before auditing |
| DS-03 | Editorial covers and analytical figures remain intact | Computed `object-fit: contain`; no fixed-height matching requirement for unrelated figures |
| DS-04 | No page-level horizontal overflow | Document width versus viewport on every matrix route; tables and code can scroll inside their own containers |
| DS-05 | Reading covers occupy the article row; body text remains readable and compact | Full-row cover geometry, height cap, article font size 15–18px and line height 1.6–2.0; actual readability still needs review |
| DS-06 | Reading navigation adapts to available width | Left sticky contents above 1100px without overlapping the article; expandable contents at or below that breakpoint; existing behavior tests exercise section jumps and language mapping |
| DS-07 | Each page has a clear primary heading and correct locale | One `main h1`, correct document language; existing tests exercise navigation, search, theme persistence, feeds and article pairing |
| DS-08 | Reduced motion disables active motion, including after a preference change; no JavaScript is required to see content | Both homepage editions, preference changes during a scroll reveal, initial reduced motion, finite animation duration, and a JavaScript-disabled browser context |
| DS-09 | Both themes retain the layout contract | English/Chinese home and article pages at desktop/mobile widths with light/dark themes; color judgment and contrast review are manual |
| DS-10 | Spacing preserves useful density | Card-grid gaps stay within 12–48px; top-level article paragraphs have at most 1.2em outer margin, section headings at most 36px; unrelated block heights remain unconstrained |
| DS-11 | Mathematical articles render equations without losing access or breaking narrow pages | The Math article joins the bilingual width matrix; browser checks require rendered equations, MathML, no math-error nodes, working contents/language mapping and reading with JavaScript disabled |

The route matrix covers each current page template, both a decorated sample article and a technical article, and the evidence/report layouts. It is a representative browser audit, not a claim to test every article at every width. Separate content/asset audits inspect all built pages, bilingual pairs, internal links and registered figure hashes. Adding a template requires adding a route to the contract.

Math adds a topic hub using the existing featured-story role and a long article with build-time KaTeX. Long displays scroll inside their own containers; do not shrink the entire article or hide page overflow to disguise a formula that is too wide. Formula/source parity and reproducible Math assets join the content checks. See [the Math editorial guide](docs/math-editorial-guide.md).

## Reading and content

- Use the established warm background, ink text and green accent tokens from `global.css`; support both themes through shared tokens.
- Prefer the existing 16px / 1.8 body text as the reading baseline. Keep paragraph spacing and heading groups compact, with visible separation between ideas. The automated bounds are guardrails, not a target to minimize.
- Keep desktop article prose within a comfortable measure (currently at most 760px) and let figures expand when their labels require it. A left contents sidebar is separate from that reading measure.
- Use descriptive section headings and show the conclusion or core judgment early. Competition case studies follow the [six-section writing template](docs/templates/kaggle-case-study.en.md): problem, approach, evaluation, results/evidence, conclusions and next steps.
- Use actual competition material or an original subject-specific figure. Preserve captions, provenance and metric exports. Clearly mark demonstrations, incomplete experiments and results recorded on a specific date.
- Avoid using blank space, decorative covers or repeated summaries as substitutes for analysis. Explain choices, validation boundaries, failure modes and what would change the conclusion.

## Interaction and motion

- Use semantic links, buttons and headings. Preserve visible keyboard focus and meaningful accessible names. Avoid duplicate keyboard stops for a decorative cover that links to the same article as its title.
- Keep the language switch on the corresponding page and section where possible. English remains the root/default; Chinese remains under `/zh/`.
- Use existing desktop hover feedback only where hover is available. Never require hover to reveal essential content.
- Homepage entrance/reveal motion uses opacity and transforms; keep the full animation budget at or below 5 seconds, including delays and repetitions. Avoid infinite decorative motion or effects that reflow the page.
- Reduced motion must disable CSS effects and cancel scripted animations. Content and ordinary links must work with JavaScript disabled; enhanced filters/search are separate behaviors.

## Automatic checks

After installing the locked dependencies, run:

```bash
npm run check          # Types, production build, content/assets, behavior and design
npm run check:design   # Fresh production build and design checks only
```

The first browser run on a machine without local Chrome requires `npx playwright install chromium`. The configuration uses local Chrome when available on macOS, otherwise Playwright Chromium; `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` can select another executable. Tests own a foreground production preview on port 4329 and stop it afterwards. Keep that port free; no existing development or preview server is reused.

GitHub Actions runs the checks on pushes to `main`, pull requests targeting `main`, and manual runs. Failed checks prevent the Pages artifact/deployment step. Browser reports, failure screenshots and traces are retained as workflow artifacts. Pull requests validate without deploying. See [the workflow](.github/workflows/deploy.yml), [Playwright CI guidance](https://playwright.dev/docs/ci-intro) and [web server configuration](https://playwright.dev/docs/test-webserver).

For a new component or changed design policy:

1. Update this standard and the contract together; explain the role and any intended exceptions.
2. Extend the representative routes or behavioral assertions to cover the change.
3. Run `npm run check`; inspect failing screenshots before editing assertions.
4. Review English/Chinese desktop/mobile screenshots, including both themes where colors changed.
5. Publish only within the authorized scope; verify the exact deployment and affected live pages.

## Human review remains required

Automation does not establish whether a page looks professional, whether a chart's labels are large enough, whether an article is substantive, whether colors meet every accessibility requirement, or whether a technical claim is correct. Review hierarchy, contrast, chart readability, cropping and text wrapping visually. Compare equivalent content when judging density; total page height changes when article length changes and is not a spacing-only measurement.
