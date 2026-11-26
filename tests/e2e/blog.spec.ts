import { expect, test, type Page } from '@playwright/test';
const browserErrors = new WeakMap<Page,string[]>();
test.beforeEach(({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page,errors);
  page.on('pageerror',error=>errors.push(error.message));
});
test.afterEach(({ page }) => { expect(browserErrors.get(page)).toEqual([]); });

test('English is the default and language links retain the current page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await expect(page.getByRole('heading',{level:1})).toContainText('Stay curious');
  await page.locator('[data-language="zh"]').click();
  await expect(page).toHaveURL(/\/zh\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang','zh-CN');
  await expect(page.getByRole('heading',{level:1})).toContainText('保持好奇');
  await page.goto('/posts/kaggle-16-commonlit/');
  await page.locator('[data-language="zh"]').click();
  await expect(page).toHaveURL(/\/zh\/posts\/kaggle-16-commonlit\/$/);
  await expect(page.locator('.prose')).toContainText('全体对齐 OOF');
  await page.locator('[data-language="en"]').click();
  await expect(page).toHaveURL(/\/posts\/kaggle-16-commonlit\/$/);
  await expect(page.locator('.prose')).toContainText('0.577645');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://leebin-try.github.io/posts/kaggle-16-commonlit/');
  await expect(page.locator('link[hreflang="zh-CN"]')).toHaveAttribute('href','https://leebin-try.github.io/zh/posts/kaggle-16-commonlit/');
});

test('navigation, category filters and search stay in the selected language', async ({ page }, info) => {
  for (const zh of [false,true]) {
    const prefix=zh?'/zh':'';
    await page.goto(prefix+'/');
    await expect(page.locator('[data-post-card]')).toHaveCount(6);
    if(info.project.name==='mobile') {
      await page.getByRole('button',{name:zh?'打开导航':'Open navigation',exact:true}).click();
      await page.locator('#mobile-navigation').getByRole('link',{name:zh?'关于':'About',exact:true}).click();
    } else await page.locator('.desktop-nav').getByRole('link',{name:zh?'关于':'About',exact:true}).click();
    await expect(page).toHaveURL(new RegExp(prefix+'/about/$'));
    await page.goto(prefix+'/posts/');
    await page.getByRole('button',{name:zh?/^设计/:/^Design/}).click();
    await expect(page.locator('[data-post-card]:visible')).toHaveCount(2);
    await page.getByRole('button',{name:zh?/^全部/:/^All/}).click();
    await expect(page.locator('[data-post-card]:visible')).toHaveCount(28);
    await page.getByRole('button',{name:zh?'搜索文章':'Search articles',exact:true}).click();
    await page.getByRole('searchbox').fill('CommonLit');
    await expect(page.locator('.search-result')).toHaveCount(1);
    await page.locator('.search-result').click();
    await expect(page).toHaveURL(new RegExp(prefix+'/posts/kaggle-16-commonlit/$'));
    await page.getByRole('button',{name:zh?'搜索文章':'Search articles',exact:true}).click();
    await page.getByRole('searchbox').fill('no-results-at-all-739502');
    await expect(page.locator('#search-results')).toContainText(zh?'还没有找到':'No articles found');
    await page.keyboard.press('Escape');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
  }
});

test('Kaggle filtering survives a language switch and evidence remains accessible', async ({ page }) => {
  await page.goto('/kaggle/');
  await expect(page.locator('[data-kaggle-case]')).toHaveCount(17);
  await expect(page.locator('.kaggle-state-scored')).toHaveCount(15);
  await expect(page.locator('#methods [data-post-card]')).toHaveCount(3);
  await page.getByRole('button',{name:/^Image segmentation/}).click();
  await expect(page.locator('[data-kaggle-case]:visible')).toHaveCount(3);
  await page.locator('[data-language="zh"]').click();
  expect(new URL(page.url()).searchParams.get('topic')).toBe('图像分割');
  await expect(page.getByRole('button',{name:/^图像分割/})).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('[data-kaggle-case]:visible')).toHaveCount(3);
  await page.getByRole('heading',{name:/^Carvana/}).getByRole('link').click();
  await expect(page.locator('.kaggle-evidence')).toContainText('尚未出分');
  await page.getByRole('link',{name:'查看公开证据摘要',exact:true}).click();
  await expect(page).toHaveURL(/\/zh\/kaggle\/sources\/#case-17$/);
  await expect(page.locator('#case-17')).toContainText('正式提交历史为空');
  await page.locator('[data-language="en"]').click();
  await expect(page).toHaveURL(/\/kaggle\/sources\/#case-17$/);
  await expect(page.locator('#case-17')).toContainText('no formal submission or official score');
});

async function openContents(page: Page, mobile: boolean) {
  if(mobile) {
    const toc=page.locator('.reading-toc-mobile');
    await toc.locator('summary').click();
    return toc;
  }
  return page.locator('.reading-sidebar .reading-toc');
}

test('left sticky contents jump, track the section and map it to the other language', async ({ page }, info) => {
  const mobile=info.project.name==='mobile';
  await page.goto('/posts/kaggle-15-cmi/');
  const toc=await openContents(page,mobile);
  const link=toc.getByRole('link',{name:'Evaluation',exact:true});
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading',{name:'Evaluation',exact:true})).toBeInViewport();
  await expect(link).toHaveAttribute('aria-current','location');
  if(!mobile) {
    const sidebar=await page.locator('.reading-sidebar').boundingBox();
    const article=await page.locator('.article-shell').boundingBox();
    expect(sidebar!.x+sidebar!.width).toBeLessThan(article!.x);
    expect(sidebar!.y).toBeGreaterThanOrEqual(20);
    expect(sidebar!.y).toBeLessThanOrEqual(28);
  }
  await page.locator('[data-language="zh"]').click();
  await expect(page).toHaveURL(/\/zh\/posts\/kaggle-15-cmi\/#/);
  expect(decodeURIComponent(new URL(page.url()).hash)).toBe('#评价方式');
  await expect(page.getByRole('heading',{name:'评价方式',exact:true})).toBeInViewport();
  const chineseToc=await openContents(page,mobile);
  await chineseToc.getByRole('link',{name:'思考与结论',exact:true}).click();
  await expect(page.getByRole('heading',{name:'思考与结论',exact:true})).toBeInViewport();
  await expect(chineseToc.getByRole('link',{name:'思考与结论',exact:true})).toHaveAttribute('aria-current','location');
});

test('covers fill the article row and metric figures remain readable and downloadable', async ({ page }, info) => {
  await page.goto('/posts/kaggle-15-cmi/');
  const cover=await page.locator('.article-cover').boundingBox();
  const article=await page.locator('.article-shell').boundingBox();
  expect(cover!.width/article!.width).toBeGreaterThan(.98);
  expect(cover!.height).toBeGreaterThan(info.project.name==='mobile'?170:350);
  await expect(page.locator('.article-cover-figure figcaption')).toContainText('Original');
  await expect(page.locator('.research-figure')).toHaveCount(3);
  await page.locator('.research-figure img').evaluateAll(images=>images.forEach(image=>{(image as HTMLImageElement).loading='eager';}));
  expect(await page.locator('.research-figure img').evaluateAll(async images=>{
    await Promise.all(images.map(image=>(image as HTMLImageElement).decode()));
    return images.every(image=>(image as HTMLImageElement).naturalWidth>0);
  })).toBe(true);
  const csv=await page.request.get('/kaggle/15/confusion.csv');
  expect(csv.ok()).toBe(true);
  expect(await csv.text()).toContain('3,3,0');
  const manifest=await (await page.request.get('/kaggle/figures.json')).json() as Array<{kind:string}>;
  expect(manifest.filter(f=>f.kind==='recorded_aggregate_metrics')).toHaveLength(16);
  expect(await page.locator('meta[property="og:image"]').getAttribute('content')).toContain('/kaggle/15/cover.png');
  await page.goto('/kaggle/');
  const image=await page.locator('.kaggle-case-cover img').first().boundingBox();
  const card=await page.locator('[data-kaggle-case]').first().boundingBox();
  expect(image!.width/card!.width).toBeGreaterThan(.95);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
});

test('theme preference persists and labels follow the page language', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button',{name:'Switch to dark mode',exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.locator('[data-language="zh"]').click();
  await expect(page.getByRole('button',{name:'切换到浅色模式',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'切换到浅色模式',exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
});

test('both research editions retain evidence anchors and a working contents outline', async ({ page }, info) => {
  for(const zh of [false,true]) {
    const prefix=zh?'/zh':'';
    await page.goto(prefix+'/data-agent-ontology/');
    await expect(page.getByRole('heading',{level:1})).toContainText(zh?'Data Agent 与本体':'Data agents and ontologies');
    const toc=await openContents(page,info.project.name==='mobile');
    await toc.locator('a[href="#results"]').click();
    await expect(page.locator('#results')).toBeInViewport();
    const broken=await page.locator('.research-report').evaluate(root=>[...root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')].filter(a=>!document.getElementById(decodeURIComponent(a.hash.slice(1)))).map(a=>a.hash));
    expect(broken).toEqual([]);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
    const markdown=await page.request.get(zh?'/data-agent-ontology/report.md':'/data-agent-ontology/report-en.md');
    expect(markdown.ok()).toBe(true);
    expect(await markdown.text()).toContain('73.00%');
  }
});

test('search, RSS and sitemap expose language-specific content without duplicates', async ({ page }) => {
  for(const zh of [false,true]) {
    const prefix=zh?'/zh':'';
    const index=await (await page.request.get(prefix+'/search.json')).json() as Array<{url:string;title:string}>;
    expect(index).toHaveLength(28);
    expect(new Set(index.map(p=>p.url)).size).toBe(28);
    expect(index.every(p=>p.url.startsWith(prefix+'/posts/'))).toBe(true);
    const rss=await (await page.request.get(prefix+'/rss.xml')).text();
    expect(rss).toContain(`<language>${zh?'zh-cn':'en'}</language>`);
    expect(rss).toContain(prefix+'/posts/kaggle-16-commonlit/');
  }
  const sitemap=await (await page.request.get('/sitemap-0.xml')).text();
  expect(sitemap).toContain('/posts/kaggle-16-commonlit/');
  expect(sitemap).toContain('/zh/posts/kaggle-16-commonlit/');
});
