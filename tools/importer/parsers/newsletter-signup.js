/* eslint-disable */
/* global WebImporter */

/**
 * Parser for newsletter-signup. Base: custom.
 * Source: travel.saga.co.uk/cruises, selector #email-only-banner
 * (`.banner-image` envelope icon, `.banner-body` with H2, `.intro`, the
 * `#email-only-form` (action /emailonly/banner) and a privacy note paragraph).
 * xwalk model (blocks/newsletter-signup/_newsletter-signup.json), one row per field:
 *   image (+imageAlt) | text (heading + intro) | link (+linkText: form action, button label) | note
 * The name / email inputs, hidden tokens, validation messages and the hidden
 * success/failure panel (.banner-result) are not imported; the block builds the form.
 */
const ORIGIN = 'https://travel.saga.co.uk';

const clean = (text) => (text || '').replace(/\s+/g, ' ').trim();

const absolute = (url) => {
  const value = (url || '').trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value.replace(/^(https?:\/\/[^/:]+):443(?=\/)/i, '$1');
  if (value.startsWith('//')) return `https:${value}`;
  if (value.startsWith('/')) return `${ORIGIN}${value}`;
  return value;
};

export default function parse(element, { document }) {
  const cells = [];
  const body = element.querySelector('.banner-body') || element;
  const form = body.querySelector('form');

  // Row 1: icon
  const imageFrag = document.createDocumentFragment();
  const icon = element.querySelector('.banner-image img');
  if (icon && icon.getAttribute('src')) {
    const img = document.createElement('img');
    // html2md's convertIcons rule turns any src ending in ".svg" into :icon: notation, which
    // the block cannot use (it expects a picture); a query string keeps it a real image
    const iconSrc = absolute(icon.getAttribute('src'));
    img.setAttribute('src', /\.svg$/i.test(iconSrc) ? `${iconSrc}?format=svg` : iconSrc);
    const alt = clean(icon.getAttribute('alt'));
    // the source alt is the literal string "null"
    img.setAttribute('alt', alt && alt !== 'null' ? alt : 'Envelope');
    imageFrag.appendChild(document.createComment(' field:image '));
    imageFrag.appendChild(img);
  }
  cells.push([imageFrag]);

  // Row 2: heading + intro
  const textFrag = document.createDocumentFragment();
  const textNodes = [];
  const heading = Array.from(body.querySelectorAll('h1, h2, h3, h4, h5, h6')).find((h) => !h.closest('form'));
  if (heading && clean(heading.textContent)) {
    const h2 = document.createElement('h2');
    h2.textContent = clean(heading.textContent);
    textNodes.push(h2);
  }
  const intro = body.querySelector('.intro');
  if (intro) {
    Array.from(intro.querySelectorAll('p')).filter((p) => clean(p.textContent)).forEach((p) => {
      const para = document.createElement('p');
      para.textContent = clean(p.textContent);
      textNodes.push(para);
    });
  }
  if (textNodes.length) {
    textFrag.appendChild(document.createComment(' field:text '));
    textNodes.forEach((n) => textFrag.appendChild(n));
  }
  cells.push([textFrag]);

  // Row 3: form action link, text = submit button label
  const linkFrag = document.createDocumentFragment();
  const action = form ? absolute(form.getAttribute('action')) : '';
  const submit = form ? form.querySelector('button, input[type="submit"]') : null;
  const label = submit ? clean(submit.textContent || submit.getAttribute('value')) : '';
  if (action) {
    const a = document.createElement('a');
    a.setAttribute('href', action);
    a.textContent = label || 'Subscribe';
    linkFrag.appendChild(document.createComment(' field:link '));
    linkFrag.appendChild(a);
  }
  cells.push([linkFrag]);

  // Row 4: privacy note (paragraphs after the form, outside the intro)
  const noteFrag = document.createDocumentFragment();
  const notes = Array.from(body.querySelectorAll('p'))
    .filter((p) => clean(p.textContent) && !p.closest('form') && !p.closest('.intro')
      && !p.closest('.banner-result') && !p.classList.contains('validation-message'));
  if (notes.length) {
    noteFrag.appendChild(document.createComment(' field:note '));
    notes.forEach((p) => {
      p.querySelectorAll('a[href]').forEach((a) => a.setAttribute('href', absolute(a.getAttribute('href'))));
      noteFrag.appendChild(p);
    });
  }
  cells.push([noteFrag]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'newsletter-signup', cells });
  element.replaceWith(block);
}
