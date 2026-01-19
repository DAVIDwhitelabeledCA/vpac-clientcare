# Testing Microsoft Teams & Google Meet Batch Meeting Creation

This guide will help you test the batch meeting creation feature that creates Microsoft Teams or Google Meet links for appointments.

## Prerequisites

1. **Dev server running**: `npm run dev` (should be running on http://localhost:9002)
2. **Admin user account**: Login credentials (default: admin@whitelabeled.ca / !23$Vpac)
3. **Appointments**: At least one confirmed appointment scheduled for the next 3 days
4. **Calendar Integration**: Either Microsoft Teams or Google Calendar connected (or both)

## Test Scenarios

### Scenario 1: Test with Microsoft Integration

**Setup:**
1. Log in as admin user
2. Go to Settings page (`/settings`)
3. Connect Microsoft account (if not already connected)
4. Ensure you have at least one confirmed appointment for the next 3 days

**Test Steps:**
1. Log in as admin user
2. Navigate to dashboard (`/`)
3. Check browser console for any errors
4. Look for toast notification: "Meetings Created" with count
5. Check Firestore `appointments` collection:
   - Appointments should have `meetingLink` field populated
   - Should have `microsoftEventId` and `microsoftWebLink` fields
   - `meetingLinkCreatedAt` timestamp should be set

**Expected Result:**
- Toast notification shows number of meetings created
- Appointments have Teams meeting links
- Calendar events created in Microsoft Outlook/Teams

### Scenario 2: Test with Google Meet Fallback

**Setup:**
1. Disconnect Microsoft integration (or use staff member without Microsoft)
2. Connect Google Calendar integration
3. Ensure appointments exist with staff who have Google integration

**Test Steps:**
1. Log in as admin user
2. Navigate to dashboard
3. Check toast notification
4. Verify appointments have Google Meet links instead

**Expected Result:**
- Falls back to Google Meet when Microsoft not available
- Appointments have `meetingLink` with Google Meet URL
- `googleEventId` and `googleWebLink` fields populated

### Scenario 3: Manual API Testing

**Test the batch endpoint directly:**

```bash
# Get Firebase ID token (from browser console after login)
# In browser console: firebase.auth().currentUser.getIdToken().then(console.log)

curl -X POST http://localhost:9002/api/appointments/create-microsoft-meetings \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "dateRange": {
    "start": "2024-01-19",
    "end": "2024-01-22"
  },
  "totalAppointments": 5,
  "results": [
    {
      "appointmentId": "...",
      "status": "created",
      "meetingLink": "https://teams.microsoft.com/...",
      "meetingType": "microsoft"
    }
  ],
  "summary": {
    "created": 5,
    "microsoft": 3,
    "google": 2,
    "skipped": 0,
    "failed": 0
  }
}
```

### Scenario 4: Test Individual Calendar Event Creation

**Test Microsoft event creation:**

```bash
curl -X POST http://localhost:9002/api/calendar/microsoft/event \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startTime": "2024-01-20T14:00:00Z",
    "endTime": "2024-01-20T14:30:00Z",
    "subject": "Test Appointment",
    "body": "Test description",
    "location": "Virtual",
    "attendees": ["client@example.com"],
    "isOnlineMeeting": true
  }'
```

**Expected Response:**
```json
{
  "eventId": "...",
  "webLink": "https://outlook.live.com/...",
  "teamsLink": "https://teams.microsoft.com/...",
  "subject": "Test Appointment",
  "start": {...},
  "end": {...},
  "onlineMeeting": {...}
}
```

## Verification Steps

### 1. Check Firestore Appointments

```javascript
// In Firebase Console or using Firestore SDK
// Check appointments collection:
- meetingLink: should contain Teams or Meet URL
- meetingLinkCreatedAt: should be recent timestamp
- microsoftEventId or googleEventId: should be present
- microsoftWebLink or googleWebLink: should be present
```

### 2. Check Calendar Integration

- **Microsoft**: Check Outlook calendar for new events
- **Google**: Check Google Calendar for new events with Meet links

### 3. Verify Meeting Links

- Click on meeting links in appointments
- Should open Teams or Google Meet
- Links should be valid and accessible

## Troubleshooting

### Issue: "No calendar integration found"
**Solution**: Connect either Microsoft or Google Calendar in Settings

### Issue: "Microsoft integration not found for staff member"
**Solution**: 
- Ensure staff member has connected Microsoft account
- Check `users/{staffId}/integrations/microsoft-teams` in Firestore

### Issue: "Failed to create calendar event"
**Solution**:
- Check Microsoft/Google API credentials in `.env.local`
- Verify OAuth tokens are valid
- Check browser console for detailed error messages

### Issue: No toast notification appears
**Solution**:
- Check browser console for errors
- Verify admin user is logged in
- Check network tab for API call to `/api/appointments/create-microsoft-meetings`

## Test Checklist

- [ ] Admin login triggers batch meeting creation
- [ ] Microsoft Teams meetings created when Microsoft integration available
- [ ] Google Meet meetings created when Microsoft not available
- [ ] Appointments updated with meeting links
- [ ] Calendar events appear in respective calendars
- [ ] Meeting links are valid and accessible
- [ ] Toast notification shows correct counts
- [ ] API endpoint returns correct summary
- [ ] Error handling works for missing integrations
- [ ] Multiple appointments processed correctly

## Next Steps

After testing:
1. Verify meeting links work for actual appointments
2. Test with real client emails
3. Verify calendar events sync correctly
4. Test with different timezones
5. Verify Teams/Meet links are sent in notifications
