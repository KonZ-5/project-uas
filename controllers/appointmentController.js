// controllers/appointmentController.js
const db = require('../config/firebase');


// GET APPOINTMENTS
exports.getAppointments = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect('/auth/login');
        }

        let query = db.collection('appointments');

        if (req.user.role === 'doctor') {
            query = query.where('doctorEmail', '==', req.user.email);
        } else if (req.user.role === 'patient') {
            query = query.where('patientEmail', '==', req.user.email);
        }

        const snapshot = await query.get();
        const appointments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.render('appointments/index', {
            appointments,
            user: req.user,
            userRole: req.user.role,
            title: 'Janji Temu',
            dashboardLink: `/dashboard/${req.user.role}`,
            dashboardTitle: req.user.role,
            userName: req.user.name
        });

    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
};

// FORM ADD
exports.showAddAppointment = async (req, res) => {
    try {
        const doctors = await db.collection('doctors').get();
        let patients = [];

        if (req.user.role === 'admin') {
            const patientSnapshot = await db.collection('patients').get();
            patients = patientSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        }

        res.render('appointments/form', {
            doctors: doctors.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })),
            patients,
            user: req.user,
            userRole: req.user.role,
            title: 'Tambah Janji Temu',
            dashboardLink: `/dashboard/${req.user.role}`,
            dashboardTitle: req.user.role,
            userName: req.user.name
        });

    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
};

// CREATE
exports.createAppointment = async (req, res) => {
    try {
        let patientName, patientEmail;

        if (req.user.role === 'patient') {
            patientName = req.user.name;
            patientEmail = req.user.email;
        } else {
            patientName = req.body.patientName;
            patientEmail = req.body.patientEmail;
        }

        await db.collection('appointments').add({
            doctorName: req.body.doctorName,
            doctorEmail: req.body.doctorEmail,
            patientName: patientName,
            patientEmail: patientEmail,
            appointmentDate: req.body.appointmentDate,
            appointmentTime: req.body.appointmentTime,
            complaint: req.body.complaint || '',
            status: 'Pending',
            createdAt: new Date()
        });

        req.flash('success', 'Janji temu berhasil dibuat');
        res.redirect('/appointments');

    } catch (error) {
        console.log(error);
        req.flash('error', 'Gagal membuat janji temu');
        res.status(500).send(error.message);
    }
};

// EDIT
exports.showEditAppointment = async (req, res) => {
    try {
        const doc = await db.collection('appointments').doc(req.params.id).get();

        if (!doc.exists) {
            req.flash('error', 'Data tidak ditemukan');
            return res.redirect('/appointments');
        }

        res.render('appointments/edit', {
            appointment: {
                id: doc.id,
                ...doc.data()
            },
            user: req.user,
            title: 'Edit Janji Temu',
            dashboardLink: `/dashboard/${req.user.role}`,
            dashboardTitle: req.user.role,
            userName: req.user.name,
            userRole: req.user.role
        });

    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
};

// UPDATE
exports.updateAppointment = async (req, res) => {
    try {
        await db.collection('appointments').doc(req.params.id).update({
            appointmentDate: req.body.appointmentDate,
            appointmentTime: req.body.appointmentTime,
            complaint: req.body.complaint,
            status: req.body.status
        });

        req.flash('success', 'Janji temu berhasil diupdate');
        res.redirect('/appointments');

    } catch (error) {
        console.log(error);
        req.flash('error', 'Gagal mengupdate janji temu');
        res.status(500).send(error.message);
    }
};

// DELETE
exports.deleteAppointment = async (req, res) => {
    try {
        await db.collection('appointments').doc(req.params.id).delete();
        req.flash('success', 'Janji temu berhasil dihapus');
        res.redirect('/appointments');

    } catch (error) {
        console.log(error);
        req.flash('error', 'Gagal menghapus janji temu');
        res.status(500).send(error.message);
    }
};

// APPROVE
exports.approveAppointment = async (req, res) => {
    try {
        await db.collection('appointments').doc(req.params.id).update({
            status: 'Approved'
        });
        req.flash('success', 'Janji temu berhasil disetujui');
        res.redirect('/appointments');

    } catch (error) {
        console.log(error);
        req.flash('error', 'Gagal menyetujui janji temu');
        res.status(500).send(error.message);
    }
};

// CANCEL
exports.cancelAppointment = async (req, res) => {
    try {
        await db.collection('appointments').doc(req.params.id).update({
            status: 'Cancelled'
        });
        req.flash('success', 'Janji temu berhasil dibatalkan');
        res.redirect('/appointments');

    } catch (error) {
        console.log(error);
        req.flash('error', 'Gagal membatalkan janji temu');
        res.status(500).send(error.message);
    }
};