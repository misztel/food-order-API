const express = require('express');
const { body } = require('express-validator');

const itemCategoryAdminController = require('../../controllers/admin/itemCategory');
const isAuth = require('../../middleware/is-auth');
const isAdmin = require('../../middleware/is-admin');
const isSuperAdmin = require('../../middleware/is-superAdmin');

const router = express.Router();

// get all Categories
router.get('/itemCategories/:restaurantId', isAuth, isAdmin, itemCategoryAdminController.getItemCategories);

// add category
router.post('/itemCategory', isAuth, isAdmin, itemCategoryAdminController.addItemCategory);

// update category
router.put('/itemCategory/:itemCategoryId', isAuth, isAdmin, itemCategoryAdminController.updateItemCategory);

// delete category
router.delete('/itemCategory/:itemCategoryId', isAuth, isAdmin, itemCategoryAdminController.deleteItemCategory);

module.exports = router;
