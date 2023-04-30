const Restaurant = require('../../models/restaurant');

exports.getItems = (req, res, next) => {
  const { restaurantId } = req.params;
  Restaurant.findById(restaurantId).populate('items')
    .then((data) => {
      res.status(200).json({
        message: 'Menu Items fetched successfully',
        data: data.items
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
