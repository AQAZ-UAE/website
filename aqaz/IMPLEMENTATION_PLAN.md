# iPoint CMS Implementation Plan

> Consolidated Master Plan — Last Updated: 2026-02-17

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [File Structure](#3-file-structure)
4. [Data Layer — Two JSON Files](#4-data-layer--two-json-files)
5. [Rendering Engine](#5-rendering-engine)
6. [Admin Console](#6-admin-console)
7. [GitHub API Integration](#7-github-api-integration)
8. [Image Handling](#8-image-handling)
9. [Existing Template Sections Reference](#9-existing-template-sections-reference)
10. [Implementation Steps](#10-implementation-steps)
11. [Daily Admin Workflow](#11-daily-admin-workflow)
12. [Prerequisites & Questions](#12-prerequisites--questions)

---

## 1. Project Overview

### Goal

Transform the static iPoint e-commerce template into a **data-driven website** where:

- All product data is stored in **JSON files** (not hardcoded HTML)
- An **Admin Console** allows editing products, prices, stock, and images
- Changes are **saved directly to GitHub** via the GitHub API (no backend server)
- **GitHub Pages** serves the updated content automatically

### Constraints

- Hosted on **GitHub Pages** (static files only, no server)
- No user registration / server-side authentication
- Existing HTML/CSS template structure must be **preserved** (no design changes)
- Products and prices change **daily** (admin must update quickly each morning)

### Tech Stack

| Layer        | Technology                     |
| ------------ | ------------------------------ |
| Frontend     | HTML, CSS, Vanilla JavaScript  |
| Styling      | Bootstrap 5 + Custom CSS       |
| Data Storage | JSON files in the GitHub repo  |
| Admin Panel  | Standalone `admin.html` page   |
| Save/Persist | GitHub REST API (Contents API) |
| Hosting      | GitHub Pages                   |
| Icons        | Font Awesome 6                 |

---

## 2. Architecture

### Data Flow

```
┌────────────────────────────────────────────────────────────┐
│                    PUBLIC WEBSITE                           │
│                                                            │
│  index.html loads → render.js fetches JSON files           │
│       │                                                    │
│       ▼                                                    │
│  data/products.json  ←──┐                                  │
│  data/sections.json  ←──┤                                  │
│       │                 │                                  │
│       ▼                 │  GitHub API (PUT)                 │
│  Renders products       │                                  │
│  into existing          │                                  │
│  HTML sections          │                                  │
│                         │                                  │
└─────────────────────────┼──────────────────────────────────┘
                          │
┌─────────────────────────┼──────────────────────────────────┐
│                    ADMIN CONSOLE                           │
│                                                            │
│  admin.html → admin.js                                     │
│       │                                                    │
│       ▼                                                    │
│  1. Login with GitHub PAT (Personal Access Token)          │
│  2. Fetch current JSON files from GitHub API               │
│  3. Admin edits products/sections in a rich UI             │
│  4. Click Save → GitHub API commits updated JSON           │
│  5. GitHub Pages auto-redeploys (~1-2 min)                 │
│  6. Live site shows updated data                           │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Why Two JSON Files?

- **`products.json`** = The master catalog (every product, one entry each)
- **`sections.json`** = Layout configuration (which products go where on the page)

**Benefit:** If "iPhone 17 Pro Max" appears in **3 sections** (Hot Selling, Featured, Best Sellers), you update its price **once** in `products.json`, and all 3 sections reflect the change. But `sections.json` can apply section-specific sale prices via `overridePrice`.

---

## 3. File Structure

```
ipoint/
│
├── data/                          ← NEW FOLDER
│   ├── products.json              ← Master product catalog
│   └── sections.json              ← Section-wise display config
│
├── assets/
│   ├── images/                    ← Existing promo banner images
│   └── uploads/                   ← NEW: Admin-uploaded product images
│
├── css/
│   ├── style.css                  ← EXISTING (no changes)
│   └── admin.css                  ← NEW: Admin panel styling
│
├── js/
│   ├── script.js                  ← EXISTING (modified: call render engine)
│   ├── render.js                  ← NEW: Fetch JSON → render sections
│   └── admin.js                   ← NEW: Admin panel + GitHub API
│
├── index.html                     ← EXISTING (modified: remove hardcoded cards)
├── admin.html                     ← NEW: Admin console page
├── logo.png                       ← Existing
│
├── stock/                         ← Existing reference files
│   ├── CMF BY NOTHUNG.txt
│   ├── HONOR.txt
│   ├── INFINX.txt
│   ├── ONE PLUS.txt
│   ├── OPPO.txt
│   ├── Redmi Note 14 5G.txt
│   ├── Xiaomi 15.txt
│   ├── vivo.txt
│   ├── Stocks.xlsx
│   ├── CONSOLIDATED_REPORT.md
│   └── generate_report.py
│
└── IMPLEMENTATION_PLAN.md         ← This file
```

### Files — Action Summary

| File                 | Action        | Details                                       |
| -------------------- | ------------- | --------------------------------------------- |
| `data/products.json` | **CREATE**    | Master product catalog from stock files       |
| `data/sections.json` | **CREATE**    | Section-to-product mappings                   |
| `js/render.js`       | **CREATE**    | Rendering engine for all 5 sections           |
| `js/admin.js`        | **CREATE**    | Admin panel logic + GitHub API                |
| `css/admin.css`      | **CREATE**    | Admin panel dark-mode styling                 |
| `admin.html`         | **CREATE**    | Admin console page                            |
| `assets/uploads/`    | **CREATE**    | Empty folder for product images               |
| `index.html`         | **MODIFY**    | Link render.js, hollow out hardcoded products |
| `js/script.js`       | **MODIFY**    | Call render engine on page load               |
| `css/style.css`      | **NO CHANGE** | ✅ Untouched                                  |

---

## 4. Data Layer — Two JSON Files

### 4A. `data/products.json` — Master Product Catalog

Contains **every product** with full details. This is the single source of truth.

```json
[
  {
    "id": "apple-iphone-17-pro-max",
    "brand": "Apple",
    "model": "iPhone 17 Pro Max",
    "title": "iPhone 17 Pro Max – Middle East Version with FaceTime",
    "storage": ["256GB", "512GB", "1TB"],
    "colours": ["Orange", "Silver", "Blue"],
    "country": "TDRA",
    "price": 4899,
    "oldPrice": 7499,
    "available": 6,
    "image": "assets/uploads/iphone-17-pro-max.png",
    "gallery": [
      "assets/uploads/iphone-17-pm-front.png",
      "assets/uploads/iphone-17-pm-back.png"
    ],
    "tags": ["new-launch", "best-seller", "apple"],
    "type": "phone"
  },
  {
    "id": "samsung-s25-ultra",
    "brand": "Samsung",
    "model": "S25 Ultra",
    "title": "Samsung Galaxy S25 Ultra 5G",
    "storage": ["256GB", "512GB"],
    "colours": ["Gray", "Silver Blue", "Jet Black"],
    "country": "TDRA",
    "price": 3999,
    "oldPrice": null,
    "available": 10,
    "image": "assets/uploads/samsung-s25-ultra.png",
    "gallery": [],
    "tags": ["new-launch", "samsung"],
    "type": "phone"
  }
]
```

**Product fields reference:**

| Field       | Type        | Required | Description                                          |
| ----------- | ----------- | -------- | ---------------------------------------------------- |
| `id`        | string      | ✅       | Unique identifier (kebab-case)                       |
| `brand`     | string      | ✅       | Brand name (Apple, Samsung, OPPO, etc.)              |
| `model`     | string      | ✅       | Short model name                                     |
| `title`     | string      | ✅       | Full product title for display                       |
| `storage`   | string[]    | ❌       | Available storage options                            |
| `colours`   | string[]    | ❌       | Available colours                                    |
| `country`   | string      | ❌       | Country/region variant (TDRA, India, China, etc.)    |
| `price`     | number      | ✅       | Current selling price in AED                         |
| `oldPrice`  | number/null | ❌       | Original price (null if no discount)                 |
| `available` | number      | ✅       | Current stock count                                  |
| `image`     | string      | ✅       | Main product image path                              |
| `gallery`   | string[]    | ❌       | Additional image paths (for sliders)                 |
| `tags`      | string[]    | ❌       | Category tags for filtering                          |
| `type`      | string      | ❌       | Product type (phone, tablet, pad, accessory, laptop) |

**Brands to populate from stock files:**

- Apple (from Stocks.xlsx — iPhone, iPad, AirPods)
- Samsung (from Stocks.xlsx — A-series, S-series)
- Redmi / Xiaomi (from Redmi Note 14 5G.txt, Xiaomi 15.txt)
- OPPO (from OPPO.txt)
- vivo (from vivo.txt)
- Honor / Huawei (from HONOR.txt)
- OnePlus (from ONE PLUS.txt)
- Infinix (from INFINX.txt)
- CMF by Nothing (from CMF BY NOTHUNG.txt)

---

### 4B. `data/sections.json` — Section Display Configuration

Controls **which products appear in which section** on the homepage.

```json
{
  "hotSelling": {
    "title": "Hot Selling",
    "items": [
      { "productId": "apple-iphone-17-pro-max", "order": 1 },
      { "productId": "samsung-s25-ultra", "order": 2 },
      { "productId": "apple-iphone-17-air", "order": 3 },
      { "productId": "apple-ipad-11", "order": 4 },
      { "productId": "apple-iphone-14-pro-max", "order": 5 },
      { "productId": "oppo-reno-15-pro-5g", "order": 6 }
    ]
  },

  "nationalDaySale": {
    "title": "National Day Sale",
    "subtitle": "Enjoy National Day Sale",
    "tabs": ["New Models", "Best Seller", "Most Viewed", "Top Brands"],
    "items": [
      {
        "productId": "apple-iphone-14-pro-max",
        "giftTag": "Chance to Win Free Gift",
        "overridePrice": 2499,
        "overrideOldPrice": 3350
      },
      {
        "productId": "apple-iphone-17-air",
        "giftTag": "Chance to Win Free Gift",
        "overridePrice": 3799,
        "overrideOldPrice": 6999
      }
    ]
  },

  "featuredCollections": {
    "items": [
      { "productId": "apple-iphone-17-air", "category": "new-models" },
      {
        "productId": "apple-iphone-17-pro-max-china",
        "category": "new-models"
      },
      { "productId": "apple-iphone-17-pro-max-hk", "category": "new-models" },
      { "productId": "apple-iphone-17-pro-max-usa", "category": "new-models" },
      { "productId": "apple-iphone-14-pro", "category": "best-seller" },
      { "productId": "apple-iphone-14-pro-max", "category": "best-seller" },
      { "productId": "apple-iphone-15", "category": "most-viewed" },
      { "productId": "apple-iphone-15-plus", "category": "most-viewed" },
      { "productId": "apple-iphone-15-pro-max", "category": "top-brands" },
      { "productId": "apple-iphone-15-pro", "category": "top-brands" }
    ]
  },

  "bestSellers": {
    "title": "Best Sellers",
    "subtitle": "Special products in this month.",
    "tabs": ["New Launch", "All", "Best Seller", "Most viewed"],
    "items": [
      { "productId": "apple-iphone-17-pro-max", "category": "new-launch" },
      { "productId": "apple-iphone-17-pro", "category": "new-launch" },
      { "productId": "apple-iphone-17-air", "category": "all" },
      { "productId": "apple-iphone-17-pro-max-hk", "category": "all" },
      {
        "productId": "apple-iphone-17-pro-max-china",
        "category": "best-seller"
      },
      { "productId": "apple-iphone-17-pro-max-usa", "category": "best-seller" },
      {
        "productId": "apple-iphone-17-pro-max-gold",
        "category": "most-viewed"
      },
      { "productId": "apple-iphone-17-pro-esim", "category": "most-viewed" }
    ]
  },

  "promoBanners": [
    {
      "id": "promo-1",
      "subtitle": "45mm Silver Aluminum",
      "title": "Apple Series 8",
      "accentText": null,
      "buttonText": "See More",
      "buttonLink": "#",
      "image": "assets/images/Banner_29.webp",
      "theme": "dark"
    },
    {
      "id": "promo-2",
      "subtitle": "Apple Watch 10 46mm",
      "title": "APPLE SERIES 10",
      "accentText": null,
      "buttonText": "See More",
      "buttonLink": "#",
      "image": "assets/images/Banner_30.webp",
      "theme": "light"
    },
    {
      "id": "promo-3",
      "subtitle": "Deal of the year",
      "title": "13\" MacBook Pro",
      "accentText": "Innovation Everywhere",
      "buttonText": "Shop Now",
      "buttonLink": "#",
      "image": "assets/images/Banner_27.webp",
      "theme": "dark"
    },
    {
      "id": "promo-4",
      "subtitle": "Customization",
      "title": "Full Setup",
      "accentText": "Flat 30% Off",
      "buttonText": "Get Now",
      "buttonLink": "#",
      "image": "assets/images/Banner_28.webp",
      "theme": "light-blue"
    }
  ]
}
```

**Section fields reference:**

| Section               | Items Include                                               | Notes                                               |
| --------------------- | ----------------------------------------------------------- | --------------------------------------------------- |
| `hotSelling`          | `productId`, `order`                                        | Simple list, shows mini-card (image + name)         |
| `nationalDaySale`     | `productId`, `giftTag`, `overridePrice`, `overrideOldPrice` | Hero cards with image slider, allows price override |
| `featuredCollections` | `productId`, `category`                                     | Grid cards filtered by tab category                 |
| `bestSellers`         | `productId`, `category`                                     | Slider cards filtered by tab category               |
| `promoBanners`        | Full banner data (no product reference)                     | Independent banner config                           |

---

## 5. Rendering Engine

### `js/render.js` — Core Responsibilities

1. **Fetch** both JSON files on page load
2. **Merge** section references with product data (lookup by ID)
3. **Render** HTML into existing containers using existing CSS classes
4. **Preserve** all existing styles and interactions

### Render Functions

| Function                      | Target Container     | Generates                              |
| ----------------------------- | -------------------- | -------------------------------------- |
| `renderHotSelling()`          | `#hotSellingSlider`  | `.mini-card` elements                  |
| `renderNationalDaySale()`     | `.national-day-grid` | `.national-card` elements              |
| `renderFeaturedCollections()` | `#dynamicGrid`       | `.item-card` elements                  |
| `renderBestSellers()`         | `#bestSellerTrack`   | `.slider-column > .item-card` elements |
| `renderPromoBanners()`        | `.promo-grid`        | `.promo-banner` elements               |

### HTML Templates (what each renderer generates)

#### Hot Selling — `.mini-card`

```html
<div class="mini-card">
  <img src="{product.image}" alt="{product.model}" />
  <span>{product.model}</span>
</div>
```

#### National Day Sale — `.national-card`

```html
<div class="national-card has-slider">
  <div class="img-side product-slider" id="{sliderId}">
    <img src="{gallery[0]}" alt="..." class="active" />
    <img src="{gallery[1]}" alt="..." />
  </div>
  <div class="info-side">
    <p class="brand">{product.brand}</p>
    <h3>{product.title}</h3>
    <div class="gift-tag">
      <i class="fa-solid fa-gift"></i>
      <span>{section.giftTag}</span>
    </div>
    <div class="price-area">
      <span class="price-current">AED {price}</span>
      <span class="price-old">AED {oldPrice}</span>
    </div>
    <div class="stock-info">
      <div class="progress">
        <div class="progress-bar" style="width: {stockPercent}%;"></div>
      </div>
      <span class="available-txt">Available: {available}</span>
    </div>
  </div>
</div>
```

#### Featured Collections & Best Sellers — `.item-card`

```html
<div class="item-card">
  <div class="discount-pill">-{discount}%</div>
  <!-- if applicable -->
  <div class="item-actions">
    <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
    <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
    <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
  </div>
  <div class="item-img-box"><img src="{image}" alt="{model}" /></div>
  <div class="item-brand">{brand}</div>
  <h3 class="item-title">{title}</h3>
  <div class="item-price-row">
    <span class="item-price">AED {price}</span>
    <span class="item-old-price">AED {oldPrice}</span>
    <!-- if applicable -->
  </div>
  <div class="item-stock">
    <div class="progress">
      <div class="progress-bar" style="width: {stockPercent}%;"></div>
    </div>
    <span class="item-available">Available: {available}</span>
  </div>
  <button class="btn-add-cart">Add To Cart</button>
</div>
```

#### Promo Banners — `.promo-banner`

```html
<div class="promo-banner {theme}">
  <div class="promo-content">
    <p class="promo-subtitle">{subtitle}</p>
    <h2 class="promo-title">{title}</h2>
    <span class="promo-accent-text">{accentText}</span>
    <!-- if present -->
    <a href="{buttonLink}" class="promo-btn"
      >{buttonText} <i class="fa-solid fa-chevron-right"></i
    ></a>
  </div>
  <img src="{image}" alt="{title}" class="promo-bg-img" />
</div>
```

### Render Flow

```javascript
// render.js — simplified flow
async function initSite() {
  const [products, sections] = await Promise.all([
    fetch("data/products.json").then((r) => r.json()),
    fetch("data/sections.json").then((r) => r.json()),
  ]);

  // Helper: look up product by ID
  const getProduct = (id) => products.find((p) => p.id === id);

  renderHotSelling(sections.hotSelling, getProduct);
  renderNationalDaySale(sections.nationalDaySale, getProduct);
  renderFeaturedCollections(sections.featuredCollections, getProduct);
  renderBestSellers(sections.bestSellers, getProduct);
  renderPromoBanners(sections.promoBanners);
}
```

---

## 6. Admin Console

### 6A. Access

- URL: `admin.html` (not linked from main site, accessed directly)
- No server-side auth needed
- Login asks for **GitHub Personal Access Token (PAT)**
- PAT stored in `sessionStorage` (clears when tab closes)

### 6B. Admin Panel Layout

```
┌──────────────────────────────────────────────────────────┐
│  🔧 iPoint Admin Console                     [Logout]   │
├─────────────┬────────────────────────────────────────────┤
│             │                                            │
│  SIDEBAR    │   MAIN CONTENT AREA                        │
│             │                                            │
│  📦 All     │   [Product List / Editor / Section Config] │
│  Products   │                                            │
│             │                                            │
│  ────────── │                                            │
│  SECTIONS   │                                            │
│  ────────── │                                            │
│             │                                            │
│  📌 Hot     │                                            │
│  Selling    │                                            │
│             │                                            │
│  🏷️ National│                                            │
│  Day Sale   │                                            │
│             │                                            │
│  ⭐ Featured│                                            │
│  Collections│                                            │
│             │                                            │
│  🔥 Best    │                                            │
│  Sellers    │                                            │
│             │                                            │
│  📢 Promo   │                                            │
│  Banners    │                                            │
│             │                                            │
│  ────────── │                                            │
│  ⚙️ Settings│                                            │
│             │                                            │
└─────────────┴────────────────────────────────────────────┘
```

### 6C. All Products View

A **searchable, filterable table** of every product in `products.json`:

```
┌──────────────────────────────────────────────────────────┐
│  📦 All Products                    [+ Add Product]      │
│                                                          │
│  Search: [___________]  Filter: [All Brands ▼]           │
│                                                          │
│  ┌──────┬────────────────────┬───────┬──────┬─────────┐  │
│  │ Img  │ Model              │ Price │Stock │ Actions │  │
│  ├──────┼────────────────────┼───────┼──────┼─────────┤  │
│  │ 📱   │ iPhone 17 Pro Max  │ 4899  │  6   │ ✏️ 🗑️   │  │
│  │ 📱   │ iPhone 17 Air      │ 3799  │  13  │ ✏️ 🗑️   │  │
│  │ 📱   │ Samsung S25 Ultra  │ 3999  │  10  │ ✏️ 🗑️   │  │
│  └──────┴────────────────────┴───────┴──────┴─────────┘  │
│                                                          │
│  [ 💾 Save to GitHub ]                                   │
└──────────────────────────────────────────────────────────┘
```

### 6D. Product Edit Form (Modal)

When clicking ✏️ Edit on a product:

```
┌──────────────────────────────────────────────────────┐
│  ✏️ Edit Product                            [Close X] │
│                                                      │
│  Brand:     [Apple          ▼]                       │
│  Model:     [iPhone 17 Pro Max    ]                  │
│  Title:     [iPhone 17 Pro Max – Middle East...]     │
│  Type:      [phone ▼]                                │
│                                                      │
│  Price (AED):    [4899    ]                          │
│  Old Price:      [7499    ]    Discount: -35%        │
│  Available:      [6       ]                          │
│                                                      │
│  Storage:   [✅ 256GB] [✅ 512GB] [✅ 1TB] [+ Add]    │
│  Colours:   [✅ Orange] [✅ Silver] [✅ Blue] [+ Add]  │
│  Country:   [TDRA         ]                          │
│                                                      │
│  Main Image: [Upload / URL]  🖼️ preview              │
│  Gallery:    [Upload]  [Upload]  [Upload]            │
│                                                      │
│  Tags:   [✅ new-launch] [✅ best-seller] [☐ most-viewed] │
│                                                      │
│  [Cancel]                           [Save Product]   │
└──────────────────────────────────────────────────────┘
```

### 6E. Section Editor Views

When clicking a section in the sidebar (e.g., "Featured Collections"):

```
┌──────────────────────────────────────────────────────┐
│  ⭐ Featured Collections                              │
│                                                      │
│  Select products to show in this section:            │
│                                                      │
│  Current Items:                                      │
│  ┌────┬─────────────────────┬────────────┬────────┐  │
│  │ #  │ Product             │ Category   │ Action │  │
│  ├────┼─────────────────────┼────────────┼────────┤  │
│  │ 1  │ iPhone 17 Air       │ new-models │  🗑️ ▲▼ │  │
│  │ 2  │ iPhone 17 PM China  │ new-models │  🗑️ ▲▼ │  │
│  │ 3  │ iPhone 17 PM HK     │ new-models │  🗑️ ▲▼ │  │
│  └────┴─────────────────────┴────────────┴────────┘  │
│                                                      │
│  [+ Add Product to Section]                          │
│  Dropdown: [Select Product ▼] Category: [new-models ▼] │
│                                                      │
│  National Day Sale — additional fields per item:     │
│  Gift Tag: [Chance to Win Free Gift]                 │
│  Override Price: [2499]                              │
│  Override Old Price: [3350]                          │
│                                                      │
│  [ 💾 Save to GitHub ]                               │
└──────────────────────────────────────────────────────┘
```

### 6F. Settings Panel

```
┌──────────────────────────────────────────────────────┐
│  ⚙️ Settings                                         │
│                                                      │
│  GitHub Username:  [fardhanfaharudeen     ]          │
│  Repository Name:  [ipoint               ]          │
│  Branch:           [main                 ]          │
│                                                      │
│  These are saved in localStorage so you don't        │
│  need to re-enter them each time.                    │
│                                                      │
│  [Save Settings]                                     │
└──────────────────────────────────────────────────────┘
```

### 6G. Admin Design

- **Dark theme**: Background `#0f172a` (dark navy)
- **Accent color**: `#FD9636` (iPoint orange)
- **Clean forms**: Proper spacing, clear labels
- **Toast notifications**: "✅ Saved to GitHub!" / "❌ Error saving"
- **Confirmation dialogs**: Before delete actions
- **Responsive**: Usable on tablet for shop-floor updates

---

## 7. GitHub API Integration

### 7A. Authentication

- User enters a **GitHub Personal Access Token (PAT)** on login
- PAT requires `repo` scope (or `public_repo` if public)
- Stored in `sessionStorage` (clears on tab close for security)
- Generate at: github.com → Settings → Developer Settings → Personal Access Tokens

### 7B. API Endpoints Used

| Action           | Method | Endpoint                                                   |
| ---------------- | ------ | ---------------------------------------------------------- |
| Read JSON file   | GET    | `/repos/{owner}/{repo}/contents/data/products.json`        |
| Update JSON file | PUT    | `/repos/{owner}/{repo}/contents/data/products.json`        |
| Upload image     | PUT    | `/repos/{owner}/{repo}/contents/assets/uploads/{filename}` |
| Read image list  | GET    | `/repos/{owner}/{repo}/contents/assets/uploads`            |

### 7C. Read JSON File

```javascript
async function fetchProductsFromGitHub(token, owner, repo) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/data/products.json`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    },
  );
  const fileData = await response.json();
  return {
    sha: fileData.sha, // Needed for updates
    content: JSON.parse(atob(fileData.content)), // Decode base64 → JSON
  };
}
```

### 7D. Update JSON File

```javascript
async function saveProductsToGitHub(
  token,
  owner,
  repo,
  updatedData,
  currentSha,
) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/data/products.json`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Update products - ${new Date().toLocaleDateString()}`,
        content: btoa(
          unescape(encodeURIComponent(JSON.stringify(updatedData, null, 2))),
        ),
        sha: currentSha,
      }),
    },
  );
  return response.json(); // Returns new SHA
}
```

### 7E. Upload Image

```javascript
async function uploadImageToGitHub(token, owner, repo, filename, base64Data) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/assets/uploads/${filename}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Upload image: ${filename}`,
        content: base64Data, // Pure base64 (no data: prefix)
      }),
    },
  );
  return response.json();
}
```

---

## 8. Image Handling

### Approach

- **Image upload** in admin converts to base64 → commits via GitHub API
- **Image URL** can also be entered manually (for external CDN images)
- Images stored in `assets/uploads/` directory in the repo
- Placeholder images (`placehold.co`) used as fallback

### File Size Considerations

- GitHub API has a **100MB file limit per file** (images are fine)
- GitHub API has a **1MB content limit per PUT** for base64-encoded content
- For images > 750KB, we should either:
  - Compress before upload
  - Use the Git Blob API for larger files
  - Or simply compress images client-side before upload (recommended)

### Image Naming Convention

```
assets/uploads/{brand}-{model}-{variant}.png
```

Examples:

- `assets/uploads/apple-iphone-17-pro-max-orange.png`
- `assets/uploads/samsung-s25-ultra-gray.png`
- `assets/uploads/oppo-reno-15-pro-5g-blue.png`

---

## 9. Existing Template Sections Reference

The current `index.html` has these sections (in order). The rendering engine must recreate the exact same HTML structure:

| #   | Section              | Lines   | Container ID/Class   | Card Class                    | Currently                        |
| --- | -------------------- | ------- | -------------------- | ----------------------------- | -------------------------------- |
| 1   | Top Bar              | 19-41   | `.top-bar`           | —                             | Static (no change)               |
| 2   | Header               | 44-90   | `.main-header`       | —                             | Static (no change)               |
| 3   | Banner               | 92-107  | `.new-year-banner`   | —                             | Static (no change for now)       |
| 4   | Hot Selling          | 110-207 | `#hotSellingSlider`  | `.mini-card`                  | 20 hardcoded items → **DYNAMIC** |
| 5   | National Day Sale    | 211-287 | `.national-day-grid` | `.national-card`              | 2 hardcoded items → **DYNAMIC**  |
| 6   | Featured Collections | 290-504 | `#dynamicGrid`       | `.item-card`                  | 10 hardcoded items → **DYNAMIC** |
| 7   | Best Sellers         | 508-690 | `#bestSellerTrack`   | `.slider-column > .item-card` | 8 hardcoded items → **DYNAMIC**  |
| 8   | Promo Banners        | 693-735 | `.promo-grid`        | `.promo-banner`               | 4 hardcoded items → **DYNAMIC**  |
| 9   | Service Features     | 738-785 | `.service-features`  | —                             | Static (no change)               |
| 10  | Subscription         | 788-801 | `.subscription-bar`  | —                             | Static (no change)               |
| 11  | Footer               | 804-929 | `.site-footer`       | —                             | Static (no change)               |
| 12  | Floating Controls    | 932-939 | `.floating-controls` | —                             | Static (no change)               |

**Sections 4-8 are what we're making dynamic. Everything else stays hardcoded.**

---

## 10. Implementation Steps

### Step 1: Create `data/products.json`

- Parse all stock files (text + Excel) into the JSON structure
- Use the consolidated report as reference
- Include placeholder images initially
- All products from all brands

### Step 2: Create `data/sections.json`

- Map existing hardcoded products to their sections
- Maintain current display order
- Include current promo banner data

### Step 3: Create `js/render.js`

- Fetch both JSON files
- Implement 5 render functions (one per section)
- Generate identical HTML to current hardcoded cards
- Export functions for use by `script.js`

### Step 4: Modify `index.html`

- Add `<script src="js/render.js"></script>` before `script.js`
- Replace hardcoded product cards with empty containers + loading state
- Keep container elements (IDs and classes) intact
- Keep all non-product sections untouched

### Step 5: Modify `js/script.js`

- Call `initSite()` from `render.js` on page load
- Re-initialize sliders/interactions after dynamic render
- Ensure tab switching works with dynamically rendered cards

### Step 6: Create `css/admin.css`

- Dark-themed admin panel design
- Form styles, table styles, modal styles
- Toast notification styles
- Responsive layout for sidebar + content

### Step 7: Create `admin.html`

- Full admin panel page structure
- Login screen with PAT input
- Sidebar navigation
- Product table, edit forms, section editors
- Settings panel

### Step 8: Create `js/admin.js`

- GitHub API integration (read, write, upload)
- CRUD operations for products
- Section management (add/remove/reorder products)
- Image upload handler (file → base64 → GitHub API)
- Toast notifications
- Confirmation dialogs

### Step 9: Test & Polish

- Verify all 5 sections render correctly from JSON
- Test admin panel CRUD → GitHub save → live site update
- Test image upload
- Test tab filtering in Featured Collections and Best Sellers
- Test slider functionality after dynamic render
- Test on mobile/tablet

---

## 11. Daily Admin Workflow

```
MORNING PRICE UPDATE (5 minutes):
═══════════════════════════════════

1. Open browser → go to: yoursite.github.io/admin.html
2. Paste your GitHub PAT → Click Login
3. Admin panel loads with current product data from GitHub

4. Click "📦 All Products" in sidebar
5. Find product that needs price update
6. Click ✏️ Edit
7. Change price: 4899 → 4599
8. Change stock: 6 → 8
9. Click "Save Product"

10. Click "💾 Save to GitHub" button
11. Toast: "✅ products.json saved to GitHub!"
12. Wait ~1-2 minutes for GitHub Pages to redeploy

13. Refresh main site → see updated prices ✅
14. Close admin tab (PAT is cleared from sessionStorage)

DONE! ☕
```

---

## 12. Prerequisites & Questions

### Before Implementation

| #   | Question                                                | Status            |
| --- | ------------------------------------------------------- | ----------------- |
| 1   | GitHub username?                                        | ❓ Need from user |
| 2   | GitHub repo name for iPoint?                            | ❓ Need from user |
| 3   | Branch name (main/master)?                              | ❓ Need from user |
| 4   | Product prices — will you provide, or use placeholders? | ❓ Need from user |
| 5   | Product images — use placeholders for now?              | ❓ Need from user |

### Setup Required (One-Time)

1. **Create GitHub PAT:**
   - Go to github.com → Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
   - Generate new token with `repo` scope
   - Copy and save securely

2. **Push iPoint project to GitHub** (if not already done)

3. **Enable GitHub Pages:**
   - Repo Settings → Pages → Source: Deploy from branch → `main` → `/ (root)`

---

## Appendix: Stock Data Sources

| Source File            | Brand(s)              | Products                  | Has Prices? |
| ---------------------- | --------------------- | ------------------------- | ----------- |
| `Stocks.xlsx`          | Apple, Samsung, Redmi | ~78 items with quantities | ❌ No       |
| `CMF BY NOTHUNG.txt`   | CMF by Nothing        | 2 models                  | ❌ No       |
| `HONOR.txt`            | Honor, Huawei         | 14 models                 | ❌ No       |
| `INFINX.txt`           | Infinix               | 3 models                  | ❌ No       |
| `ONE PLUS.txt`         | OnePlus               | 7 models (phones + pads)  | ❌ No       |
| `OPPO.txt`             | OPPO                  | 15 models                 | ❌ No       |
| `Redmi Note 14 5G.txt` | Redmi                 | 13 models                 | ❌ No       |
| `Xiaomi 15.txt`        | Xiaomi                | 5 models (phones + pads)  | ❌ No       |
| `vivo.txt`             | vivo                  | 10 models                 | ❌ No       |

**Total: ~147 product entries across 9 brands**

---

_End of Implementation Plan_
