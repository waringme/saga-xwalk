/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-image-panel. Base: columns.
 * Source: travel.saga.co.uk/cruises, selector .fullwidthimageComponent
 * (`.fullwidthimageComponent_image` img, `.fullwidthimageComponent_header` H3, and
 * `.fullwidthimageComponent_content` with a description and an optional `.linkCircle` link).
 * `.contentRight` puts the text panel on the right; without it the panel is on the left.
 * Content model (blocks/columns-image-panel/README.md): one row of two cells; the cell order
 * sets the panel side: [image | text] = panel right, [text | image] = panel left.
 * xwalk: columns blocks (core/franklin/components/columns) carry no field hints.
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

  // Image cell
  const imageCell = [];
  const src = element.querySelector('.fullwidthimageComponent_image img') || element.querySelector('img');
  if (src && src.getAttribute('src')) {
    const img = document.createElement('img');
    img.setAttribute('src', absolute(src.getAttribute('src')));
    img.setAttribute('alt', clean(src.getAttribute('alt')));
    imageCell.push(img);
  }

  // Text cell: heading, paragraph(s) with inline links, optional standalone CTA link
  const textCell = [];
  const header = element.querySelector('.fullwidthimageComponent_header') || element;
  const headingSrc = header.querySelector('h1, h2, h3, h4, h5, h6');
  if (headingSrc && clean(headingSrc.textContent)) {
    const h3 = document.createElement('h3');
    h3.textContent = clean(headingSrc.textContent);
    textCell.push(h3);
  }
  const content = element.querySelector('.fullwidthimageComponent_content') || element;
  Array.from(content.querySelectorAll('p'))
    .filter((p) => clean(p.textContent))
    .forEach((p) => {
      p.querySelectorAll('a[href]').forEach((a) => a.setAttribute('href', absolute(a.getAttribute('href'))));
      textCell.push(p);
    });
  Array.from(content.querySelectorAll('a[href]'))
    .filter((a) => !a.closest('p') && clean(a.textContent))
    .forEach((a) => {
      const p = document.createElement('p');
      const link = document.createElement('a');
      link.setAttribute('href', absolute(a.getAttribute('href')));
      link.textContent = clean(a.textContent);
      p.appendChild(link);
      textCell.push(p);
    });

  const panelRight = element.classList.contains('contentRight');
  cells.push(panelRight ? [imageCell, textCell] : [textCell, imageCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-image-panel', cells });
  element.replaceWith(block);
}
