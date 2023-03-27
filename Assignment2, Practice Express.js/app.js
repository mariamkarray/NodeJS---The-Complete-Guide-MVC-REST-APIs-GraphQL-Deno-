const express = require('express');
const app = express();

// first middleware
app.use('/users', (req, res, next) => {
    console.log('Hello from the first middleware')
    res.send('<h6> Users Page </h6>')
});

// second middleware
app.use('/', (req, res, next) => {
    console.log('Hello from the second middleware')
    res.send('<h1> Main Page </h1>')
});


app.listen(3000);