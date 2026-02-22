import os

# Load the base template
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Markers for injection
# We want to replace everything between the header and the footer
header_tag = '</header>'
footer_tag = '<footer'

h_end = html.find(header_tag)
if h_end != -1:
    h_end += len(header_tag)
else:
    h_end = html.find('</nav>') + 6

f_start = html.find(footer_tag)
if f_start == -1:
    f_start = html.find('<div class="footer')

new_body = """
    <main id="product-details-container" class="container my-5" style="min-height: 50vh;">
        <div class="text-center py-5">
            <i class="fa-solid fa-spinner fa-spin fa-3x"></i>
            <p class="mt-3" style="color: #666; font-size: 1.1rem;">Loading product details...</p>
        </div>
    </main>

    <!-- Related Products Section -->
    <section class="related-products mt-5 mb-5 pb-5">
        <div class="container">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="font-size: 1.5rem; color: #1a2b4b; font-weight: 700; margin: 0;">Related products</h3>
                <div class="slider-nav" style="display: flex; gap: 10px;">
                    <button class="nav-btn" id="relatedPrevBtn" style="background: transparent; border: 1px solid #ddd; border-radius: 50%; width: 36px; height: 36px; cursor: pointer; color: #333;"><i class="fa-solid fa-chevron-left"></i></button>
                    <button class="nav-btn" id="relatedNextBtn" style="background: transparent; border: 1px solid #ddd; border-radius: 50%; width: 36px; height: 36px; cursor: pointer; color: #333;"><i class="fa-solid fa-chevron-right"></i></button>
                </div>
            </div>
            <div class="related-slider-container" style="overflow: hidden; padding-bottom: 20px;">
                <div class="related-slider-track" id="relatedSliderTrack" style="display: flex; gap: 20px; transition: transform 0.4s ease-in-out;">
                    <!-- Filled dynamically -->
                </div>
            </div>
        </div>
    </section>
"""

new_html = html[:h_end] + new_body + html[f_start:]

# Replace render.js with product-details.js for the PDP
new_html = new_html.replace('<script src="js/render.js"></script>', '<script src="js/product-details.js"></script>')

with open('product-details.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print("Re-built product-details.html successfully!")
