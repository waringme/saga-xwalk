/* eslint-disable */
/* global WebImporter */

import noticeBannerParser from './parsers/notice-banner.js';
import breadcrumbContactBarParser from './parsers/breadcrumb-contact-bar.js';
import heroLandingParser from './parsers/hero-landing.js';
import cruiseFinderParser from './parsers/cruise-finder.js';
import columnsPromoParser from './parsers/columns-promo.js';
import carouselAwardsParser from './parsers/carousel-awards.js';
import columnsImagePanelParser from './parsers/columns-image-panel.js';
import newsletterSignupParser from './parsers/newsletter-signup.js';
import sagaCleanupTransformer from './transformers/saga-cleanup.js';
import sagaSectionsTransformer from './transformers/saga-sections.js';

const PAGE_TEMPLATE = {
  "name": "homepage",
  "urls": [
    "https://travel.saga.co.uk/cruises"
  ],
  "coverageGaps": [],
  "description": "Brand home page with a hero banner, cruise finder search, promo columns, awards carousel, membership accordion and newsletter signup",
  "blocks": [
    {
      "name": "notice-banner",
      "instances": [
        "#dmpg-banner"
      ]
    },
    {
      "name": "breadcrumb-contact-bar",
      "instances": [
        ".breadcrumbUtilityContainer .breadcrumbUtility > .container"
      ]
    },
    {
      "name": "hero-landing",
      "instances": [
        "#slider"
      ]
    },
    {
      "name": "cruise-finder",
      "instances": [
        "#searchControl"
      ]
    },
    {
      "name": "columns-promo",
      "instances": [
        ".podBlock .grouper-pod:not(#whichForMob):not(:has(.componentCard)):has(img)",
        ".podBlock .componentCard.fullWidth"
      ]
    },
    {
      "name": "carousel-awards",
      "instances": [
        ".carouselLogo .owl-carousel"
      ]
    },
    {
      "name": "columns-image-panel",
      "instances": [
        ".fullwidthimageComponent"
      ]
    },
    {
      "name": "newsletter-signup",
      "instances": [
        "#email-only-banner"
      ]
    }
  ],
  "sections": [
    {
      "id": "section-1",
      "name": "notice-banner",
      "selector": [
        "#dmpg-banner-wrap"
      ],
      "style": "light-green",
      "blocks": [
        "notice-banner"
      ],
      "defaultContent": []
    },
    {
      "id": "section-2",
      "name": "breadcrumb-contact-bar",
      "selector": [
        ".breadcrumbUtilityContainer"
      ],
      "style": "light-teal",
      "blocks": [
        "breadcrumb-contact-bar"
      ],
      "defaultContent": []
    },
    {
      "id": "section-3",
      "name": "hero-and-cruise-finder",
      "selector": [
        "#slider"
      ],
      "style": null,
      "blocks": [
        "hero-landing",
        "cruise-finder"
      ],
      "defaultContent": []
    },
    {
      "id": "section-4",
      "name": "promo-offers",
      "selector": [
        ".podBlock > .row > div:nth-child(2)"
      ],
      "style": null,
      "blocks": [
        "columns-promo"
      ],
      "defaultContent": []
    },
    {
      "id": "section-5",
      "name": "intro",
      "selector": [
        ".podBlock > .row > .pod12x2"
      ],
      "style": "centered",
      "blocks": [],
      "defaultContent": [
        ".podBlock .intro-pod"
      ]
    },
    {
      "id": "section-6",
      "name": "awards",
      "selector": [
        ".podBlock > .row > .cruise-section:has(.carouselLogo)"
      ],
      "style": null,
      "blocks": [
        "carousel-awards"
      ],
      "defaultContent": [
        ".carouselLogo > h3",
        ".podBlock .button-pod"
      ]
    },
    {
      "id": "section-7",
      "name": "image-panels",
      "selector": [
        ".podBlock > .row > .cruise-section:has(.fullwidthimageComponent)"
      ],
      "style": null,
      "blocks": [
        "columns-image-panel"
      ],
      "defaultContent": []
    },
    {
      "id": "section-8",
      "name": "love-it-guarantee",
      "selector": [
        ".podBlock > .row > div:nth-child(9)"
      ],
      "style": null,
      "blocks": [
        "columns-promo"
      ],
      "defaultContent": []
    },
    {
      "id": "section-9",
      "name": "important-information",
      "selector": [
        ".insurance-notification"
      ],
      "style": "light-grey",
      "blocks": [],
      "defaultContent": [
        ".insurance-notification > div"
      ]
    },
    {
      "id": "section-10",
      "name": "newsletter",
      "selector": [
        "#email-only-banner"
      ],
      "style": null,
      "blocks": [
        "newsletter-signup"
      ],
      "defaultContent": []
    },
    {
      "id": "section-11",
      "name": "facebook",
      "selector": [
        ".podBlock > .row > .componentCard.fullWidth"
      ],
      "style": null,
      "blocks": [
        "columns-promo"
      ],
      "defaultContent": []
    }
  ]
};

const parsers = {
  'notice-banner': noticeBannerParser,
  'breadcrumb-contact-bar': breadcrumbContactBarParser,
  'hero-landing': heroLandingParser,
  'cruise-finder': cruiseFinderParser,
  'columns-promo': columnsPromoParser,
  'carousel-awards': carouselAwardsParser,
  'columns-image-panel': columnsImagePanelParser,
  'newsletter-signup': newsletterSignupParser,
};
const transformers = [sagaCleanupTransformer, sagaSectionsTransformer];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // Source pages are ASP.NET (.aspx); drop the extension for clean EDS paths.
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.(html?|aspx)$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
