import { useAuth } from '@/firebase';

export interface CalendarBusySlot {
  start: string;
  end: string;
  summary?: string;
}

export interface CalendarAvailabilityResponse {
  busySlots: CalendarBusySlot[];
}

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
 * Initiate Google OAuth flow
 */
export async function initiateGoogleOAuth(): Promise<string> {
  const idToken = await getIdToken();
  const response = await fetch('/api/auth/google/authorize', {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to initiate Google OAuth');
  }

  const data = await response.json();
  return data.authUrl;
}

/**
 * Initiate Microsoft OAuth flow
 */
export async function initiateMicrosoftOAuth(): Promise<string> {
  const idToken = await getIdToken();
  const response = await fetch('/api/auth/microsoft/authorize', {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to initiate Microsoft OAuth');
  }

  const data = await response.json();
  return data.authUrl;
}

/**
 * Get Google Calendar availability
 */
export async function getGoogleCalendarAvailability(
  startTime: string,
  endTime: string,
  calendarId: string = 'primary'
): Promise<CalendarAvailabilityResponse> {
  const idToken = await getIdToken();
  const params = new URLSearchParams({
    startTime,
    endTime,
    calendarId,
  });

  const response = await fetch(`/api/calendar/google/availability?${params}`, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch Google Calendar availability');
  }

  return await response.json();
}

/**
 * Get Microsoft Calendar availability
 */
export async function getMicrosoftCalendarAvailability(
  startTime: string,
  endTime: string,
  calendarId: string = 'calendar'
): Promise<CalendarAvailabilityResponse> {
  const idToken = await getIdToken();
  const params = new URLSearchParams({
    startTime,
    endTime,
    calendarId,
  });

  const response = await fetch(`/api/calendar/microsoft/availability?${params}`, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch Microsoft Calendar availability');
  }

  return await response.json();
}

/**
 * Create a Google Meet link for an appointment
 */
export async function createGoogleMeetLink(
  startTime: string,
  endTime: string,
  summary?: string,
  description?: string,
  calendarId: string = 'primary'
): Promise<{ eventId: string; meetLink: string; htmlLink: string }> {
  const idToken = await getIdToken();
  const response = await fetch('/api/calendar/google/meet-link', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startTime,
      endTime,
      summary,
      description,
      calendarId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create Google Meet link');
  }

  return await response.json();
}
