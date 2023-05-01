const axios = require('axios');

const Cart = require('../../models/cart');
const Order = require('../../models/order');

exports.getPaymentToken = (req, res, next) => {
  axios.post(`${process.env.PAYU_ENDPOINT}pl/standard/user/oauth/authorize`, {
    grant_type: 'client_credentials',
    client_id: process.env.PAYU_CLIENT_ID,
    client_secret: process.env.PAYU_CLIENT_SECRET
  }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
    .then((response) => {
      res.status(200).json({
        message: 'Payment Token Obtained Successfully',
        paymentToken: response.data.access_token
      });
    })
    .catch((err) => {
      console.log(err);
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getPaymentMethods = (req, res, next) => {
  const { paymentToken } = req.params;

  axios.get(`${process.env.PAYU_ENDPOINT}api/v2_1/paymethods`,
    {
      headers: {
        Authorization: `Bearer ${paymentToken}`
      }
    })
    .then((response) => {
      res.status(200).json({
        message: 'Payment Methods fetched succesfully',
        paymentMethods: response.data.payByLinks
      });
    })
    .catch((err) => {
      console.log(err);
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.payment = (req, res, next) => {
  Cart.findById(req.body.cart).populate('products.product')
    .then((cartData) => {
      const products = cartData.products.map((item) => ({
        name: item.product.name,
        unitPrice: item.product.price * 100,
        quantity: 1
      }));

      const data = {
        notifyUrl: 'https://mmisztelaapi.pl:8080/api/paymentStatus',
        continueUrl: process.env.PAYU_CONTINUE_URL,
        customerIp: '127.0.0.1', // add true user IP address
        merchantPosId: process.env.PAYU_POS_ID,
        description: 'Moze Ryba',
        currencyCode: 'PLN',
        totalAmount: req.body.finalPrice * 100,
        extOrderId: req.body.orderId,
        products,
        payMethods: {
          payMethod: {
            type: 'PBL',
            value: req.body.paymentType
          }
        }
      };

      axios.post(`${process.env.PAYU_ENDPOINT}api/v2_1/orders/`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${req.body.paymentToken}`
        },
        maxRedirects: 0
      })
        .then((paymentRes) => {
          res.status(200).json({
            message: 'Payment redirection uri successfull',
            data: paymentRes.data
          });
        })
        .catch((err) => {
          if (err.response.status === 302) {
            res.status(200).json({
              message: 'Payment redirection uri successfull',
              data: err.response.data.redirectUri
            });
          } else {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
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

exports.paymentStatus = (req, res, next) => {
  if (req.body.order.status === 'COMPLETED') {
    Order.findOne({ _id: req.body.order.extOrderId })
      .then((order) => {
        const newStatus = order.realizationTimeOption === 'now' ? 'new' : 'planned';
        if (order.status === 'awaitingPayment') {
          Order.findOneAndUpdate({ _id: req.body.order.extOrderId },
            {
              $set: {
                'payment.status': true,
                status: newStatus
              }
            },
            { new: true })
            .then((data) => {
              req.io.sockets.in(req.body.order.extOrderId).emit('PaymentStatus', data);
              req.io.sockets.emit('NewOrder', data);
            })
            .catch((err) => console.log(err));
        }
      })
      .catch((err) => console.log(err));
  } else if (req.body.order.status === 'CANCELED') {
    Order.findOneAndUpdate({ _id: req.body.order.extOrderId },
      {
        $set: {
          'payment.status': false,
          status: 'failedPayment'
        }
      },
      { new: true })
      .then((data) => {
        req.io.sockets.in(req.body.order.extOrderId).emit('PaymentStatus', data);
      })
      .catch((err) => console.log(err));
  }
};
