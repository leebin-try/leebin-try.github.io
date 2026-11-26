import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const figures = JSON.parse(await readFile(path.join(root, 'src/data/kaggle-figures.json'), 'utf8'));
const browser = await chromium.launch({
  executablePath: process.env.CHROME_EXECUTABLE ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 675 }, deviceScaleFactor: 1 });
  for (const figure of figures.filter(item => item.kind === 'original_cover')) {
    const source = path.join(root, 'public', figure.file);
    await page.goto(pathToFileURL(source).href);
    await page.screenshot({ path: source.replace(/\.svg$/, '.png') });
  }
  console.log('Rendered 20 subject-specific social preview images from original SVG sources.');
} finally {
  await browser.close();
}
