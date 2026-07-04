require('dotenv').config(); 
const admin = require('firebase-admin');

let db = null;

// Ambil nilai dari environment variable
const firebaseConfig = process.env.firebase_service_account;

if (!firebaseConfig) {
  console.error("⚠️ Peringatan: Variabel 'firebase_service_account' belum diatur di Environment Variables!");
} else {
  try {
    // Hanya lakukan parse jika variabelnya ada (tidak undefined)
    const serviceAccount = JSON.parse(firebaseConfig);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    db = admin.firestore();
    console.log("✅ Firebase Admin berhasil terhubung.");
  } catch (error) {
    console.error("❌ Gagal membaca konfigurasi JSON Firebase:", error.message);
  }
}

module.exports = db;