// provides a set of tools and functions that simplify tasks like routing, 
// handling different types of requests, managing cookies and sessions, and serving static files, etc
const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const path = require('path')

const https = require('https');

const User = require('./models/user');

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
    User.findById('64eb8bd17ac248f586ee91d6')
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

mongoose.connect('mongodb+srv://Mariam:22618166@cluster0.2szm7sk.mongodb.net/shop?retryWrites=true&w=majority')
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