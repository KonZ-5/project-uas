// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const jwt = require('jsonwebtoken');
const db = require('./config/firebase');

const app = express();
const PORT = process.env.PORT || 3000;

// VIEW ENGINE SETUP
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// SESSION & FLASH
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));
app.use(flash());

// MIDDLEWARE AUTH - Untuk semua route
app.use((req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        } catch (err) {
            console.log('JWT Error:', err.message);
            res.clearCookie('token');
        }
    }
    next();
});

// GLOBAL VARIABLES UNTUK VIEW
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.info = req.flash('info');
    res.locals.title = 'Sistem Kesehatan';
    res.locals.dashboardLink = req.user ? `/dashboard/${req.user.role}` : '/auth/login';
    res.locals.dashboardTitle = req.user ? req.user.role : 'Guest';
    res.locals.userName = req.user ? req.user.name : 'Guest';
    res.locals.userRole = req.user ? req.user.role : null;
    next();
});

// IMPORT ROUTES
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const recordRoutes = require('./routes/recordRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const labRoutes = require('./routes/labRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const userRoutes = require('./routes/userRoutes');
const searchRoutes = require('./routes/searchRoutes');

// GUNAKAN ROUTES
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/doctors', doctorRoutes);
app.use('/patients', patientRoutes);
app.use('/records', recordRoutes);
app.use('/prescriptions', prescriptionRoutes);
app.use('/labs', labRoutes);
app.use('/statistics', statisticsRoutes);
app.use('/users', userRoutes);
app.use('/search', searchRoutes);

// HOME ROUTE
app.get('/', (req, res) => {
    if (req.user) {
        return res.redirect(`/dashboard/${req.user.role}`);
    }
    res.redirect('/auth/login');
});

// ERROR HANDLER 404
app.use((req, res) => {
    res.status(404).render('error', {
        message: 'Halaman tidak ditemukan',
        error: { status: 404 },
        user: req.user || null,
        title: '404 - Halaman Tidak Ditemukan'
    });
});

// ERROR HANDLER 500
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).render('error', {
        message: err.message || 'Terjadi kesalahan pada server',
        error: process.env.NODE_ENV === 'development' ? err : { status: 500 },
        user: req.user || null,
        title: '500 - Kesalahan Server'
    });
});

// START SERVER
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;