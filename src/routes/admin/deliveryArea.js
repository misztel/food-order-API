const express = require('express');
const { body } = require('express-validator');

const deliveryAreaAdminController = require('../../controllers/admin/deliveryArea');
const isAuth = require('../../middleware/is-auth');
const isAdmin = require('../../middleware/is-admin');

const router = express.Router();

// get delivery areas for restaurant
router.get('/deliveryAreas/:restaurantId', isAuth, isAdmin, deliveryAreaAdminController.getDeliveryAreas);

// add delivery area
router.post('/deliveryArea', isAuth, isAdmin, deliveryAreaAdminController.addDeliveryArea);

router.delete('/deliveryArea/:deliveryAreaId', isAuth, isAdmin, deliveryAreaAdminController.deleteDeliveryArea);

// update Delivery Area Type
router.put('/updateAreaType/:deliveryAreaId', isAuth, isAdmin, deliveryAreaAdminController.updateDeliveryAreaType);

// add Circle Area
router.post('/addCircleArea', isAuth, isAdmin, deliveryAreaAdminController.addCircleArea);

// delete delivery area Item
router.delete('/deleteDeliveryAreaItem/:deliveryAreaItemId', isAuth, isAdmin, deliveryAreaAdminController.deleteDeliveryAreaItem);

router.post('/addPolygonArea', isAuth, isAdmin, deliveryAreaAdminController.addPolygonArea);

router.put('/updatePolygonArea/:deliveryAreaItemId', isAuth, isAdmin, deliveryAreaAdminController.updatePolygonArea);

router.post('/checkDelivery', isAuth, isAdmin, deliveryAreaAdminController.checkDelivery);

module.exports = router;
