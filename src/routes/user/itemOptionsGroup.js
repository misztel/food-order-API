const express = require('express');

const itemOptionsGroupsUserController = require('../../controllers/user/itemOptionsGroups');

const router = express.Router();

// get all Item Categories
router.get('/itemOptionsGroups/:restaurantId', itemOptionsGroupsUserController.getItemOptionsGroup);

module.exports = router;
