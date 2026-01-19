# Calendar Flow Testing Guide

## Prerequisites

1. **Environment Variables** (for OAuth to work):
   - `GOOGLE_CLIENT_ID` - Your Google OAuth Client ID
   - `GOOGLE_CLIENT_SECRET` - Your Google OAuth Client Secret
   - `MICROSOFT_CLIENT_ID` - Your Microsoft App Client ID (optional)
   - `MICROSOFT_CLIENT_SECRET` - Your Microsoft App Client Secret (optional)
- `NEXT_PUBLIC_APP_URL` - Your app URL (defaults to http://localhost:9002)

2. **Firebase Admin Setup**:
   - For local development, you may need to set up Firebase Admin credentials
   - For Firebase App Hosting, credentials are provided automatically

## Testing Steps

### 1. Start the Development Server
```bash
npm run dev
```
Server should start on http://localhost:9002

### 2. Login as Staff
- Navigate to http://localhost:9002/login
- Login with a staff account (or create one)
- You should be redirected to the dashboard

### 3. Connect Google Calendar (Optional)
- Navigate to Settings → Integrations
- Click "Google Calendar & Meet" accordion
- Click "Connect Google Account"
- Complete OAuth flow
- You should see a success message and the connection status

### 4. Connect Microsoft Calendar (Optional)
- Navigate to Settings → Integrations
- Click "Microsoft Calendar & Teams" accordion
- Click "Connect Microsoft Account"
- Complete OAuth flow
- You should see a success message and the connection status

### 5. Set Availability
- Navigate to Schedule page
- You should see a weekly calendar view
- **Drag to select** time slots to mark as available
- Time slots will turn blue when selected
- If you connected Google/Microsoft, conflicts will show in orange
- Booked appointments will show in red
- Click "Save" to persist your availability

### 6. Verify Data in Firestore
- Check Firestore console
- Navigate to `users/{userId}/availability_blocks`
- You should see documents with `startTime` and `endTime` fields

## Expected Behavior

### Availability Calendar
- **Blue slots** = Available (selected by staff)
- **Red slots** = Booked appointments
- **Orange slots** = Conflicts with external calendars (Google/Microsoft)
- **White slots** = Unavailable

### OAuth Flow
- Clicking "Connect" should redirect to Google/Microsoft
- After authorization, you should be redirected back to Settings
- Connection status should update immediately
- Calendar conflicts should appear in the availability calendar

## Troubleshooting

### OAuth Not Working
- Check that environment variables are set correctly
- Verify redirect URIs match in OAuth provider settings
- Check browser console for errors

### Calendar Conflicts Not Showing
- Verify OAuth connection was successful in Settings
- Check browser console for API errors
- Ensure calendar has events in the selected week

### Availability Not Saving
- Check Firestore rules allow writes to `users/{userId}/availability_blocks`
- Verify user is authenticated
- Check browser console for errors

### Firebase Admin Errors
- For local dev, you may need to set `FIREBASE_SERVICE_ACCOUNT` environment variable
- Or use Firebase App Hosting which provides credentials automatically
