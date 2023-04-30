const express = require('express');
const { body } = require('express-validator');

const itemAdminController = require('../../controllers/admin/item');
const isAuth = require('../../middleware/is-auth');
const isAdmin = require('../../middleware/is-admin');
const isSuperAdmin = require('../../middleware/is-superAdmin');

const router = express.Router();

// get all items
router.get('/items/:restaurantId', isAuth, isAdmin, itemAdminController.getItems);

// get specific item
router.get('/item/:menuItemId', isAuth, isAdmin, itemAdminController.getItem);

// add item
router.post('/item', isAuth, isAdmin, itemAdminController.addItem);

// update item
router.put('/item/:itemId', isAuth, isAdmin, itemAdminController.updateItem);

// update items order
router.put('/items', isAuth, isAdmin, itemAdminController.updateItemsOrder);

// delete item
router.delete('/item/:itemId', isAuth, isAdmin, itemAdminController.deleteItem);

module.exports = router;
