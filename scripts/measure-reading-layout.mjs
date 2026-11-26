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
    const measuredRoute = '/zh' + retained.route;
    await page.goto(base + measuredRoute, { waitUntil: 'networkidle' });
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
    measurements.push({ ...retained, measuredRoute, after });
    await page.close();
  }
  const failures = [];
  const routes = ['/', '/kaggle/', '/posts/', '/posts/kaggle-15-cmi/', '/posts/kaggle-method-validation/', '/data-agent-ontology/'];
  const widths = [320, 768, 1024];
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    for (const prefix of ['', '/zh']) {
      for (const route of routes) {
        await page.goto(base + prefix + route);
        if (!await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)) failures.push({ width, route:prefix+route });
      }
    }
    await page.close();
  }
  if (failures.length) throw new Error(`Horizontal overflow: ${JSON.stringify(failures)}`);
  const report = { ...prior, observedAt: new Date().toISOString(),
    scope:'Chinese editions now use /zh/ and full-row covers. Baseline pages were Chinese at root. Text, mobile font size, cover policy and navigation changed; height is not a spacing-only ablation.', measurements,
    extraOverflowChecks: { widths, pages: routes.length, locales:['en','zh'], failures } };
  await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
  console.log('Refreshed six Chinese baseline comparisons; 36 bilingual narrow/tablet overflow checks passed.');
} finally {
  await browser.close();
}
