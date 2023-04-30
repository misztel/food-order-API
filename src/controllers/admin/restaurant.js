const { validationResult } = require('express-validator');

const Restaurant = require('../../models/restaurant');
const Hour = require('../../models/hour');
const RestaurantInfo = require('../../models/restaurantInfo');

exports.addRestaurant = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const {
    name,
    address,
    placeId
  } = req.body;

  const restaurant = new Restaurant({
    name,
    address,
    placeId
  });

  const createRestaurantInfo = async (restaurantId) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const restaurantInfo = await RestaurantInfo.create(
        {
          desc: 'desc',
          localization: 'localization',
          hours: 'hours',
          deliverymin: 'deliverymin',
          deliveryprice: 'deliveryprice',
          packageprice: 'packageprice',
          phone: 'phone',
          email: 'email',
          restaurant: restaurantId
        }
      ).then((returnedRestaurantInfo) => {
        Restaurant.findOne({ _id: restaurantId }, (err, restaurantItem) => {
          if (restaurantItem) {
            restaurantItem.restaurantInfo = returnedRestaurantInfo;
            restaurantItem.save();
          }
        });
      });
    } catch (error) {
      throw error;
    }
  };

  const createHours = async (restaurantId) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const hours = await Hour.create(
        [
          {
            day: 0,
            open: 41400000,
            close: 41400000,
            restaurant: restaurantId
          },
          {
            day: 1,
            open: 41400000,
            close: 41400000,
            restaurant: restaurantId
          },
          {
            day: 2,
            open: 41400000,
            close: 41400000,
            restaurant: restaurantId
          },
          {
            day: 3,
            open: 41400000,
            close: 41400000,
            restaurant: restaurantId
          },
          {
            day: 4,
            open: 41400000,
            close: 41400000,
            restaurant: restaurantId
          },
          {
            day: 5,
            open: 41400000,
            close: 41400000,
            restaurant: restaurantId
          },
          {
            day: 6,
            open: 41400000,
            close: 41400000,
            restaurant: restaurantId
          }
        ]
      ).then((returnedHours) => {
        Restaurant.findOne({ _id: restaurantId }, (err, restaurantItem) => {
          if (restaurantItem) {
            restaurantItem.hours = returnedHours;
            restaurantItem.save();
          }
        });
      });
    } catch (error) {
      throw error;
    }
  };

  restaurant.save()
    .then((result) => {
      createHours(result._id).then(() => createRestaurantInfo(result._id));
      res.status(201).json({ message: 'Restaurant created!', restaurant: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

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

exports.getRestaurant = (req, res, next) => {
  const { restaurantId } = req.params;

  Restaurant.findById(restaurantId)
    .then((restaurant) => {
      if (!restaurant) {
        const error = new Error('Could not find restaurant');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: 'Restaurant data fetched successfully',
        restaurant
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updateRestaurant = (req, res, next) => {
  const { restaurantId } = req.params;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, incorrect data.');
    error.statusCode = 422;
    throw error;
  }

  Restaurant.findById(restaurantId)
    .then((restaurant) => {
      if (!restaurant) {
        const error = new Error('Could not find restaurant.');
        error.statusCode = 404;
        throw error;
      }

      restaurant.name = req.body.name || restaurant.name;
      restaurant.address = req.body.address || restaurant.address;
      restaurant.placeId = req.body.placeId || restaurant.placeId;
      restaurant.deliveryEnabled = req.body.deliveryEnabled || restaurant.deliveryEnabled;
      restaurant.active = req.body.active || restaurant.active;
      restaurant.archived = req.body.archived || restaurant.archived;

      return restaurant.save();
    })
    .then((result) => {
      res.status(200).json({ message: 'Restaurant data updated successfully', restaurant: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteRestaurant = (req, res, next) => {
  const { restaurantId } = req.params;
  Restaurant.findById(restaurantId)
    .then((restaurant) => {
      if (!restaurant) {
        const error = new Error('Could not find restaurant!');
        error.statusCode = 404;
        throw error;
      }
      return Restaurant.findByIdAndRemove(restaurantId);
    })
    .then((result) => {
      res.status(200).json({ message: 'Restaurant deleted successfully!' });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
