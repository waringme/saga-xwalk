import decoratePromo from './promo.js';
import decorateImagePanel from './image-panel.js';

// variants with their own layout: Columns (promo), Columns (imagepanel)
// (single-word names: the AEM content format turns a hyphen into a space, i.e. two classes)
const VARIANTS = {
  promo: decoratePromo,
  imagepanel: decorateImagePanel,
};

export default function decorate(block) {
  const variant = Object.keys(VARIANTS).find((v) => block.classList.contains(v));
  if (variant) {
    VARIANTS[variant](block);
    return;
  }

  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
}
