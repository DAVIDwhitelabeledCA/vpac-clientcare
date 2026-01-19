import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';
import { getMicrosoftAuthConfig, getMicrosoftAuthParams } from '@/lib/microsoft-auth';

async function getValidAccessToken(userId: string): Promise<string> {
  const firestore = getAdminFirestore();
  const integrationDoc = await firestore
    .collection('users')
    .doc(userId)
    .collection('integrations')
    .doc('microsoft-teams')
    .get();

  if (!integrationDoc.exists) {
    throw new Error('Microsoft integration not found');
  }

  const integration = integrationDoc.data()!;
  const expiresAt = integration.expiresAt || 0;

  // If token is expired or will expire in the next 5 minutes, refresh it
  if (Date.now() >= expiresAt - 5 * 60 * 1000) {
    if (!integration.refreshToken) {
      throw new Error('Cannot refresh token: missing refresh token');
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
      throw new Error('Failed to refresh Microsoft token');
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

    const body = await request.json();
    const { 
      startTime, 
      endTime, 
      subject, 
      body: eventBody, 
      location,
      attendees,
      isOnlineMeeting = true,
      onlineMeetingProvider = 'teamsForBusiness',
      timeZone
    } = body;

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: 'startTime and endTime are required' },
        { status: 400 }
      );
    }

    const accessToken = await getValidAccessToken(userId);

    // Get timezone (use provided timezone or detect from system)
    const eventTimeZone = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Create calendar event in Outlook using Microsoft Graph API
    // Using /me/events endpoint to create in the logged-in user's calendar
    // Format matches Microsoft Graph API specification
    const eventData: any = {
      subject: subject || 'Appointment',
      start: {
        dateTime: startTime,
        timeZone: eventTimeZone,
      },
      end: {
        dateTime: endTime,
        timeZone: eventTimeZone,
      },
      allowNewTimeProposals: false,
    };

    // Add body content if provided
    if (eventBody) {
      eventData.body = {
        contentType: 'HTML',
        content: eventBody,
      };
    }

    // Add location if provided
    if (location) {
      eventData.location = {
        displayName: location,
      };
    }

    // Add attendees if provided
    if (attendees && attendees.length > 0) {
      eventData.attendees = attendees.map((attendee: string | { email: string; name?: string }) => {
        if (typeof attendee === 'string') {
          return {
            emailAddress: {
              address: attendee,
            },
            type: 'required',
          };
        } else {
          return {
            emailAddress: {
              address: attendee.email,
              name: attendee.name,
            },
            type: 'required',
          };
        }
      });
    }

    // Add Teams meeting options (enabled by default)
    if (isOnlineMeeting) {
      eventData.isOnlineMeeting = true;
      eventData.onlineMeetingProvider = onlineMeetingProvider || 'teamsForBusiness';
    }

    // Create event using /me/events endpoint (logged-in user's calendar)
    const eventResponse = await fetch(
      'https://graph.microsoft.com/v1.0/me/events',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': `outlook.timezone="${eventTimeZone}"`,
        },
        body: JSON.stringify(eventData),
      }
    );

    if (!eventResponse.ok) {
      const errorData = await eventResponse.text();
      console.error('Calendar event creation error:', errorData);
      return NextResponse.json(
        { error: 'Failed to create calendar event' },
        { status: eventResponse.status }
      );
    }

    const event = await eventResponse.json();

    // Extract Teams meeting link if available
    const teamsLink = event.onlineMeeting?.joinUrl || 
                     event.onlineMeeting?.joinWebUrl || 
                     event.onlineMeeting?.joinUrl || 
                     null;

    return NextResponse.json({
      eventId: event.id,
      webLink: event.webLink,
      teamsLink,
      subject: event.subject,
      start: event.start,
      end: event.end,
      onlineMeeting: event.onlineMeeting,
    });
  } catch (error: any) {
    console.error('Error creating Outlook calendar event:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}
