/* eslint-disable */
/* global WebImporter */

/**
 * Site-wide cleanup for travel.saga.co.uk (ASP.NET).
 * Removes non-authorable chrome so it does not end up in the page body.
 * All selectors come from migration-work/cleaned.html.
 */

// Chrome that must be removed before parsers run (affects block matching)
const BEFORE_SELECTORS = [
  // Global header / navigation (gn21 mega nav)
  '#gn21',
  'header',
  'nav',
  // Skip links and empty anchors / spacers
  'a.sr-only',
  'a.gn21-skip-to-main',
  'a#Content',
  '#gn21-content-start',
  '#navSpacer',
  // Utility-bar search widgets (not authorable; outside the breadcrumb/contact container)
  '#searchMobile',
  '.isSearchMiniCollapse',
  '.isSearchBoxOpen',
  '.cruiseMiniSearch',
  // Notice banner dismiss button (the notice-banner block draws its own)
  '#dmpg-close-btn',
  // Owl carousel UI: arrows, counter and dots are drawn by the block code;
  // cloned items would produce duplicate cards
  '.owl-nav',
  '.owl-dots',
  '.owl-item.cloned',
  // Mobile-only blog filter dropdown (the desktop pills become the blog-filter block)
  '.filterSection > a.mobileFilter',
  '#blogFilterSelect',
  // Hidden mobile-only duplicate of the Which? award pod on the homepage
  '#whichForMob',
  // Hidden date/duration picker beside the cruise search (the cruise-finder block has its own options)
  '#facetDateAndDuration',
  // Footer
  '#gn-footer-2021',
  'footer',
  // Cookie banner / consent / overlays / lightbox
  '#onetrust-consent-sdk',
  '.dmpg-consent-overlay',
  '#lightboxOverlay',
  '#lightbox',
  // Tracking / analytics params and hidden inputs
  '#adl_params',
  '#sagaVersionAndServer',
  '#websiteVersion',
  'input[type="hidden"]',
  'iframe',
  'script',
  'style',
  'noscript',
  'link',
];

// Final cleanup after parsers
const AFTER_SELECTORS = [
  'header',
  'footer',
  'nav',
  'iframe',
  'script',
  'style',
  'noscript',
  'link',
  'input',
  'button',
];

function removeSvgSprite(element) {
  // Inline SVG sprite sheet rendered as a 0x0 data: image in a wrapper div
  element.querySelectorAll('img[src^="data:image/svg+xml"]').forEach((img) => {
    const parent = img.parentElement;
    if (parent && parent.tagName === 'DIV' && parent.children.length === 1
      && !parent.textContent.trim()) {
      parent.remove();
    } else {
      img.remove();
    }
  });
}

function removeEmptyHolders(element) {
  // Pod container: empty at the end of articles, but holds the intro and tiles on the blog landing page
  element.querySelectorAll('div.blockHolder').forEach((el) => {
    if (!el.textContent.trim() && !el.querySelector('img, picture')) el.remove();
  });
  // Hero slider with no slides: only a hidden duplicate page heading (the homepage hero has slides)
  element.querySelectorAll('#slider').forEach((el) => {
    if (!el.querySelector('.bxslider > li')) el.remove();
  });
}

function markButtons(element, document) {
  // Saga's large standalone buttons (e.g. "View our awards") are lavender secondary buttons:
  // wrap them in <em> so EDS decorates them as .button.secondary
  element.querySelectorAll('.button-pod a').forEach((a) => {
    if (a.closest('em')) return;
    const em = document.createElement('em');
    a.replaceWith(em);
    em.append(a);
  });
  // The blog listing's "Load more" is a navy primary button: wrap it in <strong>
  element.querySelectorAll('#loadMore a').forEach((a) => {
    if (a.closest('strong')) return;
    const strong = document.createElement('strong');
    a.replaceWith(strong);
    strong.append(a);
  });
}

function stripTrackingAttributes(element) {
  element.querySelectorAll('*').forEach((el) => {
    [...el.attributes].forEach(({ name }) => {
      if (name.startsWith('data-excat-')) return; // section markers used by saga-sections
      if (name.startsWith('on') || name.startsWith('data-') || name.startsWith('aria-')
        || name === 'style' || name === 'tabindex' || name === 'role') {
        el.removeAttribute(name);
      }
    });
  });
}

export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    WebImporter.DOMUtils.remove(element, BEFORE_SELECTORS);
    removeEmptyHolders(element);
    removeSvgSprite(element);
    markButtons(element, payload.document);
  }

  if (hookName === 'afterTransform') {
    WebImporter.DOMUtils.remove(element, AFTER_SELECTORS);
    stripTrackingAttributes(element);
  }
}
