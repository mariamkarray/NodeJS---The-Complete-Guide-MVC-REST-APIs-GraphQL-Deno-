const path = require('path')
const rootDir = require('../util/path')
const express = require('express')

const userData = require('./home')

const router = express.Router();

router.get('/users', (req, res, next) => {
    const users = userData.users
    res.render('users', {pageTitle: 'Users', path : '/users', users: userData.users})
});


exports.routes = router;
