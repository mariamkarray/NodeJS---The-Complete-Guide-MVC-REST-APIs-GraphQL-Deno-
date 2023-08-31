const express = require('express');
const path = require('path')
const isAuth = require('../middleware/is-auth')
const adminController = require('../controllers/admin')


const router = express.Router();

// gets executed first, so if the user's not authenticated, he's redirected and next() is not called
// and therefore the next middleware (controller function wouldnt be called) 
router.use(isAuth);


// add new middleware function

// // next is a function that will be passed to use() allows the request to move to the middleware
router.get('/add-product', adminController.getAddProducts); // pass a reference to this function (store it somewhere until needed)

 router.get('/products', adminController.getProducts)

router.post('/add-product', adminController.postAddProduct);

router.get('/edit-product/:productId', adminController.getEditProduct)

router.post('/edit-product', adminController.postEditProduct);

router.post('/delete-product', adminController.postDeleteProduct);

module.exports = router;