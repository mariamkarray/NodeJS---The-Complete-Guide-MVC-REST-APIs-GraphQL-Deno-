const path = require('path')
const express = require('express')

const shopController = require('../controllers/shop')
const isAuth = require('../middleware/is-auth')
const router = express.Router();

// executes for every url that starts with '/'
router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts)

router.get('/checkout', isAuth, shopController.getCheckout);

// // extracting dynamic variable using the colon
router.get('/products/:productId', shopController.getProduct)

router.get('/cart', isAuth, shopController.getCart)

router.post('/cart', isAuth, shopController.postCart);

router.post('/cart-delete-item',  isAuth, shopController.postCartDeleteProduct);

 router.get('/orders', isAuth,  shopController.getOrders)

router.get('/orders/:orderId', isAuth, shopController.getInvoice);

router.get('/checkout/success', shopController.postOrder)

router.get('/checkout/cancel',  shopController.getCheckout)

module.exports = router;

