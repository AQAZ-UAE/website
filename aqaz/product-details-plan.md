# Implementation Plan: Product Details Page & Related Products

## Objective

Create a dynamic, responsive `product-details.html` page that reads a specific product's ID from the URL (e.g., `product-details.html?id=apple-iphone-17-pro-max-256-india-natural-titanium`), retrieves the data from `products.json`, fully renders the product's details and imagery, and conditionally populates a "Related Products" slider based on identical or cross-matching database attributes.

## Architecture Approach (Single Page Application Model)

Because this store runs completely off of the `products.json` database via client-side JavaScript, we don't need to manually create hundreds of HTML pages for each phone model/color. Instead, we use a single `product-details.html` template.

1. **URL Parameters**: Users click a product card, and the `<a>` tag navigates them to `product-details.html?id=[product_id]`.
2. **Data Extraction**: The script reads the `id` from `window.location.search`.
3. **Database Look Up**: The script loops through `products.json` until it finds the matching dictionary.
4. **DOM Injection**: The script injects the image, title, price, discount, and description into placeholders on the page.

---

## Phase 1: Structure construction (`product-details.html`)

Duplicate the layout skeleton from `index.html` (to perfectly preserve the header, language selector, search bar, and footer).

In the main `<body>` section, we will construct the following container blocks:

1. **Breadcrumb Bar**: `Home > [Brand] > [Model] > [Title]`
2. **Main Product View**: A two-column split screen.
   - **Left Column (Gallery)**: A large display for `p.image`.
   - **Right Column (Details)**:
     - Brand and Model badges
     - Full `p.title`
     - Star rating block
     - Price (Current `p.price` and Crossed-out `p.oldPrice`)
     - Short promotional text/bullets (e.g. Free Delivery, Warranty info)
     - Variant selectors (Colors / Storage—_Though this mostly depends on the current data structure_)
     - Add to Cart / Buy Now call-to-action buttons
3. **Product Highlights/Description Row**: Detailed specifications if provided in JSON.

---

## Phase 2: Building the Recommended / Related Products System

Right below the main product view, we will construct a "Frequently Bought Together" or "Related Products" slider similar to the "Hot Selling" mechanism.

### The Algorithm:

1. **Match Detection**: When a user views a product (e.g. "iPhone 16 Pro Max 256GB"), the JavaScript algorithm will take the current product's `tags` (e.g. `['apple', 'iphone 16 pro max']`) or strictly match the `brand` property.
2. **Filtered Array Creation**: We will filter through `products.json` scanning for products that share the exact same `brand` or related tags, strictly **excluding** the current product's actual ID so it doesn't recommend itself.
3. **Limit & Shuffle**: We constrain this filtered list to `~8` random items max so the slider doesn't lag.
4. **Render Grid**: We push these 8 items through the exact same standard "mini-card" HTML generation string that `render.js` uses on the homepage.

---

## Phase 3: Wiring It Together (`product.js`)

We will create a specific `product.js` file linked only to `product-details.html`.

1. `await fetch('data/products.json')`
2. Parse URL parameters `new URLSearchParams(window.location.search).get('id')`
3. Execute DOM population
4. Execute the Related Products filtration
5. Bind interactive button actions (Next/Prev buttons on the Related slider).

## Global Navigation Hookup

Finally, we have to modify `render.js` and `script.js` on the main `index.html`. Every single product card currently generated needs its `<a>` href or click event altered to securely redirect to `product-details.html?id=${p.id}` instead of `#`.

_Let me know if you approve of this architectural pipeline, so I can immediately begin writing the HTML templates and the JavaScript engine mapping!_
