import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';

const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;
const MICROSOFT_TENANT_ID = process.env.MICROSOFT_TENANT_ID || 'common';
const REDIRECT_URI = process.env.MICROSOFT_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/api/auth/microsoft/callback`;

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
    const tokenUrl = `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/token`;
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: MICROSOFT_CLIENT_ID!,
        client_secret: MICROSOFT_CLIENT_SECRET!,
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
        scope: 'Calendars.Read Calendars.ReadWrite OnlineMeetings.ReadWrite',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return NextResponse.redirect(new URL('/settings?error=token_exchange_failed', request.url));
    }

    const tokens = await tokenResponse.json();

    // Get user info from Microsoft
    const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
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
      .doc('microsoft-teams');

    await integrationRef.set({
      id: 'microsoft-teams',
      userId,
      service: 'microsoft-teams',
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + (tokens.expires_in * 1000),
      microsoftEmail: userInfo.mail || userInfo.userPrincipalName,
      microsoftName: userInfo.displayName,
      connectedAt: new Date().toISOString(),
    }, { merge: true });

    return NextResponse.redirect(new URL('/settings?success=microsoft_connected', request.url));
  } catch (error: any) {
    console.error('Error in Microsoft OAuth callback:', error);
    return NextResponse.redirect(new URL(`/settings?error=${encodeURIComponent(error.message)}`, request.url));
  }
}
