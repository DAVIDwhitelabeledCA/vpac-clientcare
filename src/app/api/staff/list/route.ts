import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const adminAuth = getAdminAuth();
    await adminAuth.verifyIdToken(token);

    const adminFirestore = getAdminFirestore();
    const usersRef = adminFirestore.collection('users');
    
    // Get all staff members
    const staffQuery = usersRef
      .where('role', 'in', ['staff', 'office_assistant'])
      .limit(50);
    
    const staffSnapshot = await staffQuery.get();
    
    const staff = staffSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        role: data.role,
      };
    });

    return NextResponse.json({ staff });
  } catch (error: any) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}
