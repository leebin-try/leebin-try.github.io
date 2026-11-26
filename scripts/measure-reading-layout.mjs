import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';

// The retained baseline was measured before the compact-layout edit at fee4934.
// Article content also changed: page height is not a spacing-only ablation.
const reportPath = 'docs/previews/layout-density.json';
const prior = JSON.parse(await readFile(reportPath, 'utf8'));
const base = process.env.PREVIEW_URL ?? 'http://127.0.0.1:4321';
const browser = await chromium.launch({
  executablePath: process.env.CHROME_EXECUTABLE ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
try {
  const measurements = [];
  for (const retained of prior.measurements) {
    const page = await browser.newPage({ viewport: retained.viewport });
    await page.goto(base + retained.route, { waitUntil: 'networkidle' });
    const after = await page.evaluate(() => {
      const prose = document.querySelector('.prose');
      const height = selector => document.querySelector(selector)?.getBoundingClientRect().height;
      return {
        height: document.documentElement.scrollHeight,
        hero: height('.hero,.kaggle-hero'),
        caseHeight: height('[data-kaggle-case]'),
        coverHeight: height('.article-cover'),
        paragraphLineHeight: getComputedStyle(prose ?? document.body).lineHeight,
        paragraphFontSize: prose ? getComputedStyle(prose).fontSize : undefined,
        argumentTop: document.querySelector('.prose>p')?.getBoundingClientRect().top,
      };
    });
    measurements.push({ ...retained, after });
    await page.close();
  }
  const failures = [];
  const routes = ['/', '/kaggle/', '/posts/', '/posts/kaggle-15-cmi/', '/posts/kaggle-method-validation/'];
  const widths = [320, 768, 1024];
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    for (const route of routes) {
      await page.goto(base + route);
      if (!await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)) failures.push({ width, route });
    }
    await page.close();
  }
  if (failures.length) throw new Error(`Horizontal overflow: ${JSON.stringify(failures)}`);
  const report = { ...prior, observedAt: new Date().toISOString(), measurements,
    extraOverflowChecks: { widths, pages: routes.length, failures } };
  await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
  console.log('Refreshed six baseline comparisons; 15 narrow/tablet overflow checks passed.');
} finally {
  await browser.close();
}
