const home = document.querySelector<HTMLElement>('[data-home-page]');
if (home) {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const played = new WeakSet<Element>();
  const running = new Set<Animation>();
  let observer: IntersectionObserver | undefined;

  function animate(element: HTMLElement, index: number): void {
    if (preference.matches || played.has(element)) return;
    played.add(element);
    const animation = element.animate([
      { opacity:0.3, transform:'translateY(18px)' },
      { opacity:1, transform:'translateY(0)' },
    ], {
      duration:520,
      delay:index * 55,
      easing:'cubic-bezier(.2,.75,.25,1)',
    });
    running.add(animation);
    const release = () => running.delete(animation);
    animation.addEventListener('finish',release,{once:true});
    animation.addEventListener('cancel',release,{once:true});
  }

  function configure(): void {
    observer?.disconnect();
    running.forEach(animation=>animation.cancel());
    running.clear();
    if (preference.matches) {
      home!.dataset.homeMotion = 'reduced';
      return;
    }
    if (!('IntersectionObserver' in window)) {
      home!.dataset.homeMotion = 'static';
      return;
    }
    home!.dataset.homeMotion = 'ready';
    observer = new IntersectionObserver(entries => {
      entries.filter(entry=>entry.isIntersecting).forEach((entry,index) => {
        animate(entry.target as HTMLElement,Math.min(index,3));
        observer?.unobserve(entry.target);
      });
    },{ threshold:0.08, rootMargin:'0px 0px -24px 0px' });
    // Content is visible by default, including with JavaScript disabled.
    home!.querySelectorAll<HTMLElement>(
      '.featured-section, .kaggle-entry, .research-entry, .latest-section .section-heading, .post-card, .closing-note',
    ).forEach(element=>observer!.observe(element));
  }

  configure();
  preference.addEventListener('change',configure);
}
