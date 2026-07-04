// routes/doctorRoutes.js
const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Semua route memerlukan auth
router.use(authMiddleware);

// Hanya admin yang bisa manage dokter
router.get('/', roleMiddleware('admin', 'doctor', 'patient'), doctorController.getDoctors);
router.get('/add', roleMiddleware('admin'), doctorController.showAddDoctor);
router.post('/add', roleMiddleware('admin'), doctorController.createDoctor);
router.get('/edit/:id', roleMiddleware('admin'), doctorController.showEditDoctor);
router.put('/edit/:id', roleMiddleware('admin'), doctorController.updateDoctor);
router.post('/edit/:id', roleMiddleware('admin'), doctorController.updateDoctor);
router.get('/delete/:id', roleMiddleware('admin'), doctorController.deleteDoctor);
router.delete('/delete/:id', roleMiddleware('admin'), doctorController.deleteDoctor);

module.exports = router;