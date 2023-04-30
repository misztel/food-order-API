const express = require('express');

const restaurantUserController = require('../../controllers/user/restaurant');

const router = express.Router();

// get all Items
router.get('/restaurants', restaurantUserController.getRestaurants);

module.exports = router;
