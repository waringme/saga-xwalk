import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

let carouselId = 0;

/**
 * Wire the previous / next buttons to scroll the track one slide at a time.
 * @param {HTMLElement} block
 * @param {HTMLUListElement} track
 */
function bindNavigation(block, track) {
  const prev = block.querySelector('.carousel-awards-prev');
  const next = block.querySelector('.carousel-awards-next');
  const slides = [...track.children];

  const step = () => (slides.length > 1
    ? slides[1].offsetLeft - slides[0].offsetLeft
    : track.clientWidth);
  const update = () => {
    prev.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    const hidden = track.scrollWidth <= track.clientWidth + 1;
    block.querySelector('.carousel-awards-navigation').hidden = hidden;
    slides.forEach((slide) => {
      const inView = slide.offsetLeft + 1 >= track.scrollLeft
        && slide.offsetLeft + slide.offsetWidth <= track.scrollLeft + track.clientWidth + 1;
      slide.setAttribute('aria-hidden', !inView);
      slide.querySelectorAll('a, button').forEach((el) => {
        if (inView) el.removeAttribute('tabindex');
        else el.setAttribute('tabindex', '-1');
      });
    });
  };

  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));

  let ticking = false;
  track.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => { update(); ticking = false; });
  }, { passive: true });
  new ResizeObserver(update).observe(track);
  update();
}

/**
 * Awards carousel: a row of award badges, several in view at once, scrolled with
 * previous / next arrows. Each row is one slide: [badge image, title + description].
 * @param {Element} block The block element
 */
export default function decorate(block) {
  carouselId += 1;
  const id = `carousel-awards-${carouselId}`;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const track = document.createElement('ul');
  track.className = 'carousel-awards-slides';
  track.id = `${id}-slides`;

  [...block.children].forEach((row, idx) => {
    const slide = document.createElement('li');
    slide.className = 'carousel-awards-slide';
    slide.dataset.slideIndex = idx;
    moveInstrumentation(row, slide);
    [...row.children].forEach((cell) => {
      if (cell.children.length === 1 && cell.querySelector('picture')) {
        cell.className = 'carousel-awards-slide-image';
      } else if (cell.textContent.trim() || cell.querySelector('picture')) {
        cell.className = 'carousel-awards-slide-content';
      } else {
        return;
      }
      slide.append(cell);
    });
    track.append(slide);
  });

  track.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  const container = document.createElement('div');
  container.className = 'carousel-awards-slides-container';
  container.append(track);

  if (track.children.length > 1) {
    const nav = document.createElement('div');
    nav.className = 'carousel-awards-navigation';
    nav.innerHTML = `
      <button type="button" class="carousel-awards-prev" aria-controls="${track.id}" aria-label="Previous awards"></button>
      <button type="button" class="carousel-awards-next" aria-controls="${track.id}" aria-label="Next awards"></button>`;
    container.append(nav);
  }

  block.replaceChildren(container);
  if (track.children.length > 1) bindNavigation(block, track);
}
