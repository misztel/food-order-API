const express = require('express');
const { body } = require('express-validator');

const restaurantInfoAdminController = require('../../controllers/admin/restaurantInfo');
const isAuth = require('../../middleware/is-auth');
const isAdmin = require('../../middleware/is-admin');
const isSuperAdmin = require('../../middleware/is-superAdmin');

const router = express.Router();

// get restaurant Info
router.get('/restaurantInfo/:restaurantId', isAuth, isAdmin, restaurantInfoAdminController.getRestaurantInfo);

// update Restaurant info
router.put('/restaurantInfo/:restaurantInfoId', isAuth, isAdmin, restaurantInfoAdminController.updateRestaurantInfo);

module.exports = router;
