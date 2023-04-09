const express = require('express');
const path = require('path')

const bodyParser = require('body-parser');

const app = express();

const homeRoutes = require('./routes/home');
const userRoutes = require('./routes/users');

app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', userRoutes);
app.use(homeRoutes);

app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'))
});

app.listen(3000);