// controllers/patientController.js
const db = require('../config/firebase');

// TAMPILKAN PASIEN
exports.getPatients = async (req, res) => {
    try {
        const keyword = (req.query.search || '').toLowerCase();
        const snapshot = await db.collection('patients').get();
        let patients = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Filter keyword
        if (keyword) {
            patients = patients.filter(patient => {
                return patient.name && patient.name.toLowerCase().includes(keyword);
            });
        }

        // Pasien hanya melihat dirinya sendiri
        if (req.user.role === 'patient') {
            patients = patients.filter(p => p.email === req.user.email);
        }

        res.render('patients/index', {
            patients,
            keyword,
            user: req.user,
            userRole: req.user.role,
            title: 'Daftar Pasien',
            dashboardLink: `/dashboard/${req.user.role}`,
            dashboardTitle: req.user.role,
            userName: req.user.name
        });

    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
};

// FORM TAMBAH PASIEN
exports.showAddPatient = (req, res) => {
    res.render('patients/form', {
        patient: null,
        user: req.user,
        userRole: req.user.role,
        title: 'Tambah Pasien',
        dashboardLink: `/dashboard/${req.user.role}`,
        dashboardTitle: req.user.role,
        userName: req.user.name
    });
};

// SIMPAN PASIEN
exports.createPatient = async (req, res) => {
    try {
        await db.collection('patients').add({
            name: req.body.name,
            nik: req.body.nik || '',
            birthDate: req.body.birthDate || '',
            address: req.body.address || '',
            phone: req.body.phone || '',
            email: req.body.email || '',
            createdAt: new Date()
        });

        req.flash('success', 'Pasien berhasil ditambahkan');
        res.redirect('/patients');

    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
};

// FORM EDIT PASIEN
exports.showEditPatient = async (req, res) => {
    try {
        const doc = await db.collection('patients')
            .doc(req.params.id)
            .get();

        if (!doc.exists) {
            req.flash('error', 'Pasien tidak ditemukan');
            return res.redirect('/patients');
        }

        res.render('patients/form', {
            patient: {
                id: doc.id,
                ...doc.data()
            },
            user: req.user,
            userRole: req.user.role,
            title: 'Edit Pasien',
            dashboardLink: `/dashboard/${req.user.role}`,
            dashboardTitle: req.user.role,
            userName: req.user.name
        });

    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
};

// UPDATE PASIEN
exports.updatePatient = async (req, res) => {
    try {
        await db.collection('patients')
            .doc(req.params.id)
            .update({
                name: req.body.name,
                nik: req.body.nik || '',
                birthDate: req.body.birthDate || '',
                address: req.body.address || '',
                phone: req.body.phone || '',
                email: req.body.email || ''
            });

        req.flash('success', 'Pasien berhasil diupdate');
        res.redirect('/patients');

    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
};

// HAPUS PASIEN
exports.deletePatient = async (req, res) => {
    try {
        await db.collection('patients')
            .doc(req.params.id)
            .delete();

        req.flash('success', 'Pasien berhasil dihapus');
        res.redirect('/patients');

    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
};