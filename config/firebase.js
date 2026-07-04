require('dotenv').config(); 
const admin = require('firebase-admin');

let db = null;
const firebaseConfig = process.env.firebase_service_account;

if (!firebaseConfig) {
  console.error("⚠️ Peringatan: Variabel 'firebase_service_account' belum diatur!");
} else {
  try {
    const serviceAccount = JSON.parse(firebaseConfig);

    // Ambil string private key dan paksa konversi \\n menjadi \n yang asli
    const formattedPrivateKey = serviceAccount.private_key.replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: formattedPrivateKey // Menggunakan key yang sudah diperbaiki
      })
    });

    db = admin.firestore();
    console.log("✅ Firebase Admin berhasil terhubung.");
  } catch (error) {
    console.error("❌ Gagal membaca konfigurasi JSON Firebase:", error.message);
  }
}

module.exports = db;