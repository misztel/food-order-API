const express = require('express');
const { body } = require('express-validator');

const User = require('../models/user');
const authController = require('../controllers/auth');

const router = express.Router();

router.get('/refreshtoken', authController.refreshToken);

router.put('/signup', [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email!')
    .custom((value, { req }) => User.findOne({ email: value })
      .then((userDoc) => {
        if (userDoc) {
          return Promise.reject(new Error('User with this email already exist'));
        }
        return null;
      }))
    .normalizeEmail(),
  body('password')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Password is too weak!'),
  body('name')
    .trim()
    .custom((value, { req }) => User.findOne({ name: value })
      .then((userDoc) => {
        if (userDoc) {
          return Promise.reject(new Error('User with this username already exist'));
        }
        return null;
      }))
    .not()
    .isEmpty()
], authController.signup);

router.get('/verify/:verificationCode', authController.verify);

router.put('/resendverificationcode', [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email!')
    .custom((value, { req }) => User.findOne({ email: value })
      .then((userDoc) => {
        if (userDoc) {
          return Promise.reject(new Error('User with this email already exist'));
        }
        return null;
      }))
    .normalizeEmail()
], authController.resendVerificationCode);

router.post('/resetpassword', [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email!')
    .normalizeEmail()
], authController.resetPasswordSend);

router.get('/resetpassword/:resetPasswordCode', authController.resetPasswordPrepare);

router.put('/resetpassword', [
  body('password')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Password is too weak!')
], authController.resetPassword);

router.post('/login', authController.login);

router.get('/logout', authController.logout);

router.post('/v1/auth/google', authController.googleAuth);

module.exports = router;
