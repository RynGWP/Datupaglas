

import axios from 'axios';
import nodecron from 'node-cron';
import { db } from "../../config/db.js";
import dotenv from 'dotenv';

dotenv.config();

class SMSController {
    // Initialize controller
    constructor() {
        this.initializeReminders();
    }

    // Send SMS method
    async sendSMS(phoneNumber, message) {
        try {
            // Format phone number (remove leading 0 and add +63)
            const formattedNumber = phoneNumber.startsWith('0') 
                ? '+63' + phoneNumber.substring(1) 
                : phoneNumber;

            const response = await axios.post('https://api.semaphore.co/api/v4/messages', {
                apikey: process.env.SMS_API_KEY,
                number: formattedNumber,
                message: message,
                sendername: process.env.SENDER_NAME
            });

            console.log('SMS Sent:', response.data);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('SMS Error:', error.response?.data || error.message);
            return { success: false, error: error.message };
        }
    }

    // Get tomorrow's appointments
    async getTomorrowAppointments() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() +1);
        const formattedDate = tomorrow.toISOString().split('T')[0];

        try {
            const query = `
                SELECT 
                    p.first_name,
                    p.parent_first_name, 
                    p.parent_last_name, 
                    p.contact_number, 
                    v.schedule_date
                FROM patients p
                JOIN vaccination_schedules v ON p.patient_id = v.patient_id
                WHERE v.schedule_date = $1
                AND p.contact_number IS NOT NULL
            `;
            console.log('Querying for appointments on:', formattedDate);
            const { rows } = await db.query(query, [formattedDate]);
            return rows;
        } catch (error) {
            console.error('Database Error:', error);
            return [];
        }
    }

    // Initialize cron job for reminders
    initializeReminders() {
        nodecron.schedule('52 14 * * *', async () => {  // Scheduled to run daily at 9 AM
            console.log('Starting daily reminder check:', new Date().toISOString());
            await this.processReminders();
        });
    }

    // Process and send reminders
    async processReminders() {
        try {
            const appointments = await this.getTomorrowAppointments();
    
            if (appointments.length === 0) {
                console.log('No appointments found for tomorrow');
                return;
            }
    
            // Keep track of sent messages by contact number and child's name (first_name)
            const sentMessages = new Set();
    
            for (const appointment of appointments) {
                try {
                    const { 
                        first_name,    // Child's first name
                        parent_first_name, 
                        parent_last_name, 
                        contact_number, 
                        schedule_date
                    } = appointment;
    
                    // Create a unique key by combining contact_number and child's first_name
                    const messageKey = `${contact_number}-${first_name}`;
    
                    // Check if the reminder for this child (first_name) has already been sent
                    if (sentMessages.has(messageKey)) {
                        continue;
                    }
    
                    // Format date for message
                    const formattedDate = new Date(schedule_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
    
                    const message = `Hi ${parent_first_name} ${parent_last_name}, your child's immunization appointment is scheduled on ${formattedDate}. Child's name: ${first_name}.`;
    
                    const smsResult = await this.sendSMS(contact_number, message);
    
                    if (!smsResult.success) {
                        console.error(`Failed to send SMS to ${contact_number}:`, smsResult.error);
                    } else {
                        // Mark this child (message) as sent by adding to the set
                        sentMessages.add(messageKey);
                    }
    
                    // Add delay between messages to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 1000));
    
                } catch (error) {
                    console.error('Error processing individual reminder:', error);
                }
            }
        } catch (error) {
            console.error('Error in processReminders:', error);
        }
    }
    

    // Method to manually trigger SMS (for testing)
    async sendTestSMS(phoneNumber, message) {
        return await this.sendSMS(phoneNumber, message);
    }
}

// Create and export a single instance
const smsController = new SMSController();
export default smsController;



