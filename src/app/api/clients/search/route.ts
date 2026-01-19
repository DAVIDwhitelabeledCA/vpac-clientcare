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
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Verify user is staff
    const adminFirestore = getAdminFirestore();
    const userDoc = await adminFirestore.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const isStaff = userData?.role === 'staff' || userData?.role === 'office_assistant';

    if (!isStaff) {
      return NextResponse.json(
        { error: 'Forbidden: Only staff can search clients' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ clients: [] });
    }

    const searchTerm = query.toLowerCase().trim();

    // Search clients by email, name, or phone
    const usersRef = adminFirestore.collection('users');
    
    // Try to find by exact email first
    const emailQuery = usersRef
      .where('role', '==', 'client')
      .where('email', '==', searchTerm)
      .limit(10);
    
    const emailResults = await emailQuery.get();
    
    const clients: any[] = [];
    const foundIds = new Set<string>();

    // Add email matches
    emailResults.forEach((doc) => {
      const data = doc.data();
      clients.push({
        id: doc.id,
        email: data.email,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      });
      foundIds.add(doc.id);
    });

    // Search by name (if we haven't found many results)
    if (clients.length < 10) {
      const allClientsQuery = usersRef.where('role', '==', 'client').limit(100);
      const allClientsSnapshot = await allClientsQuery.get();
      
      allClientsSnapshot.forEach((doc) => {
        if (foundIds.has(doc.id)) return;
        
        const data = doc.data();
        const fullName = `${data.firstName || ''} ${data.lastName || ''}`.toLowerCase();
        const phone = (data.phone || '').toLowerCase();
        const email = (data.email || '').toLowerCase();
        
        if (
          fullName.includes(searchTerm) ||
          phone.includes(searchTerm) ||
          email.includes(searchTerm)
        ) {
          clients.push({
            id: doc.id,
            email: data.email,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            phone: data.phone || '',
            name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
          });
          foundIds.add(doc.id);
          
          if (clients.length >= 10) return;
        }
      });
    }

    return NextResponse.json({ clients: clients.slice(0, 10) });
  } catch (error: any) {
    console.error('Error searching clients:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search clients' },
      { status: 500 }
    );
  }
}
