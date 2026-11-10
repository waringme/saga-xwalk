/* eslint-disable */
/* global WebImporter */

/**
 * Parser for notice-banner.
 * Source: travel.saga.co.uk blog-article pages, selector #dmpg-banner
 * Model (blocks/notice-banner/_notice-banner.json): single richtext field `text`
 * holding the heading and the paragraph. The close button (#dmpg-close-btn) is removed
 * by the cleanup transformer; the block draws its own.
 */
export default function parse(element, { document }) {
  const cells = [];

  const textFrag = document.createDocumentFragment();
  const title = element.querySelector('.dmpg-title, h1, h2, h3, h4, h5, h6');
  const paragraphs = Array.from(element.querySelectorAll('p.dmpg-text'));
  const fallbackParagraphs = paragraphs.length
    ? paragraphs
    : Array.from(element.querySelectorAll(':scope > p'));

  if (title || fallbackParagraphs.length) {
    textFrag.appendChild(document.createComment(' field:text '));
    if (title) {
      const heading = /^H[1-6]$/.test(title.tagName) ? title : document.createElement('h4');
      if (heading !== title) heading.textContent = title.textContent.trim();
      textFrag.appendChild(heading);
    }
    fallbackParagraphs.forEach((p) => textFrag.appendChild(p));
  }

  cells.push([textFrag]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'notice-banner', cells });
  element.replaceWith(block);
}
