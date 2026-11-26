import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';

const localChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  ?? (existsSync(localChrome) ? localChrome : undefined);
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const base = process.env.PREVIEW_URL ?? 'http://127.0.0.1:4321';
await mkdir('docs/previews', { recursive: true });
try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  await desktop.goto(base + '/math/', { waitUntil: 'networkidle' });
  await desktop.screenshot({ path: 'docs/previews/math-desktop.png' });
  await desktop.goto(base + '/zh/posts/math-riemann-proof-2026/', { waitUntil: 'networkidle' });
  await desktop.screenshot({ path: 'docs/previews/math-article-desktop.png' });
  await desktop.locator('.prose > h2').nth(7).evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'start' }));
  await desktop.screenshot({ path: 'docs/previews/math-derivation-desktop.png' });
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  await mobile.goto(base + '/zh/posts/math-riemann-proof-2026/', { waitUntil: 'networkidle' });
  await mobile.screenshot({ path: 'docs/previews/math-article-mobile.png' });
  await mobile.locator('.prose > h2').nth(7).evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'start' }));
  await mobile.getByRole('button', { name: '切换到深色模式', exact: true }).click();
  await mobile.locator('.prose > h2').nth(7).evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'start' }));
  await mobile.screenshot({ path: 'docs/previews/math-derivation-dark-mobile.png' });
  console.log('Saved five Math hub and article previews, including derivation and dark mobile reading.');
} finally {
  await browser.close();
}
