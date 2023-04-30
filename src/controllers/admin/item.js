const { json } = require('body-parser');
const { validationResult } = require('express-validator');

const Item = require('../../models/item');
const ItemCategory = require('../../models/itemCategory');
const Restaurant = require('../../models/restaurant');

exports.addItem = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const {
    name,
    desc,
    image,
    price,
    active,
    wrapping,
    itemCategoryId,
    restaurantId
  } = req.body;

  Item.find()
    .then((items) => {
      const currentcategoryItems = items.map((item) => (item.itemCategory === itemCategoryId ? item : null));
      const orderKey = currentcategoryItems.length + 1;

      const item = new Item({
        orderKey,
        name,
        desc,
        image,
        price,
        active,
        wrapping,
        itemCategory: itemCategoryId,
        restaurant: restaurantId
      });

      return item;
    }).then((item) => item.save()
      .then((result) => {
        Restaurant.findOne({ _id: restaurantId }, (err, restaurant) => {
          if (restaurant) {
            restaurant.items.push(item);
            restaurant.save()
              .then(() => {
                ItemCategory.findOne({ _id: itemCategoryId }, (itemCategoryErr, itemCategory) => {
                  if (itemCategory) {
                    itemCategory.items.push(item);
                    itemCategory.save();
                    res.status(201).json({
                      message: 'Item Created!',
                      item: result
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
      }));
};

exports.updateItem = (req, res, next) => {
  const { itemId } = req.params;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, incorrect data.');
    error.statusCode = 422;
    throw error;
  }

  Item.findById(itemId)
    .then((item) => {
      if (!item) {
        const error = new Error('Could not find Item');
        error.statusCode = 404;
        throw error;
      }
      item.name = req.body.name || item.name;
      item.desc = req.body.desc || item.desc;
      item.image = req.body.image || item.image;
      item.price = req.body.price || item.price;
      item.active = req.body.active !== item.active ? req.body.active : item.active;
      item.wrapping = req.body.wrapping !== item.wrapping ? req.body.wrapping : item.wrapping;

      return item.save();
    })
    .then((result) => {
      res.status(200).json({
        message: 'Item data updated!',
        item: result
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteItem = (req, res, next) => {
  const { itemId } = req.params;

  // find ids of models with stored reference
  Item.findById(itemId).then((item) => {
    if (!item) {
      const error = new Error('Could not find Item');
      error.statusCode = 404;
      throw error;
    }
    return item;
  })
    .then((resItem) => {
      Restaurant.findOneAndUpdate({ _id: resItem.restaurant }, {
        $pull: {
          items: itemId
        }
      }, (delItemFromRestaurantErr) => {
        if (delItemFromRestaurantErr) {
          const error = new Error('Could not delete restaurant reference');
          error.statusCode = 404;
          throw error;
        }
        ItemCategory.findOneAndUpdate({ _id: resItem.itemCategory }, {
          $pull: {
            items: itemId
          }
        }, (delItemFromItemCategoryErr) => {
          if (delItemFromItemCategoryErr) {
            const error = new Error('Could not delete itemCategory reference');
            error.statusCode = 404;
            throw error;
          }
          Item.findByIdAndRemove({ _id: itemId }, (err) => {
            if (err) {
              const error = new Error('Could not delete Item reference');
              error.statusCode = 404;
              throw error;
            }
            res.status(200).json({ message: 'Item deleted successfully!', itemId });
          });
        });
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getItems = (req, res, next) => {
  const { restaurantId } = req.params;
  Restaurant.findById(restaurantId).populate('items')
    .then((data) => {
      res.status(200).json({
        message: 'Items fetched successfully',
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

exports.getItem = (req, res, next) => {
  const { menuItemId } = req.params;
  Item.findById(menuItemId)
    .then((item) => {
      res.status(200).json({
        message: 'Item fetched successfully',
        data: item
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updateItemsOrder = (req, res, next) => {
  const { items, restaurantId } = req.body;

  const updatePromises = items.map((item) => (
    Item.findOneAndUpdate({ _id: item._id }, { $set: { orderKey: item.orderKey } })
  ));

  Promise.all(updatePromises)
    .then(() => {
      Restaurant.findById(restaurantId).populate('items')
        .then((data) => {
          res.status(200).json({
            message: 'Items fetched successfully',
            data: data.items
          });
        })
        .catch((err) => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
