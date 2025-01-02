
import nodemailer from 'nodemailer';
import nodecron from 'node-cron';
import { db } from "../../config/db.js";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Get current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EmailController {
    constructor() {
        // Initialize a Set to track emails sent during the current day
        this.dailySentEmails = new Set();
        this.initializeReminders();
        
        // Reset the Set at midnight each day
        nodecron.schedule('0 0 0 * * *', () => {
            this.dailySentEmails.clear();
            console.log('Daily sent emails tracking reset at:', new Date().toISOString());
        });
    }

    async sendEmail(to, subject, text, html, attachments) {
        try {
            const transporter = nodemailer.createTransport({
              host: 'smtp.gmail.com',
              port: 465,
              secure: true,
              auth: {
                  user: process.env.SENDER_EMAIL,
                  pass: process.env.SENDER_EMAIL_PASSWORD
              }
            });
 
            const mailOptions = {
                from: `"DATUPAGLAS" <${process.env.SENDER_EMAIL}>`,
                to,
                subject,
                text,
                html,
                attachments
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('Email Sent:', info.response);
            return { success: true, info };
        } catch (error) {
            console.error('Email Error:', error.message);
            return { success: false, error: error.message };
        }
    }

    async getDueDate() {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 363);
        const formattedDate = dueDate.toISOString().split('T')[0];

        try {
            // Modified query to ensure one record per taxpayer
            const query = `
                WITH RankedStatements AS (
                    SELECT 
                        t.taxpayer_id,
                        t.firstname,
                        t.lastname,
                        t.email,
                        s.due_date,
                        s.total_tax_amount,
                        ROW_NUMBER() OVER (PARTITION BY t.taxpayer_id ORDER BY s.due_date DESC) as rn
                    FROM taxpayers t
                    JOIN statement_of_account s ON t.taxpayer_id = s.taxpayer_id
                    WHERE s.due_date = $1
                    AND t.email IS NOT NULL
                    AND s.status = 'pending'
                )
                SELECT 
                    taxpayer_id,
                    firstname,
                    lastname,
                    email,
                    due_date,
                    total_tax_amount
                FROM RankedStatements
                WHERE rn = 1;
            `;
            
            console.log('Querying for due_date on:', formattedDate);
            const { rows } = await db.query(query, [formattedDate]);
            return rows;
        } catch (error) {
            console.error('Database Error:', error);
            return [];
        }
    }

    initializeReminders() {
        // Run at 11:01 AM every day
        nodecron.schedule(' 16 11 * * *', async () => {
            console.log('Starting daily email reminder check:', new Date().toISOString());
            await this.processReminders();
        });
    }

    async processReminders() {
        try {
            const dueDates = await this.getDueDate();
    
            if (dueDates.length === 0) {
                console.log('No due dates found for tomorrow');
                return;
            }
    
            const logoPath = path.join(__dirname, 'Seal_of_Datu_Paglas.png');
    
            for (const dueDate of dueDates) {
                const { 
                    taxpayer_id,
                    firstname,
                    lastname,
                    email,
                    due_date,
                    total_tax_amount
                } = dueDate;
    
                const emailKey = `${taxpayer_id}-${due_date}`;
    
                if (this.dailySentEmails.has(emailKey)) {
                    console.log(`Email already sent today to taxpayer ${taxpayer_id}`);
                    continue;
                }
    
                const formattedDate = new Date(due_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
    
                const subject = `Tax Due Reminder`;
                const text = `Hi ${firstname} ${lastname}, your tax due date is on ${formattedDate}. Total Amount: ${total_tax_amount}.`;
                const html = `
                    <div style="text-align: center;">
                        <img src="cid:logo" alt="Company Logo" style="width: 90px; margin-bottom: 20px;">
                    </div>
                    <p>Hi <strong>${firstname} ${lastname}</strong>,</p>
                    <p>Your tax due date is on <strong>${formattedDate}</strong>.</p>
                    <p>Total Amount: <strong>${total_tax_amount}</strong>.</p>
                `;
                
                const attachments = [{
                    filename: 'Seal_of_Datu_Paglas.png',
                    path: logoPath,
                    cid: 'logo'
                }];
    
                const emailResult = await this.sendEmail(email, subject, text, html, attachments);
    
                if (emailResult.success) {
                    this.dailySentEmails.add(emailKey);
                    console.log(`Successfully sent email to taxpayer ${taxpayer_id}`);
                } else {
                    console.error(`Failed to send email to ${email}:`, emailResult.error);
                }
    
                // Add small delay between emails
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } catch (error) {
            console.error('Error in processReminders:', error);
        }
    }
}

const emailController = new EmailController();
export default emailController;