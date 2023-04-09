const express = require('express');

const path = require('path');

const rootDir = require('../util/path');

const router = express.Router();

router.get('/add-movie', (req, res, next) => {
    res.sendFile(path.join(rootDir, 'views', 'add-movie.html'))
    
});
router.post('/add-movie', (req, res) => { 
    console.log(req.body);
    res.redirect('/');
});
module.exports = router;