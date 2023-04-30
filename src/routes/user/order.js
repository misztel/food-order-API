const express = require('express');

const orderUserController = require('../../controllers/user/order');

const router = express.Router();

// test area
router.post('/placeOrder', orderUserController.addOrder);

router.get('/getCords/:placeId', orderUserController.getCords);

router.get('/order/:orderId', orderUserController.getOrder);

module.exports = router;
