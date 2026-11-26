import type contract from '../../design-contract.json';

export interface DesignViolation {
  rule: string;
  element: string;
  detail: string;
}

// This function runs inside the browser. Keep it independent of Node and imports.
export function auditDesign(limits: typeof contract.limits): DesignViolation[] {
  const violations: DesignViolation[] = [];
  const tolerance = limits.geometryTolerancePx;
  const ratio = limits.cardAspectRatio[0]! / limits.cardAspectRatio[1]!;
  const identify = (element: Element) => element.id
    || element.getAttribute('src') || element.getAttribute('href')
    || element.className || element.tagName;
  const fail = (rule: string, element: Element, detail: string) => {
    violations.push({ rule, element: identify(element), detail });
  };
  const visible = (element: Element) => element.getBoundingClientRect().width > 0;

  const root = document.documentElement;
  if (root.scrollWidth - root.clientWidth > tolerance) {
    fail('DS-04', root, `Page overflows by ${root.scrollWidth - root.clientWidth}px`);
  }
  const main = document.querySelector('main');
  if (!main || main.querySelectorAll('h1').length !== 1) {
    fail('DS-07', main ?? root, 'Expected exactly one primary heading inside main');
  }

  document.querySelectorAll<HTMLImageElement>('main img').forEach(image => {
    if (!image.complete || !image.naturalWidth) fail('DS-02', image, 'Image failed to decode');
    if (!(Number(image.getAttribute('width')) > 0 && Number(image.getAttribute('height')) > 0)) {
      fail('DS-02', image, 'Missing positive intrinsic width/height');
    }
    if (!image.hasAttribute('alt')) fail('DS-02', image, 'Missing alt attribute');
    if (image.matches('.article-cover, .research-figure img') && !image.alt.trim()) {
      fail('DS-02', image, 'Informative reading image needs nonempty alternative text');
    }
    if (image.matches('.editorial-cover, .kaggle-case-cover img, .research-figure img')
      && getComputedStyle(image).objectFit !== 'contain') {
      fail('DS-03', image, 'Analytical/editorial image must remain intact with contain');
    }
  });

  document.querySelectorAll('.post-cover, .kaggle-case-cover').forEach(frame => {
    if (!visible(frame)) return;
    const box = frame.getBoundingClientRect();
    if (Math.abs(box.height - box.width / ratio) > tolerance) {
      fail('DS-01', frame, `Expected 16:9 cover, got ${box.width.toFixed(2)}×${box.height.toFixed(2)}`);
    }
    const image = frame.querySelector('img');
    const imageBox = image?.getBoundingClientRect();
    if (!imageBox || Math.abs(imageBox.width - box.width) > tolerance
      || Math.abs(imageBox.height - box.height) > tolerance) {
      fail('DS-01', frame, 'Image element does not fill its cover slot');
    }
  });
  document.querySelectorAll('.post-grid, .kaggle-case-grid').forEach(grid => {
    const style = getComputedStyle(grid);
    for (const gap of [style.rowGap, style.columnGap]) {
      const pixels = parseFloat(gap);
      if (!Number.isFinite(pixels) || pixels < limits.cardGridGapPx[0]! - tolerance
        || pixels > limits.cardGridGapPx[1]! + tolerance) {
        fail('DS-10', grid, `Card grid gap ${gap} is outside the density budget`);
      }
    }
    const boxes = [...grid.querySelectorAll('.post-cover, .kaggle-case-cover')]
      .filter(visible).map(element => element.getBoundingClientRect());
    if (boxes.length < 2) return;
    for (const dimension of ['width', 'height'] as const) {
      const values = boxes.map(box => box[dimension]);
      if (Math.max(...values) - Math.min(...values) > tolerance) {
        fail('DS-01', grid, `Repeated covers have inconsistent ${dimension}`);
      }
    }
  });

  document.querySelectorAll('.article-cover').forEach(cover => {
    const row = cover.closest('.article-shell');
    const box = cover.getBoundingClientRect();
    if (!row || Math.abs(box.width - row.getBoundingClientRect().width) > tolerance) {
      fail('DS-05', cover, 'Reading cover must occupy its full article row');
    }
    if (box.height > limits.articleCoverMaxHeightPx + tolerance) {
      fail('DS-05', cover, 'Reading cover exceeds the height budget');
    }
  });
  document.querySelectorAll('.article-body .prose').forEach(prose => {
    const style = getComputedStyle(prose);
    const fontSize = parseFloat(style.fontSize);
    const lineHeightRatio = parseFloat(style.lineHeight) / fontSize;
    const inRange = (value: number, range: number[]) => value >= range[0]! - .01 && value <= range[1]! + .01;
    if (!inRange(fontSize, limits.bodyFontSizePx) || !inRange(lineHeightRatio, limits.bodyLineHeightRatio)) {
      fail('DS-05', prose, `Reading type is ${fontSize}px / ${lineHeightRatio.toFixed(2)}`);
    }
    if (prose.getBoundingClientRect().width > limits.articleProseMaxWidthPx + tolerance) {
      fail('DS-05', prose, 'Prose exceeds the reading-width budget');
    }
    prose.querySelectorAll(':scope > p').forEach(paragraph => {
      const paragraphStyle = getComputedStyle(paragraph);
      const budget = parseFloat(paragraphStyle.fontSize) * limits.paragraphGapMaxEm;
      if (Math.max(parseFloat(paragraphStyle.marginTop), parseFloat(paragraphStyle.marginBottom)) > budget + tolerance) {
        fail('DS-10', paragraph, 'Paragraph spacing exceeds the reading-density budget');
      }
    });
    prose.querySelectorAll(':scope > h2, :scope > h3').forEach(heading => {
      const headingStyle = getComputedStyle(heading);
      if (Math.max(parseFloat(headingStyle.marginTop), parseFloat(headingStyle.marginBottom)) > limits.sectionHeadingGapMaxPx + tolerance) {
        fail('DS-10', heading, 'Heading spacing exceeds the reading-density budget');
      }
    });
  });
  document.querySelectorAll('.research-figure').forEach(figure => {
    if (!figure.querySelector('figcaption')?.textContent?.trim()) {
      fail('DS-03', figure, 'Analytical figure needs a caption');
    }
  });

  const layout = document.querySelector('.reading-layout');
  if (layout) {
    const sidebar = layout.querySelector('.reading-sidebar');
    const content = layout.querySelector('.reading-main');
    const mobileContents = layout.querySelector('.reading-toc-mobile');
    if (root.clientWidth > limits.desktopContentsAbovePx) {
      if (!sidebar || !content || !visible(sidebar) || getComputedStyle(sidebar).position !== 'sticky'
        || sidebar.getBoundingClientRect().right > content.getBoundingClientRect().left) {
        fail('DS-06', layout, 'Desktop contents must stick to the left without overlapping content');
      }
    } else if ((sidebar && visible(sidebar)) || !mobileContents
      || !visible(mobileContents) || !mobileContents.querySelector('summary')) {
      fail('DS-06', layout, 'Narrow reading pages need expandable contents instead of a sidebar');
    }
  }
  return violations;
}
