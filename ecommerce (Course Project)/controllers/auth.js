const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    console.log("get login")
        res.render('auth/login', {
            pageTitle: 'Login',
            path: '/login',
            isAuthenticated: false 
         });
    }

exports.postLogin = (req, res, next) => {
    User.findById('64eb8bd17ac248f586ee91d6')
    .then(user => {
        req.session.isLoggedIn = true;
        req.session.user = user;
        req.session.save(err=> {
            res.redirect('/');
        })
    })
    .catch(err => console.log(err));
}

exports.postLogout = (req, res, next) => {
    // the function will be called once the session is destroyed
    req.session.destroy(() => {
        res.redirect('/');
    });
}