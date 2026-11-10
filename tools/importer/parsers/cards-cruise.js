/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-cruise. Base: cards.
 * Source: travel.saga.co.uk blog-article pages,
 *   selector .megaBlogEntry .app-GalleryWidget .owl-carousel
 * The cleanup transformer removes .owl-nav, .owl-dots and .owl-item.cloned; the
 * block code draws its own arrows and counter.
 * Model (blocks/cards-cruise/_cards-cruise.json, item cards-cruise-item), one row per card:
 *   [image (+imageAlt), text (linked title, region, departure, nights), offer, price]
 */
const clean = (text) => (text || '').replace(/\s+/g, ' ').trim();

const normaliseHref = (href) => (href || '').replace(/^(https?:\/\/[^/:]+):443(?=\/)/i, '$1');

export default function parse(element, { document }) {
  const cells = [];

  const cards = Array.from(element.querySelectorAll('.owl-item:not(.cloned) .product-list-widget'));

  cards.forEach((card) => {
    const link = card.querySelector('a[href]');
    const href = link ? normaliseHref(link.getAttribute('href')) : '';
    const img = card.querySelector('.widgetImageHolder img, img');
    const title = card.querySelector('.searchResult-content h2, .searchResult-content h3, h2, h3');
    const place = card.querySelector('.place');
    const departure = card.querySelector('.departure');
    const nights = card.querySelector('.passAndNights');
    const offer = card.querySelector('.offer');
    const priceFrom = card.querySelector('.priceFrom');
    const smallPrint = card.querySelector('.priceContainer p.mt-1');

    // Cell 1: image (alt collapses into imageAlt)
    const imageFrag = document.createDocumentFragment();
    if (img && img.getAttribute('src')) {
      const image = document.createElement('img');
      image.setAttribute('src', img.getAttribute('src'));
      image.setAttribute('alt', img.getAttribute('alt') || img.getAttribute('title') || '');
      imageFrag.appendChild(document.createComment(' field:image '));
      imageFrag.appendChild(image);
    }

    // Cell 2: details
    const textFrag = document.createDocumentFragment();
    const textNodes = [];
    if (title && clean(title.textContent)) {
      const h = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.textContent = clean(title.textContent);
        h.appendChild(a);
      } else {
        h.textContent = clean(title.textContent);
      }
      textNodes.push(h);
    }
    [place, departure, nights].forEach((node) => {
      if (node && clean(node.textContent)) {
        const p = document.createElement('p');
        p.textContent = clean(node.textContent);
        textNodes.push(p);
      }
    });
    if (textNodes.length) {
      textFrag.appendChild(document.createComment(' field:text '));
      textNodes.forEach((n) => textFrag.appendChild(n));
    }

    // Cell 3: offer badge (plain text)
    const offerFrag = document.createDocumentFragment();
    if (offer && clean(offer.textContent)) {
      offerFrag.appendChild(document.createComment(' field:offer '));
      const p = document.createElement('p');
      p.textContent = clean(offer.textContent);
      offerFrag.appendChild(p);
    }

    // Cell 4: price + small print
    const priceFrag = document.createDocumentFragment();
    const priceNodes = [];
    if (priceFrom && clean(priceFrom.textContent)) {
      const p = document.createElement('p');
      const amount = priceFrom.querySelector('.price');
      if (amount && clean(amount.textContent)) {
        const parts = priceFrom.textContent.split(amount.textContent);
        const before = clean(parts[0]);
        const after = clean(parts.slice(1).join(' '));
        if (before) p.appendChild(document.createTextNode(`${before} `));
        const strong = document.createElement('strong');
        strong.textContent = clean(amount.textContent);
        p.appendChild(strong);
        if (after) p.appendChild(document.createTextNode(` ${after}`));
      } else {
        p.textContent = clean(priceFrom.textContent);
      }
      priceNodes.push(p);
    }
    if (smallPrint && clean(smallPrint.textContent)) {
      const p = document.createElement('p');
      p.textContent = clean(smallPrint.textContent);
      priceNodes.push(p);
    }
    if (priceNodes.length) {
      priceFrag.appendChild(document.createComment(' field:price '));
      priceNodes.forEach((n) => priceFrag.appendChild(n));
    }

    cells.push([imageFrag, textFrag, offerFrag, priceFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-cruise', cells });
  element.replaceWith(block);
}
