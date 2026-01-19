// Script to create Firestore user document for admin user
// REQUIRED ENVIRONMENT VARIABLES:
// - NEXT_PUBLIC_FIREBASE_PROJECT_ID: Your Firebase project ID
// - NEXT_PUBLIC_FIREBASE_API_KEY: Your Firebase Web API Key
// - ADMIN_EMAIL: Email for the admin user (default: admin@whitelabeled.ca)
// - ADMIN_PASSWORD: Password for the admin user (default: !23$Vpac)

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`;

if (!projectId || !apiKey) {
  console.error('❌ Error: NEXT_PUBLIC_FIREBASE_PROJECT_ID and NEXT_PUBLIC_FIREBASE_API_KEY are required');
  console.error('Please set them in your .env.local file or export them before running this script.');
  process.exit(1);
}

const firebaseConfig = {
  projectId,
  apiKey,
  authDomain,
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
      email: adminEmail,
      firstName: 'Admin',
      lastName: 'User',
      role: 'office_assistant',
    });

    console.log('✅ Firestore user document created successfully!');
    console.log(`User ID: ${userId}`);
    console.log('Role: office_assistant');
    console.log('\n🎉 Admin user setup complete!');
    console.log('You can now log in with:');
    console.log(`  Email: ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating Firestore document:', error.message);
    process.exit(1);
  }
}

createAdminFirestoreDoc();
