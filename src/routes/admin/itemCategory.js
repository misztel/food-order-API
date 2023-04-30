const express = require('express');
const { body } = require('express-validator');

const itemCategoryAdminController = require('../../controllers/admin/itemCategory');
const isAuth = require('../../middleware/is-auth');
const isAdmin = require('../../middleware/is-admin');
const isSuperAdmin = require('../../middleware/is-superAdmin');

const router = express.Router();

// get all Categories
router.get('/itemCategories/:restaurantId', isAuth, isAdmin, itemCategoryAdminController.getItemCategories);

// get single category
router.get('/itemCategory/:itemCategoryId', isAuth, isAdmin, itemCategoryAdminController.getItemCategory);

// add category
router.post('/itemCategory', isAuth, isAdmin, itemCategoryAdminController.addItemCategory);

// update category
router.put('/itemCategory/:itemCategoryId', isAuth, isAdmin, itemCategoryAdminController.updateItemCategory);

// update item categories order
router.put('/itemCategories', isAuth, isAdmin, itemCategoryAdminController.updateItemCategoriesOrder);

// delete category
router.delete('/itemCategory/:itemCategoryId', isAuth, isAdmin, itemCategoryAdminController.deleteItemCategory);

module.exports = router;
