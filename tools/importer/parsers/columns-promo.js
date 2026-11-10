/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-promo. Base: columns.
 * Source: travel.saga.co.uk/cruises. Two source shapes:
 *  A) `.podBlock .grouper-pod` (2027 promos): one `.pod` per offer, each with a linked
 *     image, H3, paragraph(s), a `.btn` "Book now" link and a secondary text link.
 *     -> one row, one cell per offer: image, heading, text, primary link, secondary link.
 *  B) `.podBlock .componentCard.fullWidth` ("Love your first cruise", "Follow us on Facebook"):
 *     `.componentCard_image` + `.componentCard_content` (H3, description, `.linkCircle` link).
 *     -> one row of two cells: [image | heading, text, link].
 * xwalk: columns blocks (core/franklin/components/columns) carry no field hints.
 * The empty overlay link around the pod image is not rebuilt: the same URL is on "Book now".
 */
const clean = (text) => (text || '').replace(/\s+/g, ' ').trim();

const absolute = (url) => {
  const value = (url || '').trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value.replace(/^(https?:\/\/[^/:]+):443(?=\/)/i, '$1');
  if (value.startsWith('//')) return `https:${value}`;
  if (value.startsWith('/')) return `https://travel.saga.co.uk${value}`;
  return value;
};

export default function parse(element, { document }) {
  const cells = [];

  const image = (img) => {
    if (!img || !img.getAttribute('src')) return null;
    const el = document.createElement('img');
    el.setAttribute('src', absolute(img.getAttribute('src')));
    el.setAttribute('alt', clean(img.getAttribute('alt')));
    return el;
  };

  const heading = (h) => {
    if (!h || !clean(h.textContent)) return null;
    const el = document.createElement('h3');
    el.textContent = clean(h.textContent);
    return el;
  };

  const linkPara = (a) => {
    if (!a || !a.getAttribute('href') || !clean(a.textContent)) return null;
    const p = document.createElement('p');
    const link = document.createElement('a');
    link.setAttribute('href', absolute(a.getAttribute('href')));
    link.textContent = clean(a.textContent);
    p.appendChild(link);
    return p;
  };

  // body paragraphs, keeping their inline links
  const paragraphs = (scope) => Array.from(scope.querySelectorAll('p'))
    .filter((p) => clean(p.textContent))
    .map((p) => {
      p.querySelectorAll('a[href]').forEach((a) => a.setAttribute('href', absolute(a.getAttribute('href'))));
      return p;
    });

  const card = element.classList.contains('componentCard')
    ? element
    : element.querySelector('.componentCard');

  if (card) {
    // Shape B: [image | text]
    const imageCell = [];
    const img = image(card.querySelector('.componentCard_image img'));
    if (img) imageCell.push(img);

    const textCell = [];
    const content = card.querySelector('.componentCard_content') || card;
    const h = heading(content.querySelector('h1, h2, h3, h4, h5, h6'));
    if (h) textCell.push(h);
    textCell.push(...paragraphs(content.querySelector('.description') || content));
    const cta = linkPara(content.querySelector(':scope > a[href]'));
    if (cta) textCell.push(cta);

    cells.push([imageCell, textCell]);
  } else {
    // Shape A: one cell per offer pod
    const pods = Array.from(element.querySelectorAll('.pod'))
      .filter((pod, i, all) => !all.some((other) => other !== pod && other.contains(pod)));
    const row = pods.map((pod) => {
      const cell = [];
      const imgHolder = pod.querySelector('.imgHolder');
      const img = image((imgHolder && imgHolder.querySelector('img')) || pod.querySelector('img'));
      if (img) {
        const p = document.createElement('p');
        p.appendChild(img);
        cell.push(p);
      }
      const h = heading(pod.querySelector('h1, h2, h3, h4, h5, h6'));
      if (h) cell.push(h);
      const body = imgHolder ? imgHolder.parentElement : pod;
      cell.push(...paragraphs(body).filter((p) => !p.closest('.btn-group')));
      // primary button(s), then the standalone secondary link(s)
      Array.from(pod.querySelectorAll('.btn-group a[href]')).forEach((a) => {
        const p = linkPara(a);
        if (p) cell.push(p);
      });
      Array.from(pod.querySelectorAll('a[href]'))
        .filter((a) => !a.closest('.btn-group') && !a.closest('p') && !a.closest('.imgHolder')
          && !a.closest('h1, h2, h3, h4, h5, h6'))
        .forEach((a) => {
          const p = linkPara(a);
          if (p) cell.push(p);
        });
      return cell;
    });
    if (row.length) cells.push(row);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-promo', cells });
  element.replaceWith(block);
}
