// provides a set of tools and functions that simplify tasks like routing, 
// handling different types of requests, managing cookies and sessions, and serving static files, etc
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path')


const db = require('./util/database');

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

// only routes starting with /admin will go the admin routes file
// I have two ecports in admin i will use both
app.use('/admin', adminRoutes);
app.use(shopRoutes);


app.use(errorController.get404); 


app.listen(3000);