const { validationResult } = require('express-validator');

const ItemOption = require('../../models/itemOption');

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
    price
  } = req.body;

  const itemOption = new ItemOption({
    name,
    price
  });

  itemOption.save()
    .then((result) => {
      res.status(201).json({
        message: 'Option Item Created Successfully',
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
        message: 'Item Option deleted successfully!'
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
