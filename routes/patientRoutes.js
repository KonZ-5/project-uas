// routes/patientRoutes.js
const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Semua route memerlukan auth
router.use(authMiddleware);

// Hanya admin yang bisa manage pasien
router.get('/', roleMiddleware('admin', 'doctor', 'patient'), patientController.getPatients);
router.get('/add', roleMiddleware('admin'), patientController.showAddPatient);
router.post('/add', roleMiddleware('admin'), patientController.createPatient);
router.get('/edit/:id', roleMiddleware('admin'), patientController.showEditPatient);
router.put('/edit/:id', roleMiddleware('admin'), patientController.updatePatient);
router.post('/edit/:id', roleMiddleware('admin'), patientController.updatePatient);
router.get('/delete/:id', roleMiddleware('admin'), patientController.deletePatient);
router.delete('/delete/:id', roleMiddleware('admin'), patientController.deletePatient);

module.exports = router;