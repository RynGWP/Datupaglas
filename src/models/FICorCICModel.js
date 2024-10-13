import { db } from "../../config/db.js";


// // Update vaccination status for a specific vaccine in the schedule
// async function updateVaccinationStatus(status, scheduleId) {
//     try {
//       const result = await db.query(
//         `UPDATE vaccination_schedules
//          SET status = $1
//          WHERE schedule_id = $2`,
//         [status, scheduleId]
//       );
//       return result.rowCount > 0;
//     } catch (error) {
//       console.error('Error updating patient data:', error.stack);
//       throw error;
//     }
//   }
  
  // Check if all vaccinations for the patient have the status 'Taken'
  // async function isAllVaccinesTaken(patientId) {
  //   const result = await db.query(
  //     `SELECT COUNT(*)
  //      FROM vaccination_schedules
  //      WHERE patient_id = $1 AND status != 'Taken'`,
  //     [patientId]
  //   );
  //   return parseInt(result.rows[0].count, 10) === 0;
  // }
  
  // Insert into FullyImmunizedChild
  async function insertFullyImmunized(patientId, barangay, remarks,  date, gender) {
    try {
      const result = await db.query(
        `INSERT INTO ficorcic (patient_id, barangay, remarks, date, gender)
         VALUES ( $1, $2, $3, $4, $5) RETURNING *`,
        [patientId, barangay, remarks, date, gender]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error inserting fully immunized child:', error.stack);
      throw error;
    }
  }
  
  // Insert into CompletelyImmunizedChild
  async function insertCompletelyImmunized(patientId, barangay, remarks, date, gender) {
    try {
      const result = await db.query(
        `INSERT INTO ficorcic (patient_id, barangay, remarks, date, gender)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [patientId,  barangay, remarks, date, gender]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error inserting completely immunized child:', error.stack);
      throw error;
    }
  }
  
  // Fetch registration date and last vaccination date
  async function getBirthdayAndLastVaccineDate(patientId) {
    const result = await db.query(
      `  SELECT 
    p.birthday, 
    vh.date_administered
FROM 
    patients p
JOIN 
    vaccination_schedules vs ON vs.patient_id = p.patient_id
JOIN 
    vaccination_history vh ON vh.schedule_id = vs.schedule_id
WHERE 
    p.patient_id = $1
    AND vs.vaccine_name = '2nd dose MMR'
ORDER BY 
    vh.date_administered DESC
LIMIT 1;`,
      [patientId]
    );
    return result.rows[0];
  }
  
 export  {
    insertFullyImmunized,
    insertCompletelyImmunized,
    getBirthdayAndLastVaccineDate
  };




