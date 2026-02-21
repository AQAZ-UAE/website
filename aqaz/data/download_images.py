import json
import urllib.request
import urllib.parse
import re
import os
import time

def clean_slug(name):
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')

def search_duckduckgo_image(query):
    # Basic duckduckgo HTML search to find an image thumbnail
    url = "https://html.duckduckgo.com/html/?q=" + urllib.parse.quote(query + " phone front")
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    req = urllib.request.Request(url, headers=headers)
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
        # find the first image result URL
        match = re.search(r'img class="z-core__img".*?src="([^"]+)"', html)
        if match:
            return "https:" + match.group(1)
        # fallback
        match = re.search(r'src="(/iu/\?u=[^"]+)"', html)
        if match:
            return "https://duckduckgo.com" + match.group(1).replace("&amp;", "&")
    except Exception as e:
        print(f"Error searching {query}: {e}")
    return None

def main():
    with open('products.json', 'r', encoding='utf-8') as f:
        products = json.load(f)

    # Find unique models
    models = set(p['model'] for p in products)
    print(f"Found {len(models)} unique models.")

    images_dir = '../images/products'
    if not os.path.exists(images_dir):
        os.makedirs(images_dir)

    model_images = {}
    
    # Base dictionary for fallback images just in case search fails
    fallbacks = {
        'iPhone': 'https://s.yimg.com/os/creatr-uploaded-images/2023-09/a3db8840-52fb-11ee-bbf9-0f40ad6060c5',
        'Galaxy': 'https://images.samsung.com/is/image/samsung/p6pim/ae/2401/gallery/ae-galaxy-s24-s928-sm-s928bztqmea-539454170?$650_519_PNG$',
        'AirPods': 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MME73?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1632861342000',
        'iPad': 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-10th-gen-finish-select-202212-blue?wid=5120&hei=2880&fmt=p-jpg&qlt=95&.v=1667592237330'
    }

    for model in models:
        slug = clean_slug(model)
        filepath = os.path.join(images_dir, f"{slug}.jpg")
        
        # Determine image URL
        img_url = search_duckduckgo_image(model)
        if not img_url:
            for key, fb_url in fallbacks.items():
                if key in model:
                    img_url = fb_url
                    break

        if img_url:
            try:
                # Add headers for image download too
                req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
                img_data = urllib.request.urlopen(req).read()
                with open(filepath, 'wb') as img_file:
                    img_file.write(img_data)
                model_images[model] = f"../images/products/{slug}.jpg"
                print(f"Downloaded {model}")
            except Exception as e:
                print(f"Failed to download image for {model}: {e}")
                model_images[model] = "https://placehold.co/300x300/f5f5f5/1a2b4b?text=" + slug
        else:
            print(f"No image found for {model}")
            model_images[model] = "https://placehold.co/300x300/f5f5f5/1a2b4b?text=" + slug
            
        time.sleep(1) # Be nice to search engine

    # Update products
    for p in products:
        p['image'] = model_images.get(p['model'], "https://placehold.co/300x300/png?text=Product")

    with open('products.json', 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=4)
        
    print("Done updating products.json.")

if __name__ == '__main__':
    main()
