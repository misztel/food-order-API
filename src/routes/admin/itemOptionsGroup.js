const express = require('express');
const { body } = require('express-validator');

const itemOptionsGroupAdminController = require('../../controllers/admin/itemOptionsGroup');
const isAuth = require('../../middleware/is-auth');
const isAdmin = require('../../middleware/is-admin');
const isSuperAdmin = require('../../middleware/is-superAdmin');

const router = express.Router();

// get item options group
router.get('/itemOptionsGroup/:restaurantId', isAuth, isAdmin, itemOptionsGroupAdminController.getItemOptionsGroup);

// add item options group
router.post('/itemOptionsGroup', isAuth, isAdmin, itemOptionsGroupAdminController.addItemOptionsGroup);

// delete item options group
router.delete('/itemOptionsGroup/:itemOptionsGroupId', isAuth, isAdmin, itemOptionsGroupAdminController.deleteItemOptionsGroup);

// update item options group
router.put('/itemOptionsGroup/:itemOptionsGroupId', isAuth, isAdmin, itemOptionsGroupAdminController.updateItemOptionsGroup);

module.exports = router;
