const express = require('express');
const { body } = require('express-validator');

const itemOptionAdminController = require('../../controllers/admin/itemOption');
const isAuth = require('../../middleware/is-auth');
const isAdmin = require('../../middleware/is-admin');
const isSuperAdmin = require('../../middleware/is-superAdmin');

const router = express.Router();

// add item option
router.post('/itemOption', isAuth, isAdmin, itemOptionAdminController.addItemOption);

// delete item option
router.delete('/itemOption/:itemOptionId', isAuth, isAdmin, itemOptionAdminController.deleteItemOption);

// get items options
router.get('/itemOptions/:restaurantId', isAuth, isAdmin, itemOptionAdminController.getItemOptions);

// update item option
router.put('/itemOption/:itemOptionId', isAuth, isAdmin, itemOptionAdminController.updateItemOption);

module.exports = router;
