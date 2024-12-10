import { db } from "../../config/db.js";

// Model to insert a patient into the database
async function addPatient(patientData) {
  const {
    firstName,
    lastName,
    email,
    contactNumber,
    birthday,
    registrationDate,
    barangay,
    gender,
    hashedPassword,
    parentFirstName,
    parentLastName
  } = patientData;

  try {
    const result = await db.query(
      `INSERT INTO patients (first_name, last_name, email, contact_number, birthday, registration_date, barangay, gender, password, parent_first_name, parent_last_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING patient_id`,
      [
        firstName,
        lastName,
        email,
        contactNumber,
        birthday,
        registrationDate,
        barangay,
        gender,
        hashedPassword,
        parentFirstName,
        parentLastName
      ]
    );

    // console.log("Inserting patient with user ID:", userId);

    return result.rows[0].patient_id;
  } catch (error) {
    console.error("Error adding patient", error.stack);
    throw error;
  }
}

// Model to insert a vaccination schedule into the database
async function addVaccinationSchedule(scheduleData) {
  const { patientId, scheduleDate, vaccines, barangay } = scheduleData;
  const formattedBarangay = `Barangay ${barangay}`;
  try {
    // Loop through each vaccine in the 'vaccines' array and insert it into the database
    for (const vaccine of vaccines) {
      await db.query(
        `INSERT INTO vaccination_schedules 
         (patient_id, schedule_date, vaccine_name, status, place_of_vaccination)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          patientId,
          scheduleDate.toISOString().split("T")[0],  // Format the date as YYYY-MM-DD
          vaccine,  // Insert the vaccine name
          'not taken',
          formattedBarangay
        ]
      );
    }
  } catch (error) {
    console.error("Error adding vaccination schedule", error.stack);
    throw error;
  }
}



//Model to fetch Patient Schedules from the database
async function getPatientSchedules(patientId) {
  try {
    const result = await db.query(
      `SELECT * FROM patients JOIN vaccination_schedules ON patients.patient_id = vaccination_schedules.patient_id
       WHERE patients.patient_id = $1 ORDER BY schedule_date ASC`,
      [patientId]
    );

    return result.rows;
  } catch (error) {
    console.error("Error fetching patient schedules:", error.stack);
    throw error;
  }
}



//Model to fetch Patient Schedules from the database
async function getChildren(email) {
  try {
    const result = await db.query(
      `SELECT * FROM patients p WHERE email = $1 ORDER BY first_name`,
      [email]
    );

    return result.rows;
  } catch (error) {
    console.error("Error fetching child or children:", error.stack);
    throw error;
  }
}


// Model to fetch patients registered by a specific user
async function getPatientsByBarangay(barangay) {
  try {
    const result = await db.query(
      `SELECT * FROM patients WHERE barangay = $1
      AND status = 'Approved'  ORDER BY first_name ASC; -- Order by firstName in ascending order`, // Adjust the order as necessary
      [barangay]
    );
    return result.rows;
  } catch (error) {
    console.error("Error fetching patients by user", error.stack);
    throw error;
  }
}

// Model to fetch patients registered by a specific user (pending)
async function getPendingPatientsByBarangay(barangay) {
  try {
    const result = await db.query(
      `SELECT * FROM patients WHERE barangay = $1 
      AND status = 'pending' ORDER BY registration_date DESC`,  // Adjust the order as necessary
      [barangay]
    );
    return result.rows;
  } catch (error) {
    console.error("Error fetching patients by user", error.stack);
    throw error;
  }
}

// Model to fetch patients registered by a specific user (pending)
async function updatePendingPatientsByBarangay(status, patientId) {
  try {
    const result = await db.query(
      `UPDATE patients SET status = $1 WHERE patient_id = $2`,  
      [status, patientId]
    );
    return result.rows;
  } catch (error) {
    console.error("Error fetching patients by user", error.stack);
    throw error;
  }
}


async function getVaccinationSchedules(userId) {
  try {
    const result = await db.query(
      `SELECT 
          p.patient_id,
          p.first_name || ' ' || p.last_name AS full_name,
          p.barangay,
          p.gender,
          vs.schedule_id,
          vs.schedule_date,
          vs.vaccine_name,
          vs.status
        FROM 
          patients p
        JOIN 
          vaccination_schedules vs
        ON 
          p.patient_id = vs.patient_id
        WHERE 
 
          p.barangay = $1  --  patient ID reference
        AND 
          vs.schedule_date =  '2025-12-3'  --CURRENT_DATE
         ORDER BY 
          p.first_name ASC`,
      [userId] 
    );

    // Return the result of the query
    return result.rows;  // Assuming you want to return the rows

  } catch (error) {
    console.log('Error fetching vaccination schedules', error.stack);
    throw error;
  }
}


async function getAllVaccinationSchedules(patientId) {
  try {
    const result = await db.query(
      `SELECT 
          p.patient_id,
          p.first_name || ' ' || p.last_name AS full_name,
          p.parent_first_name || ' ' || p.parent_last_name AS parent_full_name,
          p.birthday,
          vs.schedule_id,
          vs.schedule_date,
          vs.vaccine_name,
          vs.status,
          vs.place_of_vaccination
        FROM 
          patients p
        JOIN 
          vaccination_schedules vs
        ON 
          p.patient_id = vs.patient_id
        WHERE 
          p.patient_id = $1  --  patient ID reference 
        ORDER BY 
          p.first_name, p.last_name, vs.schedule_date`,
      [patientId]
    );

    // Return the result of the query
    return result.rows;  // Assuming you want to return the rows

  } catch (error) {
    console.log('Error fetching vaccination schedules', error.stack);
    throw error;
  }
}


async function updatePatient(patientId, updatedData) {
  try {
    const {
        firstName,
        lastName,
        email,
        contactNumber,
        birthday,
        registrationDate,
        barangay,
        gender
    } = updatedData;

    const result = await db.query(
      `UPDATE patients
       SET first_name = $1,
           last_name = $2,
           email = $3,
           contact_number = $4,
           birthday = $5,
           registration_date = $6,
           barangay = $7,
           gender = $8
       WHERE patient_id = $9`,
      [
        firstName,
        lastName,
        email,
        contactNumber,
        birthday,
        registrationDate,
        barangay,
        gender,
        patientId,
      ]
    );

    return result.rowCount > 0;
  } catch (error) {
    console.error('Error updating patient data:', error.stack);
    throw error;
  }
}


async function updateVaccinationStatus(status, scheduleId , placeOfVaccination) {
  
  try {
    const result = await db.query(
      `UPDATE vaccination_schedules
       SET status = $1, place_of_vaccination = $3
       WHERE schedule_id = $2`,
      [
        status,
        scheduleId,
        placeOfVaccination
      ]
    );

    return result.rowCount > 0;
  } catch (error) {
    console.error('Error updating patient data:', error.stack);
    throw error;
  }
}

async function updateVaccinationSchedule( scheduleId, vaccinationSchedule ) {
  
  try {
    const result = await db.query(
      `UPDATE vaccination_schedules
       SET schedule_date = $1
       WHERE schedule_id = $2`,
      [
        vaccinationSchedule,
        scheduleId
      ]
    );

    return result.rowCount > 0;
  } catch (error) {
    console.error('Error updating patient data:', error.stack);
    throw error;
  }
}


// Insert Vaccination History into the database
async function insertVaccinationHistory(scheduleId, vaccineName, dateAdministered, status) {
  try {
    const result = await db.query(
      `INSERT INTO vaccination_history (schedule_id, vaccine_name, date_administered, status)
       VALUES ($1, $2, $3, $4)`,
      [scheduleId, vaccineName, dateAdministered, status]
    );

    console.log("Database insertion result:", result);  // Log result from database query
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error inserting vaccination history:', error.stack);
    throw error;
  }
}

// Fetch Vaccination History by patientId
async function fetchVaccinationHistoryByPatientId(patientId) {
  try {
    const result = await db.query(
      `SELECT 
      p.first_name, 
      p.last_name, 
      vh.history_id, 
      vh.vaccine_name, 
      vh.date_administered, 
      vh.status
      FROM 
          patients p
      JOIN 
          vaccination_schedules vs ON p.patient_id = vs.patient_id
      JOIN 
          vaccination_history vh ON vh.schedule_id = vs.schedule_id
      WHERE 
          p.patient_id = $1;
      `,
            [patientId]
          );
     
    return result.rows;
  } catch (error) {
    console.error('Error fetching vaccination history:', error.stack);
    throw error;
  }
}



async function deletePatientById(patientId) {
  try {
     await db.query(`DELETE FROM patients WHERE patient_id = $1`, [patientId]);
  } catch(error) {
    console.log("Error deleting Patient", error.stack);
    throw error;
  }
}


async function changeDayOfSchedule(startDay, barangay) {
  try {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Get the offset for the selected start day (e.g., Monday is 1)
    const startDayOffset = daysOfWeek.indexOf(startDay);
    
    if (startDayOffset === -1) {
      throw new Error('Invalid day name provided');
    }

    // Update all schedules to match the selected day of the week
    await db.query(`
      UPDATE vaccination_schedules vs
      SET schedule_date = vs.schedule_date
        + INTERVAL ($1 - EXTRACT(DOW FROM vs.schedule_date)) % 7 || ' days'
      FROM patients p
      WHERE p.patient_id = vs.patient_id
        AND p.barangay = $2
    `, [startDayOffset, barangay]);

    console.log("Schedule successfully updated to", startDay);
  } catch (error) {
    console.error("Error updating schedule:", error.stack);
    throw error;
  }
}

async function addEligiblePopulation( barangay, eligiblePopulation, date) {
  try {
    const success = await db.query(`
      INSERT INTO eligible_population (barangay, eligible_population, date)
      VALUES ($1, $2, $3)`,
      [
      barangay,
      eligiblePopulation,
      date
      ]
    );
  } catch (error) {
    console.error("Error inserting Eligible Population:", error.stack);
    throw error;
  }
}

//Get eligible population values by barangay
async function getEligiblePopulation(barangay) {
  try {
    const result = await db.query(`
      SELECT * 
      FROM eligible_population
      WHERE barangay = $1
      AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE);
       `,
      [
      barangay
      ]
    );

    return result.rows;

  } catch (error) {
    console.error("Error inserting Eligible Population:", error.stack);
    throw error;
  }
}


async function updateEligiblePopulation( eligiblePopulation, date, id) {
  try {
    const result = await db.query(`
      UPDATE eligible_population
      SET eligible_population = $1, date = $2
      WHERE id = $3
      RETURNING *;
    `,[
      eligiblePopulation, date, id
    ]); 
   
   

    return result.rowCount > 0;
  } catch (error) {
    console.error("Error updating Eligible Population:", error.stack);
    throw error;
  }
}



// Delete Eligible Population
async function deleteEligiblePopulation(id) {
  try {
      // Perform the deletion query
      const result = await db.query(
          `DELETE FROM eligible_population WHERE id = $1 RETURNING *`, // Use RETURNING to check if a record was deleted
          [id]
      );

  } catch (error) {
      console.error("Error deleting Eligible Population:", error.stack);
      throw { success: false, message: "Failed to delete record" }; // Return an error message
  }
}



//fetch FIC and CIC by barangay   
async function fetchFicAndCicByBarangay(barangay) {
  try {
    const result = await db.query(`
      SELECT
      f.barangay,
        CASE 
          WHEN f.remarks ILIKE '%Fully Immunized%' THEN 'Fully Immunized Child'
          WHEN f.remarks ILIKE '%Completely Immunized%' THEN 'Completely Immunized Child'
        END AS child_status,
        COUNT(DISTINCT CASE WHEN p.gender = 'Male' THEN p.patient_id END) AS male_count,
        COUNT(DISTINCT CASE WHEN p.gender = 'Female' THEN p.patient_id END) AS female_count,
        COUNT(DISTINCT p.patient_id) AS total_count  -- Total count of distinct patients
      FROM
        patients p
      JOIN
        ficorcic f ON p.patient_id = f.patient_id
      WHERE
        p.barangay = $1
        AND (f.remarks ILIKE '%Fully Immunized%' OR f.remarks ILIKE '%Completely Immunized%')
      GROUP BY
        child_status,
        f.barangay
    `, [barangay]);

    return result.rows;

  } catch (error) {
    console.error("Error fetching FICorCIC:", error.stack);
    throw error;
  }
}



// Insert monthly reports into the database
async function addMonthlyReports(reportData) {
  const query = `
      INSERT INTO monthly_reports (barangay, vaccine_name, eligible_population, male_count, female_count, total_count, percentage,date_submitted) 
      VALUES ($1, $2, $3, $4, $5, $6 , $7, $8)
  `;

  try {
      await db.query('BEGIN');
      for (const report of reportData) {
          await db.query(query, [            
              report.barangay,
              report.vaccine_name,
              report.eligible_population,
              report.male_count,
              report.female_count,
              report.total_count,
              report.percentage,
              report.date
          ]);
      }
      await db.query('COMMIT');
      return { success: true, message: 'Reports successfully inserted.' };
  } catch (error) {
      await db.query('ROLLBACK');
      console.error('Error inserting reports:', error);
      throw new Error('Database error: ' + error.message);
  }
}


async function fetchMonthlyReportsToUsers(year, barangay) {
  try {
    const result = await db.query(`
            SELECT 
        barangay,
        SUM(CASE WHEN vaccine_name = 'BCG' THEN male_count ELSE 0 END) as bcg_male,
        SUM(CASE WHEN vaccine_name = 'BCG' THEN female_count ELSE 0 END) as bcg_female,
        
        SUM(CASE WHEN vaccine_name = 'Hepatitis B' THEN male_count ELSE 0 END) as hepatitisb_male,
        SUM(CASE WHEN vaccine_name = 'Hepatitis B' THEN female_count ELSE 0 END) as hepatitisb_female,
        
        SUM(CASE WHEN vaccine_name = '(1st dose) Pentavalent Vaccine' THEN male_count ELSE 0 END) as pentavalent1_male,
        SUM(CASE WHEN vaccine_name = '(1st dose) Pentavalent Vaccine' THEN female_count ELSE 0 END) as pentavalent1_female,
        
        SUM(CASE WHEN vaccine_name = '(2nd dose) Pentavalent Vaccine' THEN male_count ELSE 0 END) as pentavalent2_male,
        SUM(CASE WHEN vaccine_name = '(2nd dose) Pentavalent Vaccine' THEN female_count ELSE 0 END) as pentavalent2_female,
        
        SUM(CASE WHEN vaccine_name = '(3rd dose) Pentavalent Vaccine' THEN male_count ELSE 0 END) as pentavalent3_male,
        SUM(CASE WHEN vaccine_name = '(3rd dose) Pentavalent Vaccine' THEN female_count ELSE 0 END) as pentavalent3_female,
        
        SUM(CASE WHEN vaccine_name = '(1st dose) Oral Polio Vaccine' THEN male_count ELSE 0 END) as opv1_male,
        SUM(CASE WHEN vaccine_name = '(1st dose) Oral Polio Vaccine' THEN female_count ELSE 0 END) as opv1_female,
        
        SUM(CASE WHEN vaccine_name = '(2nd dose) Oral Polio Vaccine' THEN male_count ELSE 0 END) as opv2_male,
        SUM(CASE WHEN vaccine_name = '(2nd dose) Oral Polio Vaccine' THEN female_count ELSE 0 END) as opv2_female,
        
        SUM(CASE WHEN vaccine_name = '(3rd dose) Oral Polio Vaccine' THEN male_count ELSE 0 END) as opv3_male,
        SUM(CASE WHEN vaccine_name = '(3rd dose) Oral Polio Vaccine' THEN female_count ELSE 0 END) as opv3_female,
        
        SUM(CASE WHEN vaccine_name = '1st dose Inactivated Polio Vaccine' THEN male_count ELSE 0 END) as ipv_male,
        SUM(CASE WHEN vaccine_name = '1st dose Inactivated Polio Vaccine' THEN female_count ELSE 0 END) as ipv_female,
        
        SUM(CASE WHEN vaccine_name = '(1st dose) Pneumococcal Conjugate Vaccine' THEN male_count ELSE 0 END) as pcv1_male,
        SUM(CASE WHEN vaccine_name = '(1st dose) Pneumococcal Conjugate Vaccine' THEN female_count ELSE 0 END) as pcv1_female,
        
        SUM(CASE WHEN vaccine_name = '(2nd dose) Pneumococcal Conjugate Vaccine' THEN male_count ELSE 0 END) as pcv2_male,
        SUM(CASE WHEN vaccine_name = '(2nd dose) Pneumococcal Conjugate Vaccine' THEN female_count ELSE 0 END) as pcv2_female,
        
        SUM(CASE WHEN vaccine_name = '(3rd dose) Pneumococcal Conjugate Vaccine' THEN male_count ELSE 0 END) as pcv3_male,
        SUM(CASE WHEN vaccine_name = '(3rd dose) Pneumococcal Conjugate Vaccine' THEN female_count ELSE 0 END) as pcv3_female,
        
        SUM(CASE WHEN vaccine_name = '(1st dose) MMR' THEN male_count ELSE 0 END) as mmr1_male,
        SUM(CASE WHEN vaccine_name = '(1st dose) MMR' THEN female_count ELSE 0 END) as mmr1_female,
        
        SUM(CASE WHEN vaccine_name = '(2nd dose) MMR' THEN male_count ELSE 0 END) as mmr2_male,
        SUM(CASE WHEN vaccine_name = '(2nd dose) MMR' THEN female_count ELSE 0 END) as mmr2_female,
        
        SUM(CASE WHEN vaccine_name = 'Fully Immunized Child' THEN male_count ELSE 0 END) as fic_male,
        SUM(CASE WHEN vaccine_name = 'Fully Immunized Child' THEN female_count ELSE 0 END) as fic_female,
        
        SUM(CASE WHEN vaccine_name = 'Completely Immunized Child' THEN male_count ELSE 0 END) as cic_male,
        SUM(CASE WHEN vaccine_name = 'Completely Immunized Child' THEN female_count ELSE 0 END) as cic_female,
        
        eligible_population as total_eligible_population,
        date_submitted
      FROM monthly_reports
      WHERE EXTRACT(YEAR FROM date_submitted) = $1
      AND barangay = $2
      GROUP BY barangay, eligible_population, date_submitted
      ORDER BY barangay;

    `, 
    [
     year , barangay
    ]
  
);

    return result.rows;
    

} catch (error) {
    throw new Error(`Error fetching vaccinations: ${error.message}`);
}

}


//delete reports
// Asynchronous function to delete rows from monthly_reports where date matches
async function deleteMonthlyReportsByDate(date, barangay) {
  
  try {
      const result = await db.query(`DELETE FROM monthly_reports WHERE date_submitted = $1
        AND barangay = $2
        `,[date,barangay]);
     
  } catch (error) {
      console.error('Error deleting report:', error);
      throw error; // Re-throw the error for further handling if needed
  }
} 


export {
  // Function to insert patients data and vaccination schedules
  addPatient,
  addVaccinationSchedule, 
  
  // Function to fetch patients data to the Authenticated users
  getPatientsByBarangay,

  // Function to fetch patients data to the Authenticated patients
  getPatientSchedules,

  //function to delete patient
  deletePatientById,
  //function to update patient
  updatePatient,
  getVaccinationSchedules,
  updateVaccinationStatus,
  getAllVaccinationSchedules,
  insertVaccinationHistory,
  fetchVaccinationHistoryByPatientId,
  updateVaccinationSchedule,
  getPendingPatientsByBarangay,
  updatePendingPatientsByBarangay,
  changeDayOfSchedule,
  addEligiblePopulation,
  fetchFicAndCicByBarangay,
  addMonthlyReports,
  getEligiblePopulation,
  deleteEligiblePopulation,
  updateEligiblePopulation,
  fetchMonthlyReportsToUsers,
  deleteMonthlyReportsByDate,
  getChildren,



};
