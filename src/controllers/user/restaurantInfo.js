const { json } = require('body-parser');
const { validationResult } = require('express-validator');

const RestaurantInfo = require('../../models/restaurantInfo');
const Restaurant = require('../../models/restaurant');

exports.getRestaurantInfo = (req, res, next) => {
  const { restaurantId } = req.params;

  Restaurant.findById(restaurantId).populate('restaurantInfo')
    .then((restaurant) => {
      res.status(200).json({
        message: 'Restaurant Info fetched successfully',
        restaurantInfo: restaurant.restaurantInfo
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
