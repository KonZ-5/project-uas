// routes/statisticsRoutes.js
const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Hanya admin yang bisa melihat statistik
router.get('/', authMiddleware, roleMiddleware('admin'), statisticsController.showStatistics);

module.exports = router;