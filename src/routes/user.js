const express = require('express');
const { body } = require('express-validator');

const userController = require('../controllers/user');
const isAuth = require('../middleware/is-auth');
const isAdmin = require('../middleware/is-admin');
const isSuperAdmin = require('../middleware/is-superAdmin');

const router = express.Router();

// get specified user
router.get('/user/:userId', isAuth, userController.getUser);

// update specified user data
router.put('/user/:userId', isAuth, userController.updateUser);

// delete user
router.delete('/user/:userId', isAuth, userController.deleteUser);

// tests
router.get('/user/all', userController.allAccess);
router.get('/user/user', isAuth, userController.userBoard);
router.get('/user/admin', isAuth, isAdmin, userController.adminBoard);
router.get('/user/superAdmin', isAuth, isSuperAdmin, userController.superAdminBoard);

module.exports = router;
