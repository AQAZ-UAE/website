(function () {
  "use strict";

  let productsMap = {};
  let productsList = [];

  async function initProductDetails() {
    try {
      productsList = await fetch("data/products.json").then((r) => r.json());
      productsList.forEach((p) => {
        productsMap[p.id] = p;
      });

      initSearch(productsList);

      const urlParams = new URLSearchParams(window.location.search);
      let productId = urlParams.get("id");
      
      // Fallback if no ID is passed
      if (!productId || !productsMap[productId]) {
        productId = productsList[0].id; // Just grab first product as demo
      }

      renderMainProduct(productsMap[productId]);
      renderRelatedProducts(productsMap[productId]);

    } catch (err) {
      console.error("Failed to load product details:", err);
      document.getElementById("product-details-container").innerHTML = `<div class="alert alert-danger">Failed to load product data.</div>`;
    }
  }

  function formatPrice(val) {
    if (!val && val !== 0) return "";
    return val.toLocaleString("en-US");
  }

  function renderMainProduct(p) {
    const container = document.getElementById("product-details-container");
    
    // Generate some fake "variants" to look like Amazon size/color choosers
    // Real systems would filter the DB by model. We can just mock a few based on standard memory if Apple/Samsung.
    
    container.innerHTML = `
      <!-- Breadcrumb -->
      <nav aria-label="breadcrumb" class="mb-3" style="font-size:0.85rem;">
        <ol class="breadcrumb" style="background:none; padding:0; margin:0;">
          <li class="breadcrumb-item"><a href="index.html" style="color:#007185; text-decoration:none;">Home</a></li>
          ${p.type ? `<li class="breadcrumb-item"><a href="index.html?search=${encodeURIComponent(p.type)}" style="color:#007185; text-decoration:none; text-transform: capitalize;">${p.type === 'accessory' ? 'Accessories' : p.type + 's'}</a></li>` : ''}
          ${p.brand ? `<li class="breadcrumb-item"><a href="index.html?search=${encodeURIComponent(p.brand)}" style="color:#007185; text-decoration:none; text-transform: capitalize;">${p.brand}</a></li>` : ''}
          <li class="breadcrumb-item active" aria-current="page">${p.title}</li>
        </ol>
      </nav>

      <div class="row">
        <!-- Left: Image -->
        <div class="col-md-5 mb-4 d-flex flex-column align-items-center" style="position:relative;">
          <img src="${p.image}" alt="${p.title}" class="img-fluid" style="max-height: 500px; object-fit: contain;">
          <div class="mt-3 text-muted" style="font-size: 0.85rem;"><i class="fa-solid fa-magnifying-glass-plus"></i> Click to see full view</div>
        </div>

        <!-- Middle: Product Info (Amazon Style) -->
        <div class="col-md-5 mb-4 px-md-4">
          <h1 style="font-size: 1.4rem; font-weight: 400; color: #0f1111; line-height: 1.4; margin-bottom: 5px;">${p.title}</h1>
          <a href="#" style="color:#007185; font-size:0.9rem; text-decoration:none;">Visit the ${p.brand} Store</a>
          
          <div class="rating mt-2 mb-2" style="font-size: 0.9rem;">
            <span style="color: #de7921;"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star-half-stroke"></i></span>
            <span class="ms-1" style="color:#007185; cursor:pointer;">(313)</span>
          </div>
          
          <hr style="border-color: #e7e7e7; margin: 10px 0;">
          
          <div class="price-block mb-3">
            ${p.oldPrice ? `<div class="text-muted" style="font-size: 0.9rem; text-decoration: line-through;">AED ${formatPrice(p.oldPrice)}</div>` : ''}
            <div style="font-size: 1.8rem; font-weight: 500; color: #0f1111;"><span style="font-size: 1rem; position:relative; top:-0.5em;">AED</span>${formatPrice(p.price)}<span style="font-size: 1rem; position:relative; top:-0.5em;">00</span></div>
            <div style="font-size: 0.85rem; color: #007185;">FREE Returns <i class="fa-solid fa-chevron-down" style="font-size:0.7rem;"></i></div>
            <div style="font-size: 0.85rem; color: #565959;">All prices include VAT.</div>
          </div>
          
          <div class="variants mb-3">
            <div style="font-size: 0.9rem; color: #565959;">Size: <strong>1 TB</strong></div>
            <div class="d-flex gap-2 mt-1">
              <button style="border: 2px solid #e77600; background: #fdfaf6; border-radius: 4px; padding: 5px 10px; text-align: left; cursor:pointer;">
                <div style="font-size: 0.85rem; font-weight: 600; color: #0f1111;">1 TB</div>
                <div style="font-size: 0.8rem; color: #b12704;">AED ${formatPrice(p.price)}</div>
              </button>
              <button style="border: 1px solid #d5d9d9; background: #fff; border-radius: 4px; padding: 5px 10px; text-align: left; cursor:pointer;">
                <div style="font-size: 0.85rem; font-weight: 600; color: #0f1111;">256 GB</div>
                <div style="font-size: 0.8rem; color: #b12704;">AED ${formatPrice(p.price - 1800)}</div>
              </button>
              <button style="border: 1px solid #d5d9d9; background: #fff; border-radius: 4px; padding: 5px 10px; text-align: left; cursor:pointer;">
                <div style="font-size: 0.85rem; font-weight: 600; color: #0f1111;">512 GB</div>
                <div style="font-size: 0.8rem; color: #b12704;">AED ${formatPrice(p.price - 1000)}</div>
              </button>
            </div>
          </div>

          <div class="colors mb-3">
            <div style="font-size: 0.9rem; color: #565959;">Colour: <strong>Silver / Titanium</strong></div>
            <div class="d-flex gap-2 mt-1 px-1">
              <div style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid #e77600; padding:2px; cursor:pointer;"><div style="width:100%; height:100%; border-radius: 50%; background: #f4f4f4; border: 1px solid #ddd;"></div></div>
              <div style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid #d5d9d9; padding:2px; cursor:pointer;"><div style="width:100%; height:100%; border-radius: 50%; background: #e09f58; border: 1px solid #ddd;"></div></div>
              <div style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid #d5d9d9; padding:2px; cursor:pointer;"><div style="width:100%; height:100%; border-radius: 50%; background: #3c3c44; border: 1px solid #ddd;"></div></div>
            </div>
          </div>

          <hr style="border-color: #e7e7e7; margin: 20px 0;">
          
          <!-- CTA Buttons moved to middle column -->
          <div class="d-flex gap-3 align-items-center mt-4">
             <div style="font-size: 1.8rem; font-weight: 500; color: #0f1111;">AED ${formatPrice(p.price)}</div>
             <div style="background: #e6fced; color: #007600; padding: 4px 10px; border-radius: 4px; font-weight: 600; font-size: 0.9rem;"><i class="fa-solid fa-check"></i> In Stock</div>
          </div>
          <div class="d-flex gap-3 mt-3 w-100" style="max-width: 450px;">
             <button class="btn flex-fill" onclick="window.addToCart('${p.id}')" style="background: #ffd814; border-radius: 20px; font-size: 1rem; padding: 10px 0; border:1px solid #fcd200; box-shadow:0 1px 2px rgba(0,0,0,0.1); font-weight:500;">Add to Cart</button>
             <button class="btn flex-fill" onclick="window.addToCart('${p.id}'); window.toggleCartModal();" style="background: #ffa41c; border-radius: 20px; font-size: 1rem; padding: 10px 0; border:1px solid #ff8f00; box-shadow:0 1px 2px rgba(0,0,0,0.1); font-weight:500;">Buy Now</button>
             <button class="btn" title="Add to Wishlist" data-product-id="${p.id}" onclick="window.toggleWishlist('${p.id}', this)" style="background: #f0f2f2; border-radius: 20px; font-size: 1.1rem; padding: 10px 15px; border:1px solid #d5d9d9; box-shadow:0 1px 2px rgba(0,0,0,0.1);"><i class="fa-regular fa-heart"></i></button>
             <button class="btn" title="Compare Product" onclick="window.openCompareModal && window.openCompareModal('${p.id}')" style="background: #f0f2f2; border-radius: 20px; font-size: 1.1rem; padding: 10px 15px; border:1px solid #d5d9d9; box-shadow:0 1px 2px rgba(0,0,0,0.1);"><i class="fa-solid fa-code-compare"></i></button>
          </div>

          <hr style="border-color: #e7e7e7; margin: 20px 0;">

          <h5 style="font-size: 1rem; font-weight: 700;">Purchase options and add-ons</h5>
          <div style="border: 1px solid #d5d9d9; border-radius: 8px; padding: 15px; margin-top: 10px;">
            <div style="display:flex; justify-content:space-between; cursor:pointer;">
              <strong><i class="fa-solid fa-arrows-rotate" style="color: #e77600;"></i> Upgrade with Trade-in</strong>
              <i class="fa-solid fa-chevron-down" style="color:#565959;"></i>
            </div>
            <div class="mt-2" style="font-size:0.85rem;">
              Instant Savings up to <span style="background:#77ce68; color:white; padding:2px 6px; border-radius:4px; font-weight:600;">AED 4,390.00</span><br>
              <span class="text-muted">+ Extra <strong>AED 150*</strong></span>
            </div>
            <ul class="mt-2" style="font-size:0.8rem; list-style:none; padding-left:0; color:#0f1111;">
              <li><i class="fa-solid fa-check" style="color:#007185;"></i> Option to keep new & old device for 7 days</li>
              <li><i class="fa-solid fa-check" style="color:#007185;"></i> Secure & certified data wipe</li>
              <li><i class="fa-solid fa-check" style="color:#007185;"></i> * AED 150 cashback at doorstep (valid till 28 Feb)</li>
            </ul>
            <button class="btn mt-2" style="background:#ffd814; border:1px solid #fcd200; border-radius:8px; font-size:0.85rem; font-weight:500; padding:6px 15px; box-shadow:0 1px 2px rgba(0,0,0,0.1);">Apply Now</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderRelatedProducts(currentProduct) {
    const track = document.getElementById("relatedSliderTrack");
    
    // Find products of same brand, randomly shuffle, exclude current
    let related = productsList.filter(p => p.brand === currentProduct.brand && p.id !== currentProduct.id).slice(0, 8);
    // If not enough, pad with others
    if (related.length < 5) {
      const padding = productsList.filter(p => p.id !== currentProduct.id && !related.find(r=>r.id===p.id)).slice(0, 8 - related.length);
      related = [...related, ...padding];
    }
    
    track.innerHTML = related.map((p) => {
      return `
        <a href="product-details.html?id=${p.id}" style="text-decoration: none; color: inherit; flex: 0 0 200px; display: block;">
          <div class="product-item" style="display:flex; flex-direction:column; height: 100%;">
            <div style="width: 100%; height: 160px; display:flex; align-items:center; justify-content:center; margin-bottom: 10px;">
              <img src="${p.image}" alt="${p.title}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
            </div>
            <div>
              <div style="color: #007185; font-size: 0.85rem; font-weight: 500; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; height:4.0em; text-overflow: ellipsis;">${p.title}</div>
              <div style="color: #de7921; font-size: 0.75rem; margin: 4px 0;"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-regular fa-star"></i> <span style="color:#007185;">${Math.floor(Math.random() * 5000)}</span></div>
              <div style="color: #0f1111; font-weight: 500; font-size: 1.1rem; margin-bottom: 2px;">AED ${formatPrice(p.price)}</div>
              <div style="color: #565959; font-size: 0.75rem;">Get it as soon as <strong>Tomorrow</strong><br>Fulfilled by Amazon - FREE Shipping</div>
            </div>
          </div>
        </a>
      `;
    }).join('');

    // Wire up Amazon style simple scrolling
    const nextBtn = document.getElementById("relatedNextBtn");
    const prevBtn = document.getElementById("relatedPrevBtn");
    const container = document.querySelector(".related-slider-container");
    let currentScroll = 0;

    nextBtn.addEventListener('click', () => {
        const itemWidth = 220; // 200px + 20px gap
        const maxScroll = Math.max(0, track.scrollWidth - container.offsetWidth);
        
        currentScroll += itemWidth * 3;
        if (currentScroll > maxScroll) currentScroll = maxScroll;
        
        const isRtl = document.documentElement.dir === 'rtl';
        track.style.transform = `translateX(${isRtl ? currentScroll : -currentScroll}px)`;
    });

    prevBtn.addEventListener('click', () => {
        const itemWidth = 220;
        currentScroll -= itemWidth * 3;
        if (currentScroll < 0) currentScroll = 0;
        
        const isRtl = document.documentElement.dir === 'rtl';
        track.style.transform = `translateX(${isRtl ? currentScroll : -currentScroll}px)`;
    });
  }

  // --- Search Bar logic copy/pasted so header works ---
  function initSearch(products) {
    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");
    if (!searchInput || !searchResults) return;

    searchInput.addEventListener("input", function (e) {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        searchResults.style.display = "none";
        return;
      }
      const filtered = products.filter(
        (p) =>
          (p.title && p.title.toLowerCase().includes(q)) ||
          (p.model && p.model.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q))
      ).slice(0, 10); 

      if (filtered.length === 0) {
        searchResults.innerHTML = `<div style="padding: 15px; text-align: center; color: #666;">No products found for "${q}"</div>`;
      } else {
        searchResults.innerHTML = filtered.map(p => {
          return `
            <a href="product-details.html?id=${p.id}" class="search-result-item" style="display: flex; align-items: center; padding: 10px 15px; text-decoration: none; border-bottom: 1px solid #f0f0f0; color: #1a2b4b; transition: background 0.2s;">
              <img src="${p.image}" alt="${p.title}" style="width: 40px; height: 40px; object-fit: contain; margin-right: 15px;">
              <div style="flex: 1;">
                <div style="font-weight: 600; font-size: 0.9rem; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${p.title}</div>
                <div style="color: #ff6b00; font-weight: 700; font-size: 0.85rem;">AED ${formatPrice(p.price)}</div>
              </div>
            </a>
          `;
        }).join("");
      }
      searchResults.style.display = "block";
    });

    document.addEventListener("click", function (e) {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.style.display = "none";
      }
    });
    searchInput.addEventListener("focus", function() {
      if (this.value.trim().length > 0) searchResults.style.display = "block";
    });
  }

  // Auto-init when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProductDetails);
  } else {
    initProductDetails();
  }

})();
