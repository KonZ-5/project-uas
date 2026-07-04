// controllers/doctorController.js
const db = require('../config/firebase');

// TAMPILKAN DOKTER
exports.getDoctors = async (req, res) => {
    try {
        const snapshot = await db.collection('doctors').get();
        const doctors = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.render('doctors/index', {
            doctors,
            user: req.user,
            userRole: req.user.role,
            title: 'Daftar Dokter',
            dashboardLink: `/dashboard/${req.user.role}`,
            dashboardTitle: req.user.role,
            userName: req.user.name
        });

    } catch (error) {
        console.error('Error getDoctors:', error);
        res.status(500).send(error.message);
    }
};

// FORM TAMBAH DOKTER
exports.showAddDoctor = (req, res) => {
    res.render('doctors/form', {
        doctor: null,
        user: req.user,
        userRole: req.user.role,
        title: 'Tambah Dokter',
        dashboardLink: `/dashboard/${req.user.role}`,
        dashboardTitle: req.user.role,
        userName: req.user.name
    });
};

// SIMPAN DOKTER
exports.createDoctor = async (req, res) => {
    try {
        const { name, email, specialist, phone, schedule } = req.body;
        
        if (!name || !email) {
            return res.status(400).send('Nama dan Email harus diisi');
        }

        // Cek email sudah terdaftar
        const existingDoctor = await db.collection('doctors')
            .where('email', '==', email)
            .get();

        if (!existingDoctor.empty) {
            return res.status(400).send('Email sudah terdaftar sebagai dokter');
        }

        await db.collection('doctors').add({
            name: name,
            email: email,
            specialist: specialist || '',
            phone: phone || '',
            schedule: schedule || '',
            createdAt: new Date()
        });

        req.flash('success', 'Dokter berhasil ditambahkan');
        res.redirect('/doctors');

    } catch (error) {
        console.error('Error createDoctor:', error);
        res.status(500).send(error.message);
    }
};

// FORM EDIT DOKTER
exports.showEditDoctor = async (req, res) => {
    try {
        const doc = await db.collection('doctors')
            .doc(req.params.id)
            .get();

        if (!doc.exists) {
            req.flash('error', 'Dokter tidak ditemukan');
            return res.redirect('/doctors');
        }

        res.render('doctors/form', {
            doctor: {
                id: doc.id,
                ...doc.data()
            },
            user: req.user,
            userRole: req.user.role,
            title: 'Edit Dokter',
            dashboardLink: `/dashboard/${req.user.role}`,
            dashboardTitle: req.user.role,
            userName: req.user.name
        });

    } catch (error) {
        console.error('Error showEditDoctor:', error);
        res.status(500).send(error.message);
    }
};

// UPDATE DOKTER
exports.updateDoctor = async (req, res) => {
    try {
        const { name, email, specialist, phone, schedule } = req.body;

        if (!name || !email) {
            return res.status(400).send('Nama dan Email harus diisi');
        }

        // Cek email sudah digunakan oleh dokter lain
        const existingDoctor = await db.collection('doctors')
            .where('email', '==', email)
            .get();

        if (!existingDoctor.empty) {
            const doc = existingDoctor.docs[0];
            if (doc.id !== req.params.id) {
                return res.status(400).send('Email sudah digunakan oleh dokter lain');
            }
        }

        await db.collection('doctors')
            .doc(req.params.id)
            .update({
                name: name,
                email: email,
                specialist: specialist || '',
                phone: phone || '',
                schedule: schedule || ''
            });

        req.flash('success', 'Dokter berhasil diupdate');
        res.redirect('/doctors');

    } catch (error) {
        console.error('Error updateDoctor:', error);
        res.status(500).send(error.message);
    }
};

// HAPUS DOKTER
exports.deleteDoctor = async (req, res) => {
    try {
        const doc = await db.collection('doctors').doc(req.params.id).get();
        if (!doc.exists) {
            req.flash('error', 'Dokter tidak ditemukan');
            return res.redirect('/doctors');
        }

        const doctorData = doc.data();
        
        // Cek apakah dokter memiliki appointment
        const appointments = await db.collection('appointments')
            .where('doctorEmail', '==', doctorData.email)
            .get();

        if (!appointments.empty) {
            req.flash('error', 'Dokter ini memiliki janji temu, tidak bisa dihapus');
            return res.redirect('/doctors');
        }

        await db.collection('doctors')
            .doc(req.params.id)
            .delete();

        req.flash('success', 'Dokter berhasil dihapus');
        res.redirect('/doctors');

    } catch (error) {
        console.error('Error deleteDoctor:', error);
        res.status(500).send(error.message);
    }
};