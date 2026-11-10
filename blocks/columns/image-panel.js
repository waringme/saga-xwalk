import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Columns (imagepanel) variant: a full-width photo with a heading tab above the photo edge and a
 * text panel overlapping the photo on one side.
 * Content model: one row with an image cell and a text cell. The cell order sets the
 * panel side: [image | text] = panel on the right, [text | image] = panel on the left.
 * @param {Element} block The block element
 */
export default function decorateImagePanel(block) {
  const row = block.firstElementChild;
  if (!row) return;
  row.classList.add('columns-image-panel-row');

  const cells = [...row.children];
  const isImageCell = (cell) => cell.querySelector('picture, img')
    && !cell.querySelector('h1, h2, h3, h4, h5, h6')
    && cell.textContent.trim() === '';
  const imageCell = cells.find(isImageCell);
  const textCell = cells.find((cell) => cell !== imageCell);

  const side = imageCell && textCell
    && cells.indexOf(textCell) < cells.indexOf(imageCell) ? 'left' : 'right';
  block.classList.add(`columns-image-panel-${side}`);

  const parts = [];

  if (textCell) {
    const heading = textCell.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) {
      const headingWrap = document.createElement('div');
      headingWrap.className = 'columns-image-panel-heading';
      headingWrap.append(heading);
      parts.push(headingWrap);
    }
  }

  if (imageCell) {
    imageCell.className = 'columns-image-panel-media';
    parts.push(imageCell);
  }

  if (textCell) {
    textCell.className = 'columns-image-panel-content';
    // a paragraph holding only a link is the call to action
    textCell.querySelectorAll(':scope > p').forEach((p) => {
      const link = p.querySelector(':scope > a, :scope > strong > a, :scope > em > a');
      if (link && p.textContent.trim() === link.textContent.trim()) {
        p.classList.add('columns-image-panel-cta');
      }
    });
    if (textCell.children.length || textCell.textContent.trim()) parts.push(textCell);
  }

  row.replaceChildren(...parts);

  // extra rows are not part of the content model
  [...block.children].slice(1).forEach((extra) => extra.remove());

  block.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 900px)', width: '2000' }, { width: '750' }]));
  });
}
