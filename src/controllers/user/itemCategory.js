const Restaurant = require('../../models/restaurant');

exports.getItemCategories = (req, res, next) => {
  const { restaurantId } = req.params;
  Restaurant.findById(restaurantId).populate('itemCategories')
    .then((data) => {
      res.status(200).json({
        message: 'Categories fetched successfully',
        data: data.itemCategories
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
