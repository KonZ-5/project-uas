// controllers/authController.js
const db = require('../config/firebase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// HALAMAN LOGIN
exports.showLogin = (req, res) => {
    if (req.user) {
        return res.redirect(`/dashboard/${req.user.role}`);
    }
    res.render('auth/login', { error: null, email: '' });
};

// HALAMAN REGISTER
exports.showRegister = (req, res) => {
    if (req.user) {
        return res.redirect(`/dashboard/${req.user.role}`);
    }
    res.render('auth/register', { error: null });
};

// REGISTER
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validasi input
        if (!name || !email || !password) {
            return res.render('auth/register', { 
                error: 'Semua field wajib diisi' 
            });
        }

        // Cek email sudah terdaftar
        const userCheck = await db.collection('users')
            .where('email', '==', email)
            .get();

        if (!userCheck.empty) {
            return res.render('auth/register', { 
                error: 'Email sudah digunakan.' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Simpan user
        const userRef = await db.collection('users').add({
            name,
            email,
            password: hashedPassword,
            role: role || 'patient',
            createdAt: new Date()
        });

        // Tambahkan ke koleksi spesifik
        if (role === 'doctor') {
            await db.collection('doctors').add({
                name,
                email,
                userId: userRef.id,
                createdAt: new Date()
            });
        } else if (role === 'patient') {
            await db.collection('patients').add({
                name,
                email,
                userId: userRef.id,
                createdAt: new Date()
            });
        }

        req.flash('success', 'Registrasi berhasil! Silakan login.');
        res.redirect('/auth/login');

    } catch (err) {
        console.log(err);
        res.render('auth/register', { 
            error: err.message || 'Gagal registrasi' 
        });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validasi
        if (!email || !password) {
            return res.render('auth/login', { 
                error: 'Email dan password wajib diisi',
                email: email 
            });
        }

        // Cari user
        const snapshot = await db.collection('users')
            .where('email', '==', email)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.render('auth/login', { 
                error: 'Email tidak ditemukan.',
                email: email 
            });
        }

        const doc = snapshot.docs[0];
        const user = {
            id: doc.id,
            ...doc.data()
        };

        // Verifikasi password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.render('auth/login', { 
                error: 'Password salah.',
                email: email 
            });
        }

        // Buat JWT token
        const token = jwt.sign(
            {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        // Redirect berdasarkan role
        req.flash('success', 'Login berhasil!');
        res.redirect(`/dashboard/${user.role}`);

    } catch (err) {
        console.log(err);
        res.render('auth/login', { 
            error: err.message || 'Gagal login',
            email: req.body.email 
        });
    }
};

// LOGOUT
exports.logout = (req, res) => {
    res.clearCookie('token');
    req.flash('success', 'Logout berhasil');
    res.redirect('/auth/login');
};