const { json } = require('body-parser');
const { validationResult } = require('express-validator');

const Cart = require('../../models/cart');

const wrapPrice = 1.5;
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
    product
  } = req.body;

  const products = [];
  product.quantity = 1;
  product.product = product._id;
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
      Cart.findById(newCart._id).populate('products.product')
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

  Cart.findById(cartId).populate('products.product').then((item) => {
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

  const { product } = req.body;

  Cart.findById(cartId).populate('products.product').then((cart) => {
    if (!cart) {
      const error = new Error('Could not find Cart');
      error.statusCode = 404;
      throw error;
    }

    let newProduct = {};

    // check if product exist in cart

    const existingProduct = cart.products.filter((item) => (item.product.id === product._id ? item : null));
    if (existingProduct.length > 0) {
      // eslint-disable-next-line prefer-destructuring
      newProduct = existingProduct[0];
      newProduct.quantity += 1;

      const newProducts = cart.products.filter((item) => (item.product.id !== product._id ? item : null));
      cart.products = [newProduct, ...newProducts];
      return cart.save();
      // eslint-disable-next-line no-else-return
    } else {
      newProduct.product = product._id;
      newProduct.quantity = 1;
      newProduct.options = [];

      cart.products = [newProduct, ...cart.products];

      return cart.save();
    }
  })
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
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// Increment product Quantity
exports.incrementQuantity = (req, res, next) => {
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

      const newQuantity = quantity + 1;

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
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

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

  const { productId } = req.body;

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
