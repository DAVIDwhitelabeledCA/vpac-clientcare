/**
 * Scheduled job endpoint to send confirmation requests for appointments 2 days out
 * This should be called daily (e.g., via cron job or scheduled task)
 * 
 * Example cron: 0 9 * * * (runs at 9 AM daily)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { sendOpenPhoneSMS } from '@/lib/openphone-api';

// Optional: Add authentication/authorization check
const SCHEDULER_SECRET = process.env.SCHEDULER_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Optional: Verify scheduler secret
    const authHeader = request.headers.get('authorization');
    if (SCHEDULER_SECRET && authHeader !== `Bearer ${SCHEDULER_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const firestore = getAdminFirestore();
    
    // Calculate date 2 days from now
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    twoDaysFromNow.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(twoDaysFromNow);
    dayEnd.setHours(23, 59, 59, 999);

    // Find appointments scheduled for 2 days from now that haven't been confirmed yet
    const appointmentsRef = firestore.collection('appointments');
    // Note: Firestore doesn't support != operator, so we'll filter in memory
    const appointmentsQuery = appointmentsRef
      .where('startTime', '>=', Timestamp.fromDate(twoDaysFromNow))
      .where('startTime', '<=', Timestamp.fromDate(dayEnd))
      .where('status', 'in', ['scheduled', 'pending']);

    const appointmentsSnapshot = await appointmentsQuery.get();
    
    // Filter out appointments that already have confirmation requests sent
    const appointmentsToProcess = appointmentsSnapshot.docs.filter(doc => {
      const data = doc.data();
      return !data.confirmationRequestSent;
    });
    
    const results = [];
    const OPENPHONE_PHONE_NUMBER_ID = process.env.OPENPHONE_PHONE_NUMBER_ID;

    if (!OPENPHONE_PHONE_NUMBER_ID) {
      return NextResponse.json(
        { error: 'OPENPHONE_PHONE_NUMBER_ID not configured' },
        { status: 500 }
      );
    }

    for (const appointmentDoc of appointmentsToProcess) {
      const appointment = appointmentDoc.data();
      const appointmentId = appointmentDoc.id;

      // Get client information
      let clientPhone: string | null = null;
      let clientName = appointment.clientName || 'Client';
      let staffName = 'Dr. Unknown';
      let hasSMSConsent = false;

      if (appointment.clientId) {
        const clientDoc = await firestore.collection('users').doc(appointment.clientId).get();
        if (clientDoc.exists()) {
          const clientData = clientDoc.data();
          clientPhone = clientData?.phone || null;
          clientName = `${clientData?.firstName || ''} ${clientData?.lastName || ''}`.trim() || clientName;
          hasSMSConsent = clientData?.smsConsent === true;
        }
      } else if (appointment.clientPhone) {
        clientPhone = appointment.clientPhone;
        // For appointments without clientId, assume consent (legacy appointments)
        hasSMSConsent = true;
      }

      // Get staff information
      if (appointment.staffId) {
        const staffDoc = await firestore.collection('users').doc(appointment.staffId).get();
        if (staffDoc.exists()) {
          const staffData = staffDoc.data();
          staffName = `Dr. ${staffData?.firstName || ''} ${staffData?.lastName || ''}`.trim() || staffName;
        }
      }

      if (!clientPhone) {
        results.push({
          appointmentId,
          status: 'skipped',
          reason: 'No client phone number available',
        });
        continue;
      }

      // Check SMS consent
      if (!hasSMSConsent) {
        results.push({
          appointmentId,
          status: 'skipped',
          reason: 'Client has not consented to SMS notifications',
        });
        continue;
      }

      // Format appointment time
      const startTime = appointment.startTime.toDate();
      const appointmentDate = startTime.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const appointmentTime = startTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      // Create confirmation message
      const message = `You have an appointment in two days with ${staffName} at ${appointmentTime} on ${appointmentDate}. Reply "1" to confirm or "2" or "CANCEL" to reschedule or cancel.`;

      // Send SMS via OpenPhone
      const smsResult = await sendOpenPhoneSMS({
        phoneNumberId: OPENPHONE_PHONE_NUMBER_ID,
        to: clientPhone,
        text: message,
      });

      if (smsResult.success) {
        // Mark confirmation request as sent
        await appointmentDoc.ref.update({
          confirmationRequestSent: true,
          confirmationRequestSentAt: Timestamp.now(),
          confirmationStatus: 'pending',
        });

        results.push({
          appointmentId,
          status: 'sent',
          clientPhone,
          messageId: smsResult.data?.id,
        });
      } else {
        results.push({
          appointmentId,
          status: 'failed',
          error: smsResult.error,
        });
      }
    }

    return NextResponse.json({
      success: true,
      date: twoDaysFromNow.toISOString().split('T')[0],
      totalAppointments: appointmentsSnapshot.size,
      results,
    });
  } catch (error: any) {
    console.error('Error sending confirmation requests:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send confirmation requests' },
      { status: 500 }
    );
  }
}
