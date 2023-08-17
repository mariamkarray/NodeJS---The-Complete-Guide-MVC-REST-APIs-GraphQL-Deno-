// access to the pool
const db = require('../util/database');

const Cart = require('./cart')


module.exports = class Product {
    constructor(id, title, imageUrl, description, price) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }
    save() {
            return db.execute('INSERT INTO products (title, price, description, imageUrl) VALUES (?, ?, ?, ?)',
            [this.title, this.price, this.description, this.imageUrl]);
        }

    static deleteById(id) {
       
    }

    // not called on a single instance 
    // static makes sure that i can call this method directly on the class and not on the instantiated object
    static fetchAll(cb) {
        // return the promise 
       return db.execute('SELECT * FROM products');
    }

    static findById(id) {
        return db.execute('SELECT * FROM products WHERE products.id = ?', [id]); 
    }

};