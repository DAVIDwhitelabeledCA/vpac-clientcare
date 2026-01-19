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
    const { startTime, endTime, summary, description } = body;

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: 'startTime and endTime are required' },
        { status: 400 }
      );
    }

    const accessToken = await getValidAccessToken(userId);

    // Create an online meeting using Microsoft Graph API
    const meetingResponse = await fetch(
      'https://graph.microsoft.com/v1.0/me/onlineMeetings',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: summary || 'Appointment',
          startDateTime: startTime,
          endDateTime: endTime,
          participants: {
            organizer: {
              identity: {
                user: {
                  id: userId,
                },
              },
            },
          },
        }),
      }
    );

    if (!meetingResponse.ok) {
      const errorData = await meetingResponse.text();
      console.error('Teams meeting creation error:', errorData);
      return NextResponse.json(
        { error: 'Failed to create Teams meeting' },
        { status: meetingResponse.status }
      );
    }

    const meetingData = await meetingResponse.json();

    // Extract the join URL from the meeting
    const teamsLink = meetingData.joinWebUrl || meetingData.joinUrl;
    const meetingId = meetingData.id;

    if (!teamsLink) {
      return NextResponse.json(
        { error: 'Teams meeting created but no join URL found' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      eventId: meetingId,
      meetLink: teamsLink,
      joinUrl: teamsLink,
      meetingId: meetingId,
    });
  } catch (error: any) {
    console.error('Error creating Teams meeting:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Teams meeting' },
      { status: 500 }
    );
  }
}
