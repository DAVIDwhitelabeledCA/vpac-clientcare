import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore, getAdminStorage } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const clientId = formData.get('clientId') as string;
    const uploadedBy = formData.get('uploadedBy') as string; // userId of the uploader
    const documentType = formData.get('documentType') as string || 'general';
    const templateId = formData.get('templateId') as string || null;
    const ocrData = formData.get('ocrData') as string | null; // JSON string of OCR results

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!clientId || !uploadedBy) {
      return NextResponse.json(
        { error: 'clientId and uploadedBy are required' },
        { status: 400 }
      );
    }

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

    // Verify user has permission (must be the client themselves or staff)
    const adminFirestore = getAdminFirestore();
    const userDoc = await adminFirestore.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const isStaff = userData?.role === 'staff' || userData?.role === 'office_assistant';
    const isClient = userId === clientId;

    if (!isStaff && !isClient) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to upload documents for this client' },
        { status: 403 }
      );
    }

    // Upload file to Firebase Storage
    const adminStorage = getAdminStorage();
    const bucket = adminStorage.bucket();
    const fileName = `documents/${clientId}/${Date.now()}-${file.name}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const fileRef = bucket.file(fileName);
    await fileRef.save(fileBuffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          uploadedBy,
          clientId,
          documentType,
        },
      },
    });

    // Generate a signed URL that's valid for 1 year
    // This is more secure than making files public
    const [signedUrl] = await fileRef.getSignedUrl({
      action: 'read',
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
    });
    
    const publicUrl = signedUrl;

    // Parse OCR data if provided
    let parsedOcrData = null;
    if (ocrData) {
      try {
        parsedOcrData = JSON.parse(ocrData);
      } catch (e) {
        console.error('Failed to parse OCR data:', e);
      }
    }

    // Save document metadata to Firestore
    const documentData = {
      clientId,
      uploadedBy,
      fileName: file.name,
      fileUrl: publicUrl,
      fileSize: file.size,
      fileType: file.type,
      documentType,
      templateId: templateId || null,
      ocrData: parsedOcrData,
      uploadDate: Timestamp.now(),
      createdAt: Timestamp.now(),
    };

    const documentRef = await adminFirestore
      .collection('users')
      .doc(clientId)
      .collection('documents')
      .add(documentData);

    return NextResponse.json({
      success: true,
      documentId: documentRef.id,
      document: {
        id: documentRef.id,
        ...documentData,
        uploadDate: documentData.uploadDate.toDate().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload document' },
      { status: 500 }
    );
  }
}
