// Basic interactivity for the Electro shop replica
document.addEventListener('DOMContentLoaded', () => {
    console.log('Electro replica initialized');

    // Simple dot switcher simulation
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            dots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            console.log(`Slider switched to slide ${index + 1}`);
        });
    });

    // Search button log
    const searchBtn = document.querySelector('.search-bar button');
    searchBtn.addEventListener('click', () => {
        const query = document.querySelector('.search-bar input').value;
        if (query) alert(`Searching for: ${query}`);
    });
});

/**
 * Changes the main image of the featured product card
 * @param {string} src - The image source path
 * @param {HTMLElement} element - The clicked thumbnail element
 */
function changeFeaturedImage(src, element) {
    const mainImg = document.getElementById('mainFeaturedImg');
    if (mainImg) {
        mainImg.src = src;
    }

    // Update active thumbnail
    const thumbs = document.querySelectorAll('.thumb-item');
    thumbs.forEach(t => t.classList.remove('active'));
    element.classList.add('active');
}
