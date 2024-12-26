import nodecron from 'node-cron';
import { db } from "../../config/db.js";

class AnnualTaxUpdater {
    constructor() {
        this.initializeCronJob();
    }

    // Query existing tax data
    async fetchTaxData() {
        try {
            const query = `
                SELECT 
                    taxpayer_id,
                    total_tax_amount,
                    other_tax_data, -- Include any other columns you need
                    due_date
                FROM statement_of_account
                WHERE EXTRACT(YEAR FROM due_date) = EXTRACT(YEAR FROM CURRENT_DATE)  -- Ensure it's current year data
            `;

            const { rows } = await db.query(query);
            return rows;
        } catch (error) {
            console.error('Error fetching tax data:', error);
            return [];
        }
    }

    // Insert new tax records for the next year
    async insertNextYearTaxData(taxData) {
        try {
            const insertQuery = `
                INSERT INTO statement_of_account (taxpayer_id, total_tax_amount, other_tax_data, due_date)
                VALUES ($1, $2, $3, $4)
            `;

            for (const record of taxData) {
                const { taxpayer_id, total_tax_amount, other_tax_data, due_date } = record;

                // Calculate the next year's due date
                const nextYearDueDate = new Date(due_date);
                nextYearDueDate.setFullYear(nextYearDueDate.getFullYear() + 1);

                // Insert the new record
                await db.query(insertQuery, [
                    taxpayer_id,
                    total_tax_amount,
                    other_tax_data,
                    nextYearDueDate.toISOString().split('T')[0]
                ]);

                console.log(`Inserted new tax record for taxpayer ${taxpayer_id} with due date ${nextYearDueDate.toISOString().split('T')[0]}`);
            }
        } catch (error) {
            console.error('Error inserting tax data for next year:', error);
        }
    }

    // Process the annual tax data update
    async processAnnualUpdate() {
        try {
            const currentTaxData = await this.fetchTaxData();
            if (currentTaxData.length === 0) {
                console.log('No tax data found for the current year.');
                return;
            }

            await this.insertNextYearTaxData(currentTaxData);
            console.log('Annual tax data update completed successfully.');
        } catch (error) {
            console.error('Error processing annual tax update:', error);
        }
    }

    // Schedule the cron job
    initializeCronJob() {
        // Schedule to run annually on January 1st at 12:00 AM
        nodecron.schedule('0 0 1 1 *', async () => {
            console.log('Starting annual tax data update:', new Date().toISOString());
            await this.processAnnualUpdate();
        });
    }
}

// Initialize the updater
const taxUpdater = new AnnualTaxUpdater();
export default taxUpdater;
