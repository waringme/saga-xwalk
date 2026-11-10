/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-awards. Base: carousel.
 * Source: travel.saga.co.uk/cruises, selector .carouselLogo .owl-carousel
 * (owl carousel of ~24 award badges: `.owl-item > .item` with an optional linked image,
 * an H5 title and a description paragraph).
 * The cleanup transformer removes .owl-nav, .owl-dots and .owl-item.cloned; clones are also
 * skipped here so the parser is safe on its own. The block draws its own arrows.
 * xwalk model (blocks/carousel-awards/_carousel-awards.json, item carousel-awards-item),
 * one row per award: [media_image (+media_imageAlt) | content_text (title + description)].
 * A badge link (e.g. Which?) cannot live on the image reference, so it is kept on the title.
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

  const owlItems = Array.from(element.querySelectorAll('.owl-item'));
  const items = owlItems.length
    ? owlItems.filter((item) => !item.classList.contains('cloned')).map((item) => item.querySelector('.item') || item)
    : Array.from(element.querySelectorAll('.item'));

  items.forEach((item) => {
    const img = item.querySelector('img');
    const titleEl = item.querySelector('h1, h2, h3, h4, h5, h6');
    const paras = Array.from(item.querySelectorAll('p')).filter((p) => clean(p.textContent));
    const link = img ? img.closest('a[href]') : null;
    const title = titleEl ? clean(titleEl.textContent) : '';
    if (!img && !title && !paras.length) return;

    // Cell 1: badge image
    const imageFrag = document.createDocumentFragment();
    if (img && img.getAttribute('src')) {
      const image = document.createElement('img');
      image.setAttribute('src', absolute(img.getAttribute('src')));
      image.setAttribute('alt', clean(img.getAttribute('alt')) || title);
      imageFrag.appendChild(document.createComment(' field:media_image '));
      imageFrag.appendChild(image);
    }

    // Cell 2: title + description
    const textFrag = document.createDocumentFragment();
    const textNodes = [];
    if (title) {
      const h = document.createElement(titleEl.tagName.toLowerCase());
      if (link) {
        const a = document.createElement('a');
        a.setAttribute('href', absolute(link.getAttribute('href')));
        a.textContent = title;
        h.appendChild(a);
      } else {
        h.textContent = title;
      }
      textNodes.push(h);
    }
    paras.forEach((p) => {
      const para = document.createElement('p');
      para.textContent = clean(p.textContent);
      textNodes.push(para);
    });
    if (textNodes.length) {
      textFrag.appendChild(document.createComment(' field:content_text '));
      textNodes.forEach((n) => textFrag.appendChild(n));
    }

    cells.push([imageFrag, textFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-awards', cells });
  element.replaceWith(block);
}
