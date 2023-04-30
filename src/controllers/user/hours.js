const { json } = require('body-parser');
const { validationResult } = require('express-validator');

const Hour = require('../../models/hour');
const Restaurant = require('../../models/restaurant');

exports.isOpen = (req, res, next) => {
  const { restaurantId } = req.params;

  Restaurant.findById(restaurantId).populate('hours')
    .then((restaurant) => {
      const dateString = new Date().toLocaleString('en-US', {
        timeZone: 'Europe/Warsaw'
      });

      const date = new Date(dateString);
      const currentDay = date.getDay();
      const currentTime = date.getHours() * 60 * 60 * 1000 + date.getMinutes() * 60 * 1000 + date.getSeconds() * 1000;

      const timeObj = restaurant.hours.filter((hour) => (hour.day === currentDay ? hour : null))[0];

      if (currentTime > timeObj.open && currentTime < timeObj.close) {
        res.status(200).json({
          message: 'Hours fetched successfully',
          isOpen: true
        });
      } else {
        res.status(200).json({
          message: 'Hours fetched successfully',
          isOpen: false
        });
      }
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
