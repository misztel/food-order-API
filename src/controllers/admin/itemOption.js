const { validationResult } = require('express-validator');

const ItemOption = require('../../models/itemOption');
const Restaurant = require('../../models/restaurant');
const ItemOptionsGroup = require('../../models/itemOptionsGroup');

exports.addItemOption = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const {
    name,
    price,
    itemOptionsGroupId,
    restaurantId
  } = req.body;

  const itemOption = new ItemOption({
    name,
    price,
    itemOptionsGroup: itemOptionsGroupId,
    restaurant: restaurantId
  });

  itemOption.save()
    .then((result) => {
      Restaurant.findOne({ _id: restaurantId }, (err, restaurant) => {
        if (restaurant) {
          restaurant.itemOptions.push(itemOption);
          restaurant.save()
            .then(() => {
              ItemOptionsGroup.findOne({ _id: itemOptionsGroupId }, (itemOptionsGroupErr, itemOptionsGroup) => {
                if (itemOptionsGroup) {
                  itemOptionsGroup.itemOptions.push(itemOption);
                  itemOptionsGroup.save();
                  res.status(201).json({
                    message: 'Option Item Created Successfully',
                    itemOption: result
                  });
                }
              });
            });
        }
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteItemOption = (req, res, next) => {
  const { itemOptionId } = req.params;

  ItemOption.findById(itemOptionId)
    .then((itemOption) => {
      if (!itemOption) {
        const error = new Error('Could not find Item Option');
        error.statusCode = 404;
        throw error;
      }
      return ItemOption.findByIdAndRemove(itemOptionId);
    })
    .then((result) => {
      res.status(200).json({
        message: 'Item Option deleted successfully!',
        itemOptionId: result._id
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

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

exports.updateItemOption = (req, res, next) => {
  const { itemOptionId } = req.params;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, incorrect data.');
    error.statusCode = 422;
    throw error;
  }

  ItemOption.findById(itemOptionId)
    .then((itemOption) => {
      if (!itemOption) {
        const error = new Error('Could not find Item Option');
        error.statusCode = 404;
        throw error;
      }
      itemOption.name = req.body.name || itemOption.name;
      itemOption.price = req.body.price || itemOption.price;

      return itemOption.save();
    })
    .then((result) => {
      res.status(200).json({
        message: 'Item Option data updated!',
        itemOption: result
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
