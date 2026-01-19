import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin with project ID
if (!getApps().length) {
  try {
    initializeApp({
      projectId: 'studio-2120461843-5ad32',
    });
  } catch (e) {
    console.error('Failed to initialize Firebase Admin:', e);
    process.exit(1);
  }
}

interface ClientUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  streetAddress?: string;
  city?: string;
  province?: string;
  postal?: string;
  phn?: string;
  addictionMedicine?: string;
  treatmentClient?: string;
  treatmentProvider?: string;
  virtual?: string;
  planG?: string;
  narcoticPrescriptions?: string;
  insuranceType?: string;
  insuranceMemberId?: string;
  insuranceGroupNo?: string;
  clinicDoctor?: string;
}

async function createClientUser(clientData: ClientUserData) {
  try {
    const auth = getAuth();
    const firestore = getFirestore();

    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      streetAddress,
      city,
      province,
      postal,
      phn,
      addictionMedicine,
      treatmentClient,
      treatmentProvider,
      virtual,
      planG,
      narcoticPrescriptions,
      insuranceType,
      insuranceMemberId,
      insuranceGroupNo,
      clinicDoctor,
    } = clientData;

    // Check if user already exists
    let user;
    try {
      user = await auth.getUserByEmail(email);
      console.log(`User ${email} already exists with UID: ${user.uid}`);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // User doesn't exist, create them
        console.log(`Creating new client user: ${email}`);
        user = await auth.createUser({
          email,
          password,
          displayName: `${firstName} ${lastName}`,
          emailVerified: false, // Client should verify their own email
        });
        console.log(`✅ User created successfully with UID: ${user.uid}`);
      } else {
        throw error;
      }
    }

    // Create or update user document in Firestore
    const userDocRef = firestore.collection('users').doc(user.uid);
    const userDoc = await userDocRef.get();

    const userData: any = {
      id: user.uid,
      email,
      firstName,
      lastName,
      role: 'client', // Client role
    };

    // Add optional fields if provided
    if (phone) userData.phone = phone;
    if (streetAddress) userData.streetAddress = streetAddress;
    if (city) userData.city = city;
    if (province) userData.province = province;
    if (postal) userData.postal = postal;
    if (phn) userData.phn = phn;
    if (addictionMedicine) userData.addictionMedicine = addictionMedicine;
    if (treatmentClient) userData.treatmentClient = treatmentClient;
    if (treatmentProvider) userData.treatmentProvider = treatmentProvider;
    if (virtual) userData.virtual = virtual;
    if (planG) userData.planG = planG;
    if (narcoticPrescriptions) userData.narcoticPrescriptions = narcoticPrescriptions;
    if (insuranceType) userData.insuranceType = insuranceType;
    if (insuranceMemberId) userData.insuranceMemberId = insuranceMemberId;
    if (insuranceGroupNo) userData.insuranceGroupNo = insuranceGroupNo;
    if (clinicDoctor) userData.clinicDoctor = clinicDoctor;

    if (userDoc.exists) {
      // Update existing user document
      await userDocRef.update(userData);
      console.log(`✅ User document updated with client role and data`);
    } else {
      // Create new user document
      await userDocRef.set(userData);
      console.log(`✅ User document created with client role and data`);
    }

    console.log('\n🎉 Client user setup complete!');
    console.log(`Email: ${email}`);
    console.log(`UID: ${user.uid}`);
    console.log(`Role: client`);
    console.log(`Name: ${firstName} ${lastName}`);
    if (clinicDoctor) {
      console.log(`Assigned Doctor: ${clinicDoctor}`);
    }
    console.log('\nThe client can now log in at /client-login with these credentials.');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error creating client user:', error);
    process.exit(1);
  }
}

// Create Sarah Lee's account
const sarahLeeData: ClientUserData = {
  email: 'sarah@email.com',
  password: 'Sarah123!', // Default password - should be changed on first login
  firstName: 'Sarah',
  lastName: 'Lee',
  phone: '12505559876',
  streetAddress: '100 Main St',
  city: 'Victoria',
  province: 'BC',
  postal: 'V8W1A1',
  phn: '73210-9876',
  addictionMedicine: 'No',
  treatmentClient: 'No',
  treatmentProvider: 'N/A',
  virtual: 'YES',
  planG: 'Yes',
  narcoticPrescriptions: '',
  insuranceType: 'Plan G',
  insuranceMemberId: 'Plan G',
  insuranceGroupNo: '',
  clinicDoctor: 'doctor@email.com',
};

createClientUser(sarahLeeData);
