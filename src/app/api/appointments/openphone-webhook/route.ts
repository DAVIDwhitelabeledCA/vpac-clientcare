/**
 * Webhook endpoint to receive OpenPhone message replies
 * Configure this URL in your OpenPhone webhook settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { parseConfirmationReply, type OpenPhoneWebhookPayload } from '@/lib/openphone-api';

export async function POST(request: NextRequest) {
  try {
    const firestore = getAdminFirestore();
    const payload: OpenPhoneWebhookPayload = await request.json();

    // Only process inbound messages
    if (payload.data.direction !== 'inbound') {
      return NextResponse.json({ received: true, message: 'Ignored outbound message' });
    }

    const messageText = payload.data.text;
    const fromPhone = payload.data.from;
    const messageId = payload.data.id;

    // Parse the reply
    const replyType = parseConfirmationReply(messageText);

    if (replyType === 'unknown') {
      // Not a confirmation reply, ignore
      return NextResponse.json({ received: true, message: 'Not a confirmation reply' });
    }

    // Find appointment by client phone number and pending confirmation status
    // We need to find appointments that:
    // 1. Have a client with this phone number
    // 2. Have confirmationStatus = 'pending'
    // 3. Are scheduled for the future

    // First, try to find client by phone number
    const usersRef = firestore.collection('users');
    const clientQuery = usersRef
      .where('role', '==', 'client')
      .where('phone', '==', fromPhone)
      .limit(1);

    const clientSnapshot = await clientQuery.get();
    
    if (clientSnapshot.empty) {
      // Try to find appointment with clientPhone field
      const appointmentsRef = firestore.collection('appointments');
      const appointmentQuery = appointmentsRef
        .where('clientPhone', '==', fromPhone)
        .where('confirmationStatus', '==', 'pending')
        .where('startTime', '>', Timestamp.now())
        .orderBy('startTime', 'asc')
        .limit(1);

      const appointmentSnapshot = await appointmentQuery.get();
      
      if (appointmentSnapshot.empty) {
        return NextResponse.json({
          received: true,
          message: 'No pending appointment found for this phone number',
        });
      }

      // Update appointment
      const appointmentDoc = appointmentSnapshot.docs[0];
      await handleAppointmentConfirmation(
        firestore,
        appointmentDoc,
        replyType,
        messageId
      );
    } else {
      // Found client, find their pending appointment
      const clientId = clientSnapshot.docs[0].id;
      const appointmentsRef = firestore.collection('appointments');
      const appointmentQuery = appointmentsRef
        .where('clientId', '==', clientId)
        .where('confirmationStatus', '==', 'pending')
        .where('startTime', '>', Timestamp.now())
        .orderBy('startTime', 'asc')
        .limit(1);

      const appointmentSnapshot = await appointmentQuery.get();
      
      if (appointmentSnapshot.empty) {
        return NextResponse.json({
          received: true,
          message: 'No pending appointment found for this client',
        });
      }

      // Update appointment
      const appointmentDoc = appointmentSnapshot.docs[0];
      await handleAppointmentConfirmation(
        firestore,
        appointmentDoc,
        replyType,
        messageId
      );
    }

    return NextResponse.json({ received: true, processed: true });
  } catch (error: any) {
    console.error('Error processing OpenPhone webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

async function handleAppointmentConfirmation(
  firestore: any,
  appointmentDoc: any,
  replyType: 'confirm' | 'cancel',
  messageId: string
) {
  const appointmentRef = appointmentDoc.ref;
  const appointmentData = appointmentDoc.data();

  if (replyType === 'confirm') {
    // Confirm the appointment
    await appointmentRef.update({
      confirmationStatus: 'confirmed',
      confirmedAt: Timestamp.now(),
      confirmationMessageId: messageId,
      status: 'confirmed', // Update main status as well
    });
  } else if (replyType === 'cancel') {
    // Cancel the appointment
    await appointmentRef.update({
      confirmationStatus: 'cancelled',
      cancelledAt: Timestamp.now(),
      cancellationMessageId: messageId,
      status: 'cancelled', // Update main status as well
    });
  }
}
