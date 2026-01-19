# Creating Test Appointments

Since the script has Firebase Admin initialization issues, here are alternative ways to create test appointments:

## Option 1: Create via Web UI (Recommended)

1. **Log in as admin:**
   - Go to http://localhost:9002/login
   - Email: `admin@whitelabeled.ca`
   - Password: `!23$Vpac`

2. **Create appointments:**
   - Click "Create Appointment" button on the dashboard
   - Select a client (or create one if needed)
   - Select a staff member
   - Choose dates for the next 3 days (today, tomorrow, day after)
   - Select times (e.g., 9:00 AM, 10:00 AM, 2:00 PM, etc.)
   - Add a reason
   - Click "Create Appointment"

3. **Confirm appointments:**
   - Go to the appointments list
   - Mark appointments as "confirmed" (you may need to update them in Firestore directly or through the UI)

## Option 2: Create via API (Using Browser Console)

1. **Log in and get your token:**
   ```javascript
   // In browser console after logging in
   const token = await firebase.auth().currentUser.getIdToken();
   console.log('Token:', token);
   ```

2. **Create appointments via API:**
   ```javascript
   // Copy the token from above, then run:
   const token = 'YOUR_TOKEN_HERE';
   
   // Create appointments for next 3 days
   const today = new Date();
   const appointments = [];
   
   for (let day = 0; day < 3; day++) {
     const date = new Date(today);
     date.setDate(today.getDate() + day);
     
     const times = [
       { hour: 9, minute: 0 },
       { hour: 10, minute: 30 },
       { hour: 14, minute: 0 },
     ];
     
     for (const time of times) {
       const startTime = new Date(date);
       startTime.setHours(time.hour, time.minute, 0, 0);
       const endTime = new Date(startTime);
       endTime.setMinutes(endTime.getMinutes() + 30);
       
       appointments.push({
         clientId: null, // Will use clientEmail
         clientEmail: 'david@whitelabeled.ca', // Change to your client email
         staffId: 'YOUR_STAFF_ID', // Get from Firestore users collection
         startTime: startTime.toISOString(),
         endTime: endTime.toISOString(),
         reason: 'Test appointment',
       });
     }
   }
   
   // Create all appointments
   for (const appointment of appointments) {
     try {
       const response = await fetch('http://localhost:9002/api/bookings/create', {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${token}`,
           'Content-Type': 'application/json',
         },
         body: JSON.stringify(appointment),
       });
       const result = await response.json();
       console.log('Created:', result);
     } catch (error) {
       console.error('Error:', error);
     }
   }
   ```

3. **Update appointments to confirmed status:**
   ```javascript
   // Get appointments and update them to confirmed
   // This requires Firestore access or API endpoint
   ```

## Option 3: Use Firebase Console Directly

1. Go to Firebase Console → Firestore Database
2. Navigate to `appointments` collection
3. Click "Add document"
4. Create appointments with these fields:
   ```json
   {
     "clientId": "client-user-id",
     "clientEmail": "client@example.com",
     "clientName": "Client Name",
     "staffId": "staff-user-id",
     "startTime": "2024-01-20T14:00:00Z", // Use Timestamp
     "endTime": "2024-01-20T14:30:00Z", // Use Timestamp
     "status": "confirmed",
     "confirmationStatus": "confirmed",
     "meetingLink": null,
     "isUrgent": false,
     "confirmationRequestSent": false,
     "reminderSent": false,
     "createdAt": "2024-01-19T12:00:00Z"
   }
   ```

## Quick Test: Create One Appointment via UI

The fastest way:

1. Log in as admin at http://localhost:9002/login
2. Click "Create Appointment" on dashboard
3. Fill in:
   - Client: Select or enter email
   - Staff: Select yourself or another staff member
   - Date: Today or tomorrow
   - Time: Any available slot
   - Reason: "Test appointment"
4. Click "Create Appointment"
5. Repeat for 2-3 more appointments across the next 3 days

## Verify Appointments Are Ready

After creating appointments, verify they have:
- ✅ `confirmationStatus: 'confirmed'`
- ✅ `meetingLink: null` (so batch process can create links)
- ✅ `startTime` within next 3 days

Then log in as admin again to trigger batch meeting creation!
