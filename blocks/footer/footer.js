/**
 * Fetches the footer fragment: /content first (local preview), then the site root (DA/EDS).
 * Image paths in the fragment are resolved against the fragment URL.
 * @returns {Promise<HTMLElement|null>} container holding the fragment sections
 */
async function fetchFooter() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
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

/** turns a fragment list into a classed list (items keep their links/images) */
function classList(list, className) {
  if (list) list.className = className;
  return list;
}

/** heading + list pairs become link columns (accordions on mobile) */
function buildColumns(section) {
  const columns = el('div', 'footer-columns');
  section.querySelectorAll('h2, h3, h4').forEach((heading, i) => {
    const list = heading.nextElementSibling?.tagName === 'UL' ? heading.nextElementSibling : null;
    const id = `footer-col-${i}`;
    const toggle = el('button', 'footer-col-heading', heading.textContent.trim());
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', id);
    if (list) list.id = id;
    const col = el('section', 'footer-col', toggle, classList(list, 'footer-col-links'));
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      col.classList.toggle('open', open);
    });
    columns.append(col);
  });
  return columns;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooter();
  block.textContent = '';
  if (!fragment) return;
  const [brand, primary, columns, social, legal, address] = [...fragment.children];

  const main = el('div', 'footer-main');
  if (brand) {
    // logo image, its link, then the emblem image (images are authored beside links)
    const logoLink = brand.querySelector('a');
    const [logo, emblem] = [...brand.querySelectorAll('img')];
    if (logoLink && logo && !logoLink.contains(logo)) logoLink.replaceChildren(logo);
    if (logoLink) logoLink.setAttribute('aria-label', logoLink.querySelector('img')?.alt || 'Home');
    if (emblem) main.append(el('div', 'footer-signifer', emblem));
    if (logoLink) main.append(el('div', 'footer-logo', logoLink));
  }

  main.append(el(
    'div',
    'footer-links',
    classList(primary?.querySelector('ul'), 'footer-primary'),
    el('div', 'footer-divider'),
    columns ? buildColumns(columns) : null,
  ));

  if (social) main.append(classList(social.querySelector('ul'), 'footer-social'));

  if (legal) {
    const legalList = classList(legal.querySelector('ul'), 'footer-legal');
    const copyright = legal.querySelector('p');
    if (legalList && copyright) legalList.append(el('li', 'footer-copyright', copyright.textContent.trim()));
    main.append(legalList);
    // the copyright moves below the address on mobile
    if (copyright) {
      copyright.className = 'footer-copyright-mobile';
      main.append(copyright);
    }
  }

  if (address) {
    const p = address.querySelector('p');
    if (p) p.className = 'footer-address';
    main.append(p);
  }

  block.append(el('div', 'footer-marble-top'), main, el('div', 'footer-marble-bottom'));
}
