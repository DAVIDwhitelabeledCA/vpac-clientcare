import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const firestore = getAdminFirestore();
    const body = await request.json();
    
    const {
      clientId,
      clientEmail,
      clientName,
      clientPhone,
      reason,
    } = body;

    // Validate required fields
    if (!clientName || !clientPhone || !reason) {
      return NextResponse.json(
        { error: 'clientName, clientPhone, and reason are required' },
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

    // Create urgent appointment request
    const appointmentsRef = firestore.collection('appointments');
    const appointmentData = {
      clientId: finalClientId || null,
      clientName,
      clientEmail: clientEmail || null,
      clientPhone,
      isUrgent: true,
      status: 'pending',
      reason,
      requestedAt: new Date().toISOString(),
      // staffId, startTime, endTime are null until assigned
      staffId: null,
      startTime: null,
      endTime: null,
      meetingLink: null,
    };

    const appointmentRef = await appointmentsRef.add(appointmentData);

    // Create appointment detail with reason
    if (appointmentRef.id) {
      const detailsRef = appointmentRef.collection('details');
      await detailsRef.add({
        appointmentId: appointmentRef.id,
        reason,
        notes: null,
      });
    }

    return NextResponse.json({
      success: true,
      appointmentId: appointmentRef.id,
      message: 'Urgent appointment request submitted. The on-call doctor will contact you to schedule.',
    });
  } catch (error: any) {
    console.error('Error creating urgent appointment request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create urgent appointment request' },
      { status: 500 }
    );
  }
}
