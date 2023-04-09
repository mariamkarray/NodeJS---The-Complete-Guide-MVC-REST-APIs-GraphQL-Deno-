const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.set('view engine', 'ejs')
app.set('views', 'views')

const homeData = require('./routes/home')
const usersData = require('./routes/users')

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(homeData.routes);
app.use(usersData.routes);

app.use((req, res, next) => {
    res.status(404).render('404', {pageTitle: 'Not Found', path: '/'})
}); 

app.listen(3000)