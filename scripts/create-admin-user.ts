import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// REQUIRED ENVIRONMENT VARIABLES:
// - FIREBASE_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID: Your Firebase project ID
// - ADMIN_EMAIL: Email for the admin user (default: admin@whitelabeled.ca)
// - ADMIN_PASSWORD: Password for the admin user (default: !23$Vpac)
// - Firebase Admin credentials (via GOOGLE_APPLICATION_CREDENTIALS, FIREBASE_SERVICE_ACCOUNT, or ADC)

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (!projectId) {
  console.error('❌ Error: FIREBASE_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID is required');
  console.error('Please set it in your .env.local file or export it before running this script.');
  process.exit(1);
}

// Initialize Firebase Admin with project ID
if (!getApps().length) {
  try {
    initializeApp({
      projectId,
    });
  } catch (e) {
    console.error('Failed to initialize Firebase Admin:', e);
    process.exit(1);
  }
}

async function createAdminUser() {
  try {
    const auth = getAuth();
    const firestore = getFirestore();

    const email = process.env.ADMIN_EMAIL || 'admin@whitelabeled.ca';
    const password = process.env.ADMIN_PASSWORD || '!23$Vpac';
    const firstName = 'Admin';
    const lastName = 'User';

    // Check if user already exists
    let user;
    try {
      user = await auth.getUserByEmail(email);
      console.log(`User ${email} already exists with UID: ${user.uid}`);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // User doesn't exist, create them
        console.log(`Creating new user: ${email}`);
        user = await auth.createUser({
          email,
          password,
          displayName: `${firstName} ${lastName}`,
          emailVerified: true,
        });
        console.log(`✅ User created successfully with UID: ${user.uid}`);
      } else {
        throw error;
      }
    }

    // Create or update user document in Firestore
    const userDocRef = firestore.collection('users').doc(user.uid);
    const userDoc = await userDocRef.get();

    if (userDoc.exists) {
      // Update existing user document
      await userDocRef.update({
        email,
        firstName,
        lastName,
        role: 'office_assistant', // Admin role
      });
      console.log(`✅ User document updated with admin role`);
    } else {
      // Create new user document
      await userDocRef.set({
        id: user.uid,
        email,
        firstName,
        lastName,
        role: 'office_assistant', // Admin role
      });
      console.log(`✅ User document created with admin role`);
    }

    console.log('\n🎉 Admin user setup complete!');
    console.log(`Email: ${email}`);
    console.log(`UID: ${user.uid}`);
    console.log(`Role: office_assistant`);
    console.log('\nYou can now log in with these credentials.');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
