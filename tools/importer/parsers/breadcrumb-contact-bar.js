/* eslint-disable */
/* global WebImporter */

/**
 * Parser for breadcrumb-contact-bar.
 * Source: travel.saga.co.uk blog-article pages,
 *   selector .breadcrumbUtilityContainer .breadcrumbUtility > .container
 * Model (blocks/breadcrumb-contact-bar/_breadcrumb-contact-bar.json):
 *   row 1 `breadcrumb` (richtext) - list of crumb links, trailing plain item = current page
 *   row 2 `contact` (richtext)    - "Call us on <tel link> to book" + opening status line
 */
const clean = (text) => (text || '').replace(/\s+/g, ' ').trim();

export default function parse(element, { document }) {
  const cells = [];

  // Row 1: breadcrumb trail
  const breadcrumbFrag = document.createDocumentFragment();
  const trail = element.querySelector('.breadcrumbContent');
  if (trail) {
    const ul = document.createElement('ul');
    Array.from(trail.children).forEach((node) => {
      const label = clean(node.textContent);
      if (!label) return;
      const li = document.createElement('li');
      if (node.tagName === 'A' && node.getAttribute('href')) {
        const a = document.createElement('a');
        a.setAttribute('href', node.getAttribute('href'));
        a.textContent = label;
        li.appendChild(a);
      } else {
        li.textContent = label;
      }
      ul.appendChild(li);
    });
    if (ul.children.length) {
      breadcrumbFrag.appendChild(document.createComment(' field:breadcrumb '));
      breadcrumbFrag.appendChild(ul);
    }
  }
  cells.push([breadcrumbFrag]);

  // Row 2: phone number + opening status
  const contactFrag = document.createDocumentFragment();
  const contactParts = [];

  const book = element.querySelector('.contactWidget #book, .contactWidget p:first-of-type');
  if (book) {
    const phone = book.querySelector('a.contactWidget__phone, a.InfinityNumber, a');
    const p = document.createElement('p');
    if (phone && clean(phone.textContent)) {
      const number = clean(phone.textContent);
      const before = clean(book.textContent.split(phone.textContent)[0]);
      const after = clean(book.textContent.split(phone.textContent).slice(1).join(' '));
      if (before) p.appendChild(document.createTextNode(`${before} `));
      const a = document.createElement('a');
      const href = phone.getAttribute('href');
      a.setAttribute('href', href && href.startsWith('tel:') ? href : `tel:${number.replace(/[^\d+]/g, '')}`);
      a.textContent = number;
      p.appendChild(a);
      if (after) p.appendChild(document.createTextNode(` ${after}`));
    } else {
      p.textContent = clean(book.textContent);
    }
    if (clean(p.textContent)) contactParts.push(p);
  }

  // Opening status: the "open" line (the "closed" variant is toggled client-side)
  const status = element.querySelector('.contactWidget #openMsg');
  if (status && clean(status.textContent)) {
    const p = document.createElement('p');
    p.textContent = clean(status.textContent);
    contactParts.push(p);
  }

  if (contactParts.length) {
    contactFrag.appendChild(document.createComment(' field:contact '));
    contactParts.forEach((p) => contactFrag.appendChild(p));
  }
  cells.push([contactFrag]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'breadcrumb-contact-bar', cells });
  element.replaceWith(block);
}
