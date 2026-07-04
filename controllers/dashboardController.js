// controllers/dashboardController.js
const db = require('../config/firebase');

// Dashboard Admin
exports.adminDashboard = async (req, res) => {
    try {
        const [doctors, patients, appointments, prescriptions] = await Promise.all([
            db.collection('doctors').get(),
            db.collection('patients').get(),
            db.collection('appointments').get(),
            db.collection('prescriptions').get()
        ]);

        res.render('dashboard/admin', {
            totalDoctors: doctors.size,
            totalPatients: patients.size,
            totalAppointments: appointments.size,
            totalPrescriptions: prescriptions.size,
            user: req.user,
            title: 'Dashboard Admin',
            dashboardTitle: 'Admin',
            userName: req.user.name,
            userRole: req.user.role,
            dashboardLink: '/dashboard/admin'
        });
    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
};

// Dashboard Dokter
exports.doctorDashboard = async (req, res) => {
    try {
        const appointments = await db.collection('appointments')
            .where('doctorEmail', '==', req.user.email)
            .get();

        const prescriptions = await db.collection('prescriptions')
            .where('doctorEmail', '==', req.user.email)
            .get();

        const records = await db.collection('medical_records')
            .where('doctorEmail', '==', req.user.email)
            .get();

        res.render('dashboard/doctor', {
            totalAppointments: appointments.size,
            totalPrescriptions: prescriptions.size,
            totalRecords: records.size,
            appointments: appointments.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            user: req.user,
            title: 'Dashboard Dokter',
            dashboardTitle: 'Dokter',
            userName: req.user.name,
            userRole: req.user.role,
            dashboardLink: '/dashboard/doctor'
        });
    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
};

// Dashboard Pasien
exports.patientDashboard = async (req, res) => {
    try {
        const appointments = await db.collection('appointments')
            .where('patientEmail', '==', req.user.email)
            .get();

        const records = await db.collection('medical_records')
            .where('patientEmail', '==', req.user.email)
            .get();

        const prescriptions = await db.collection('prescriptions')
            .where('patientEmail', '==', req.user.email)
            .get();

        const labs = await db.collection('lab_results')
            .where('patientEmail', '==', req.user.email)
            .get();

        res.render('dashboard/patient', {
            totalAppointments: appointments.size,
            totalRecords: records.size,
            totalPrescriptions: prescriptions.size,
            totalLabs: labs.size,
            appointments: appointments.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            records: records.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            prescriptions: prescriptions.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            labs: labs.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            user: req.user,
            title: 'Dashboard Pasien',
            dashboardTitle: 'Pasien',
            userName: req.user.name,
            userEmail: req.user.email,
            userRole: req.user.role,
            dashboardLink: '/dashboard/patient'
        });
    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
};