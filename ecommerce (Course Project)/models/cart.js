const fs = require('fs')
const path = require('path')
const p = path.join(path.dirname(require.main.filename), 
    'data',
    'cart.json'
); 

module.exports = class Cart {
    static addProduct(id, productPrice) {
        // fetch previous cart
        // we have a callback (we're either getting an error or the file content)
        fs.readFile(p, (err, fileContent) => {
            let cart = {products: [], totalPrice: 0};
            if (!err) {
                // err means we dont have a cart yet so we create it
                cart = JSON.parse(fileContent)
            }
            
        // find exisitng product
        const existingProductIndex = cart.products.findIndex(prod => prod.id === id);
        const existingProduct = cart.products[existingProductIndex];
        let updatedProduct;
        // add new product or increase the quantity
        if (existingProduct) {
            // take all the properties of the existing product 
            updatedProduct = {...existingProduct};
            updatedProduct.qty = updatedProduct.qty + 1;
            cart.products = [...cart.products];
            cart.products[existingProductIndex] = updatedProduct;
        } 
        else {
        updatedProduct = {id: id, qty: 1};
        cart.products = [...cart.products, updatedProduct];
        }
        // add plus to convert string to number
        cart.totalPrice = cart.totalPrice + +productPrice;
        fs.writeFile(p, JSON.stringify(cart), err => {
            console.log(err);
        });
    });
} 
    static deleteProduct(id, productPrice) {
        fs.readFile(p, (err, fileContent) => {
            if (err) {
                return; 
            }
            const updatedCart = {...JSON.parse(fileContent)};
            const product = updatedCart.products.findIndex(prod => prod.id === id);
            if (!product) {
                return;
            }
            const prodictQty = product.qty;
            updatedCart.products = updatedCart.products.filter(prod => prod.id !== id );
            updatedCart.totalPrice = updatedCart.totalPrice - productPrice * prodictQty;

            fs.writeFile(p, JSON.stringify(updatedCart), err => {
                console.log(err);
            });

        })
    }
    static getCart(cb) {
        fs.readFile(p, (err, fileContent) => {
            const cart = JSON.parse(fileContent);
            if (err) 
                cb(null)
            else 
                cb(cart);
        })
    }
}