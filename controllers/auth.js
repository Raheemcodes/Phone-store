const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');
const { google } = require('googleapis');

const User = require('../models/user');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oauth2client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
);

oauth2client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail(email, subject, mail) {
  try {
    const accessToken = await oauth2client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken,
      },
    });

    await transport.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject,
      generateTextFromHTML: true,
      html: mail,
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
}

exports.getSignup = (req, res, next) => {
  try {
    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    let isAdmin = false;
    res.render('auth/signup', {
      isAdmin,
      pageTitle: 'Sign up',
      cartQuantity: 0,
      searchInfo: '',
      errorMessage: message,
      oldInput: {
        email: '',
        password: '',
        confirmPassword: '',
      },
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getLogin = (req, res, next) => {
  try {
    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    let isAdmin = false;
    res.render('auth/login', {
      isAdmin,
      pageTitle: 'Login',
      cartQuantity: 0,
      searchInfo: '',
      errorMessage: message,
      oldInput: {
        email: '',
        password: '',
      },
    });
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postSignup = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(422).render('auth/signup', {
        pageTitle: 'Sign up',
        cartQuantity: 0,
        searchInfo: '',
        errorMessage: errors.array()[0].msg,
        oldInput: {
          email: email,
          password: password,
          confirmPassword: confirmPassword,
        },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      password: hashedPassword,
      cart: { items: [] },
    });

    user.save();
    res.redirect('/login');

    await sendMail(
      email,
      'Singup suceeded!',
      `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ibeemay</title>
        <style>
          body {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center
          }
          h1 {
            font-size: 3rem;
          }
          a,
          a:visited,
          a:focus,
          a:hover,
          a:active {
            border-radius: 5px;
            background-color: blue;
            color: white !important;
            padding: 0.5rem;
            text-align: center;
            text-decoration: none;
            font-size: 1.5rem;
            font-weight: bold;
          }
          </style>
          </head>
          <body>
            <h1>You successfully signed up!</h1>
            <a href="${req.protocol}://${req.get('host')}/login">Login</a>
          </body>
          </html>
        `,
    );
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postLogin = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        cartQuantity: 0,
        searchInfo: '',
        errorMessage: 'Invalid email or password.',
        oldInput: {
          email: email,
          password: password,
        },
      });
    }
    const doMatch = await bcrypt.compare(password, user.password);
    if (doMatch) {
      req.session.isLoggedIn = true;
      req.session.user = user;
      return res.redirect('/');
    }
    res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      cartQuantity: 0,
      searchInfo: '',
      errorMessage: 'Invalid email or password.',
      oldInput: {
        email: email,
        password: password,
      },
    });
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postLogout = (req, res, next) => {
  try {
    req.session.destroy((err) => {
      console.log(err);
      res.redirect('/');
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getReset = async (req, res, next) => {
  try {
    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    let isAdmin = false;
    res.render('auth/reset', {
      isAdmin,
      pageTitle: 'Reset Password',
      cartQuantity: 0,
      searchInfo: '',
      errorMessage: message,
      oldInput: {
        email: '',
      },
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postReset = async (req, res, next) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
        return res.redirect('/reset');
      }
      const email = req.body.email;
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).render('auth/reset', {
          pageTitle: 'Reset Password',
          cartQuantity: 0,
          searchInfo: '',
          errorMessage: errors.array()[0].msg,
          oldInput: {
            email: email,
          },
        });
      }
      const token = buffer.toString('hex');
      const user = await User.findOne({ email: req.body.email });
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 360000;
      await user.save();
      res.redirect('/');
      await sendMail(
        email,
        'Password Reset',
        `
      <p>You requested a password reset</p>
      <p>Click this <a href="${req.protocol}://${req.get(
          'host',
        )}/reset/${token}">link</a></p>
      `,
      );
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getNewPassword = async (req, res, next) => {
  try {
    const token = req.params.token;
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });
    if (!user) {
      req.flash('error', 'Reset token expired.');
      return res.redirect('/reset');
    }
    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    let isAdmin = false;
    res.render('auth/new-password', {
      isAdmin,
      pageTitle: 'New Password',
      cartQuantity: 0,
      searchInfo: '',
      errorMessage: message,
      userId: user._id.toString(),
      passwordToken: token,
      cartQuantity: 0,
      searchInfo: '',
      oldInput: {
        password: '',
        confirmPassword: '',
      },
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postNewPassword = async (req, res, next) => {
  try {
    const newPassword = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(422).render('auth/new-password', {
        pageTitle: 'New Password',
        cartQuantity: 0,
        searchInfo: '',
        errorMessage: errors.array()[0].msg,
        userId: userId,
        passwordToken: passwordToken,
        oldInput: {
          password: newPassword,
          confirmPassword: confirmPassword,
        },
      });
    }

    const user = await User.findOne({
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
      _id: userId,
    });
    const email = user.email;

    if (!user) {
      console.log(user);
      req.flash('error', 'User does not exist.');
      return res.redirect('/reset');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    res.redirect('/login');

    await sendMail(
      email,
      'Password Successfully Changed!',
      ` <h1>Password has successfully been reset. CLick <a href="${
        req.protocol
      }://${req.get('host')}/login">here</a> to login</h1>`,
    );
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
