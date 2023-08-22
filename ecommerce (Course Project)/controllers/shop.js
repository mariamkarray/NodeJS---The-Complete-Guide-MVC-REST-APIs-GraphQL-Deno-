const Product = require('../models/product');
const Cart = require('../models/cart');
const Order = require('../models/order')

exports.getIndex = (req, res, next) => {
    Product.findAll()
    .then(products => {
        res.render('shop/index', {
            prods: products,
            pageTitle: 'Shop',
            path: '/'
         });
    })
    .catch(err => console.log(err));
}

exports.getProducts = (req, res, next) => {
    Product.findAll()
    .then(products => {
        res.render('shop/product-list', {
            prods: products,
            pageTitle: 'Shop',
            path: '/'
         });
    })
    .catch(err => console.log(err));
};

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId
    Product.findByPk(prodId)
    .then(
        (product) => {
                res.render('shop/product-detail', {
                 product: product,
                 pageTitle: product.title,
                 path: '/products/:productId'
         
             })
        }
    )
    .catch(err => console.log(err))
}


exports.getCart = (req, res, next) => {
    req.user.getCart()
    .then(cart => {
        // sequelize will look in cartItems
        return cart
        .getProducts()
        .then(products => {
            res.render('shop/cart', {
                            path: '/cart',
                            pageTitle: 'Your Cart',
                            products: products
                    })
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err))
    
}

exports.postCart = (req, res, next) => {
    const  prodId = req.body.productId
    let fetchedCart;
    let newQuantiy = 1;
    req.user.getCart()
    .then(cart => {
        fetchedCart = cart;
        // retrieve a single product
        return cart.getProducts({ where: {id: prodId} })
    })
    .then(products => {
        let product;
        if (products.length > 0)
             product = products[0]
        if (product) {
            // get old quantity and change it
            const oldQuantity = product.cartItem.quantity;
            newQuantiy = oldQuantity + 1;
            return product; // send to other then
        }
        return Product.findByPk(prodId)
        
    })
    .then(product => {
        return fetchedCart.addProduct(product, {
            through: { quantity: newQuantiy }
        })
    })
    .then(() => { 
    res.redirect('/cart')
    })
    .catch(err => console.log(err))
};



exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user.getCart()
    .then(cart => {
        return cart.getProducts({ where: {id: prodId}})
    })
    .then(products => {
        const product = products[0];
        return product.cartItem.destroy();
    })
    .then(result => {
        res.redirect('/cart');
    })
    .catch(err => console.log(err))
}


exports.postOrder = (req, res, next) => {
    let fetchedCart;
    // each user has a specific cart
    req.user.getCart()
    .then(cart => {
        fetchedCart = cart
        return cart.getProducts();
    })
    .then(products => {
        // moving products from cart to order
        return req.user.createOrder()
        .then(order => {
            order.addProducts(products.map(product => {
                 product.orderItem = { quantity: product.cartItem.quantity };
                 return product
            }));
        })
        .catch(err => console.log(err));
    })
    .then(result => {
        return fetchedCart.setProducts(null);
    })
    .then(result => {
        res.redirect('/orders')
    })
    .catch(err => console.log(err));
}

exports.getOrders = (req, res, next) => {
    req.user.getOrders({include: ['products']})
    .then(orders => {
        res.render('shop/orders', {
            pageTitle: 'My Orders',
            path: '/orders',
            orders: orders
         });
    })
    .catch(err => console.log(err));
}

