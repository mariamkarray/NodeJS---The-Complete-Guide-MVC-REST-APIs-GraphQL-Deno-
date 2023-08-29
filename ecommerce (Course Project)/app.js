// provides a set of tools and functions that simplify tasks like routing, 
// handling different types of requests, managing cookies and sessions, and serving static files, etc
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
var { MONGODB_URI } = require('./util/URI');
const session = require('express-session');

// The session object imported from express is passed and stored in MongoDB
const MongoDBStore = require('connect-mongodb-session')(session);
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions',
});
const path = require('path')

const https = require('https');

const User = require('./models/user');


const errorController = require('./controllers/error')

// set global config value (sharing data accross app)
// views tell express where we can find the dynamic view
app.set('view engine', 'ejs');

app.set('views','views')



const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'my secret', // assign the hash
    resave: false, // the session will not be saved on every response, will change if smth changes in the session
    saveUninitialized: true,
    store: store
}))


// only routes starting with /admin will go the admin routes file
// I have two ecports in admin i will use both
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);


app.use(errorController.get404); 

mongoose.connect(MONGODB_URI)
.then(result => {
    User.findOne()
    .then(user => {
        if (!user) {
            const user = new User({
                name: 'Mariam',
                email: 'mariam@example.com',
                cart: {
                    items: []
                }
            })
            
        user.save();
        }
    })
    app.listen(3000);

})
.catch(err => {
    console.log(err)
})