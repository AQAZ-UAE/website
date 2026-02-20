// Sticky Header Logic
window.addEventListener('scroll', function () {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('sticky');
    } else {
        header.classList.remove('sticky');
    }
});

// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
        // Toggle icon between bars and xmark
        const icon = menuToggle.querySelector('i');
        if (icon.classList.contains('fa-bars')) {
            icon.classList.replace('fa-bars', 'fa-xmark');
        } else {
            icon.classList.replace('fa-xmark', 'fa-bars');
        }
    });
}

// Tab Switching Logic
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');

        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        document.getElementById(target).classList.add('active');
    });
});

// Flash Sale Countdown Timer
function updateTimer() {
    const timerElement = document.querySelector('.timer');
    if (!timerElement) return;

    let time = timerElement.innerText.replace('Ends in: ', '').split(':');
    let hours = parseInt(time[0]);
    let minutes = parseInt(time[1]);
    let seconds = parseInt(time[2]);

    if (seconds > 0) {
        seconds--;
    } else {
        if (minutes > 0) {
            minutes--;
            seconds = 59;
        } else {
            if (hours > 0) {
                hours--;
                minutes = 59;
                seconds = 59;
            }
        }
    }

    timerElement.innerText = `Ends in: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

setInterval(updateTimer, 1000);

// Hot Selling Slider Logic
const hotSellingSlider = document.getElementById('hotSellingSlider');
const navBtns = document.querySelectorAll('.hot-selling .nav-btn');

if (hotSellingSlider && navBtns.length === 2) {
    let currentPosition = 0;
    const prevBtn = navBtns[0];
    const nextBtn = navBtns[1];

    const moveSlider = (direction) => {
        const cards = document.querySelectorAll('.mini-card');
        if (cards.length === 0) return;

        const container = hotSellingSlider.parentElement;
        const cardWidth = cards[0].offsetWidth + 20; // Width + gap
        const maxScroll = Math.max(0, hotSellingSlider.scrollWidth - container.offsetWidth);

        if (direction === 'next') {
            if (Math.abs(currentPosition) >= maxScroll) {
                // Bounce effect at end - longer pull back
                hotSellingSlider.style.transform = `translateX(${currentPosition - 80}px)`;
                setTimeout(() => {
                    hotSellingSlider.style.transform = `translateX(${currentPosition}px)`;
                }, 400);
                return;
            }
            currentPosition -= cardWidth;
            if (Math.abs(currentPosition) > maxScroll) {
                currentPosition = -maxScroll;
            }
        } else {
            if (currentPosition === 0) {
                // Bounce effect at start - longer pull back
                hotSellingSlider.style.transform = `translateX(80px)`;
                setTimeout(() => {
                    hotSellingSlider.style.transform = `translateX(0px)`;
                }, 400);
                return;
            }
            currentPosition += cardWidth;
            if (currentPosition > 0) {
                currentPosition = 0;
            }
        }

        hotSellingSlider.style.transform = `translateX(${currentPosition}px)`;
    };

    nextBtn.addEventListener('click', () => moveSlider('next'));
    prevBtn.addEventListener('click', () => moveSlider('prev'));

    // Reset on window resize
    window.addEventListener('resize', () => {
        currentPosition = 0;
        hotSellingSlider.style.transform = `translateX(0px)`;
    });
}

// Tab Switching Logic for Featured Collections
function initTabSwitching() {
    const tabs = document.querySelectorAll('.tab-link');
    const grid = document.getElementById('dynamicGrid');

    if (!tabs.length || !grid) return;

    const contentData = {
        'new-models': grid.innerHTML, // Now stores iPhone content after HTML update
        'best-seller': `
            <!-- Row 1 - Samsung Best Sellers -->
            <div class="item-card">
                <div class="discount-pill">-64%</div>
                <div class="item-actions">
                    <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                    <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                    <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                </div>
                <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=S22+Ultra+Family" alt="Samsung S22 Ultra"></div>
                <div class="item-brand">Samsung</div>
                <h3 class="item-title">Samsung S22 Ultra Dual Sim 5G– International Version Galaxy</h3>
                <div class="item-price-row"><span class="item-price">AED 1,150</span><span class="item-old-price">AED 3,200</span></div>
                <div class="item-stock"><div class="progress"><div class="progress-bar" style="width: 25%;"></div></div><span class="item-available">Available: 20</span></div>
                <button class="btn-add-cart">Add To Cart</button>
            </div>
            <div class="item-card">
                <div class="item-actions">
                    <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                    <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                    <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                </div>
                <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=S24+Ultra+Gold" alt="Samsung S24 Ultra"></div>
                <div class="item-brand">iPoint</div>
                <h3 class="item-title">Samsung Galaxy S24 Ultra – 200MP Camera, 6.8" AMOLED Display, 5000mAh Battery,</h3>
                <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 2,499</span></div>
                <div class="item-stock"><div class="progress"><div class="progress-bar" style="width: 40%;"></div></div><span class="item-available">Available: 15</span></div>
                <button class="btn-add-cart">Add To Cart</button>
            </div>
            <div class="item-card">
                <div class="item-actions">
                    <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                    <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                    <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                </div>
                <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=Z+Flip+4" alt="Galaxy Z Flip 4"></div>
                <div class="item-brand">Samsung</div>
                <h3 class="item-title">SAMSUNG Galaxy Z Flip 4 Cell Phone, Factory Unlocked Android Smartphone, 256GB, Flex Mode, Compact, Foldable Design, Informative Cover Screen, US Version, 2022,</h3>
                <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 999</span></div>
                <div class="item-stock"><div class="progress"><div class="progress-bar" style="width: 15%;"></div></div><span class="item-available">Available: 5</span></div>
                <button class="btn-add-cart">Add To Cart</button>
            </div>
            <div class="item-card">
                <div class="item-actions">
                    <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                    <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                    <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                </div>
                <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=Z+Fold+4" alt="Galaxy Z Fold 4"></div>
                <div class="item-brand">iPoint</div>
                <h3 class="item-title">Galaxy Z Fold 4 5G 12GB RAM 256GB – International Version</h3>
                <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 1,799</span></div>
                <div class="item-stock"><div class="progress"><div class="progress-bar" style="width: 35%;"></div></div><span class="item-available">Available: 10</span></div>
                <button class="btn-add-cart">Add To Cart</button>
            </div>
            <div class="item-card">
                <div class="discount-pill">-46%</div>
                <div class="item-actions">
                    <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                    <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                    <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                </div>
                <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=S25+Ultra" alt="Samsung S25 Ultra"></div>
                <div class="item-brand">iPoint</div>
                <h3 class="item-title">Samsung S25 Ultra AI Dual SIM 12GB RAM 256gb/512GB 5G – Middle East Version</h3>
                <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 3,299</span><span class="item-old-price">AED 5,099</span></div>
                <div class="item-stock"><div class="progress"><div class="progress-bar" style="width: 55%;"></div></div><span class="item-available">Available: 17</span></div>
                <button class="btn-add-cart">Add To Cart</button>
            </div>

            <!-- Row 2 - Samsung Best Sellers -->
            <div class="item-card">
                <div class="item-actions">
                    <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                    <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                    <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                </div>
                <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=S10+White" alt="Samsung S10"></div>
                <div class="item-brand">Samsung</div>
                <h3 class="item-title">SAMSUNG S10 8GB RAM 128GB 4G LTE</h3>
                <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 599</span></div>
                <div class="item-stock"><div class="progress"><div class="progress-bar" style="width: 10%;"></div></div><span class="item-available">Available: 3</span></div>
                <button class="btn-add-cart">Add To Cart</button>
            </div>
            <div class="item-card">
                <div class="discount-pill">-17%</div>
                <div class="item-actions">
                    <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                    <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                    <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                </div>
                <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=A15+Family" alt="Samsung A15"></div>
                <div class="item-brand">Samsung</div>
                <h3 class="item-title">SAMSUNG A15 NEW</h3>
                <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 499</span><span class="item-old-price">AED 599</span></div>
                <div class="item-stock"><div class="progress"><div class="progress-bar" style="width: 15%;"></div></div><span class="item-available">Available: 4</span></div>
                <button class="btn-add-cart">Add To Cart</button>
            </div>
            <div class="item-card">
                <div class="item-actions">
                    <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                    <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                    <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                </div>
                <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=Tri+Fold" alt="Samsung Tri Fold"></div>
                <div class="item-brand">Samsung</div>
                <h3 class="item-title">Samsung Tri Fold 512gb Box Pack</h3>
                <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 14,999</span></div>
                <div class="item-stock"><div class="progress"><div class="progress-bar" style="width: 60%;"></div></div><span class="item-available">Available: 19</span></div>
                <button class="btn-add-cart">Add To Cart</button>
            </div>
            <div class="item-card">
                <div class="item-actions">
                    <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                    <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                    <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                </div>
                <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=A16+Green" alt="Samsung A16"></div>
                <div class="item-brand">iPoint</div>
                <h3 class="item-title">Samsung A16 Dual SIM Middle East Version</h3>
                <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 549</span></div>
                <div class="item-stock"><div class="progress"><div class="progress-bar" style="width: 60%;"></div></div><span class="item-available">Available: 19</span></div>
                <button class="btn-add-cart">Add To Cart</button>
            </div>
            <div class="item-card">
                <div class="item-actions">
                    <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                    <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                    <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                </div>
                <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=S23+Plus" alt="Samsung S23 Plus"></div>
                <div class="item-brand">iPoint</div>
                <h3 class="item-title">Samsung Galaxy S23+, 8GB RAM 256GB , International Version, 5G Mobile Phone, Dual SIM, Android Smartphone</h3>
                <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 1,899</span></div>
                <div class="item-stock"><div class="progress"><div class="progress-bar" style="width: 15%;"></div></div><span class="item-available">Available: 5</span></div>
                <button class="btn-add-cart">Add To Cart</button>
            </div>
        `,
        'most-viewed': `
            <!-- Row 1 - Most Viewed -->
            <div class="item-card">
                <div class="item-actions">
                    <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                    <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                    <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                </div>
                <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=Z+Flip+4+Cream" alt="Galaxy Z Flip 4"></div>
                <div class="item-brand">Samsung</div>
                <h3 class="item-title">SAMSUNG Galaxy Z Flip 4 Cell Phone, Factory Unlocked Android Smartphone, 256GB, Flex Mode, Compact, Foldable Design</h3>
                <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 999</span></div>
                <div class="item-stock"><div class="progress"><div class="progress-bar" style="width: 15%;"></div></div><span class="item-available">Available: 5</span></div>
                <button class="btn-add-cart">Add To Cart</button>
            </div>
            <div class="item-card">
                <div class="item-actions">
                    <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                    <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                    <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                </div>
                <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=Apple+20W+Adapter" alt="Apple 20W Adapter"></div>
                <div class="item-brand">Apple</div>
                <h3 class="item-title">20W USB-C Power Adapter – Fast Charging, Compact & Efficient</h3>
                <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 69</span></div>
                <div class="item-stock"><div class="progress"><div class="progress-bar" style="width: 45%;"></div></div><span class="item-available">Available: 37</span></div>
                <button class="btn-add-cart">Add To Cart</button>
            </div>
            <div class="item-card">
                <div class="item-actions">
                    <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                    <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                    <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                </div>
                <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=Z+Fold+4+Pink" alt="Galaxy Z Fold 4"></div>
                <div class="item-brand">iPoint</div>
                <h3 class="item-title">Galaxy Z Fold 4 5G 12GB RAM 256GB – International Version</h3>
                <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 1,799</span></div>
                <div class="item-stock"><div class="progress"><div class="progress-bar" style="width: 35%;"></div></div><span class="item-available">Available: 10</span></div>
                <button class="btn-add-cart">Add To Cart</button>
            </div>
            <div class="item-card">
                <div class="discount-pill">-23%</div>
                <div class="item-actions">
                    <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                    <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                    <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                </div>
                <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=iPhone+X+White" alt="iPhone X"></div>
                <div class="item-brand">Apple</div>
                <h3 class="item-title">iPhone X 4G With Facetime – International Version</h3>
                <div class="item-price-row"><span class="item-price">AED 499</span><span class="item-old-price">AED 560</span></div>
                <div class="item-stock"><div class="progress"><div class="progress-bar" style="width: 15%;"></div></div><span class="item-available">Available: 5</span></div>
                <button class="btn-add-cart">Add To Cart</button>
            </div>
            <div class="item-card">
                <div class="item-actions">
                    <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                    <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                    <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                </div>
                <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=iPhone+XS+Max" alt="iPhone XS Max"></div>
                <div class="item-brand">Apple</div>
                <h3 class="item-title">iPhone XS Max 4G With Facetime – International Version</h3>
                <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 799</span></div>
                <div class="item-stock"><div class="progress"><div class="progress-bar" style="width: 25%;"></div></div><span class="item-available">Available: 13</span></div>
                <button class="btn-add-cart">Add To Cart</button>
            </div>

            <!-- Row 2 - Most Viewed -->
            <div class="item-card">
                <div class="discount-pill">-44%</div>
                <div class="item-actions">
                    <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                    <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                    <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                </div>
                <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=iPhone+XR+Red" alt="iPhone XR Red"></div>
                <div class="item-brand">Apple</div>
                <h3 class="item-title">iPhone XR With Facetime – International Version</h3>
                <div class="item-price-row"><span class="item-price">AED 499</span><span class="item-old-price">AED 899</span></div>
                <div class="item-stock"><div class="progress"><div class="progress-bar" style="width: 20%;"></div></div><span class="item-available">Available: 7</span></div>
                <button class="btn-add-cart">Add To Cart</button>
            </div>
            <div class="item-card">
                <div class="item-actions">
                    <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                    <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                    <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                </div>
                <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=S10+Blue" alt="Samsung S10"></div>
                <div class="item-brand">Samsung</div>
                <h3 class="item-title">SAMSUNG S10 8GB RAM 128GB 4G LTE</h3>
                <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 599</span></div>
                <div class="item-stock"><div class="progress"><div class="progress-bar" style="width: 10%;"></div></div><span class="item-available">Available: 3</span></div>
                <button class="btn-add-cart">Add To Cart</button>
            </div>
            <div class="item-card">
                <div class="item-actions">
                    <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                    <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                    <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                </div>
                <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=Pixel+6+Pro" alt="Google Pixel 6 Pro"></div>
                <div class="item-brand">Google</div>
                <h3 class="item-title">Google Pixel 6 Pro /Features 6.7” display, Google Tensor chipset, 5003 mAh battery</h3>
                <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 899</span></div>
                <div class="item-stock"><div class="progress"><div class="progress-bar" style="width: 25%;"></div></div><span class="item-available">Available: 8</span></div>
                <button class="btn-add-cart">Add To Cart</button>
            </div>
            <div class="item-card">
                <div class="item-actions">
                    <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                    <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                    <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                </div>
                <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=iPhone+XS+Space+Grey" alt="iPhone XS"></div>
                <div class="item-brand">Apple</div>
                <h3 class="item-title">iPhone XS With Facetime – International Version</h3>
                <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 600</span></div>
                <div class="item-stock"><div class="progress"><div class="progress-bar" style="width: 60%;"></div></div><span class="item-available">Available: 34</span></div>
                <button class="btn-add-cart">Add To Cart</button>
            </div>
            <div class="item-card">
                <div class="discount-pill">-32%</div>
                <div class="item-actions">
                    <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                    <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                    <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                </div>
                <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=iPhone+7+Gold" alt="iPhone 7"></div>
                <div class="item-brand">Apple</div>
                <h3 class="item-title">iPhone 7 With FaceTime 32GB /128gb /256gb 4G LTE</h3>
                <div class="item-price-row"><span class="item-price">AED 307</span><span class="item-old-price">AED 350</span></div>
                <div class="item-stock"><div class="progress"><div class="progress-bar" style="width: 15%;"></div></div><span class="item-available">Available: 5</span></div>
                <button class="btn-add-cart">Add To Cart</button>
            </div>
        `,
        'top-brands': `
            <!-- Row 1 - Top Brands -->
            <div class="item-card">
                <div class="discount-pill">-33%</div>
                <div class="item-actions">
                    <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                    <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                    <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                </div>
                <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=Apple+Watch+SE+2" alt="Apple Watch SE 2"></div>
                <div class="item-brand">Apple</div>
                <h3 class="item-title">Apple Watch SE 2 – 44mm, Water-Resistant, Fitness & Health Tracking, Heart Rate Monitoring</h3>
                <div class="item-price-row"><span class="item-price">AED 849</span><span class="item-old-price">AED 1,269</span></div>
                <div class="item-stock"><div class="progress"><div class="progress-bar" style="width: 25%;"></div></div><span class="item-available">Available: 8</span></div>
                <button class="btn-add-cart">Add To Cart</button>
            </div>
            <div class="item-card">
                <div class="item-actions">
                    <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                    <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                    <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                </div>
                <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=Apple+Watch+S10" alt="Apple Watch Series 10"></div>
                <div class="item-brand">Apple</div>
                <h3 class="item-title">Watch Series 10 GPS 46mm Jet Black Aluminium Case With Black Sport Band</h3>
                <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 1,399</span></div>
                <div class="item-stock"><div class="progress"><div class="progress-bar" style="width: 13%;"></div></div><span class="item-available">Available: 13</span></div>
                <button class="btn-add-cart">Add To Cart</button>
            </div>
        `
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            // Update active state
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Get category and update content
            const category = this.getAttribute('data-category');
            if (contentData[category]) {
                // Re-trigger animation
                grid.style.animation = 'none';
                grid.offsetHeight; /* trigger reflow */
                grid.style.animation = null;

                grid.innerHTML = contentData[category];
            }
        });
    });
}

// Auto Image Slider for Products
function initProductSliders() {
    const sliders = document.querySelectorAll('.product-slider');

    sliders.forEach(slider => {
        const images = slider.querySelectorAll('img');
        if (images.length <= 1) return;

        let currentIndex = 0;

        setInterval(() => {
            const previousIndex = currentIndex;
            currentIndex = (currentIndex + 1) % images.length;

            // 1. Current image slides out to the left
            images[previousIndex].classList.remove('active');
            images[previousIndex].classList.add('exit');

            // 2. Comfortable wait then next image slides in from the right
            setTimeout(() => {
                images[currentIndex].classList.add('active');
            }, 600); // Balanced entry delay

            // 3. Reset previous image position instantly after it's hidden
            setTimeout(() => {
                images[previousIndex].classList.remove('exit');
                images[previousIndex].classList.add('reset');

                // Allow CSS a frame to apply reset before removing it
                setTimeout(() => {
                    images[previousIndex].classList.remove('reset');
                }, 50);
            }, 650);
        }, 3000); // Increased interval to 3 seconds
    });
}

// Best Seller Slider Logic
function initBestSellerSlider() {
    const slider = document.getElementById('bestSellerSlider');
    const track = document.getElementById('bestSellerTrack');
    const tabs = document.querySelectorAll('#bestSellerTabs a');
    const prevBtn = document.getElementById('bestSellerPrev');
    const nextBtn = document.getElementById('bestSellerNext');

    if (!slider || !prevBtn || !nextBtn || !track) return;

    // Initial content (New Launch)
    const initialContent = track.innerHTML;

    const bestSellerData = {
        'new-launch': initialContent,
        'all': `
            <!-- Column 1 (Image 0) -->
            <div class="slider-column">
                <div class="item-card">
                    <div class="discount-pill">-52%</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/1e1e1e/fff?text=MacBook+Air+2025" alt="MacBook Air 2025"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">MacBook Air ,2025 Model/ Apple M4 Chip</h3>
                    <div class="item-price-row"><span class="item-price">AED 3,499</span><span class="item-old-price">AED 4,999</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
                <div class="item-card">
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=MacBook+Pro+2019+A2141" alt="MacBook Pro 2019 A2141"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">Macbook Pro (2019) A2141 Touch Bar Laptop 16-Inch Display, Intel Core i9 Processor/8th Gen/32 RAM/512GB SSD</h3>
                    <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 2,999</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
            </div>

            <!-- Column 2 (Image 0) -->
            <div class="slider-column">
                <div class="item-card">
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/fff/333?text=MacBook+Air+A1466" alt="MacBook Air A1466"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">Macbook Air A1466 Laptop With 13.3-Inch Full HD Display, Core i5 Processor/5th Gen/8GB RAM/128GB/256GB SSD/Silver</h3>
                    <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 899</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
                <div class="item-card">
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=Macbook+Pro+A1708" alt="MacBook Pro A1708"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">Macbook Pro A1708 Laptop With 13.3-Inch Display,Intel Core i5 Processor 1.5GB Intel Graphics English</h3>
                    <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 1,599</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
            </div>

            <!-- Column 3 (Image 0) -->
            <div class="slider-column">
                <div class="item-card">
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=Macbook+Pro+2020+A2251" alt="MacBook Pro 2020 A2251"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">Macbook Pro 2020 (A2251) Laptop With 13.3-Inch Display,Intel Core i7 Processor/16GB RAM/512GB SSD/1.5GB Integrated Graphics English</h3>
                    <div class="item-rating"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><span class="rating-count">1 review</span></div>
                    <div class="item-price-row"><span class="item-price">AED 2,299</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
                <div class="item-card">
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=Macbook+Pro+A2159" alt="MacBook Pro A2159"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">Macbook Pro A2159 (2018) Laptop With 13.3-Inch Display,Intel Core i5 Processor/8th Gen Iris Plus Graphics 645 Silver</h3>
                    <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 1,799</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
            </div>

            <!-- Column 4 (Image 0) -->
            <div class="slider-column">
                <div class="item-card">
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/fff/333?text=Macbook+Pro+Liquid+XDR" alt="MacBook Pro Liquid XDR Retina M4"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">Macbook Pro Liquid XDR Retina M4 Chip Processor/macOS English</h3>
                    <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 5,899</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
                <div class="item-card">
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=Macbook+Air+M1+13" alt="MacBook Air 13 M1"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">Macbook Air 13" Display, Apple M1 Chip With 8-Core Processor and 7-Core Graphics International version</h3>
                    <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 1,800</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
            </div>

            <!-- Column 5 (Image 0) -->
            <div class="slider-column">
                <div class="item-card">
                    <div class="discount-pill" style="background: var(--text-navy);">Sold out</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/666/fff?text=Macbook+Pro+A1398" alt="MacBook Pro A1398"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">Macbook Pro A1398 (2015) Laptop With 15.4-Inch Display,Intel Core i7 Processor/1.5GB Intel Iris Graphics</h3>
                    <div class="item-rating"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><span class="rating-count">1 review</span></div>
                    <div class="item-price-row"><span class="item-price">AED 999</span><span class="item-old-price">AED 1,600</span></div>
                    <button class="btn-add-cart" disabled style="background: #f5f5f5; color: #999; border-color: #ddd;">Sold Out</button>
                </div>
                <div class="item-card">
                    <div class="discount-pill">-26%</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=Macbook+Pro+2020+M1" alt="MacBook Pro 2020 M1"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">Macbook Pro (2020) Laptop With 13.3-Inch Display,Intel M1 Chip</h3>
                    <div class="item-price-row"><span class="item-price">AED 2,649</span><span class="item-old-price">AED 3,000</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
            </div>

            <!-- Column 6 (Image 1) -->
            <div class="slider-column">
                <div class="item-card">
                    <div class="discount-pill">-61%</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/fff/333?text=MacBook+Pro+M3+Pro+Box" alt="MacBook Pro M3 Pro Box"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">MacBook Pro Laptop M3 Pro chip with Liquid Retina XDR Display,Unified Memory, (International version) English</h3>
                    <div class="item-price-row"><span class="item-price">AED 4,699</span><span class="item-old-price">AED 5,099</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
                <div class="item-card">
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=Macbook+Pro+A1990" alt="MacBook Pro A1990"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">Macbook Pro A1990 Laptop With 15.4-Inch Display,Intel Core i9 Processor /AMD Radeon Pro Graphics English</h3>
                    <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 2,599</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
            </div>

            <!-- Column 7 (Image 1) -->
            <div class="slider-column">
                <div class="item-card">
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/fff/333?text=MacBook+Air+A1932" alt="MacBook Air A1932"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">Macbook Air A1932 Laptop Intel Core i5 1.5GB Integrated Graphics English</h3>
                    <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 1,299</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
                <div class="item-card">
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=Macbook+Pro+A1989" alt="MacBook Pro A1989"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">Macbook Pro A1989 (2019) Laptop With 13.3-Inch Display,Intel Core i5 /1.5GB Intel Iris Plus Graphics</h3>
                    <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 1,699</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
            </div>

            <!-- Column 8 (Image 1) -->
            <div class="slider-column">
                <div class="item-card">
                    <div class="discount-pill" style="background: var(--text-navy);">Sold out</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/666/fff?text=MacBook+Air+A2179" alt="MacBook Air A2179"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">Macbook Air (2020) A2179 Laptop Intel Core i5 Processor English</h3>
                    <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 1,599</span></div>
                    <button class="btn-add-cart" disabled style="background: #f5f5f5; color: #999; border-color: #ddd;">Sold Out</button>
                </div>
                <div class="item-card">
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=MacBook+Pro+A1707" alt="Macbook Pro A1707"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">Macbook Pro A1707 Laptop With 15.4-Inch Display, Intel Core i7 Processor AMD Radeon Pro Graphics</h3>
                    <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 2,499</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
            </div>

            <!-- Column 9 (Image 1) -->
            <div class="slider-column">
                <div class="item-card">
                    <div class="discount-pill">-31%</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/1e1e1e/fff?text=MacBook+M5+2025" alt="MacBook M5 2025"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">Apple MacBook M5 (2025) – The Future of Power and Precision</h3>
                    <div class="item-price-row"><span class="item-price">AED 6,100</span><span class="item-old-price">AED 6,650</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
                <div class="item-card">
                    <div class="discount-pill">-41%</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=Macbook+Pro+A1502" alt="Macbook Pro A1502"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">Macbook Pro A1502 (2015) Laptop With 13.3-Inch Full HD Display,Core i5 Processor/8GB RAM/256GB SSD Silver</h3>
                    <div class="item-price-row"><span class="item-price">AED 999</span><span class="item-old-price">AED 1,699</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
            </div>

            <!-- Column 10 (Image 1) -->
            <div class="slider-column">
                <div class="item-card">
                    <div class="discount-pill">-33%</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/f0b2da/666?text=MacBook+Pink+A1534" alt="MacBook Pink A1534"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">Macbook A1534 -core M3 (With Free Accessories )</h3>
                    <div class="item-price-row"><span class="item-price">AED 999</span><span class="item-old-price">AED 1,499</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
                <div class="item-card">
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/fff/333?text=MacBook+Pro+A1706" alt="MacBook Pro A1706"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">Macbook Pro A1706 Laptop With 13.3-Inch Display,,Intel Core i7 /1.5GB,Intel Iris Plus Graphics With Touch Bar English</h3>
                    <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 1,699</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
            </div>
        `,
        'best-seller': `
            <!-- Column 1 (Image 0) -->
            <div class="slider-column">
                <div class="item-card">
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/e3f2fd/333?text=iPad+2025+11-inch" alt="iPad 2025 11-inch"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">iPad 2025 (11th Generation) 11-inch Wi-Fi</h3>
                    <div class="item-price-row"><span class="item-price">AED 1,399</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
                <div class="item-card">
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/f5f5f5/333?text=iPad+Mini+5" alt="iPad Mini 5"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">Apple iPad Mini 5 (2019) – 7.9 Retina Display, A12 Bionic Chip, 3GB RAM, 5124mAh Battery</h3>
                    <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 649</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
            </div>

            <!-- Column 2 (Image 0) -->
            <div class="slider-column">
                <div class="item-card">
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/f8f8f8/333?text=iPad+Mini+7" alt="iPad Mini 7"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">iPad Mini 7 8.3-inch, WiFi - With FaceTime - International Version</h3>
                    <div class="item-price-row"><span class="item-price">AED 1,799</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
                <div class="item-card">
                    <div class="discount-pill">-19%</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/1e1e1e/fff?text=iPad+Pro+M2" alt="iPad Pro M2"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">iPad Pro M2 chip 2022 128GB WIFI - International Version</h3>
                    <div class="item-price-row"><span class="item-price">AED 2,749</span><span class="item-old-price">AED 3,399</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
            </div>

            <!-- Column 3 (Image 0) -->
            <div class="slider-column">
                <div class="item-card">
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=iPad+Keyboard" alt="Wireless Keyboard"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">Wireless Keyboard for iPad Pro 12.9-inch</h3>
                    <div class="item-price-row"><span class="item-price">AED 299</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
                <div class="item-card">
                    <div class="discount-pill" style="background: var(--text-navy);">Sold out</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/1e1e1e/fff?text=iPad+Pro+4th+Gen" alt="iPad Pro 4th Gen"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">IPAD PRO 4th genration 13 INCH</h3>
                    <div class="item-price-row"><span class="item-price">AED 2,249</span></div>
                    <button class="btn-add-cart" disabled style="background: #f5f5f5; color: #999; border-color: #ddd;">Sold Out</button>
                </div>
            </div>

            <!-- Column 4 (Image 0) -->
            <div class="slider-column">
                <div class="item-card">
                    <div class="discount-pill">-38%</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/4a4a4a/fff?text=iPad+Mini+6" alt="iPad Mini 6"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">iPad Mini 6 (6th Generation) 8.3-Inch, 64GB, WiFi, With FaceTime - International Version</h3>
                    <div class="item-price-row"><span class="item-price">AED 1,249</span><span class="item-old-price">AED 1,999</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
                <div class="item-card">
                    <div class="discount-pill">-38%</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/fff/333?text=iPad+Mini+4" alt="iPad Mini 4"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">iPad Mini 4 2015 (4th Gen) With FaceTime 7.9-inch Wi-Fi</h3>
                    <div class="item-price-row"><span class="item-price">AED 279</span><span class="item-old-price">AED 450</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
            </div>

            <!-- Column 5 (Image 0) -->
            <div class="slider-column">
                <div class="item-card">
                    <div class="discount-pill">-35%</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/4a4a4a/fff?text=iPad+Air+2022" alt="iPad Air 2022"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">iPad Air 2022 (5th Generation) 10.9-inch Wi-Fi International Version</h3>
                    <div class="item-price-row"><span class="item-price">AED 1,699</span><span class="item-old-price">AED 2,599</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
                <div class="item-card">
                    <div class="discount-pill">-40%</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/1e1e1e/fff?text=iPad+Mini+3" alt="iPad Mini 3"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">iPad Mini 3 With FaceTime 7.9inch 64GB Wi-Fi Space Gray</h3>
                    <div class="item-price-row"><span class="item-price">AED 299</span><span class="item-old-price">AED 499</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
            </div>

            <!-- Column 6 (Image 1) -->
            <div class="slider-column">
                <div class="item-card">
                    <div class="discount-pill">-33%</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/fff/333?text=iPad+Air+1" alt="iPad Air 1"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">iPad Air 1 Silver</h3>
                    <div class="item-price-row"><span class="item-price">AED 199</span><span class="item-old-price">AED 299</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
                <div class="item-card">
                    <div class="discount-pill">-33%</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/1e1e1e/fff?text=iPad+Mini+2" alt="iPad Mini 2"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">iPad Mini 2 With FaceTime 7.9inch Wi-Fi Space Gray</h3>
                    <div class="item-price-row"><span class="item-price">AED 199</span><span class="item-old-price">AED 299</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
            </div>

            <!-- Column 7 (Image 1) -->
            <div class="slider-column">
                <div class="item-card">
                    <div class="discount-pill">-24%</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/fff/333?text=iPad+2017" alt="iPad 2017"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">iPad 2017 (5th Gen) 9.7inch Wi-Fi 4G With FaceTime</h3>
                    <div class="item-price-row"><span class="item-price">AED 419</span><span class="item-old-price">AED 550</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
                <div class="item-card">
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/fff/333?text=iPad+Air+2" alt="iPad Air 2"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">iPad Air 2 9.7 inch Wi-Fi 4G With FaceTime</h3>
                    <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 299</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
            </div>

            <!-- Column 8 (Image 1) -->
            <div class="slider-column">
                <div class="item-card">
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/1e1e1e/fff?text=iPad+Pro+2025" alt="iPad Pro 2025"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">iPad Pro – 2025(6th Generation) M5 11-inch, 256GB, WiFi, Space Black with Standard Glass –</h3>
                    <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 4,049</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
                <div class="item-card">
                    <div class="discount-pill">-57%</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/fff/333?text=iPad+9th+Gen" alt="iPad 9th Gen"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">iPad (9th Generation) 10.2-Inch, With FaceTime – International Version</h3>
                    <div class="item-price-row"><span class="item-price">AED 799</span><span class="item-old-price">AED 1,855</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
            </div>

            <!-- Column 9 (Image 1) -->
            <div class="slider-column">
                <div class="item-card">
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/e0e0e0/333?text=iPad+Air+2025" alt="iPad Air 2025"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">iPad Air 2025 (7th Generation) M3 Chip</h3>
                    <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 2,399</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
                <div class="item-card">
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/4a4a4a/fff?text=iPad+7th+Gen" alt="iPad 7th Gen"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">iPad 7th Gen 10.2-Inch Wi-Fi With FaceTime 2019 With Face Time</h3>
                    <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 649</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
            </div>

            <!-- Column 10 (Image 1) -->
            <div class="slider-column">
                <div class="item-card">
                    <div class="discount-pill" style="background: var(--text-navy);">Sold out</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/fff/333?text=iPad+Pro+9.7" alt="iPad Pro 9.7"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">iPad Pro 9.7” – A9X Chip, 2GB RAM, 32GB/128GB Storage, 12MP Camera, Retina Display</h3>
                    <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 399</span></div>
                    <button class="btn-add-cart" disabled style="background: #f5f5f5; color: #999; border-color: #ddd;">Sold Out</button>
                </div>
                <div class="item-card">
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/fff/333?text=iPad+6th+Gen" alt="iPad 6th Gen"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">iPad 6 th gen 9.7-Inch Wi-Fi – International Version</h3>
                    <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 449</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
            </div>
        `,
        'most-viewed': `
            <!-- Column 1 (Image 0) -->
            <div class="slider-column">
                <div class="item-card">
                    <div class="discount-pill">-19%</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/1e1e1e/fff?text=ThinkPad+X1+Carbon" alt="ThinkPad X1 Carbon"></div>
                    <div class="item-brand">Lenovo</div>
                    <h3 class="item-title">ThinkPad X1 Carbon Laptop With 14-Inch Display,Core i7/16GB RAM/512GB SSD/Windows 10 Pro/Intel HD Graphics Black</h3>
                    <div class="item-price-row"><span class="item-price">AED 1,099</span><span class="item-old-price">AED 1,350</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
                <div class="item-card">
                    <div class="discount-pill">-7%</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/e0e0e0/333?text=HP+EliteBook+1030+G4" alt="HP EliteBook 1030 G4"></div>
                    <div class="item-brand">HP</div>
                    <h3 class="item-title">HP Elite Book 1030 G4 | i7 8th Generation | 16GB Ram 512GB SSD</h3>
                    <div class="item-price-row"><span class="item-price">AED 1,399</span><span class="item-old-price">AED 1,500</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
            </div>

            <!-- Column 2 (Image 0) -->
            <div class="slider-column">
                <div class="item-card">
                    <div class="discount-pill">-15%</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/fff/333?text=HP+ZBook+Firefly+G8" alt="HP ZBook Firefly G8"></div>
                    <div class="item-brand">HP</div>
                    <h3 class="item-title">HP ZBook Firefly G8 | Intel Core i7-1185G7 16GB RAM 512GB SSD | Windows 10 Pro – Touch Bar</h3>
                    <div class="item-price-row"><span class="item-price">AED 1,699</span><span class="item-old-price">AED 1,999</span></div>
                    <button class="btn-add-cart" style="background: #000; color: #fff;">Add To Cart</button>
                </div>
                <div class="item-card">
                    <div class="discount-pill" style="background: var(--text-navy);">Sold out</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/silver/333?text=HP+840+G7+i7" alt="HP 840 G7 i7"></div>
                    <div class="item-brand">HP</div>
                    <h3 class="item-title">Hp 840 G7 i7 10TH Gen (16/512gb)</h3>
                    <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 1,399</span></div>
                    <button class="btn-add-cart" disabled style="background: #f5f5f5; color: #999; border-color: #ddd;">Sold Out</button>
                </div>
            </div>

            <!-- Column 3 (Image 0) -->
            <div class="slider-column">
                <div class="item-card">
                    <div class="discount-pill" style="background: var(--text-navy);">Sold out</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/4a4a4a/fff?text=Samsung+Tab+S10+Plus" alt="Samsung Tab S10 Plus"></div>
                    <div class="item-brand">iPoint</div>
                    <h3 class="item-title">Samsung Tab S10 Plus Moonstone 12GB 256GB WiFi +Cellular</h3>
                    <div class="item-price-row"><span class="item-price">AED 3,449</span></div>
                    <button class="btn-add-cart" disabled style="background: #f5f5f5; color: #999; border-color: #ddd;">Sold Out</button>
                </div>
                <div class="item-card">
                    <div class="discount-pill" style="background: var(--text-navy);">Sold out</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/silver/333?text=HP+840+G4+i5" alt="HP 840 G4 i5"></div>
                    <div class="item-brand">HP</div>
                    <h3 class="item-title">Hp 840 G4 i5 7th Gen (8/256gb)</h3>
                    <div class="item-price-row"><span class="item-price">AED 649</span><span class="item-old-price" style="text-decoration: line-through; color: #999; margin-left: 8px;">AED 700</span></div>
                    <button class="btn-add-cart" disabled style="background: #f5f5f5; color: #999; border-color: #ddd;">Sold Out</button>
                </div>
            </div>

            <!-- Column 4 (Image 0) -->
            <div class="slider-column">
                <div class="item-card">
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=MacBook+Pro+2019+A2141" alt="MacBook Pro 2019 A2141"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">Macbook Pro (2019) A2141 Touch Bar Laptop 16-Inch Display, Intel Core i9 Processor/8th Gen/32 RAM/512GB SSD/4GB Radeon Pro 5300M Graphics English</h3>
                    <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 2,999</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
                <div class="item-card">
                    <div class="discount-pill" style="background: var(--text-navy);">Sold out</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/silver/333?text=HP+650+G8+i5" alt="HP 650 G8 i5"></div>
                    <div class="item-brand">HP</div>
                    <h3 class="item-title">Hp 650 G8 i5 11 Gen (16/256gb)</h3>
                    <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 1,399</span></div>
                    <button class="btn-add-cart" disabled style="background: #f5f5f5; color: #999; border-color: #ddd;">Sold Out</button>
                </div>
            </div>

            <!-- Column 5 (Image 0) -->
            <div class="slider-column">
                <div class="item-card">
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/png?text=MacBook+Pro+A1708" alt="MacBook Pro A1708"></div>
                    <div class="item-brand">Apple</div>
                    <h3 class="item-title">Macbook Pro A1708 Laptop With 13.3-Inch Display,Intel Core i5 Processor 1.5GB Intel Graphics English</h3>
                    <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 1,599</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
                <div class="item-card">
                    <div class="discount-pill" style="background: var(--text-navy);">Sold out</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/silver/333?text=HP+1030+G4+i7" alt="HP 1030 G4 i7"></div>
                    <div class="item-brand">HP</div>
                    <h3 class="item-title">Hp 1030 G4 i7 8TH Gen (16/512gb)</h3>
                    <div class="item-price-row" style="margin-top: auto;"><span class="item-price">AED 1,299</span></div>
                    <button class="btn-add-cart" disabled style="background: #f5f5f5; color: #999; border-color: #ddd;">Sold Out</button>
                </div>
            </div>

            <!-- Column 6 (Image 1) -->
            <div class="slider-column">
                <div class="item-card">
                    <div class="discount-pill" style="background: var(--text-navy);">Sold out</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/1e1e1e/fff?text=ThinkPad+T470" alt="ThinkPad T470"></div>
                    <div class="item-brand">Lenovo</div>
                    <h3 class="item-title">ThinkPad T470 Laptop With Intel Core i5 Processor/6th Gen/8 gb RAM/256 GB SSD/Intel HD Graphics Black</h3>
                    <div class="item-price-row"><span class="item-price">AED 599</span><span class="item-old-price">AED 650</span></div>
                    <button class="btn-add-cart" disabled style="background: #f5f5f5; color: #999; border-color: #ddd;">Sold Out</button>
                </div>
                <div class="item-card">
                    <div class="discount-pill">-14%</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/silver/333?text=Dell+Latitude+i5" alt="Dell Latitude i5"></div>
                    <div class="item-brand">Dell</div>
                    <h3 class="item-title">Dell Latitude | Intel Core i5-10310U 10Th Gen Processor | 16Gb Ram, 256Gb Nvme SSD</h3>
                    <div class="item-price-row"><span class="item-price">AED 1,199</span><span class="item-old-price">AED 1,399</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
            </div>

            <!-- Column 7 (Image 1) -->
            <div class="slider-column">
                <div class="item-card">
                    <div class="discount-pill" style="background: var(--text-navy);">Sold out</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/silver/333?text=HP+Firefly+G8+i7" alt="HP Firefly G8 i7"></div>
                    <div class="item-brand">HP</div>
                    <h3 class="item-title">Hp FireFly G8 i7 11 Gen 16/512GB</h3>
                    <div class="item-price-row"><span class="item-price">AED 1,599</span><span class="item-old-price">AED 1,700</span></div>
                    <button class="btn-add-cart" disabled style="background: #f5f5f5; color: #999; border-color: #ddd;">Sold Out</button>
                </div>
                <div class="item-card">
                    <div class="discount-pill" style="background: var(--text-navy);">Sold out</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/1e1e1e/fff?text=Dell+Latitude+7400" alt="Dell Latitude 7400"></div>
                    <div class="item-brand">Dell</div>
                    <h3 class="item-title">DELL LATITUDE 7400 i7 (2 IN 1)</h3>
                    <div class="item-price-row"><span class="item-price">AED 1,099</span><span class="item-old-price">AED 1,300</span></div>
                    <button class="btn-add-cart" disabled style="background: #f5f5f5; color: #999; border-color: #ddd;">Sold Out</button>
                </div>
            </div>

            <!-- Column 8 (Image 1) -->
            <div class="slider-column">
                <div class="item-card">
                    <div class="discount-pill">-7%</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/silver/333?text=HP+EliteBook+840+G7" alt="HP EliteBook 840 G7"></div>
                    <div class="item-brand">HP</div>
                    <h3 class="item-title">HP EliteBook 840 G7 | Intel Core i7 10th Generation | 16GB RAM, 512GB SSD</h3>
                    <div class="item-price-row"><span class="item-price">AED 1,399</span><span class="item-old-price">AED 1,499</span></div>
                    <button class="btn-add-cart">Add To Cart</button>
                </div>
                <div class="item-card">
                    <div class="discount-pill" style="background: var(--text-navy);">Sold out</div>
                    <div class="item-actions">
                        <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                        <button class="action-btn"><i class="fa-solid fa-expand"></i></button>
                        <button class="action-btn"><i class="fa-regular fa-eye"></i></button>
                    </div>
                    <div class="item-img-box"><img src="https://placehold.co/300x300/1e1e1e/fff?text=Dell+Latitude+5400" alt="Dell Latitude 5400"></div>
                    <div class="item-brand">Dell</div>
                    <h3 class="item-title">DELL LATITUDE 5400 i5 8TH GEN (8/256GB)</h3>
                    <div class="item-price-row"><span class="item-price">AED 599</span><span class="item-old-price">AED 700</span></div>
                    <button class="btn-add-cart" disabled style="background: #f5f5f5; color: #999; border-color: #ddd;">Sold Out</button>
                </div>
            </div>
        `,
    };

    // Tab Logic
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const category = this.getAttribute('data-category');
            if (!bestSellerData[category]) return;

            // Update UI
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Animate and switch
            track.style.opacity = '0';
            track.style.transform = 'translateY(20px)';

            setTimeout(() => {
                track.innerHTML = bestSellerData[category];
                track.style.opacity = '1';
                track.style.transform = 'translateY(0)';
                slider.scrollLeft = 0; // Reset scroll position
            }, 300);
        });
    });

    // Arrow Navigation - Scroll by full visible width (Pages)
    nextBtn.addEventListener('click', () => {
        const moveDistance = slider.offsetWidth;
        slider.scrollBy({ left: moveDistance, behavior: 'smooth' });
    });

    prevBtn.addEventListener('click', () => {
        const moveDistance = slider.offsetWidth;
        slider.scrollBy({ left: -moveDistance, behavior: 'smooth' });
    });

    // Drag to Scroll Logic
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.classList.add('dragging');
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
        slider.style.scrollBehavior = 'auto';
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.classList.remove('dragging');
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.classList.remove('dragging');
        slider.style.scrollBehavior = 'smooth';
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2;
        slider.scrollLeft = scrollLeft - walk;
    });
}

// Scroll to Top Logic
function initScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    if (!scrollToTopBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

window.addEventListener('load', () => {
    initProductSliders();
    initTabSwitching();
    initBestSellerSlider();
    initScrollToTop();
});

// Expose for render.js — re-init interactive features after dynamic rendering
window.reinitSliders = function () {
    initProductSliders();
    initBestSellerSlider();
};
window.reinitBestSellerSlider = function () {
    initBestSellerSlider();
};
