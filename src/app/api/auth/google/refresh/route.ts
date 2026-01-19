import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

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

    const firestore = getAdminFirestore();
    const integrationDoc = await firestore
      .collection('users')
      .doc(userId)
      .collection('integrations')
      .doc('google-meet')
      .get();

    if (!integrationDoc.exists) {
      return NextResponse.json({ error: 'Google integration not found' }, { status: 404 });
    }

    const integration = integrationDoc.data();
    if (!integration?.refreshToken) {
      return NextResponse.json({ error: 'No refresh token available' }, { status: 400 });
    }

    // Refresh the access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        refresh_token: integration.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token refresh failed:', errorData);
      return NextResponse.json({ error: 'Failed to refresh token' }, { status: 500 });
    }

    const tokens = await tokenResponse.json();

    // Update the stored tokens
    await integrationDoc.ref.set({
      accessToken: tokens.access_token,
      expiresAt: Date.now() + (tokens.expires_in * 1000),
      ...(tokens.refresh_token && { refreshToken: tokens.refresh_token }),
    }, { merge: true });

    return NextResponse.json({
      accessToken: tokens.access_token,
      expiresAt: Date.now() + (tokens.expires_in * 1000),
    });
  } catch (error: any) {
    console.error('Error refreshing Google token:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to refresh token' },
      { status: 500 }
    );
  }
}
