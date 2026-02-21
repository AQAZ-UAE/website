/**
 * iPoint Rendering Engine
 * Fetches product data from JSON files and dynamically renders
 * all product sections on the homepage.
 */

(function () {
  "use strict";

  // ── Cache ────────────────────────────────────────────
  let productsMap = {}; // id → product
  let sectionsData = {}; // raw sections.json

  // ── Bootstrap ────────────────────────────────────────
  async function initSite() {
    try {
      const [products, sections] = await Promise.all([
        fetch("data/products.json").then((r) => r.json()),
        fetch("data/sections.json").then((r) => r.json()),
      ]);

      // Build lookup map
      products.forEach((p) => {
        productsMap[p.id] = p;
      });
      sectionsData = sections;

      // Render every section
      renderHotSelling();
      renderNationalDaySale();
      renderFeaturedCollections();
      renderBestSellers();
      renderPromoBanners();
      renderNavDropdown(products);

      // Re-init interactive features from script.js
      if (typeof window.reinitSliders === "function") {
        window.reinitSliders();
      }
    } catch (err) {
      console.error("[iPoint] Failed to load product data:", err);
    }
  }

  // ── Helpers ──────────────────────────────────────────
  function getProduct(id) {
    return productsMap[id] || null;
  }

  function calcDiscount(price, oldPrice) {
    if (!oldPrice || oldPrice <= price) return 0;
    return Math.round(((oldPrice - price) / oldPrice) * 100);
  }

  function formatPrice(val) {
    if (!val && val !== 0) return "";
    return val.toLocaleString("en-US");
  }

  function stockPercent(available) {
    // Cap at 100, minimum 3% so the bar is always a bit visible
    return Math.max(3, Math.min(available, 100));
  }

  // ── 1) Hot Selling ───────────────────────────────────
  function renderHotSelling() {
    const slider = document.getElementById("hotSellingSlider");
    if (!slider) return;

    const section = sectionsData.hotSelling;
    if (!section || !section.items) return;

    const sorted = [...section.items].sort((a, b) => a.order - b.order);

    slider.innerHTML = sorted
      .map((item) => {
        const p = getProduct(item.productId);
        if (!p) return "";
        return `
        <div class="mini-card">
          <img src="${p.image}" alt="${p.model}" loading="lazy">
          <span>${p.model}</span>
        </div>`;
      })
      .join("");
  }

  // ── 2) National Day Sale ─────────────────────────────
  function renderNationalDaySale() {
    const grid = document.querySelector(".national-day-grid");
    if (!grid) return;

    const section = sectionsData.nationalDaySale;
    if (!section || !section.items) return;

    // Wire up tab filtering
    const tabContainer = grid.closest(".national-day-sale");
    if (tabContainer) {
      const tabs = tabContainer.querySelectorAll(".tab-link");
      tabs.forEach((tab) => {
        tab.addEventListener("click", function (e) {
          e.preventDefault();
          tabs.forEach((t) => t.classList.remove("active"));
          this.classList.add("active");
          const cat = this.dataset.category;
          renderNDSGrid(grid, section, cat);
        });
      });
    }

    // Initial render — default tab
    renderNDSGrid(grid, section, "new-models");
  }

  function renderNDSGrid(container, section, activeCategory) {
    const items = section.items.filter((i) => i.category === activeCategory);

    container.innerHTML = items
      .map((item, idx) => {
        const p = getProduct(item.productId);
        if (!p) return "";

        const price = item.overridePrice || p.price;
        const oldPrice = item.overrideOldPrice || p.oldPrice;
        const sliderId = `ndsSlider${idx}`;

        // Build gallery images
        const images =
          p.gallery && p.gallery.length > 0 ? p.gallery : [p.image];
        const imgTags = images
          .map(
            (src, i) =>
              `<img src="${src}" alt="${p.model}" ${i === 0 ? 'class="active"' : ""} loading="lazy">`,
          )
          .join("");

        return `
        <div class="national-card ${images.length > 1 ? "has-slider" : ""}">
          <div class="img-side product-slider" id="${sliderId}">
            ${imgTags}
          </div>
          <div class="info-side">
            <p class="brand">${p.brand}</p>
            <h3>${p.title}</h3>
            ${
              item.giftTag
                ? `
            <div class="gift-tag">
              <i class="fa-solid fa-gift"></i>
              <span>${item.giftTag}</span>
            </div>`
                : ""
            }
            <div class="price-area">
              <span class="price-current">AED ${formatPrice(price)}</span>
              ${oldPrice ? `<span class="price-old">AED ${formatPrice(oldPrice)}</span>` : ""}
            </div>
            <div class="stock-info">
              <div class="progress">
                <div class="progress-bar" style="width: ${stockPercent(p.available)}%;"></div>
              </div>
              <span class="available-txt">Available: ${p.available}</span>
            </div>
          </div>
        </div>`;
      })
      .join("");

    // Re-init product sliders after rendering new cards
    initProductSlidersInContainer(container);
  }

  // ── 3) Featured Collections ──────────────────────────
  function renderFeaturedCollections() {
    const grid = document.getElementById("dynamicGrid");
    if (!grid) return;

    const section = sectionsData.featuredCollections;
    if (!section || !section.items) return;

    // Wire up tab filtering
    const tabContainer = grid.closest(".section");
    if (tabContainer) {
      const tabs = tabContainer.querySelectorAll(".tab-link");
      tabs.forEach((tab) => {
        tab.addEventListener("click", function (e) {
          e.preventDefault();
          tabs.forEach((t) => t.classList.remove("active"));
          this.classList.add("active");
          const cat = this.dataset.category;
          renderItemGrid(grid, section, cat);
        });
      });
    }

    // Initial render — first tab (new-models)
    renderItemGrid(grid, section, "new-models");
  }

  function renderItemGrid(container, section, activeCategory) {
    const items = section.items.filter((i) => i.category === activeCategory);

    container.innerHTML = items
      .map((item) => {
        const p = getProduct(item.productId);
        if (!p) return "";

        const discount = calcDiscount(p.price, p.oldPrice);

        return `
        <div class="item-card">
          ${discount > 0 ? `<div class="discount-pill">-${discount}%</div>` : ""}
          <div class="item-actions">
            <button class="action-btn" title="Add to Wishlist"><i class="fa-regular fa-heart"></i></button>
            <button class="action-btn" title="Quick View"><i class="fa-solid fa-expand"></i></button>
            <button class="action-btn" title="Compare"><i class="fa-regular fa-eye"></i></button>
          </div>
          <div class="item-img-box">
            <img src="${p.image}" alt="${p.model}" loading="lazy">
          </div>
          <div class="item-brand">${p.brand}</div>
          <h3 class="item-title">${p.title}</h3>
          <div class="item-price-row">
            <span class="item-price">AED ${formatPrice(p.price)}</span>
            ${p.oldPrice ? `<span class="item-old-price">AED ${formatPrice(p.oldPrice)}</span>` : ""}
          </div>
          <div class="item-stock">
            <div class="progress">
              <div class="progress-bar" style="width: ${stockPercent(p.available)}%;"></div>
            </div>
            <span class="item-available">Available: ${p.available}</span>
          </div>
          <button class="btn-add-cart">Add To Cart</button>
        </div>`;
      })
      .join("");
  }

  // ── 4) Best Sellers ──────────────────────────────────
  function renderBestSellers() {
    const track = document.getElementById("bestSellerTrack");
    if (!track) return;

    const section = sectionsData.bestSellers;
    if (!section || !section.items) return;

    // Wire up tab filtering
    const tabsEl = document.getElementById("bestSellerTabs");
    if (tabsEl) {
      const tabs = tabsEl.querySelectorAll("a");
      tabs.forEach((tab) => {
        tab.addEventListener("click", function (e) {
          e.preventDefault();
          tabs.forEach((t) => t.classList.remove("active"));
          this.classList.add("active");
          const cat = this.dataset.category;
          renderBestSellerTrack(track, section, cat);

          // Reset slider position
          track.style.transform = "translateX(0)";
          if (typeof window.reinitBestSellerSlider === "function") {
            window.reinitBestSellerSlider();
          }
        });
      });
    }

    // Initial render — first tab
    renderBestSellerTrack(track, section, "new-launch");
  }

  function renderBestSellerTrack(container, section, activeCategory) {
    const items = section.items.filter((i) => i.category === activeCategory);

    // Group into columns of 2
    const columns = [];
    for (let i = 0; i < items.length; i += 2) {
      columns.push(items.slice(i, i + 2));
    }

    container.innerHTML = columns
      .map((col) => {
        const cards = col
          .map((item) => {
            const p = getProduct(item.productId);
            if (!p) return "";

            const discount = calcDiscount(p.price, p.oldPrice);

            return `
          <div class="item-card">
            ${discount > 0 ? `<div class="discount-pill">-${discount}%</div>` : ""}
            <div class="item-actions">
              <button class="action-btn" title="Add to Wishlist"><i class="fa-regular fa-heart"></i></button>
              <button class="action-btn" title="Quick View"><i class="fa-solid fa-expand"></i></button>
              <button class="action-btn" title="Compare"><i class="fa-regular fa-eye"></i></button>
            </div>
            <div class="item-img-box">
              <img src="${p.image}" alt="${p.model}" loading="lazy">
            </div>
            <div class="item-brand">${p.brand}</div>
            <h3 class="item-title">${p.title}</h3>
            <div class="item-price-row">
              <span class="item-price">AED ${formatPrice(p.price)}</span>
              ${p.oldPrice ? `<span class="item-old-price">AED ${formatPrice(p.oldPrice)}</span>` : ""}
            </div>
            <div class="item-stock">
              <div class="progress">
                <div class="progress-bar" style="width: ${stockPercent(p.available)}%;"></div>
              </div>
              <span class="item-available">Available: ${p.available}</span>
            </div>
            <button class="btn-add-cart">Add To Cart</button>
          </div>`;
          })
          .join("");

        return `<div class="slider-column">${cards}</div>`;
      })
      .join("");
  }

  // ── 5) Promo Banners ─────────────────────────────────
  function renderPromoBanners() {
    const grid = document.querySelector(".promo-grid");
    if (!grid) return;

    const banners = sectionsData.promoBanners;
    if (!banners || !banners.length) return;

    grid.innerHTML = banners
      .map((b) => {
        return `
        <div class="promo-banner ${b.theme}">
          <div class="promo-content">
            <p class="promo-subtitle">${b.subtitle}</p>
            <h2 class="promo-title">${b.title}</h2>
            ${b.accentText ? `<span class="promo-accent-text">${b.accentText}</span>` : ""}
            <a href="${b.buttonLink}" class="promo-btn">
              ${b.buttonText} <i class="fa-solid fa-chevron-right"></i>
            </a>
          </div>
          <img src="${b.image}" alt="${b.title}" class="promo-bg-img" loading="lazy">
        </div>`;
      })
      .join("");
  }

  // ── 6) Nav Dropdown ──────────────────────────────────
  function renderNavDropdown(products) {
    const iphoneMenu = document.getElementById('iphone-series-menu');
    if (!iphoneMenu) return;

    // Filter unique iPhone series (like iPhone 17, iPhone 16 Pro Max, etc)
    const iphoneSeries = [...new Set(products
      .filter(p => p.brand === 'Apple' && p.model && p.model.toLowerCase().includes('iphone'))
      .map(p => p.model))]
      .sort((a, b) => b.localeCompare(a)); // Z-A sort to put newest models first typically
      
    if (iphoneSeries.length === 0) return;

    iphoneMenu.innerHTML = iphoneSeries.map(series => 
      `<li><a class="dropdown-item" href="#">${series}</a></li>`
    ).join('');
  }

  // ── Product Slider Helper (re-init after dynamic render) ─
  function initProductSlidersInContainer(container) {
    container.querySelectorAll(".product-slider").forEach((slider) => {
      const images = slider.querySelectorAll("img");
      if (images.length <= 1) return;

      let currentIndex = 0;
      setInterval(() => {
        images[currentIndex].classList.remove("active");
        currentIndex = (currentIndex + 1) % images.length;
        images[currentIndex].classList.add("active");
      }, 3000);
    });
  }

  // ── Expose for script.js ──────────────────────────────
  window.initSite = initSite;

  // Auto-init when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSite);
  } else {
    initSite();
  }
})();
