const express = require('express');

const itemCategoryUserController = require('../../controllers/user/itemCategory');

const router = express.Router();

// get all Item Categories
router.get('/itemCategories/:restaurantId', itemCategoryUserController.getItemCategories);

module.exports = router;
