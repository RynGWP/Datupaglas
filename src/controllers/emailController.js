

import nodemailer from 'nodemailer';
import nodecron from 'node-cron';
import { db } from "../../config/db.js";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

// Get current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EmailController {
    constructor() {
        // Initialize a Set to track emails sent during the current day
        this.dailySentEmails = new Set();
        this.isProcessing = false;
        this.RATE_LIMIT_DELAY = 5000; // 5 seconds between emails
        
        this.initializeReminders();
        
        // Reset the Set at midnight each day
        nodecron.schedule('0 0 * * *', () => {
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
            this.dailySentEmails.add(to);
            return { success: true, info };
        } catch (error) {
            console.error('Email Error:', error.message);
            return { success: false, error: error.message };
        }
    }

    async updateEmailNotificationStatus(taxpayerId, dueDate) {
        try {
            const query = `
                UPDATE invoice 
                SET email_notification_status = 'sent' 
                WHERE taxpayer_id = $1 
                AND due_date = $2 
                AND status = 'pending'
                AND email_notification_status = 'pending'
                RETURNING *
            `;
            
            const { rowCount } = await db.query(query, [taxpayerId, dueDate]);
            console.log(`Updated email notification status for taxpayer ${taxpayerId}. Rows affected: ${rowCount}`);
            return rowCount > 0;
        } catch (error) {
            console.error('Error updating email notification status:', error);
            return false;
        }
    }

    async getDueDate() {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 356);
        const formattedDate = dueDate.toISOString().split('T')[0];

        try {
            const query = `
                SELECT 
                    t.taxpayer_id,
                    t.firstname,
                    t.lastname,
                    t.email,
                    i.due_date,
                    SUM(i.total_tax_amount) AS total_tax_amount,
                    COUNT(i.total_tax_amount) AS property_count
                FROM 
                    taxpayers t
                JOIN 
                    invoice i ON t.taxpayer_id = i.taxpayer_id
                WHERE 
                    i.due_date = $1
                    AND t.email IS NOT NULL
                    AND i.status = 'pending'
                    AND i.email_notification_status = 'pending'
                GROUP BY 
                    t.taxpayer_id, t.firstname, t.lastname, t.email, i.due_date         
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
        nodecron.schedule('* * 0 * * *', async () => {
            console.log('Starting daily email reminder check:', new Date().toISOString());
            await this.processReminders();
        });
    }

    async processReminders() {
        if (this.isProcessing) {
            console.log('Already processing reminders, skipping...');
            return;
        }

        this.isProcessing = true;

        try {
            const dueDates = await this.getDueDate();
    
            if (dueDates.length === 0) {
                console.log('No due dates found for notifications');
                return;
            }
    
            const logoPath = path.join(__dirname, 'Seal_of_Datu_Paglas.png');
            
            if (!fs.existsSync(logoPath)) {
                console.error('Logo file not found:', logoPath);
                throw new Error('Logo file not found');
            }
    
            for (const dueDate of dueDates) {
                const { 
                    taxpayer_id,
                    firstname,
                    lastname,
                    email,
                    due_date,
                    total_tax_amount,
                    property_count,
                } = dueDate;

                // Skip if email was already sent today
                if (this.dailySentEmails.has(email)) {
                    console.log(`Email already sent today to ${email}, skipping...`);
                    continue;
                }

                const formattedDate = new Date(due_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                const formattedAmount = new Intl.NumberFormat('en-PH', {
                    style: 'currency',
                    currency: 'PHP'
                }).format(total_tax_amount);
    
                const subject = `Reminder: Upcoming Tax Due on ${formattedDate}`;
                const text = `Dear ${firstname} ${lastname},
                
                This is a friendly reminder that your tax payment is due on ${formattedDate}. The total tax amount for your ${property_count} property/properties is ${formattedAmount}. Please ensure that your payment is made on or before the due date to avoid any penalties.
                
                Thank you`;
                
                const html = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="text-align: center;">
                            <img src="cid:logo" alt="Municipality Logo" style="width: 60px; margin-bottom: 10px;">
                        </div>
                        <p style="text-align:center; font-size: 16px; font-weight: bold;">
                            REAL PROPERTY TAXATION NOTIFICATION AND INFORMATION SYSTEM FOR DATUPAGLAS MUNICIPALITY
                        </p>
                        <hr style="border: 1px solid #ddd; margin: 20px 0;">
                        
                        <p>Dear ${firstname} ${lastname},</p>
                        
                        <p>This is a friendly reminder that your tax payment is due on <strong>${formattedDate}</strong>.</p>
                        
                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 5px 0;">Number of Properties: <strong>${property_count}</strong></p>                      
                            <p style="margin: 5px 0;">Total Amount Due: <strong>${formattedAmount}</strong></p>
                        </div>
                        
                        <p>Please ensure that your payment is made on or before the due date to avoid any penalties.</p>
                        
                        <p>If you have any questions or need assistance, feel free to contact us at <strong>0928-728-0680</strong>.</p>
                        
                        <p>Thank you.</p>
                        
                        <hr style="border: 1px solid #ddd; margin: 20px 0;">
                        
                        <p style="font-size: 12px; color: #666; text-align: center;">
                            This is an automated message. Please do not reply to this email.
                        </p>
                    </div>
                `;
                
                const attachments = [{
                    filename: 'Seal_of_Datu_Paglas.png',
                    path: logoPath,
                    cid: 'logo'
                }];
                
                const emailResult = await this.sendEmail(email, subject, text, html, attachments);
    
                if (emailResult.success) {
                    const updateResult = await this.updateEmailNotificationStatus(taxpayer_id, due_date);
                    if (updateResult) {
                        console.log(`Successfully sent email and updated status for taxpayer ${taxpayer_id}`);
                    } else {
                        console.error(`Failed to update email notification status for taxpayer ${taxpayer_id}`);
                    }
                } else {
                    console.error(`Failed to send email to ${email}:`, emailResult.error);
                }
    
                // Add delay between emails
                await new Promise(resolve => setTimeout(resolve, this.RATE_LIMIT_DELAY));
            }
            
        } catch (error) {
            console.error('Error in processReminders:', error);
        } finally {
            this.isProcessing = false;
        }
    }
}

const emailController = new EmailController();
export default emailController;