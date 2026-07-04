// controllers/statisticsController.js
const db = require('../config/firebase');

exports.showStatistics = async (req, res) => {
    try {
        const [doctors, patients, appointments, prescriptions] = await Promise.all([
            db.collection('doctors').get(),
            db.collection('patients').get(),
            db.collection('appointments').get(),
            db.collection('prescriptions').get()
        ]);

        res.render('statistics', {
            doctorCount: doctors.size,
            patientCount: patients.size,
            appointmentCount: appointments.size,
            prescriptionCount: prescriptions.size,
            user: req.user || null,
            userRole: req.user ? req.user.role : null,
            title: 'Statistik',
            dashboardLink: req.user ? `/dashboard/${req.user.role}` : '/auth/login',
            dashboardTitle: req.user ? req.user.role : 'Guest',
            userName: req.user ? req.user.name : 'Guest'
        });

    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
};