// provides a set of tools and functions that simplify tasks like routing, 
// handling different types of requests, managing cookies and sessions, and serving static files, etc
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
var { MONGODB_URI } = require('./util/URI');
const session = require('express-session');
const flash = require('connect-flash')

app.use(bodyParser.urlencoded({extended: false}));

// The session object imported from express is passed and stored in MongoDB
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf')

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions',
});

const csrfProtection = csrf();


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
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'my secret', // assign the hash
    resave: false, // the session will not be saved on every response, will change if smth changes in the session
    saveUninitialized: true,
    store: store
}))
app.use(flash());

app.use(csrfProtection);

app.use((req, res, next) => {
    if (!req.session.user) {
        return next()
    }
    User.findById(req.session.user._id)
    .then(user => {
        req.user = user;
        next();
    })
    .catch(err => {
        console.log(err)
    })

})  


app.use((req, res, next) => {
    // local variables that are passed in the veiws only
    res.locals.isAuthenticated =  req.session.isLoggedIn
    res.locals.csrfToken = req.csrfToken();
    next();
})

// only routes starting with /admin will go the admin routes file
// I have two ecports in admin i will use both
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);


app.use(errorController.get404); 

mongoose.connect(MONGODB_URI)
.then(result => {
    app.listen(3000);
})
.catch(err => {
    console.log(err)
})