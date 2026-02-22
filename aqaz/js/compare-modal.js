// Add this to js/script.js OR a new global file to handle the modal
function getCompareModalHTML() {
  return `
  <!-- Compare Modal Structure -->
  <div class="modal fade" id="compareModal" tabindex="-1" aria-labelledby="compareModalLabel" aria-hidden="true" style="z-index: 1055;">
    <div class="modal-dialog modal-dialog-centered modal-xl">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header border-0 pb-0 justify-content-end" style="position: absolute; right: 0; z-index: 10;">
          <button type="button" class="btn-close shadow-sm bg-light rounded-circle p-2 m-2" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body p-0">
          <div class="table-responsive">
            <table class="table table-bordered mb-0 text-center align-middle" style="table-layout: fixed; border-color: #f0f0f0;">
              <tbody>
                <!-- Header / Image Row -->
                <tr>
                  <td class="fw-bold align-middle" style="color: #1a2b4b; width: 15%; border-left: 0;">Product</td>
                  <td style="width: 42.5%;">
                    <div id="compare-col1-image" class="mb-3" style="height: 180px; display: flex; align-items: center; justify-content: center;">
                       <span class="text-muted"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</span>
                    </div>
                    <div id="compare-col1-title" class="fw-semibold text-primary" style="font-size: 0.95rem; min-height: 2.5rem;"></div>
                  </td>
                  <td style="width: 42.5%; position: relative;">
                     <!-- Empty / Search State -->
                     <div id="compare-col2-empty">
                         <div class="mt-4 mb-3 text-muted"><i class="fa-solid fa-plus fa-2x"></i></div>
                         <div class="position-relative mx-auto" style="max-width: 250px;">
                            <input type="text" id="modalCompareSearch" class="form-control text-center rounded-pill bg-light border-0 py-2" placeholder="Search a product to compare...">
                            <div id="modalCompareSearchResults" class="position-absolute shadow bg-white w-100 mt-2 text-start" style="display:none; max-height:250px; overflow-y:auto; z-index:100; border-radius:12px;"></div>
                         </div>
                     </div>
                     <!-- Filled State -->
                     <div id="compare-col2-filled" style="display:none;">
                       <button onclick="clearCompareCol2()" class="btn btn-sm btn-light position-absolute rounded-circle shadow-sm" style="top: 10px; right: 10px; width: 30px; height: 30px;"><i class="fa-solid fa-xmark"></i></button>
                       <div id="compare-col2-image" class="mb-3" style="height: 180px; display: flex; align-items: center; justify-content: center;"></div>
                       <div id="compare-col2-title" class="fw-semibold text-primary" style="font-size: 0.95rem; min-height: 2.5rem;"></div>
                     </div>
                  </td>
                </tr>
                
                <!-- Rating Row -->
                <tr>
                   <td class="fw-bold" style="color: #1a2b4b; border-left: 0; padding: 20px 0;">Rating</td>
                   <td id="compare-col1-rating" style="padding: 20px 0; color: #f39c12; font-size: 0.85rem;"><i class="fa-solid fa-star"></i> <span class="text-muted ms-1">No reviews</span></td>
                   <td id="compare-col2-rating" style="padding: 20px 0;"><div class="bg-light mx-auto" style="width:40px; height:8px; border-radius:4px;"></div></td>
                </tr>

                <!-- Price Row -->
                <tr>
                   <td class="fw-bold" style="color: #1a2b4b; border-left: 0; padding: 20px 0;">Price</td>
                   <td style="padding: 20px 0;" id="compare-col1-price"></td>
                   <td style="padding: 20px 0;" id="compare-col2-price"><div class="bg-light mx-auto" style="width:40px; height:8px; border-radius:4px;"></div></td>
                </tr>

                <!-- Availability Row -->
                <tr>
                   <td class="fw-bold" style="color: #1a2b4b; border-left: 0; padding: 20px 0;">Availability</td>
                   <td style="padding: 20px 0;" id="compare-col1-stock"></td>
                   <td style="padding: 20px 0;" id="compare-col2-stock"><div class="bg-light mx-auto" style="width:40px; height:8px; border-radius:4px;"></div></td>
                </tr>

                <!-- Product Type Row -->
                <tr>
                   <td class="fw-bold" style="color: #1a2b4b; border-left: 0; padding: 20px 0;">Product type</td>
                   <td id="compare-col1-type" style="padding: 20px 0; font-size: 0.9rem; text-transform:capitalize;"></td>
                   <td id="compare-col2-type" style="padding: 20px 0;"><div class="bg-light mx-auto" style="width:40px; height:8px; border-radius:4px;"></div></td>
                </tr>

                <!-- Actions / Cart Row -->
                <tr>
                   <td class="fw-bold" style="color: #1a2b4b; border-left: 0; padding: 20px 0; border-bottom: 0;">Actions</td>
                   <td style="padding: 20px 0; border-bottom: 0;">
                      <button class="btn btn-outline-success btn-sm px-4 py-2 fw-semibold rounded-pill">Add to cart</button>
                   </td>
                   <td style="padding: 20px 0; border-bottom: 0;" id="compare-col2-action">
                      <div class="bg-light mx-auto" style="width:40px; height:8px; border-radius:4px;"></div>
                   </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

// Global state for compare logic
let cm_productsList = [];
let cm_product1Id = null;
let cm_product2Id = null;

async function openCompareModal(productId) {
    cm_product1Id = productId;
    
    // Inject modal to DOM if it doesn't exist
    if (!document.getElementById('compareModal')) {
        document.body.insertAdjacentHTML('beforeend', getCompareModalHTML());
        
        // Fetch JSON once
        if (cm_productsList.length === 0) {
            try {
               cm_productsList = await fetch("data/products.json").then(r => r.json());
            } catch(e) {
               console.error("Failed fetching for modal", e);
            }
        }
        
        // Wire up modal search
        initModalSearch();
    }
    
    // Reset col 2
    clearCompareCol2();
    
    // Fill col 1
    const p1 = cm_productsList.find(p => p.id === cm_product1Id);
    if(p1) {
        document.getElementById('compare-col1-image').innerHTML = `<img src="${p1.image}" alt="${p1.model}" style="max-height: 100%; max-width: 100%; object-fit: contain;">`;
        document.getElementById('compare-col1-title').innerText = p1.title;
        
        const formatPrice = (v) => v ? v.toLocaleString('en-US') : '';
        const oldP = p1.oldPrice ? `<span class="text-muted text-decoration-line-through me-2" style="font-size:0.85rem;">AED ${formatPrice(p1.oldPrice)}</span>` : '';
        document.getElementById('compare-col1-price').innerHTML = `${oldP}<span class="fw-bold" style="font-size:1.1rem; color:#1a2b4b;">AED ${formatPrice(p1.price)}</span>`;
        
        document.getElementById('compare-col1-stock').innerHTML = `<span class="badge" style="background-color: #e6fced; color: #007600;">In stock</span>`;
        document.getElementById('compare-col1-type').innerText = p1.type || 'Standard';
    }

    // Show modal via Bootstrap
    const myModal = new bootstrap.Modal(document.getElementById('compareModal'), {});
    myModal.show();
}

function clearCompareCol2() {
    cm_product2Id = null;
    document.getElementById('compare-col2-empty').style.display = 'block';
    document.getElementById('compare-col2-filled').style.display = 'none';
    
    // Reset dash lines below
    document.getElementById('compare-col2-rating').innerHTML = '<div class="bg-light mx-auto" style="width:40px; height:8px; border-radius:4px;"></div>';
    document.getElementById('compare-col2-price').innerHTML = '<div class="bg-light mx-auto" style="width:40px; height:8px; border-radius:4px;"></div>';
    document.getElementById('compare-col2-stock').innerHTML = '<div class="bg-light mx-auto" style="width:40px; height:8px; border-radius:4px;"></div>';
    document.getElementById('compare-col2-type').innerHTML = '<div class="bg-light mx-auto" style="width:40px; height:8px; border-radius:4px;"></div>';
    document.getElementById('compare-col2-action').innerHTML = '<div class="bg-light mx-auto" style="width:40px; height:8px; border-radius:4px;"></div>';
}

function selectProductForCompareCol2(productId) {
    cm_product2Id = productId;
    const p2 = cm_productsList.find(p => p.id === cm_product2Id);
    if(!p2) return;
    
    document.getElementById('compare-col2-empty').style.display = 'none';
    document.getElementById('compare-col2-filled').style.display = 'block';
    
    document.getElementById('compare-col2-image').innerHTML = `<img src="${p2.image}" alt="${p2.model}" style="max-height: 100%; max-width: 100%; object-fit: contain;">`;
    document.getElementById('compare-col2-title').innerText = p2.title;
    
    document.getElementById('compare-col2-rating').innerHTML = `<i class="fa-solid fa-star" style="color: #f39c12;"></i> <span class="text-muted ms-1" style="font-size: 0.85rem;">No reviews</span>`;
    
    const formatPrice = (v) => v ? v.toLocaleString('en-US') : '';
    const oldP = p2.oldPrice ? `<span class="text-muted text-decoration-line-through me-2" style="font-size:0.85rem;">AED ${formatPrice(p2.oldPrice)}</span>` : '';
    document.getElementById('compare-col2-price').innerHTML = `${oldP}<span class="fw-bold" style="font-size:1.1rem; color:#1a2b4b;">AED ${formatPrice(p2.price)}</span>`;
    
    document.getElementById('compare-col2-stock').innerHTML = `<span class="badge" style="background-color: #e6fced; color: #007600;">In stock</span>`;
    document.getElementById('compare-col2-type').innerHTML = `<span style="font-size: 0.9rem; text-transform:capitalize;">${p2.type || 'Standard'}</span>`;
    
    document.getElementById('compare-col2-action').innerHTML = `<button class="btn btn-outline-success btn-sm px-4 py-2 fw-semibold rounded-pill">Add to cart</button>`;
    
    document.getElementById('modalCompareSearchResults').style.display = 'none';
    document.getElementById('modalCompareSearch').value = '';
}

function initModalSearch() {
    const searchInput = document.getElementById("modalCompareSearch");
    const searchResults = document.getElementById("modalCompareSearchResults");

    searchInput.addEventListener("input", function (e) {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        searchResults.style.display = "none";
        return;
      }

      const formatPrice = (v) => v ? v.toLocaleString('en-US') : '';

      // Filter products (excluding currently selected product 1)
      const filtered = cm_productsList.filter(
        (p) => 
          p.id !== cm_product1Id && (
          (p.title && p.title.toLowerCase().includes(q)) ||
          (p.model && p.model.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) )
      ).slice(0, 10); 

      if (filtered.length === 0) {
        searchResults.innerHTML = `<div style="padding: 15px; text-align: center; color: #999;">No matching products.</div>`;
      } else {
        searchResults.innerHTML = filtered.map(p => {
          return `
            <a href="javascript:void(0)" onclick="selectProductForCompareCol2('${p.id}')" style="display: flex; align-items: center; padding: 10px 15px; text-decoration: none; border-bottom: 1px solid #f0f0f0; color: #1a2b4b; transition: background 0.2s;">
              <img src="${p.image}" alt="${p.title}" style="width: 40px; height: 40px; object-fit: contain; margin-right: 15px;">
              <div style="flex: 1;">
                <div style="font-weight: 600; font-size: 0.85rem; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${p.title}</div>
                <div style="color: #ff6b00; font-weight: 700; font-size: 0.8rem;">AED ${formatPrice(p.price)}</div>
              </div>
            </a>
          `;
        }).join("");
      }
      searchResults.style.display = "block";
    });

    // Close when clicking outside
    document.addEventListener("click", function (e) {
      if (searchInput && searchResults && !searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.style.display = "none";
      }
    });
}
