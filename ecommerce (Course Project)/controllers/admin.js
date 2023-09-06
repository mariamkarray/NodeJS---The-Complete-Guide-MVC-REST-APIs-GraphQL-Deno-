const Product = require('../models/product');
const mongodb = require('mongodb');
const { validationResult } = require('express-validator')

exports.getAddProducts = (req, res, next) => {
    console.log("Here from get");
    if (!req.session.isLoggedIn)
        return res.redirect('/login')

    res.render('admin/edit-product', {
    pageTitle: 'Add Product', 
    path: '/admin/add-product',
    hasError: false,
    editing: false,
    errorMessage: [],
    validationErrors: []
})
}

exports.postAddProduct = (req, res, next) => { 
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       return  res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/edit-product',
            editing: false,
            hasError: true,
            product: {
                title,
                imageUrl,
                price, 
                description
            },
            errorMessage: errors.array()[0].msg,
            validationErrors:  errors.array()
        });
    }
   const product = new Product({title: title, 
    price: price, 
    description: description, 
    imageUrl: imageUrl,
    userId: req.session.user
});
   product.save() // save() is in mongoose
    .then(
        result => {
            console.log('Created Product');
            res.redirect('/admin/products')
        }
    )
    .catch(err => console.log(err))
};


exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) return res.redirect('/');
    
    // from the name passed in the router (:productId) 
    // we can extract the product ID from the url
    const prodId = req.params.productId;

   Product.findById(prodId)

    // after recieving the product, callback product is executed
   // Product.findByPk(prodId)
    .then(product => {
        if (!product) {
            return res.redirect('/');
        }
        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing:editMode,
            product: product,
            hasError: false, 
            errorMessage: [],
            validationErrors: []
        });
    })
    .catch(err => console.log(err))
}

exports.postEditProduct = (req, res, next) => {
    
    // construct a new product and replace th eexisting one
    const prodId = req.body.productId;
    // this is the edit route
    // so i can get the new values i want to store as a part of the post request
    // because the user enters them in the form (post req body is sent to me)
    const { title, imageUrl, price, description } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
       return  res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            hasError: true,
            product: {
                title,
                imageUrl,
                price, 
                description,
                _id: prodId
            },
            errorMessage: errors.array()[0].msg,
            validationErrors:  errors.array()
        });
    }
    Product.findByIdAndUpdate(prodId, {
        title,
        imageUrl,
        price,
        description,
    })
    // handle success responses from .save() promise
    .then(result => {
        res.redirect('/admin/products')
    })
    // this catch block would catch errors from findByPk() promise and the .save() promise
   .catch(err => console.log(err))
};

 exports.getProducts = (req, res, next) => {
    Product.find({userId: req.user._id})
    .then(products => {
        res.render('admin/products', {
            prods: products,
            pageTitle: 'Admin Products',
            path: '/admin/products'
        });
    })
    .catch(err => console.log(err));;
   
}

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.deleteOne({_id: prodId, userId: req.user._id})
    .then( () => {
        console.log('DELETED PRODUCT!')
        res.redirect('/admin/products')
    })
    .catch(err => console.log(err))
}
