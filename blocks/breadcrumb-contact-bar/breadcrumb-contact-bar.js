/**
 * Build the breadcrumb trail from the authored cell. Links become crumbs; a trailing
 * plain-text item (no link) becomes the current page.
 * @param {Element} cell
 * @returns {HTMLElement|null}
 */
function buildBreadcrumb(cell) {
  if (!cell) return null;
  const items = [];
  const listItems = cell.querySelectorAll('li');
  if (listItems.length) {
    listItems.forEach((li) => items.push(li.querySelector('a[href]') || li.textContent.trim()));
  } else {
    // links in paragraphs, e.g. "Cruises > Cruise Blogs"; separators are dropped
    items.push(...cell.querySelectorAll('a[href]'));
    if (!items.length && cell.textContent.trim()) items.push(cell.textContent.trim());
  }
  const crumbs = items.filter((item) => (typeof item === 'string' ? item.length : true));
  if (!crumbs.length) return null;

  const nav = document.createElement('nav');
  nav.className = 'breadcrumb-contact-bar-breadcrumb';
  nav.setAttribute('aria-label', 'Breadcrumb');
  const ol = document.createElement('ol');
  crumbs.forEach((crumb, idx) => {
    const li = document.createElement('li');
    if (typeof crumb === 'string') {
      const span = document.createElement('span');
      span.textContent = crumb;
      span.setAttribute('aria-current', 'page');
      li.append(span);
    } else {
      crumb.className = 'breadcrumb-contact-bar-crumb';
      if (idx === crumbs.length - 1 && crumbs.length > 1) {
        const href = new URL(crumb.href, window.location.href);
        if (href.pathname === window.location.pathname) crumb.setAttribute('aria-current', 'page');
      }
      li.append(crumb);
    }
    ol.append(li);
  });
  nav.append(ol);
  return nav;
}

/**
 * Wrap the authored opening status word ("OPEN" / "CLOSED") so it can be coloured.
 * @param {Element} container
 */
function highlightStatus(container) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const matches = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (/\b(OPEN|CLOSED)\b/.test(node.textContent) && !node.parentElement.closest('a')) {
      matches.push(node);
    }
  }
  matches.forEach((node) => {
    const parts = node.textContent.split(/\b(OPEN|CLOSED)\b/);
    const frag = document.createDocumentFragment();
    parts.forEach((part, idx) => {
      if (idx % 2) {
        const status = document.createElement('span');
        status.className = `breadcrumb-contact-bar-status ${part === 'OPEN' ? 'is-open' : 'is-closed'}`;
        status.textContent = part;
        frag.append(status);
      } else if (part) {
        frag.append(part);
      }
    });
    node.replaceWith(frag);
  });
}

/**
 * Breadcrumb + contact bar:breadcrumb trail on the left, booking phone number and opening
 * status on the right. Cells are read in order: [breadcrumb, contact], whether authored as
 * one row of two cells or two rows of one cell.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const [breadcrumbCell, contactCell] = cells;

  const breadcrumb = buildBreadcrumb(breadcrumbCell);

  let contact = null;
  if (contactCell && contactCell.textContent.trim()) {
    contact = document.createElement('div');
    contact.className = 'breadcrumb-contact-bar-contact';
    contact.append(...contactCell.childNodes);
    contact.querySelectorAll('a[href^="tel:"]').forEach((a) => a.classList.add('breadcrumb-contact-bar-phone'));
    highlightStatus(contact);
  }

  block.replaceChildren(...[breadcrumb, contact].filter(Boolean));
}
