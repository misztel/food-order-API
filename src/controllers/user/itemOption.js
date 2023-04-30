const Restaurant = require('../../models/restaurant');

exports.getItemOptions = (req, res, next) => {
  const { restaurantId } = req.params;
  Restaurant.findById(restaurantId).populate('itemOptions')
    .then((data) => {
      res.status(200).json({
        message: 'Item Options fetched successfully',
        data: data.itemOptions
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
