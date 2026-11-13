import { expect, test } from '@playwright/test';

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
  await expect(page.locator('[data-post-card]:visible')).toHaveCount(7);
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
