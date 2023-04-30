const { json } = require('body-parser');
const { validationResult } = require('express-validator');

const Cart = require('../../models/cart');

const wrapPrice = 1;
const minAmount = 0;
const maxAmount = 20;

exports.addCart = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const {
    restaurantId,
    userId,
    product,
    options
  } = req.body;

  const products = [];
  product.product = product._id;
  if (options) {
    product.options = options;
  } else {
    product.options = [];
  }
  products.push(product);

  const productPrice = products.reduce((acc, item) => acc + item.price, 0);

  const wrappingPrice = products.reduce((acc, item) => {
    if (item.wrapping) {
      return acc + wrapPrice;
    }
    return acc;
  }, 0);

  const fullPrice = productPrice + wrappingPrice;

  const cart = new Cart({
    restaurantId,
    userId,
    products,
    productPrice,
    wrappingPrice,
    fullPrice
  });

  cart.save()
    .then((newCart) => {
      Cart.findById(newCart._id)
        .populate('products.product')
        .populate('products.options.optionGroup')
        .populate('products.options.option')
        .then((data) => {
          res.status(201).json({
            message: 'New Cart Created',
            cart: data
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

exports.getCart = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const { cartId, restaurantId } = req.params;

  Cart.findById(cartId)
    .populate('products.product')
    .populate('products.options.optionGroup')
    .populate('products.options.option')
    .then((item) => {
      if (!item) {
        const error = new Error('Could not find Cart');
        error.statusCode = 404;
        throw error;
      }
      return item;
    })
    .then((cart) => {
      if (cart.restaurantId === restaurantId) {
        res.status(200).json({
          message: 'Cart fetched successfully',
          cart,
          rightRestaurant: true
        });
      } else {
        Cart.findByIdAndRemove({ _id: cartId }, (err) => {
          if (err) {
            const error = new Error('Could not delete Cart');
            error.statusCode = 404;
            throw error;
          }
          res.status(200).json({
            message: 'Cart doesnt exist in this restaurant',
            rightRestaurant: false
          });
        });
      }
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// Add product to cart
exports.addToCart = (req, res, next) => {
  const { cartId } = req.params;

  const { product, options } = req.body;

  Cart.findById(cartId)
    .populate('products.product')
    .populate('products.options.optionGroup')
    .populate('products.options.option')
    .then((cart) => {
      if (!cart) {
        const error = new Error('Could not find Cart');
        error.statusCode = 404;
        throw error;
      }

      const newProduct = {};

      newProduct.product = product._id;
      if (options) {
        newProduct.options = options;
      } else {
        newProduct.options = [];
      }

      cart.products = [newProduct, ...cart.products];

      return cart.save();
    })
    .then((newCart) => {
      Cart.findById(newCart._id)
        .populate('products.product')
        .populate('products.options.optionGroup')
        .populate('products.options.option')
        .then((updatedCart) => {
          // UPDATE PRICES
          const productPrice = updatedCart.products.reduce((acc, item) => (
            acc + item.product.price
          ), 0);

          const wrappingPrice = updatedCart.products.reduce((acc, item) => {
            if (item.product.wrapping) {
              return acc + wrapPrice;
            }
            return acc;
          }, 0);

          const fullPrice = productPrice + wrappingPrice;

          updatedCart.productPrice = productPrice;
          updatedCart.wrappingPrice = wrappingPrice;
          updatedCart.fullPrice = fullPrice;

          return updatedCart.save();
        })
        .then((data) => {
          res.status(201).json({
            message: 'Cart Updated',
            cart: data
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

// Increment product Quantity
// exports.incrementQuantity = (req, res, next) => {
//   const { cartId } = req.params;

//   const { productId } = req.body;

//   Cart.findById(cartId)
//     .then((cart) => {
//       if (!cart) {
//         const error = new Error('Could not find cart');
//         error.statusCode = 404;
//         throw error;
//       }

//       const { quantity } = cart.products.filter((item) => (item.id === productId ? item : null))[0];

//       const newQuantity = quantity + 1;

//       Cart.findOneAndUpdate(
//         { _id: cartId, 'products._id': productId },
//         { $set: { 'products.$.quantity': newQuantity } },
//         { new: true }
//       )
//         .populate('products.product')
//         .then((newCart) => {
//           Cart.findById(newCart._id).populate('products.product')
//             .then((updatedCart) => {
//               // UPDATE PRICES
//               const productPrice = updatedCart.products.reduce((acc, item) => (
//                 acc + (item.product.price * item.quantity)
//               ), 0);

//               const wrappingPrice = updatedCart.products.reduce((acc, item) => {
//                 if (item.product.wrapping) {
//                   return acc + (wrapPrice * item.quantity);
//                 }
//                 return acc;
//               }, 0);

//               const fullPrice = productPrice + wrappingPrice;

//               updatedCart.productPrice = productPrice;
//               updatedCart.wrappingPrice = wrappingPrice;
//               updatedCart.fullPrice = fullPrice;

//               return updatedCart.save();
//             })
//             .then((data) => {
//               res.status(201).json({
//                 message: 'Cart Updated',
//                 cart: data
//               });
//             });
//         });
//     })
//     .catch((err) => {
//       if (!err.statusCode) {
//         err.statusCode = 500;
//       }
//       next(err);
//     });
// };

// Decrement product Quantity
exports.decrementQuantity = (req, res, next) => {
  const { cartId } = req.params;

  const { productId } = req.body;

  Cart.findById(cartId)
    .then((cart) => {
      if (!cart) {
        const error = new Error('Could not find cart');
        error.statusCode = 404;
        throw error;
      }

      const { quantity } = cart.products.filter((item) => (item.id === productId ? item : null))[0];

      const newQuantity = quantity - 1;

      if (newQuantity <= minAmount) {
        console.log(newQuantity);
        Cart.findOneAndUpdate(
          { _id: cartId },
          // eslint-disable-next-line quote-props
          { $pull: { 'products': { '_id': productId } } },
          { safe: true, multi: true, new: true }
        )
          .populate('products.product')
          .then((newCart) => {
            Cart.findById(newCart._id).populate('products.product')
              .then((updatedCart) => {
                // UPDATE PRICES
                const productPrice = updatedCart.products.reduce((acc, item) => (
                  acc + (item.product.price * item.quantity)
                ), 0);

                const wrappingPrice = updatedCart.products.reduce((acc, item) => {
                  if (item.product.wrapping) {
                    return acc + (wrapPrice * item.quantity);
                  }
                  return acc;
                }, 0);

                const fullPrice = productPrice + wrappingPrice;

                updatedCart.productPrice = productPrice;
                updatedCart.wrappingPrice = wrappingPrice;
                updatedCart.fullPrice = fullPrice;

                return updatedCart.save();
              })
              .then((data) => {
                res.status(201).json({
                  message: 'Cart Updated',
                  cart: data
                });
              });
          });
      } else if (newQuantity > minAmount) {
        Cart.findOneAndUpdate(
          { _id: cartId, 'products._id': productId },
          { $set: { 'products.$.quantity': newQuantity } },
          { new: true }
        )
          .populate('products.product')
          .then((newCart) => {
            Cart.findById(newCart._id).populate('products.product')
              .then((updatedCart) => {
                // UPDATE PRICES
                const productPrice = updatedCart.products.reduce((acc, item) => (
                  acc + item.product.price
                ), 0);

                const wrappingPrice = updatedCart.products.reduce((acc, item) => {
                  if (item.product.wrapping) {
                    return acc + wrapPrice;
                  }
                  return acc;
                }, 0);

                const fullPrice = productPrice + wrappingPrice;

                updatedCart.productPrice = productPrice;
                updatedCart.wrappingPrice = wrappingPrice;
                updatedCart.fullPrice = fullPrice;

                return updatedCart.save();
              })
              .then((data) => {
                res.status(201).json({
                  message: 'Cart Updated',
                  cart: data
                });
              });
          });
      }
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// Remove product from cart
exports.removeFromCart = (req, res, next) => {
  const { cartId } = req.params;

  const { productsIds } = req.body;

  Cart.findById(cartId)
    .then((cart) => {
      if (!cart) {
        const error = new Error('Could not find cart');
        error.statusCode = 404;
        throw error;
      }

      Cart.findOneAndUpdate(
        { _id: cartId },
        // eslint-disable-next-line quote-props
        { $pull: { 'products': { '_id': { $in: productsIds } } } },
        { safe: true, multi: true, new: true }
      )
        .populate('products.product')
        .then((newCart) => {
          Cart.findById(newCart._id).populate('products.product')
            .then((updatedCart) => {
              // UPDATE PRICES
              const productPrice = updatedCart.products.reduce((acc, item) => (
                acc + item.product.price
              ), 0);

              const wrappingPrice = updatedCart.products.reduce((acc, item) => {
                if (item.product.wrapping) {
                  return acc + wrapPrice;
                }
                return acc;
              }, 0);

              const fullPrice = productPrice + wrappingPrice;

              updatedCart.productPrice = productPrice;
              updatedCart.wrappingPrice = wrappingPrice;
              updatedCart.fullPrice = fullPrice;

              return updatedCart.save();
            })
            .then((data) => {
              Cart.findById(data._id)
                .populate('products.product')
                .populate('products.options.optionGroup')
                .populate('products.options.option')
                .then((updatedCart) => {
                  res.status(201).json({
                    message: 'Cart Updated',
                    cart: updatedCart
                  });
                })
                .catch((err) => {
                  if (!err.statusCode) {
                    err.statusCode = 500;
                  }
                  next(err);
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

// delete cart
exports.deleteCart = (req, res, next) => {
  const { cartId } = req.params;

  Cart.findOneAndDelete({ _id: cartId })
    .then(() => {
      res.status(201).json({
        message: 'Cart Delete Successfully'
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
