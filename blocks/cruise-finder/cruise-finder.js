import { toClassName } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Build one labelled select from a field row: [label, options list].
 * The label doubles as the empty "placeholder" option. A bold (<strong>) list item is
 * preselected. A list item written as "Label|value" uses the part after the bar as value.
 * @param {HTMLElement} row
 * @param {number} idx
 * @param {string} formId
 * @returns {HTMLElement}
 */
function buildField(row, idx, formId) {
  const [labelCell, optionsCell] = [...row.children];
  const label = labelCell?.textContent.trim() || `Option ${idx + 1}`;
  const name = toClassName(label) || `field-${idx + 1}`;
  const id = `${formId}-${name}`;

  const wrapper = document.createElement('div');
  wrapper.className = 'cruise-finder-field';
  moveInstrumentation(row, wrapper);

  const labelEl = document.createElement('label');
  labelEl.className = 'cruise-finder-label';
  labelEl.htmlFor = id;
  labelEl.textContent = label;

  const select = document.createElement('select');
  select.id = id;
  select.name = name;

  const items = optionsCell ? [...optionsCell.querySelectorAll('li')] : [];
  const hasSelected = items.some((li) => li.querySelector('strong, b'));
  if (!hasSelected) {
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = label;
    select.append(placeholder);
  }
  items.forEach((li) => {
    const [text, value] = li.textContent.split('|').map((s) => s.trim());
    if (!text) return;
    const option = document.createElement('option');
    option.textContent = text;
    option.value = value || toClassName(text);
    if (li.querySelector('strong, b')) option.selected = true;
    select.append(option);
  });

  wrapper.append(labelEl, select);
  return wrapper;
}

let formCount = 0;

/**
 * Cruise finder: a search panel of select boxes plus a Search button.
 * Rows: one per field as [label, list of options]; one row holding only a link is the
 * search action (link text = button label, link href = results page). Selected values are
 * sent as query parameters named after the field labels.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  formCount += 1;
  const formId = `cruise-finder-${formCount}`;

  const form = document.createElement('form');
  form.className = 'cruise-finder-form';
  form.method = 'get';
  form.setAttribute('role', 'search');

  let actionLink = null;
  const fields = [];
  [...block.children].forEach((row) => {
    const links = row.querySelectorAll('a[href]');
    const isAction = links.length === 1 && !row.querySelector('li')
      && row.textContent.trim() === links[0].textContent.trim();
    if (isAction) {
      [actionLink] = links;
    } else if (row.textContent.trim()) {
      fields.push(buildField(row, fields.length, formId));
    }
  });

  form.append(...fields);

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'cruise-finder-submit';
  submit.textContent = actionLink?.textContent.trim() || 'Search';
  form.action = actionLink?.href || window.location.pathname;
  form.append(submit);

  form.addEventListener('submit', (e) => {
    // drop empty values so the results URL only carries what the visitor chose
    e.preventDefault();
    const url = new URL(form.action, window.location.href);
    new FormData(form).forEach((value, key) => {
      if (value) url.searchParams.set(key, value);
    });
    window.location.href = url.toString();
  });

  block.replaceChildren(form);
}
