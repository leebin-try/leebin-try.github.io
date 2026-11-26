import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});
await mkdir('docs/previews', { recursive: true });
try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
  await desktop.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
  await desktop.locator('img').evaluateAll(images => images.forEach(image => { image.loading = 'eager'; }));
  await desktop.evaluate(() => Promise.all(Array.from(document.images, image => image.decode().catch(() => undefined))));
  await desktop.screenshot({ path: 'docs/previews/home-desktop.png', fullPage: true });
  await desktop.screenshot({ path: 'docs/previews/home-first-screen.png' });
  await desktop.getByRole('button', { name: 'Switch to dark mode' }).click();
  await desktop.screenshot({ path: 'docs/previews/home-dark.png', fullPage: true });
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await mobile.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
  await mobile.locator('img').evaluateAll(images => images.forEach(image => { image.loading = 'eager'; }));
  await mobile.evaluate(() => Promise.all(Array.from(document.images, image => image.decode().catch(() => undefined))));
  await mobile.screenshot({ path: 'docs/previews/home-mobile.png', fullPage: true });
  await mobile.goto('http://127.0.0.1:4321/posts/digital-garden/', { waitUntil: 'networkidle' });
  await mobile.screenshot({ path: 'docs/previews/article-mobile.png', fullPage: true });
  console.log('Preview screenshots saved in docs/previews');
} finally {
  await browser.close();
}
