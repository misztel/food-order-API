const express = require('express');
const { body } = require('express-validator');

const hourUserController = require('../../controllers/user/hours');
const isAuth = require('../../middleware/is-auth');
const isAdmin = require('../../middleware/is-admin');
const isSuperAdmin = require('../../middleware/is-superAdmin');

const router = express.Router();

// get specified user
router.get('/isopen/:restaurantId', hourUserController.isOpen);

module.exports = router;
