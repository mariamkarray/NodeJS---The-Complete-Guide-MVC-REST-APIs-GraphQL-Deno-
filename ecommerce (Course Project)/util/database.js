const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete', 'root', 'نشققشغ', {
    dialect: 'mysql', 
    host: 'localhost'
});

module.exports = sequelize;