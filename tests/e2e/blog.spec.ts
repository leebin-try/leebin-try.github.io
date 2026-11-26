import { expect, test } from '@playwright/test';

test('research report shares the journal theme and keeps evidence navigable', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: '阅读报告' }).click();
  await expect(page).toHaveURL(/\/data-agent-ontology\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Data Agent 与本体');
  await expect(page.locator('.site-header')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const brokenAnchors = await page.locator('.research-report').evaluate(root =>
    [...root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')]
      .filter(a => !document.getElementById(a.hash.slice(1))).map(a => a.hash));
  expect(brokenAnchors).toEqual([]);
  await page.getByRole('button', { name: '切换到深色模式' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('.research-report a[href="#e1"]').first().click();
  await expect(page.locator('#e1')).toBeVisible();
  const markdown = await page.request.get('/data-agent-ontology/report.md');
  expect(markdown.ok()).toBe(true);
});

test('navigation and article reading work without horizontal overflow', async ({ page }, info) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('保持好奇');
  await expect(page.locator('[data-post-card]')).toHaveCount(6);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  if (info.project.name === 'mobile') {
    await page.getByRole('button', { name: '打开导航' }).click();
    await expect(page.locator('#mobile-navigation')).toBeVisible();
    await page.locator('#mobile-navigation').getByRole('link', { name: '关于', exact: true }).click();
  } else {
    await page.locator('.desktop-nav').getByRole('link', { name: '关于', exact: true }).click();
  }
  await expect(page.getByRole('heading', { level: 1 })).toContainText('很高兴你在这里');
  await page.goto('/posts/digital-garden/');
  await expect(page.getByRole('navigation', { name: '文章目录' })).toBeVisible();
  await expect(page.locator('.prose h2')).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('category filters change the visible articles', async ({ page }) => {
  await page.goto('/posts/');
  await page.getByRole('button', { name: /^设计/ }).click();
  await expect(page.locator('[data-post-card]:visible')).toHaveCount(2);
  await expect(page.locator('[data-post-card]:visible').first()).toHaveAttribute('data-category', '设计');
  await page.getByRole('button', { name: /^全部/ }).click();
  await expect(page.locator('[data-post-card]:visible')).toHaveCount(27);
});

test('search returns a real article and handles no matches', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '搜索文章' }).click();
  const input = page.getByRole('searchbox');
  await input.fill('终端');
  await expect(page.locator('.search-result')).toHaveCount(1);
  await expect(page.locator('.search-result')).toContainText('把终端变成自己的工作台');
  await input.fill('a-query-with-no-matching-post');
  await expect(page.locator('#search-results')).toContainText('还没有找到');
  await input.fill('数字花园');
  await page.locator('.search-result').click();
  await expect(page).toHaveURL(/posts\/digital-garden\//);
});

test('theme choice persists across reloads', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '切换到深色模式' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: '切换到浅色模式' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('Kaggle column covers all cases and preserves shared topic links', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.featured-copy .sample-badge')).toHaveCount(0);
  await page.getByRole('link', { name: '进入 Kaggle 专栏' }).click();
  await expect(page).toHaveURL(/\/kaggle\/$/);
  await expect(page.locator('[data-kaggle-case]')).toHaveCount(17);
  await expect(page.locator('.kaggle-state-scored')).toHaveCount(15);
  await expect(page.locator('#methods [data-post-card]')).toHaveCount(3);
  await page.getByRole('button', { name: /^图像分割/ }).click();
  await expect(page.locator('[data-kaggle-case]:visible')).toHaveCount(3);
  expect(new URL(page.url()).searchParams.get('topic')).toBe('图像分割');
  await page.reload();
  await expect(page.getByRole('button', { name: /^图像分割/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-kaggle-count]')).toContainText('3');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('heading', { name: /^Carvana/ }).getByRole('link').click();
  await expect(page.locator('.kaggle-evidence')).toContainText('尚未出分');
  await expect(page.locator('.kaggle-evidence')).toContainText('预检 v1 COMPLETE');
  await expect(page.locator('.demo-note')).toHaveCount(0);
  await page.getByRole('link', { name: '查看公开证据摘要' }).click();
  await expect(page).toHaveURL(/\/kaggle\/sources\/#case-17$/);
  await expect(page.locator('#case-17')).toContainText('正式提交历史为空');
  await expect(page.locator('.kaggle-source-record')).toHaveCount(17);
});

test('Kaggle content is in archive, search, RSS and sitemap', async ({ page }) => {
  await page.goto('/posts/');
  await page.getByRole('button', { name: /^Kaggle/ }).click();
  await expect(page.locator('[data-post-card]:visible')).toHaveCount(20);
  await page.getByRole('button', { name: '搜索文章' }).click();
  await page.getByRole('searchbox').fill('CommonLit');
  await expect(page.locator('.search-result')).toHaveCount(1);
  await page.locator('.search-result').click();
  await expect(page).toHaveURL(/\/posts\/kaggle-16-commonlit\/$/);
  await expect(page.locator('.kaggle-evidence')).toContainText('0.59760 / 0.54871');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const rss = await page.request.get('/rss.xml');
  expect(rss.ok()).toBe(true);
  expect(await rss.text()).toContain('/posts/kaggle-16-commonlit/');
});
