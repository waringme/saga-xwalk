/* eslint-disable */
/* global WebImporter */

/**
 * Parser for blog-filter. Base: columns (custom).
 * Source: travel.saga.co.uk blog-landing page, selector #mobileFilters ul.pills
 * Model (blocks/blog-filter/_blog-filter.json): single richtext field `text` holding a
 * bulleted list of category links. The active pill ("All Blogs") is not authored; the
 * block marks the link matching the current page with aria-current="page".
 */
const clean = (text) => (text || '').replace(/\s+/g, ' ').trim();

export default function parse(element, { document }) {
  const cells = [];

  const ul = document.createElement('ul');
  Array.from(element.querySelectorAll(':scope > li')).forEach((item) => {
    const link = item.querySelector('a[href]');
    if (!link || !clean(link.textContent)) return;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.setAttribute('href', link.getAttribute('href'));
    a.textContent = clean(link.textContent);
    li.appendChild(a);
    ul.appendChild(li);
  });

  const textFrag = document.createDocumentFragment();
  if (ul.children.length) {
    textFrag.appendChild(document.createComment(' field:text '));
    textFrag.appendChild(ul);
  }
  cells.push([textFrag]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'blog-filter', cells });
  element.replaceWith(block);
}
