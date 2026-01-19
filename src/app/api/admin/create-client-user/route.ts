import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';

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
  treatmentContact?: string;
  treatmentPhone?: string;
  treatmentEmail?: string;
  virtual?: string;
  planG?: string;
  narcoticPrescriptions?: string;
  insuranceType?: string;
  insuranceMemberId?: string;
  insuranceGroupNo?: string;
  clinicDoctor?: string;
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAdminAuth();
    const firestore = getAdminFirestore();
    const clientData: ClientUserData = await request.json();

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
      treatmentContact,
      treatmentPhone,
      treatmentEmail,
      virtual,
      planG,
      narcoticPrescriptions,
      insuranceType,
      insuranceMemberId,
      insuranceGroupNo,
      clinicDoctor,
    } = clientData;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, firstName, lastName' },
        { status: 400 }
      );
    }

    // Check if user already exists
    let user;
    try {
      user = await auth.getUserByEmail(email);
      // User exists, update their Firestore document
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // User doesn't exist, create them
        user = await auth.createUser({
          email,
          password,
          displayName: `${firstName} ${lastName}`,
          emailVerified: false, // Client should verify their own email
        });
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
    if (treatmentContact) userData.treatmentContact = treatmentContact;
    if (treatmentPhone) userData.treatmentPhone = treatmentPhone;
    if (treatmentEmail) userData.treatmentEmail = treatmentEmail;
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
    } else {
      // Create new user document
      await userDocRef.set(userData);
    }

    return NextResponse.json({
      success: true,
      message: 'Client user created successfully',
      user: {
        uid: user.uid,
        email,
        firstName,
        lastName,
        role: 'client',
        clinicDoctor,
      },
    });
  } catch (error: any) {
    console.error('Error creating client user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create client user' },
      { status: 500 }
    );
  }
}
