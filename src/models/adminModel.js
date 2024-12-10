import { db } from "../../config/db.js";


async function fetchMonthlyReportsToAdmin(month, year) {
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
        WHERE EXTRACT(MONTH FROM date_submitted) = $1 
        AND EXTRACT(YEAR FROM date_submitted) = $2
        GROUP BY barangay , eligible_population, date_submitted
        ORDER BY barangay;
      `, 
      [
        month, year
      ]
    
  );
  
      return result.rows;
  
  } catch (error) {
      throw new Error(`Error fetching vaccinations: ${error.message}`);
  }
  
  }




  //FETCH DATA TO DASHBOARD


//  FULLY IMMUNIZED CHILD SECTION
  async function fetchTotalFullyImmunizeChild() {
    try {
      const result = await db.query(`SELECT * 
FROM ficorcic 
WHERE remarks = 'Fully Immunized Child' 
AND date_trunc('month', date) = date_trunc('month', CURRENT_DATE);
`);


      return result.rows;


      console.log(result)
    } catch (error) {
      throw new Error(`Error fetching fully Immunize child: ${error.message}`);
  }
  
  }

  async function fetchTotalMaleFullyImmunizeChild() {
    try {
      const result = await db.query(`SELECT * FROM ficorcic WHERE remarks = 'Fully Immunized Child' 
        AND gender = 'Male'
        AND date_trunc('month', date) = date_trunc('month', CURRENT_DATE);
        `);

      return result.rows;

    } catch (error) {
      throw new Error(`Error fetching male fully Immunize child: ${error.message}`);
  }
  
  }

  async function fetchTotalFemaleFullyImmunizeChild() {
    try {
      const result = await db.query(`SELECT * FROM ficorcic WHERE remarks = 'Fully Immunized Child' 
        AND gender = 'Female'
        AND date_trunc('month', date) = date_trunc('month', CURRENT_DATE);
        `);

      return result.rows;

    } catch (error) {
      throw new Error(`Error fetching Female fully Immunize child: ${error.message}`);
  }
  
  }


 async function FethTotalEligiblePopulation () {
  try {
    const result = await db.query(`
      SELECT SUM(eligible_population) AS total_eligible_population
      FROM eligible_population
      WHERE EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE);
    `);
    return result.rows[0].total_eligible_population;
  } catch (error) {
    throw new Error(`Error fetching Total Eligible Population: ${error.message}`);
}
 }
  
//Fetch Fully immunized  child to Graph
async function fetchMonthlyFICData() {
  try {
    const query = `
      WITH CurrentYearData AS (
        SELECT 
          EXTRACT(MONTH FROM CAST(date AS DATE)) AS month,
          COUNT(*) as fic_count
        FROM ficorcic
        WHERE 
          EXTRACT(YEAR FROM CAST(date AS DATE)) = EXTRACT(YEAR FROM CURRENT_DATE)
          AND remarks = 'Fully Immunized Child'
        GROUP BY 
          EXTRACT(MONTH FROM CAST(date AS DATE))
      ),
      LastYearData AS (
        SELECT 
          EXTRACT(MONTH FROM CAST(date AS DATE)) AS month,
          COUNT(*) as fic_count
        FROM ficorcic
        WHERE 
          EXTRACT(YEAR FROM CAST(date AS DATE)) = EXTRACT(YEAR FROM CURRENT_DATE) - 1
          AND remarks = 'Fully Immunized Child'
        GROUP BY 
          EXTRACT(MONTH FROM CAST(date AS DATE))
      )
      SELECT 
        m.month_number,
        m.month_name,
        COALESCE(cy.fic_count, 0) as current_year_count,
        COALESCE(ly.fic_count, 0) as last_year_count
      FROM (
        SELECT 
          generate_series(1,12) as month_number,
          to_char(to_timestamp(generate_series(1,12)::text, 'MM'), 'Month') as month_name
      ) m
      LEFT JOIN CurrentYearData cy ON m.month_number = cy.month
      LEFT JOIN LastYearData ly ON m.month_number = ly.month
      ORDER BY m.month_number;
    `;

    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error fetching monthly FIC data:', error);
    throw error;
  }
}

// FULLY IMMUNIZED SECTION



















// COMPLETELY IMMUNIZED CHILD SECTION
//for Fic
async function fetchTotalCompletelyImmunizeChild() {
  try {
    const result = await db.query(`SELECT * 
FROM ficorcic 
WHERE remarks = 'Completely Immunized Child' 
AND date_trunc('month', date) = date_trunc('month', CURRENT_DATE);
`);


    return result.rows;


    console.log(result)
  } catch (error) {
    throw new Error(`Error fetching Completely Immunize child: ${error.message}`);
}

}

async function fetchTotalMaleCompletelyImmunizeChild() {
  try {
    const result = await db.query(`SELECT * FROM ficorcic WHERE remarks = 'Completely Immunized Child' 
      AND gender = 'Male'
      AND date_trunc('month', date) = date_trunc('month', CURRENT_DATE);
      `);

    return result.rows;

  } catch (error) {
    throw new Error(`Error fetching male Completely Immunize child: ${error.message}`);
}

}

async function fetchTotalFemaleCompletelyImmunizeChild() {
  try {
    const result = await db.query(`SELECT * FROM ficorcic WHERE remarks = 'Completely Immunized Child' 
      AND gender = 'Female'
      AND date_trunc('month', date) = date_trunc('month', CURRENT_DATE);
      `);

    return result.rows;

  } catch (error) {
    throw new Error(`Error fetching Female Completely Immunize child: ${error.message}`);
}

}


//Fetch Fully immunized  child to Graph
async function fetchMonthlyCICData() {
try {
  const query = `
    WITH CurrentYearData AS (
      SELECT 
        EXTRACT(MONTH FROM CAST(date AS DATE)) AS month,
        COUNT(*) as fic_count
      FROM ficorcic
      WHERE 
        EXTRACT(YEAR FROM CAST(date AS DATE)) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND remarks = 'Completely Immunized Child'
      GROUP BY 
        EXTRACT(MONTH FROM CAST(date AS DATE))
    ),
    LastYearData AS (
      SELECT 
        EXTRACT(MONTH FROM CAST(date AS DATE)) AS month,
        COUNT(*) as fic_count
      FROM ficorcic
      WHERE 
        EXTRACT(YEAR FROM CAST(date AS DATE)) = EXTRACT(YEAR FROM CURRENT_DATE) - 1
        AND remarks = 'Completely Immunized Child'
      GROUP BY 
        EXTRACT(MONTH FROM CAST(date AS DATE))
    )
    SELECT 
      m.month_number,
      m.month_name,
      COALESCE(cy.fic_count, 0) as current_year_count,
      COALESCE(ly.fic_count, 0) as last_year_count
    FROM (
      SELECT 
        generate_series(1,12) as month_number,
        to_char(to_timestamp(generate_series(1,12)::text, 'MM'), 'Month') as month_name
    ) m
    LEFT JOIN CurrentYearData cy ON m.month_number = cy.month
    LEFT JOIN LastYearData ly ON m.month_number = ly.month
    ORDER BY m.month_number;
  `;

  const result = await db.query(query);
  return result.rows;
} catch (error) {
  console.error('Error fetching monthly FIC data:', error);
  throw error;
}
}
// COMPLETELY IMMUIZED CHILD SECTION





async function getAdminById(adminId) {
  try {
    const result = await db.query(
      `SELECT * FROM admin WHERE admin_id = $1`,
      [adminId]
    );
    
    // Check if the user is found
    if (result.rows.length > 0) {
      return result.rows[0]; // Return the first row which contains the user's data
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    console.error("Error fetching user by ID:", error.message);
    throw error;
  }
}


  export {
    fetchMonthlyReportsToAdmin,
    fetchTotalFullyImmunizeChild,
    fetchTotalMaleFullyImmunizeChild,
    fetchTotalFemaleFullyImmunizeChild,
    fetchTotalCompletelyImmunizeChild,
    fetchTotalMaleCompletelyImmunizeChild,
    fetchTotalFemaleCompletelyImmunizeChild,
    FethTotalEligiblePopulation,




    //for graph
    fetchMonthlyFICData,
    fetchMonthlyCICData,
    getAdminById
  }