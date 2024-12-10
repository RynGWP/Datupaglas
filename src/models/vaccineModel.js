import { db } from "../../config/db.js";


//Create additional Vaccines 
async function addCustomVaccine(vaccineName, minAgeMonths, dose_interval, doses) {
  const result = await db.query(
    `INSERT INTO vaccines (vaccine_name,
                           min_age_months,
                           dose_interval,
                           doses) 
     VALUES ($1, $2, $3, $4) RETURNING vaccine_id`,
                          [vaccineName,
                           minAgeMonths,
                           dose_interval, 
                           doses]
                                  );
  return result.rows[0].vaccine_id;
}

//Select All additional vaccines
async function allAdditionalVaccines() {
    try {
      const result = await db.query('SELECT * FROM vaccines');
  
  
      return result.rows;
    } catch (error) {
      console.error("Error fetching vaccines", error.stack);
      throw error;
    }
  }

  //update vaccines
  async function updateVaccines(vaccine_id, vaccine_name, min_age_months, doses, dose_interval) {
    try {
      const result = await db.query(`UPDATE vaccines SET vaccine_name = $2,
                                                         min_age_months = $3,
                                                         doses = $4,
                                                         dose_interval = $5
                                     WHERE vaccine_id = $1 `,
                                                     [
                                                      vaccine_id,
                                                      vaccine_name,
                                                      min_age_months,
                                                      doses,
                                                      dose_interval
                                                     ]
                                    );
      return result.rows;
    } catch (error) {
      console.error("Error updating vaccines", error.stack);
      throw error;
    } 
  }


  async function deleteVaccines(id) {
    try {
      const result = await db.query(`DELETE FROM vaccines WHERE vaccine_id =$1` , [id])


      return result.rows;
    } catch (error) {
      console.error("Error deleting vaccines", error.stack);
      throw error;
    } 
  }


  export {
    allAdditionalVaccines,
    addCustomVaccine,
    updateVaccines,
    deleteVaccines
  };