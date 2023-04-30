const { validationResult } = require('express-validator');

const Order = require('../../models/order');

exports.getOrders = (req, res, next) => {
  const { date } = req.params;
  Order.find({
    orderDate: {
      $gte: new Date(new Date(date).setUTCHours(0, 0, 0, 0)),
      $lte: new Date(new Date(date).setUTCHours(23, 59, 59, 999))
    }
  })
    .then((orders) => {
      console.log(new Date('2023-02-22'));
      res.status(200).json({
        message: 'Orders fetched successfully',
        data: orders
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getOrder = (req, res, next) => {
  const { orderId } = req.params;

  Order.findById(orderId)
    .then((order) => {
      res.status(200).json({
        message: 'Order fetched successfully',
        data: order
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updateOrderStatus = (req, res, next) => {
  const { orderId, status } = req.body;

  Order.findOneAndUpdate({ _id: orderId },
    {
      $set: {
        status
      }
    },
    { new: true })
    .then((updatedOrder) => {
      req.io.sockets.in(orderId).emit('PaymentStatus', updatedOrder);
      res.status(200).json({
        message: 'Order status updated successfully',
        data: updatedOrder
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
