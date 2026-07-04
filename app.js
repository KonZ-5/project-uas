// app.js
// 1. WAJIB DI BARIS PALING ATAS agar semua file config bisa membaca variabel .env
require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const jwt = require('jsonwebtoken');

// Memuat konfigurasi database Firebase Firestore yang sudah aman
const db = require('./config/firebase');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// VIEW ENGINE SETUP
// ==========================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ==========================================
// MIDDLEWARE UTAMA
// ==========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================
// SESSION & FLASH (Menggunakan Secret dari .env)
// ==========================================
app.use(session({
    secret: process.env.SESSION_SECRET || 'super-secret-key-default',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production' // otomatis secure jika sudah online/SSL
    }
}));
app.use(flash());

// ==========================================
// MIDDLEWARE AUTHENTICATION (Verifikasi JWT Token)
// ==========================================
app.use((req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            // Membaca JWT_SECRET rahasia dari file .env
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-jwt-key');
            req.user = decoded;
        } catch (err) {
            console.log('JWT Error:', err.message);
            res.clearCookie('token');
        }
    }
    next();
});

// ==========================================
// GLOBAL VARIABLES UNTUK VIEW ENGINE (EJS)
// ==========================================
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

// ==========================================
// ROUTE MANAGEMENT (IMPORT & GUNAKAN)
// ==========================================
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

// ==========================================
// PENANGANAN ERROR (404 & 500)
// ==========================================

// ERROR HANDLER 404 (Halaman Tidak Ditemukan)
app.use((req, res) => {
    res.status(404).render('error', {
        message: 'Halaman tidak ditemukan',
        error: { status: 404, stack: null },
        user: req.user || null,
        title: '404 - Halaman Tidak Ditemukan'
    });
});

// ERROR HANDLER 500 (Kesalahan Internal Server)
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    
    // Proteksi: Jangan tampilkan error stack asli ke user jika sudah mode production
    const isDev = (process.env.NODE_ENV || 'development') === 'development';
    
    res.status(500).render('error', {
        message: err.message || 'Terjadi kesalahan pada server',
        error: isDev ? err : { status: 500, stack: null },
        user: req.user || null,
        title: '500 - Kesalahan Server'
    });
});

// ==========================================
// JALANKAN SERVER
// ==========================================
app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`==================================================`);
});

module.exports = app;