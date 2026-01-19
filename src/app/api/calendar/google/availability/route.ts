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

  // If token is expired or will expire in the next 5 minutes, refresh it
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

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.substring(7);
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const searchParams = request.nextUrl.searchParams;
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    const calendarId = searchParams.get('calendarId') || 'primary';

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: 'startTime and endTime query parameters are required' },
        { status: 400 }
      );
    }

    const accessToken = await getValidAccessToken(userId);

    // Fetch calendar events
    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?` +
      `timeMin=${encodeURIComponent(startTime)}&` +
      `timeMax=${encodeURIComponent(endTime)}&` +
      `singleEvents=true&` +
      `orderBy=startTime`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!calendarResponse.ok) {
      const errorData = await calendarResponse.text();
      console.error('Calendar API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch calendar events' },
        { status: calendarResponse.status }
      );
    }

    const calendarData = await calendarResponse.json();
    
    // Transform events to a simpler format
    const busySlots = calendarData.items?.map((event: any) => ({
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      summary: event.summary,
    })) || [];

    return NextResponse.json({ busySlots });
  } catch (error: any) {
    console.error('Error fetching Google Calendar availability:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch calendar availability' },
      { status: 500 }
    );
  }
}
