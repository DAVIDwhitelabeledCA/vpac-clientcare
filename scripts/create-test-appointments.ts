import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { getAdminFirestore } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Script to create test appointments for the next 3 days
 * These appointments are confirmed and ready for batch meeting creation
 */

interface TestAppointment {
  clientEmail: string;
  clientName: string;
  staffEmail: string;
  date: Date;
  hour: number;
  minute: number;
  reason: string;
  clientPhone?: string;
}

// Generate test appointments for the next 3 days
function generateTestAppointments(): TestAppointment[] {
  const today = new Date();
  const appointments: TestAppointment[] = [];
  
  // Generate appointments for today, tomorrow, and day after tomorrow
  const days = [0, 1, 2]; // Today, +1 day, +2 days
  
  // Sample clients
  const clients = [
    { email: 'david@whitelabeled.ca', name: 'David Penny', phone: '+1234567890' },
    { email: 'Andrew@email.com', name: 'Andrew', phone: '+1234567891' },
    { email: 'sarah.l@gmail.com', name: 'Sarah Lee', phone: '+1234567892' },
    { email: 'jessica.c@yahoo.ca', name: 'Jessica Chan', phone: '+1234567893' },
    { email: 'rsmith@corp.com', name: 'Robert Smith', phone: '+1234567894' },
  ];
  
  const staffEmails = [
    'kai@whitelabeled.ca',
    'michele@email.com',
    'guoli@email.com',
  ];
  
  // Appointment times throughout the day
  const appointmentTimes = [
    { hour: 9, minute: 0 },
    { hour: 10, minute: 0 },
    { hour: 11, minute: 0 },
    { hour: 13, minute: 0 },
    { hour: 14, minute: 0 },
    { hour: 15, minute: 0 },
    { hour: 16, minute: 0 },
  ];
  
  const reasons = [
    'Follow-up consultation',
    'Initial consultation',
    'Medication review',
    'General checkup',
    'Treatment planning',
    'Progress review',
    'Routine appointment',
  ];
  
  let clientIndex = 0;
  let reasonIndex = 0;
  
  days.forEach((dayOffset) => {
    const appointmentDate = new Date(today);
    appointmentDate.setDate(today.getDate() + dayOffset);
    appointmentDate.setHours(0, 0, 0, 0); // Start of day
    
    // Create 2-3 appointments per day
    const appointmentsPerDay = Math.min(3, appointmentTimes.length);
    const selectedTimes = appointmentTimes
      .sort(() => Math.random() - 0.5)
      .slice(0, appointmentsPerDay)
      .sort((a, b) => a.hour - b.hour || a.minute - b.minute);
    
    selectedTimes.forEach((time) => {
      const client = clients[clientIndex % clients.length];
      const staffEmail = staffEmails[Math.floor(Math.random() * staffEmails.length)];
      const reason = reasons[reasonIndex % reasons.length];
      
      appointments.push({
        clientEmail: client.email,
        clientName: client.name,
        clientPhone: client.phone,
        staffEmail,
        date: new Date(appointmentDate),
        hour: time.hour,
        minute: time.minute,
        reason,
      });
      
      clientIndex++;
      reasonIndex++;
    });
  });
  
  return appointments;
}

async function createTestAppointments() {
  try {
    const firestore = getAdminFirestore();
    
    console.log('📅 Creating test appointments for the next 3 days...');
    const testAppointments = generateTestAppointments();
    console.log(`Generated ${testAppointments.length} test appointments\n`);
    
    // Get all existing users
    const usersRef = firestore.collection('users');
    const allUsersSnapshot = await usersRef.get();
    
    console.log(`📋 Found ${allUsersSnapshot.size} users in the system\n`);
    const allUsers = allUsersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Get staff user IDs
    const staffMap = new Map<string, string>();
    const staffEmails = Array.from(new Set(testAppointments.map(a => a.staffEmail)));
    
    const availableStaff = allUsers.filter(u => 
      (u.role === 'staff' || u.role === 'office_assistant') && u.email
    );
    
    console.log(`👨‍⚕️  Available staff (${availableStaff.length}):`);
    availableStaff.forEach(s => console.log(`  - ${s.email} (${s.role})`));
    console.log('');
    
    // Map demo staff emails to available staff
    let staffIndex = 0;
    for (const email of staffEmails) {
      const exactMatch = availableStaff.find(s => s.email?.toLowerCase() === email.toLowerCase());
      if (exactMatch) {
        staffMap.set(email, exactMatch.id);
        console.log(`✅ Mapped staff: ${email} -> ${exactMatch.id}`);
      } else if (availableStaff.length > 0) {
        const assignedStaff = availableStaff[staffIndex % availableStaff.length];
        staffMap.set(email, assignedStaff.id);
        console.log(`✅ Mapped staff: ${email} -> ${assignedStaff.email} (${assignedStaff.id})`);
        staffIndex++;
      } else {
        console.warn(`⚠️  No staff available for: ${email}`);
      }
    }
    console.log('');
    
    // Get client user IDs
    const clientMap = new Map<string, string>();
    const clientEmails = Array.from(new Set(testAppointments.map(a => a.clientEmail)));
    
    const availableClients = allUsers.filter(u => u.role === 'client' && u.email);
    
    console.log(`👤 Available clients (${availableClients.length}):`);
    availableClients.forEach(c => console.log(`  - ${c.email}`));
    console.log('');
    
    // Map demo client emails to available clients
    let clientIndex = 0;
    for (const email of clientEmails) {
      const exactMatch = availableClients.find(c => c.email?.toLowerCase() === email.toLowerCase());
      if (exactMatch) {
        clientMap.set(email, exactMatch.id);
        console.log(`✅ Mapped client: ${email} -> ${exactMatch.id}`);
      } else if (availableClients.length > 0) {
        const assignedClient = availableClients[clientIndex % availableClients.length];
        clientMap.set(email, assignedClient.id);
        console.log(`✅ Mapped client: ${email} -> ${assignedClient.email} (${assignedClient.id})`);
        clientIndex++;
      } else {
        console.warn(`⚠️  No clients available for: ${email}`);
      }
    }
    console.log('');
    
    if (availableStaff.length === 0) {
      console.error('❌ No staff users found! Please create staff users first.');
      console.log('   You can create an admin user with: npx tsx scripts/create-admin-user.ts');
      process.exit(1);
    }
    
    // Create appointments
    const appointmentsRef = firestore.collection('appointments');
    let created = 0;
    let skipped = 0;
    let updated = 0;
    
    for (const appointment of testAppointments) {
      const staffId = staffMap.get(appointment.staffEmail);
      const clientId = clientMap.get(appointment.clientEmail);
      
      if (!staffId) {
        console.warn(`⚠️  Skipping appointment - staff not found: ${appointment.staffEmail}`);
        skipped++;
        continue;
      }
      
      // Create date with time
      const startTime = new Date(appointment.date);
      startTime.setHours(appointment.hour, appointment.minute, 0, 0);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 30); // 30-minute appointments
      
      // Check if appointment already exists
      const existingQuery = appointmentsRef
        .where('staffId', '==', staffId)
        .where('startTime', '==', Timestamp.fromDate(startTime))
        .limit(1);
      const existing = await existingQuery.get();
      
      if (!existing.empty) {
        // Update existing appointment to confirmed status if needed
        const existingDoc = existing.docs[0];
        const existingData = existingDoc.data();
        
        if (existingData.confirmationStatus !== 'confirmed' || existingData.meetingLink) {
          await existingDoc.ref.update({
            confirmationStatus: 'confirmed',
            status: 'confirmed',
            meetingLink: null, // Clear meeting link so it can be recreated
            clientPhone: appointment.clientPhone || existingData.clientPhone,
          });
          updated++;
          console.log(`🔄 Updated appointment: ${appointment.clientName} at ${startTime.toLocaleString()}`);
        } else {
          console.log(`⏭️  Appointment already confirmed: ${appointment.clientName} at ${startTime.toLocaleString()}`);
          skipped++;
        }
        continue;
      }
      
      // Create new appointment with confirmed status
      const appointmentData = {
        clientId: clientId || null,
        clientEmail: appointment.clientEmail,
        clientName: appointment.clientName,
        clientPhone: appointment.clientPhone || null,
        staffId,
        startTime: Timestamp.fromDate(startTime),
        endTime: Timestamp.fromDate(endTime),
        isUrgent: false,
        status: 'confirmed' as const,
        confirmationStatus: 'confirmed' as const,
        meetingLink: null, // No meeting link yet - will be created by batch process
        createdAt: Timestamp.now(),
        confirmationRequestSent: false,
        reminderSent: false,
      };
      
      const appointmentRef = await appointmentsRef.add(appointmentData);
      
      // Create appointment detail with reason
      if (appointmentRef.id) {
        const detailsRef = appointmentRef.collection('details');
        await detailsRef.add({
          appointmentId: appointmentRef.id,
          reason: appointment.reason,
          notes: null,
        });
      }
      
      created++;
      console.log(`✅ Created appointment: ${appointment.clientName} with ${appointment.staffEmail} on ${startTime.toLocaleDateString()} at ${startTime.toLocaleTimeString()}`);
    }
    
    console.log('\n🎉 Test appointments created!');
    console.log(`✅ Created: ${created}`);
    console.log(`🔄 Updated: ${updated}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`📊 Total processed: ${testAppointments.length}`);
    console.log('\n💡 These appointments are confirmed and ready for batch meeting creation.');
    console.log('   Log in as admin to trigger automatic meeting link creation.');
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error creating test appointments:', error);
    process.exit(1);
  }
}

createTestAppointments();
