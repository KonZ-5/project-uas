// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route GET
router.get('/login', authController.showLogin);
router.get('/register', authController.showRegister);
router.get('/logout', authController.logout);

// Route POST
router.post('/login', authController.login);
router.post('/register', authController.register);

module.exports = router;