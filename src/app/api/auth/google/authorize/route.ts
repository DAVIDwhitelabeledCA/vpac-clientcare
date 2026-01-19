import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/api/auth/google/callback`;

export async function GET(request: NextRequest) {
  try {
    // Get the Firebase ID token from the Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.substring(7);
    
    // Verify the Firebase token
    let userId: string;
    try {
      const auth = getAdminAuth();
      const decodedToken = await auth.verifyIdToken(idToken);
      userId = decodedToken.uid;
    } catch (error: any) {
      // If Admin SDK fails, try using Firebase REST API to verify token
      if (error.message?.includes('Project Id') || error.message?.includes('credential')) {
        console.warn('Firebase Admin SDK not available, using REST API to verify token');
        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBCskj140uBcMCywLzqoPOG7dF7jtIsbn8';
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
        
        userId = verifyData.users[0].localId;
      } else {
        throw error;
      }
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.' },
        { status: 500 }
      );
    }

    // Generate state parameter with userId to verify on callback
    const state = Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64url');

    // Google OAuth scopes for Calendar and Meet
    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/meetings.space.created',
    ].join(' ');

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('state', state);

    return NextResponse.json({ authUrl: authUrl.toString() });
  } catch (error: any) {
    console.error('Error initiating Google OAuth:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate Google OAuth' },
      { status: 500 }
    );
  }
}
