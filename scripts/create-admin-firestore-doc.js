// Script to create Firestore user document for admin user
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  projectId: 'studio-2120461843-5ad32',
  apiKey: 'AIzaSyBCskj140uBcMCywLzqoPOG7dF7jtIsbn8',
  authDomain: 'studio-2120461843-5ad32.firebaseapp.com',
};

async function createAdminFirestoreDoc() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);

    // Sign in as the admin user first
    console.log('Authenticating as admin user...');
    const userCredential = await signInWithEmailAndPassword(
      auth,
      'admin@whitelabeled.ca',
      '!23$Vpac'
    );

    console.log('✅ Authenticated successfully');

    const userId = userCredential.user.uid;
    const userDocRef = doc(db, 'users', userId);

    await setDoc(userDocRef, {
      id: userId,
      email: 'admin@whitelabeled.ca',
      firstName: 'Admin',
      lastName: 'User',
      role: 'office_assistant',
    });

    console.log('✅ Firestore user document created successfully!');
    console.log(`User ID: ${userId}`);
    console.log('Role: office_assistant');
    console.log('\n🎉 Admin user setup complete!');
    console.log('You can now log in with:');
    console.log('  Email: admin@whitelabeled.ca');
    console.log('  Password: !23$Vpac');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating Firestore document:', error.message);
    process.exit(1);
  }
}

createAdminFirestoreDoc();
