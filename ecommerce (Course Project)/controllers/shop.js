const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');


exports.getIndex = (req, res, next) => {
    Product.find()
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
    Product.find()
    .then(products => {
        res.render('shop/product-list', {
            prods: products,
            pageTitle: 'Shop',
            path: '/products'  
         });
    })
    .catch(err => console.log(err));
};

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId
    Product.findById(prodId)
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
    req.user = new User().init(req.user);
    req.user // mongoose will extract the ID
    .populate('cart.items.productId')
    .then((user) => {
          const cartItems = user.cart.items; // Array of cart items
          res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products: cartItems,
            isAuthenticated: req.session.isLoggedIn  
            })
        });
}

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId
    Product.findById(prodId)
    .then(product => {
        return req.user.addToCart(product);
    })
    .then(result => {
        res.redirect('/cart')
    })
};



exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId; 
    req.user .removeFromCart(prodId)
    .then(result => {
        console.log("result ", result);
        res.redirect('/cart');
    })
    .catch(err => console.log(err))
}


exports.postOrder = (req, res, next) => {
    req.user // mongoose will extract the ID
    .populate('cart.items.productId')
    .then(user => {
        // get the items in the user's cart
        const products = user.cart.items.map(i => {
            return {quantity: i.quantity, product:{ ...i.productId._doc }}
        })
        const order = new Order({
            user: {
                email: req.user.email,
                userId: req.user
            },
            products: products
        });
        return order.save();
    }).then(result => {
        return req.user.clearCart();
    })
    .then(() => {
    res.redirect('/orders') }
    )
    .catch(err => console.log(err));
}

exports.getOrders = (req, res, next) => {
    Order.find({"user.userId": req.user._id})
    .then(orders => {
        res.render('shop/orders', {
            pageTitle: 'My Orders',
            path: '/orders',
            orders: orders,
            isAuthenticated: req.session.isLoggedIn  
         });
    })
    .catch(err => console.log(err));
}

