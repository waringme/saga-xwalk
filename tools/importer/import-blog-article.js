/* eslint-disable */
/* global WebImporter */

import noticeBannerParser from './parsers/notice-banner.js';
import breadcrumbContactBarParser from './parsers/breadcrumb-contact-bar.js';
import cardsCruiseParser from './parsers/cards-cruise.js';
import cardsArticleParser from './parsers/cards-article.js';
import sagaCleanupTransformer from './transformers/saga-cleanup.js';
import sagaSectionsTransformer from './transformers/saga-sections.js';

const PAGE_TEMPLATE = {
  "name": "blog-article",
  "urls": [
    "https://travel.saga.co.uk/cruises/cruise-blogs/destinations/ocean/british-isles/explore-vibrant-ports-scenery-british-isles-cruise.aspx",
    "https://travel.saga.co.uk/cruises/cruise-blogs/destinations/rivers/danube/sagas-wachau-valley-to-vienna-cruise-will-be-a-highlight.aspx",
    "https://travel.saga.co.uk/cruises/cruise-blogs/experiences/ocean/celebrity-guests/david-domoney-visits-canaries-gardens.aspx",
    "https://travel.saga.co.uk/cruises/cruise-blogs/experiences/ocean/celebrity-guests/stellar-line-up-of-entertainment.aspx",
    "https://travel.saga.co.uk/cruises/cruise-blogs/experiences/ocean/onboard/a-day-in-the-life-of-captain-simon-moore.aspx",
    "https://travel.saga.co.uk/cruises/cruise-blogs/experiences/ocean/onboard/the-extra-mile-saga-cruises-hate-hidden-costs.aspx",
    "https://travel.saga.co.uk/cruises/cruise-blogs/experiences/rivers/ships/celebrating-spirit-of-the-rhine.aspx",
    "https://travel.saga.co.uk/cruises/cruise-blogs/travel-advice/rivers/new-to-cruising/magic-of-a-mini-river-cruise.aspx"
  ],
  "coverageGaps": [],
  "description": "Long-form article page with body copy and images, closed by a row of related article cards",
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
      "name": "cards-cruise",
      "instances": [
        ".megaBlogEntry .app-GalleryWidget .owl-carousel"
      ]
    },
    {
      "name": "cards-article",
      "instances": [
        ".relatedBlogs ul.list-unstyled"
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
      "name": "article",
      "selector": [
        ".megaBlogEntry"
      ],
      "style": "article",
      "blocks": [
        "cards-cruise",
        "cards-article"
      ],
      "defaultContent": [
        ".megaBlogEntry > .container.mb-4",
        ".megaBlogEntry > .container:nth-of-type(2)",
        ".megaBlogEntry .app-GalleryWidget > h3.header",
        ".relatedBlogs > h3",
        ".relatedBlogs > a.linkCircle"
      ]
    }
  ]
};

const parsers = {
  'notice-banner': noticeBannerParser,
  'breadcrumb-contact-bar': breadcrumbContactBarParser,
  'cards-cruise': cardsCruiseParser,
  'cards-article': cardsArticleParser,
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
