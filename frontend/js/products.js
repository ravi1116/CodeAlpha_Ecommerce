const API_BASE_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', function() {
    loadAllProducts();
    setupEventListeners();
    updateCartCount();
});

async function loadAllProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) {
            throw new Error('Failed to load products');
        }
        
        const products = await response.json();
        displayProducts(products);
        
        localStorage.setItem('products', JSON.stringify(products));
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Failed to load products. Please try again.', 'error');
    }
}

function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    
    searchInput.addEventListener('input', filterProducts);
    categoryFilter.addEventListener('change', filterProducts);
}

function filterProducts() {
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    
    const allProducts = JSON.parse(localStorage.getItem('products')) || [];
    
    const filteredProducts = allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    
    displayProducts(filteredProducts);
}

function displayProducts(products) {
    const productsContainer = document.getElementById('products-container');
    productsContainer.innerHTML = '';
    
    if (products.length === 0) {
        productsContainer.innerHTML = `
            <div class="no-products-message">
                <p>No products found matching your criteria.</p>
                <button class="btn btn-primary" id="reset-filters">Reset Filters</button>
            </div>
        `;
        
        document.getElementById('reset-filters').addEventListener('click', function() {
            document.getElementById('search-input').value = '';
            document.getElementById('category-filter').value = 'all';
            filterProducts();
        });
        return;
    }
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        productsContainer.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <div class="product-rating">
                ${'★'.repeat(product.rating)}${'☆'.repeat(5 - product.rating)}
            </div>
            <button class="add-to-cart" data-id="${product._id}">
                ${product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
            ${product.stock <= 0 ? '<p class="stock-message">Available soon</p>' : ''}
        </div>
    `;
    
    const addToCartBtn = card.querySelector('.add-to-cart');
    if (product.stock > 0) {
        addToCartBtn.addEventListener('click', function() {
            addToCart(product);
        });
    } else {
        addToCartBtn.disabled = true;
    }
    
    return card;
}

async function addToCart(product) {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        showNotification('Please login to add items to cart', 'error');
        setTimeout(() => {
            window.location.href = `login.html?redirect=products.html&product=${product._id}`;
        }, 1500);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/cart`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                productId: product._id,
                quantity: 1
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add to cart');
        }

        const updatedCart = await response.json();
        updateCartCount();
        showNotification(`${product.name} added to cart`);
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification(error.message || 'Failed to add to cart. Please try again.', 'error');
    }
}

async function updateCartCount() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        document.querySelector('.cart-count').textContent = '0';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/cart`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const cart = await response.json();
            const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
            document.querySelector('.cart-count').textContent = totalItems;
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}