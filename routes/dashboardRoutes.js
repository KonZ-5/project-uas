// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

// Semua dashboard memerlukan auth
router.use(authMiddleware);

// Dashboard berdasarkan role
router.get('/admin', dashboardController.adminDashboard);
router.get('/doctor', dashboardController.doctorDashboard);
router.get('/patient', dashboardController.patientDashboard);

// Redirect /dashboard ke dashboard user
router.get('/', (req, res) => {
    if (req.user) {
        res.redirect(`/dashboard/${req.user.role}`);
    } else {
        res.redirect('/auth/login');
    }
});

module.exports = router;