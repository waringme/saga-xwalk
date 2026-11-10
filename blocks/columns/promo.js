import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Columns (promo) variant: side-by-side offers, each column holding an image, heading, text,
 * a primary call to action and an optional secondary link.
 * Every row is a set of columns; a picture-only cell becomes the column image.
 * @param {Element} block The block element
 */
export default function decoratePromo(block) {
  const cols = [...(block.firstElementChild?.children || [])];
  block.classList.add(`columns-promo-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    row.classList.add('columns-promo-row');
    [...row.children].forEach((col) => {
      col.classList.add('columns-promo-col');
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is the only content in the column
          picWrapper.classList.add('columns-promo-img-col');
        } else {
          const picParent = pic.parentElement;
          if (picParent && picParent.tagName === 'P' && picParent.children.length === 1) {
            picParent.classList.add('columns-promo-image');
          }
        }
      }
      // standalone links: with several, the last is the secondary link and the
      // others are primary buttons; a single one is an arrow link
      const ctas = [...col.querySelectorAll(':scope > p')].filter((p) => p.children.length === 1
        && p.firstElementChild.tagName === 'A'
        && p.textContent.trim() === p.firstElementChild.textContent.trim());
      if (ctas.length > 1) {
        ctas.forEach((p, i) => p.classList.add(i === ctas.length - 1
          ? 'columns-promo-secondary' : 'columns-promo-primary'));
      } else if (ctas.length === 1) {
        ctas[0].classList.add('columns-promo-link');
      }
    });
    // a row with an image-only column renders as a grey image + text card
    if (row.querySelector(':scope > .columns-promo-img-col')) row.classList.add('columns-promo-card');
  });

  block.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
}
