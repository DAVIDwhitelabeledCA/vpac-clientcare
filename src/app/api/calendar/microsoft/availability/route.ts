import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';

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
    const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
    const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;
    const MICROSOFT_TENANT_ID = process.env.MICROSOFT_TENANT_ID || 'common';

    if (!MICROSOFT_CLIENT_ID || !MICROSOFT_CLIENT_SECRET || !integration.refreshToken) {
      throw new Error('Cannot refresh token: missing credentials');
    }

    const tokenUrl = `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/token`;
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: MICROSOFT_CLIENT_ID,
        client_secret: MICROSOFT_CLIENT_SECRET,
        refresh_token: integration.refreshToken,
        grant_type: 'refresh_token',
        scope: 'Calendars.Read Calendars.ReadWrite OnlineMeetings.ReadWrite',
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
    const calendarId = searchParams.get('calendarId') || 'calendar';

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: 'startTime and endTime query parameters are required' },
        { status: 400 }
      );
    }

    const accessToken = await getValidAccessToken(userId);

    // Fetch calendar events from Microsoft Graph API
    const calendarResponse = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendars/${calendarId}/calendarView?` +
      `startDateTime=${encodeURIComponent(startTime)}&` +
      `endDateTime=${encodeURIComponent(endTime)}&` +
      `$orderby=start/dateTime`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!calendarResponse.ok) {
      // If specific calendar fails, try default calendar
      if (calendarId !== 'calendar') {
        const defaultResponse = await fetch(
          `https://graph.microsoft.com/v1.0/me/calendar/calendarView?` +
          `startDateTime=${encodeURIComponent(startTime)}&` +
          `endDateTime=${encodeURIComponent(endTime)}&` +
          `$orderby=start/dateTime`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!defaultResponse.ok) {
          const errorData = await defaultResponse.text();
          console.error('Calendar API error:', errorData);
          return NextResponse.json(
            { error: 'Failed to fetch calendar events' },
            { status: defaultResponse.status }
          );
        }

        const calendarData = await defaultResponse.json();
        const busySlots = calendarData.value?.map((event: any) => ({
          start: event.start.dateTime,
          end: event.end.dateTime,
          summary: event.subject,
        })) || [];

        return NextResponse.json({ busySlots });
      }

      const errorData = await calendarResponse.text();
      console.error('Calendar API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch calendar events' },
        { status: calendarResponse.status }
      );
    }

    const calendarData = await calendarResponse.json();
    
    // Transform events to a simpler format
    const busySlots = calendarData.value?.map((event: any) => ({
      start: event.start.dateTime,
      end: event.end.dateTime,
      summary: event.subject,
    })) || [];

    return NextResponse.json({ busySlots });
  } catch (error: any) {
    console.error('Error fetching Microsoft Calendar availability:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch calendar availability' },
      { status: 500 }
    );
  }
}
