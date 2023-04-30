const { validationResult } = require('express-validator');
const geolib = require('geolib');

const axios = require('axios');

const Order = require('../../models/order');
const Restaurant = require('../../models/restaurant');
const Cart = require('../../models/cart');

// get order
exports.getOrder = (req, res, next) => {
  Order.findById(req.params.orderId).populate('restaurant')
    .then((order) => {
      res.status(200).json({
        message: 'Order fetched succesfully',
        order
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getCords = (req, res, next) => {
  const { placeId } = req.params;
  console.log(placeId);
  const url = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${process.env.GOOGLE_API_KEY}`;
  axios.get(url)
    .then((response) => {
      console.log('RESPONSE', response.data);
      res.status(200).json({
        message: 'Place id data fetched succesfully',
        cords: response.data.result.geometry.location
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// place order
exports.addOrder = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Add Order Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const dateString = new Date().toLocaleString('en-US', {
    timeZone: 'Europe/Warsaw'
  });

  const {
    name,
    surname,
    email,
    phone,
    additionalInfo,
    cutlery,

    locality,
    street,
    postalCode,
    buildingNumber,
    localNumber,
    placeId,

    paymentTypeValue,
    paymentTypeName,

    deliveryPrice,
    realizationType,

    realizationTimeOption,
    realizationTime
  } = req.body.orderData;

  const {
    cartId,
    restaurantId,
    userId
  } = req.body;

  const saveOrder = (order) => {
    order.save()
      .then((newOrder) => {
        res.status(201).json({
          message: 'New Order Placed',
          order: newOrder
        });
        req.io.sockets.emit('NewOrder', newOrder);
      }).catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };

  const getOrderNumber = () => Order.countDocuments((err, count) => {
    if (!err && count === 0) {
      return 1;
    }
    return count + 1;
  });

  const getOrderStatus = (paymentType) => {
    if (paymentType === 'mr-ppo') {
      return 'new';
    }
    return 'awaitingPayment';
  };

  const getCartPrice = (id) => Cart.findById(id)
    .then((data) => (
      data.productPrice
    ))
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });

  const getWrappingPrice = (id) => Cart.findById(id)
    .then((data) => (
      data.wrappingPrice
    ))
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });

  const getDistance = (deliveryPlaceId, deliveryRestaurantId) => Restaurant.findById(deliveryRestaurantId)
    .then((restaurantData) => {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=place_id:${restaurantData.placeId}&destinations=place_id:${deliveryPlaceId}&key=${process.env.GOOGLE_API_KEY}`;

      const calculatedDistance = axios.get(url)
        .then((response) => (
          response.data.rows[0].elements[0].distance.value
        ))
        .catch((err) => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
      return calculatedDistance;
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });

  if (realizationType === 'delivery') {
    let orderNumber;
    let orderStatus;
    let cartPrice;
    let wrappingPrice;
    let distance;

    getOrderNumber()
      .then((orderNumberVal) => {
        orderNumber = orderNumberVal;
        return getOrderStatus(paymentTypeValue);
      })
      .then((orderStatusVal) => {
        orderStatus = orderStatusVal;
        return getCartPrice(cartId);
      })
      .then((cartPriceVal) => {
        cartPrice = cartPriceVal;
        return getWrappingPrice(cartId);
      })
      .then((wrappingPriceVal) => {
        wrappingPrice = wrappingPriceVal;
        return getDistance(placeId, restaurantId);
      })
      .then((distanceVal) => {
        distance = distanceVal;
      })
      .then(() => {
        const order = new Order({
          cart: cartId,
          orderNumber,
          restaurant: restaurantId,
          orderDate: new Date(dateString),

          status: orderStatus,
          realizationType,
          realizationTimeOption,
          realizationTime,

          price: {
            cartPrice,
            deliveryPrice,
            wrappingPrice,
            finalPrice: cartPrice + deliveryPrice + wrappingPrice
          },

          userData: {
            userId,
            name,
            surname,
            email,
            phone
          },

          deliveryData: {
            locality,
            street,
            postalCode,
            buildingNumber,
            localNumber,
            placeId,
            distance,
            deliveryPrice
          },

          payment: {
            status: false,
            paymentTypeValue,
            paymentTypeName
          },

          other: {
            additionalInfo,
            cutlery
          }
        });

        saveOrder(order);
      })
      .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  } else {
    let orderNumber;
    const orderStatus = getOrderStatus(paymentTypeValue);
    let cartPrice;
    let wrappingPrice;

    getOrderNumber()
      .then((orderNumberVal) => {
        console.log('orderNumber: ', orderNumberVal);
        orderNumber = orderNumberVal;
        return getCartPrice(cartId);
      })
      .then((cartPriceVal) => {
        console.log('cartPrice: ', cartPriceVal);
        cartPrice = cartPriceVal;
        return getWrappingPrice(cartId);
      })
      .then((wrappingPriceVal) => {
        console.log('wrappingPrice: ', wrappingPriceVal);
        wrappingPrice = wrappingPriceVal;
      })
      .then(() => {
        const order = new Order({
          cart: cartId,
          orderNumber,
          restaurant: restaurantId,
          orderDate: new Date(dateString),

          status: orderStatus,
          realizationType,
          realizationTimeOption,
          realizationTime,

          price: {
            cartPrice,
            deliveryPrice,
            wrappingPrice,
            finalPrice: cartPrice + deliveryPrice + wrappingPrice
          },

          userData: {
            userId,
            name,
            surname,
            email,
            phone
          },

          payment: {
            status: false,
            paymentTypeValue,
            paymentTypeName
          },

          other: {
            additionalInfo,
            cutlery
          }
        });

        saveOrder(order);
      })
      .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  }
};
