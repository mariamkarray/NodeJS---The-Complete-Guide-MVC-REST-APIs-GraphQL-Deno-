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
    const product = new Product(null, title, imageUrl, description, price)
    product
    .save()
    .then(() => {
        res.redirect('/');
    })
    .catch(err => console.log(err))
} 


exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) return res.redirect('/');
    
    // from the name passed in the router (:productId) 
    // we can extract the product ID from the url
    const prodId = req.params.productId;
    // after recieving the product, callback product is executed
    Product.findById(prodId, product => {
        if (!product) {
            return res.redirect('/');}
    res.render('admin/edit-product', {
        pageTitle: 'Add Product', 
        path: '/admin/edit-product',
        editing:  editMode,
        product: product 
    });  
});
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
    // ensures that in the product model, we find a valid ID, then goes to the updating mode and not the add mode
    const updatedProduct = new Product(prodId, updatedTitle, updatedImageUrl, updatedDescription, updatedPrice);
    updatedProduct.save();
    res.redirect('/admin/products')
};

exports.getProducts = (req, res, next) => {
    Product.fetchAll()
    .then(([rows, fieldData]) => {
        res.render('admin/products', {
            prods: rows,
            pageTitle: 'Admin Products',
            path: '/admin/products'
        });
    });
   
}

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.deleteById(prodId);
    res.redirect('/admin/products')
}
