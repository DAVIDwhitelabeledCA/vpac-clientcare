import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';
import { sendOpenPhoneSMS } from '@/lib/openphone-api';

const OPENPHONE_PHONE_NUMBER_ID = process.env.OPENPHONE_PHONE_NUMBER_ID;

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.substring(7);
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Verify user has staff or office_assistant role
    const firestore = getAdminFirestore();
    const userDoc = await firestore.collection('users').doc(userId).get();
    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const userRole = userData?.role;
    if (userRole !== 'staff' && userRole !== 'office_assistant') {
      return NextResponse.json(
        { error: 'Only staff and office assistants can send SMS' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { clientId, phoneNumber, message } = body;

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    // Validate phone number format (basic E.164 format check)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Phone number must be in E.164 format (e.g., +1234567890)' },
        { status: 400 }
      );
    }

    // Check if clientId is provided and verify access
    if (clientId) {
      const clientDoc = await firestore.collection('users').doc(clientId).get();
      if (!clientDoc.exists()) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      }

      const clientData = clientDoc.data();
      // Office assistants can message anyone, staff can only message their assigned clients
      if (userRole === 'staff') {
        const assignedClients = userData?.assignedClients || [];
        if (!assignedClients.includes(clientId)) {
          return NextResponse.json(
            { error: 'You can only send SMS to your assigned clients' },
            { status: 403 }
          );
        }
      }

      // Check SMS consent if client exists
      if (clientData?.smsConsent !== true) {
        return NextResponse.json(
          { error: 'Client has not consented to receive SMS messages' },
          { status: 403 }
        );
      }
    }

    // Check OpenPhone configuration
    if (!OPENPHONE_PHONE_NUMBER_ID) {
      return NextResponse.json(
        { error: 'OpenPhone phone number ID not configured' },
        { status: 500 }
      );
    }

    // Send SMS via OpenPhone
    const result = await sendOpenPhoneSMS({
      phoneNumberId: OPENPHONE_PHONE_NUMBER_ID,
      to: phoneNumber,
      text: message,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send SMS' },
        { status: 500 }
      );
    }

    // Log the SMS send (optional: save to Firestore for history)
    if (clientId) {
      try {
        await firestore.collection('users').doc(clientId).collection('sms_history').add({
          from: userId,
          to: phoneNumber,
          message,
          sentAt: new Date(),
          openPhoneMessageId: result.data?.id,
        });
      } catch (logError) {
        // Don't fail the request if logging fails
        console.error('Failed to log SMS:', logError);
      }
    }

    return NextResponse.json({
      success: true,
      messageId: result.data?.id,
    });
  } catch (error: any) {
    console.error('Error sending SMS:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send SMS' },
      { status: 500 }
    );
  }
}
