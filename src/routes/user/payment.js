const express = require('express');

const paymentUserController = require('../../controllers/user/payment');

const router = express.Router();

router.get('/paymentToken', paymentUserController.getPaymentToken);

router.get('/paymentMethods/:paymentToken', paymentUserController.getPaymentMethods);

router.post('/payment', paymentUserController.payment);

router.post('/paymentStatus', paymentUserController.paymentStatus);

module.exports = router;
