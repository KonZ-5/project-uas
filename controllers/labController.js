// controllers/labController.js
const db = require('../config/firebase');
const path = require('path');

// LIHAT HASIL LAB
exports.getLabs = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect('/auth/login');
        }

        let query = db.collection('lab_results');

        if (req.user.role === 'doctor') {
            query = query.where('doctorEmail', '==', req.user.email);
        } else if (req.user.role === 'patient') {
            query = query.where('patientEmail', '==', req.user.email);
        }

        const snapshot = await query.get();
        const labs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.render('labs/index', {
            labs,
            user: req.user,
            userRole: req.user.role,
            title: 'Hasil Laboratorium',
            dashboardLink: `/dashboard/${req.user.role}`,
            dashboardTitle: req.user.role,
            userName: req.user.name
        });

    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
};

// FORM UPLOAD
exports.showUpload = async (req, res) => {
    try {
        const patients = await db.collection('patients').get();

        res.render('labs/upload', {
            patients: patients.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })),
            user: req.user,
            userRole: req.user.role,
            title: 'Upload Hasil Lab',
            dashboardLink: `/dashboard/${req.user.role}`,
            dashboardTitle: req.user.role,
            userName: req.user.name
        });

    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
};

// UPLOAD HASIL LAB
exports.uploadLab = async (req, res) => {
    try {
        // Cek file
        if (!req.file) {
            return res.status(400).send('File harus diupload');
        }

        await db.collection('lab_results').add({
            patientName: req.body.patientName,
            patientEmail: req.body.patientEmail,
            doctorName: req.user.name,
            doctorEmail: req.user.email,
            fileName: req.file.filename,
            originalName: req.file.originalname,
            filePath: req.file.path,
            createdAt: new Date()
        });

        req.flash('success', 'Hasil lab berhasil diupload');
        res.redirect('/labs');

    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
};

// HAPUS HASIL LAB
exports.deleteLab = async (req, res) => {
    try {
        const doc = await db.collection('lab_results')
            .doc(req.params.id)
            .get();
        
        if (!doc.exists) {
            req.flash('error', 'Data tidak ditemukan');
            return res.redirect('/labs');
        }

        const lab = doc.data();

        // Dokter hanya bisa hapus lab sendiri
        if (req.user.role === 'doctor' && lab.doctorEmail !== req.user.email) {
            return res.status(403).send('Anda hanya bisa menghapus lab yang Anda upload');
        }

        await db.collection('lab_results')
            .doc(req.params.id)
            .delete();

        req.flash('success', 'Hasil lab berhasil dihapus');
        res.redirect('/labs');

    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
};