/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cruise-finder. Base: custom.
 * Source: travel.saga.co.uk/cruises, selector #searchControl (SumoSelect search panel:
 * cruise type select, then per-type tabs #searchTab4 (ocean) / #searchTab5 (river), each with
 * a region select, a month date picker, a passengers select and a Search input button).
 * xwalk model (blocks/cruise-finder/_cruise-finder.json):
 *   row 1 (block fields): link (+linkText) -> a single link: text = button label, href = results page
 *   then one cruise-finder-item row per select: [label | options (bulleted list)]
 * Authoring rules (blocks/cruise-finder/README.md): the label doubles as the empty first
 * option; a bold list item is preselected. Saga's option values are encoded JSON for its own
 * search API, so only the visible labels are imported (the block derives the values).
 * The block is a flat form, so the ocean and river region lists are merged (ocean first).
 * The source Search button is a JS-driven <input type="button"> with no target URL; the action
 * link points at the cruises landing page until an author sets the real results page.
 */
const RESULTS_FALLBACK = 'https://travel.saga.co.uk/cruises';

const clean = (text) => (text || '').replace(/\s+/g, ' ').trim();

const absolute = (url) => {
  const value = (url || '').trim();
  if (!value || value.startsWith('#') || /^javascript:/i.test(value)) return '';
  if (/^https?:\/\//i.test(value)) return value.replace(/^(https?:\/\/[^/:]+):443(?=\/)/i, '$1');
  if (value.startsWith('//')) return `https:${value}`;
  if (value.startsWith('/')) return `https://travel.saga.co.uk${value}`;
  return value;
};

/**
 * Split a select into its placeholder (empty / disabled first option) and real options.
 * @returns {{ placeholder: string, options: { text: string, selected: boolean }[] }}
 */
const readSelect = (select) => {
  let placeholder = '';
  const options = [];
  Array.from(select ? select.querySelectorAll('option') : []).forEach((opt) => {
    const text = clean(opt.textContent);
    if (!text) return;
    const value = opt.getAttribute('value');
    const isPlaceholder = value === '' || opt.hasAttribute('disabled') || opt.hasAttribute('hidden')
      || opt.classList.contains('removeOption');
    if (isPlaceholder && !placeholder) {
      placeholder = text;
      return;
    }
    options.push({ text, selected: opt.hasAttribute('selected') || opt.selected === true });
  });
  return { placeholder, options };
};

const mergeOptions = (lists) => {
  const seen = new Set();
  const merged = [];
  lists.forEach((list) => list.forEach((opt) => {
    const key = opt.text.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(opt);
  }));
  return merged;
};

export default function parse(element, { document }) {
  const cells = [];

  const fieldRow = (label, options) => {
    if (!label || !options.length) return;
    const labelFrag = document.createDocumentFragment();
    labelFrag.appendChild(document.createComment(' field:label '));
    labelFrag.appendChild(document.createTextNode(label));

    const optionsFrag = document.createDocumentFragment();
    optionsFrag.appendChild(document.createComment(' field:options '));
    const ul = document.createElement('ul');
    options.forEach((opt) => {
      const li = document.createElement('li');
      if (opt.selected) {
        const strong = document.createElement('strong');
        strong.textContent = opt.text;
        li.appendChild(strong);
      } else {
        li.textContent = opt.text;
      }
      ul.appendChild(li);
    });
    optionsFrag.appendChild(ul);
    cells.push([labelFrag, optionsFrag]);
  };

  const tabs = Array.from(element.querySelectorAll('#searchTabs > li .searchContent'));

  // Search action: button label from the first tab's search button
  const button = element.querySelector('.searchButtonHolder .searchButton, .searchButtonHolder button, .searchButtonHolder input');
  const buttonText = button
    ? clean(button.getAttribute('value') || button.textContent) || 'Search'
    : 'Search';
  const form = element.closest('form');
  const resultsHref = absolute(element.getAttribute('data-url') || (form && form.getAttribute('action')))
    || RESULTS_FALLBACK;
  const linkFrag = document.createDocumentFragment();
  linkFrag.appendChild(document.createComment(' field:link '));
  const link = document.createElement('a');
  link.setAttribute('href', resultsHref);
  link.textContent = buttonText;
  linkFrag.appendChild(link);
  cells.push([linkFrag, '']);

  // 1) Cruise type
  const typeSelect = element.querySelector('.cruiseOptionFilter select');
  if (typeSelect) {
    const { placeholder, options } = readSelect(typeSelect);
    fieldRow(placeholder || 'Cruise Type', options);
  }

  // 2) Region (ocean + river lists merged)
  const regionSelects = tabs.map((tab) => tab.querySelector('select.locationField')).filter(Boolean);
  if (regionSelects.length) {
    const read = regionSelects.map(readSelect);
    const placeholder = (read.find((r) => r.placeholder) || {}).placeholder || 'All regions';
    fieldRow(placeholder, mergeOptions(read.map((r) => r.options)));
  }

  // 3) Date: months offered by the date picker(s)
  const dateInputs = tabs.map((tab) => tab.querySelector('.dateField input')).filter(Boolean);
  if (dateInputs.length) {
    const label = clean(dateInputs[0].getAttribute('value')) || 'Any date';
    const months = mergeOptions(tabs.map((tab) => Array.from(tab.querySelectorAll('.datePickerMonths [data-value]'))
      .map((cell) => ({ text: clean(cell.getAttribute('data-value')), selected: false }))
      .filter((m) => m.text)));
    fieldRow(label, months);
  }

  // 4) Passengers
  const paxSelects = tabs.map((tab) => tab.querySelector('select.passengers')).filter(Boolean);
  if (paxSelects.length) {
    const read = paxSelects.map(readSelect);
    const placeholder = (read.find((r) => r.placeholder) || {}).placeholder || 'Passengers';
    fieldRow(placeholder, mergeOptions(read.map((r) => r.options)));
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cruise-finder', cells });
  element.replaceWith(block);
}
