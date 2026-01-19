import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/api/auth/google/callback`;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(new URL(`/settings?error=${encodeURIComponent(error)}`, request.url));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/settings?error=missing_params', request.url));
    }

    // Decode state to get userId
    let stateData: { userId: string; timestamp: number };
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
    } catch (e) {
      return NextResponse.redirect(new URL('/settings?error=invalid_state', request.url));
    }

    const { userId } = stateData;

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return NextResponse.redirect(new URL('/settings?error=token_exchange_failed', request.url));
    }

    const tokens = await tokenResponse.json();

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(new URL('/settings?error=user_info_failed', request.url));
    }

    const userInfo = await userInfoResponse.json();

    // Store tokens in Firestore
    const firestore = getAdminFirestore();
    const integrationRef = firestore
      .collection('users')
      .doc(userId)
      .collection('integrations')
      .doc('google-meet');

    await integrationRef.set({
      id: 'google-meet',
      userId,
      service: 'google-meet',
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + (tokens.expires_in * 1000),
      googleEmail: userInfo.email,
      googleName: userInfo.name,
      connectedAt: new Date().toISOString(),
    }, { merge: true });

    return NextResponse.redirect(new URL('/settings?success=google_connected', request.url));
  } catch (error: any) {
    console.error('Error in Google OAuth callback:', error);
    return NextResponse.redirect(new URL(`/settings?error=${encodeURIComponent(error.message)}`, request.url));
  }
}
