const path = require('path')
const express = require('express')

const shopController = require('../controllers/shop')

const router = express.Router();

// executes for every url that starts with '/'
router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts)


// extracting dynamic variable using the colon
router.get('/products/:productId', shopController.getProduct)

router.get('/cart', shopController.getCart)

router.post('/cart', shopController.postCart);

router.post('/cart-delete-item', shopController.postCartDeleteProduct);

router.get('/orders', shopController.getOrders)

router.get('/checkout', shopController.getCheckout)

module.exports = router;

