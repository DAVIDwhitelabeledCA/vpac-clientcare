import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';
import { checkSlotAvailability } from '@/lib/booking-helpers';
import { createGoogleMeetLink } from '@/lib/calendar-api';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.substring(7);
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Verify user is staff or office assistant
    const firestore = getAdminFirestore();
    const userDoc = await firestore.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const userRole = userData?.role;

    if (userRole !== 'staff' && userRole !== 'office_assistant') {
      return NextResponse.json(
        { error: 'Only staff and office assistants can assign urgent appointments' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { appointmentId, staffId, startTime, endTime } = body;

    if (!appointmentId || !staffId || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'appointmentId, staffId, startTime, and endTime are required' },
        { status: 400 }
      );
    }

    // Verify the appointment exists and is pending
    const appointmentRef = firestore.collection('appointments').doc(appointmentId);
    const appointmentDoc = await appointmentRef.get();
    
    if (!appointmentDoc.exists) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    const appointmentData = appointmentDoc.data();
    if (appointmentData?.status !== 'pending' || !appointmentData?.isUrgent) {
      return NextResponse.json(
        { error: 'Appointment is not a pending urgent request' },
        { status: 400 }
      );
    }

    // Check if slot is available
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
        { error: 'Selected time slot is not available' },
        { status: 400 }
      );
    }

    // Get staff member info for meeting link generation
    const staffDoc = await firestore.collection('users').doc(staffId).get();
    const staffData = staffDoc.data();
    const staffEmail = staffData?.email;

    // Try to generate meeting link if staff has Google integration
    let meetingLink: string | null = null;
    try {
      if (staffEmail) {
        const integrationsRef = firestore
          .collection('users')
          .doc(staffId)
          .collection('integrations');
        const googleIntegration = await integrationsRef.doc('google-meet').get();
        
        if (googleIntegration.exists) {
          // Note: This would need to be called from client-side with proper auth
          // For now, we'll set it to null and it can be generated later
          meetingLink = null;
        }
      }
    } catch (error) {
      console.warn('Could not generate meeting link:', error);
    }

    // Update appointment with assigned time
    await appointmentRef.update({
      staffId,
      startTime: Timestamp.fromDate(new Date(startTime)),
      endTime: Timestamp.fromDate(new Date(endTime)),
      status: 'scheduled',
      meetingLink,
      assignedAt: new Date().toISOString(),
      assignedBy: userId,
    });

    // Get updated appointment data
    const updatedDoc = await appointmentRef.get();
    const updatedData = updatedDoc.data();

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointmentRef.id,
        ...updatedData,
        startTime: updatedData?.startTime?.toDate?.()?.toISOString() || updatedData?.startTime,
        endTime: updatedData?.endTime?.toDate?.()?.toISOString() || updatedData?.endTime,
      },
    });
  } catch (error: any) {
    console.error('Error assigning urgent appointment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to assign urgent appointment' },
      { status: 500 }
    );
  }
}
