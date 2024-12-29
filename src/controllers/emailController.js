const nodemailer = require('nodemailer');
const cron = require('node-cron');

class EmailSender {
  constructor(config) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.password
      }
    });
    this.scheduledJobs = new Map();
  }

  async sendEmail(options) {
    try {
      const mailOptions = {
        from: this.transporter.options.auth.user,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        cc: options.cc,
        bcc: options.bcc,
        attachments: options.attachments
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Message sent successfully:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Schedule an email to be sent according to a cron pattern
   * @param {string} jobId - Unique identifier for the scheduled job
   * @param {string} cronPattern - Cron pattern (e.g., '0 8 * * *' for daily at 8 AM)
   * @param {Object} emailOptions - Email configuration options
   * @returns {boolean} - Whether the job was successfully scheduled
   */
  scheduleEmail(jobId, cronPattern, emailOptions) {
    try {
      // Validate cron pattern
      if (!cron.validate(cronPattern)) {
        throw new Error('Invalid cron pattern');
      }

      // Cancel existing job with same ID if it exists
      this.cancelScheduledEmail(jobId);

      // Schedule new job
      const job = cron.schedule(cronPattern, () => {
        this.sendEmail(emailOptions)
          .catch(error => console.error(`Scheduled email ${jobId} failed:`, error));
      });

      // Store job reference
      this.scheduledJobs.set(jobId, job);
      
      console.log(`Email scheduled with ID ${jobId}, pattern: ${cronPattern}`);
      return true;
    } catch (error) {
      console.error('Error scheduling email:', error);
      return false;
    }
  }

  /**
   * Cancel a scheduled email job
   * @param {string} jobId - ID of the job to cancel
   * @returns {boolean} - Whether the job was successfully cancelled
   */
  cancelScheduledEmail(jobId) {
    const job = this.scheduledJobs.get(jobId);
    if (job) {
      job.stop();
      this.scheduledJobs.delete(jobId);
      console.log(`Cancelled scheduled email with ID ${jobId}`);
      return true;
    }
    return false;
  }

  /**
   * List all scheduled email jobs
   * @returns {Array} - Array of job IDs and their cron patterns
   */
  listScheduledEmails() {
    return Array.from(this.scheduledJobs.keys());
  }
}

// Example usage
async function main() {
  // Create email sender instance
  const emailSender = new EmailSender({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    user: 'your.email@gmail.com',
    password: 'your-app-specific-password'
  });

  // Schedule a daily morning update email
  emailSender.scheduleEmail(
    'daily-morning-update',
    '0 8 * * *',  // Every day at 8 AM
    {
      to: 'recipient@example.com',
      subject: 'Daily Morning Update',
      text: 'Here is your daily morning update...',
      html: '<h1>Daily Morning Update</h1><p>Here is your daily morning update...</p>'
    }
  );

  // Schedule a weekly report email
  emailSender.scheduleEmail(
    'weekly-report',
    '0 9 * * MON',  // Every Monday at 9 AM
    {
      to: 'team@example.com',
      subject: 'Weekly Report',
      text: 'Here is your weekly report...',
      html: '<h1>Weekly Report</h1><p>Here is your weekly report...</p>'
    }
  );

  // Schedule a monthly newsletter
  emailSender.scheduleEmail(
    'monthly-newsletter',
    '0 10 1 * *',  // First day of every month at 10 AM
    {
      to: ['subscriber1@example.com', 'subscriber2@example.com'],
      subject: 'Monthly Newsletter',
      text: 'Here is your monthly newsletter...',
      html: '<h1>Monthly Newsletter</h1><p>Here is your monthly newsletter...</p>'
    }
  );

  // List all scheduled jobs
  console.log('Scheduled emails:', emailSender.listScheduledEmails());
}

// Run the example if this file is run directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = EmailSender;