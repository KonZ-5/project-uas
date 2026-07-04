// controllers/recordController.js
const db = require('../config/firebase');

// TAMPILKAN REKAM MEDIS
exports.getRecords = async (req, res) => {
    try {
        let query = db.collection('medical_records');

        if (req.user.role === 'doctor') {
            query = query.where('doctorEmail', '==', req.user.email);
        } else if (req.user.role === 'patient') {
            query = query.where('patientEmail', '==', req.user.email);
        }

        const snapshot = await query.get();
        const records = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.render('records/index', {
            records,
            user: req.user,
            userRole: req.user.role,
            title: 'Rekam Medis',
            dashboardLink: `/dashboard/${req.user.role}`,
            dashboardTitle: req.user.role,
            userName: req.user.name
        });

    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
};

// FORM TAMBAH
exports.showAddRecord = async (req, res) => {
    try {
        const patients = await db.collection('patients').get();

        res.render('records/form', {
            record: null,
            patients: patients.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })),
            user: req.user,
            title: 'Tambah Rekam Medis',
            dashboardLink: `/dashboard/${req.user.role}`,
            dashboardTitle: req.user.role,
            userName: req.user.name
        });

    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
};

// SIMPAN
exports.createRecord = async (req, res) => {
    try {
        await db.collection('medical_records').add({
            patientName: req.body.patientName,
            patientEmail: req.body.patientEmail,
            doctorName: req.user.name,
            doctorEmail: req.user.email,
            diagnosis: req.body.diagnosis,
            treatment: req.body.treatment || '',
            createdAt: new Date()
        });

        req.flash('success', 'Rekam medis berhasil ditambahkan');
        res.redirect('/records');

    } catch (error) {
        console.log(error);
        req.flash('error', 'Gagal menambahkan rekam medis');
        res.status(500).send(error.message);
    }
};

// FORM EDIT
exports.showEditRecord = async (req, res) => {
    try {
        const doc = await db
            .collection('medical_records')
            .doc(req.params.id)
            .get();

        if (!doc.exists) {
            req.flash('error', 'Data tidak ditemukan');
            return res.redirect('/records');
        }

        const patients = await db.collection('patients').get();

        res.render('records/form', {
            record: {
                id: doc.id,
                ...doc.data()
            },
            patients: patients.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })),
            user: req.user,
            title: 'Edit Rekam Medis',
            dashboardLink: `/dashboard/${req.user.role}`,
            dashboardTitle: req.user.role,
            userName: req.user.name
        });

    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
};

// UPDATE
exports.updateRecord = async (req, res) => {
    try {
        await db
            .collection('medical_records')
            .doc(req.params.id)
            .update({
                patientName: req.body.patientName,
                patientEmail: req.body.patientEmail,
                diagnosis: req.body.diagnosis,
                treatment: req.body.treatment || ''
            });

        req.flash('success', 'Rekam medis berhasil diupdate');
        res.redirect('/records');

    } catch (error) {
        console.log(error);
        req.flash('error', 'Gagal mengupdate rekam medis');
        res.status(500).send(error.message);
    }
};

// HAPUS
exports.deleteRecord = async (req, res) => {
    try {
        await db
            .collection('medical_records')
            .doc(req.params.id)
            .delete();

        req.flash('success', 'Rekam medis berhasil dihapus');
        res.redirect('/records');

    } catch (error) {
        console.log(error);
        req.flash('error', 'Gagal menghapus rekam medis');
        res.status(500).send(error.message);
    }
};

// PERIKSA DARI APPOINTMENT
exports.showCreateRecord = async (req, res) => {
    try {
        const appointment = await db
            .collection('appointments')
            .doc(req.params.id)
            .get();

        if (!appointment.exists) {
            req.flash('error', 'Appointment tidak ditemukan');
            return res.redirect('/appointments');
        }

        const data = appointment.data();

        const patients = await db.collection('patients').get();
        const patientList = patients.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Tambahkan patient dari appointment jika belum ada
        const existingPatient = patientList.find(p => p.name === data.patientName);
        if (!existingPatient) {
            patientList.push({
                name: data.patientName,
                email: data.patientEmail || ''
            });
        }

        res.render('records/form', {
            record: null,
            patients: patientList,
            user: req.user,
            title: 'Buat Rekam Medis dari Janji Temu',
            dashboardLink: `/dashboard/${req.user.role}`,
            dashboardTitle: req.user.role,
            userName: req.user.name
        });

    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
};