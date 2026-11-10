/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-landing. Base: hero.
 * Source: travel.saga.co.uk/cruises, selector #slider (bxslider with a single slide).
 * The slide photo is a CSS background-image on the `li` (also in its `desktop` / `mobile`
 * attributes); the `img` inside the slide is a transparent blank-hero.png spacer, so the
 * background is turned into a real image here.
 * xwalk model (blocks/hero-landing/_hero-landing.json), one row per field:
 *   image (+imageAlt) | text (title heading) | badge (+badgeAlt) | tagline
 * This follows the Universal Editor model rather than the 2-row library hero; the block JS
 * reads all cells in order (first picture = background, later picture = badge).
 * The award badge links to which.co.uk on the source; the badge field is an image reference,
 * so the link is kept on the tagline text instead.
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

const backgroundUrl = (el) => {
  if (!el) return '';
  const style = el.getAttribute('style') || '';
  const match = style.match(/background-image\s*:\s*url\(\s*(?:&quot;|["'])?([^"')]+?)(?:&quot;|["'])?\s*\)/i);
  if (match && match[1]) return absolute(match[1]);
  return absolute(el.getAttribute('desktop') || el.getAttribute('mobile') || '');
};

export default function parse(element, { document }) {
  const cells = [];

  // Row 1: background photo (first real slide)
  const slide = element.querySelector('.bxslider > li:not(.bx-clone)') || element.querySelector('.bxslider > li');
  const heroSrc = backgroundUrl(slide);
  const heading = element.querySelector('.heroContentNoNavInnerContent h1, .heroContentNoNavInnerContent h2');
  const title = heading ? clean(heading.textContent) : '';

  const imageFrag = document.createDocumentFragment();
  if (heroSrc) {
    const img = document.createElement('img');
    img.setAttribute('src', heroSrc);
    const spacer = slide && slide.querySelector('img');
    const spacerAlt = spacer ? clean(spacer.getAttribute('alt')) : '';
    // the spacer alt is "*"; fall back to the hero title for a meaningful alt
    img.setAttribute('alt', spacerAlt && spacerAlt !== '*' ? spacerAlt : title);
    imageFrag.appendChild(document.createComment(' field:image '));
    imageFrag.appendChild(img);
  }
  cells.push([imageFrag]);

  // Row 2: title
  const textFrag = document.createDocumentFragment();
  if (title) {
    const h1 = document.createElement('h1');
    h1.textContent = title;
    textFrag.appendChild(document.createComment(' field:text '));
    textFrag.appendChild(h1);
  }
  cells.push([textFrag]);

  // Row 3: award badge
  const whichBox = element.querySelector('.whichBox');
  const badgeImg = whichBox ? whichBox.querySelector('.whichImage img') || whichBox.querySelector('img') : null;
  const badgeLink = badgeImg ? badgeImg.closest('a[href]') : null;
  const badgeFrag = document.createDocumentFragment();
  if (badgeImg && badgeImg.getAttribute('src')) {
    const img = document.createElement('img');
    img.setAttribute('src', absolute(badgeImg.getAttribute('src')));
    img.setAttribute('alt', clean(badgeImg.getAttribute('alt')));
    badgeFrag.appendChild(document.createComment(' field:badge '));
    badgeFrag.appendChild(img);
  }
  cells.push([badgeFrag]);

  // Row 4: tagline (linked to the badge's award page when there is one)
  const taglineSource = whichBox ? whichBox.querySelector('.whichText') : null;
  const taglineText = taglineSource ? clean(taglineSource.textContent) : '';
  const taglineFrag = document.createDocumentFragment();
  if (taglineText) {
    const p = document.createElement('p');
    if (badgeLink) {
      const a = document.createElement('a');
      a.setAttribute('href', absolute(badgeLink.getAttribute('href')));
      a.textContent = taglineText;
      p.appendChild(a);
    } else {
      p.textContent = taglineText;
    }
    taglineFrag.appendChild(document.createComment(' field:tagline '));
    taglineFrag.appendChild(p);
  }
  cells.push([taglineFrag]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-landing', cells });
  element.replaceWith(block);
}
