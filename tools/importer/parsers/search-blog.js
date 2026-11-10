/* eslint-disable */
/* global WebImporter */

/**
 * Parser for search-blog. Base: search (custom).
 * Source: travel.saga.co.uk blog-landing page, selector #mobileFilters > .row.mb-3.text-left
 * Model (blocks/search-blog/_search-blog.json), one row per field:
 *   1. text (richtext): heading + search label paragraph
 *   2. placeholder (text): input placeholder, e.g. "e.g. destination"
 *   3. index (text): query index path; the block lists results from it, scoped to pages
 *      under the current page path (README: defaults to /query-index.json)
 * The Search button is drawn by the block, so it is not authored.
 */
const clean = (text) => (text || '').replace(/\s+/g, ' ').trim();

const QUERY_INDEX = '/query-index.json';

export default function parse(element, { document }) {
  const cells = [];

  // Row 1: heading + label
  const heading = element.querySelector('h1, h2, h3, h4, h5, h6');
  const label = element.querySelector('.searchBar label, label');
  const textFrag = document.createDocumentFragment();
  const textNodes = [];
  if (heading && clean(heading.textContent)) {
    const h = document.createElement(heading.tagName.toLowerCase());
    h.textContent = clean(heading.textContent);
    textNodes.push(h);
  }
  if (label && clean(label.textContent)) {
    const p = document.createElement('p');
    p.textContent = clean(label.textContent);
    textNodes.push(p);
  }
  if (textNodes.length) {
    textFrag.appendChild(document.createComment(' field:text '));
    textNodes.forEach((n) => textFrag.appendChild(n));
  }
  cells.push([textFrag]);

  // Row 2: placeholder
  const input = element.querySelector('input.blogInput, input');
  const placeholder = clean(input ? input.getAttribute('placeholder') : '');
  const placeholderFrag = document.createDocumentFragment();
  if (placeholder) {
    placeholderFrag.appendChild(document.createComment(' field:placeholder '));
    placeholderFrag.appendChild(document.createTextNode(placeholder));
  }
  cells.push([placeholderFrag]);

  // Row 3: query index path
  const indexFrag = document.createDocumentFragment();
  indexFrag.appendChild(document.createComment(' field:index '));
  indexFrag.appendChild(document.createTextNode(QUERY_INDEX));
  cells.push([indexFrag]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'search-blog', cells });
  element.replaceWith(block);
}
