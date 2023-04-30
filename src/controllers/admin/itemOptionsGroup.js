const { validationResult, Result } = require('express-validator');

const ItemOptionsGroup = require('../../models/itemOptionsGroup');
const Restaurant = require('../../models/restaurant');
const Item = require('../../models/item');
const itemOption = require('../../models/itemOption');

exports.getItemOptionsGroup = (req, res, next) => {
  const { restaurantId } = req.params;
  Restaurant.findById(restaurantId).populate('itemOptionsGroup')
    .then((data) => {
      res.status(200).json({
        message: 'Item Options Groups fetched successfully',
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

exports.addItemOptionsGroup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const {
    name,
    required,
    multiSelect,
    itemId,
    restaurantId
  } = req.body;

  const itemOptionsGroup = new ItemOptionsGroup({
    name,
    required,
    multiSelect,
    item: itemId,
    restaurant: restaurantId
  });

  itemOptionsGroup.save()
    .then((result) => {
      Restaurant.findOne({ _id: restaurantId }, (err, restaurant) => {
        if (restaurant) {
          restaurant.itemOptionsGroup.push(result);
          restaurant.save()
            .then(() => {
              Item.findOne({ _id: itemId }, (itemErr, item) => {
                if (item) {
                  item.itemOptionsGroup.push(result);
                  item.save();
                  res.status(201).json({
                    message: 'Item Options Group Created!',
                    itemOptionsGroup: result
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

exports.deleteItemOptionsGroup = (req, res, next) => {
  const { itemOptionsGroupId } = req.params;

  ItemOptionsGroup.findById(itemOptionsGroupId)
    .then((itemOptionsGroup) => {
      if (!itemOptionsGroup) {
        const error = new Error('Could not find Item Options Group');
        error.statusCode = 404;
        throw error;
      }
      return ItemOptionsGroup.findByIdAndRemove(itemOptionsGroupId);
    })
    .then((result) => {
      res.status(200).json({
        message: 'Item Options Group deleted successfully!',
        itemsOptionGroupId: result._id
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updateItemOptionsGroup = (req, res, next) => {
  const { itemOptionsGroupId } = req.params;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, incorrect data.');
    error.statusCode = 422;
    throw error;
  }

  ItemOptionsGroup.findById(itemOptionsGroupId)
    .then((itemOptionsGroup) => {
      if (!itemOptionsGroup) {
        const error = new Error('Could not find item options group');
        error.statusCode = 404;
        throw error;
      }

      itemOptionsGroup.name = req.body.name || itemOptionsGroup.name;
      itemOptionsGroup.required = req.body.required !== itemOptionsGroup.required ? req.body.required : itemOptionsGroup.required;
      itemOptionsGroup.multiSelect = req.body.multiSelect !== itemOptionsGroup.multiSelect ? req.body.multiSelect : itemOptionsGroup.multiSelect;

      return itemOptionsGroup.save();
    })
    .then((result) => {
      res.status(200).json({
        message: 'Item Options Group updated successfully',
        itemsOptionGroup: result
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
