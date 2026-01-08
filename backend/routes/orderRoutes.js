const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');

router.post('/', auth, orderController.createOrder);
router.get('/myorders', auth, orderController.getMyOrders);
router.get('/:id', auth, orderController.getOrder);
router.put('/:id/pay', auth, orderController.updateOrderToPaid);
router.get('/', auth, admin, orderController.getOrders);
router.put('/:id/deliver', auth, admin, orderController.updateOrderToDelivered);

module.exports = router;