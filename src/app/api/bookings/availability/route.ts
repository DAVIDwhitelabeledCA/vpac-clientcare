import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { getAssignedDoctorId, calculateAvailableSlots } from '@/lib/booking-helpers';

export async function GET(request: NextRequest) {
  try {
    let firestore;
    try {
      firestore = getAdminFirestore();
    } catch (adminError: any) {
      console.error('Firebase Admin initialization error:', adminError);
      console.error('Error stack:', adminError.stack);
      return NextResponse.json(
        { 
          error: 'Server configuration error. Firebase Admin SDK not properly configured.',
          details: adminError.message,
          hint: 'Please ensure Firebase Admin credentials are set up. Run: gcloud auth application-default login'
        },
        { status: 503 }
      );
    }
    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get('clientId');
    const clientEmail = searchParams.get('clientEmail');
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Get client document to find assigned doctor
    let clinicDoctorEmail: string | null = null;
    if (clientId) {
      const clientDoc = await firestore.collection('users').doc(clientId).get();
      if (clientDoc.exists) {
        clinicDoctorEmail = clientDoc.data()?.clinicDoctor || null;
      }
    } else if (clientEmail) {
      const usersRef = firestore.collection('users');
      const clientQuery = usersRef
        .where('email', '==', clientEmail)
        .where('role', '==', 'client')
        .limit(1);
      const clientSnapshot = await clientQuery.get();
      if (!clientSnapshot.empty) {
        clinicDoctorEmail = clientSnapshot.docs[0].data().clinicDoctor || null;
      }
    }

    if (!clinicDoctorEmail) {
      return NextResponse.json(
        { error: 'Client not found or no assigned doctor' },
        { status: 404 }
      );
    }

    // Get assigned doctor's user ID
    const doctorId = await getAssignedDoctorId(firestore, clinicDoctorEmail);
    if (!doctorId) {
      return NextResponse.json(
        { error: 'Assigned doctor not found' },
        { status: 404 }
      );
    }

    // Parse the date and create date range for the day
    const selectedDate = new Date(date);
    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(23, 59, 59, 999);

    // Get availability blocks for this doctor on this date
    const availabilityRef = firestore
      .collection('users')
      .doc(doctorId)
      .collection('availability_blocks');
    
    const availabilityQuery = availabilityRef
      .where('startTime', '>=', Timestamp.fromDate(dayStart))
      .where('startTime', '<=', Timestamp.fromDate(dayEnd));

    const availabilitySnapshot = await availabilityQuery.get();
    const availabilityBlocks = availabilitySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        startTime: data.startTime,
        endTime: data.endTime,
      };
    });

    // Get appointments for this doctor on this date
    const appointmentsRef = firestore.collection('appointments');
    const appointmentsQuery = appointmentsRef
      .where('staffId', '==', doctorId)
      .where('startTime', '>=', Timestamp.fromDate(dayStart))
      .where('startTime', '<=', Timestamp.fromDate(dayEnd));

    const appointmentsSnapshot = await appointmentsQuery.get();
    const appointments = appointmentsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        startTime: data.startTime,
        endTime: data.endTime,
        status: data.status,
      };
    });

    // Calculate available slots
    const availableSlots = calculateAvailableSlots(availabilityBlocks, appointments);

    // Format slots for response
    const slots = availableSlots.map(slot => ({
      start: slot.start.toISOString(),
      end: slot.end.toISOString(),
      time: slot.start.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    }));

    return NextResponse.json({
      doctorId,
      doctorEmail: clinicDoctorEmail,
      date,
      availableSlots: slots,
    });
  } catch (error: any) {
    console.error('Error getting availability:', error);
    const errorMessage = error.message || 'Failed to get availability';
    
    // Check if it's a Firebase Admin initialization error
    if (errorMessage.includes('Firebase Admin initialization failed')) {
      return NextResponse.json(
        { 
          error: 'Server configuration error. Please contact support.',
          details: 'Firebase Admin SDK not properly configured'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
