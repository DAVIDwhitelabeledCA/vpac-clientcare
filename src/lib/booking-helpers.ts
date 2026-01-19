import { Firestore, collection, query, where, getDocs, Timestamp, Query } from 'firebase/firestore';

/**
 * Get the assigned doctor's user ID from a client's clinicDoctor email
 * Works with both Firestore Admin SDK and client SDK
 */
export async function getAssignedDoctorId(
  firestore: Firestore | any,
  clinicDoctorEmail: string
): Promise<string | null> {
  try {
    // Check if this is Firestore Admin SDK (has collection method that returns CollectionReference)
    const isAdmin = firestore && typeof firestore.collection === 'function' && !firestore.type;
    
    if (isAdmin) {
      // Firestore Admin SDK
      const usersRef = firestore.collection('users');
      const doctorQuery = usersRef
        .where('email', '==', clinicDoctorEmail)
        .where('role', '==', 'staff')
        .limit(1);
      
      const snapshot = await doctorQuery.get();
      if (snapshot.empty) {
        return null;
      }
      
      return snapshot.docs[0].id;
    } else {
      // Client SDK
      const usersRef = collection(firestore, 'users');
      const doctorQuery = query(
        usersRef,
        where('email', '==', clinicDoctorEmail),
        where('role', '==', 'staff')
      );
      
      const snapshot = await getDocs(doctorQuery);
      if (snapshot.empty) {
        return null;
      }
      
      return snapshot.docs[0].id;
    }
  } catch (error) {
    console.error('Error getting assigned doctor ID:', error);
    return null;
  }
}

/**
 * Check if a time slot is available for a staff member
 * Returns true if the slot doesn't conflict with existing appointments
 */
export async function checkSlotAvailability(
  firestore: Firestore | any, // Accept Firestore Admin or client SDK
  staffId: string,
  startTime: Date,
  endTime: Date
): Promise<boolean> {
  try {
    // Handle both Firestore Admin SDK and client SDK
    const isAdmin = firestore && typeof firestore.collection === 'function' && !firestore.type;
    
    let appointmentsSnapshot;
    if (isAdmin) {
      // Firestore Admin SDK
      const appointmentsRef = firestore.collection('appointments');
      appointmentsSnapshot = await appointmentsRef
        .where('staffId', '==', staffId)
        .get();
    } else {
      // Client SDK
      const appointmentsRef = collection(firestore, 'appointments');
      const conflictQuery = query(
        appointmentsRef,
        where('staffId', '==', staffId)
      );
      appointmentsSnapshot = await getDocs(conflictQuery);
    }
    
    const start = startTime.getTime();
    const end = endTime.getTime();
    
    for (const doc of appointmentsSnapshot.docs) {
      const appt = doc.data();
      if (!appt.startTime || !appt.endTime || appt.status === 'cancelled') continue;
      
      // Handle both Timestamp and Date
      let apptStart: number;
      let apptEnd: number;
      
      if (appt.startTime.toDate) {
        // Firestore Timestamp
        apptStart = appt.startTime.toDate().getTime();
        apptEnd = appt.endTime.toDate().getTime();
      } else if (appt.startTime instanceof Date) {
        apptStart = appt.startTime.getTime();
        apptEnd = appt.endTime.getTime();
      } else {
        continue;
      }
      
      // Check for overlap
      if ((start < apptEnd && end > apptStart)) {
        return false; // Conflict found
      }
    }
    
    return true; // No conflicts
  } catch (error) {
    console.error('Error checking slot availability:', error);
    return false;
  }
}

/**
 * Calculate available time slots from availability blocks and appointments
 */
export function calculateAvailableSlots(
  availabilityBlocks: Array<{ startTime: Date | Timestamp; endTime: Date | Timestamp }>,
  appointments: Array<{ startTime: Date | Timestamp; endTime: Date | Timestamp; status?: string }>,
  slotDurationMinutes: number = 15
): Array<{ start: Date; end: Date }> {
  const availableSlots: Array<{ start: Date; end: Date }> = [];
  
  // Convert Timestamps to Dates
  const blocks = availabilityBlocks.map(block => ({
    start: block.startTime instanceof Timestamp ? block.startTime.toDate() : block.startTime,
    end: block.endTime instanceof Timestamp ? block.endTime.toDate() : block.endTime,
  }));
  
  const booked = appointments
    .filter(appt => appt.status !== 'cancelled')
    .map(appt => ({
      start: appt.startTime instanceof Timestamp ? appt.startTime.toDate() : appt.startTime,
      end: appt.endTime instanceof Timestamp ? appt.endTime.toDate() : appt.endTime,
    }));
  
  // For each availability block, generate slots
  for (const block of blocks) {
    let current = new Date(block.start);
    
    while (current < block.end) {
      const slotEnd = new Date(current.getTime() + slotDurationMinutes * 60 * 1000);
      
      // Check if this slot overlaps with any booked appointment
      const hasConflict = booked.some(appt => {
        return current < appt.end && slotEnd > appt.start;
      });
      
      if (!hasConflict && slotEnd <= block.end) {
        availableSlots.push({
          start: new Date(current),
          end: new Date(slotEnd),
        });
      }
      
      current = new Date(current.getTime() + slotDurationMinutes * 60 * 1000);
    }
  }
  
  // Sort by start time
  return availableSlots.sort((a, b) => a.start.getTime() - b.start.getTime());
}
