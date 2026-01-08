document.addEventListener('DOMContentLoaded', function() {
    loadCartItems();
    setupPaymentMethodToggle();
    setupFormValidation();
});

function loadCartItems() {
    // In a real app, this would come from the backend
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const orderItemsContainer = document.getElementById('order-items');
    const subtotalElement = document.getElementById('order-subtotal');
    const shippingElement = document.getElementById('order-shipping');
    const taxElement = document.getElementById('order-tax');
    const totalElement = document.getElementById('order-total');
    
    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }
    
    orderItemsContainer.innerHTML = '';
    
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'order-item';
        itemElement.innerHTML = `
            <div class="order-item-name">${item.name} × ${item.quantity}</div>
            <div class="order-item-price">$${itemTotal.toFixed(2)}</div>
        `;
        orderItemsContainer.appendChild(itemElement);
    });
    
    const shipping = 5.99;
    const tax = subtotal * 0.1;  
    const total = subtotal + shipping + tax;
    
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    shippingElement.textContent = `$${shipping.toFixed(2)}`;
    taxElement.textContent = `$${tax.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;
}

function setupPaymentMethodToggle() {
    const paymentMethods = document.querySelectorAll('input[name="payment"]');
    const creditCardForm = document.getElementById('credit-card-form');
    
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            if (this.value === 'credit') {
                creditCardForm.style.display = 'block';
            } else {
                creditCardForm.style.display = 'none';
            }
        });
    });
}

function setupFormValidation() {
    const form = document.getElementById('payment-form');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            placeOrder();
        }
    });
}

function validateForm() {
    const fullName = document.getElementById('full-name').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const zip = document.getElementById('zip').value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    if (!fullName || !address || !city || !state || !zip) {
        showNotification('Please fill in all shipping information', 'error');
        return false;
    }
    
    if (paymentMethod === 'credit') {
        const cardNumber = document.getElementById('card-number').value;
        const expiry = document.getElementById('expiry').value;
        const cvv = document.getElementById('cvv').value;
        const cardName = document.getElementById('card-name').value;
        
        if (!cardNumber || !expiry || !cvv || !cardName) {
            showNotification('Please fill in all credit card information', 'error');
            return false;
        }
        
        if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
            showNotification('Please enter a valid card number', 'error');
            return false;
        }
        
        if (!/^\d{2}\/\d{2}$/.test(expiry)) {
            showNotification('Please enter a valid expiry date (MM/YY)', 'error');
            return false;
        }
        
        if (!/^\d{3,4}$/.test(cvv)) {
            showNotification('Please enter a valid CVV', 'error');
            return false;
        }
    }
    
    return true;
}

async function placeOrder() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        showNotification('Please login to place an order', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const orderItems = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity
    }));
    
    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                userId,
                items: orderItems
            })
        });
        
        if (response.ok) {
            const order = await response.json();
            showNotification('Order placed successfully!');
            
            localStorage.removeItem('cart');
            updateCartCount();
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            const error = await response.json();
            showNotification(error.message || 'Failed to place order', 'error');
        }
    } catch (error) {
        console.error('Order error:', error);
        showNotification('Failed to place order. Please try again.', 'error');
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