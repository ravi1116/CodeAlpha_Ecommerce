const API_BASE_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', async function() {
    await loadCartItems();
    setupCartEventListeners();
    
    updateCartCount();
});

async function loadCartItems() {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            redirectToLogin();
            return;
        }

        const response = await fetch(`${API_BASE_URL}/users/${userId}/cart`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load cart');
        }

        const cart = await response.json();
        displayCartItems(cart);
        updateCartSummary(cart);
    } catch (error) {
        console.error('Error loading cart:', error);
        showNotification('Failed to load cart. Please try again.', 'error');
    }
}

function displayCartItems(cart) {
    const cartItemsContainer = document.getElementById('cart-items');
    
    if (!cart || cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart-message">
                <p>Your cart is empty</p>
                <a href="products.html" class="btn btn-primary">Continue Shopping</a>
            </div>
        `;
        return;
    }

    cartItemsContainer.innerHTML = '';
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.dataset.id = item.productId._id;
        
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.productId.image}" alt="${item.productId.name}">
            </div>
            <div class="cart-item-details">
                <h3 class="cart-item-title">${item.productId.name}</h3>
                <p class="cart-item-price">$${(item.productId.price * item.quantity).toFixed(2)}</p>
                <div class="cart-item-quantity">
                    <button class="quantity-btn decrease">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn increase">+</button>
                </div>
                <p class="cart-item-remove">Remove</p>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItem);
    });
}

function setupCartEventListeners() {
    const cartItemsContainer = document.getElementById('cart-items');
    
    cartItemsContainer.addEventListener('click', async function(e) {
        const itemElement = e.target.closest('.cart-item');
        if (!itemElement) return;
        
        const itemId = itemElement.dataset.id;
        
        if (e.target.classList.contains('quantity-btn')) {
            const isIncrease = e.target.classList.contains('increase');
            await updateCartItemQuantity(itemId, isIncrease);
        }
        
        if (e.target.classList.contains('cart-item-remove')) {
            await removeCartItem(itemId);
        }
    });

    document.getElementById('checkout-btn').addEventListener('click', function() {
        window.location.href = 'checkout.html';
    });
}

async function updateCartItemQuantity(itemId, isIncrease) {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            redirectToLogin();
            return;
        }

        const response = await fetch(`${API_BASE_URL}/users/${userId}/cart/${itemId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                action: isIncrease ? 'increase' : 'decrease'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update quantity');
        }

        const updatedCart = await response.json();
        displayCartItems(updatedCart);
        updateCartSummary(updatedCart);
        updateCartCount();
    } catch (error) {
        console.error('Error updating quantity:', error);
        showNotification('Failed to update quantity. Please try again.', 'error');
    }
}

async function removeCartItem(itemId) {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            redirectToLogin();
            return;
        }

        const response = await fetch(`${API_BASE_URL}/users/${userId}/cart/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to remove item');
        }

        const updatedCart = await response.json();
        displayCartItems(updatedCart);
        updateCartSummary(updatedCart);
        updateCartCount();
        showNotification('Item removed from cart');
    } catch (error) {
        console.error('Error removing item:', error);
        showNotification('Failed to remove item. Please try again.', 'error');
    }
}

function updateCartSummary(cart) {
    if (!cart || cart.length === 0) {
        document.getElementById('subtotal').textContent = '$0.00';
        document.getElementById('tax').textContent = '$0.00';
        document.getElementById('total').textContent = '$5.99';
        document.getElementById('checkout-btn').disabled = true;
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.productId.price * item.quantity), 0);
    const shipping = 5.99;
    const tax = subtotal * 0.1; // 
    
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${(subtotal + shipping + tax).toFixed(2)}`;
    document.getElementById('checkout-btn').disabled = false;
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

function redirectToLogin() {
    showNotification('Please login to access your cart', 'error');
    setTimeout(() => {
        window.location.href = 'login.html?redirect=cart.html';
    }, 1500);
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