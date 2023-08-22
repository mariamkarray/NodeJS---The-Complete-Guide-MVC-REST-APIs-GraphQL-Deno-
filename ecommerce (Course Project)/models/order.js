// checkout button will delete products from cart and add them here
// order will be related to products and a user

// returns a class/constructor function
const Sequelize = require('sequelize');

// connection pool manager
const sequelize = require('../util/database')

const Order = sequelize.define('order', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    quantity: Sequelize.INTEGER
});

module.exports = Order

