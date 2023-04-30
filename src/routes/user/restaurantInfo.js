const express = require('express');
const { body } = require('express-validator');

const restaurantInfoController = require('../../controllers/user/restaurantInfo');
const isAuth = require('../../middleware/is-auth');
const isAdmin = require('../../middleware/is-admin');
const isSuperAdmin = require('../../middleware/is-superAdmin');

const router = express.Router();

// get restaurant Info
router.get('/restaurantInfo/:restaurantId', restaurantInfoController.getRestaurantInfo);

module.exports = router;
