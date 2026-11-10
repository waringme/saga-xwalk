import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Normalise a URL path for comparison: drop trailing slash, `.aspx`/`.html` suffix and case.
 * @param {string} pathname
 * @returns {string}
 */
function normalisePath(pathname) {
  return pathname
    .replace(/\.(aspx|html?)$/i, '')
    .replace(/\/+$/, '')
    .toLowerCase() || '/';
}

/**
 * Whether a link path points at the current page. Exact match, or the current path ends with
 * the link path on a segment boundary (e.g. a preview served under a `/content` prefix).
 * @param {string} target normalised link path
 * @param {string} current normalised page path
 * @returns {boolean}
 */
function matchesCurrent(target, current) {
  if (target === current) return true;
  return target !== '/' && current.endsWith(target);
}

/**
 * Blog filter: a row of category pill links.
 * Authored as one cell holding a list (or paragraphs) of links. The link matching the
 * current page is marked with aria-current="page".
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const links = [...block.querySelectorAll('a[href]')];
  if (!links.length) return;

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Blog categories');
  const ul = document.createElement('ul');
  ul.className = 'blog-filter-list';

  const current = normalisePath(window.location.pathname);
  let active = null;
  let activeLength = 0;

  links.forEach((link) => {
    const li = document.createElement('li');
    li.className = 'blog-filter-item';
    const source = link.closest('li') || link.closest('p');
    if (source) moveInstrumentation(source, li);
    link.className = 'blog-filter-link';
    const target = normalisePath(new URL(link.href, window.location.href).pathname);
    if (matchesCurrent(target, current) && target.length > activeLength) {
      active = link;
      activeLength = target.length;
    }
    li.append(link);
    ul.append(li);
  });

  if (active) active.setAttribute('aria-current', 'page');

  nav.append(ul);
  block.replaceChildren(nav);
}
