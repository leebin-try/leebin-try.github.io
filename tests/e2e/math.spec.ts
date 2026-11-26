import { expect, test } from '@playwright/test';

test('Math is reachable, localized and filterable in the archive', async ({ page }, info) => {
  for (const prefix of ['', '/zh']) {
    await page.goto(prefix + '/');
    await page.locator('.math-entry .text-link').click();
    await expect(page).toHaveURL(new RegExp(prefix + '/math/$'));
    await expect(page.locator('main h1')).toContainText(prefix ? '读懂证明' : 'Understand the proof');
    await page.locator('.math-hub .featured-story').click();
    await expect(page).toHaveURL(new RegExp(prefix + '/posts/math-riemann-proof-2026/$'));
    await expect(page.locator('.math-evidence')).toContainText('2026-11-26');
    await page.locator('.article-back').click();
    await expect(page).toHaveURL(new RegExp(prefix + '/math/$'));
    await page.goto(prefix + '/posts/?category=Math');
    await expect(page.getByRole('button', { name: /^Math/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-post-card]:visible')).toHaveCount(1);
  }
  if (info.project.name === 'mobile') {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    await expect(page.locator('#mobile-navigation').getByRole('link', { name: 'Math', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
});

test('mathematical displays, sources and numerical data survive both editions', async ({ page }) => {
  for (const prefix of ['', '/zh']) {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(prefix + '/posts/math-riemann-proof-2026/');
    expect(await page.locator('.prose .katex-display').count()).toBeGreaterThan(20);
    expect(await page.locator('.prose .katex-mathml math').count()).toBeGreaterThan(50);
    await expect(page.locator('.katex-error, .language-math')).toHaveCount(0);
    await expect(page.locator('.prose > h2')).toHaveCount(18);
    await expect(page.locator('.research-figure')).toHaveCount(4);
    expect(await page.locator('.prose a[href*="/blob/72fead102f663d5c7a407964a13dc0cf9d977207/"]').count()).toBeGreaterThan(10);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    expect(errors).toEqual([]);
  }
  const data = await page.request.get('/math/riemann-2026/prime-powers.csv');
  expect(data.ok()).toBe(true);
  expect(await data.text()).toContain('100000,100051.564025658,51.564025658,0.163059766');
  const manifest = await (await page.request.get('/math/riemann-2026/manifest.json')).json();
  expect(manifest.proofCommit).toBe('72fead102f663d5c7a407964a13dc0cf9d977207');
});

test('a long proof section maps through the language switch and equations work without JavaScript', async ({ page, browser }, info) => {
  await page.goto('/posts/math-riemann-proof-2026/');
  const toc = info.project.name === 'mobile' ? page.locator('.reading-toc-mobile') : page.locator('.reading-sidebar');
  if (info.project.name === 'mobile') await toc.locator('summary').click();
  await toc.getByRole('link', { name: '8. Work through the algebra of the main inequality', exact: true }).click();
  await expect(page.getByRole('heading', { name: '8. Work through the algebra of the main inequality', exact: true })).toBeInViewport();
  await page.locator('a[data-language="zh"]').click();
  await expect(page.getByRole('heading', { name: '8. 主不等式的代数，可以亲手推到最后', exact: true })).toBeInViewport();
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL: String(info.project.use.baseURL) });
  try {
    const staticPage = await context.newPage();
    await staticPage.goto('/posts/math-riemann-proof-2026/');
    await expect(staticPage.locator('.katex-display').first()).toBeVisible();
    await expect(staticPage.locator('.katex-mathml math').first()).toBeAttached();
    await staticPage.locator('a[data-language="zh"]').click();
    await expect(staticPage.locator('html')).toHaveAttribute('lang', 'zh-CN');
  } finally { await context.close(); }
});
