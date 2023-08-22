const Sequelize = require("sequelize")

const sequelize = require('../util/database');

const CartItem = sequelize.define('cartItem', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    // each cart item is a combination of a product,id of the cart, and the quantity 
    quantity: Sequelize.INTEGER
})

module.exports = CartItem;