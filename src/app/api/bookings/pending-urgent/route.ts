import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.substring(7);
    
    // Initialize Firebase Admin with error handling
    let auth, firestore;
    try {
      auth = getAdminAuth();
      firestore = getAdminFirestore();
    } catch (adminError: any) {
      console.error('Firebase Admin initialization error:', adminError);
      return NextResponse.json(
        { 
          error: 'Server configuration error. Firebase Admin SDK not properly configured.',
          details: adminError.message,
          hint: 'Please ensure Firebase Admin credentials are set up. Run: gcloud auth application-default login'
        },
        { status: 503 }
      );
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Verify user is staff or office assistant
    const userDoc = await firestore.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const userRole = userData?.role;

    if (userRole !== 'staff' && userRole !== 'office_assistant') {
      return NextResponse.json(
        { error: 'Only staff and office assistants can view pending urgent requests' },
        { status: 403 }
      );
    }

    // Get pending urgent appointments
    const appointmentsRef = firestore.collection('appointments');
    const pendingQuery = appointmentsRef
      .where('isUrgent', '==', true)
      .where('status', '==', 'pending');

    const snapshot = await pendingQuery.get();
    const pendingRequests = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        clientId: data.clientId,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        reason: data.reason,
        requestedAt: data.requestedAt,
      };
    });

    // Sort by requestedAt (oldest first)
    pendingRequests.sort((a, b) => {
      const timeA = new Date(a.requestedAt).getTime();
      const timeB = new Date(b.requestedAt).getTime();
      return timeA - timeB;
    });

    return NextResponse.json({
      pendingRequests,
    });
  } catch (error: any) {
    console.error('Error getting pending urgent requests:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get pending urgent requests' },
      { status: 500 }
    );
  }
}
