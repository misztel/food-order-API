const { validationResult, Result } = require('express-validator');

const Restaurant = require('../../models/restaurant');

exports.getRestaurants = (req, res, next) => {
  Restaurant.find()
    .then((restaurants) => {
      res.status(200).json({
        message: 'Restaurants fetched successfully',
        restaurants
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
