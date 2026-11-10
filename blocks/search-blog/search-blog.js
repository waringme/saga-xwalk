import { createOptimizedPicture } from '../../scripts/aem.js';

let searchCount = 0;

/**
 * Fetch the query index rows.
 * @param {string} source
 * @returns {Promise<Array<object>>}
 */
async function fetchIndex(source) {
  try {
    const resp = await fetch(source);
    if (!resp.ok) return [];
    const json = await resp.json();
    return json?.data || [];
  } catch (e) {
    return [];
  }
}

/**
 * Keep rows under the current section (e.g. /cruises/cruise-blogs/...), falling back to
 * the full index when the section has no indexed pages.
 * @param {Array<object>} rows
 * @returns {Array<object>}
 */
function scopeToSection(rows) {
  const base = window.location.pathname.replace(/\.(aspx|html?)$/i, '').replace(/\/+$/, '');
  if (!base) return rows;
  const scoped = rows.filter((r) => r.path && r.path.startsWith(`${base}/`));
  return scoped.length ? scoped : rows;
}

/**
 * Rank rows by search terms: title matches first, then description / path matches.
 * @param {string[]} terms
 * @param {Array<object>} rows
 * @returns {Array<object>}
 */
function filterRows(terms, rows) {
  const inTitle = [];
  const inMeta = [];
  rows.forEach((row) => {
    const title = (row.title || '').toLowerCase();
    const meta = `${row.description || ''} ${(row.path || '').split('/').pop()}`.toLowerCase();
    if (terms.every((t) => title.includes(t))) inTitle.push(row);
    else if (terms.every((t) => title.includes(t) || meta.includes(t))) inMeta.push(row);
  });
  return [...inTitle, ...inMeta];
}

/**
 * Render one result as a linked teaser.
 * @param {object} row
 * @returns {HTMLLIElement}
 */
function renderResult(row) {
  const li = document.createElement('li');
  li.className = 'search-blog-result';
  const a = document.createElement('a');
  a.href = row.path;
  if (row.image && !/default-meta-image/.test(row.image)) {
    const wrapper = document.createElement('div');
    wrapper.className = 'search-blog-result-image';
    const url = new URL(row.image, window.location.href);
    if (url.origin === window.location.origin && !/\.svg$/i.test(url.pathname)) {
      wrapper.append(createOptimizedPicture(row.image, '', false, [{ width: '375' }]));
    } else {
      const img = document.createElement('img');
      img.src = row.image;
      img.alt = '';
      img.loading = 'lazy';
      wrapper.append(img);
    }
    a.append(wrapper);
  }
  const title = document.createElement('p');
  title.className = 'search-blog-result-title';
  title.textContent = row.title || row.path;
  a.append(title);
  if (row.description) {
    const desc = document.createElement('p');
    desc.className = 'search-blog-result-description';
    desc.textContent = row.description;
    a.append(desc);
  }
  li.append(a);
  return li;
}

/**
 * Blog search: a page title plus a labelled keyword search box and Search button.
 * Results come from the query index and are listed below the form.
 * Cells: [heading (+ optional label paragraph), placeholder text, query-index link].
 * The heading cell is the one with a heading; a cell holding only a link is the index
 * source; a plain short text cell is the input placeholder.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  searchCount += 1;
  const inputId = `search-blog-input-${searchCount}`;
  const cells = [...block.querySelectorAll(':scope > div > div')]
    .filter((c) => c.textContent.trim());

  let headingCell = null;
  let source = null;
  let placeholder = '';
  cells.forEach((cell) => {
    const link = cell.querySelector('a[href]');
    if (!headingCell && cell.querySelector('h1, h2, h3, h4, h5, h6')) {
      headingCell = cell;
    } else if (link && cell.textContent.trim() === link.textContent.trim()) {
      source = link.href;
    } else if (/\.json(\?|$)/.test(cell.textContent.trim())) {
      source = cell.textContent.trim();
    } else if (!placeholder) {
      placeholder = cell.textContent.trim();
    }
  });
  source = source || `${window.hlx?.codeBasePath || ''}/query-index.json`;

  const heading = headingCell?.querySelector('h1, h2, h3, h4, h5, h6');
  const labelPara = headingCell ? [...headingCell.querySelectorAll('p')].pop() : null;
  const labelText = labelPara?.textContent.trim() || `Search ${heading?.textContent.trim() || ''}`.trim();
  if (labelPara) labelPara.remove();

  const header = document.createElement('div');
  header.className = 'search-blog-heading';
  if (headingCell) header.append(...headingCell.childNodes);

  const form = document.createElement('form');
  form.className = 'search-blog-form';
  form.setAttribute('role', 'search');
  const label = document.createElement('label');
  label.className = 'search-blog-label';
  label.htmlFor = inputId;
  label.textContent = labelText;
  const box = document.createElement('div');
  box.className = 'search-blog-box';
  const input = document.createElement('input');
  input.type = 'search';
  input.id = inputId;
  input.name = 'q';
  input.className = 'search-blog-input';
  input.placeholder = placeholder;
  const button = document.createElement('button');
  button.type = 'submit';
  button.className = 'search-blog-submit';
  button.textContent = 'Search';
  box.append(input, button);
  form.append(label, box);

  const results = document.createElement('ul');
  results.className = 'search-blog-results';
  results.setAttribute('aria-live', 'polite');

  let indexRows = null;
  const runSearch = async (value) => {
    const url = new URL(window.location.href);
    if (value) url.searchParams.set('q', value);
    else url.searchParams.delete('q');
    window.history.replaceState({}, '', url.toString());

    results.replaceChildren();
    const terms = value.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return;
    if (!indexRows) indexRows = scopeToSection(await fetchIndex(source));
    const matches = filterRows(terms, indexRows);
    if (matches.length) {
      results.classList.remove('no-results');
      results.append(...matches.map(renderResult));
    } else {
      results.classList.add('no-results');
      const li = document.createElement('li');
      li.textContent = 'No results found.';
      results.append(li);
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runSearch(input.value.trim());
  });
  input.addEventListener('keyup', (e) => {
    if (e.key === 'Escape') {
      input.value = '';
      runSearch('');
    }
  });

  const top = document.createElement('div');
  top.className = 'search-blog-top';
  top.append(header, form);
  block.replaceChildren(top, results);

  const initial = new URL(window.location.href).searchParams.get('q');
  if (initial) {
    input.value = initial;
    runSearch(initial.trim());
  }
}
