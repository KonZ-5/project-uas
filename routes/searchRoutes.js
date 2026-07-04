// routes/searchRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/firebase');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, async (req, res) => {
    const keyword = req.query.keyword ? req.query.keyword.toLowerCase().trim() : '';

    if (!keyword) {
        return res.redirect('/dashboard');
    }

    try {
        // Cari di patients
        let patients = await db.collection('patients').get();
        for (const doc of patients.docs) {
            const data = doc.data();
            if (data.name && data.name.toLowerCase().includes(keyword)) {
                req.flash('info', `Hasil ditemukan: ${data.name}`);
                return res.redirect('/patients');
            }
        }

        // Cari di doctors
        let doctors = await db.collection('doctors').get();
        for (const doc of doctors.docs) {
            const data = doc.data();
            if (data.name && data.name.toLowerCase().includes(keyword)) {
                req.flash('info', `Hasil ditemukan: ${data.name}`);
                return res.redirect('/doctors');
            }
        }

        // Cari di appointments
        let appointments = await db.collection('appointments').get();
        for (const doc of appointments.docs) {
            const data = doc.data();
            if (data.patientName && data.patientName.toLowerCase().includes(keyword)) {
                req.flash('info', `Hasil ditemukan untuk: ${data.patientName}`);
                return res.redirect('/appointments');
            }
        }

        // Cari di medical_records
        let records = await db.collection('medical_records').get();
        for (const doc of records.docs) {
            const data = doc.data();
            if (data.patientName && data.patientName.toLowerCase().includes(keyword)) {
                req.flash('info', `Hasil ditemukan untuk: ${data.patientName}`);
                return res.redirect('/records');
            }
        }

        // Cari di prescriptions
        let prescriptions = await db.collection('prescriptions').get();
        for (const doc of prescriptions.docs) {
            const data = doc.data();
            if (data.patientName && data.patientName.toLowerCase().includes(keyword)) {
                req.flash('info', `Hasil ditemukan untuk: ${data.patientName}`);
                return res.redirect('/prescriptions');
            }
        }

        req.flash('error', `Data "${keyword}" tidak ditemukan.`);
        return res.redirect('/dashboard');

    } catch (error) {
        console.log(error);
        req.flash('error', 'Terjadi kesalahan saat mencari');
        return res.redirect('/dashboard');
    }
});

module.exports = router;