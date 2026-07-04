// routes/labRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const labController = require('../controllers/labController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Konfigurasi multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Lihat hasil lab
router.get('/', authMiddleware, labController.getLabs);

// Upload hasil lab (admin & doctor)
router.get('/upload', authMiddleware, roleMiddleware('admin', 'doctor'), labController.showUpload);
router.post('/upload', authMiddleware, roleMiddleware('admin', 'doctor'), upload.single('labFile'), labController.uploadLab);

// Hapus hasil lab
router.get('/delete/:id', authMiddleware, roleMiddleware('admin', 'doctor'), labController.deleteLab);

module.exports = router;