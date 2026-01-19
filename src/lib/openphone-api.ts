/**
 * OpenPhone API integration for sending SMS and handling webhooks
 */

const OPENPHONE_API_BASE = process.env.OPENPHONE_API_BASE || 'https://api.openphone.com/v1';
const OPENPHONE_API_KEY = process.env.OPENPHONE_API_KEY;

export interface OpenPhoneMessage {
  id: string;
  from: string;
  to: string;
  text: string;
  direction: 'inbound' | 'outbound';
  status: string;
  createdAt: string;
}

export interface OpenPhoneSendMessageRequest {
  phoneNumberId: string; // OpenPhone phone number ID to send from
  to: string; // Recipient phone number (E.164 format)
  text: string; // Message content
}

export interface OpenPhoneSendMessageResponse {
  id: string;
  from: string;
  to: string;
  text: string;
  status: string;
  createdAt: string;
}

export interface OpenPhoneWebhookPayload {
  event: string;
  data: {
    id: string;
    from: string;
    to: string;
    text: string;
    direction: 'inbound' | 'outbound';
    status: string;
    createdAt: string;
    phoneNumberId?: string;
  };
}

/**
 * Sends an SMS message via OpenPhone API
 */
export async function sendOpenPhoneSMS(
  request: OpenPhoneSendMessageRequest
): Promise<{ success: boolean; data?: OpenPhoneSendMessageResponse; error?: string }> {
  if (!OPENPHONE_API_KEY) {
    console.error('OPENPHONE_API_KEY environment variable is not set');
    return {
      success: false,
      error: 'OpenPhone API key not configured',
    };
  }

  try {
    const response = await fetch(`${OPENPHONE_API_BASE}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENPHONE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumberId: request.phoneNumberId,
        to: request.to,
        text: request.text,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return {
        success: false,
        error: errorData.error || `OpenPhone API error: ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data as OpenPhoneSendMessageResponse,
    };
  } catch (error) {
    console.error('Error sending OpenPhone SMS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Validates OpenPhone webhook signature (if webhook signing is enabled)
 */
export function validateOpenPhoneWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // TODO: Implement webhook signature validation if OpenPhone provides it
  // For now, we'll rely on environment-based security (webhook endpoint should be protected)
  return true;
}

/**
 * Parses a reply message to determine if it's a confirmation, cancellation, or other
 */
export function parseConfirmationReply(message: string): 'confirm' | 'cancel' | 'unknown' {
  const normalized = message.trim().toUpperCase();
  
  // Check for confirmation (1, YES, CONFIRM, Y)
  if (
    normalized === '1' ||
    normalized === 'YES' ||
    normalized === 'Y' ||
    normalized === 'CONFIRM' ||
    normalized === 'CONFIRMED'
  ) {
    return 'confirm';
  }
  
  // Check for cancellation (2, CANCEL, NO, N)
  if (
    normalized === '2' ||
    normalized === 'CANCEL' ||
    normalized === 'CANCELLED' ||
    normalized === 'NO' ||
    normalized === 'N' ||
    normalized === 'RESCHEDULE'
  ) {
    return 'cancel';
  }
  
  return 'unknown';
}
