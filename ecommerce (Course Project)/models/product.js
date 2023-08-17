const fs = require('fs');
const path = require('path')
const Cart = require('./cart')

const p = path.join(path.dirname(require.main.filename), 
    'data',
    'products.json'
    ); 

const getProductFromFile = (cb) => {
        fs.readFile(p, (err, fileContent) => {
            if (err) 
                return cb([]);
           cb(JSON.parse(fileContent));
        });
};

module.exports = class Product {
    constructor(id, title, imageUrl, description, price) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }
    save() {
        console.log(this);
        // storing my files in a data folder, with a json file named products
        getProductFromFile(products => {
            // if it exists, save shouldn't create a new id/product, just update
            if (this.id) {
                // go through all the products
                const exisitngProductIndex = products.findIndex(prod => prod.id === this.id);
                const updatedProducts = [...products];
                updatedProducts[exisitngProductIndex] = this;
                fs.writeFile(p, JSON.stringify(updatedProducts), (err) =>{
                    console.log(err);
                });        
            }
            else {
                this.id = Math.random().toString();
                products.push(this);
                // convert into JSON
                fs.writeFile(p, JSON.stringify(products), (err) =>{
                    console.log(err);
                });   
            }
        });

        // push the object in the array
        // products.push(this);
    }

    static deleteById(id) {
        getProductFromFile(products => {
            const product = products.find(prod => prod.id === id)
            // I want to keep all elements where the ID of the element is not equal to the ID I'm trying to delete
            const updatedProducts = products.filter(prod => prod.id !== id); 
            // save the new array in the file
            fs.writeFile(p, JSON.stringify(updatedProducts), err => {
                if (!err) {
                    Cart.deleteProduct(id, product.price);
                }
            });
        });
    }

    // not called on a single instance 
    // static makes sure that i can call this method direclty on the class and not on the instantiated object
    static fetchAll(cb) {
        getProductFromFile(cb);
    }

    // load a single product
    // the cb (callback) will be executed after finding the product
    static findById(id, cb) {
        getProductFromFile(products => {
            // executing a function passed to find() on every element
            // return the array element of which the function returns true
            const product = products.find(p => p.id === id);
            cb(product);
        });
    }
};