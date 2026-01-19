// Simple script to create admin user using Firebase REST API
// This uses the Firebase Auth REST API directly
// 
// REQUIRED ENVIRONMENT VARIABLES:
// - NEXT_PUBLIC_FIREBASE_API_KEY: Your Firebase Web API Key
// - ADMIN_EMAIL: Email for the admin user (default: admin@whitelabeled.ca)
// - ADMIN_PASSWORD: Password for the admin user (default: !23$Vpac)

const adminEmail = process.env.ADMIN_EMAIL || 'admin@whitelabeled.ca';
const adminPassword = process.env.ADMIN_PASSWORD || '!23$Vpac';
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

if (!apiKey) {
  console.error('❌ Error: NEXT_PUBLIC_FIREBASE_API_KEY environment variable is required');
  console.error('Please set it in your .env.local file or export it before running this script.');
  process.exit(1);
}

async function createAdminUser() {
  try {
    // Step 1: Sign up the user via REST API
    const signUpUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;
    
    const signUpResponse = await fetch(signUpUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword,
        returnSecureToken: true,
      }),
    });

    const signUpData = await signUpResponse.json();

    if (signUpData.error) {
      if (signUpData.error.message.includes('EMAIL_EXISTS')) {
        console.log(`User ${adminEmail} already exists.`);
        // Get the user ID by signing in
        const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
        const signInResponse = await fetch(signInUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: adminEmail,
            password: adminPassword,
            returnSecureToken: true,
          }),
        });
        const signInData = await signInResponse.json();
        if (signInData.error) {
          throw new Error(signInData.error.message);
        }
        console.log(`✅ User authenticated. UID: ${signInData.localId}`);
        console.log('\n⚠️  Note: You need to create the Firestore user document manually or use Firebase Console.');
        console.log('The user document should have:');
        console.log(`  - id: ${signInData.localId}`);
        console.log(`  - email: ${adminEmail}`);
        console.log(`  - firstName: Admin`);
        console.log(`  - lastName: User`);
        console.log(`  - role: office_assistant`);
        return;
      }
      throw new Error(signUpData.error.message);
    }

    console.log(`✅ User created successfully!`);
    console.log(`UID: ${signUpData.localId}`);
    console.log(`Email: ${adminEmail}`);
    console.log('\n⚠️  Note: You need to create the Firestore user document manually or use Firebase Console.');
    console.log('The user document should have:');
    console.log(`  - id: ${signUpData.localId}`);
    console.log(`  - email: ${adminEmail}`);
    console.log(`  - firstName: Admin`);
    console.log(`  - lastName: User`);
    console.log(`  - role: office_assistant`);

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdminUser();
