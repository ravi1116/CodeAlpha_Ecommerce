const API_BASE_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', function() {
        navLinks.classList.toggle('active');
    });
    
    loadFeaturedProducts();
    
    updateCartCount();
    
    checkAuthStatus();
});

async function loadFeaturedProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products?featured=true`);
        const products = await response.json();
        
        const featuredContainer = document.getElementById('featured-products');
        featuredContainer.innerHTML = '';
        
        products.forEach(product => {
            const productCard = createProductCard(product);
            featuredContainer.appendChild(productCard);
        });
    } catch (error) {
        console.error('Error loading featured products:', error);
    }
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <div class="product-rating">
                ${'★'.repeat(product.rating)}${'☆'.repeat(5 - product.rating)}
            </div>
            <button class="add-to-cart" data-id="${product._id}">Add to Cart</button>
        </div>
    `;
    
    const addToCartBtn = card.querySelector('.add-to-cart');
    addToCartBtn.addEventListener('click', function() {
        addToCart(product);
    });
    
    return card;
}

async function addToCart(product) {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        showNotification('Please login to add items to cart', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
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
        
        if (response.ok) {
            updateCartCount();
            showNotification(`${product.name} added to cart`);
        } else {
            const error = await response.json();
            showNotification(error.message || 'Failed to add to cart', 'error');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Failed to add to cart. Please try again.', 'error');
    }
}

async function updateCartCount() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = '0';
        });
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
            
            document.querySelectorAll('.cart-count').forEach(el => {
                el.textContent = totalItems;
            });
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const authButtons = document.querySelector('.auth-buttons');
    
    if (token && authButtons) {
        authButtons.innerHTML = `
            <a href="#" class="btn" id="logout-btn">Logout</a>
        `;
        
        document.getElementById('logout-btn').addEventListener('click', function() {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            window.location.href = 'index.html';
        });
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