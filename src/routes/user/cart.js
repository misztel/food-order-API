const express = require('express');

const cartUserController = require('../../controllers/user/cart');

const router = express.Router();

// Create new Cart
router.post('/cart', cartUserController.addCart);

// Add Product to cart
router.put('/cart/addtocart/:cartId', cartUserController.addToCart);

// Increment product quantity
// router.put('/cart/incrementquantity/:cartId', cartUserController.incrementQuantity);

// Decrement product quantity
router.put('/cart/decrementquantity/:cartId', cartUserController.decrementQuantity);

// Remove product from cart
router.put('/cart/removefromcart/:cartId', cartUserController.removeFromCart);

// Delete cart (on clear cart)
router.delete('/cart/:cartId', cartUserController.deleteCart);

// Get Cart
router.get('/cart/:cartId/:restaurantId', cartUserController.getCart);

module.exports = router;
