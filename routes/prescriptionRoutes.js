// routes/prescriptionRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const prescriptionController = require('../controllers/prescriptionController');

// Semua route memerlukan auth
router.use(authMiddleware);

// Route untuk resep
router.get('/', roleMiddleware('admin', 'doctor', 'patient'), prescriptionController.getPrescriptions);
router.get('/add', roleMiddleware('admin', 'doctor'), prescriptionController.showAddPrescription);
router.post('/add', roleMiddleware('admin', 'doctor'), prescriptionController.createPrescription);
router.get('/edit/:id', roleMiddleware('admin', 'doctor'), prescriptionController.showEditPrescription);
router.post('/update/:id', roleMiddleware('admin', 'doctor'), prescriptionController.updatePrescription);
router.put('/update/:id', roleMiddleware('admin', 'doctor'), prescriptionController.updatePrescription);
router.get('/delete/:id', roleMiddleware('admin', 'doctor'), prescriptionController.deletePrescription);
router.delete('/delete/:id', roleMiddleware('admin', 'doctor'), prescriptionController.deletePrescription);

module.exports = router;