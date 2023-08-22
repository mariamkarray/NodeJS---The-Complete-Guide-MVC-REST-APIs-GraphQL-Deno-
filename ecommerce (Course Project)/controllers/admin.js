const Product = require('../models/product');

exports.getAddProducts = (req, res, next) => {
    res.render('admin/edit-product', {
    pageTitle: 'Add Product', 
    path: '/admin/add-product',
    editing: false    
})
}

exports.postAddProduct = (req, res) => { 
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    // from sequalize, if you set up associations, there'll be special methods
    // create new associated object (product)
    req.user.createProduct({
        title: title,
        price: price,
        imageUrl: imageUrl,
        description: description
    })
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

    req.user.getProducts({where: { id: prodId }})

    // after recieving the product, callback product is executed
   // Product.findByPk(prodId)
    .then(products => {
        const product = products[0]
        if (!product) {
            return res.redirect('/');
        }
        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing:editMode,
            product: product
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
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDescription = req.body.description;
   Product.findByPk(prodId)
   .then(
    product => {
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedDescription;
        product.imageUrl = updatedImageUrl;
        // return the promise we have from .save()
        return product.save();
    })
    // handle success responses from .save() promise
    .then(result => {
        console.log('UPDATED PRODUCT!')
        res.redirect('/admin/products')
    })
    // this catch block would catch errors from findByPk() promise and the .save() promise
   .catch(err => console.log(err))
};

exports.getProducts = (req, res, next) => {
    req.user
    .getProducts()
    Product.findAll()
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
    Product.findByPk(prodId)
    .then(product => {
        return product.destroy();
    })
    // will execute once the promise is returned from destroy()
    .then(result => {
        console.log('DELETED PRODUCT!')
    })
    .catch(err => console.log(err))
    res.redirect('/admin/products')
}
