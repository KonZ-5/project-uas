// controllers/prescriptionController.js
const db = require('../config/firebase');

// Menampilkan semua resep
exports.getPrescriptions = async (req, res) => {
    try {
        let query = db.collection('prescriptions');

        if (req.user.role === 'doctor') {
            query = query.where('doctorEmail', '==', req.user.email);
        } else if (req.user.role === 'patient') {
            query = query.where('patientEmail', '==', req.user.email);
        }

        const snapshot = await query.get();
        const prescriptions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.render('prescriptions/index', {
            prescriptions,
            user: req.user,
            userRole: req.user.role,
            title: 'Resep Obat',
            dashboardLink: `/dashboard/${req.user.role}`,
            dashboardTitle: req.user.role,
            userName: req.user.name
        });

    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
};

// Form Tambah Resep
exports.showAddPrescription = async (req, res) => {
    try {
        const patients = await db.collection('patients').get();

        res.render('prescriptions/form', {
            prescription: null,
            patients: patients.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })),
            user: req.user,
            userRole: req.user.role,
            title: 'Tambah Resep',
            dashboardLink: `/dashboard/${req.user.role}`,
            dashboardTitle: req.user.role,
            userName: req.user.name
        });

    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
};

// Simpan Resep
exports.createPrescription = async (req, res) => {
    try {
        await db.collection('prescriptions').add({
            patientName: req.body.patientName,
            patientEmail: req.body.patientEmail || '',
            doctorName: req.user.name,
            doctorEmail: req.user.email,
            medicine: req.body.medicine,
            dosage: req.body.dosage,
            notes: req.body.notes || '',
            createdAt: new Date()
        });

        req.flash('success', 'Resep berhasil ditambahkan');
        res.redirect('/prescriptions');

    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
};

// Form Edit Resep
exports.showEditPrescription = async (req, res) => {
    try {
        const prescriptionDoc = await db
            .collection('prescriptions')
            .doc(req.params.id)
            .get();

        if (!prescriptionDoc.exists) {
            req.flash('error', 'Data tidak ditemukan');
            return res.redirect('/prescriptions');
        }

        const prescription = {
            id: prescriptionDoc.id,
            ...prescriptionDoc.data()
        };

        // Dokter hanya bisa edit resep sendiri
        if (req.user.role === 'doctor' && prescription.doctorEmail !== req.user.email) {
            return res.status(403).send('Anda hanya bisa mengedit resep yang Anda buat');
        }

        const patients = await db.collection('patients').get();

        res.render('prescriptions/form', {
            prescription,
            patients: patients.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })),
            user: req.user,
            userRole: req.user.role,
            title: 'Edit Resep',
            dashboardLink: `/dashboard/${req.user.role}`,
            dashboardTitle: req.user.role,
            userName: req.user.name
        });

    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
};

// Update Resep
exports.updatePrescription = async (req, res) => {
    try {
        const doc = await db.collection('prescriptions')
            .doc(req.params.id)
            .get();
        
        if (!doc.exists) {
            req.flash('error', 'Data tidak ditemukan');
            return res.redirect('/prescriptions');
        }

        const prescription = doc.data();

        // Dokter hanya bisa update resep sendiri
        if (req.user.role === 'doctor' && prescription.doctorEmail !== req.user.email) {
            return res.status(403).send('Anda hanya bisa mengupdate resep yang Anda buat');
        }

        await db.collection('prescriptions')
            .doc(req.params.id)
            .update({
                patientName: req.body.patientName,
                patientEmail: req.body.patientEmail || '',
                medicine: req.body.medicine,
                dosage: req.body.dosage,
                notes: req.body.notes || ''
            });

        req.flash('success', 'Resep berhasil diupdate');
        res.redirect('/prescriptions');

    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
};

// Hapus Resep
exports.deletePrescription = async (req, res) => {
    try {
        const doc = await db.collection('prescriptions')
            .doc(req.params.id)
            .get();
        
        if (!doc.exists) {
            req.flash('error', 'Data tidak ditemukan');
            return res.redirect('/prescriptions');
        }

        const prescription = doc.data();

        // Dokter hanya bisa hapus resep sendiri
        if (req.user.role === 'doctor' && prescription.doctorEmail !== req.user.email) {
            return res.status(403).send('Anda hanya bisa menghapus resep yang Anda buat');
        }

        await db.collection('prescriptions')
            .doc(req.params.id)
            .delete();

        req.flash('success', 'Resep berhasil dihapus');
        res.redirect('/prescriptions');

    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
};