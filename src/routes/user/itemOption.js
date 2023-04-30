const express = require('express');

const itemOptionUserController = require('../../controllers/user/itemOption');

const router = express.Router();

// get all Item Categories
router.get('/itemsOptions/:restaurantId', itemOptionUserController.getItemOptions);

module.exports = router;
