/**
 * Batch endpoint to create meeting links (Microsoft Teams or Google Meet) for confirmed appointments
 * Creates meeting links for the next 3 days when an admin logs in
 * Falls back to Google Meet if Microsoft integration is not available
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { getMicrosoftAuthConfig, getMicrosoftAuthParams } from '@/lib/microsoft-auth';

async function getMicrosoftAccessToken(staffUserId: string): Promise<string | null> {
  const firestore = getAdminFirestore();
  const integrationDoc = await firestore
    .collection('users')
    .doc(staffUserId)
    .collection('integrations')
    .doc('microsoft-teams')
    .get();

  if (!integrationDoc.exists) {
    return null;
  }

  const integration = integrationDoc.data()!;
  const expiresAt = integration.expiresAt || 0;

  // If token is expired or will expire in the next 5 minutes, refresh it
  if (Date.now() >= expiresAt - 5 * 60 * 1000) {
    if (!integration.refreshToken) {
      return null;
    }

    const authConfig = getMicrosoftAuthConfig();
    const authParams = getMicrosoftAuthParams(authConfig);

    const tokenUrl = `https://login.microsoftonline.com/${authConfig.tenantId}/oauth2/v2.0/token`;
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        ...authParams,
        refresh_token: integration.refreshToken,
        grant_type: 'refresh_token',
        scope: 'Calendars.ReadWrite OnlineMeetings.ReadWrite',
      }),
    });

    if (!tokenResponse.ok) {
      return null;
    }

    const tokens = await tokenResponse.json();

    // Update stored token
    await integrationDoc.ref.set({
      accessToken: tokens.access_token,
      expiresAt: Date.now() + (tokens.expires_in * 1000),
      ...(tokens.refresh_token && { refreshToken: tokens.refresh_token }),
    }, { merge: true });

    return tokens.access_token;
  }

  return integration.accessToken;
}

async function getGoogleAccessToken(staffUserId: string): Promise<string | null> {
  const firestore = getAdminFirestore();
  const integrationDoc = await firestore
    .collection('users')
    .doc(staffUserId)
    .collection('integrations')
    .doc('google-meet')
    .get();

  if (!integrationDoc.exists) {
    return null;
  }

  const integration = integrationDoc.data()!;
  const expiresAt = integration.expiresAt || 0;

  if (Date.now() >= expiresAt - 5 * 60 * 1000) {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !integration.refreshToken) {
      return null;
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: integration.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResponse.ok) {
      return null;
    }

    const tokens = await tokenResponse.json();

    await integrationDoc.ref.set({
      accessToken: tokens.access_token,
      expiresAt: Date.now() + (tokens.expires_in * 1000),
      ...(tokens.refresh_token && { refreshToken: tokens.refresh_token }),
    }, { merge: true });

    return tokens.access_token;
  }

  return integration.accessToken;
}

async function createMicrosoftCalendarEvent(
  accessToken: string,
  appointment: any,
  clientName: string,
  clientEmail: string | null,
  staffName: string,
  timeZone: string
): Promise<{ eventId: string; teamsLink: string | null; webLink: string }> {
  const startTime = appointment.startTime.toDate();
  const endTime = appointment.endTime.toDate();

  // Format dates for Microsoft Graph API (ISO 8601)
  const startDateTime = startTime.toISOString();
  const endDateTime = endTime.toISOString();

  // Create event subject with client name
  const subject = `Appointment with ${clientName}`;

  // Create event body with appointment details
  const eventBody = `
    <p><strong>Client:</strong> ${clientName}</p>
    ${clientEmail ? `<p><strong>Email:</strong> ${clientEmail}</p>` : ''}
    ${appointment.reason ? `<p><strong>Reason:</strong> ${appointment.reason}</p>` : ''}
    ${appointment.clientPhone ? `<p><strong>Phone:</strong> ${appointment.clientPhone}</p>` : ''}
    <p><strong>Provider:</strong> ${staffName}</p>
  `;

  // Build attendees array
  const attendees: any[] = [];
  if (clientEmail) {
    attendees.push({
      emailAddress: {
        address: clientEmail,
        name: clientName,
      },
      type: 'required',
    });
  }

  // Create calendar event with Teams meeting
  const eventData = {
    subject,
    body: {
      contentType: 'HTML',
      content: eventBody,
    },
    start: {
      dateTime: startDateTime,
      timeZone: timeZone,
    },
    end: {
      dateTime: endDateTime,
      timeZone: timeZone,
    },
    attendees: attendees.length > 0 ? attendees : undefined,
    allowNewTimeProposals: false,
    isOnlineMeeting: true,
    onlineMeetingProvider: 'teamsForBusiness',
  };

  const eventResponse = await fetch(
    'https://graph.microsoft.com/v1.0/me/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': `outlook.timezone="${timeZone}"`,
      },
      body: JSON.stringify(eventData),
    }
  );

  if (!eventResponse.ok) {
    const errorData = await eventResponse.text();
    console.error('Microsoft calendar event creation error:', errorData);
    throw new Error(`Failed to create calendar event: ${eventResponse.status}`);
  }

  const event = await eventResponse.json();

  // Extract Teams meeting link
  const teamsLink = event.onlineMeeting?.joinUrl || 
                   event.onlineMeeting?.joinWebUrl || 
                   null;

  return {
    eventId: event.id,
    teamsLink,
    webLink: event.webLink,
  };
}

async function createGoogleCalendarEvent(
  accessToken: string,
  appointment: any,
  clientName: string,
  clientEmail: string | null,
  staffName: string,
  timeZone: string
): Promise<{ eventId: string; meetLink: string | null; htmlLink: string }> {
  const startTime = appointment.startTime.toDate();
  const endTime = appointment.endTime.toDate();

  // Format dates for Google Calendar API (ISO 8601)
  const startDateTime = startTime.toISOString();
  const endDateTime = endTime.toISOString();

  // Create event summary with client name
  const summary = `Appointment with ${clientName}`;

  // Create event description with appointment details
  const description = [
    `Client: ${clientName}`,
    clientEmail ? `Email: ${clientEmail}` : '',
    appointment.reason ? `Reason: ${appointment.reason}` : '',
    appointment.clientPhone ? `Phone: ${appointment.clientPhone}` : '',
    `Provider: ${staffName}`,
  ].filter(Boolean).join('\n');

  // Build attendees array
  const attendees: string[] = [];
  if (clientEmail) {
    attendees.push(clientEmail);
  }

  // Create calendar event with Google Meet
  const eventData: any = {
    summary,
    description,
    start: {
      dateTime: startDateTime,
      timeZone: timeZone,
    },
    end: {
      dateTime: endDateTime,
      timeZone: timeZone,
    },
    conferenceData: {
      createRequest: {
        requestId: `meet-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        conferenceSolutionKey: {
          type: 'hangoutsMeet',
        },
      },
    },
  };

  if (attendees.length > 0) {
    eventData.attendees = attendees.map(email => ({ email }));
  }

  const eventResponse = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    }
  );

  if (!eventResponse.ok) {
    const errorData = await eventResponse.text();
    console.error('Google calendar event creation error:', errorData);
    throw new Error(`Failed to create calendar event: ${eventResponse.status}`);
  }

  const event = await eventResponse.json();

  // Extract Google Meet link
  const meetLink = event.conferenceData?.entryPoints?.[0]?.uri || null;

  return {
    eventId: event.id,
    meetLink,
    htmlLink: event.htmlLink,
  };
}

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

    // Verify user is admin/staff
    const firestore = getAdminFirestore();
    const userDoc = await firestore.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const isAdmin = userData?.role === 'office_assistant' || userData?.role === 'staff';

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only staff can create batch meetings' },
        { status: 403 }
      );
    }

    // Get date range for next 3 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);
    threeDaysLater.setHours(23, 59, 59, 999);

    // Find confirmed appointments for the next 3 days that don't have a meeting link yet
    const appointmentsRef = firestore.collection('appointments');
    const appointmentsQuery = appointmentsRef
      .where('startTime', '>=', Timestamp.fromDate(today))
      .where('startTime', '<=', Timestamp.fromDate(threeDaysLater))
      .where('confirmationStatus', '==', 'confirmed')
      .where('meetingLink', '==', null);

    const appointmentsSnapshot = await appointmentsQuery.get();
    
    const results: Array<{
      appointmentId: string;
      status: string;
      meetingLink?: string | null;
      meetingType?: 'microsoft' | 'google';
      error?: string;
      reason?: string;
    }> = [];

    // Get timezone
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    for (const appointmentDoc of appointmentsSnapshot.docs) {
      const appointment = appointmentDoc.data();
      const appointmentId = appointmentDoc.id;

      // Skip if already has meeting link
      if (appointment.meetingLink) {
        continue;
      }

      // Get staff information
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
      const staffName = `${staffData?.firstName || ''} ${staffData?.lastName || ''}`.trim() || 'Staff';
      
      // Get client information
      let clientName = appointment.clientName || 'Client';
      let clientEmail = appointment.clientEmail || null;
      
      if (appointment.clientId) {
        const clientDoc = await firestore.collection('users').doc(appointment.clientId).get();
        if (clientDoc.exists()) {
          const clientData = clientDoc.data();
          clientName = `${clientData?.firstName || ''} ${clientData?.lastName || ''}`.trim() || clientName;
          clientEmail = clientData?.email || clientEmail;
        }
      }

      try {
        // Try Microsoft first, fall back to Google if not available
        let meetingResult: any = null;
        let meetingType: 'microsoft' | 'google' | null = null;

        // Check for Microsoft integration
        const microsoftToken = await getMicrosoftAccessToken(appointment.staffId);
        if (microsoftToken) {
          try {
            meetingResult = await createMicrosoftCalendarEvent(
              microsoftToken,
              appointment,
              clientName,
              clientEmail,
              staffName,
              timeZone
            );
            meetingType = 'microsoft';
          } catch (microsoftError: any) {
            console.warn(`Microsoft meeting creation failed for appointment ${appointmentId}, trying Google:`, microsoftError.message);
            // Fall through to try Google
          }
        }

        // Fall back to Google if Microsoft failed or not available
        if (!meetingResult) {
          const googleToken = await getGoogleAccessToken(appointment.staffId);
          if (googleToken) {
            meetingResult = await createGoogleCalendarEvent(
              googleToken,
              appointment,
              clientName,
              clientEmail,
              staffName,
              timeZone
            );
            meetingType = 'google';
          } else {
            throw new Error('No calendar integration found (neither Microsoft nor Google)');
          }
        }

        // Update appointment with meeting link
        const updateData: any = {
          meetingLink: meetingResult.teamsLink || meetingResult.meetLink,
          meetingLinkCreatedAt: Timestamp.now(),
        };

        if (meetingType === 'microsoft') {
          updateData.microsoftEventId = meetingResult.eventId;
          updateData.microsoftWebLink = meetingResult.webLink;
        } else if (meetingType === 'google') {
          updateData.googleEventId = meetingResult.eventId;
          updateData.googleWebLink = meetingResult.htmlLink;
        }

        await appointmentDoc.ref.update(updateData);

        results.push({
          appointmentId,
          status: 'created',
          meetingLink: meetingResult.teamsLink || meetingResult.meetLink,
          meetingType,
        });
      } catch (error: any) {
        console.error(`Error creating meeting for appointment ${appointmentId}:`, error);
        results.push({
          appointmentId,
          status: 'failed',
          error: error.message || 'Failed to create meeting',
        });
      }
    }

    return NextResponse.json({
      success: true,
      dateRange: {
        start: today.toISOString().split('T')[0],
        end: threeDaysLater.toISOString().split('T')[0],
      },
      totalAppointments: appointmentsSnapshot.size,
      results,
      summary: {
        created: results.filter(r => r.status === 'created').length,
        microsoft: results.filter(r => r.meetingType === 'microsoft').length,
        google: results.filter(r => r.meetingType === 'google').length,
        skipped: results.filter(r => r.status === 'skipped').length,
        failed: results.filter(r => r.status === 'failed').length,
      },
    });
  } catch (error: any) {
    console.error('Error creating batch Microsoft meetings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create batch meetings' },
      { status: 500 }
    );
  }
}
