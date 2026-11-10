import { toClassName } from '../../scripts/aem.js';

const STORAGE_PREFIX = 'notice-banner-dismissed:';

/**
 * Whether the page is open in Universal Editor; a dismissed notice must stay editable there.
 * @param {Element} block
 * @returns {boolean}
 */
function isEditing(block) {
  return block.hasAttribute('data-aue-resource') || !!block.closest('[data-aue-resource]');
}

/**
 * Notice banner: a short heading + text strip with an accent bar and a close button.
 * Dismissal is remembered for the browser session, per notice (keyed on its heading).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const content = document.createElement('div');
  content.className = 'notice-banner-content';
  [...block.querySelectorAll(':scope > div > div')].forEach((cell) => {
    content.append(...cell.childNodes);
  });

  const heading = content.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) heading.classList.add('notice-banner-title');
  const key = STORAGE_PREFIX + toClassName((heading || content).textContent.trim().slice(0, 80));

  const editing = isEditing(block);
  try {
    if (!editing && window.sessionStorage.getItem(key)) {
      block.closest('.notice-banner-wrapper')?.remove();
      block.remove();
      return;
    }
  } catch (e) {
    // storage unavailable: always show
  }

  block.setAttribute('role', 'region');
  block.setAttribute('aria-label', heading?.textContent.trim() || 'Notice');

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'notice-banner-close';
  close.setAttribute('aria-label', 'Dismiss notice');
  close.addEventListener('click', () => {
    if (editing) return;
    try {
      window.sessionStorage.setItem(key, '1');
    } catch (e) {
      // storage unavailable: dismiss for this page view only
    }
    const wrapper = block.closest('.notice-banner-wrapper');
    (wrapper || block).remove();
  });

  block.replaceChildren(content, close);
}
