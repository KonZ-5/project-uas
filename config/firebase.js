require('dotenv').config();
const admin = require('firebase-admin');

let db = null;

try {
  let serviceAccount;

  // Cek apakah ada variabel di .env
  if (process.env.firebase_service_account) {
    serviceAccount = JSON.parse(process.env.firebase_service_account);
  } else {
    // Jika tidak ada di .env, coba baca langsung dari file lokal (pastikan file ini ada di folder proyek Anda)
    // PENTING: Pastikan 'serviceAccountKey.json' sudah masuk ke .gitignore Anda!
    serviceAccount = require('../serviceAccountKey.json'); 
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  db = admin.firestore();
  console.log("✅ Firebase Admin berhasil terhubung ke Firestore.");
} catch (error) {
  console.error("❌ Firebase gagal terinisialisasi:", error.message);
}

module.exports = db;