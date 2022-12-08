const express = require('express');
const { body } = require('express-validator');

const restaurantAdminController = require('../../controllers/admin/restaurant');
const isAuth = require('../../middleware/is-auth');
const isAdmin = require('../../middleware/is-admin');
const isSuperAdmin = require('../../middleware/is-superAdmin');

const router = express.Router();

// get specified restaurant
router.get('/restaurant/:restaurantId', isAuth, isAdmin, restaurantAdminController.getRestaurant);

// get all restaurants: protected - admin, superadmin
router.get('/restaurants', isAuth, isAdmin, restaurantAdminController.getRestaurants);

// add restaurant
router.post('/restaurant', isAuth, isAdmin, restaurantAdminController.addRestaurant);

// update restaurant
router.put('/restaurant/:restaurantId', isAuth, isAdmin, restaurantAdminController.updateRestaurant);

// delete restaurant
router.delete('/restaurant/:restaurantId', isAuth, restaurantAdminController.deleteRestaurant);

module.exports = router;
