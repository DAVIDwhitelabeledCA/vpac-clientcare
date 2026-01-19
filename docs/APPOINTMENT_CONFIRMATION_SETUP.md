# Appointment Confirmation Flow Setup

This document describes how to set up the automated appointment confirmation flow using OpenPhone.

## Overview

The system automatically:
1. **2 days before appointment**: Sends SMS confirmation request
2. **Monitors replies**: Processes client responses (1 = confirm, 2/CANCEL = cancel)
3. **Day of appointment**: Creates virtual meeting links for confirmed appointments
4. **2 hours before**: Sends reminder with meeting link

## Prerequisites

1. **OpenPhone Account**: You need an OpenPhone account with API access
2. **OpenPhone Phone Number**: A phone number configured in OpenPhone to send SMS from
3. **Environment Variables**: Configure the following in your `.env` file:

```bash
# OpenPhone API Configuration
OPENPHONE_API_KEY=your_openphone_api_key
OPENPHONE_API_BASE=https://api.openphone.com/v1  # Optional, defaults to this
OPENPHONE_PHONE_NUMBER_ID=your_phone_number_id  # The OpenPhone phone number ID to send from

# Optional: Scheduler authentication
SCHEDULER_SECRET=your_random_secret_key  # For protecting scheduled job endpoints
```

## Setting Up Scheduled Jobs

The system provides API endpoints that should be called on a schedule. You can use:

- **Vercel Cron Jobs** (if deployed on Vercel)
- **Firebase Cloud Functions** with scheduled triggers
- **External cron service** (e.g., cron-job.org, EasyCron)
- **Your own server** with a cron daemon

### 1. Send Confirmation Requests (2 Days Before)

**Endpoint**: `POST /api/appointments/send-confirmation-requests`

**Schedule**: Daily at 9:00 AM
```bash
# Cron expression: 0 9 * * *
# Or call manually:
curl -X POST https://your-domain.com/api/appointments/send-confirmation-requests \
  -H "Authorization: Bearer YOUR_SCHEDULER_SECRET"
```

**What it does**:
- Finds appointments scheduled for 2 days from now
- Sends SMS confirmation request to clients
- Marks appointments with `confirmationRequestSent: true`

### 2. Create Meeting Links (Day of Appointment)

**Endpoint**: `POST /api/appointments/create-meeting-links`

**Schedule**: Every hour
```bash
# Cron expression: 0 * * * *
# Or call manually:
curl -X POST https://your-domain.com/api/appointments/create-meeting-links \
  -H "Authorization: Bearer YOUR_SCHEDULER_SECRET"
```

**What it does**:
- Finds confirmed appointments for today without meeting links
- Creates Google Meet links (or other virtual meeting links)
- Updates appointments with `meetingLink` field

**Note**: Currently uses a placeholder for meeting link generation. You'll need to integrate with:
- Google Calendar API (for Google Meet)
- Microsoft Teams API (for Teams links)
- Or your preferred video conferencing platform

### 3. Send 2-Hour Reminders

**Endpoint**: `POST /api/appointments/send-reminders`

**Schedule**: Every 30 minutes
```bash
# Cron expression: */30 * * * *
# Or call manually:
curl -X POST https://your-domain.com/api/appointments/send-reminders \
  -H "Authorization: Bearer YOUR_SCHEDULER_SECRET"
```

**What it does**:
- Finds confirmed appointments starting in ~2 hours (within 30-minute window)
- Sends SMS reminder with meeting link
- Marks appointments with `reminderSent: true`

## OpenPhone Webhook Setup

1. **Configure Webhook URL** in your OpenPhone dashboard:
   ```
   https://your-domain.com/api/appointments/openphone-webhook
   ```

2. **Webhook Events**: Subscribe to `message.received` events

3. **Webhook Processing**:
   - Receives inbound SMS messages
   - Parses replies (1 = confirm, 2/CANCEL = cancel)
   - Updates appointment status in Firestore

## Appointment Status Flow

```
scheduled → (confirmation request sent) → pending → confirmed/cancelled
                                                      ↓
                                              (meeting link created)
                                                      ↓
                                              (reminder sent)
```

### Appointment Fields

New fields added to appointments:
- `confirmationRequestSent`: boolean - Whether confirmation SMS was sent
- `confirmationRequestSentAt`: Timestamp - When confirmation was sent
- `confirmationStatus`: string - `null`, `'pending'`, `'confirmed'`, `'cancelled'`
- `confirmedAt`: Timestamp - When appointment was confirmed
- `cancelledAt`: Timestamp - When appointment was cancelled
- `confirmationMessageId`: string - OpenPhone message ID for confirmation request
- `meetingLink`: string - Virtual meeting link (created on day of appointment)
- `meetingLinkCreatedAt`: Timestamp - When meeting link was created
- `reminderSent`: boolean - Whether 2-hour reminder was sent
- `reminderSentAt`: Timestamp - When reminder was sent
- `reminderMessageId`: string - OpenPhone message ID for reminder

## Testing

### Manual Testing

1. **Create a test appointment** 2 days in the future
2. **Call confirmation endpoint**:
   ```bash
   curl -X POST http://localhost:9002/api/appointments/send-confirmation-requests
   ```
3. **Check SMS** was sent (check OpenPhone dashboard or logs)
4. **Reply with "1"** from the client's phone
5. **Check appointment** status updated to `confirmed`
6. **On day of appointment**, call meeting link creation endpoint
7. **2 hours before**, call reminder endpoint

### Testing Webhook Locally

Use a tool like [ngrok](https://ngrok.com/) to expose your local server:

```bash
ngrok http 9002
# Use the ngrok URL in OpenPhone webhook settings
```

## Troubleshooting

### SMS Not Sending

1. Check `OPENPHONE_API_KEY` is set correctly
2. Verify `OPENPHONE_PHONE_NUMBER_ID` matches your OpenPhone phone number
3. Check OpenPhone API logs/dashboard for errors
4. Verify phone numbers are in E.164 format (e.g., +1234567890)

### Webhook Not Receiving Messages

1. Verify webhook URL is accessible (not behind firewall)
2. Check OpenPhone webhook configuration
3. Check server logs for incoming webhook requests
4. Verify webhook signature validation (if implemented)

### Appointments Not Found

1. Check Firestore indexes are created (may need composite indexes)
2. Verify appointment `startTime` is stored as Firestore Timestamp
3. Check timezone handling (all times should be in UTC or consistent timezone)

## Next Steps

1. **Integrate actual meeting link creation**:
   - Update `create-meeting-links` route to use Google Calendar API or Teams API
   - Store OAuth tokens for staff members who have calendar integrations

2. **Add retry logic**:
   - Retry failed SMS sends
   - Handle rate limiting from OpenPhone API

3. **Add monitoring**:
   - Log all confirmation flows
   - Set up alerts for failed sends
   - Track confirmation rates

4. **Improve message parsing**:
   - Handle variations in replies (e.g., "yes", "ok", "sure")
   - Add natural language processing if needed
