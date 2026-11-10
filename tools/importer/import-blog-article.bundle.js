/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-blog-article.js
  var import_blog_article_exports = {};
  __export(import_blog_article_exports, {
    default: () => import_blog_article_default
  });

  // tools/importer/parsers/notice-banner.js
  function parse(element, { document }) {
    const cells = [];
    const textFrag = document.createDocumentFragment();
    const title = element.querySelector(".dmpg-title, h1, h2, h3, h4, h5, h6");
    const paragraphs = Array.from(element.querySelectorAll("p.dmpg-text"));
    const fallbackParagraphs = paragraphs.length ? paragraphs : Array.from(element.querySelectorAll(":scope > p"));
    if (title || fallbackParagraphs.length) {
      textFrag.appendChild(document.createComment(" field:text "));
      if (title) {
        const heading = /^H[1-6]$/.test(title.tagName) ? title : document.createElement("h4");
        if (heading !== title) heading.textContent = title.textContent.trim();
        textFrag.appendChild(heading);
      }
      fallbackParagraphs.forEach((p) => textFrag.appendChild(p));
    }
    cells.push([textFrag]);
    const block = WebImporter.Blocks.createBlock(document, { name: "notice-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/breadcrumb-contact-bar.js
  var clean = (text) => (text || "").replace(/\s+/g, " ").trim();
  function parse2(element, { document }) {
    const cells = [];
    const breadcrumbFrag = document.createDocumentFragment();
    const trail = element.querySelector(".breadcrumbContent");
    if (trail) {
      const ul = document.createElement("ul");
      Array.from(trail.children).forEach((node) => {
        const label = clean(node.textContent);
        if (!label) return;
        const li = document.createElement("li");
        if (node.tagName === "A" && node.getAttribute("href")) {
          const a = document.createElement("a");
          a.setAttribute("href", node.getAttribute("href"));
          a.textContent = label;
          li.appendChild(a);
        } else {
          li.textContent = label;
        }
        ul.appendChild(li);
      });
      if (ul.children.length) {
        breadcrumbFrag.appendChild(document.createComment(" field:breadcrumb "));
        breadcrumbFrag.appendChild(ul);
      }
    }
    cells.push([breadcrumbFrag]);
    const contactFrag = document.createDocumentFragment();
    const contactParts = [];
    const book = element.querySelector(".contactWidget #book, .contactWidget p:first-of-type");
    if (book) {
      const phone = book.querySelector("a.contactWidget__phone, a.InfinityNumber, a");
      const p = document.createElement("p");
      if (phone && clean(phone.textContent)) {
        const number = clean(phone.textContent);
        const before = clean(book.textContent.split(phone.textContent)[0]);
        const after = clean(book.textContent.split(phone.textContent).slice(1).join(" "));
        if (before) p.appendChild(document.createTextNode(`${before} `));
        const a = document.createElement("a");
        const href = phone.getAttribute("href");
        a.setAttribute("href", href && href.startsWith("tel:") ? href : `tel:${number.replace(/[^\d+]/g, "")}`);
        a.textContent = number;
        p.appendChild(a);
        if (after) p.appendChild(document.createTextNode(` ${after}`));
      } else {
        p.textContent = clean(book.textContent);
      }
      if (clean(p.textContent)) contactParts.push(p);
    }
    const status = element.querySelector(".contactWidget #openMsg");
    if (status && clean(status.textContent)) {
      const p = document.createElement("p");
      p.textContent = clean(status.textContent);
      contactParts.push(p);
    }
    if (contactParts.length) {
      contactFrag.appendChild(document.createComment(" field:contact "));
      contactParts.forEach((p) => contactFrag.appendChild(p));
    }
    cells.push([contactFrag]);
    const block = WebImporter.Blocks.createBlock(document, { name: "breadcrumb-contact-bar", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-cruise.js
  var clean2 = (text) => (text || "").replace(/\s+/g, " ").trim();
  var normaliseHref = (href) => (href || "").replace(/^(https?:\/\/[^/:]+):443(?=\/)/i, "$1");
  function parse3(element, { document }) {
    const cells = [];
    const cards = Array.from(element.querySelectorAll(".owl-item:not(.cloned) .product-list-widget"));
    cards.forEach((card) => {
      const link = card.querySelector("a[href]");
      const href = link ? normaliseHref(link.getAttribute("href")) : "";
      const img = card.querySelector(".widgetImageHolder img, img");
      const title = card.querySelector(".searchResult-content h2, .searchResult-content h3, h2, h3");
      const place = card.querySelector(".place");
      const departure = card.querySelector(".departure");
      const nights = card.querySelector(".passAndNights");
      const offer = card.querySelector(".offer");
      const priceFrom = card.querySelector(".priceFrom");
      const smallPrint = card.querySelector(".priceContainer p.mt-1");
      const imageFrag = document.createDocumentFragment();
      if (img && img.getAttribute("src")) {
        const image = document.createElement("img");
        image.setAttribute("src", img.getAttribute("src"));
        image.setAttribute("alt", img.getAttribute("alt") || img.getAttribute("title") || "");
        imageFrag.appendChild(document.createComment(" field:image "));
        imageFrag.appendChild(image);
      }
      const textFrag = document.createDocumentFragment();
      const textNodes = [];
      if (title && clean2(title.textContent)) {
        const h = document.createElement("h3");
        if (href) {
          const a = document.createElement("a");
          a.setAttribute("href", href);
          a.textContent = clean2(title.textContent);
          h.appendChild(a);
        } else {
          h.textContent = clean2(title.textContent);
        }
        textNodes.push(h);
      }
      [place, departure, nights].forEach((node) => {
        if (node && clean2(node.textContent)) {
          const p = document.createElement("p");
          p.textContent = clean2(node.textContent);
          textNodes.push(p);
        }
      });
      if (textNodes.length) {
        textFrag.appendChild(document.createComment(" field:text "));
        textNodes.forEach((n) => textFrag.appendChild(n));
      }
      const offerFrag = document.createDocumentFragment();
      if (offer && clean2(offer.textContent)) {
        offerFrag.appendChild(document.createComment(" field:offer "));
        const p = document.createElement("p");
        p.textContent = clean2(offer.textContent);
        offerFrag.appendChild(p);
      }
      const priceFrag = document.createDocumentFragment();
      const priceNodes = [];
      if (priceFrom && clean2(priceFrom.textContent)) {
        const p = document.createElement("p");
        const amount = priceFrom.querySelector(".price");
        if (amount && clean2(amount.textContent)) {
          const parts = priceFrom.textContent.split(amount.textContent);
          const before = clean2(parts[0]);
          const after = clean2(parts.slice(1).join(" "));
          if (before) p.appendChild(document.createTextNode(`${before} `));
          const strong = document.createElement("strong");
          strong.textContent = clean2(amount.textContent);
          p.appendChild(strong);
          if (after) p.appendChild(document.createTextNode(` ${after}`));
        } else {
          p.textContent = clean2(priceFrom.textContent);
        }
        priceNodes.push(p);
      }
      if (smallPrint && clean2(smallPrint.textContent)) {
        const p = document.createElement("p");
        p.textContent = clean2(smallPrint.textContent);
        priceNodes.push(p);
      }
      if (priceNodes.length) {
        priceFrag.appendChild(document.createComment(" field:price "));
        priceNodes.forEach((n) => priceFrag.appendChild(n));
      }
      cells.push([imageFrag, textFrag, offerFrag, priceFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-cruise", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-article.js
  var clean3 = (text) => (text || "").replace(/\s+/g, " ").trim();
  var HEADINGS = "h1, h2, h3, h4, h5, h6";
  function buildImageCell(document, img) {
    const frag = document.createDocumentFragment();
    if (img && img.getAttribute("src")) {
      const image = document.createElement("img");
      image.setAttribute("src", img.getAttribute("src"));
      image.setAttribute("alt", img.getAttribute("alt") || "");
      frag.appendChild(document.createComment(" field:image "));
      frag.appendChild(image);
    }
    return frag;
  }
  function buildTextCell(document, { category, title, href, summary }) {
    const frag = document.createDocumentFragment();
    const nodes = [];
    if (category && clean3(category.textContent)) {
      const p = document.createElement("p");
      p.textContent = clean3(category.textContent);
      nodes.push(p);
    }
    if (title && clean3(title.textContent)) {
      const h = document.createElement(title.tagName.toLowerCase());
      if (href) {
        const a = document.createElement("a");
        a.setAttribute("href", href);
        a.textContent = clean3(title.textContent);
        h.appendChild(a);
      } else {
        h.textContent = clean3(title.textContent);
      }
      nodes.push(h);
    }
    if (summary && clean3(summary.textContent)) {
      const p = document.createElement("p");
      p.textContent = clean3(summary.textContent);
      nodes.push(p);
    }
    if (nodes.length) {
      frag.appendChild(document.createComment(" field:text "));
      nodes.forEach((n) => frag.appendChild(n));
    }
    return frag;
  }
  function parse4(element, { document }) {
    const cells = [];
    const isTiles = element.matches(".grouper-pod") || !!element.closest(".podBlock");
    if (isTiles) {
      Array.from(element.querySelectorAll("a.imageStripPod")).forEach((tile) => {
        const img = tile.querySelector("img");
        const title = tile.querySelector(HEADINGS);
        cells.push([
          buildImageCell(document, img),
          buildTextCell(document, { title, href: tile.getAttribute("href") || "" })
        ]);
      });
    } else {
      Array.from(element.querySelectorAll("li.blogEntry")).forEach((item) => {
        const link = item.querySelector("a.blogEntryInner[href]") || item.querySelector("a[href]");
        const content = item.querySelector(".blogEntryContent") || item;
        cells.push([
          buildImageCell(document, item.querySelector(".blogImage img") || item.querySelector("img")),
          buildTextCell(document, {
            category: content.querySelector("p.blogTitle"),
            title: content.querySelector(HEADINGS),
            href: link ? link.getAttribute("href") : "",
            summary: content.querySelector("p:not(.blogTitle)")
          })
        ]);
      });
    }
    const name = isTiles ? "cards-article (tiles)" : "cards-article";
    const block = WebImporter.Blocks.createBlock(document, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/saga-cleanup.js
  var BEFORE_SELECTORS = [
    // Global header / navigation (gn21 mega nav)
    "#gn21",
    "header",
    "nav",
    // Skip links and empty anchors / spacers
    "a.sr-only",
    "a.gn21-skip-to-main",
    "a#Content",
    "#gn21-content-start",
    "#navSpacer",
    // Utility-bar search widgets (not authorable; outside the breadcrumb/contact container)
    "#searchMobile",
    ".isSearchMiniCollapse",
    ".isSearchBoxOpen",
    ".cruiseMiniSearch",
    // Notice banner dismiss button (the notice-banner block draws its own)
    "#dmpg-close-btn",
    // Owl carousel UI: arrows, counter and dots are drawn by the block code;
    // cloned items would produce duplicate cards
    ".owl-nav",
    ".owl-dots",
    ".owl-item.cloned",
    // Mobile-only blog filter dropdown (the desktop pills become the blog-filter block)
    ".filterSection > a.mobileFilter",
    "#blogFilterSelect",
    // Hidden mobile-only duplicate of the Which? award pod on the homepage
    "#whichForMob",
    // Hidden date/duration picker beside the cruise search (the cruise-finder block has its own options)
    "#facetDateAndDuration",
    // Footer
    "#gn-footer-2021",
    "footer",
    // Cookie banner / consent / overlays / lightbox
    "#onetrust-consent-sdk",
    ".dmpg-consent-overlay",
    "#lightboxOverlay",
    "#lightbox",
    // Tracking / analytics params and hidden inputs
    "#adl_params",
    "#sagaVersionAndServer",
    "#websiteVersion",
    'input[type="hidden"]',
    "iframe",
    "script",
    "style",
    "noscript",
    "link"
  ];
  var AFTER_SELECTORS = [
    "header",
    "footer",
    "nav",
    "iframe",
    "script",
    "style",
    "noscript",
    "link",
    "input",
    "button"
  ];
  function removeSvgSprite(element) {
    element.querySelectorAll('img[src^="data:image/svg+xml"]').forEach((img) => {
      const parent = img.parentElement;
      if (parent && parent.tagName === "DIV" && parent.children.length === 1 && !parent.textContent.trim()) {
        parent.remove();
      } else {
        img.remove();
      }
    });
  }
  function removeEmptyHolders(element) {
    element.querySelectorAll("div.blockHolder").forEach((el) => {
      if (!el.textContent.trim() && !el.querySelector("img, picture")) el.remove();
    });
    element.querySelectorAll("#slider").forEach((el) => {
      if (!el.querySelector(".bxslider > li")) el.remove();
    });
  }
  function markButtons(element, document) {
    element.querySelectorAll(".button-pod a").forEach((a) => {
      if (a.closest("em")) return;
      const em = document.createElement("em");
      a.replaceWith(em);
      em.append(a);
    });
    element.querySelectorAll("#loadMore a").forEach((a) => {
      if (a.closest("strong")) return;
      const strong = document.createElement("strong");
      a.replaceWith(strong);
      strong.append(a);
    });
  }
  function stripTrackingAttributes(element) {
    element.querySelectorAll("*").forEach((el) => {
      [...el.attributes].forEach(({ name }) => {
        if (name.startsWith("data-excat-")) return;
        if (name.startsWith("on") || name.startsWith("data-") || name.startsWith("aria-") || name === "style" || name === "tabindex" || name === "role") {
          el.removeAttribute(name);
        }
      });
    });
  }
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      WebImporter.DOMUtils.remove(element, BEFORE_SELECTORS);
      removeEmptyHolders(element);
      removeSvgSprite(element);
      markButtons(element, payload.document);
    }
    if (hookName === "afterTransform") {
      WebImporter.DOMUtils.remove(element, AFTER_SELECTORS);
      stripTrackingAttributes(element);
    }
  }

  // tools/importer/transformers/saga-sections.js
  var MARKER = "data-excat-section-id";
  function findSectionElement(root, section) {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (const sel of selectors) {
      if (!sel) continue;
      try {
        const el = root.querySelector(sel);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function getSections(payload) {
    const sections = payload && payload.template && payload.template.sections;
    return Array.isArray(sections) ? sections : [];
  }
  function transform2(hookName, element, payload) {
    const sections = getSections(payload);
    if (sections.length < 2) return;
    const doc = element.ownerDocument || payload.document;
    if (hookName === "beforeTransform") {
      const resolved = sections.map((section) => ({ section, el: findSectionElement(element, section) })).filter(({ el }) => el);
      if (!resolved.length) return;
      const firstEl = resolved[0].el;
      for (let i = resolved.length - 1; i >= 0; i -= 1) {
        const { section, el } = resolved[i];
        const isFirst = el === firstEl;
        if (isFirst && !section.style) continue;
        const hr = doc.createElement("hr");
        if (section.style) hr.setAttribute(MARKER, section.id);
        if (isFirst) hr.setAttribute("data-excat-section-first", "true");
        el.parentNode.insertBefore(hr, el);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
        const anchor = marker || findSectionElement(element, section);
        if (!anchor) continue;
        const metadata = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadata);
        if (marker) {
          marker.removeAttribute(MARKER);
          if (marker.hasAttribute("data-excat-section-first")) {
            marker.remove();
          }
        }
      }
    }
  }

  // tools/importer/import-blog-article.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "notice-banner": parse,
    "breadcrumb-contact-bar": parse2,
    "cards-cruise": parse3,
    "cards-article": parse4
  };
  var transformers = [transform, transform2];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
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
  var import_blog_article_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document.createElement("hr"));
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.(html?|aspx)$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_blog_article_exports);
})();
