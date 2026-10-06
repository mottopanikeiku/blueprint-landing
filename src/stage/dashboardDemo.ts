import { gsap } from 'gsap';

/** Centre of `el` in the coordinate space of `root` (layout px, unaffected by the monitor's scale). */
function centerIn(el: HTMLElement, root: HTMLElement): { x: number; y: number } {
  let x = el.offsetWidth / 2;
  let y = el.offsetHeight / 2;
  let node: HTMLElement | null = el;
  while (node && node !== root) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

/**
 * Once we have pulled back to the monitor, a cursor works the dashboard on a
 * loop: hides and shows the HVAC and parking layers, clears a review item,
 * shows an export illustration. No file is generated. Layer visibility is a class on the drawing, so it never
 * fights the scroll timelines that own the drawing's inline styles.
 */
export function createDashboardDemo(svg: SVGSVGElement) {
  const chrome = document.querySelector<HTMLElement>('.chrome')!;
  const cursor = chrome.querySelector<SVGSVGElement>('.chrome-cursor')!;
  const download = chrome.querySelector<HTMLElement>('[data-demo="download"]')!;
  const review = chrome.querySelector<HTMLElement>('[data-demo="review"]')!;
  const toast = chrome.querySelector<HTMLElement>('.chrome-toast')!;
  const groups = ['mech', 'pkng'];

  const reset = () => {
    for (const g of groups) svg.classList.remove(`off-${g}`);
    chrome.querySelectorAll('li.off').forEach((li) => li.classList.remove('off'));
    review.classList.remove('done');
    download.classList.remove('flash');
    toast.classList.remove('show');
  };

  // The cursor's hot spot is at (4, 3) in its own box.
  const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1 });
  const moveTo = (el: HTMLElement) =>
    tl.to(cursor, {
      x: () => centerIn(el, chrome).x - 4,
      y: () => centerIn(el, chrome).y - 3,
      duration: 0.9,
      ease: 'power2.inOut',
    });
  const click = () => tl.to(cursor, { scale: 0.78, duration: 0.09, yoyo: true, repeat: 1, transformOrigin: '4px 3px' });
  const hold = (s: number) => tl.to({}, { duration: s });

  tl.call(reset);
  tl.fromTo(
    cursor,
    { x: () => chrome.offsetWidth * 0.55, y: () => chrome.offsetHeight * 0.6, opacity: 0 },
    { opacity: 1, duration: 0.4 },
  );
  for (const g of groups) {
    const rows = [...chrome.querySelectorAll<HTMLElement>(`li[data-group="${g}"]`)];
    moveTo(rows[0].querySelector<HTMLElement>('.eye')!);
    click();
    tl.call(() => {
      svg.classList.add(`off-${g}`);
      rows.forEach((r) => r.classList.add('off'));
    });
    hold(1.3);
    click();
    tl.call(() => {
      svg.classList.remove(`off-${g}`);
      rows.forEach((r) => r.classList.remove('off'));
    });
    hold(0.5);
  }
  moveTo(review);
  click();
  tl.call(() => review.classList.add('done'));
  hold(0.7);
  moveTo(download);
  click();
  tl.call(() => {
    download.classList.add('flash');
    toast.classList.add('show');
  });
  hold(1.6);
  tl.to(cursor, { opacity: 0, duration: 0.4 });

  return {
    play: () => tl.restart(),
    stop: () => {
      tl.pause(0);
      gsap.set(cursor, { opacity: 0 });
      reset();
    },
  };
}
