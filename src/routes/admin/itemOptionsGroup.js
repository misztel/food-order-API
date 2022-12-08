const express = require('express');
const { body } = require('express-validator');

const itemOptionsGroupAdminController = require('../../controllers/admin/itemOptionsGroup');
const isAuth = require('../../middleware/is-auth');
const isAdmin = require('../../middleware/is-admin');
const isSuperAdmin = require('../../middleware/is-superAdmin');

const router = express.Router();

// add category
router.post('/itemOptionsGroup', isAuth, isAdmin, itemOptionsGroupAdminController.addItemOptionsGroup);

// delete category
router.delete('/itemOptionsGroup/:itemOptionsGroupId', isAuth, isAdmin, itemOptionsGroupAdminController.deleteItemOptionsGroup);
