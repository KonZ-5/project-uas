require('dotenv').config();
const admin = require('firebase-admin');

let db = null;

const base64Credentials = process.env.FIREBASE_BASE64;

if (!base64Credentials) {
  console.error("⚠️ Peringatan: Variabel 'FIREBASE_BASE64' belum diatur di .env!");
} else {
  try {
    // Men-decode string Base64 kembali menjadi teks JSON asli
    const decodedJson = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const serviceAccount = JSON.parse(decodedJson);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    db = admin.firestore();
    console.log("✅ Firebase Admin berhasil terhubung menggunakan Base64 Auth!");
  } catch (error) {
    console.error("❌ Gagal membaca atau mendecode konfigurasi Firebase:", error.message);
  }
}

module.exports = db;