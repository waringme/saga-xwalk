import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Article teaser cards. Each row is one card: [image, text]. The text cell holds an
 * optional category eyebrow paragraph, a heading (usually linked) and an optional summary.
 * Option `tiles`: image + title only, no card surface (category tiles).
 * The heading link (or first link) is stretched so the whole card is clickable.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-article-card';
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-article-card-image';
      } else if (!div.textContent.trim() && !div.querySelector('picture')) {
        div.remove();
      } else {
        div.className = 'cards-article-card-body';
      }
    });

    const body = li.querySelector('.cards-article-card-body');
    if (body) {
      const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
      // a short paragraph before the heading is the category eyebrow
      const first = body.firstElementChild;
      if (heading && first && first.tagName === 'P' && !first.contains(heading)) {
        first.classList.add('cards-article-card-category');
      }
      if (heading) heading.classList.add('cards-article-card-title');
      const link = heading?.querySelector('a[href]') || body.querySelector('a[href]');
      if (link) link.classList.add('cards-article-card-link');
    }
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
}
