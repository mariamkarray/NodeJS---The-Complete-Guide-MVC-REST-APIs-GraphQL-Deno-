const User = require('../models/user');

const bcrypt = require('bcryptjs');

const nodemailer = require('nodemailer');
const SendmailTransport = require('nodemailer/lib/sendmail-transport');

var transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "",
    pass: ""
  }
});

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: req.flash('error')
  });
};

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: req.flash('error')
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({email: email})
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid email or password!');
        return res.redirect('/login')
      }
      bcrypt.compare(password, user.password)
      .then(doMatch => {
        if (doMatch){
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save(err => {
            console.log(err);
            return res.redirect('/');
          });
        }
        req.flash('error', 'Invalid email or password!');
        res.redirect('/login')
      })
    .catch(err => {
      console.log(err)
      res.redirect('/login')
       })
    })
    .catch(err => {
      console.log(err)
  })
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({email: email})
  .then(userFound => {
    if (userFound) {
      req.flash('error', 'email address already exists!');
      return res.redirect('/signup')
    }
    return bcrypt.hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: []}
      })
    return user.save()
    }).then(result => {
      const info = transporter.sendMail({
        from: '<mailtrap@send.smtp.mailtrap.io',
        to: "test@mail.com", 
        subject: "Signup succeeded ✔", 
        html: "<b>Congrats! You have successfully signed up.</b>",
      });
      res.redirect('/login')
    })
  })
  .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};
