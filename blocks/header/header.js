// desktop layout (horizontal sections + megamenu panels) from 1200px
const isDesktop = window.matchMedia('(width >= 1200px)');

/**
 * Fetches the nav fragment: /content first (local preview), then the site root (DA/EDS).
 * Image paths in the fragment are resolved against the fragment URL.
 * @returns {Promise<HTMLElement|null>} container holding the fragment sections
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const container = document.createElement('div');
  container.innerHTML = await resp.text();
  container.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), resp.url).href;
  });
  return container;
}

function el(tag, className, ...children) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  children.filter(Boolean).forEach((c) => e.append(c));
  return e;
}

/** first child element matching a tag name */
const child = (parent, tag) => [...parent.children].find((c) => c.tagName === tag.toUpperCase());

/** builds an image card from a fragment <li>: picture/img, label link, description */
function buildCard(li) {
  const img = li.querySelector('img');
  const link = li.querySelector('a');
  const desc = [...li.querySelectorAll('p')].find((p) => !p.querySelector('img, a'));
  const contents = el('div', 'nav-card-contents');
  if (link) {
    link.className = 'nav-card-label';
    contents.append(link);
  }
  if (desc) contents.append(el('div', 'nav-card-desc', desc));
  return el('li', 'nav-card', img ? el('div', 'nav-card-image', img) : null, contents);
}

/**
 * builds a link column from a fragment <li>: groups of a heading (link, or plain text in a <p>)
 * followed by a nested list of links
 */
function buildColumn(li) {
  const col = el('li', 'nav-col');
  [...li.children].forEach((c) => {
    if (c.tagName === 'UL') c.className = 'nav-col-links';
    else c.classList.add('nav-col-heading');
    col.append(c);
  });
  return col;
}

/** sales lines are open Monday to Friday, 9am to 6pm UK time */
function salesLineOpen(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London', weekday: 'short', hour: 'numeric', hourCycle: 'h23',
  }).formatToParts(now).map((p) => [p.type, p.value]));
  const hour = Number(parts.hour);
  return !['Sat', 'Sun'].includes(parts.weekday) && hour >= 9 && hour < 18;
}

/** phone link from the fragment, with a live open/closed indicator */
function buildContact(link) {
  link.className = 'nav-contact-link';
  const number = el('span', 'nav-contact-number', link.textContent.trim());
  [...link.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).forEach((n) => n.remove());
  const open = salesLineOpen();
  const status = el('span', `nav-contact-status${open ? ' is-open' : ''}`, el('span', 'nav-contact-dot'), el('span', 'nav-contact-label', open ? 'Open' : 'Closed'));
  link.append(number, status);
  return el('div', 'nav-contact', link);
}

/**
 * Builds the detail panel for a sidebar item. A list whose entries hold images is a card panel
 * (an entry without an image is its "Go to" button); otherwise each entry is a link column.
 */
function buildDetail(label, list) {
  const detail = el('div', 'nav-detail');
  detail.append(el('p', 'nav-detail-title', label));
  if (!list) return detail;
  const entries = [...list.children];
  if (entries.some((li) => li.querySelector('img'))) {
    const goTo = entries.find((li) => !li.querySelector('img'));
    if (goTo) {
      const a = goTo.querySelector('a');
      a.className = 'nav-view-all';
      detail.prepend(el('p', 'nav-view-all-wrapper', a));
    }
    detail.append(el('ul', 'nav-cards', ...entries.filter((li) => li.querySelector('img')).map(buildCard)));
  } else {
    detail.append(el('ul', 'nav-columns', ...entries.map(buildColumn)));
  }
  return detail;
}

function setActiveItem(panel, index) {
  panel.querySelectorAll('.nav-sidebar-item').forEach((item, i) => {
    item.classList.toggle('active', i === index);
    item.querySelector('.nav-sidebar-trigger').setAttribute('aria-expanded', i === index ? 'true' : 'false');
  });
  panel.querySelectorAll('.nav-detail').forEach((d, i) => { d.hidden = i !== index; });
}

/** opens one top-level section (closing the others), or closes all when li is null */
function openSection(nav, li) {
  nav.querySelectorAll('.nav-top-item').forEach((item) => {
    const open = item === li;
    item.classList.toggle('open', open);
    item.querySelector('.nav-top-trigger').setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open && !isDesktop.matches) item.classList.remove('drilled');
  });
  nav.classList.toggle('panel-open', !!li);
  if (li) setActiveItem(li.querySelector('.nav-panel'), isDesktop.matches ? 0 : -1);
}

/** builds a top-level section: trigger button + megamenu panel (sidebar + detail panels) */
function buildSection(nav, li) {
  const label = child(li, 'p')?.textContent.trim() || '';
  const [itemsList, secondary] = [...li.children].filter((c) => c.tagName === 'UL');
  const trigger = el('button', 'nav-top-trigger', label);
  trigger.type = 'button';
  trigger.setAttribute('aria-expanded', 'false');

  const sidebarList = el('ul', 'nav-sidebar-list');
  const details = el('div', 'nav-details');
  const panel = el('div', 'nav-panel');
  [...(itemsList?.children || [])].forEach((item, index) => {
    const link = child(item, 'a');
    const itemLabel = link?.textContent.trim() || '';
    const btn = el('button', 'nav-sidebar-trigger', itemLabel);
    btn.type = 'button';
    btn.addEventListener('click', () => {
      setActiveItem(panel, index);
      if (!isDesktop.matches) panel.closest('.nav-top-item').classList.add('drilled');
    });
    sidebarList.append(el('li', 'nav-sidebar-item', btn));
    const detail = buildDetail(itemLabel, child(item, 'ul'));
    // the item's trailing paragraph is its mobile "back" label
    const backLabel = [...item.children].filter((c) => c.tagName === 'P').pop()?.textContent.trim();
    const back = el('button', 'nav-back', backLabel || `Back to ${label}`);
    back.type = 'button';
    back.addEventListener('click', () => panel.closest('.nav-top-item').classList.remove('drilled'));
    detail.prepend(back);
    details.append(detail);
  });
  if (secondary) secondary.className = 'nav-sidebar-secondary';
  const paras = [...li.children].filter((c) => c.tagName === 'P');
  const tel = paras.map((p) => p.querySelector('a[href^="tel:"]')).find(Boolean);
  const contact = tel ? buildContact(tel) : null;
  // after the label, a plain paragraph is the section menu's mobile "back" label
  const sideBackLabel = paras.slice(1).filter((p) => !p.querySelector('a')).pop()?.textContent.trim();

  const sideBack = el('button', 'nav-back nav-back-top', sideBackLabel || 'Back to menu');
  sideBack.type = 'button';
  sideBack.addEventListener('click', () => openSection(nav, null));
  const close = el('button', 'nav-close');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close menu');
  close.addEventListener('click', () => openSection(nav, null));
  panel.append(el('div', 'nav-sidebar', sideBack, sidebarList, secondary, contact), details, close);

  const section = el('li', 'nav-top-item', trigger, panel);
  trigger.addEventListener('click', () => {
    openSection(nav, section.classList.contains('open') ? null : section);
  });
  return section;
}

function toggleMenu(nav, forceOpen = null) {
  const open = forceOpen !== null ? forceOpen : nav.getAttribute('aria-expanded') !== 'true';
  nav.setAttribute('aria-expanded', open ? 'true' : 'false');
  nav.querySelector('.nav-hamburger button').setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  const hamburgerLabel = nav.querySelector('.nav-hamburger-label');
  hamburgerLabel.textContent = open ? hamburgerLabel.dataset.openLabel : 'Menu';
  document.body.style.overflowY = open && !isDesktop.matches ? 'hidden' : '';
  if (!open) openSection(nav, null);
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';
  if (!fragment) return;
  const [brandSrc, sectionsSrc, toolsSrc] = [...fragment.children];

  const nav = el('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');
  nav.setAttribute('aria-expanded', 'false');

  const brand = el('div', 'nav-brand');
  const logoLink = brandSrc?.querySelector('a');
  if (logoLink) {
    logoLink.setAttribute('aria-label', logoLink.querySelector('img')?.alt || 'Home');
    brand.append(logoLink);
  }

  const sections = el('div', 'nav-sections');
  const topList = el('ul', 'nav-top');
  [...(sectionsSrc?.querySelector('ul')?.children || [])].forEach((li) => topList.append(buildSection(nav, li)));
  sections.append(topList);

  const tools = el('div', 'nav-tools');
  const toolLink = toolsSrc?.querySelector('a');
  if (toolLink) {
    toolLink.className = 'nav-account';
    // label in its own span: the mobile bar shows the icon only
    const text = [...toolLink.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE);
    const labelText = text.map((n) => n.textContent).join('').trim();
    text.forEach((n) => n.remove());
    toolLink.append(el('span', 'nav-account-label', labelText));
    toolLink.setAttribute('aria-label', labelText);
    tools.append(toolLink);
  }

  const hamburger = el('div', 'nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"><span></span><span></span><span></span><span></span></span>
      <span class="nav-hamburger-label" data-open-label="Close">Menu</span>
    </button>`;
  hamburger.querySelector('button').addEventListener('click', () => toggleMenu(nav));

  nav.append(brand, sections, tools, hamburger);

  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    if (nav.classList.contains('panel-open')) openSection(nav, null);
    else if (nav.getAttribute('aria-expanded') === 'true') toggleMenu(nav, false);
  });
  // reset menus when crossing the desktop breakpoint
  isDesktop.addEventListener('change', () => toggleMenu(nav, false));

  block.append(el('div', 'nav-wrapper', nav));
}
