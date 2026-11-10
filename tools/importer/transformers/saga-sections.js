/* eslint-disable */
/* global WebImporter */

/**
 * Section breaks + Section Metadata for travel.saga.co.uk templates.
 * Driven entirely by payload.template.sections ({ id, selector[], style }).
 *
 * beforeTransform: insert <hr> before every non-first section (while the
 *   parser target elements still exist). Styled sections get a temporary
 *   data-excat-section-id marker on their <hr>; a styled first section gets
 *   a temporary marked <hr> too.
 * afterTransform: add a Section Metadata block after each marker, strip the
 *   marker, and drop the first section's temporary <hr>.
 */

const MARKER = 'data-excat-section-id';

function findSectionElement(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (const sel of selectors) {
    if (!sel) continue;
    try {
      const el = root.querySelector(sel);
      if (el) return el;
    } catch (e) {
      // invalid selector, try the next one
    }
  }
  return null;
}

function getSections(payload) {
  const sections = payload && payload.template && payload.template.sections;
  return Array.isArray(sections) ? sections : [];
}

export default function transform(hookName, element, payload) {
  const sections = getSections(payload);
  if (sections.length < 2) return;
  const doc = element.ownerDocument || payload.document;

  if (hookName === 'beforeTransform') {
    // Resolve elements first; optional sections (missing on some pages) are skipped
    const resolved = sections
      .map((section) => ({ section, el: findSectionElement(element, section) }))
      .filter(({ el }) => el);
    if (!resolved.length) return;
    const firstEl = resolved[0].el;

    for (let i = resolved.length - 1; i >= 0; i -= 1) {
      const { section, el } = resolved[i];
      const isFirst = el === firstEl;
      if (isFirst && !section.style) continue;
      const hr = doc.createElement('hr');
      if (section.style) hr.setAttribute(MARKER, section.id);
      if (isFirst) hr.setAttribute('data-excat-section-first', 'true');
      el.parentNode.insertBefore(hr, el);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;
      const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
      const anchor = marker || findSectionElement(element, section);
      if (!anchor) continue;

      const metadata = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadata);

      if (marker) {
        marker.removeAttribute(MARKER);
        if (marker.hasAttribute('data-excat-section-first')) {
          marker.remove();
        }
      }
    }
  }
}
