const express = require('express');
const { body } = require('express-validator');

const itemAdminController = require('../../controllers/admin/item');
const isAuth = require('../../middleware/is-auth');
const isAdmin = require('../../middleware/is-admin');
const isSuperAdmin = require('../../middleware/is-superAdmin');

const router = express.Router();

// get all itemss
router.get('/items', isAuth, isAdmin, itemAdminController.getItems);

// add item
router.post('/item', isAuth, isAdmin, itemAdminController.addItem);

// update item
router.put('/item/:itemId', isAuth, isAdmin, itemAdminController.updateItem);

// delete item
router.delete('/item/:itemId', isAuth, isAdmin, itemAdminController.deleteItem);
