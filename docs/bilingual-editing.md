# Bilingual content and reading layout

English is the default at `/`. Chinese pages live under `/zh/`. Both editions are generated as complete static HTML; the language switch is a normal link, with JavaScript preserving filters and mapping the current article fragment to the corresponding translated heading. URL language is authoritative; browser language does not override a shared link.

## Paired articles

- Chinese: `src/content/posts/<key>.md`, with `lang: zh` or the existing Chinese default.
- English: `src/content/posts/en/<key>.md`, with explicit `lang: en`.
- Keep the same basename. `postKey()` identifies a pair; `postPath()` generates its localized URL. Never use a content-entry ID directly as a public slug.
- Translate the title, description, tags, cover description, prose, code comments, figure captions and result wording. Categories, topic keys and status keys remain canonical internal values and are localized by `label()`.
- Preserve scores, evidence dates, submission references, official URLs, source versions and the distinction between planned and completed work. The original diagrams and aggregate metric exports are shared across languages.
- Match heading depth and order, plus figure order. Language switching maps translated heading slugs by corresponding position. Review semantic correspondence as well as the automated count checks.
- Chinese body links to local articles or evidence should point to `/zh/`; English body links use the root routes. Assets remain under shared `/kaggle/`, `/art/` and `/data-agent-ontology/` paths.

Navigation, archive filters, search, RSS, evidence pages, notes and biography are localized. Each archive/search/feed contains one edition, rather than duplicate pairs. Canonical and `hreflang` links identify the English and Chinese URLs; both appear in the sitemap.

The research report has paired HTML in `src/content/reports/` and English/Chinese companion Markdown files in `public/data-agent-ontology/`. Preserve every claim/source anchor and its verification scope. Translating the frozen report is not a new literature review.

## Reading layout

`ReadingLayout.astro` puts the outline to the left above 1100px, using a sticky sidebar with its own overflow. Smaller screens use expandable contents. Native hash links support keyboard navigation; the scroll handler highlights the current section. Language-link selectors are scoped to anchors because highlighted code blocks also expose `data-language` attributes.

Article covers occupy the entire article row, preserve their image geometry and approach the former large-cover height (desktop maximum 480px). List covers also occupy their card row. This intentionally supersedes the previous thumbnail layout. The tighter prose spacing remains in place.

All standard article-card covers use one 16:9 frame, including retained sample posts, competition cases and method articles, at every breakpoint. The base `.post-cover` rule owns this ratio; avoid content-specific or mobile overrides. Editorial diagrams remain fully visible with `object-fit: contain`, while decorative artwork may fill its frame with `cover`.

Consistency is defined by component role rather than identical pixel dimensions across the site. The homepage feature remains prominent; the article archive uses three columns on desktop, while the Kaggle case grid uses two columns to accommodate results and status. Both card grids use 16:9 covers that scale with their columns. Reading-page covers and inline analytical figures retain their separate layout rules and original figure proportions.

## Verification and publication

Homepage motion is scoped to `Home.astro`, `home-motion.css` and `home-motion.ts`. It uses finite CSS entrance effects and one-shot IntersectionObserver reveals through Web Animations. Content is visible without JavaScript; reduced-motion preference disables CSS effects and cancels active scripted animations, including when changed during a visit. Hover movement applies only to a fine pointer. Keep reveals confined to opacity and transforms so they do not reflow the page.

```bash
npm run check
# Focused design verification, including a fresh build:
npm run check:design
```

Follow [the design standard](../DESIGN_STANDARD.md) and [repository instructions](../AGENTS.md). Browser checks manage an isolated foreground production preview at port 4329, then stop it. They never reuse a development server: sitemap assertions and final CSS must be checked against built output. For manual screenshots, start `npm run preview` on port 4321 and stop your preview afterwards.

Translation checks validate pairs, heading and figure parity, stable scoring metadata, language-specific canonicals, visible English text and report anchors. Asset checks validate hashes and all built internal links. Browser checks exercise language switching, filters, localized search/feeds, theme labels, full-width covers, native contents navigation, sticky positioning and active-section tracking on desktop and mobile. Capture previews after starting the preview server and waiting for entrance animations to finish.

Homepage motion was verified on both editions: a 650ms title entrance and 520ms scroll reveal, cancellation when reduced motion is enabled during playback, zero animations when reduced motion is enabled initially, visible content with JavaScript disabled, and no horizontal overflow at 320, 390 and 768px. All 16 existing desktop/mobile browser checks passed against the production build.

Push the reviewed source to `main`, confirm the exact commit's GitHub Pages workflow, then verify both live editions. A successful push does not by itself establish deployment.
