const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');

router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);
router.post('/', auth, admin, productController.createProduct);
router.put('/:id', auth, admin, productController.updateProduct);
router.delete('/:id', auth, admin, productController.deleteProduct);

module.exports = router;