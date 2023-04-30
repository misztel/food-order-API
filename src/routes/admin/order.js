const express = require('express');
const { body } = require('express-validator');

const orderAdminController = require('../../controllers/admin/order');
const isAuth = require('../../middleware/is-auth');
const isAdmin = require('../../middleware/is-admin');
const isSuperAdmin = require('../../middleware/is-superAdmin');

const router = express.Router();

router.get('/orders/:date', isAuth, isAdmin, orderAdminController.getOrders);

router.get('/order/:orderId', isAuth, isAdmin, orderAdminController.getOrder);

router.put('/order', isAuth, isAdmin, orderAdminController.updateOrderStatus);

module.exports = router;
