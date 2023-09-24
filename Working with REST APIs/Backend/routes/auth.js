const express = require('express')

const bodyParser = require('body-parser');

const { body } = require('express-validator');

const User = require('../models/user')

const authController = require('../controllers/auth')

const router = express.Router();

router.put('/signup', [
    body('email').isEmail().withMessage('Please enter a valid email')
    .custom((value, { req }) => {
        return User.findOne({email: value}).then(userDoc => {
            if (userDoc) {
                return Promise.reject('Email address alraedy exists.')
            }
        })
    })
    .normalizeEmail(),
    body('password').trim(),
    body('name').trim().notEmpty()
], authController.signup);

router.post('/login', authController.login)

module.exports = router