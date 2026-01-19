/**
 * Scheduled job endpoint to send 2-hour reminders for confirmed appointments
 * This should be called frequently (e.g., every 15-30 minutes) to catch appointments throughout the day
 * 
 * Example cron: *\/30 * * * * (runs every 30 minutes)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { sendOpenPhoneSMS } from '@/lib/openphone-api';

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
    
    // Calculate time 2 hours from now
    const twoHoursFromNow = new Date();
    twoHoursFromNow.setHours(twoHoursFromNow.getHours() + 2);
    
    // Find appointments starting in approximately 2 hours (within a 30-minute window)
    const windowStart = new Date(twoHoursFromNow);
    windowStart.setMinutes(windowStart.getMinutes() - 15);
    
    const windowEnd = new Date(twoHoursFromNow);
    windowEnd.setMinutes(windowEnd.getMinutes() + 15);

    // Find confirmed appointments with meeting links that haven't been reminded yet
    const appointmentsRef = firestore.collection('appointments');
    const appointmentsQuery = appointmentsRef
      .where('startTime', '>=', Timestamp.fromDate(windowStart))
      .where('startTime', '<=', Timestamp.fromDate(windowEnd))
      .where('confirmationStatus', '==', 'confirmed')
      .where('meetingLink', '!=', null)
      .where('reminderSent', '!=', true);

    const appointmentsSnapshot = await appointmentsQuery.get();
    
    const results = [];
    const OPENPHONE_PHONE_NUMBER_ID = process.env.OPENPHONE_PHONE_NUMBER_ID;

    if (!OPENPHONE_PHONE_NUMBER_ID) {
      return NextResponse.json(
        { error: 'OPENPHONE_PHONE_NUMBER_ID not configured' },
        { status: 500 }
      );
    }

    for (const appointmentDoc of appointmentsSnapshot.docs) {
      const appointment = appointmentDoc.data();
      const appointmentId = appointmentDoc.id;

      // Skip if already sent or no meeting link
      if (appointment.reminderSent || !appointment.meetingLink) {
        continue;
      }

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

      if (!appointment.meetingLink) {
        results.push({
          appointmentId,
          status: 'skipped',
          reason: 'No meeting link available',
        });
        continue;
      }

      // Create reminder message
      const message = `Your appointment with ${staffName} is in 2 hours. Please join this ${appointment.meetingLink} no sooner than 5 minutes before your meeting.`;

      // Send SMS via OpenPhone
      const smsResult = await sendOpenPhoneSMS({
        phoneNumberId: OPENPHONE_PHONE_NUMBER_ID,
        to: clientPhone,
        text: message,
      });

      if (smsResult.success) {
        // Mark reminder as sent
        await appointmentDoc.ref.update({
          reminderSent: true,
          reminderSentAt: Timestamp.now(),
          reminderMessageId: smsResult.data?.id,
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
      windowStart: windowStart.toISOString(),
      windowEnd: windowEnd.toISOString(),
      totalAppointments: appointmentsSnapshot.size,
      results,
    });
  } catch (error: any) {
    console.error('Error sending reminders:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send reminders' },
      { status: 500 }
    );
  }
}
