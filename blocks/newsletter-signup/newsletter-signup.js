let formCount = 0;

/**
 * Create a labelled input.
 * @param {string} formId
 * @param {string} name
 * @param {string} label
 * @param {string} type
 * @param {string} autocomplete
 * @returns {HTMLElement}
 */
function field(formId, name, label, type, autocomplete) {
  const wrapper = document.createElement('div');
  wrapper.className = `newsletter-signup-field newsletter-signup-field-${name}`;
  const id = `${formId}-${name}`;
  const labelEl = document.createElement('label');
  labelEl.htmlFor = id;
  labelEl.className = 'newsletter-signup-label';
  labelEl.textContent = label;
  const input = document.createElement('input');
  input.id = id;
  input.name = name;
  input.type = type;
  input.required = true;
  input.placeholder = label;
  input.autocomplete = autocomplete;
  wrapper.append(labelEl, input);
  return wrapper;
}

/**
 * Newsletter sign-up: icon, heading + intro text, a first name / last name / email form
 * with a Subscribe button, and a privacy note.
 * Cells are recognised by content: a picture-only cell is the icon, a cell holding only a
 * link is the form action (link text = button label), the first other cell is the intro and
 * any remaining text is the privacy note.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  formCount += 1;
  const formId = `newsletter-signup-${formCount}`;
  const cells = [...block.querySelectorAll(':scope > div > div')]
    .filter((c) => c.textContent.trim() || c.querySelector('picture'));

  let icon = null;
  let actionLink = null;
  const textCells = [];
  cells.forEach((cell) => {
    const links = cell.querySelectorAll('a[href]');
    if (!icon && cell.querySelector('picture') && !cell.textContent.trim()) {
      icon = cell;
    } else if (links.length === 1 && cell.textContent.trim() === links[0].textContent.trim()) {
      [actionLink] = links;
    } else {
      textCells.push(cell);
    }
  });
  const [intro, ...notes] = textCells;

  const content = document.createElement('div');
  content.className = 'newsletter-signup-content';
  if (intro) {
    intro.className = 'newsletter-signup-intro';
    content.append(intro);
  }

  const form = document.createElement('form');
  form.className = 'newsletter-signup-form';
  form.method = 'post';
  if (actionLink) form.action = actionLink.href;
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'newsletter-signup-submit';
  submit.textContent = actionLink?.textContent.trim() || 'Subscribe';
  const emailRow = document.createElement('div');
  emailRow.className = 'newsletter-signup-email-row';
  emailRow.append(field(formId, 'email', 'Email Address', 'email', 'email'), submit);
  form.append(
    field(formId, 'firstName', 'First Name', 'text', 'given-name'),
    field(formId, 'lastName', 'Last Name', 'text', 'family-name'),
    emailRow,
  );
  if (!actionLink) {
    // no endpoint authored: keep the visitor on the page
    form.addEventListener('submit', (e) => e.preventDefault());
  }
  content.append(form);

  notes.forEach((note) => {
    note.className = 'newsletter-signup-note';
    content.append(note);
  });

  const children = [];
  if (icon) {
    icon.className = 'newsletter-signup-icon';
    children.push(icon);
  }
  children.push(content);
  // white card that sits inside the coloured band
  const panel = document.createElement('div');
  panel.className = 'newsletter-signup-panel';
  panel.append(...children);
  block.replaceChildren(panel);
}
