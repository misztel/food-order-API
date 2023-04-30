const Restaurant = require('../../models/restaurant');

exports.getItemOptionsGroup = (req, res, next) => {
  const { restaurantId } = req.params;
  Restaurant.findById(restaurantId).populate('itemOptionsGroup')
    .then((data) => {
      res.status(200).json({
        message: 'Menu Items Options Groups fetched successfully',
        data: data.itemOptionsGroup
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
