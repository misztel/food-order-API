const express = require('express');

const deliveryUserController = require('../../controllers/user/delivery');

const router = express.Router();

router.post('/checkDelivery', deliveryUserController.checkDelivery);

module.exports = router;
