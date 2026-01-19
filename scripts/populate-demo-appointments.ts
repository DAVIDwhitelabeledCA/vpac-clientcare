import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { getAdminFirestore } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Script to populate the calendar with demo appointments for this week
 * Creates appointments with various times throughout the week
 */

interface DemoAppointment {
  clientEmail: string;
  clientName: string;
  staffEmail: string;
  date: Date;
  hour: number;
  minute: number;
  reason: string;
}

// Demo appointments for this week
function generateDemoAppointments(): DemoAppointment[] {
  const today = new Date();
  const appointments: DemoAppointment[] = [];
  
  // Get the start of the week (Sunday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  // Generate appointments for each day of the week (Monday-Friday)
  const weekDays = [1, 2, 3, 4, 5]; // Monday to Friday
  
  // Sample clients and staff from mock data
  const clients = [
    { email: 'david@whitelabeled.ca', name: 'David Penny' },
    { email: 'Andrew@email.com', name: 'Andrew' },
    { email: 'sarah.l@gmail.com', name: 'Sarah Lee' },
    { email: 'jessica.c@yahoo.ca', name: 'Jessica Chan' },
    { email: 'rsmith@corp.com', name: 'Robert Smith' },
  ];
  
  const staffEmails = [
    'kai@whitelabeled.ca',
    'michele@email.com',
    'guoli@email.com',
  ];
  
  const appointmentTimes = [
    { hour: 9, minute: 0 },
    { hour: 10, minute: 30 },
    { hour: 11, minute: 0 },
    { hour: 13, minute: 0 },
    { hour: 14, minute: 30 },
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
  
  weekDays.forEach((dayOffset) => {
    const appointmentDate = new Date(startOfWeek);
    appointmentDate.setDate(startOfWeek.getDate() + dayOffset);
    
    // Create 2-4 appointments per day
    const appointmentsPerDay = Math.floor(Math.random() * 3) + 2;
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

async function populateDemoAppointments() {
  try {
    const firestore = getAdminFirestore();
    
    console.log('📅 Generating demo appointments for this week...');
    const demoAppointments = generateDemoAppointments();
    console.log(`Generated ${demoAppointments.length} appointments`);
    
    // First, get all existing users to see what we have
    const usersRef = firestore.collection('users');
    const allUsersSnapshot = await usersRef.get();
    
    console.log(`\n📋 Found ${allUsersSnapshot.size} users in the system:`);
    const allUsers = allUsersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Get staff user IDs (try to find any staff, or use office_assistant as fallback)
    const staffMap = new Map<string, string>();
    const staffEmails = Array.from(new Set(demoAppointments.map(a => a.staffEmail)));
    
    // Find all staff/office_assistant users
    const availableStaff = allUsers.filter(u => 
      (u.role === 'staff' || u.role === 'office_assistant') && u.email
    );
    
    console.log(`\n👨‍⚕️  Available staff (${availableStaff.length}):`);
    availableStaff.forEach(s => console.log(`  - ${s.email} (${s.role})`));
    
    // Map demo staff emails to available staff (round-robin if needed)
    let staffIndex = 0;
    for (const email of staffEmails) {
      // Try to find exact match first
      const exactMatch = availableStaff.find(s => s.email === email);
      if (exactMatch) {
        staffMap.set(email, exactMatch.id);
        console.log(`✅ Mapped staff: ${email} -> ${exactMatch.id}`);
      } else if (availableStaff.length > 0) {
        // Use round-robin assignment
        const assignedStaff = availableStaff[staffIndex % availableStaff.length];
        staffMap.set(email, assignedStaff.id);
        console.log(`✅ Mapped staff: ${email} -> ${assignedStaff.email} (${assignedStaff.id})`);
        staffIndex++;
      } else {
        console.warn(`⚠️  No staff available for: ${email}`);
      }
    }
    
    // Get client user IDs
    const clientMap = new Map<string, string>();
    const clientEmails = Array.from(new Set(demoAppointments.map(a => a.clientEmail)));
    
    // Find all client users
    const availableClients = allUsers.filter(u => u.role === 'client' && u.email);
    
    console.log(`\n👤 Available clients (${availableClients.length}):`);
    availableClients.forEach(c => console.log(`  - ${c.email}`));
    
    // Map demo client emails to available clients (round-robin if needed)
    let clientIndex = 0;
    for (const email of clientEmails) {
      // Try to find exact match first
      const exactMatch = availableClients.find(c => c.email === email);
      if (exactMatch) {
        clientMap.set(email, exactMatch.id);
        console.log(`✅ Mapped client: ${email} -> ${exactMatch.id}`);
      } else if (availableClients.length > 0) {
        // Use round-robin assignment
        const assignedClient = availableClients[clientIndex % availableClients.length];
        clientMap.set(email, assignedClient.id);
        console.log(`✅ Mapped client: ${email} -> ${assignedClient.email} (${assignedClient.id})`);
        clientIndex++;
      } else {
        console.warn(`⚠️  No clients available for: ${email}`);
      }
    }
    
    if (availableStaff.length === 0) {
      console.error('\n❌ No staff users found! Please create staff users first.');
      console.log('   You can create an admin user with: npx tsx scripts/create-admin-user.ts');
      process.exit(1);
    }
    
    if (availableClients.length === 0) {
      console.warn('\n⚠️  No client users found. Appointments will be created without clientId.');
    }
    
    // Create appointments
    const appointmentsRef = firestore.collection('appointments');
    let created = 0;
    let skipped = 0;
    
    for (const appointment of demoAppointments) {
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
        console.log(`⏭️  Appointment already exists for ${appointment.clientName} at ${startTime.toLocaleString()}`);
        skipped++;
        continue;
      }
      
      const appointmentData = {
        clientId: clientId || null,
        clientEmail: appointment.clientEmail,
        clientName: appointment.clientName,
        staffId,
        startTime: Timestamp.fromDate(startTime),
        endTime: Timestamp.fromDate(endTime),
        isUrgent: false,
        status: 'scheduled' as const,
        meetingLink: null,
        createdAt: new Date().toISOString(),
        confirmationRequestSent: false,
        confirmationStatus: null,
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
    
    console.log('\n🎉 Demo appointments populated!');
    console.log(`✅ Created: ${created}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`📊 Total: ${demoAppointments.length}`);
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error populating demo appointments:', error);
    process.exit(1);
  }
}

populateDemoAppointments();
