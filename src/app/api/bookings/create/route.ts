import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { checkSlotAvailability } from '@/lib/booking-helpers';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    let firestore;
    try {
      firestore = getAdminFirestore();
    } catch (adminError: any) {
      console.error('Firebase Admin initialization error:', adminError);
      return NextResponse.json(
        { 
          error: 'Server configuration error. Firebase Admin SDK not properly configured.',
          details: adminError.message
        },
        { status: 503 }
      );
    }
    const body = await request.json();
    
    const {
      clientId,
      clientEmail,
      staffId,
      startTime,
      endTime,
      reason,
    } = body;

    if (!staffId || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'staffId, startTime, and endTime are required' },
        { status: 400 }
      );
    }

    // Get or create client ID
    let finalClientId = clientId;
    if (!finalClientId && clientEmail) {
      const usersRef = firestore.collection('users');
      const clientQuery = usersRef
        .where('email', '==', clientEmail)
        .where('role', '==', 'client')
        .limit(1);
      const clientSnapshot = await clientQuery.get();
      if (!clientSnapshot.empty) {
        finalClientId = clientSnapshot.docs[0].id;
      }
    }

    // Check if slot is still available
    const start = new Date(startTime);
    const end = new Date(endTime);
    const isAvailable = await checkSlotAvailability(
      firestore as any,
      staffId,
      start,
      end
    );

    if (!isAvailable) {
      return NextResponse.json(
        { error: 'Selected time slot is no longer available' },
        { status: 400 }
      );
    }

    // Create appointment
    const appointmentsRef = firestore.collection('appointments');
    const appointmentData = {
      clientId: finalClientId || null,
      clientEmail: clientEmail || null,
      staffId,
      startTime: Timestamp.fromDate(new Date(startTime)),
      endTime: Timestamp.fromDate(new Date(endTime)),
      isUrgent: false,
      status: 'scheduled',
      meetingLink: null, // Can be generated later
      createdAt: new Date().toISOString(),
      // Confirmation tracking fields
      confirmationRequestSent: false,
      confirmationStatus: null, // null, 'pending', 'confirmed', 'cancelled'
      reminderSent: false,
    };

    const appointmentRef = await appointmentsRef.add(appointmentData);

    // Create appointment detail if reason provided
    if (reason) {
      const detailsRef = appointmentRef.collection('details');
      await detailsRef.add({
        appointmentId: appointmentRef.id,
        reason,
        notes: null,
      });
    }

    // Get staff member info
    const staffDoc = await firestore.collection('users').doc(staffId).get();
    const staffData = staffDoc.data();

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointmentRef.id,
        ...appointmentData,
        staffName: staffData ? `${staffData.firstName} ${staffData.lastName}` : 'Unknown',
      },
    });
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
