const User = require('../models/user');
const crypto = require('crypto')
const bcrypt = require('bcryptjs');
const { google } = require('googleapis');
const OAuth2ClientCon =google.auth.OAuth2;

var {CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN} = require("../util/URI")

const nodemailer = require('nodemailer');
const SendmailTransport = require('nodemailer/lib/sendmail-transport');

const oAuth2Client = new OAuth2ClientCon(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN  })

const accessToken = oAuth2Client.getAccessToken();
const transport = nodemailer.createTransport({
  service: 'gmail',
  secure: true,
  auth: {
    type: 'OAuTH2',
    user: 'mariamkarrayy@gmail.com',
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    refreshToken: REFRESH_TOKEN,
    accessToken: accessToken
  }
})

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
      const mailOptions = {
        from: 'mariamkarrayy@gmail.com',
        to: email,
        subject: "Signup succeeded ✔", 
        html: "<b>Congrats! You have successfully signed up.</b>"
      }
      const sent = transport.sendMail(mailOptions)
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

exports.getReset = (req, res, next) => {
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: req.flash('error')
  });
}

exports.postReset = (req, res, next) => {
  // after the 32 bits are generated, an error and a buffer could be returned
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset')
    }
    // case buffer
    const token = buffer.toString('hex')
    User.findOne({email: req.body.email})
    .then(user => {
      if (!user) {
        req.flash('error', 'No account with this email was found.');
        return res.redirect('/reset');
      }
      user.resetToken = token
      user.resetTokenExpiration = Date.now() + 3600000;
      return user.save();
    })
    .then(result => {
      res.redirect('/')
      const mailOptions = {
        from: 'mariamkarrayy@gmail.com',
        to: req.body.email,
        subject: "Password reset", 
        html: `
        <p>You requested a password reset</p>
        <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> link to set a new password.</p>
        `
      }
      const sent = transport.sendMail(mailOptions)
    })
    .catch(err => console.log(err));
  });
}

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
  .then(user => {
    res.render('auth/new-password', {
      path: '/new-password',
      pageTitle: 'New Password',
      errorMessage: req.flash('error'),
      userId: user._id.toString(),
      passwordToken: token
    });
  })
  .catch(err => console.log(err));
}
exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;


  User.findOne({resetToken: passwordToken, resetTokenExpiration: {$gt: Date.now()}}, _id = userId)
  .then(user => {
    resetUser = user;
    return bcrypt.hash(newPassword, 12)
  })
  .then(hashedPassowrd => {
    resetUser.password = hashedPassowrd;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration = undefined;
    return resetUser.save()
  })
  .then(result => {
    res.redirect('/login')
  })
  .catch(err => console.log(err));
}