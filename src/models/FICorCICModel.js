import { db } from "../../config/db.js";

  
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
   
    try {
      const result = await db.query(
        `SELECT 
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
      AND vs.vaccine_name = '(2nd dose) MMR'
  ORDER BY 
      vh.date_administered DESC
  LIMIT 1;`,
        [patientId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching registration date and last vaccination date:', error.stack);
      throw error;
    }
  }



// Numbers of Male and Female taken specific vaccines
async function vaccineTakenCountByGender(barangay) {
  try {
    const result = await db.query(`
            SELECT   p.barangay,   v.vaccine_name,   COUNT(DISTINCT CASE WHEN p.gender = 'Male' THEN p.patient_id END) AS male_count,   COUNT(DISTINCT CASE WHEN p.gender = 'Female' THEN p.patient_id END) AS female_count,   COUNT(DISTINCT p.patient_id) AS total_count
        FROM   patients p
        JOIN   vaccination_schedules v ON p.patient_id = v.patient_id
        WHERE   p.barangay = $1
          AND   v.status = 'Taken'
          AND   DATE_PART('month', v.schedule_date) = DATE_PART('month', CURRENT_DATE)
          AND   DATE_PART('year', v.schedule_date) = DATE_PART('year', CURRENT_DATE)
        GROUP BY   p.barangay,   v.vaccine_name,   v.schedule_date
        ORDER BY   v.schedule_date ASC
       ; 
    `, [barangay]);

    return result.rows; // Ensure it always returns an array
  } catch (error) {
    console.error('Error fetching vaccine_count by gender:', error.stack);
    throw error;
  }
}


// SELECT
// p.barangay,
// v.vaccine_name,
// COUNT(DISTINCT CASE WHEN p.gender = 'Male' THEN p.patient_id END) AS male_count,
// COUNT(DISTINCT CASE WHEN p.gender = 'Female' THEN p.patient_id END) AS female_count,
// COUNT(DISTINCT p.patient_id) AS total_count  -- Total count of distinct patients
// FROM
// patients p
// JOIN
// vaccination_schedules v ON p.patient_id = v.patient_id
// WHERE
// p.barangay = $1
// AND
// v.status = 'Taken'
// GROUP BY
// p.barangay,
// v.vaccine_name,
// v.schedule_date
// ORDER BY
// v.schedule_date ASC

  
 export  {
    insertFullyImmunized,
    insertCompletelyImmunized,
    getBirthdayAndLastVaccineDate,
    vaccineTakenCountByGender
  };




