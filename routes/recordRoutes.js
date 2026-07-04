// routes/recordRoutes.js
const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Semua route memerlukan autentikasi
router.use(authMiddleware);

// Routes untuk rekam medis
router.get('/', recordController.getRecords);
router.get('/add', roleMiddleware('admin', 'doctor'), recordController.showAddRecord);
router.post('/add', roleMiddleware('admin', 'doctor'), recordController.createRecord);
router.get('/edit/:id', roleMiddleware('admin', 'doctor'), recordController.showEditRecord);
router.post('/update/:id', roleMiddleware('admin', 'doctor'), recordController.updateRecord);
router.put('/update/:id', roleMiddleware('admin', 'doctor'), recordController.updateRecord);
router.get('/delete/:id', roleMiddleware('admin', 'doctor'), recordController.deleteRecord);
router.delete('/delete/:id', roleMiddleware('admin', 'doctor'), recordController.deleteRecord);
router.get('/from-appointment/:id', roleMiddleware('admin', 'doctor'), recordController.showCreateRecord);

module.exports = router;