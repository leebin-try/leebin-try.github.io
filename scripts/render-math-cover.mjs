import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const localChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  ?? (existsSync(localChrome) ? localChrome : undefined);
const source = fileURLToPath(new URL('../public/math/riemann-2026/cover.svg', import.meta.url));
const browser = await chromium.launch(executablePath ? { executablePath } : {});
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 675 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(source).href);
  await page.screenshot({ path: source.replace(/\.svg$/, '.png') });
  console.log('Rendered the original Math social cover at 1200×675.');
} finally {
  await browser.close();
}
