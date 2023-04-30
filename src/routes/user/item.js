const express = require('express');

const itemUserController = require('../../controllers/user/item');

const router = express.Router();

// get all Items
router.get('/items/:restaurantId', itemUserController.getItems);

module.exports = router;
