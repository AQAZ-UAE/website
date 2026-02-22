document.addEventListener("DOMContentLoaded", () => {
    
    // Register Form Logic
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("regName").value;
            const email = document.getElementById("regEmail").value;
            const password = document.getElementById("regPassword").value;
            
            try {
                // Pointing to our new local Node Backend API
                const resp = await fetch("http://localhost:3000/api/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password })
                });
                
                const data = await resp.json();
                
                if (resp.ok) {
                    alert("Account created successfully! Please sign in.");
                    window.location.href = "login.html";
                } else {
                    alert("Error: " + (data.message || "Registration failed"));
                }
            } catch (err) {
                console.error(err);
                alert("Failed to connect to the server. Make sure the Node.js backend is running!");
            }
        });
    }

    // Login Form Logic
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;
            
            try {
                // Pointing to our new local Node Backend API
                const resp = await fetch("http://localhost:3000/api/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await resp.json();
                
                if (resp.ok) {
                    // Save JWT token in browser and redirect to shopping page
                    localStorage.setItem("aqaz_token", data.token);
                    localStorage.setItem("aqaz_user", JSON.stringify(data.user));
                    alert("Welcome back, " + data.user.name + "!");
                    window.location.href = "index.html";
                } else {
                    alert("Error: " + (data.message || "Login failed"));
                }
            } catch (err) {
                console.error(err);
                alert("Failed to connect to the server. Make sure the Node.js backend is running!");
            }
        });
    }

    // --- Global Auth UI Update ---
    updateAuthUI();
    
    if (localStorage.getItem("aqaz_token")) {
        fetchCartCount();
        syncWishlistUI();
    }
});

async function fetchCartCount() {
    const token = localStorage.getItem("aqaz_token");
    if (!token) return;
    try {
        const resp = await fetch("http://localhost:3000/api/cart", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const items = await resp.json();
        if (resp.ok) {
            const count = items.reduce((sum, item) => sum + item.quantity, 0);
            updateCartBadge(count);
        }
    } catch (err) { console.error(err); }
}

async function syncWishlistUI() {
    const token = localStorage.getItem("aqaz_token");
    if (!token) return;
    try {
        const resp = await fetch("http://localhost:3000/api/wishlist", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const favorites = await resp.json();
        if (resp.ok) {
            // Updated icons on page
            document.querySelectorAll('.action-btn[title="Add to Wishlist"], .btn[title="Add to Wishlist"]').forEach(btn => {
                const pid = btn.dataset.productId;
                const icon = btn.querySelector('i');
                if (favorites.includes(pid)) {
                    icon.classList.replace('fa-regular', 'fa-solid');
                    icon.style.color = "#ff6b00";
                } else {
                    icon.classList.replace('fa-solid', 'fa-regular');
                    icon.style.color = "inherit";
                }
            });
            updateWishlistBadge(favorites.length);
        }
    } catch (err) { console.error(err); }
}

function updateWishlistBadge(count) {
    const badge = document.querySelector('.wishlist-badge');
    if (badge) {
        badge.innerText = count || 0;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

function updateAuthUI() {
    const userStr = localStorage.getItem("aqaz_user");
    const loginBtn = document.querySelector('a[href="login.html"]');
    
    if (userStr && loginBtn) {
        const user = JSON.parse(userStr);
        loginBtn.innerHTML = `
            <i class="fa-regular fa-user"></i>
            <span>${user.name.split(' ')[0]}</span>
        `;
        loginBtn.href = "javascript:void(0)";
        
        // Add logout option on click or hover
        loginBtn.title = "Click to Logout";
        loginBtn.onclick = () => {
            if(confirm("Do you want to logout?")) {
                localStorage.removeItem("aqaz_token");
                localStorage.removeItem("aqaz_user");
                window.location.reload();
            }
        };
    }
}

// Global functions for Cart and Wishlist
window.toggleCartModal = function() {
    // We'll build the sidebar UI later, for now just show a simple list or redirect
    alert("Cart Sidebar / Checkout Page coming soon!");
};

window.toggleWishlistModal = function() {
    alert("Wishlist functionality active! Items are saved to your account.");
};

// --- Add to Cart Logic ---
window.addToCart = async function(productId) {
    const token = localStorage.getItem("aqaz_token");
    if (!token) {
        if(confirm("Please login to add items to your cart. Redirect to login?")) {
            window.location.href = "login.html";
        }
        return;
    }

    try {
        const resp = await fetch("http://localhost:3000/api/cart/add", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ productId, quantity: 1 })
        });
        
        const data = await resp.json();
        if (resp.ok) {
            showToast("Success", pIdToTitle(productId) + " added to cart!");
            updateCartBadge(data.cartCount);
        } else {
            alert(data.message || "Failed to add to cart");
        }
    } catch (err) {
        console.error(err);
        alert("Server error. Is the backend running?");
    }
};

// --- Toggle Wishlist Logic ---
window.toggleWishlist = async function(productId, btnElement) {
    const token = localStorage.getItem("aqaz_token");
    if (!token) {
        if(confirm("Please login to manage your wishlist. Redirect to login?")) {
            window.location.href = "login.html";
        }
        return;
    }

    try {
        const resp = await fetch("http://localhost:3000/api/wishlist/toggle", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ productId })
        });
        
        const data = await resp.json();
        if (resp.ok) {
            const icon = btnElement.querySelector('i');
            if (data.action === "added") {
                icon.classList.replace('fa-regular', 'fa-solid');
                icon.style.color = "#ff6b00";
                showToast("Wishlist", "Product added to favorites");
            } else {
                icon.classList.replace('fa-solid', 'fa-regular');
                icon.style.color = "inherit";
                showToast("Wishlist", "Product removed from favorites");
            }
            // re-sync or just fetch count
            syncWishlistUI();
        }
    } catch (err) {
        console.error(err);
    }
};

// Helper: Toast Notification
function showToast(title, message) {
    const container = document.getElementById('toastContainer') || document.body;
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.style = `
        position: fixed; bottom: 20px; left: 20px; 
        background: #1a2b4b; color: white; padding: 15px 25px; 
        border-radius: 8px; z-index: 9999; box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease-out;
    `;
    toast.innerHTML = `<strong>${title}</strong>: ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

function updateCartBadge(count) {
    const badge = document.querySelector('.cart-badge');
    if (badge) {
        badge.innerText = count || 0;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

function pIdToTitle(id) {
    // Ideally look up in local products list if available
    return "Product";
}

// Map slideIn animation
if (!document.getElementById('toast-style')) {
    const style = document.createElement('style');
    style.id = 'toast-style';
    style.innerHTML = `
        @keyframes slideIn {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}
