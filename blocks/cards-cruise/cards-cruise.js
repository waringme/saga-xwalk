import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Sort a card's cells into image / body / offer / price.
 * Authored order is [image, text, offer, price]; offer and price are optional.
 * With only two text cells they are read as [text, price].
 * @param {HTMLElement} li
 */
function decorateCard(li) {
  const cells = [...li.children];
  const image = cells.find((c) => c.children.length === 1 && c.querySelector('picture'));
  const rest = cells.filter((c) => c !== image);
  let body;
  let offer;
  let price;
  if (rest.length === 2) [body, price] = rest;
  else [body, offer, price] = rest;

  if (image) image.className = 'cards-cruise-card-image';
  if (body) {
    body.className = 'cards-cruise-card-body';
    const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) heading.classList.add('cards-cruise-card-title');
    const link = heading?.querySelector('a[href]') || body.querySelector('a[href]');
    if (link) link.classList.add('cards-cruise-card-link');
    // text lines after the title: region, "Departs: ...", nights
    const lines = [...body.querySelectorAll(':scope > p')];
    const departure = lines.find((p) => /^\s*depart/i.test(p.textContent));
    if (lines[0] && lines[0] !== departure) lines[0].classList.add('cards-cruise-card-place');
    if (departure) departure.classList.add('cards-cruise-card-departure');
  }
  if (offer) {
    offer.className = 'cards-cruise-card-offer';
    if (!offer.textContent.trim()) offer.remove();
  }
  if (price) {
    price.className = 'cards-cruise-card-price';
    if (!price.textContent.trim()) price.remove();
  }
  rest.slice(3).forEach((c) => { if (!c.textContent.trim()) c.remove(); });
}

/**
 * Previous / next controls with an "n of N" status, where n is the last card in view.
 * @param {HTMLUListElement} track
 * @returns {HTMLElement}
 */
function buildControls(track) {
  const controls = document.createElement('div');
  controls.className = 'cards-cruise-controls';
  controls.innerHTML = `
    <button type="button" class="cards-cruise-prev" aria-label="Previous cruises"></button>
    <span class="cards-cruise-status" aria-live="polite"></span>
    <button type="button" class="cards-cruise-next" aria-label="Next cruises"></button>`;
  const prev = controls.querySelector('.cards-cruise-prev');
  const next = controls.querySelector('.cards-cruise-next');
  const status = controls.querySelector('.cards-cruise-status');
  const cards = [...track.children];
  const total = cards.length;

  const step = () => {
    if (cards.length < 2) return track.clientWidth;
    return cards[1].offsetLeft - cards[0].offsetLeft;
  };
  const visibleCount = () => Math.max(1, Math.round(track.clientWidth / (step() || 1)));
  const firstIndex = () => {
    const idx = cards.findIndex((card) => card.offsetLeft + 1 >= track.scrollLeft);
    return idx < 0 ? 0 : idx;
  };

  const update = () => {
    const visible = visibleCount();
    const first = firstIndex();
    const last = Math.min(first + visible, total);
    status.textContent = `${last} of ${total}`;
    prev.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    controls.hidden = total <= visible;
  };

  const go = (dir) => {
    const target = cards[Math.max(0, Math.min(total - 1, firstIndex() + dir))];
    track.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
  };
  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));

  let ticking = false;
  track.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => { update(); ticking = false; });
  }, { passive: true });
  new ResizeObserver(update).observe(track);
  update();

  return controls;
}

/**
 * Cruise product cards in a horizontally scrolling row. Each row is one card:
 * [image, text (title link, region, departure, nights), offer badge, price + small print].
 * The block draws its own previous/next arrows and "n of N" counter.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'cards-cruise-track';
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-cruise-card';
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    decorateCard(li);
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.replaceChildren(ul);
  if (ul.children.length > 1) block.append(buildControls(ul));
}
