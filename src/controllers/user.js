const fs = require('fs');
const path = require('path');

const axios = require('axios');

const { validationResult } = require('express-validator');

const User = require('../models/user');

const clearImage = (filePath) => {
  if (!filePath.includes('/default/')) {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, (err) => console.log('err', err));
  }
};

exports.allAccess = (req, res) => {
  res.status(200).send('Public Content.');
};

exports.userBoard = (req, res) => {
  res.status(200).send('User Content.');
};

exports.adminBoard = (req, res) => {
  res.status(200).send('Admin Content.');
};

exports.superAdminBoard = (req, res) => {
  res.status(200).send('Moderator Content.');
};

exports.getUsers = (req, res, next) => {
  User.find()
    .then((users) => {
      res.status(200).json({
        message: 'Users fetched successfully',
        users
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getUser = (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        const error = new Error('Could not find user');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: 'User fetched successfully',
        user
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updateUser = (req, res, next) => {
  const { userId } = req.params;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, incorrect data.');
    error.statusCode = 422;
    throw error;
  }

  User.findById(userId)
    .then((user) => {
      if (!user) {
        const error = new Error('Could not find user.');
        error.statusCode = 404;
        throw error;
      }
      // user.name = req.body.name || user.name;
      user.phone = req.body.data.phone || user.phone;
      user.address = req.body.data.address.value.place_id || user.address;
      user.localNumber = req.body.data.localNumber || user.localNumber;
      user.firstName = req.body.data.firstName || user.firstName;
      user.lastName = req.body.data.secondName || user.lastName;

      console.log(req.body.data);

      return user.save();
    })
    .then((result) => {
      res.status(200).json({ message: 'User data updated successfully', user: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteUser = (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        const error = new Error('Could not find user!');
        error.statusCode = 404;
        throw error;
      }
      // check logged in user
      clearImage(user.avatarUrl);
      return User.findByIdAndRemove(userId);
    })
    .then((result) => {
      res.status(200).json({ message: 'User deleted successfully!' });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getAddress = (req, res, next) => {
  const { placeId } = req.params;

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${process.env.GOOGLE_API_KEY}`;

  axios.get(url)
    .then((response) => {
      console.log(response);
      res.status(200).json({
        message: 'Address data fetched successfully',
        data: response.data.result
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
