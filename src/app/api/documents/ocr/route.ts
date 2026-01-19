import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminApp } from '@/lib/firebase-admin';
import { ImageAnnotatorClient } from '@google-cloud/vision';

interface VisionApiResponse {
  responses: Array<{
    textAnnotations?: Array<{
      description: string;
      boundingPoly?: {
        vertices: Array<{ x: number; y: number }>;
      };
    }>;
    fullTextAnnotation?: {
      text: string;
    };
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string || 'general';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
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
    await adminAuth.verifyIdToken(token);

    // Convert file to base64
    const fileBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(fileBuffer).toString('base64');

    // Initialize Vision API client using Firebase Admin credentials
    const adminApp = getAdminApp();
    const visionClient = new ImageAnnotatorClient({
      projectId: adminApp.options.projectId,
      // Credentials are automatically picked up from the Firebase Admin SDK
    });

    // Perform text detection
    const [result] = await visionClient.textDetection({
      image: { content: base64Image },
    });

    // Extract text from OCR response
    const fullTextAnnotation = result.fullTextAnnotation;
    const extractedText = fullTextAnnotation?.text || '';

    // Parse structured data based on document type
    let structuredData: Record<string, any> = {};
    
    if (documentType === 'insurance_card') {
      // Extract insurance card fields
      structuredData = parseInsuranceCard(extractedText);
    } else if (documentType === 'id') {
      // Extract ID fields
      structuredData = parseIdCard(extractedText);
    } else {
      structuredData = { rawText: extractedText };
    }

    return NextResponse.json({
      success: true,
      ocrData: {
        text: extractedText,
        structuredData,
        documentType,
      },
    });
  } catch (error: any) {
    console.error('Error performing OCR:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to perform OCR' },
      { status: 500 }
    );
  }
}

function parseInsuranceCard(text: string): Record<string, any> {
  // Simple regex-based parsing for insurance cards
  // In production, use more sophisticated NLP or ML models
  const data: Record<string, any> = {};
  
  // Extract member ID (typically alphanumeric, 8-20 chars)
  const memberIdMatch = text.match(/(?:member|id|subscriber)[\s:]*([A-Z0-9]{8,20})/i);
  if (memberIdMatch) {
    data.memberId = memberIdMatch[1];
  }
  
  // Extract group number
  const groupMatch = text.match(/(?:group|grp)[\s:]*([A-Z0-9]{4,15})/i);
  if (groupMatch) {
    data.groupNumber = groupMatch[1];
  }
  
  // Extract policy number
  const policyMatch = text.match(/(?:policy|pol)[\s:]*([A-Z0-9]{6,20})/i);
  if (policyMatch) {
    data.policyNumber = policyMatch[1];
  }
  
  // Extract insurance company name (common patterns)
  const insuranceCompanies = ['Blue Cross', 'Aetna', 'UnitedHealthcare', 'Cigna', 'Humana', 'Medicaid', 'Medicare'];
  for (const company of insuranceCompanies) {
    if (text.includes(company)) {
      data.insuranceCompany = company;
      break;
    }
  }
  
  return data;
}

function parseIdCard(text: string): Record<string, any> {
  // Simple regex-based parsing for ID cards
  const data: Record<string, any> = {};
  
  // Extract name (typically on first line or after "NAME")
  const nameMatch = text.match(/(?:name|n)[\s:]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i);
  if (nameMatch) {
    data.name = nameMatch[1];
  }
  
  // Extract date of birth (various formats)
  const dobMatch = text.match(/(?:dob|birth|born)[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
  if (dobMatch) {
    data.dateOfBirth = dobMatch[1];
  }
  
  // Extract ID number (typically numeric, 6-12 digits)
  const idMatch = text.match(/(?:id|dl|license)[\s#:]*([A-Z0-9]{6,12})/i);
  if (idMatch) {
    data.idNumber = idMatch[1];
  }
  
  // Extract address
  const addressMatch = text.match(/(\d+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:ST|STREET|AVE|AVENUE|RD|ROAD|BLVD|BOULEVARD|DR|DRIVE))/i);
  if (addressMatch) {
    data.address = addressMatch[1];
  }
  
  return data;
}
