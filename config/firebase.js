require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');

let db = null;

try {
  // Langsung arahkan ke file JSON lokal Anda
  const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  db = admin.firestore();
  console.log("✅ Firebase Admin berhasil terhubung ke Firestore!");
} catch (error) {
  console.error("❌ Gagal menginisialisasi Firebase:", error.message);
}

module.exports = db;