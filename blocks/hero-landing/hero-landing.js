/**
 * Landing hero: a full-width background photo with a large title, an optional award badge
 * image and a tagline layered over it.
 * The first picture in the block is the background; everything else (title, badge, tagline,
 * links) is content shown in authored order.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const background = block.querySelector('picture');

  const media = document.createElement('div');
  media.className = 'hero-landing-media';
  if (background) {
    const holder = background.parentElement;
    media.append(background);
    if (holder && holder.tagName === 'P' && !holder.textContent.trim() && !holder.children.length) {
      holder.remove();
    }
    const img = background.querySelector('img');
    if (img) {
      img.loading = 'eager';
      img.fetchPriority = 'high';
    }
  }

  const content = document.createElement('div');
  content.className = 'hero-landing-content';
  [...block.querySelectorAll(':scope > div > div')].forEach((cell) => {
    content.append(...cell.childNodes);
  });

  // any further picture is the badge
  content.querySelectorAll('picture').forEach((pic) => {
    const holder = pic.parentElement;
    const target = holder && holder.tagName === 'P' && holder.children.length === 1 ? holder : pic;
    target.classList.add('hero-landing-badge');
  });

  const heading = content.querySelector('h1, h2');
  if (heading) heading.classList.add('hero-landing-title');

  block.replaceChildren(...[background ? media : null, content].filter(Boolean));
  if (!background) block.classList.add('no-image');
}
