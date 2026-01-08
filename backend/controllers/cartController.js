const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    await req.user.populate({
      path: 'cart.product',
      select: 'name price image'
    }).execPopulate();
    res.json(req.user.cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existingItem = req.user.cart.find(item => item.product.toString() === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      req.user.cart.push({ product: productId, quantity: quantity || 1 });
    }

    await req.user.save();
    await req.user.populate({
      path: 'cart.product',
      select: 'name price image'
    }).execPopulate();

    res.json(req.user.cart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Update cart item quantity
// @route   PATCH /api/cart/:productId
// @access  Private
exports.updateCartItem = async (req, res) => {
  try {
    const { action } = req.body;
    const productId = req.params.productId;

    const cartItem = req.user.cart.find(item => item.product.toString() === productId);
    if (!cartItem) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    if (action === 'increase') {
      cartItem.quantity += 1;
    } else if (action === 'decrease') {
      if (cartItem.quantity > 1) {
        cartItem.quantity -= 1;
      } else {
        req.user.cart = req.user.cart.filter(item => item.product.toString() !== productId);
      }
    }

    await req.user.save();
    await req.user.populate({
      path: 'cart.product',
      select: 'name price image'
    }).execPopulate();

    res.json(req.user.cart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    req.user.cart = req.user.cart.filter(item => item.product.toString() !== req.params.productId);
    await req.user.save();
    res.json(req.user.cart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    req.user.cart = [];
    await req.user.save();
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};