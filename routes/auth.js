const express = require('express');

const { check, body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/signup', authController.getSignup);

router.get('/login', authController.getLogin);

router.get('/reset', authController.getReset);

router.get('/reset/:token', authController.getNewPassword);

router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail()
      .custom(async (value, { req }) => {
        const userDoc = await User.findOne({ email: value });
        if (userDoc) {
          return Promise.reject('E-mail already exist!');
        }
        return userDoc;
      }),
    body(
      'password',
      'Password must contain lowercase, uppercase, special character and min 8 characters!',
    )
      .isStrongPassword()
      .trim(),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords have to match');
      }
      return true;
    }),
  ],
  authController.postSignup,
);

router.post(
  '/login',
  [
    check('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please enter a valid email'),
    body('password', 'Password has to be valid!').isStrongPassword().trim(),
  ],
  authController.postLogin,
);

router.post('/logout', authController.postLogout);

router.post(
  '/reset',
  [
    check('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please enter a valid email')
      .custom(async (value, { req }) => {
        const userDoc = await User.findOne({ email: value });
        if (!userDoc) {
          return Promise.reject('User does not exist!');
        }
        return userDoc;
      }),
  ],
  authController.postReset,
);

router.post('/new-password', [
  body(
    'password',
    'Password must contain lowercase, uppercase, special character and min 8 characters!',
  )
    .isStrongPassword()
    .trim(),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords have to match');
    }
    return true;
  }),
],authController.postNewPassword);

module.exports = router;
