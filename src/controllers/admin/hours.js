const { json } = require('body-parser');
const { validationResult } = require('express-validator');

const Hour = require('../../models/hour');
const Restaurant = require('../../models/restaurant');

exports.getHours = (req, res, next) => {
  const { restaurantId } = req.params;
  Restaurant.findById(restaurantId).populate('hours')
    .then((data) => {
      res.status(200).json({
        message: 'Hours fetched successfully',
        data: data.hours
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updateHours = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, incorrect data.');
    error.statusCode = 422;
    throw error;
  }

  const bulkHours = req.body.hours.map((hour) => ({
    updateOne: {
      filter: {
        _id: hour._id
      },
      update: {
        open: hour.open,
        close: hour.close
      }
    }
  }));

  Hour.bulkWrite(bulkHours).then((updateHoursRes) => {
    console.log('Documents Updated', updateHoursRes);
  });
};
