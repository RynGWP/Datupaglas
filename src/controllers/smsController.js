import axios from 'axios';
import nodecron from 'node-cron';
import { db } from "../../config/db.js";
import dotenv from 'dotenv';

dotenv.config();

class SMSController {
    constructor() {
        // Initialize a Set to track messages sent during the current day
        this.dailySentMessages = new Set();
        this.initializeReminders();
        
        // Reset the Set at midnight each day
        nodecron.schedule('0 0 0 * * *', () => {
            this.dailySentMessages.clear();
            console.log('Daily sent messages tracking reset at:', new Date().toISOString());
        });
    }

    async sendSMS(phoneNumber, message) {
        try {
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

    async getDueDate() {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 358);
        const formattedDate = dueDate.toISOString().split('T')[0];

        try {
            const query = `
                SELECT DISTINCT ON (t.taxpayer_id)
                    t.taxpayer_id,
                    t.firstname,
                    t.lastname,              
                    t.phone, 
                    s.due_date,
                    SUM(s.total_tax_amount) AS total_tax_amount,
                    COUNT(S.total_tax_amount) AS property_count
                FROM taxpayers t
                JOIN statement_of_account s ON t.taxpayer_id = s.taxpayer_id
                WHERE s.due_date = $1
                AND t.phone IS NOT NULL
                AND s.status = 'pending'
               GROUP BY 
                    t.taxpayer_id, t.firstname, t.lastname, t.phone, s.due_date
            `;
            console.log('Querying for due_date on:', formattedDate);
            const { rows } = await db.query(query, [formattedDate]);
            return rows;
        } catch (error) {
            console.error('Database Error:', error);
            return [];
        }
    }


// # ┌────────────── second (optional)
// # │ ┌──────────── minute
// # │ │ ┌────────── hour
// # │ │ │ ┌──────── day of month
// # │ │ │ │ ┌────── month
// # │ │ │ │ │ ┌──── day of week
// # │ │ │ │ │ │
// # │ │ │ │ │ │
// # * * * * * *

    // field	value
    
    // second	0-59
    // minute	0-59
    // hour  	0-23
    // day of month	1-31
    // month	1-12 (or names)
    // day of week	0-7 (or names, 0 or 7 are sunday)

    initializeReminders() {
        
        nodecron.schedule('* 0 * * *', async () => {
            console.log('Starting daily reminder check:', new Date().toISOString());
            await this.processReminders();
        });
    }

    async processReminders() {
        try {
            const dueDates = await this.getDueDate();
    
            if (dueDates.length === 0) {
                console.log('No Due date found for next week');
                return;
            }
    
            for (const dueDate of dueDates) {
                try {
                    const { 
                        taxpayer_id,
                        firstname,
                        lastname,
                        phone,
                        due_date,
                        total_tax_amount,
                        property_count
                    } = dueDate;
    
                    // Create a unique key using taxpayer_id
                    const messageKey = `${taxpayer_id}-${due_date}`;
    
                    // Check if we've already sent a message to this taxpayer today
                    if (this.dailySentMessages.has(messageKey)) {
                        console.log(`Message already sent today to taxpayer ${taxpayer_id}`);
                        continue;
                    }
    
                    const formattedAmount = new Intl.NumberFormat('en-PH', {
                        style: 'currency',
                        currency: 'PHP'
                    }).format(total_tax_amount);

                    const formattedDate = new Date(due_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
    
                    const message = `Hi ${firstname} ${lastname}, we would like to inform you that your tax due date is on ${formattedDate}. The total tax amount for your ${property_count} property/properties is ${formattedAmount}. Please ensure that your payment is made on or before the due date to avoid any penalties.
                
                     Thank you`;

                    const smsResult = await this.sendSMS(phone, message);
    
                    if (smsResult.success) {
                        // Add to the set of sent messages only if the SMS was sent successfully
                        this.dailySentMessages.add(messageKey);
                        console.log(`Successfully sent message to taxpayer ${taxpayer_id}`);
                    } else {
                        console.error(`Failed to send SMS to ${phone}:`, smsResult.error);
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

    async sendTestSMS(phoneNumber, message) {
        return await this.sendSMS(phoneNumber, message);
    }
}

const smsController = new SMSController();
export default smsController;



