/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-article. Base: cards.
 * Model (blocks/cards-article/_cards-article.json, item cards-article-item), one row per card:
 *   [image (+imageAlt), text (category eyebrow, linked title, summary)]
 * Block-level `classes` select: '' (default) or 'tiles'.
 *
 * Three source shapes, detected from the element itself:
 *   a. blog-article related teasers: .relatedBlogs ul.list-unstyled > li.blogEntry
 *      (image + linked title) - default option
 *   b. blog-landing category tiles: .podBlock .grouper-pod a.imageStripPod
 *      (image + linked title, no card surface) - `tiles` option
 *   c. blog-landing listing: .blogentries li.blogEntry
 *      (image, category p.blogTitle, linked heading, summary) - default option
 */
const clean = (text) => (text || '').replace(/\s+/g, ' ').trim();

const HEADINGS = 'h1, h2, h3, h4, h5, h6';

function buildImageCell(document, img) {
  const frag = document.createDocumentFragment();
  if (img && img.getAttribute('src')) {
    const image = document.createElement('img');
    image.setAttribute('src', img.getAttribute('src'));
    image.setAttribute('alt', img.getAttribute('alt') || '');
    frag.appendChild(document.createComment(' field:image '));
    frag.appendChild(image);
  }
  return frag;
}

function buildTextCell(document, { category, title, href, summary }) {
  const frag = document.createDocumentFragment();
  const nodes = [];
  if (category && clean(category.textContent)) {
    const p = document.createElement('p');
    p.textContent = clean(category.textContent);
    nodes.push(p);
  }
  if (title && clean(title.textContent)) {
    const h = document.createElement(title.tagName.toLowerCase());
    if (href) {
      const a = document.createElement('a');
      a.setAttribute('href', href);
      a.textContent = clean(title.textContent);
      h.appendChild(a);
    } else {
      h.textContent = clean(title.textContent);
    }
    nodes.push(h);
  }
  if (summary && clean(summary.textContent)) {
    const p = document.createElement('p');
    p.textContent = clean(summary.textContent);
    nodes.push(p);
  }
  if (nodes.length) {
    frag.appendChild(document.createComment(' field:text '));
    nodes.forEach((n) => frag.appendChild(n));
  }
  return frag;
}

export default function parse(element, { document }) {
  const cells = [];
  const isTiles = element.matches('.grouper-pod') || !!element.closest('.podBlock');

  if (isTiles) {
    // b. category tiles: each tile is one anchor wrapping image + heading
    Array.from(element.querySelectorAll('a.imageStripPod')).forEach((tile) => {
      const img = tile.querySelector('img');
      const title = tile.querySelector(HEADINGS);
      cells.push([
        buildImageCell(document, img),
        buildTextCell(document, { title, href: tile.getAttribute('href') || '' }),
      ]);
    });
  } else {
    // a. related teasers / c. landing listing: li.blogEntry > a.blogEntryInner
    Array.from(element.querySelectorAll('li.blogEntry')).forEach((item) => {
      const link = item.querySelector('a.blogEntryInner[href]') || item.querySelector('a[href]');
      const content = item.querySelector('.blogEntryContent') || item;
      cells.push([
        buildImageCell(document, item.querySelector('.blogImage img') || item.querySelector('img')),
        buildTextCell(document, {
          category: content.querySelector('p.blogTitle'),
          title: content.querySelector(HEADINGS),
          href: link ? link.getAttribute('href') : '',
          summary: content.querySelector('p:not(.blogTitle)'),
        }),
      ]);
    });
  }

  const name = isTiles ? 'cards-article (tiles)' : 'cards-article';
  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  element.replaceWith(block);
}
