const db = require('./config/firebase');

async function test() {
  try {
    const snapshot = await db.collection('users').get();
    console.log('Firestore Connected');
    console.log('Documents:', snapshot.size);
  } catch (err) {
    console.error(err);
  }
}

test();