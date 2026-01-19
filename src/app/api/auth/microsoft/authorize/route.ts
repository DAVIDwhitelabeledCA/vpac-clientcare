import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';
import { getMicrosoftAuthConfig } from '@/lib/microsoft-auth';

const MICROSOFT_TENANT_ID = process.env.MICROSOFT_TENANT_ID || 'common';
const REDIRECT_URI = process.env.MICROSOFT_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/api/auth/microsoft/callback`;

async function verifyIdToken(idToken: string): Promise<{ uid: string }> {
  try {
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    return { uid: decodedToken.uid };
  } catch (error: any) {
    // If Admin SDK fails, try using Firebase REST API to verify token
    if (error.message?.includes('Project Id') || error.message?.includes('credential')) {
      console.warn('Firebase Admin SDK not available, using REST API to verify token');
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      if (!apiKey) {
        throw new Error('NEXT_PUBLIC_FIREBASE_API_KEY environment variable is required');
      }
      const verifyResponse = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        }
      );
      
      if (!verifyResponse.ok) {
        throw new Error('Failed to verify token');
      }
      
      const verifyData = await verifyResponse.json();
      if (!verifyData.users || verifyData.users.length === 0) {
        throw new Error('Invalid token');
      }
      
      return { uid: verifyData.users[0].localId };
    }
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.substring(7);
    const { uid: userId } = await verifyIdToken(idToken);

    try {
      getMicrosoftAuthConfig();
    } catch (error: any) {
      return NextResponse.json(
        { error: `Microsoft OAuth not configured: ${error.message}. Please set MICROSOFT_CLIENT_ID and either MICROSOFT_CLIENT_SECRET or certificate paths.` },
        { status: 500 }
      );
    }

    const authConfig = getMicrosoftAuthConfig();

    // Generate state parameter with userId
    const state = Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64url');

    // Microsoft OAuth scopes for Calendar and Teams
    // Using Calendars.ReadWrite (not .All) to only access the signed-in user's calendar
    const scopes = [
      'Calendars.ReadWrite',
      'OnlineMeetings.ReadWrite',
    ].join(' ');

    const authUrl = new URL(`https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize`);
    authUrl.searchParams.set('client_id', authConfig.clientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('response_mode', 'query');
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('state', state);

    return NextResponse.json({ authUrl: authUrl.toString() });
  } catch (error: any) {
    console.error('Error initiating Microsoft OAuth:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate Microsoft OAuth' },
      { status: 500 }
    );
  }
}
