/**
 * Client-side function to trigger batch meeting creation
 * Creates Microsoft Teams meetings for all appointments in the next 3 days
 */

import { useAuth } from '@/firebase';

/**
 * Get the current user's Firebase ID token for API authentication
 */
async function getIdToken(): Promise<string> {
  const { getAuth } = await import('firebase/auth');
  const auth = getAuth();
  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }
  return await auth.currentUser.getIdToken();
}

/**
 * Create Microsoft Teams meetings for all appointments in the next 3 days
 * Requires admin/staff authentication via bearer token
 */
export async function createBatchMicrosoftMeetings(): Promise<{
  success: boolean;
  summary: {
    total: number;
    created: number;
    skipped: number;
    failed: number;
  };
  dateRange: {
    start: string;
    end: string;
  };
  results: Array<{
    appointmentId: string;
    status: 'created' | 'skipped' | 'failed';
    meetingLink?: string;
    eventId?: string;
    reason?: string;
    error?: string;
  }>;
}> {
  const idToken = await getIdToken();
  const response = await fetch('/api/appointments/create-microsoft-meetings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create batch meetings');
  }

  return await response.json();
}
