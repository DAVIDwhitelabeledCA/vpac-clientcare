/**
 * Helper functions for appointment notifications
 * Use this when you have client information and want to send notifications
 */

import { getFirestore } from 'firebase/firestore';
import { sendAppointmentNotification, type AppointmentNotification } from './notification-service';

/**
 * Sends appointment notification to a client
 * Automatically includes treatment center contact if client is a treatment client
 * 
 * @param clientId - The Firestore user ID of the client
 * @param clientName - Name of the client
 * @param clientPhone - Phone number of the client
 * @param appointmentDate - Date of the appointment (e.g., "2024-01-15")
 * @param appointmentTime - Time of the appointment (e.g., "2:00 PM")
 * @param staffName - Name of the staff member
 * @param clientEmail - Email of the client (optional)
 * @param meetingLink - Virtual meeting link (optional)
 * @param customMessage - Additional message to include (optional)
 * @param isSameDayReminder - If true, sends email to treatment center with all appointments for that day (optional)
 */
export async function notifyClientOfAppointment(
  clientId: string,
  clientName: string,
  clientPhone: string,
  appointmentDate: string,
  appointmentTime: string,
  staffName: string,
  clientEmail?: string,
  meetingLink?: string,
  customMessage?: string,
  isSameDayReminder?: boolean
) {
  const firestore = getFirestore();
  
  if (!firestore) {
    throw new Error('Firestore not initialized');
  }

  const notification: AppointmentNotification = {
    clientId,
    clientName,
    clientPhone,
    clientEmail,
    appointmentDate,
    appointmentTime,
    staffName,
    meetingLink,
    message: customMessage,
    isSameDayReminder,
  };

  return await sendAppointmentNotification(firestore, notification);
}

/**
 * Example usage in a component:
 * 
 * ```tsx
 * import { notifyClientOfAppointment } from '@/lib/appointment-notification-helper';
 * 
 * const handleSendNotification = async () => {
 *   try {
 *     const result = await notifyClientOfAppointment(
 *       client.uid,
 *       client.name,
 *       client.phone,
 *       '2024-01-15',
 *       '2:00 PM',
 *       'Dr. Smith',
 *       client.email,
 *       'https://meet.google.com/...',
 *       'Please arrive 10 minutes early'
 *     );
 *     
 *     if (result.clientSent) {
 *       console.log('Client notified');
 *     }
 *     if (result.treatmentContactSent) {
 *       console.log('Treatment center also notified');
 *     }
 *   } catch (error) {
 *     console.error('Failed to send notification:', error);
 *   }
 * };
 * ```
 */
