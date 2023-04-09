
const express = require('express')

const path = require('path')
const rootDir = require('../util/path')

const router = express.Router();

const users = []

router.get('/', (req, res, next) => {
    res.render('home', {pageTitle: "Home", path : '/'})
});

router.post('/', (req, res, next) => {
    users.push({user: req.body.user})
    res.redirect('/')
});
exports.routes = router;
exports.users = users;