/* eslint-disable */
/* global WebImporter */

import noticeBannerParser from './parsers/notice-banner.js';
import breadcrumbContactBarParser from './parsers/breadcrumb-contact-bar.js';
import cardsArticleParser from './parsers/cards-article.js';
import blogFilterParser from './parsers/blog-filter.js';
import searchBlogParser from './parsers/search-blog.js';
import sagaCleanupTransformer from './transformers/saga-cleanup.js';
import sagaSectionsTransformer from './transformers/saga-sections.js';

const PAGE_TEMPLATE = {
  "name": "blog-landing",
  "urls": [
    "https://travel.saga.co.uk/cruises/cruise-blogs.aspx"
  ],
  "coverageGaps": [],
  "description": "Section landing page with a page title and keyword search, followed by a grid of article teaser cards and promo columns",
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
      "name": "cards-article",
      "instances": [
        ".podBlock .grouper-pod",
        ".blogentries"
      ]
    },
    {
      "name": "blog-filter",
      "instances": [
        "#mobileFilters ul.pills"
      ]
    },
    {
      "name": "search-blog",
      "instances": [
        "#mobileFilters > .row.mb-3.text-left"
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
      "name": "intro-and-category-tiles",
      "selector": [
        ".contentHolder .blockHolder"
      ],
      "style": "centered",
      "blocks": [
        "cards-article"
      ],
      "defaultContent": [
        ".podBlock .intro-pod"
      ]
    },
    {
      "id": "section-4",
      "name": "filters-and-search",
      "selector": [
        ".filtersWrapper"
      ],
      "style": null,
      "blocks": [
        "blog-filter",
        "search-blog"
      ],
      "defaultContent": []
    },
    {
      "id": "section-5",
      "name": "article-listing",
      "selector": [
        ".outerRow .col-12:has(> .blogentries)"
      ],
      "style": "centered-text",
      "blocks": [
        "cards-article"
      ],
      "defaultContent": [
        ".blogCount",
        "#loadMore"
      ]
    }
  ]
};

const parsers = {
  'notice-banner': noticeBannerParser,
  'breadcrumb-contact-bar': breadcrumbContactBarParser,
  'cards-article': cardsArticleParser,
  'blog-filter': blogFilterParser,
  'search-blog': searchBlogParser,
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
