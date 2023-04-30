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

exports.updateRestaurantInfo = (req, res, next) => {
  const { restaurantInfoId } = req.params;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, incorrect data.');
    error.statusCode = 422;
    throw error;
  }

  RestaurantInfo.findById(restaurantInfoId)
    .then((restaurantInfo) => {
      if (!restaurantInfo) {
        const error = new Error('Could not find Item');
        error.statusCode = 404;
        throw error;
      }

      restaurantInfo.desc = req.body.desc || restaurantInfo.desc;
      restaurantInfo.localization = req.body.localization || restaurantInfo.localization;
      restaurantInfo.hours = req.body.hours || restaurantInfo.hours;
      restaurantInfo.deliverymin = req.body.deliverymin || restaurantInfo.deliverymin;
      restaurantInfo.deliveryprice = req.body.deliveryprice || restaurantInfo.deliveryprice;
      restaurantInfo.packageprice = req.body.packageprice || restaurantInfo.packageprice;
      restaurantInfo.phone = req.body.phone || restaurantInfo.phone;
      restaurantInfo.email = req.body.email || restaurantInfo.email;

      return restaurantInfo.save();
    })
    .then((result) => {
      res.status(200).json({
        message: 'Restaurant Info updated',
        restaurantInfo: result
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
