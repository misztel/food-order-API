const { json } = require('body-parser');
const { validationResult } = require('express-validator');

const Item = require('../../models/item');

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
    price
  } = req.body;

  const item = new Item({
    name,
    desc,
    image,
    price
  });

  item.save()
    .then((result) => {
      res.status(201).json({
        message: 'Item Created!',
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
      item.active = req.body.active || item.active;
      item.wrapping = req.body.wrapping || item.wrapping;

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

  Item.findById(itemId)
    .then((item) => {
      if (!item) {
        const error = new Error('Could not find Item');
        error.statusCode = 404;
        throw error;
      }
      return Item.findByIdAndRemove(item);
    })
    .then((result) => {
      res.status(200).json({ message: 'Item deleted successfully!' });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getItems = (req, res, next) => {
  Item.find()
    .then((items) => {
      res.status(200).json({
        message: 'Items fetched successfully',
        items
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
