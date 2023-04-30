const express = require('express');
const { body } = require('express-validator');

const hourAdminController = require('../../controllers/admin/hours');
const isAuth = require('../../middleware/is-auth');
const isAdmin = require('../../middleware/is-admin');
const isSuperAdmin = require('../../middleware/is-superAdmin');

const router = express.Router();

// get specified user
router.get('/hours/:restaurantId', isAuth, isAdmin, hourAdminController.getHours);

// get all users: protected - admin, superadmin
router.put('/hours', isAuth, isAdmin, hourAdminController.updateHours);

module.exports = router;
