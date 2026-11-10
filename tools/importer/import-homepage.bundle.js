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

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
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

  // tools/importer/parsers/hero-landing.js
  var ORIGIN = "https://travel.saga.co.uk";
  var clean2 = (text) => (text || "").replace(/\s+/g, " ").trim();
  var absolute = (url) => {
    const value = (url || "").trim();
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value.replace(/^(https?:\/\/[^/:]+):443(?=\/)/i, "$1");
    if (value.startsWith("//")) return `https:${value}`;
    if (value.startsWith("/")) return `${ORIGIN}${value}`;
    return value;
  };
  var backgroundUrl = (el) => {
    if (!el) return "";
    const style = el.getAttribute("style") || "";
    const match = style.match(/background-image\s*:\s*url\(\s*(?:&quot;|["'])?([^"')]+?)(?:&quot;|["'])?\s*\)/i);
    if (match && match[1]) return absolute(match[1]);
    return absolute(el.getAttribute("desktop") || el.getAttribute("mobile") || "");
  };
  function parse3(element, { document }) {
    const cells = [];
    const slide = element.querySelector(".bxslider > li:not(.bx-clone)") || element.querySelector(".bxslider > li");
    const heroSrc = backgroundUrl(slide);
    const heading = element.querySelector(".heroContentNoNavInnerContent h1, .heroContentNoNavInnerContent h2");
    const title = heading ? clean2(heading.textContent) : "";
    const imageFrag = document.createDocumentFragment();
    if (heroSrc) {
      const img = document.createElement("img");
      img.setAttribute("src", heroSrc);
      const spacer = slide && slide.querySelector("img");
      const spacerAlt = spacer ? clean2(spacer.getAttribute("alt")) : "";
      img.setAttribute("alt", spacerAlt && spacerAlt !== "*" ? spacerAlt : title);
      imageFrag.appendChild(document.createComment(" field:image "));
      imageFrag.appendChild(img);
    }
    cells.push([imageFrag]);
    const textFrag = document.createDocumentFragment();
    if (title) {
      const h1 = document.createElement("h1");
      h1.textContent = title;
      textFrag.appendChild(document.createComment(" field:text "));
      textFrag.appendChild(h1);
    }
    cells.push([textFrag]);
    const whichBox = element.querySelector(".whichBox");
    const badgeImg = whichBox ? whichBox.querySelector(".whichImage img") || whichBox.querySelector("img") : null;
    const badgeLink = badgeImg ? badgeImg.closest("a[href]") : null;
    const badgeFrag = document.createDocumentFragment();
    if (badgeImg && badgeImg.getAttribute("src")) {
      const img = document.createElement("img");
      img.setAttribute("src", absolute(badgeImg.getAttribute("src")));
      img.setAttribute("alt", clean2(badgeImg.getAttribute("alt")));
      badgeFrag.appendChild(document.createComment(" field:badge "));
      badgeFrag.appendChild(img);
    }
    cells.push([badgeFrag]);
    const taglineSource = whichBox ? whichBox.querySelector(".whichText") : null;
    const taglineText = taglineSource ? clean2(taglineSource.textContent) : "";
    const taglineFrag = document.createDocumentFragment();
    if (taglineText) {
      const p = document.createElement("p");
      if (badgeLink) {
        const a = document.createElement("a");
        a.setAttribute("href", absolute(badgeLink.getAttribute("href")));
        a.textContent = taglineText;
        p.appendChild(a);
      } else {
        p.textContent = taglineText;
      }
      taglineFrag.appendChild(document.createComment(" field:tagline "));
      taglineFrag.appendChild(p);
    }
    cells.push([taglineFrag]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-landing", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cruise-finder.js
  var RESULTS_FALLBACK = "https://travel.saga.co.uk/cruises";
  var clean3 = (text) => (text || "").replace(/\s+/g, " ").trim();
  var absolute2 = (url) => {
    const value = (url || "").trim();
    if (!value || value.startsWith("#") || /^javascript:/i.test(value)) return "";
    if (/^https?:\/\//i.test(value)) return value.replace(/^(https?:\/\/[^/:]+):443(?=\/)/i, "$1");
    if (value.startsWith("//")) return `https:${value}`;
    if (value.startsWith("/")) return `https://travel.saga.co.uk${value}`;
    return value;
  };
  var readSelect = (select) => {
    let placeholder = "";
    const options = [];
    Array.from(select ? select.querySelectorAll("option") : []).forEach((opt) => {
      const text = clean3(opt.textContent);
      if (!text) return;
      const value = opt.getAttribute("value");
      const isPlaceholder = value === "" || opt.hasAttribute("disabled") || opt.hasAttribute("hidden") || opt.classList.contains("removeOption");
      if (isPlaceholder && !placeholder) {
        placeholder = text;
        return;
      }
      options.push({ text, selected: opt.hasAttribute("selected") || opt.selected === true });
    });
    return { placeholder, options };
  };
  var mergeOptions = (lists) => {
    const seen = /* @__PURE__ */ new Set();
    const merged = [];
    lists.forEach((list) => list.forEach((opt) => {
      const key = opt.text.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      merged.push(opt);
    }));
    return merged;
  };
  function parse4(element, { document }) {
    const cells = [];
    const fieldRow = (label, options) => {
      if (!label || !options.length) return;
      const labelFrag = document.createDocumentFragment();
      labelFrag.appendChild(document.createComment(" field:label "));
      labelFrag.appendChild(document.createTextNode(label));
      const optionsFrag = document.createDocumentFragment();
      optionsFrag.appendChild(document.createComment(" field:options "));
      const ul = document.createElement("ul");
      options.forEach((opt) => {
        const li = document.createElement("li");
        if (opt.selected) {
          const strong = document.createElement("strong");
          strong.textContent = opt.text;
          li.appendChild(strong);
        } else {
          li.textContent = opt.text;
        }
        ul.appendChild(li);
      });
      optionsFrag.appendChild(ul);
      cells.push([labelFrag, optionsFrag]);
    };
    const tabs = Array.from(element.querySelectorAll("#searchTabs > li .searchContent"));
    const button = element.querySelector(".searchButtonHolder .searchButton, .searchButtonHolder button, .searchButtonHolder input");
    const buttonText = button ? clean3(button.getAttribute("value") || button.textContent) || "Search" : "Search";
    const form = element.closest("form");
    const resultsHref = absolute2(element.getAttribute("data-url") || form && form.getAttribute("action")) || RESULTS_FALLBACK;
    const linkFrag = document.createDocumentFragment();
    linkFrag.appendChild(document.createComment(" field:link "));
    const link = document.createElement("a");
    link.setAttribute("href", resultsHref);
    link.textContent = buttonText;
    linkFrag.appendChild(link);
    cells.push([linkFrag, ""]);
    const typeSelect = element.querySelector(".cruiseOptionFilter select");
    if (typeSelect) {
      const { placeholder, options } = readSelect(typeSelect);
      fieldRow(placeholder || "Cruise Type", options);
    }
    const regionSelects = tabs.map((tab) => tab.querySelector("select.locationField")).filter(Boolean);
    if (regionSelects.length) {
      const read = regionSelects.map(readSelect);
      const placeholder = (read.find((r) => r.placeholder) || {}).placeholder || "All regions";
      fieldRow(placeholder, mergeOptions(read.map((r) => r.options)));
    }
    const dateInputs = tabs.map((tab) => tab.querySelector(".dateField input")).filter(Boolean);
    if (dateInputs.length) {
      const label = clean3(dateInputs[0].getAttribute("value")) || "Any date";
      const months = mergeOptions(tabs.map((tab) => Array.from(tab.querySelectorAll(".datePickerMonths [data-value]")).map((cell) => ({ text: clean3(cell.getAttribute("data-value")), selected: false })).filter((m) => m.text)));
      fieldRow(label, months);
    }
    const paxSelects = tabs.map((tab) => tab.querySelector("select.passengers")).filter(Boolean);
    if (paxSelects.length) {
      const read = paxSelects.map(readSelect);
      const placeholder = (read.find((r) => r.placeholder) || {}).placeholder || "Passengers";
      fieldRow(placeholder, mergeOptions(read.map((r) => r.options)));
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cruise-finder", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-promo.js
  var clean4 = (text) => (text || "").replace(/\s+/g, " ").trim();
  var absolute3 = (url) => {
    const value = (url || "").trim();
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value.replace(/^(https?:\/\/[^/:]+):443(?=\/)/i, "$1");
    if (value.startsWith("//")) return `https:${value}`;
    if (value.startsWith("/")) return `https://travel.saga.co.uk${value}`;
    return value;
  };
  function parse5(element, { document }) {
    const cells = [];
    const image = (img) => {
      if (!img || !img.getAttribute("src")) return null;
      const el = document.createElement("img");
      el.setAttribute("src", absolute3(img.getAttribute("src")));
      el.setAttribute("alt", clean4(img.getAttribute("alt")));
      return el;
    };
    const heading = (h) => {
      if (!h || !clean4(h.textContent)) return null;
      const el = document.createElement("h3");
      el.textContent = clean4(h.textContent);
      return el;
    };
    const linkPara = (a) => {
      if (!a || !a.getAttribute("href") || !clean4(a.textContent)) return null;
      const p = document.createElement("p");
      const link = document.createElement("a");
      link.setAttribute("href", absolute3(a.getAttribute("href")));
      link.textContent = clean4(a.textContent);
      p.appendChild(link);
      return p;
    };
    const paragraphs = (scope) => Array.from(scope.querySelectorAll("p")).filter((p) => clean4(p.textContent)).map((p) => {
      p.querySelectorAll("a[href]").forEach((a) => a.setAttribute("href", absolute3(a.getAttribute("href"))));
      return p;
    });
    const card = element.classList.contains("componentCard") ? element : element.querySelector(".componentCard");
    if (card) {
      const imageCell = [];
      const img = image(card.querySelector(".componentCard_image img"));
      if (img) imageCell.push(img);
      const textCell = [];
      const content = card.querySelector(".componentCard_content") || card;
      const h = heading(content.querySelector("h1, h2, h3, h4, h5, h6"));
      if (h) textCell.push(h);
      textCell.push(...paragraphs(content.querySelector(".description") || content));
      const cta = linkPara(content.querySelector(":scope > a[href]"));
      if (cta) textCell.push(cta);
      cells.push([imageCell, textCell]);
    } else {
      const pods = Array.from(element.querySelectorAll(".pod")).filter((pod, i, all) => !all.some((other) => other !== pod && other.contains(pod)));
      const row = pods.map((pod) => {
        const cell = [];
        const imgHolder = pod.querySelector(".imgHolder");
        const img = image(imgHolder && imgHolder.querySelector("img") || pod.querySelector("img"));
        if (img) {
          const p = document.createElement("p");
          p.appendChild(img);
          cell.push(p);
        }
        const h = heading(pod.querySelector("h1, h2, h3, h4, h5, h6"));
        if (h) cell.push(h);
        const body = imgHolder ? imgHolder.parentElement : pod;
        cell.push(...paragraphs(body).filter((p) => !p.closest(".btn-group")));
        Array.from(pod.querySelectorAll(".btn-group a[href]")).forEach((a) => {
          const p = linkPara(a);
          if (p) cell.push(p);
        });
        Array.from(pod.querySelectorAll("a[href]")).filter((a) => !a.closest(".btn-group") && !a.closest("p") && !a.closest(".imgHolder") && !a.closest("h1, h2, h3, h4, h5, h6")).forEach((a) => {
          const p = linkPara(a);
          if (p) cell.push(p);
        });
        return cell;
      });
      if (row.length) cells.push(row);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns", variants: ["promo"], cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-awards.js
  var clean5 = (text) => (text || "").replace(/\s+/g, " ").trim();
  var absolute4 = (url) => {
    const value = (url || "").trim();
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value.replace(/^(https?:\/\/[^/:]+):443(?=\/)/i, "$1");
    if (value.startsWith("//")) return `https:${value}`;
    if (value.startsWith("/")) return `https://travel.saga.co.uk${value}`;
    return value;
  };
  function parse6(element, { document }) {
    const cells = [];
    const owlItems = Array.from(element.querySelectorAll(".owl-item"));
    const items = owlItems.length ? owlItems.filter((item) => !item.classList.contains("cloned")).map((item) => item.querySelector(".item") || item) : Array.from(element.querySelectorAll(".item"));
    items.forEach((item) => {
      const img = item.querySelector("img");
      const titleEl = item.querySelector("h1, h2, h3, h4, h5, h6");
      const paras = Array.from(item.querySelectorAll("p")).filter((p) => clean5(p.textContent));
      const link = img ? img.closest("a[href]") : null;
      const title = titleEl ? clean5(titleEl.textContent) : "";
      if (!img && !title && !paras.length) return;
      const imageFrag = document.createDocumentFragment();
      if (img && img.getAttribute("src")) {
        const image = document.createElement("img");
        image.setAttribute("src", absolute4(img.getAttribute("src")));
        image.setAttribute("alt", clean5(img.getAttribute("alt")) || title);
        imageFrag.appendChild(document.createComment(" field:media_image "));
        imageFrag.appendChild(image);
      }
      const textFrag = document.createDocumentFragment();
      const textNodes = [];
      if (title) {
        const h = document.createElement(titleEl.tagName.toLowerCase());
        if (link) {
          const a = document.createElement("a");
          a.setAttribute("href", absolute4(link.getAttribute("href")));
          a.textContent = title;
          h.appendChild(a);
        } else {
          h.textContent = title;
        }
        textNodes.push(h);
      }
      paras.forEach((p) => {
        const para = document.createElement("p");
        para.textContent = clean5(p.textContent);
        textNodes.push(para);
      });
      if (textNodes.length) {
        textFrag.appendChild(document.createComment(" field:content_text "));
        textNodes.forEach((n) => textFrag.appendChild(n));
      }
      cells.push([imageFrag, textFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-awards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-image-panel.js
  var clean6 = (text) => (text || "").replace(/\s+/g, " ").trim();
  var absolute5 = (url) => {
    const value = (url || "").trim();
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value.replace(/^(https?:\/\/[^/:]+):443(?=\/)/i, "$1");
    if (value.startsWith("//")) return `https:${value}`;
    if (value.startsWith("/")) return `https://travel.saga.co.uk${value}`;
    return value;
  };
  function parse7(element, { document }) {
    const cells = [];
    const imageCell = [];
    const src = element.querySelector(".fullwidthimageComponent_image img") || element.querySelector("img");
    if (src && src.getAttribute("src")) {
      const img = document.createElement("img");
      img.setAttribute("src", absolute5(src.getAttribute("src")));
      img.setAttribute("alt", clean6(src.getAttribute("alt")));
      imageCell.push(img);
    }
    const textCell = [];
    const header = element.querySelector(".fullwidthimageComponent_header") || element;
    const headingSrc = header.querySelector("h1, h2, h3, h4, h5, h6");
    if (headingSrc && clean6(headingSrc.textContent)) {
      const h3 = document.createElement("h3");
      h3.textContent = clean6(headingSrc.textContent);
      textCell.push(h3);
    }
    const content = element.querySelector(".fullwidthimageComponent_content") || element;
    Array.from(content.querySelectorAll("p")).filter((p) => clean6(p.textContent)).forEach((p) => {
      p.querySelectorAll("a[href]").forEach((a) => a.setAttribute("href", absolute5(a.getAttribute("href"))));
      textCell.push(p);
    });
    Array.from(content.querySelectorAll("a[href]")).filter((a) => !a.closest("p") && clean6(a.textContent)).forEach((a) => {
      const p = document.createElement("p");
      const link = document.createElement("a");
      link.setAttribute("href", absolute5(a.getAttribute("href")));
      link.textContent = clean6(a.textContent);
      p.appendChild(link);
      textCell.push(p);
    });
    const panelRight = element.classList.contains("contentRight");
    cells.push(panelRight ? [imageCell, textCell] : [textCell, imageCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "columns", variants: ["imagepanel"], cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/newsletter-signup.js
  var ORIGIN2 = "https://travel.saga.co.uk";
  var clean7 = (text) => (text || "").replace(/\s+/g, " ").trim();
  var absolute6 = (url) => {
    const value = (url || "").trim();
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value.replace(/^(https?:\/\/[^/:]+):443(?=\/)/i, "$1");
    if (value.startsWith("//")) return `https:${value}`;
    if (value.startsWith("/")) return `${ORIGIN2}${value}`;
    return value;
  };
  function parse8(element, { document }) {
    const cells = [];
    const body = element.querySelector(".banner-body") || element;
    const form = body.querySelector("form");
    const imageFrag = document.createDocumentFragment();
    const icon = element.querySelector(".banner-image img");
    if (icon && icon.getAttribute("src")) {
      const img = document.createElement("img");
      const iconSrc = absolute6(icon.getAttribute("src"));
      img.setAttribute("src", /\.svg$/i.test(iconSrc) ? `${iconSrc}?format=svg` : iconSrc);
      const alt = clean7(icon.getAttribute("alt"));
      img.setAttribute("alt", alt && alt !== "null" ? alt : "Envelope");
      imageFrag.appendChild(document.createComment(" field:image "));
      imageFrag.appendChild(img);
    }
    cells.push([imageFrag]);
    const textFrag = document.createDocumentFragment();
    const textNodes = [];
    const heading = Array.from(body.querySelectorAll("h1, h2, h3, h4, h5, h6")).find((h) => !h.closest("form"));
    if (heading && clean7(heading.textContent)) {
      const h2 = document.createElement("h2");
      h2.textContent = clean7(heading.textContent);
      textNodes.push(h2);
    }
    const intro = body.querySelector(".intro");
    if (intro) {
      Array.from(intro.querySelectorAll("p")).filter((p) => clean7(p.textContent)).forEach((p) => {
        const para = document.createElement("p");
        para.textContent = clean7(p.textContent);
        textNodes.push(para);
      });
    }
    if (textNodes.length) {
      textFrag.appendChild(document.createComment(" field:text "));
      textNodes.forEach((n) => textFrag.appendChild(n));
    }
    cells.push([textFrag]);
    const linkFrag = document.createDocumentFragment();
    const action = form ? absolute6(form.getAttribute("action")) : "";
    const submit = form ? form.querySelector('button, input[type="submit"]') : null;
    const label = submit ? clean7(submit.textContent || submit.getAttribute("value")) : "";
    if (action) {
      const a = document.createElement("a");
      a.setAttribute("href", action);
      a.textContent = label || "Subscribe";
      linkFrag.appendChild(document.createComment(" field:link "));
      linkFrag.appendChild(a);
    }
    cells.push([linkFrag]);
    const noteFrag = document.createDocumentFragment();
    const notes = Array.from(body.querySelectorAll("p")).filter((p) => clean7(p.textContent) && !p.closest("form") && !p.closest(".intro") && !p.closest(".banner-result") && !p.classList.contains("validation-message"));
    if (notes.length) {
      noteFrag.appendChild(document.createComment(" field:note "));
      notes.forEach((p) => {
        p.querySelectorAll("a[href]").forEach((a) => a.setAttribute("href", absolute6(a.getAttribute("href"))));
        noteFrag.appendChild(p);
      });
    }
    cells.push([noteFrag]);
    const block = WebImporter.Blocks.createBlock(document, { name: "newsletter-signup", cells });
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

  // tools/importer/import-homepage.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "notice-banner": parse,
    "breadcrumb-contact-bar": parse2,
    "hero-landing": parse3,
    "cruise-finder": parse4,
    "columns-promo": parse5,
    "carousel-awards": parse6,
    "columns-image-panel": parse7,
    "newsletter-signup": parse8
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
  var import_homepage_default = {
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
  return __toCommonJS(import_homepage_exports);
})();
