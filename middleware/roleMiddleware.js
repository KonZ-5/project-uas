// middleware/roleMiddleware.js
const roleMiddleware = (...roles) => {
    return (req, res, next) => {
        // Cek apakah user sudah login
        if (!req.user) {
            return res.redirect('/auth/login');
        }

        // Cek apakah role user diizinkan
        if (!roles.includes(req.user.role)) {
            return res.status(403).render('error', {
                message: 'Akses Ditolak. Anda tidak memiliki izin untuk mengakses halaman ini.',
                error: { status: 403 },
                user: req.user,
                title: '403 - Akses Ditolak'
            });
        }

        next();
    };
};

module.exports = roleMiddleware;