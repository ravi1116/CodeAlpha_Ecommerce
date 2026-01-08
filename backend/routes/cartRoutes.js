const express = require('express');
const router = express.Router();
const cartController =require('../controllers/cartcontroller')
const auth = require('../middlewares/auth');

router.get('/', auth, cartController.getCart);
router.post('/', auth, cartController.addToCart);
router.patch('/:productId', auth, cartController.updateCartItem);
router.delete('/:productId', auth, cartController.removeFromCart);
router.delete('/', auth, cartController.clearCart);

module.exports = router;