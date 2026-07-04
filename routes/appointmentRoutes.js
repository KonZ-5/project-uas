// routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Semua route memerlukan autentikasi
router.use(authMiddleware);

// Routes untuk janji temu
router.get('/', appointmentController.getAppointments);
router.get('/add', appointmentController.showAddAppointment);
router.post('/add', appointmentController.createAppointment);
router.get('/edit/:id', appointmentController.showEditAppointment);

// Gunakan PUT untuk update (dengan method-override)
router.put('/update/:id', appointmentController.updateAppointment);
// Juga support POST untuk kompatibilitas
router.post('/update/:id', appointmentController.updateAppointment);

// Route untuk approve, cancel, delete
router.get('/approve/:id', roleMiddleware('admin', 'doctor'), appointmentController.approveAppointment);
router.get('/cancel/:id', roleMiddleware('admin', 'doctor'), appointmentController.cancelAppointment);
router.get('/delete/:id', roleMiddleware('admin', 'doctor'), appointmentController.deleteAppointment);

// Support DELETE method
router.delete('/delete/:id', roleMiddleware('admin', 'doctor'), appointmentController.deleteAppointment);

module.exports = router;