/**
 * AQAZ Admin Console — Core Logic
 * Simple username/password login, loads data from local JSON,
 * lets you edit product sections.
 */

(function () {
  'use strict';

  // ── Config ─────────────────────────────────────────
  const ADMIN_USER = 'admin';
  const DEFAULT_PASS = 'admin123';

  // Get current password (localStorage overrides default)
  function getPassword() {
    return localStorage.getItem('aqaz_admin_pass') || DEFAULT_PASS;
  }

  // ── State ──────────────────────────────────────────
  let products = [];
  let sections = {};
  let trash = [];
  let dirty = false;

  // ── DOM Refs ───────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const loginOverlay = $('#loginOverlay');
  const adminWrapper = $('#adminWrapper');
  const adminContent = $('#adminContent');
  const pageTitle = $('#pageTitle');
  const toastContainer = $('#toastContainer');

  // ── Init ───────────────────────────────────────────
  function init() {
    // Check if already logged in this session
    if (sessionStorage.getItem('aqaz_logged_in') === 'true') {
      loginOverlay.style.display = 'none';
      adminWrapper.classList.add('active');
      loadData();
    }
    bindEvents();
  }

  // ── Events ─────────────────────────────────────────
  function bindEvents() {
    // Login
    $('#btnLogin').addEventListener('click', handleLogin);
    $('#loginPass').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleLogin();
    });

    // Logout
    $('#btnLogout').addEventListener('click', () => {
      sessionStorage.removeItem('aqaz_logged_in');
      location.reload();
    });

    // Sidebar navigation
    $$('.sidebar-nav a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        $$('.sidebar-nav a').forEach(a => a.classList.remove('active'));
        link.classList.add('active');
        switchPage(link.dataset.page);
      });
    });

    // Save button
    $('#btnSaveAll').addEventListener('click', saveData);

    // Product modal
    $('#closeModal').addEventListener('click', closeProductModal);
    $('#cancelModal').addEventListener('click', closeProductModal);
    $('#saveProduct').addEventListener('click', handleSaveProduct);

    // Confirm dialog
    $('#confirmCancel').addEventListener('click', () => {
      $('#confirmDialog').classList.remove('active');
    });
  }

  // ── Login Handler ──────────────────────────────────
  function handleLogin() {
    const user = $('#loginUser').value.trim();
    const pass = $('#loginPass').value.trim();

    if (!user || !pass) {
      $('#loginError').textContent = 'Please enter username and password.';
      return;
    }

    if (user === ADMIN_USER && pass === getPassword()) {
      sessionStorage.setItem('aqaz_logged_in', 'true');
      loginOverlay.style.display = 'none';
      adminWrapper.classList.add('active');
      toast('Welcome back!', 'success');
      loadData();
    } else {
      $('#loginError').textContent = 'Invalid username or password.';
    }
  }

  // ── Data Loading (local JSON) ──────────────────────
  async function loadData() {
    try {
      const [prodRes, secRes] = await Promise.all([
        fetch('data/products.json').then(r => r.json()),
        fetch('data/sections.json').then(r => r.json())
      ]);

      products = prodRes;
      sections = secRes;

      // Default to sections page
      $$('.sidebar-nav a').forEach(a => a.classList.remove('active'));
      const sectionsLink = document.querySelector('[data-page="sections"]');
      if (sectionsLink) sectionsLink.classList.add('active');
      switchPage('sections');

      toast('Data loaded successfully', 'success');
    } catch (err) {
      console.error('Load error:', err);
      toast('Failed to load data: ' + err.message, 'error');
    }
  }

  // ── Page Router ────────────────────────────────────
  function switchPage(page) {
    const titles = {
      dashboard: 'Dashboard',
      products: 'Products',
      brands: 'Brands',
      sections: 'Edit Sections',
      trash: 'Trash',
      settings: 'Settings'
    };
    pageTitle.textContent = titles[page] || page;

    switch (page) {
      case 'dashboard': renderDashboard(); break;
      case 'products': renderProducts(); break;
      case 'brands': renderBrands(); break;
      case 'sections': renderSections(); break;
      case 'trash': renderTrash(); break;
      case 'settings': renderSettings(); break;
    }
  }

  // ── Trash Badge ────────────────────────────────────
  function updateTrashCount() {
    const badge = document.getElementById('trashCount');
    if (badge) {
      if (trash.length > 0) {
        badge.textContent = trash.length;
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  // ── Dashboard ──────────────────────────────────────
  function renderDashboard() {
    const totalProducts = products.length;
    const brandNames = [...new Set(products.map(p => p.brand))];
    const brands = brandNames.length;
    const avgPrice = totalProducts ? Math.round(products.reduce((s, p) => s + p.price, 0) / totalProducts) : 0;
    const lowStock = products.filter(p => p.available < 10).length;

    adminContent.innerHTML = `
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-number">${totalProducts}</div>
          <div class="stat-label">Total Products</div>
        </div>
        <div class="stat-card stat-card-clickable" id="statBrands" style="cursor:pointer;">
          <div class="stat-number">${brands}</div>
          <div class="stat-label">Brands <i class="fa-solid fa-arrow-right" style="font-size:.7rem;margin-left:4px;opacity:.5;"></i></div>
        </div>
        <div class="stat-card">
          <div class="stat-number">AED ${avgPrice.toLocaleString()}</div>
          <div class="stat-label">Avg Price</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${lowStock}</div>
          <div class="stat-label">Low Stock (&lt;10)</div>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-number">${sections.hotSelling ? sections.hotSelling.items.length : 0}</div>
          <div class="stat-label">Hot Selling Items</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${sections.nationalDaySale ? sections.nationalDaySale.items.length : 0}</div>
          <div class="stat-label">National Day Items</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${sections.featuredCollections ? sections.featuredCollections.items.length : 0}</div>
          <div class="stat-label">Featured Items</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${sections.bestSellers ? sections.bestSellers.items.length : 0}</div>
          <div class="stat-label">Best Seller Items</div>
        </div>
      </div>

      <div class="product-table-wrap">
        <div class="table-toolbar">
          <h3 style="font-size: 1rem; font-weight: 600;">Recently Added Products</h3>
        </div>
        <table class="product-table">
          <thead>
            <tr><th>Image</th><th>Product</th><th>Price</th><th>Stock</th></tr>
          </thead>
          <tbody>
            ${products.slice(-5).reverse().map(p => `
              <tr>
                <td><img class="thumb" src="${p.image}" alt="${p.model}"></td>
                <td>
                  <div class="model-name">${p.model}</div>
                  <div class="variant-detail">${p.storage || ''} ${p.colour || ''}</div>
                </td>
                <td><span class="price-col">AED ${p.price.toLocaleString()}</span></td>
                <td><span class="stock-badge ${p.available < 10 ? 'low-stock' : 'in-stock'}">${p.available}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`;

    // Brands card click → show brand explorer
    document.getElementById('statBrands').addEventListener('click', () => {
      renderBrandExplorer();
    });
  }

  // ── Brand Explorer ────────────────────────────────
  function renderBrandExplorer() {
    pageTitle.textContent = 'Brands';

    const brandNames = [...new Set(products.map(p => p.brand))].sort();
    const brandData = brandNames.map(name => {
      const brandProducts = products.filter(p => p.brand === name);
      const minPrice = Math.min(...brandProducts.map(p => p.price));
      const maxPrice = Math.max(...brandProducts.map(p => p.price));
      const totalStock = brandProducts.reduce((s, p) => s + p.available, 0);
      const thumb = brandProducts[0] ? brandProducts[0].image : '';
      return { name, count: brandProducts.length, minPrice, maxPrice, totalStock, thumb };
    });

    adminContent.innerHTML = `
      <div style="margin-bottom: 16px;">
        <button class="btn btn-secondary btn-sm" id="btnBackDashboard">
          <i class="fa-solid fa-arrow-left"></i> Back to Dashboard
        </button>
      </div>
      <div class="brand-grid">
        ${brandData.map(b => `
          <div class="brand-card" data-brand="${b.name}">
            <div class="brand-card-header">
              <img src="${b.thumb}" alt="${b.name}" class="brand-thumb">
              <div>
                <div class="brand-name">${b.name}</div>
                <div class="brand-meta">${b.count} product${b.count !== 1 ? 's' : ''}</div>
              </div>
            </div>
            <div class="brand-card-body">
              <div class="brand-stat">
                <span class="brand-stat-label">Price Range</span>
                <span class="brand-stat-value">AED ${b.minPrice.toLocaleString()} – ${b.maxPrice.toLocaleString()}</span>
              </div>
              <div class="brand-stat">
                <span class="brand-stat-label">Total Stock</span>
                <span class="brand-stat-value">${b.totalStock}</span>
              </div>
            </div>
            <div class="brand-card-footer">
              <span style="font-size:.82rem;color:var(--accent);">View Products <i class="fa-solid fa-arrow-right" style="font-size:.7rem;"></i></span>
            </div>
          </div>
        `).join('')}
      </div>`;

    document.getElementById('btnBackDashboard').addEventListener('click', () => {
      pageTitle.textContent = 'Dashboard';
      renderDashboard();
    });

    $$('.brand-card').forEach(card => {
      card.addEventListener('click', () => {
        renderBrandProducts(card.dataset.brand);
      });
    });
  }

  // ── Brand Products View ───────────────────────────
  function renderBrandProducts(brandName) {
    pageTitle.textContent = brandName + ' Products';

    const brandProducts = products.filter(p => p.brand === brandName);

    adminContent.innerHTML = `
      <div style="margin-bottom: 16px; display: flex; align-items: center; gap: 12px;">
        <button class="btn btn-secondary btn-sm" id="btnBackBrands">
          <i class="fa-solid fa-arrow-left"></i> Back to Brands
        </button>
        <span style="font-size: .9rem; color: var(--text-secondary);">
          ${brandProducts.length} product${brandProducts.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div class="product-table-wrap">
        <table class="product-table">
          <thead>
            <tr>
              <th>Image</th><th>Product</th><th>Storage / Colour</th>
              <th>Price</th><th>Stock</th>
            </tr>
          </thead>
          <tbody>
            ${brandProducts.map(p => `
              <tr>
                <td><img class="thumb" src="${p.image}" alt="${p.model}"></td>
                <td>
                  <div class="model-name">${p.brand} ${p.model}</div>
                  <div class="variant-detail">${p.title.substring(0, 50)}${p.title.length > 50 ? '…' : ''}</div>
                </td>
                <td>${p.storage || '—'} / ${p.colour || '—'}</td>
                <td>
                  <span class="price-col">AED ${p.price.toLocaleString()}</span>
                  ${p.oldPrice ? '<span class="old-price-col">AED ' + p.oldPrice.toLocaleString() + '</span>' : ''}
                </td>
                <td>
                  <span class="stock-badge ${p.available < 5 ? 'out-of-stock' : p.available < 15 ? 'low-stock' : 'in-stock'}">
                    ${p.available}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`;

    document.getElementById('btnBackBrands').addEventListener('click', () => {
      renderBrandExplorer();
    });
  }

  // ── Brands Page (Sidebar Tab) ──────────────────────
  function renderBrands() {
    const brandNames = [...new Set(products.map(p => p.brand))].sort();
    const brandData = brandNames.map(name => {
      const bp = products.filter(p => p.brand === name);
      const minPrice = bp.length ? Math.min(...bp.map(p => p.price)) : 0;
      const maxPrice = bp.length ? Math.max(...bp.map(p => p.price)) : 0;
      const totalStock = bp.reduce((s, p) => s + p.available, 0);
      const thumb = bp[0] ? bp[0].image : '';
      return { name, count: bp.length, minPrice, maxPrice, totalStock, thumb };
    });

    adminContent.innerHTML = `
      <div class="table-toolbar" style="margin-bottom: 16px;">
        <span style="font-size: .9rem; color: var(--text-secondary);">
          <i class="fa-solid fa-copyright" style="margin-right: 6px;"></i>
          ${brandNames.length} brand${brandNames.length !== 1 ? 's' : ''}
        </span>
        <button class="btn btn-primary btn-sm" id="btnAddBrand">
          <i class="fa-solid fa-plus"></i> Add Brand
        </button>
      </div>

      <div class="brand-grid">
        ${brandData.map(b => `
          <div class="brand-card" data-brand="${b.name}">
            <div class="brand-card-header">
              ${b.thumb ? '<img src="' + b.thumb + '" alt="' + b.name + '" class="brand-thumb">' : '<div class="brand-thumb-placeholder"><i class="fa-solid fa-copyright"></i></div>'}
              <div>
                <div class="brand-name">${b.name}</div>
                <div class="brand-meta">${b.count} product${b.count !== 1 ? 's' : ''}</div>
              </div>
            </div>
            <div class="brand-card-body">
              <div class="brand-stat">
                <span class="brand-stat-label">Price Range</span>
                <span class="brand-stat-value">${b.count ? 'AED ' + b.minPrice.toLocaleString() + ' – ' + b.maxPrice.toLocaleString() : '—'}</span>
              </div>
              <div class="brand-stat">
                <span class="brand-stat-label">Total Stock</span>
                <span class="brand-stat-value">${b.totalStock}</span>
              </div>
            </div>
            <div class="brand-card-footer">
              <span style="font-size:.82rem;color:var(--accent);">View Products <i class="fa-solid fa-arrow-right" style="font-size:.7rem;"></i></span>
            </div>
          </div>
        `).join('')}
      </div>`;

    // Add Brand button
    document.getElementById('btnAddBrand').addEventListener('click', () => {
      const brandInput = prompt('Enter new brand name:');
      if (!brandInput || !brandInput.trim()) return;
      const newBrand = brandInput.trim();

      // Check if brand already exists
      const exists = products.some(p => p.brand.toLowerCase() === newBrand.toLowerCase());
      if (exists) {
        toast('Brand "' + newBrand + '" already exists', 'error');
        return;
      }

      // Create a placeholder product for the new brand so it shows up
      // User can then add real products to this brand via the Products page
      toast('Brand "' + newBrand + '" created! Add products to it from the Products page.', 'success');

      // We need at least one product for the brand to exist — open the product modal with brand pre-selected
      openProductModal(null);
      // After modal opens, set the brand dropdown
      setTimeout(() => {
        const sel = $('#pBrand');
        // Add brand to dropdown if not present
        const brandNames2 = [...new Set(products.map(p => p.brand))].sort();
        if (!brandNames2.includes(newBrand)) {
          const opt = document.createElement('option');
          opt.value = newBrand;
          opt.textContent = newBrand;
          // Insert before the "__new__" option
          const newOpt = sel.querySelector('option[value="__new__"]');
          sel.insertBefore(opt, newOpt);
        }
        sel.value = newBrand;
        $('#pBrandNew').style.display = 'none';
      }, 100);
    });

    // Click brand card → show brand products within brands page
    $$('.brand-card').forEach(card => {
      card.addEventListener('click', () => {
        renderBrandProductsPage(card.dataset.brand);
      });
    });
  }

  // ── Brand Products within Brands Page ──────────────
  function renderBrandProductsPage(brandName) {
    pageTitle.textContent = brandName;

    const brandProds = products.filter(p => p.brand === brandName);

    adminContent.innerHTML = `
      <div style="margin-bottom: 16px; display: flex; align-items: center; gap: 12px;">
        <button class="btn btn-secondary btn-sm" id="btnBackBrands">
          <i class="fa-solid fa-arrow-left"></i> Back to Brands
        </button>
        <span style="font-size: .9rem; color: var(--text-secondary);">
          ${brandProds.length} product${brandProds.length !== 1 ? 's' : ''}
        </span>
        <button class="btn btn-primary btn-sm" id="btnAddToBrand" style="margin-left: auto;">
          <i class="fa-solid fa-plus"></i> Add Product to ${brandName}
        </button>
      </div>
      <div class="product-table-wrap">
        <table class="product-table">
          <thead>
            <tr>
              <th>Image</th><th>Product</th><th>Storage / Colour</th>
              <th>Price</th><th>Stock</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${brandProds.length === 0 ? '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted);">No products yet. Click "Add Product" to get started.</td></tr>' : ''}
            ${brandProds.map(p => `
              <tr>
                <td><img class="thumb" src="${p.image}" alt="${p.model}"></td>
                <td>
                  <div class="model-name">${p.brand} ${p.model}</div>
                  <div class="variant-detail">${p.title.substring(0, 50)}${p.title.length > 50 ? '…' : ''}</div>
                </td>
                <td>${p.storage || '—'} / ${p.colour || '—'}</td>
                <td>
                  <span class="price-col">AED ${p.price.toLocaleString()}</span>
                  ${p.oldPrice ? '<span class="old-price-col">AED ' + p.oldPrice.toLocaleString() + '</span>' : ''}
                </td>
                <td>
                  <span class="stock-badge ${p.available < 5 ? 'out-of-stock' : p.available < 15 ? 'low-stock' : 'in-stock'}">
                    ${p.available}
                  </span>
                </td>
                <td>
                  <div class="table-actions">
                    <button class="btn-icon btn-edit" data-id="${p.id}" title="Edit"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon btn-delete" data-id="${p.id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`;

    document.getElementById('btnBackBrands').addEventListener('click', () => {
      pageTitle.textContent = 'Brands';
      renderBrands();
    });

    // Add Product to this brand
    document.getElementById('btnAddToBrand').addEventListener('click', () => {
      openProductModal(null);
      setTimeout(() => {
        populateBrandDropdown(brandName);
      }, 100);
    });

    // Edit buttons
    $$('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => openProductModal(btn.dataset.id));
    });

    // Delete buttons
    $$('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        confirmDelete(btn.dataset.id);
      });
    });
  }

  // ── Products State ─────────────────────────────────
  let selectMode = false;
  let selectedProducts = new Set();

  // ── Products Page ──────────────────────────────────
  function renderProducts(filter = '') {
    const filtered = filter
      ? products.filter(p =>
          (p.model + ' ' + p.brand + ' ' + p.title + ' ' + (p.storage || '') + ' ' + (p.colour || ''))
            .toLowerCase().includes(filter.toLowerCase()))
      : products;

    // Check how many filtered items are selected
    const filteredSelectedCount = filtered.filter(p => selectedProducts.has(p.id)).length;
    const allFilteredSelected = filtered.length > 0 && filteredSelectedCount === filtered.length;

    adminContent.innerHTML = `
      ${selectMode && selectedProducts.size > 0 ? `
      <div class="bulk-action-bar">
        <span class="bulk-count">${selectedProducts.size} selected</span>
        <div class="bulk-actions-right">
          <div class="bulk-section-wrap">
            <button class="btn btn-secondary btn-sm" id="btnBulkAddSection">
              <i class="fa-solid fa-layer-group"></i> Add to Section <i class="fa-solid fa-caret-down" style="margin-left:4px;"></i>
            </button>
            <div class="bulk-section-dropdown" id="sectionDropdown">
              ${[
                { key: 'hotSelling', label: 'Hot Selling' },
                { key: 'nationalDaySale', label: 'National Day Sale' },
                { key: 'featuredCollections', label: 'Featured Collections' },
                { key: 'bestSellers', label: 'Best Sellers' }
              ].map(s => '<div class="bulk-dd-item" data-section="' + s.key + '"><i class="fa-solid fa-plus" style="margin-right:6px;color:var(--accent);"></i> ' + s.label + '</div>').join('')}
            </div>
          </div>
          <button class="btn btn-danger btn-sm" id="btnBulkTrash">
            <i class="fa-solid fa-trash"></i> Move to Trash
          </button>
        </div>
      </div>` : ''}

      <div class="product-table-wrap">
        <div class="table-toolbar">
          <input type="text" class="search-input" id="productSearch" placeholder="Search products…" value="${filter}">
          <div style="display: flex; gap: 8px;">
            <button class="btn ${selectMode ? 'btn-primary' : 'btn-secondary'}" id="btnToggleSelect">
              <i class="fa-solid fa-check-double"></i> ${selectMode ? 'Cancel' : 'Select'}
            </button>
            <button class="btn btn-primary" id="btnAddProduct">
              <i class="fa-solid fa-plus"></i> Add Product
            </button>
          </div>
        </div>

        <table class="product-table">
          <thead>
            <tr>
              ${selectMode ? '<th style="width: 40px;"><input type="checkbox" id="selectAll" ' + (allFilteredSelected ? 'checked' : '') + '></th>' : ''}
              <th>Image</th><th>Product</th><th>Storage / Colour</th>
              <th>Price</th><th>Stock</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(p => `
              <tr data-id="${p.id}" class="${selectedProducts.has(p.id) ? 'row-selected' : ''}">
                ${selectMode ? '<td><input type="checkbox" class="row-checkbox" data-id="' + p.id + '" ' + (selectedProducts.has(p.id) ? 'checked' : '') + '></td>' : ''}
                <td><img class="thumb" src="${p.image}" alt="${p.model}"></td>
                <td>
                  <div class="model-name">${p.brand} ${p.model}</div>
                  <div class="variant-detail">${p.title.substring(0, 50)}${p.title.length > 50 ? '…' : ''}</div>
                </td>
                <td>${p.storage || '—'} / ${p.colour || '—'}</td>
                <td>
                  <span class="price-col">AED ${p.price.toLocaleString()}</span>
                  ${p.oldPrice ? `<span class="old-price-col">AED ${p.oldPrice.toLocaleString()}</span>` : ''}
                </td>
                <td>
                  <span class="stock-badge ${p.available < 5 ? 'out-of-stock' : p.available < 15 ? 'low-stock' : 'in-stock'}">
                    ${p.available}
                  </span>
                </td>
                <td>
                  <div class="table-actions">
                    <button class="btn-icon btn-edit" data-id="${p.id}" title="Edit"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon btn-delete" data-id="${p.id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`;

    // Search
    const searchInput = $('#productSearch');
    let debounce;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => renderProducts(searchInput.value), 300);
    });

    // Add product
    $('#btnAddProduct').addEventListener('click', () => openProductModal());

    // Edit / Delete
    $$('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => openProductModal(btn.dataset.id));
    });
    $$('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => confirmDelete(btn.dataset.id));
    });

    // Select mode toggle
    $('#btnToggleSelect').addEventListener('click', () => {
      selectMode = !selectMode;
      if (!selectMode) selectedProducts.clear();
      renderProducts(filter);
    });

    // Select mode bindings
    if (selectMode) {
      // Select All checkbox
      const selectAllCb = document.getElementById('selectAll');
      if (selectAllCb) {
        selectAllCb.addEventListener('change', () => {
          filtered.forEach(p => {
            if (selectAllCb.checked) {
              selectedProducts.add(p.id);
            } else {
              selectedProducts.delete(p.id);
            }
          });
          renderProducts(filter);
        });
      }

      // Individual checkboxes
      $$('.row-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
          const pid = cb.dataset.id;
          if (cb.checked) {
            selectedProducts.add(pid);
          } else {
            selectedProducts.delete(pid);
          }
          renderProducts(filter);
        });
      });

      // Bulk move to trash
      const bulkBtn = document.getElementById('btnBulkTrash');
      if (bulkBtn) {
        bulkBtn.addEventListener('click', () => {
          const count = selectedProducts.size;
          $('#confirmTitle').textContent = 'Move to Trash';
          $('#confirmMsg').textContent = count + ' product' + (count !== 1 ? 's' : '') + ' will be moved to Trash. You can restore them later.';
          $('#confirmOk').textContent = 'Move to Trash';
          $('#confirmDialog').classList.add('active');

          const okBtn = $('#confirmOk');
          const handler = () => {
            selectedProducts.forEach(pid => {
              const p = products.find(pr => pr.id === pid);
              if (p) {
                p._deletedAt = new Date().toISOString();
                trash.push(p);
              }
              // Remove from sections
              Object.keys(sections).forEach(key => {
                const sec = sections[key];
                if (sec && sec.items) {
                  sec.items = sec.items.filter(i => i.productId !== pid);
                }
              });
            });

            products = products.filter(pr => !selectedProducts.has(pr.id));
            dirty = true;
            selectedProducts.clear();
            selectMode = false;
            updateTrashCount();
            toast(count + ' product' + (count !== 1 ? 's' : '') + ' moved to Trash', 'info');
            renderProducts();
            $('#confirmDialog').classList.remove('active');
            $('#confirmOk').textContent = 'Delete';
            okBtn.removeEventListener('click', handler);
          };
          okBtn.addEventListener('click', handler);
        });
      }

      // Add to Section dropdown toggle
      const addSecBtn = document.getElementById('btnBulkAddSection');
      const secDropdown = document.getElementById('sectionDropdown');
      if (addSecBtn && secDropdown) {
        addSecBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          secDropdown.classList.toggle('open');
        });

        // Close dropdown on outside click
        document.addEventListener('click', () => {
          secDropdown.classList.remove('open');
        }, { once: true });

        // Section items
        secDropdown.querySelectorAll('.bulk-dd-item').forEach(item => {
          item.addEventListener('click', (e) => {
            e.stopPropagation();
            const sectionKey = item.dataset.section;
            const sec = sections[sectionKey];
            const items = sec && sec.items ? sec.items : (Array.isArray(sec) ? sec : []);

            // Determine default category for tabbed sections
            const tabbedCategories = {
              nationalDaySale: 'new-models',
              featuredCollections: 'new-models',
              bestSellers: 'new-launch'
            };
            const defaultCat = tabbedCategories[sectionKey] || null;

            let addedCount = 0;
            selectedProducts.forEach(pid => {
              // Skip if already in section
              const alreadyIn = items.some(i => i.productId === pid);
              if (!alreadyIn) {
                const newItem = { productId: pid };
                if (defaultCat) newItem.category = defaultCat;
                items.push(newItem);
                addedCount++;
              }
            });

            // Ensure items array is set on the section
            if (sec && !Array.isArray(sec) && !sec.items) {
              sec.items = items;
            }

            dirty = true;
            secDropdown.classList.remove('open');
            const secLabel = item.textContent.trim();
            if (addedCount > 0) {
              toast(addedCount + ' product' + (addedCount !== 1 ? 's' : '') + ' added to ' + secLabel, 'success');
            } else {
              toast('All selected products are already in ' + secLabel, 'info');
            }
            selectedProducts.clear();
            selectMode = false;
            renderProducts();
          });
        });
      }
    }
  }

  // ── Populate Brand Dropdown ────────────────────────
  function populateBrandDropdown(selectedBrand) {
    const sel = $('#pBrand');
    const brandNames = [...new Set(products.map(p => p.brand))].sort();
    sel.innerHTML = '<option value="">— Select Brand —</option>'
      + brandNames.map(b => '<option value="' + b + '"' + (b === selectedBrand ? ' selected' : '') + '>' + b + '</option>').join('')
      + '<option value="__new__">＋ Add new brand…</option>';

    const newInput = $('#pBrandNew');
    newInput.style.display = (sel.value === '__new__') ? 'block' : 'none';
    newInput.required = (sel.value === '__new__');

    sel.addEventListener('change', () => {
      const isNew = sel.value === '__new__';
      newInput.style.display = isNew ? 'block' : 'none';
      newInput.required = isNew;
      if (isNew) newInput.focus();
    });
  }

  // ── Product Modal ──────────────────────────────────
  function openProductModal(id = null) {
    const modal = $('#productModal');
    const form = $('#productForm');
    form.reset();

    if (id) {
      const p = products.find(pr => pr.id === id);
      if (!p) return;
      $('#modalTitle').textContent = 'Edit Product';
      $('#editProductId').value = p.id;
      populateBrandDropdown(p.brand);
      $('#pModel').value = p.model || '';
      $('#pTitle').value = p.title || '';
      $('#pStorage').value = p.storage || '';
      $('#pColour').value = p.colour || '';
      $('#pCountry').value = p.country || '';
      $('#pPrice').value = p.price || '';
      $('#pOldPrice').value = p.oldPrice || '';
      $('#pAvailable').value = p.available || 0;
      $('#pImage').value = p.image || '';
      $('#pType').value = p.type || 'phone';
      $('#pTags').value = (p.tags || []).join(', ');
    } else {
      $('#modalTitle').textContent = 'Add Product';
      $('#editProductId').value = '';
      populateBrandDropdown('');
    }

    modal.classList.add('active');
  }

  function closeProductModal() {
    $('#productModal').classList.remove('active');
  }

  function handleSaveProduct() {
    const id = $('#editProductId').value;
    const brandSel = $('#pBrand').value;
    const brand = brandSel === '__new__' ? $('#pBrandNew').value.trim() : brandSel;
    const model = $('#pModel').value.trim();
    const title = $('#pTitle').value.trim();

    if (!brand || !model || !title) {
      toast('Brand, Model, and Title are required.', 'error');
      return;
    }

    const productData = {
      brand, model, title,
      storage: $('#pStorage').value.trim() || '',
      colour: $('#pColour').value.trim() || '',
      country: $('#pCountry').value.trim() || '',
      price: parseInt($('#pPrice').value) || 0,
      oldPrice: parseInt($('#pOldPrice').value) || 0,
      available: parseInt($('#pAvailable').value) || 0,
      image: $('#pImage').value.trim() || 'https://placehold.co/300x300/f5f5f5/333?text=Product',
      gallery: [],
      tags: $('#pTags').value.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
      type: $('#pType').value
    };

    if (id) {
      const idx = products.findIndex(p => p.id === id);
      if (idx >= 0) {
        productData.id = id;
        products[idx] = productData;
        toast('Product updated', 'success');
      }
    } else {
      const slug = (brand + '-' + model + '-' + productData.storage + '-' + productData.colour)
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
      productData.id = products.find(p => p.id === slug) ? slug + '-' + Date.now() : slug;
      products.push(productData);
      toast('Product added', 'success');
    }

    dirty = true;
    closeProductModal();
    renderProducts();
  }

  // ── Delete Product (Move to Trash) ─────────────────
  function confirmDelete(id) {
    const p = products.find(pr => pr.id === id);
    if (!p) return;

    $('#confirmTitle').textContent = 'Move to Trash';
    $('#confirmMsg').textContent = '"' + p.brand + ' ' + p.model + '" will be moved to Trash. You can restore it later.';
    $('#confirmOk').textContent = 'Move to Trash';
    $('#confirmDialog').classList.add('active');

    const okBtn = $('#confirmOk');
    const handler = () => {
      // Move to trash with timestamp
      p._deletedAt = new Date().toISOString();
      trash.push(p);

      // Remove from products
      products = products.filter(pr => pr.id !== id);

      // Remove from all sections
      Object.keys(sections).forEach(key => {
        const sec = sections[key];
        if (sec && sec.items) {
          sec.items = sec.items.filter(i => i.productId !== id);
        }
      });

      dirty = true;
      updateTrashCount();
      toast('Product moved to Trash', 'info');
      renderProducts();
      $('#confirmDialog').classList.remove('active');
      $('#confirmOk').textContent = 'Delete';
      okBtn.removeEventListener('click', handler);
    };
    okBtn.addEventListener('click', handler);
  }

  // ── Trash Page ─────────────────────────────────────
  function renderTrash() {
    if (trash.length === 0) {
      adminContent.innerHTML = `
        <div class="settings-card" style="text-align: center; padding: 60px 24px;">
          <i class="fa-solid fa-trash-can" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 16px;"></i>
          <h3 style="color: var(--text-secondary); font-weight: 600;">Trash is empty</h3>
          <p style="color: var(--text-muted); font-size: .9rem; margin-top: 8px;">Deleted products will appear here so you can restore them.</p>
        </div>`;
      return;
    }

    adminContent.innerHTML = `
      <div class="product-table-wrap">
        <div class="table-toolbar">
          <span style="font-size: .9rem; color: var(--text-secondary);">
            <i class="fa-solid fa-trash-can" style="margin-right: 6px;"></i>
            ${trash.length} item${trash.length !== 1 ? 's' : ''} in Trash
          </span>
          <button class="btn btn-danger btn-sm" id="btnEmptyTrash">
            <i class="fa-solid fa-fire"></i> Empty Trash
          </button>
        </div>
        <table class="product-table">
          <thead>
            <tr>
              <th>Image</th><th>Product</th><th>Storage / Colour</th>
              <th>Price</th><th>Deleted</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${trash.map((p, idx) => {
              const deletedDate = p._deletedAt ? new Date(p._deletedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
              return `
                <tr data-idx="${idx}" style="opacity: .8;">
                  <td><img class="thumb" src="${p.image}" alt="${p.model}"></td>
                  <td>
                    <div class="model-name">${p.brand} ${p.model}</div>
                    <div class="variant-detail">${p.title.substring(0, 50)}${p.title.length > 50 ? '…' : ''}</div>
                  </td>
                  <td>${p.storage || '—'} / ${p.colour || '—'}</td>
                  <td><span class="price-col">AED ${p.price.toLocaleString()}</span></td>
                  <td><span style="font-size: .82rem; color: var(--text-muted);">${deletedDate}</span></td>
                  <td>
                    <div class="table-actions">
                      <button class="btn-icon btn-restore" data-idx="${idx}" title="Restore">
                        <i class="fa-solid fa-rotate-left"></i>
                      </button>
                      <button class="btn-icon btn-perm-delete" data-idx="${idx}" title="Delete permanently">
                        <i class="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                  </td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`;

    // Restore buttons
    $$('.btn-restore').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        const p = trash[idx];
        if (!p) return;

        delete p._deletedAt;
        products.push(p);
        trash.splice(idx, 1);

        dirty = true;
        updateTrashCount();
        toast('"' + p.brand + ' ' + p.model + '" restored', 'success');
        renderTrash();
      });
    });

    // Permanent delete buttons
    $$('.btn-perm-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        const p = trash[idx];
        if (!p) return;

        $('#confirmTitle').textContent = 'Delete Permanently';
        $('#confirmMsg').textContent = '"' + p.brand + ' ' + p.model + '" will be permanently deleted. This cannot be undone.';
        $('#confirmOk').textContent = 'Delete Forever';
        $('#confirmDialog').classList.add('active');

        const okBtn = $('#confirmOk');
        const permHandler = () => {
          trash.splice(idx, 1);
          updateTrashCount();
          toast('Product permanently deleted', 'info');
          renderTrash();
          $('#confirmDialog').classList.remove('active');
          $('#confirmOk').textContent = 'Delete';
          okBtn.removeEventListener('click', permHandler);
        };
        okBtn.addEventListener('click', permHandler);
      });
    });

    // Empty Trash
    $('#btnEmptyTrash').addEventListener('click', () => {
      $('#confirmTitle').textContent = 'Empty Trash';
      $('#confirmMsg').textContent = 'All ' + trash.length + ' item' + (trash.length !== 1 ? 's' : '') + ' will be permanently deleted. This cannot be undone.';
      $('#confirmOk').textContent = 'Empty Trash';
      $('#confirmDialog').classList.add('active');

      const okBtn = $('#confirmOk');
      const emptyHandler = () => {
        trash = [];
        updateTrashCount();
        toast('Trash emptied', 'info');
        renderTrash();
        $('#confirmDialog').classList.remove('active');
        $('#confirmOk').textContent = 'Delete';
        okBtn.removeEventListener('click', emptyHandler);
      };
      okBtn.addEventListener('click', emptyHandler);
    });
  }

  // ── Sections State ──────────────────────────────────
  let sortingSection = null;  // which section is in sort mode

  // Section Definitions
  const SECTION_DEFS = [
    { key: 'hotSelling', label: 'Hot Selling', icon: 'fa-fire', hasTabs: false },
    { 
      key: 'nationalDaySale', label: 'National Day Sale', icon: 'fa-tag', hasTabs: true, tabField: 'category',
      categories: ['new-models', 'best-seller', 'most-viewed', 'top-brands']
    },
    { 
      key: 'featuredCollections', label: 'Featured Collections', icon: 'fa-star', hasTabs: true, tabField: 'category',
      categories: ['new-models', 'best-seller', 'most-viewed', 'top-brands']
    },
    { 
      key: 'bestSellers', label: 'Best Sellers', icon: 'fa-trophy', hasTabs: true, tabField: 'category',
      categories: ['new-launch', 'best-seller', 'most-viewed', 'top-brands']
    },
    { key: 'promoBanners', label: 'Promo Banners', icon: 'fa-image', hasTabs: false, isBanner: true }
  ];

  // ── Sections Page (Main Editor) ────────────────────
  function renderSections() {
    // sectionDefs moved to global constant SECTION_DEFS

    adminContent.innerHTML = SECTION_DEFS.map(sec => {
      const data = sections[sec.key];
      const items = Array.isArray(data) ? data : (data && data.items ? data.items : []);
      const count = items.length;
      const isSorting = sortingSection === sec.key;

      // Group by category if tabbed
      let tabGroups = {};
      if (sec.hasTabs) {
        items.forEach((item, idx) => {
          const cat = item[sec.tabField] || 'uncategorized';
          if (!tabGroups[cat]) tabGroups[cat] = [];
          tabGroups[cat].push({ ...item, _idx: idx });
        });
      }

      // Build items list
      let itemsHTML = '';
      if (sec.hasTabs) {
        const cats = Object.keys(tabGroups);
        itemsHTML = cats.map(cat => {
          const groupItems = tabGroups[cat];
          return `
            <div class="tab-group">
              <div class="tab-group-header">${cat.replace(/-/g, ' ')}<span class="tab-count">${groupItems.length} items</span></div>
              ${groupItems.map(item => renderSectionItem(item, sec.key, item._idx, isSorting, items.length)).join('')}
            </div>`;
        }).join('');
      } else if (sec.isBanner) {
        itemsHTML = items.map((item, idx) => renderBannerItem(item, sec.key, idx, isSorting, items.length)).join('');
      } else {
        itemsHTML = items.map((item, idx) => renderSectionItem(item, sec.key, idx, isSorting, items.length)).join('');
      }

      return `
        <div class="settings-card" id="section-${sec.key}">
          <h3>
            <i class="fa-solid ${sec.icon}" style="color: var(--accent); margin-right: 8px;"></i> ${sec.label}
            <span style="font-weight: 400; font-size: .85rem; color: var(--text-secondary);"> — ${count} items</span>
            <div style="float: right; display: flex; gap: 6px;">
              <button class="btn btn-sm ${isSorting ? 'btn-primary' : 'btn-secondary'}" data-sort-section="${sec.key}" title="${isSorting ? 'Exit sort mode' : 'Reorder items'}">
                <i class="fa-solid fa-arrow-up-arrow-down"></i>
              </button>
              <button class="btn btn-sm btn-secondary" data-choose-section="${sec.key}">
                <i class="fa-solid fa-list-check"></i> Choose Products
              </button>
            </div>
          </h3>
          <div class="section-editor-list">${itemsHTML || '<p style="color: var(--text-muted); font-size: .88rem; padding: 12px 0;">No items yet — click "Choose Products" to add.</p>'}</div>
        </div>`;
    }).join('');

    // Bind "Choose Products" buttons
    $$('[data-choose-section]').forEach(btn => {
      btn.addEventListener('click', () => openChooseProducts(btn.dataset.chooseSection));
    });

    // Bind "Sort" toggle buttons
    $$('[data-sort-section]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.sortSection;
        sortingSection = (sortingSection === key) ? null : key;
        renderSections();
      });
    });

    // Bind remove buttons
    $$('.section-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sectionKey = btn.dataset.section;
        const idx = parseInt(btn.dataset.idx);
        const sec = sections[sectionKey];
        const items = Array.isArray(sec) ? sec : (sec && sec.items ? sec.items : []);

        if (idx >= 0 && idx < items.length) {
          items.splice(idx, 1);
          dirty = true;
          renderSections();
          toast('Item removed', 'info');
        }
      });
    });

    // Bind sort up/down buttons
    $$('.sort-up-btn').forEach(btn => {
      btn.addEventListener('click', () => moveItem(btn.dataset.section, parseInt(btn.dataset.idx), -1));
    });
    $$('.sort-down-btn').forEach(btn => {
      btn.addEventListener('click', () => moveItem(btn.dataset.section, parseInt(btn.dataset.idx), 1));
    });
  }

  // Move item up or down within a section (Smart Sort)
  function moveItem(sectionKey, idx, direction) {
    const secData = sections[sectionKey];
    const items = Array.isArray(secData) ? secData : (secData && secData.items ? secData.items : []);
    const secDef = SECTION_DEFS.find(s => s.key === sectionKey);
    
    // Default simple move
    let targetIdx = idx + direction;

    // For tabbed sections, we must find the next item of the same category
    if (secDef && secDef.hasTabs) {
      const currentCat = items[idx][secDef.tabField];
      targetIdx = -1;
      
      if (direction === -1) { // Up
        for (let i = idx - 1; i >= 0; i--) {
          if (items[i][secDef.tabField] === currentCat) {
            targetIdx = i;
            break;
          }
        }
      } else { // Down
        for (let i = idx + 1; i < items.length; i++) {
          if (items[i][secDef.tabField] === currentCat) {
            targetIdx = i;
            break;
          }
        }
      }
    }

    if (targetIdx < 0 || targetIdx >= items.length) return;

    // Swap
    const temp = items[idx];
    items[idx] = items[targetIdx];
    items[targetIdx] = temp;

    dirty = true;
    renderSections();
  }

  function renderSectionItem(item, sectionKey, idx, isSorting, totalItems) {
    const productId = item.productId || '';
    const p = products.find(pr => pr.id === productId);
    const name = p ? (p.brand + ' ' + p.model) : (item.title || productId || 'Unknown');
    const storage = p && p.storage ? p.storage : '';
    const colour = p && p.colour ? p.colour : '';
    const meta = p ? ('AED ' + p.price.toLocaleString() + (storage ? ' · ' + storage : '') + (colour ? ' · ' + colour : '')) : (item.subtitle || '');
    const thumb = p ? p.image : '';
    const catBadge = item.category ? '<span class="cat-badge">' + item.category.replace(/-/g, ' ') + '</span>' : '';

    const sortButtons = isSorting ? `
      <button class="btn-icon btn-sm sort-up-btn ${idx === 0 ? 'disabled' : ''}" data-section="${sectionKey}" data-idx="${idx}" title="Move up" ${idx === 0 ? 'disabled' : ''}>
        <i class="fa-solid fa-chevron-up"></i>
      </button>
      <button class="btn-icon btn-sm sort-down-btn ${idx === totalItems - 1 ? 'disabled' : ''}" data-section="${sectionKey}" data-idx="${idx}" title="Move down" ${idx === totalItems - 1 ? 'disabled' : ''}>
        <i class="fa-solid fa-chevron-down"></i>
      </button>` : '';

    return `
      <div class="section-item${isSorting ? ' sorting' : ''}">
        <span class="item-number">${idx + 1}</span>
        ${thumb ? '<img class="section-thumb" src="' + thumb + '" alt="">' : ''}
        <div class="item-info">
          <div class="item-name">${name} ${catBadge}</div>
          <div class="item-meta">${meta}${item.overridePrice ? ' → AED ' + item.overridePrice.toLocaleString() : ''}${item.giftTag ? ' · 🎁 ' + item.giftTag : ''}</div>
        </div>
        <div class="item-actions">
          ${sortButtons}
          ${!isSorting ? '<button class="btn-icon btn-sm section-remove-btn" title="Remove from section" data-section="' + sectionKey + '" data-idx="' + idx + '"><i class="fa-solid fa-xmark"></i></button>' : ''}
        </div>
      </div>`;
  }

  function renderBannerItem(item, sectionKey, idx, isSorting, totalItems) {
    const sortButtons = isSorting ? `
      <button class="btn-icon btn-sm sort-up-btn ${idx === 0 ? 'disabled' : ''}" data-section="${sectionKey}" data-idx="${idx}" title="Move up" ${idx === 0 ? 'disabled' : ''}>
        <i class="fa-solid fa-chevron-up"></i>
      </button>
      <button class="btn-icon btn-sm sort-down-btn ${idx === totalItems - 1 ? 'disabled' : ''}" data-section="${sectionKey}" data-idx="${idx}" title="Move down" ${idx === totalItems - 1 ? 'disabled' : ''}>
        <i class="fa-solid fa-chevron-down"></i>
      </button>` : '';

    return `
      <div class="section-item${isSorting ? ' sorting' : ''}">
        <span class="item-number">${idx + 1}</span>
        <div class="item-info">
          <div class="item-name">${item.title || 'Banner'}</div>
          <div class="item-meta">${item.subtitle || ''} · ${item.theme || ''}</div>
        </div>
        <div class="item-actions">
          ${sortButtons}
          ${!isSorting ? '<button class="btn-icon btn-sm section-remove-btn" title="Remove" data-section="' + sectionKey + '" data-idx="' + idx + '"><i class="fa-solid fa-xmark"></i></button>' : ''}
        </div>
      </div>`;
  }

  // ── Choose Products for a Section ──────────────────
  function openChooseProducts(sectionKey) {
    const modal = $('#productModal');
    const modalTitle = $('#modalTitle');
    const modalBody = $('.modal-body');
    const modalFooter = $('.modal-footer');

    const sec = sections[sectionKey];
    const items = Array.isArray(sec) ? sec : (sec && sec.items ? sec.items : []);
    const secDef = SECTION_DEFS.find(s => s.key === sectionKey);

    // Build a Set of currently selected product IDs
    const selectedIds = new Set(items.map(i => i.productId).filter(Boolean));

    // Category support for tabbed sections
    const categories = secDef ? secDef.categories : null;

    modalTitle.textContent = 'Choose Products — ' + (secDef ? secDef.label : sectionKey);

    modalBody.innerHTML = `
      <div class="form-group" style="margin-bottom: 12px;">
        <input type="text" id="chooserSearch" placeholder="Search products…" autocomplete="off" style="width: 100%;">
      </div>
      ${categories ? '<div class="form-group" style="margin-bottom: 12px;"><label>Default category for new items</label><select id="chooserCategory">' + categories.map(c => '<option value="' + c + '">' + c.replace(/-/g, ' ') + '</option>').join('') + '</select></div>' : ''}
      <div class="chooser-stats" style="font-size: .82rem; color: var(--text-secondary); margin-bottom: 10px;">
        <span id="chooserCount">${selectedIds.size}</span> of ${products.length} products selected
      </div>
      <div id="chooserList" class="chooser-list" style="max-height: 400px; overflow-y: auto;"></div>`;

    function renderChecklist(filter) {
      const q = (filter || '').toLowerCase().trim();
      const filtered = q
        ? products.filter(p => (p.brand + ' ' + p.model + ' ' + p.title + ' ' + (p.storage || '') + ' ' + (p.colour || '')).toLowerCase().includes(q))
        : products;

      const listEl = document.getElementById('chooserList');
      listEl.innerHTML = filtered.map(p => {
        const isChecked = selectedIds.has(p.id);
        return '<label class="chooser-item' + (isChecked ? ' checked' : '') + '" data-pid="' + p.id + '">' +
          '<input type="checkbox" ' + (isChecked ? 'checked' : '') + ' data-pid="' + p.id + '">' +
          '<img class="section-thumb" src="' + p.image + '" alt="">' +
          '<div class="item-info">' +
            '<div class="item-name">' + p.brand + ' ' + p.model + '</div>' +
            '<div class="item-meta">AED ' + p.price.toLocaleString() + (p.storage ? ' · ' + p.storage : '') + (p.colour ? ' · ' + p.colour : '') + '</div>' +
          '</div>' +
        '</label>';
      }).join('');

      // Bind checkbox changes
      listEl.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
          const pid = cb.dataset.pid;
          if (cb.checked) {
            selectedIds.add(pid);
            cb.closest('.chooser-item').classList.add('checked');
          } else {
            selectedIds.delete(pid);
            cb.closest('.chooser-item').classList.remove('checked');
          }
          document.getElementById('chooserCount').textContent = selectedIds.size;
        });
      });
    }

    renderChecklist('');

    // Search filter
    document.getElementById('chooserSearch').addEventListener('input', function () {
      renderChecklist(this.value);
    });

    // Footer
    modalFooter.innerHTML = `
      <button class="btn btn-secondary" id="cancelModalInner">Cancel</button>
      <button class="btn btn-primary" id="applyChoicesBtn"><i class="fa-solid fa-check"></i> Apply Selection</button>`;

    document.getElementById('cancelModalInner').addEventListener('click', () => {
      modal.classList.remove('active');
      restoreProductForm();
    });

    document.getElementById('applyChoicesBtn').addEventListener('click', () => {
      // Rebuild section items: keep existing items that are still selected, add new ones
      const defaultCat = categories && document.getElementById('chooserCategory') ? document.getElementById('chooserCategory').value : null;

      // Keep order of existing items that remain selected
      const kept = items.filter(i => i.productId && selectedIds.has(i.productId));
      const keptIds = new Set(kept.map(i => i.productId));

      // Add newly selected items at the end
      const newItems = [];
      selectedIds.forEach(pid => {
        if (!keptIds.has(pid)) {
          const newItem = { productId: pid };
          if (defaultCat) newItem.category = defaultCat;
          newItems.push(newItem);
        }
      });

      const finalItems = [...kept, ...newItems];

      // Apply to section
      if (Array.isArray(sec)) {
        sections[sectionKey] = finalItems;
      } else if (sec && sec.items !== undefined) {
        sec.items = finalItems;
      }

      dirty = true;
      modal.classList.remove('active');
      restoreProductForm();
      renderSections();
      toast('Section updated — ' + finalItems.length + ' items', 'success');
    });

    modal.classList.add('active');
  }

  // Restore the product form to default state
  function restoreProductForm() {
    const modalBody = $('.modal-body');
    const modalFooter = $('.modal-footer');

    modalBody.innerHTML = `
      <form id="productForm">
        <input type="hidden" id="editProductId">
        <div class="form-row">
          <div class="form-group"><label>Brand</label><select id="pBrand" required><option value="">— Select Brand —</option></select><input type="text" id="pBrandNew" placeholder="Enter new brand name" style="display:none; margin-top:8px;"></div>
          <div class="form-group"><label>Model</label><input type="text" id="pModel" required placeholder="e.g. iPhone 17 Pro Max"></div>
        </div>
        <div class="form-group"><label>Title</label><input type="text" id="pTitle" required placeholder="e.g. iPhone 17 Pro Max 5G With FaceTime – ME Version"></div>
        <div class="form-row form-row-3">
          <div class="form-group"><label>Storage</label><input type="text" id="pStorage" placeholder="e.g. 256GB"></div>
          <div class="form-group"><label>Colour</label><input type="text" id="pColour" placeholder="e.g. Orange"></div>
          <div class="form-group"><label>Country / Version</label><input type="text" id="pCountry" placeholder="e.g. TDRA"></div>
        </div>
        <div class="form-row form-row-3">
          <div class="form-group"><label>Price (AED)</label><input type="number" id="pPrice" required min="0" placeholder="4899"></div>
          <div class="form-group"><label>Old Price (AED)</label><input type="number" id="pOldPrice" min="0" placeholder="5099"></div>
          <div class="form-group"><label>Available Stock</label><input type="number" id="pAvailable" required min="0" placeholder="50"></div>
        </div>
        <div class="form-group"><label>Image URL</label><input type="text" id="pImage" placeholder="https://... or assets/uploads/product.jpg"></div>
        <div class="form-group"><label>Image Upload</label><input type="file" id="pImageFile" accept="image/*"></div>
        <div class="form-row">
          <div class="form-group"><label>Type</label><select id="pType"><option value="phone">Phone</option><option value="tablet">Tablet</option><option value="laptop">Laptop</option><option value="watch">Watch</option><option value="accessory">Accessory</option><option value="audio">Audio</option><option value="other">Other</option></select></div>
          <div class="form-group"><label>Tags (comma-separated)</label><input type="text" id="pTags" placeholder="apple, iphone, flagship"></div>
        </div>
      </form>`;

    modalFooter.innerHTML = `
      <button class="btn btn-secondary" id="cancelModal">Cancel</button>
      <button class="btn btn-primary" id="saveProduct"><i class="fa-solid fa-check"></i> Save Product</button>`;

    $('#cancelModal').addEventListener('click', closeProductModal);
    $('#saveProduct').addEventListener('click', handleSaveProduct);
  }

  // ── Settings Page ──────────────────────────────────
  function renderSettings() {
    const isCustomPass = localStorage.getItem('aqaz_admin_pass') !== null;

    adminContent.innerHTML = `
      <div class="settings-card">
        <h3><i class="fa-solid fa-lock" style="color: var(--accent); margin-right: 8px;"></i> Change Password</h3>
        <p style="color: var(--text-secondary); font-size: .9rem; margin-bottom: 16px;">
          ${isCustomPass ? 'Your password has been changed from the default.' : 'You are using the default password. It is recommended to change it.'}
        </p>
        <div class="form-group">
          <label>Current Password</label>
          <input type="password" id="currentPass" placeholder="Enter your current password">
        </div>
        <div class="form-group">
          <label>New Password</label>
          <input type="password" id="newPass" placeholder="Enter new password">
        </div>
        <div class="form-group">
          <label>Confirm New Password</label>
          <input type="password" id="confirmNewPass" placeholder="Re-enter new password">
        </div>
        <div style="display: flex; gap: 10px; align-items: center;">
          <button class="btn btn-primary" id="btnChangePass">
            <i class="fa-solid fa-key"></i> Update Password
          </button>
          <span id="passChangeMsg" style="font-size: .85rem;"></span>
        </div>
      </div>

      <div class="settings-card">
        <h3><i class="fa-solid fa-database" style="color: var(--accent); margin-right: 8px;"></i> Data Status</h3>
        <p style="color: var(--text-secondary); font-size: .9rem;">
          Products loaded: <strong style="color: var(--text-primary);">${products.length}</strong><br>
          Sections: <strong style="color: var(--text-primary);">${Object.keys(sections).length}</strong><br>
          Unsaved changes: <strong style="color: ${dirty ? 'var(--warning)' : 'var(--success)'}">${dirty ? 'Yes' : 'No'}</strong>
        </p>
      </div>

      <div class="settings-card">
        <h3><i class="fa-solid fa-download" style="color: var(--accent); margin-right: 8px;"></i> Export Data</h3>
        <p style="color: var(--text-secondary); font-size: .9rem; margin-bottom: 12px;">
          Download current data as JSON files. After editing, you can replace the files in your <code>data/</code> folder.
        </p>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-secondary" id="exportProducts">
            <i class="fa-solid fa-download"></i> products.json
          </button>
          <button class="btn btn-secondary" id="exportSections">
            <i class="fa-solid fa-download"></i> sections.json
          </button>
        </div>
      </div>`;

    // Change password handler
    $('#btnChangePass').addEventListener('click', function () {
      const msgEl = $('#passChangeMsg');
      const current = $('#currentPass').value;
      const newP = $('#newPass').value;
      const confirmP = $('#confirmNewPass').value;

      // Validate current password
      if (current !== getPassword()) {
        msgEl.style.color = 'var(--danger)';
        msgEl.textContent = 'Current password is incorrect.';
        return;
      }

      // Validate new password
      if (!newP || newP.length < 4) {
        msgEl.style.color = 'var(--danger)';
        msgEl.textContent = 'New password must be at least 4 characters.';
        return;
      }

      if (newP !== confirmP) {
        msgEl.style.color = 'var(--danger)';
        msgEl.textContent = 'New passwords do not match.';
        return;
      }

      if (newP === current) {
        msgEl.style.color = 'var(--warning)';
        msgEl.textContent = 'New password must be different from current.';
        return;
      }

      // Save new password
      localStorage.setItem('aqaz_admin_pass', newP);
      msgEl.style.color = 'var(--success)';
      msgEl.textContent = 'Password changed successfully!';
      toast('Password updated', 'success');

      // Clear fields
      $('#currentPass').value = '';
      $('#newPass').value = '';
      $('#confirmNewPass').value = '';
    });

    // Export handlers
    $('#exportProducts').addEventListener('click', () => downloadJSON(products, 'products.json'));
    $('#exportSections').addEventListener('click', () => downloadJSON(sections, 'sections.json'));
  }

  // ── Save Data (Download JSON) ──────────────────────
  function saveData() {
    if (!dirty) {
      toast('No changes to save.', 'info');
      return;
    }

    // Download both files
    downloadJSON(products, 'products.json');
    setTimeout(() => downloadJSON(sections, 'sections.json'), 500);

    dirty = false;
    toast('Data files downloaded! Replace them in your data/ folder.', 'success');
  }

  // ── Toast Notification ─────────────────────────────
  function toast(message, type) {
    type = type || 'info';
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
    el.innerHTML = '<i class="fa-solid ' + (icons[type] || icons.info) + '"></i> ' + message;
    toastContainer.appendChild(el);
    setTimeout(function () { el.remove(); }, 4000);
  }

  // ── Download Helper ────────────────────────────────
  function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  // ── Boot ───────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
