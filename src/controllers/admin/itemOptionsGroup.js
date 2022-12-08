const { validationResult, Result } = require('express-validator');

const ItemOptionsGroup = require('../../models/itemOptionsGroup');

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
    isRequired,
    item
  } = req.body;

  const itemOptionsGroup = new ItemOptionsGroup({
    name,
    isRequired,
    item
  });

  itemOptionsGroup.save()
    .then((result) => {
      res.status(201).json({
        message: 'Item Options Group Created!',
        itemOptionsGroup: result
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
        message: 'Item Options Group deleted successfully!'
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
