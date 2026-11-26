import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const base = process.env.PREVIEW_URL ?? 'http://127.0.0.1:4321';
const browser = await chromium.launch({
  executablePath: process.env.CHROME_EXECUTABLE ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
await mkdir('docs/previews', { recursive: true });
async function load(page, route) {
  await page.goto(base + route, { waitUntil: 'networkidle' });
  await page.locator('img').evaluateAll(images => images.forEach(image => { image.loading = 'eager'; }));
  await page.evaluate(() => Promise.all([...document.images].map(image => image.decode())));
}
try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await load(desktop, '/kaggle/');
  await desktop.screenshot({ path: 'docs/previews/kaggle-desktop.png', fullPage: true });
  await load(desktop, '/posts/kaggle-15-cmi/');
  await desktop.locator('.research-figure').nth(2).scrollIntoViewIfNeeded();
  await desktop.screenshot({ path: 'docs/previews/kaggle-figures-desktop.png' });
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await load(mobile, '/kaggle/');
  await mobile.screenshot({ path: 'docs/previews/kaggle-mobile.png', fullPage: true });
  await load(mobile, '/posts/kaggle-15-cmi/');
  await mobile.screenshot({ path: 'docs/previews/kaggle-article-mobile.png', fullPage: true });
  console.log('Saved Kaggle hub and measured-figure previews.');
} finally {
  await browser.close();
}
