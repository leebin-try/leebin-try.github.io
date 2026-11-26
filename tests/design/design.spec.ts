import { expect, test, type Page, type TestInfo } from '@playwright/test';
import contract from '../../design-contract.json' with { type: 'json' };
import { auditDesign } from './audit';

test.use({ reducedMotion: 'reduce' });

const browserErrors = new WeakMap<Page, string[]>();
test.beforeEach(({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on('pageerror', error => errors.push(error.message));
});
test.afterEach(({ page }) => { expect(browserErrors.get(page)).toEqual([]); });

async function openAndAudit(page: Page, path: string, info: TestInfo) {
  const response = await page.goto(path);
  expect(response?.status(), path).toBe(200);
  const decodeErrors = await page.locator('main img').evaluateAll(async images => {
    const errors: string[] = [];
    await Promise.all(images.map(async element => {
      const image = element as HTMLImageElement;
      image.loading = 'eager';
      try { await image.decode(); } catch { errors.push(image.getAttribute('src') ?? 'missing src'); }
    }));
    await document.fonts.ready;
    return errors;
  });
  expect(decodeErrors, `Image decode failures on ${path}`).toEqual([]);
  const violations = await page.evaluate(auditDesign, contract.limits);
  if (violations.length) await info.attach('design-audit.json', {
    body: JSON.stringify({ path, viewport: page.viewportSize(), violations }, null, 2),
    contentType: 'application/json',
  });
  expect(violations, `Design contract failed on ${path}`).toEqual([]);
}

for (const width of contract.widths) {
  for (const locale of contract.locales) {
    for (const route of contract.routes) {
      const path = locale.prefix + route;
      test(`design ${locale.lang} ${width}px ${route}`, async ({ page }, info) => {
        await page.setViewportSize({ width, height: 1000 });
        await openAndAudit(page, path, info);
        await expect(page.locator('html')).toHaveAttribute('lang', locale.lang);
      });
    }
  }
}

for (const width of [390, 1440]) {
  for (const locale of contract.locales) {
    for (const theme of ['light', 'dark']) {
      test(`theme ${theme} ${locale.lang} ${width}px`, async ({ page }, info) => {
        await page.setViewportSize({ width, height: 1000 });
        await page.addInitScript(value => localStorage.setItem('bin-journal-theme', value), theme);
        for (const route of ['/', '/posts/kaggle-15-cmi/', '/posts/math-riemann-proof-2026/']) {
          await openAndAudit(page, locale.prefix + route, info);
          await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        }
      });
    }
  }
}

for (const locale of contract.locales) {
  for (const width of [contract.limits.desktopContentsAbovePx, contract.limits.desktopContentsAbovePx + 1]) {
    test(`contents breakpoint boundary ${locale.lang} ${width}px`, async ({ page }, info) => {
      await page.setViewportSize({ width, height: 1000 });
      await openAndAudit(page, locale.prefix + '/posts/kaggle-15-cmi/', info);
    });
  }

  test(`finite motion and live reduced-motion changes ${locale.lang}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(locale.prefix + '/');
    await expect(page.locator('[data-home-page]')).toHaveAttribute('data-home-motion', 'ready');
    const timings = await page.evaluate(() => document.getAnimations().map(animation => {
      const timing = animation.effect!.getComputedTiming();
      return Number(timing.endTime);
    }));
    expect(timings.length, 'Homepage entrance effects should be present').toBeGreaterThan(0);
    expect(timings.every(end => Number.isFinite(end) && end <= contract.limits.motionBudgetMs)).toBe(true);
    await page.locator('.closing-note').evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expect.poll(() => page.locator('.closing-note').evaluate(element => element.getAnimations().some(animation => animation.playState === 'running'))).toBe(true);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('[data-home-page]')).toHaveAttribute('data-home-motion', 'reduced');
    await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0);
    await expect(page.locator('.closing-note h2')).toBeVisible();
  });

  test(`reduced motion on entry and readable without JavaScript ${locale.lang}`, async ({ page, browser }) => {
    await page.goto(locale.prefix + '/');
    await expect(page.locator('[data-home-page]')).toHaveAttribute('data-home-motion', 'reduced');
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    const context = await browser.newContext({
      javaScriptEnabled: false, reducedMotion: 'reduce',
      baseURL: String(test.info().project.use.baseURL), viewport: { width: 390, height: 844 },
    });
    try {
      const staticPage = await context.newPage();
      await staticPage.goto(locale.prefix + '/');
      await expect(staticPage.locator('main h1')).toBeVisible();
      await expect(staticPage.locator('.post-card').first()).toBeVisible();
      await staticPage.locator('.post-card h3 a').first().click();
      await expect(staticPage.locator('.article-cover')).toBeVisible();
      await expect(staticPage.locator('.prose')).toBeVisible();
    } finally { await context.close(); }
  });
}

test('auditor detects mixed ratios, chart cropping, excess spacing and page overflow', async ({ page }) => {
  await page.goto('/posts/');
  await page.addStyleTag({ content: '.post-card:has(img:not(.editorial-cover)) .post-cover { aspect-ratio: 1.5; }' });
  expect((await page.evaluate(auditDesign, contract.limits)).some(issue => issue.rule === 'DS-01')).toBe(true);
  await page.goto('/posts/kaggle-15-cmi/');
  await page.addStyleTag({ content: '.research-figure img { object-fit: cover !important; }' });
  expect((await page.evaluate(auditDesign, contract.limits)).some(issue => issue.rule === 'DS-03')).toBe(true);
  await page.addStyleTag({ content: '.article-body .prose > p { margin-bottom: 100px !important; }' });
  expect((await page.evaluate(auditDesign, contract.limits)).some(issue => issue.rule === 'DS-10')).toBe(true);
  await page.addStyleTag({ content: 'body { min-width: 3000px !important; }' });
  expect((await page.evaluate(auditDesign, contract.limits)).some(issue => issue.rule === 'DS-04')).toBe(true);
});
