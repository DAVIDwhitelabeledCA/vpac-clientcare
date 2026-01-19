/**
 * Scheduled job endpoint to create meeting links for confirmed appointments on the day of
 * This should be called multiple times per day (e.g., every hour) to catch appointments throughout the day
 * 
 * Example cron: 0 * * * * (runs every hour)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { createGoogleMeetLink } from '@/lib/calendar-api';

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
    
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    // Find confirmed appointments for today that don't have a meeting link yet
    const appointmentsRef = firestore.collection('appointments');
    const appointmentsQuery = appointmentsRef
      .where('startTime', '>=', Timestamp.fromDate(today))
      .where('startTime', '<=', Timestamp.fromDate(todayEnd))
      .where('confirmationStatus', '==', 'confirmed')
      .where('meetingLink', '==', null);

    const appointmentsSnapshot = await appointmentsQuery.get();
    
    const results = [];

    for (const appointmentDoc of appointmentsSnapshot.docs) {
      const appointment = appointmentDoc.data();
      const appointmentId = appointmentDoc.id;

      // Skip if already has meeting link
      if (appointment.meetingLink) {
        continue;
      }

      // Get staff information to create meeting link
      if (!appointment.staffId) {
        results.push({
          appointmentId,
          status: 'skipped',
          reason: 'No staff assigned',
        });
        continue;
      }

      const staffDoc = await firestore.collection('users').doc(appointment.staffId).get();
      if (!staffDoc.exists()) {
        results.push({
          appointmentId,
          status: 'skipped',
          reason: 'Staff member not found',
        });
        continue;
      }

      const staffData = staffDoc.data();
      const staffName = `${staffData?.firstName || ''} ${staffData?.lastName || ''}`.trim();
      
      // Get client information
      let clientName = appointment.clientName || 'Client';
      if (appointment.clientId) {
        const clientDoc = await firestore.collection('users').doc(appointment.clientId).get();
        if (clientDoc.exists()) {
          const clientData = clientDoc.data();
          clientName = `${clientData?.firstName || ''} ${clientData?.lastName || ''}`.trim() || clientName;
        }
      }

      // Create meeting link
      const startTime = appointment.startTime.toDate();
      const endTime = appointment.endTime.toDate();
      
      try {
        // Note: This requires the staff member to have Google Calendar integration set up
        // For now, we'll create a placeholder. In production, you'd call the actual Google Meet API
        // or use the calendar-api.ts function if the staff has OAuth set up
        
        // TODO: Implement actual meeting link creation
        // For Google Meet, you'd typically:
        // 1. Check if staff has Google Calendar integration
        // 2. Create a calendar event with Google Meet link
        // 3. Extract the meet link from the event
        
        // Placeholder: Generate a Google Meet link format
        // In production, use: const meetResult = await createGoogleMeetLink(...)
        const meetingLink = `https://meet.google.com/${generateMeetCode()}`;
        
        // Update appointment with meeting link
        await appointmentDoc.ref.update({
          meetingLink,
          meetingLinkCreatedAt: Timestamp.now(),
        });

        results.push({
          appointmentId,
          status: 'created',
          meetingLink,
        });
      } catch (error: any) {
        results.push({
          appointmentId,
          status: 'failed',
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      date: today.toISOString().split('T')[0],
      totalAppointments: appointmentsSnapshot.size,
      results,
    });
  } catch (error: any) {
    console.error('Error creating meeting links:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create meeting links' },
      { status: 500 }
    );
  }
}

// Helper function to generate a random Google Meet code
function generateMeetCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 3; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  result += '-';
  for (let i = 0; i < 4; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  result += '-';
  for (let i = 0; i < 3; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
