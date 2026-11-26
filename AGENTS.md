# Repository instructions

- Read [DESIGN_STANDARD.md](DESIGN_STANDARD.md) before changing layouts, styles, images, navigation or motion. It defines required consistency and intentional differences between component roles.
- Keep English as the default and maintain the matching Chinese edition. Follow [docs/bilingual-editing.md](docs/bilingual-editing.md) and the existing editorial guides.
- Reuse shared views and component styles. Standard card covers have one base 16:9 rule; do not introduce topic-specific or mobile ratio overrides. Preserve analytical figures with `object-fit: contain`.
- When adding a page template or a meaningful breakpoint, extend `design-contract.json` and the design checks. Do not relax a failed assertion or remove a route just to make CI pass; document an intentional policy change and test its replacement.
- Run `npm run check` before proposing or publishing a change. It builds production output, audits content/assets, and runs behavior and design checks. Use `npm run check:design` for focused layout work. Browser checks manage an isolated production preview on port 4329; do not substitute the development server.
- Inspect relevant screenshots in both languages and on desktop/mobile when changing visual design. Automated geometry checks do not establish visual quality, sufficient article depth, or chart readability.
- Keep motion finite, content visible without JavaScript, and reduced-motion support effective when the preference changes during a visit.
- Preserve recorded scores, evidence dates, figure provenance and the distinction between plans, execution and official scoring. Never fabricate measurements or publish private competition artifacts.
- Push or publish only when authorized in the conversation. Confirm the exact commit's successful GitHub Pages deployment and inspect the affected live pages before reporting publication as complete.
