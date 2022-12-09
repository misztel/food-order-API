const { validationResult } = require('express-validator');

const ItemCategory = require('../../models/itemCategory');
const Restaurant = require('../../models/restaurant');

exports.addItemCategory = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const {
    name,
    image,
    restaurant: restaurantId
  } = req.body;

  const itemCategory = new ItemCategory({
    name,
    image,
    restaurant: restaurantId
  });

  itemCategory.save()
    .then((result) => {
      Restaurant.findOne({ _id: restaurantId }, (err, restaurant) => {
        if (restaurant) {
          restaurant.itemCategories.push(itemCategory);
          restaurant.save();
          res.status(201).json({
            message: 'Item Category Created!',
            itemCategory: result
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

exports.deleteItemCategory = (req, res, next) => {
  const { itemCategoryId } = req.params;

  ItemCategory.findById(itemCategoryId)
    .then((itemCategory) => {
      if (!itemCategory) {
        const error = new Error('Could not find Item Category');
        error.statusCode = 404;
        throw error;
      }
      return ItemCategory.findByIdAndRemove(itemCategoryId);
    })
    .then((result) => {
      res.status(200).json({ message: 'Restaurant deleted successfully!', itemCategoryId: result._id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updateItemCategory = (req, res, next) => {
  const { itemCategoryId } = req.params;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, incorrect data.');
    error.statusCode = 422;
    throw error;
  }

  ItemCategory.findById(itemCategoryId)
    .then((itemCategory) => {
      if (!itemCategory) {
        const error = new Error('Could not find Category');
        error.statusCode = 404;
        throw error;
      }

      itemCategory.name = req.body.name || itemCategory.name;
      itemCategory.image = req.body.image || itemCategory.image;

      return itemCategory.save();
    })
    .then((result) => {
      res.status(200).json({
        message: 'Category data updated successfully',
        itemCategory: result
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// admin/user routes

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
