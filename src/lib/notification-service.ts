/**
 * Notification service for sending appointment-related messages
 * Handles sending notifications to both clients and their treatment center contacts
 */

import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

export interface AppointmentNotification {
  clientId: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  appointmentDate: string;
  appointmentTime: string;
  staffName: string;
  meetingLink?: string;
  message?: string;
  isSameDayReminder?: boolean; // If true, sends email to treatment center instead of SMS
}

export interface TreatmentContact {
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  provider?: string;
}

/**
 * Fetches treatment contact information for a client
 */
export async function getTreatmentContact(
  firestore: Firestore,
  clientId: string
): Promise<TreatmentContact | null> {
  try {
    const userDocRef = doc(firestore, 'users', clientId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data();

    // Only return treatment contact if client is a treatment client
    if (userData.treatmentClient === 'Yes' || userData.treatmentClient === true) {
      return {
        contactName: userData.treatmentContact || undefined,
        contactPhone: userData.treatmentPhone || undefined,
        contactEmail: userData.treatmentEmail || undefined,
        provider: userData.treatmentProvider || undefined,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching treatment contact:', error);
    return null;
  }
}

/**
 * Prepares notification recipients for an appointment
 * Returns both client and treatment contact information if applicable
 */
export async function prepareAppointmentRecipients(
  firestore: Firestore,
  notification: AppointmentNotification
): Promise<{
  clientRecipient: {
    name: string;
    phone?: string;
    email?: string;
  };
  treatmentRecipient?: {
    name: string;
    phone: string;
    provider?: string;
  };
}> {
  const clientRecipient = {
    name: notification.clientName,
    phone: notification.clientPhone,
    email: notification.clientEmail,
  };

  // Check if client has a treatment contact
  const treatmentContact = await getTreatmentContact(firestore, notification.clientId);

  let treatmentRecipient: {
    name: string;
    phone: string;
    provider?: string;
  } | undefined;

  if (treatmentContact?.contactName && treatmentContact?.contactPhone) {
    treatmentRecipient = {
      name: treatmentContact.contactName,
      phone: treatmentContact.contactPhone,
      provider: treatmentContact.provider,
    };
  }

  return {
    clientRecipient,
    treatmentRecipient,
  };
}

/**
 * Formats an appointment notification message for clients
 */
export function formatClientMessage(notification: AppointmentNotification): string {
  const dateTime = `${notification.appointmentDate} at ${notification.appointmentTime}`;
  let message = `Hi ${notification.clientName}, you have an appointment with ${notification.staffName} on ${dateTime}.`;

  if (notification.meetingLink) {
    message += ` Meeting link: ${notification.meetingLink}`;
  }

  if (notification.message) {
    message += ` ${notification.message}`;
  }

  return message;
}

/**
 * Formats an appointment notification message for treatment center contacts (SMS)
 */
export function formatTreatmentContactMessage(
  notification: AppointmentNotification,
  clientName: string
): string {
  const dateTime = `${notification.appointmentDate} at ${notification.appointmentTime}`;
  return `Hi, ${clientName} has an appointment with ${notification.staffName} on ${dateTime}. Please ensure they are available.`;
}

/**
 * Formats an email for treatment center with list of all clients with appointments that day
 */
export function formatTreatmentCenterEmail(
  appointments: Array<{
    clientName: string;
    appointmentTime: string;
    staffName: string;
    meetingLink?: string;
  }>,
  appointmentDate: string,
  treatmentProvider: string
): { subject: string; body: string } {
  const subject = `Appointment Reminders - ${appointmentDate} - ${treatmentProvider}`;
  
  let body = `Dear ${treatmentProvider} Team,\n\n`;
  body += `This is a reminder that the following clients have appointments scheduled for ${appointmentDate}:\n\n`;
  
  appointments.forEach((appt, index) => {
    body += `${index + 1}. ${appt.clientName}\n`;
    body += `   Time: ${appt.appointmentTime}\n`;
    body += `   Provider: ${appt.staffName}\n`;
    if (appt.meetingLink) {
      body += `   Meeting Link: ${appt.meetingLink}\n`;
    }
    body += `\n`;
  });
  
  body += `Please ensure all clients are available for their scheduled appointments.\n\n`;
  body += `Thank you,\n`;
  body += `VPAC Client Care System`;
  
  return { subject, body };
}

/**
 * Gets all clients with appointments on a specific date for a treatment provider
 */
export async function getClientsWithAppointmentsForDate(
  firestore: Firestore,
  appointmentDate: string,
  treatmentProvider: string
): Promise<Array<{
  clientId: string;
  clientName: string;
  appointmentTime: string;
  staffName: string;
  meetingLink?: string;
}>> {
  try {
    // Query all users who are treatment clients with this provider
    const usersRef = collection(firestore, 'users');
    const treatmentClientsQuery = query(
      usersRef,
      where('role', '==', 'client'),
      where('treatmentClient', '==', 'Yes'),
      where('treatmentProvider', '==', treatmentProvider)
    );
    
    const treatmentClientsSnapshot = await getDocs(treatmentClientsQuery);
    const clientIds = treatmentClientsSnapshot.docs.map(doc => doc.id);
    
    if (clientIds.length === 0) {
      return [];
    }
    
    // Query appointments for these clients on the specified date
    // Note: Firestore 'in' queries are limited to 10 items, so we batch them
    const appointmentsRef = collection(firestore, 'appointments');
    const appointments: Array<{
      clientId: string;
      clientName: string;
      appointmentTime: string;
      staffName: string;
      meetingLink?: string;
    }> = [];
    
    // Process in batches of 10 (Firestore limit)
    for (let i = 0; i < clientIds.length; i += 10) {
      const batch = clientIds.slice(i, i + 10);
      const appointmentsQuery = query(
        appointmentsRef,
        where('clientId', 'in', batch),
        where('date', '==', appointmentDate)
      );
      
        // For each appointment in this batch, get client details
      for (const apptDoc of appointmentsSnapshot.docs) {
        const apptData = apptDoc.data();
        const clientDoc = await getDoc(doc(firestore, 'users', apptData.clientId));
        
        if (clientDoc.exists()) {
          const clientData = clientDoc.data();
          const staffDoc = await getDoc(doc(firestore, 'users', apptData.staffId));
          const staffName = staffDoc.exists() 
            ? `${staffDoc.data().firstName} ${staffDoc.data().lastName}`
            : 'Unknown';
          
          appointments.push({
            clientId: apptData.clientId,
            clientName: `${clientData.firstName} ${clientData.lastName}`,
            appointmentTime: apptData.time || apptData.startTime || 'TBD',
            staffName,
            meetingLink: apptData.meetingLink,
          });
        }
      }
    }
    
    return appointments.sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));
  } catch (error) {
    console.error('Error getting clients with appointments:', error);
    return [];
  }
}

/**
 * Sends email notification (placeholder for email service integration)
 */
export async function sendEmailNotification(
  to: string,
  subject: string,
  body: string
): Promise<{ success: boolean; error?: string }> {
  // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
  console.log(`[EMAIL] To: ${to}`);
  console.log(`[EMAIL] Subject: ${subject}`);
  console.log(`[EMAIL] Body:\n${body}`);

  // In production, this would call your email service:
  // const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${sendGridApiKey}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     personalizations: [{ to: [{ email: to }] }],
  //     from: { email: 'noreply@vpac-clientcare.com' },
  //     subject: subject,
  //     content: [{ type: 'text/plain', value: body }],
  //   }),
  // });

  return { success: true };
}

/**
 * Sends SMS notification via OpenPhone API
 */
export async function sendSMSNotification(
  phoneNumber: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const { sendOpenPhoneSMS } = await import('@/lib/openphone-api');
  const OPENPHONE_PHONE_NUMBER_ID = process.env.OPENPHONE_PHONE_NUMBER_ID;

  if (!OPENPHONE_PHONE_NUMBER_ID) {
    console.warn('[SMS] OPENPHONE_PHONE_NUMBER_ID not configured, logging message instead');
    console.log(`[SMS] To: ${phoneNumber}`);
    console.log(`[SMS] Message: ${message}`);
    return { success: true }; // Return success for backwards compatibility
  }

  const result = await sendOpenPhoneSMS({
    phoneNumberId: OPENPHONE_PHONE_NUMBER_ID,
    to: phoneNumber,
    text: message,
  });

  if (!result.success) {
    console.error(`[SMS] Failed to send: ${result.error}`);
  }

  return result;
}

/**
 * Sends appointment notification to client and treatment contact (if applicable)
 * For same-day reminders, sends email to treatment center with all appointments for that day
 */
export async function sendAppointmentNotification(
  firestore: Firestore,
  notification: AppointmentNotification
): Promise<{
  clientSent: boolean;
  treatmentContactSent: boolean;
  errors?: string[];
}> {
  const errors: string[] = [];
  let clientSent = false;
  let treatmentContactSent = false;

  try {
    const { clientRecipient, treatmentRecipient } = await prepareAppointmentRecipients(
      firestore,
      notification
    );

    // Send to client
    if (clientRecipient.phone) {
      const clientMessage = formatClientMessage(notification);
      const result = await sendSMSNotification(clientRecipient.phone, clientMessage);
      if (result.success) {
        clientSent = true;
      } else {
        errors.push(`Failed to send SMS to client: ${result.error}`);
      }
    } else {
      errors.push('Client phone number not available');
    }

    // Send to treatment contact if applicable
    if (treatmentRecipient) {
      const treatmentContact = await getTreatmentContact(firestore, notification.clientId);
      
      if (notification.isSameDayReminder && treatmentContact?.contactEmail) {
        // Same-day reminder: Send email to treatment center with all appointments for that day
        const userDocRef = doc(firestore, 'users', notification.clientId);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();
        const treatmentProvider = userData?.treatmentProvider || 'Treatment Center';
        
        // Get all clients with appointments for this treatment provider on this date
        const allAppointments = await getClientsWithAppointmentsForDate(
          firestore,
          notification.appointmentDate,
          treatmentProvider
        );
        
        if (allAppointments.length > 0) {
          const { subject, body } = formatTreatmentCenterEmail(
            allAppointments,
            notification.appointmentDate,
            treatmentProvider
          );
          
          const result = await sendEmailNotification(
            treatmentContact.contactEmail,
            subject,
            body
          );
          
          if (result.success) {
            treatmentContactSent = true;
          } else {
            errors.push(
              `Failed to send email to treatment center (${treatmentContact.contactEmail}): ${result.error}`
            );
          }
        } else {
          errors.push('No appointments found for treatment center on this date');
        }
      } else if (treatmentRecipient.phone) {
        // Regular notification: Send SMS to treatment contact
        const treatmentMessage = formatTreatmentContactMessage(
          notification,
          notification.clientName
        );
        const result = await sendSMSNotification(treatmentRecipient.phone, treatmentMessage);
        if (result.success) {
          treatmentContactSent = true;
        } else {
          errors.push(
            `Failed to send SMS to treatment contact (${treatmentRecipient.name}): ${result.error}`
          );
        }
      } else {
        errors.push('Treatment contact phone number not available');
      }
    }

    return {
      clientSent,
      treatmentContactSent,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error('Error sending appointment notification:', error);
    return {
      clientSent: false,
      treatmentContactSent: false,
      errors: [`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}
