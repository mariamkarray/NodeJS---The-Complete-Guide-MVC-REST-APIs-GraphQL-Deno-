// provides a set of tools and functions that simplify tasks like routing, 
// handling different types of requests, managing cookies and sessions, and serving static files, etc
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path')


const sequelize = require('./util/database');
const Product = require('./models/product')
const User = require('./models/user')
const Cart = require('./models/cart')
const CartItem = require('./models/cart-item')
const Order = require('./models/order')
const OrderItem = require('./models/order-item')

const https = require('https');

const app = express();

const errorController = require('./controllers/error')

// set global config value (sharing data accross app)
// views tell express where we can find the dynamic view
app.set('view engine', 'ejs');
// where to find our views, default is '/views' 
app.set('views','views' )

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

// new middleware
// npm start doesn't execute it, it gets executed on incoming requests only
// the next() function is used to pass control to the next middleware function or route handler in the Express application's request-response cycle.
// It's important for ensuring that the application's execution continues to the next step after the current middleware has finished its task.
app.use((req, res, next) => {
    User.findByPk(1)
.then(user => {
    req.user = user;
    next();
})
.catch(err => console.log(err));
});

// only routes starting with /admin will go the admin routes file
// I have two ecports in admin i will use both
app.use('/admin', adminRoutes);
app.use(shopRoutes);


app.use(errorController.get404); 

// create relations in DB
Product.belongsTo(User, {
    constraints: true,
    onDelete: 'CASCADE' // if a user is deleted the products related are deleted 
});

// one to many (we have one user)
User.hasMany(Product);
// add userID field to cart (one to one)
User.hasOne(Cart);
// many to many,through is telling sequelize where this connection should be stored
Cart.belongsToMany(Product, {through: CartItem })

User.hasMany(Order);
Order.belongsTo(User)
Order.belongsToMany(Product, {through: OrderItem });


// looks at all the defined models and creates tables for them

sequelize
.sync()
.then(result => {
    return User.findByPk(1)
})
.then(user => {
    if (!user) {
        return User.create({name: 'Mariam', email: 'test@test.com'});
    }
    return Promise.resolve(user);
})
.then(user => {
    user.createCart();
})
.then(cart => {
    app.listen(3000);
})
.catch(err => {
    console.log(err);
})
