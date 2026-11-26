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

## Verification and publication

```bash
npm run typecheck
npm run build
python scripts/check-translations.py
python scripts/check-kaggle-assets.py
npm run test:e2e
```

Translation checks validate pairs, heading and figure parity, stable scoring metadata, language-specific canonicals, visible English text and report anchors. Asset checks validate hashes and all built internal links. Browser checks exercise language switching, filters, localized search/feeds, theme labels, full-width covers, native contents navigation, sticky positioning and active-section tracking on desktop and mobile. Capture previews after starting the existing development or preview server.

Push the reviewed source to `main`, confirm the exact commit's GitHub Pages workflow, then verify both live editions. A successful push does not by itself establish deployment.
