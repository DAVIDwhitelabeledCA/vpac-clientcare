import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';

async function getValidAccessToken(userId: string): Promise<string> {
  const firestore = getAdminFirestore();
  const integrationDoc = await firestore
    .collection('users')
    .doc(userId)
    .collection('integrations')
    .doc('google-meet')
    .get();

  if (!integrationDoc.exists) {
    throw new Error('Google integration not found');
  }

  const integration = integrationDoc.data()!;
  const expiresAt = integration.expiresAt || 0;

  if (Date.now() >= expiresAt - 5 * 60 * 1000) {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !integration.refreshToken) {
      throw new Error('Cannot refresh token: missing credentials');
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
      throw new Error('Failed to refresh Google token');
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
    const { startTime, endTime, summary, description, calendarId = 'primary' } = body;

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: 'startTime and endTime are required' },
        { status: 400 }
      );
    }

    const accessToken = await getValidAccessToken(userId);

    // Create a calendar event with Google Meet link
    const eventResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: summary || 'Appointment',
          description: description || '',
          start: {
            dateTime: startTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: endTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          conferenceData: {
            createRequest: {
              requestId: `meet-${Date.now()}-${Math.random().toString(36).substring(7)}`,
              conferenceSolutionKey: {
                type: 'hangoutsMeet',
              },
            },
          },
        }),
      }
    );

    if (!eventResponse.ok) {
      const errorData = await eventResponse.text();
      console.error('Calendar event creation error:', errorData);
      return NextResponse.json(
        { error: 'Failed to create calendar event with Meet link' },
        { status: eventResponse.status }
      );
    }

    const event = await eventResponse.json();
    const meetLink = event.conferenceData?.entryPoints?.[0]?.uri || null;

    return NextResponse.json({
      eventId: event.id,
      meetLink,
      htmlLink: event.htmlLink,
    });
  } catch (error: any) {
    console.error('Error creating Google Meet link:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Meet link' },
      { status: 500 }
    );
  }
}
