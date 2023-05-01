require('dotenv').config();
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const randomstring = require('randomstring');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const User = require('../models/user');
const RefreshToken = require('../models/refreshToken');
const VerificationCode = require('../models/verificationCode');

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const {
    name,
    email,
    password
  } = req.body;

  bcrypt.hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        name,
        email,
        password: hashedPassword,
        verified: false
      });
      return user.save();
    })
    .then((result) => {
      const generatedCode = randomstring.generate(28);
      const user = result._id;
      const verificationCode = new VerificationCode({
        code: generatedCode,
        user
      });
      return verificationCode.save();
    })
    .then((code) => User.findById(code.user)
      .then((user) => {
        user.verifyCode.push(code);
        return user.save();
      }))
    .then((result) => {
      res.status(201).json({ message: 'User created!', userId: result._id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.verify = (req, res, next) => {
  const { verificationCode } = req.params;
  const code = verificationCode;
  VerificationCode.findOne({ code })
    .then((result) => {
      if (!result) {
        const error = new Error('This code doesnt exists!');
        error.statusCode = 401;
        error.message = 'This code doesnt exists!';
        throw error;
      }
      User.findById(result.user)
        .then((user) => {
          user.verified = true;
          return user.save();
        });
    })
    .then(() => {
      VerificationCode.findOne({ code })
        .then((result) => VerificationCode.findByIdAndRemove(result._id));
    })
    .then(() => {
      res.status(201).json({ message: 'Account activated!' });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.resendVerificationCode = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const { email } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        const error = new Error('User with this email doesnt exists!');
        error.statusCode = 401;
        error.message = 'User with this email doesnt exists!';
        throw error;
      } else if (user.verified === true) {
        const error = new Error('This account is already verified!');
        error.statusCode = 401;
        error.message = 'This account is already verified!';
        throw error;
      }
      return user;
    })
    .then((userData) => {
      VerificationCode.findOne({ user: userData._id })
        .then((result) => {
          if (result) {
            VerificationCode.findByIdAndRemove(result._id, (err, docs) => {
              if (err) {
                console.log(err);
              } else {
                console.log('Removed Code: ', docs);
              }
            });
          }
          const generatedCode = randomstring.generate(28);
          const user = userData._id;
          const verificationCode = new VerificationCode({
            code: generatedCode,
            user
          });
          return verificationCode.save();
        })
        .then((code) => {
          User.findById(code.user)
            .then((userToEdit) => {
              userToEdit.verifyCode = [];
              userToEdit.verifyCode.push(code);
              return userToEdit.save();
            });
          return code;
        })
        .then((result) => {
          res.status(201).json({ message: 'Verification code renewed!', userId: result.user });
        })
        .catch((err) => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.resetPasswordSend = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const { email } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        const error = new Error('User with this email doesnt exists!');
        error.statusCode = 401;
        error.message = 'User with this email doesnt exists!';
        throw error;
      } else if (user.verified === false) {
        const error = new Error('Cant reset password for non activated account!');
        error.statusCode = 401;
        error.message = 'Cant reset password for non activated account!';
        throw error;
      }
      const generatedPasswordResetCode = randomstring.generate(28);
      user.resetPasswordCode = generatedPasswordResetCode;
      return user.save();
    })
    .then((result) => {
      res.status(201).json({ message: 'Reset password Code saved!', userId: result.user });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.resetPasswordPrepare = (req, res, next) => {
  const { resetPasswordCode } = req.params;
  User.findOne({ resetPasswordCode })
    .then((user) => {
      if (!user) {
        const error = new Error('Reset Password Code doesnt exist or expired!');
        error.statusCode = 401;
        error.message = 'Reset Password Code doesnt exist or expired!';
        throw error;
      }
      user.resetPasswordCode = '';
      return user.save();
    })
    .then((result) => {
      res.status(201).json(
        {
          message: 'Reset Password Code deleted. Password set to reset!',
          userId: result._id
        }
      );
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.resetPassword = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const { userId, password } = req.body;

  console.log(userId, password);

  User.findOne({ _id: userId })
    .then((user) => {
      if (!user) {
        const error = new Error('User for password reset not found!');
        error.statusCode = 401;
        error.message = 'User for password reset not found!';
        throw error;
      }
      bcrypt.hash(password, 12)
        .then((hashedPassword) => {
          user.password = hashedPassword;
          return user.save();
        });
      return user;
    })
    .then((result) => {
      res.status(201).json({ message: 'Password reset successful!', userId: result._id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  let loadedUser;
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        const error = new Error('User with this email doesnt exists!');
        error.statusCode = 401;
        error.message = 'User with this email doesnt exists!';
        throw error;
      } else if (user.verified === false) {
        const error = new Error('This account is not Activated!');
        error.statusCode = 401;
        error.message = 'This account is not Activated!';
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(async (isEqual) => {
      if (!isEqual) {
        const error = new Error('Wrong password!');
        error.statusCode = 401;
        error.message = 'Wrong password';
        throw error;
      }

      const token = jwt.sign({ id: loadedUser._id }, process.env.JWT_SECRET, { expiresIn: `${process.env.JWT_EXPIRATION}s` });

      const refreshToken = await RefreshToken.createToken(loadedUser);

      res.cookie('JWT', refreshToken, {
        maxAge: 86_400_000,
        httpOnly: true
      });

      res.status(200).json(
        {
          token,
          userId: loadedUser._id.toString(),
          access: loadedUser.access
        }
      );
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      res.status(err.statusCode).json(
        {
          message: err.message
        }
      );
    });
};

exports.refreshToken = async (req, res) => {
  const requestToken = req.cookies.JWT;

  if (requestToken == null) {
    return res.status(403).json({ message: 'Refresh Token is required!' });
  }

  try {
    const refreshToken = await RefreshToken.findOne({ token: requestToken });

    if (!refreshToken) {
      res.status(403).json({ message: 'Refresh token is not in database!' });
      return;
    }

    if (RefreshToken.verifyExpiration(refreshToken)) {
      RefreshToken.findByIdAndRemove(refreshToken._id, { useFindAndModify: false }).exec();

      res.status(403).json({
        message: 'Refresh token was expired. Please make a new signin request'
      });
      return;
    }

    const newAccessToken = jwt.sign({ id: refreshToken.user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION
    });
    res.cookie('JWT', refreshToken.token, {
      maxAge: 86_400_000,
      httpOnly: true,
      sameSite: 'none',
      secure: true
    });

    return res.status(200).json({
      token: newAccessToken,
      userId: refreshToken.user._id
    });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('JWT');
  return res.status(200).send({ message: 'loggedout' });
};

exports.googleAuth = (req, res) => {
  const { token } = req.body;

  if (!token) {
    const error = new Error('No google token provided!');
    error.statusCode = 401;
    error.message = 'Google token missing!';
    throw error;
  }

  client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  }).then((result) => {
    if (!result.payload) {
      const error = new Error('No google token verification err!');
      error.statusCode = 401;
      error.message = 'Google token verification err!';
      throw error;
    }
    const { email, given_name } = result.payload;
    User.findOne({ email })
      .then((user) => {
        if (!user) {
          // create new user based on google data
          const generatedPassword = randomstring.generate(8);

          bcrypt.hash(generatedPassword, 12)
            .then((hashedPassword) => {
              const newUser = new User({
                name: given_name,
                email,
                password: hashedPassword,
                verified: true
              });
              return newUser.save();
            })
            .then((newUser) => {
              // make user authenticated - login
              const tokenJWT = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: `${process.env.JWT_EXPIRATION}s` });
              RefreshToken.createToken(newUser)
                .then((refreshToken) => {
                  res.cookie('JWT', refreshToken, {
                    maxAge: 86_400_000,
                    httpOnly: true
                  });
                })
                .then(() => {
                  res.status(200).json(
                    {
                      token: tokenJWT,
                      userId: newUser._id.toString(),
                      access: newUser.access
                    }
                  );
                })
                .catch((err) => {
                  if (!err.statusCode) {
                    err.statusCode = 500;
                  }
                  res.status(err.statusCode).json(
                    {
                      message: err.message
                    }
                  );
                });
            });
        }
        // make user authenticated - login
        const tokenJWT = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: `${process.env.JWT_EXPIRATION}s` });
        RefreshToken.createToken(user)
          .then((refreshToken) => {
            res.cookie('JWT', refreshToken, {
              maxAge: 86_400_000,
              httpOnly: true
            });
          })
          .then(() => {
            res.status(200).json(
              {
                token: tokenJWT,
                userId: user._id.toString(),
                access: user.access
              }
            );
          })
          .catch((err) => {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            res.status(err.statusCode).json(
              {
                message: err.message
              }
            );
          });
      })
      .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        res.status(err.statusCode).json(
          {
            message: err.message
          }
        );
      });
  });
};
