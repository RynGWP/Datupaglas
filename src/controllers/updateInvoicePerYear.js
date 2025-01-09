import nodecron from 'node-cron';
import { db } from "../../config/db.js";


class DueDateUpdater {
    constructor() {
        this.scheduleUpdates();
    }

    async getDueDate() {
        try {
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);

            const dueDate = `
                SELECT 
                    id,
                    property_id,
                    firstname,
                    lastname,
                    taxpayer_id,
                    area_size,
                    classification,
                    property_use,
                    property_type,
                    assessment_level,
                    market_value,
                    tax_rate,
                    assessed_value,
                    total_tax_amount,
                    due_date,
                    tax_year,
                    status,
                    is_recurring,
                    penalty_amount,
                    penalty_percentage
                FROM 
                    invoice
                WHERE
                    (status != 'paid' OR (status = 'paid' AND is_recurring = true))
                   
                ORDER BY 
                    due_date ASC
            `;
            const { rows } = await db.query(dueDate);
            return rows;
        } catch (error) {
            console.error('Database Error:', error);
            return [];
        }
    }

    async calculateMonthsOverdue(dueDate) {
        const currentDate = new Date();
        const dueDateObj = new Date(dueDate);
        
        // Calculate months difference
        const months = (currentDate.getFullYear() - dueDateObj.getFullYear()) * 12 +
            (currentDate.getMonth() - dueDateObj.getMonth());
        
        return Math.max(0, months); // Ensure we don't return negative months
    }
 
    async calculateFees(monthsOverdue, total_tax_amount) {
        // Maximum penalty is 24% (12 months * 2% per month)
        const maxMonths = 12;
        const monthlyPenaltyRate = 0.02; // 2% per month
        
        // Cap the months at 12 for maximum 24% penalty
        const effectiveMonths = Math.min(monthsOverdue, maxMonths);
        const penaltyRate = effectiveMonths * monthlyPenaltyRate;
        const penaltyAmount = total_tax_amount * penaltyRate;
        
        return {
            penaltyAmount,
            newTotalAmount: total_tax_amount + penaltyAmount,
            penaltyPercentage: penaltyRate * 100
        };
    }

    async updateInvoice(id, newTotalAmount, penaltyAmount, penaltyPercentage) {
        try {
            const updateQuery = `
                UPDATE invoice
                SET 
                    total_tax_amount = $1,
                    penalty_amount = $2,
                    penalty_percentage = $3,
                    status = 'overdue',
                    last_updated = CURRENT_TIMESTAMP
                WHERE 
                    id = $4
                RETURNING *
            `;
            
            const values = [newTotalAmount, penaltyAmount, penaltyPercentage, id];
            const { rows } = await db.query(updateQuery, values);
            return rows[0];
        } catch (error) {
            console.error('Update Error:', error);
            throw error;
        }
    }

    async createNextYearInvoice(invoice) {
        try {
            const {
                taxpayer_id,
                property_id,
                firstname,
                lastname,
                area_size,
                classification,
                property_use,
                property_type,
                assessment_level,
                market_value,
                tax_rate,
                assessed_value,
                total_tax_amount,
                due_date,
                tax_year
            } = invoice;

            // Create due date for next year
            const nextDueDate = new Date(due_date);
            nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);

            // Only create next year's invoice if we're within 3 months of the next due date
            const currentDate = new Date();
            const monthsUntilNextDue = 
                ((nextDueDate.getFullYear() - currentDate.getFullYear()) * 12) +
                (nextDueDate.getMonth() - currentDate.getMonth());

            if (monthsUntilNextDue > 3) {
                console.log('Too early to create next year invoice');
                return null;
            }

            const insertQuery = `
                INSERT INTO invoice (
                    property_id,
                    firstname,
                    lastname,
                    taxpayer_id,
                    area_size,
                    classification,
                    property_use,
                    property_type,
                    assessment_level,
                    market_value,
                    tax_rate,
                    assessed_value,
                    total_tax_amount,
                    due_date,
                    tax_year,
                    status,
                    is_recurring,
                    created_at,
                    penalty_amount,
                    penalty_percentage
                )
                SELECT 
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 
                    'pending', true, CURRENT_TIMESTAMP, 0, 0
                WHERE NOT EXISTS (
                    SELECT 1 FROM invoice 
                    WHERE taxpayer_id = $4 
                    AND tax_year = $15
                    AND property_id = $1
                )
                RETURNING *
            `;

            const values = [
                property_id,
                firstname,
                lastname,
                taxpayer_id,
                area_size,
                classification,
                property_use,
                property_type,
                assessment_level,
                market_value,
                tax_rate,
                assessed_value,
                total_tax_amount,
                nextDueDate,
                tax_year + 1
            ];

            const { rows } = await db.query(insertQuery, values);
            
            if (rows.length > 0) {
                console.log(`Created next year's invoice for taxpayer ${taxpayer_id}, property ${property_id}`);
                return rows[0];
            } else {
                console.log(`Invoice for year ${tax_year + 1} already exists for taxpayer ${taxpayer_id}, property ${property_id}`);
                return null;
            }
        } catch (error) {
            console.error('Error creating next year invoice:', error);
            throw error;
        }
    }

    async handlePaidInvoice(invoice) {
        try {
            // Check if it's time to create next year's invoice
            const currentDate = new Date();
            const dueDate = new Date(invoice.due_date);
            
            // Calculate months until next due date
            const monthsUntilDue = 
                ((dueDate.getFullYear() - currentDate.getFullYear()) * 12) +
                (dueDate.getMonth() - currentDate.getMonth());

            // If we're within 3 months of the due date and next year's invoice hasn't been created
            if (monthsUntilDue <= 3) {
                // Check if next year's invoice already exists
                const checkQuery = `
                    SELECT id FROM invoice
                    WHERE 
                        taxpayer_id = $1 AND
                        tax_year = $2 AND
                        property_id = $3 AND
                        status = 'pending'
                `;
                
                const { rows } = await db.query(checkQuery, [
                    invoice.taxpayer_id,
                    invoice.tax_year + 1,
                    invoice.property_id
                ]);

                // Create next year's invoice if it doesn't exist
                if (rows.length === 0) {
                    await this.createNextYearInvoice(invoice);
                }
            }
        } catch (error) {
            console.error('Error handling paid invoice:', error);
            throw error;
        }
    }

    async validateInvoiceDate(dueDate) {
        const currentDate = new Date();
        const invoiceDate = new Date(dueDate);
        return invoiceDate <= currentDate;
    }

    async initializeUpdate() {
        try {
            const invoices = await this.getDueDate();
            
            for (const invoice of invoices) {
                const {
                    id,
                    due_date,
                    total_tax_amount,
                    status,
                    is_recurring
                } = invoice;

                // Validate invoice date before processing
                const isValidDate = await this.validateInvoiceDate(due_date);
                if (!isValidDate) {
                    console.log(`Skipping invoice ${id} - future date`);
                    continue;
                }

                if (status === 'paid' && is_recurring) {
                    // Handle paid invoices that are recurring
                    await this.handlePaidInvoice(invoice);
                    continue;
                }

                const monthsOverdue = await this.calculateMonthsOverdue(due_date);
                
                if (monthsOverdue > 0) {
                    const {
                        penaltyAmount,
                        newTotalAmount,
                        penaltyPercentage
                    } = await this.calculateFees(monthsOverdue, total_tax_amount);

                    await this.updateInvoice(
                        id,
                        newTotalAmount,
                        penaltyAmount,
                        penaltyPercentage
                    );
                }
            }
            
            console.log('Late fee and recurring invoice updates completed successfully');
        } catch (error) {
            console.error('Update process failed:', error);
        }
    }

    scheduleUpdates() {
        // Schedule to run daily at midnight
        nodecron.schedule('* * 0 * * *', async () => {
            console.log('Running scheduled updates ');
            try {
                await this.initializeUpdate();
                console.log('Scheduled updates completed successfully');
            } catch (error) {
                console.error('Error during scheduled updates:', error);
            }
        });
    }
    
}


const dueDateUpdater = new DueDateUpdater();
export default dueDateUpdater;



