# Implementation Plan: Fixing Broken Product Images

## The Issue

The product images in the "Hot Selling" section (and everywhere else the dynamic javascript renderer runs) are appearing as broken image icons (`img` alt text shown instead of the photo).

## Root Cause Analysis

Right now, the python script I executed correctly filled the `data/products.json` file with relative path strings that look exactly like this:
`"image": "../images/products/iphone-17-pro-max.jpg"`

The fundamental problem is one of **Directory Relative Perspective**.

- The `products.json` data is being loaded by `js/render.js`.
- However, `js/render.js` is being triggered by `aqaz/index.html`.
- When an HTML page reads an image `src`, the relative path (`../`) is calculated **from the location of the `index.html` file**, not the JS file nor the JSON file.

### Proof of the Bug:

1. `index.html` is in the `website/aqaz/` folder.
2. The image tag tries to load `../images/products/iphone-17.jpg`.
3. `../` tells `index.html` to go UP one level into the `website/` root folder.
4. But the screenshots were actually downloaded into `website/aqaz/images/products`! Since it went up to the root directory by mistake, it fails to find the target.

## Proposed Strategy to Fix

We must execute two distinct steps to resolve this universally:

### Step 1: Update the path generation in `products.json`

Instead of using `../images/products/...`, the `products.json` items should use relative paths anchored to the `aqaz` directory where `index.html` sits.
The proper relative path for the image tags should be:
`"image": "images/products/[model].jpg"`

### Step 2: Implement a Node/Python script to forcefully recalculate the paths

I will execute a short script across your drive that completely regenerates all `"image"` key strings in `aqaz/data/products.json` to properly map to `images/products/[model].jpg`.

### Why this will work perfectly:

Once the JS renders the string `"images/products/..."`, the `index.html` document will correctly look _inside_ its current `aqaz` folder, locate the `images/products/` subfolder, and render the high-quality product images perfectly.

## Requesting Approval

Please confirm if I can proceed instantly with running the script to update the JSON paths!
