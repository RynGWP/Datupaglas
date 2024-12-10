import {
  addPatient,
  addVaccinationSchedule,
  deletePatientById,
  getPatientsByBarangay,
  getPatientSchedules,
  getVaccinationSchedules,
  updatePatient,
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


} from "../models/patientModel.js"; // Import model functions

import { ensureAuthenticated } from '../middleware/authMiddleware.js';

import { convertDateFormat, getNextWednesday, calculateAgeInMonths } from "../utils/utils.js";

import bcrypt from "bcryptjs";

import { getUserById } from "../models/userModel.js";

import {
  insertFullyImmunized,
  insertCompletelyImmunized,
  getBirthdayAndLastVaccineDate,
  vaccineTakenCountByGender
} from '../models/FICorCICModel.js';

import { allAdditionalVaccines } from "../models/vaccineModel.js";


//REGISTER Patients
async function registerPatient(req, res) {
  const {
    firstName,
    lastName,
    email,
    contactNumber,
    birthday,
    registrationDate,
    barangay,
    gender,
    password,
    parentFirstName,
    parentLastName
  } = req.body;


  // const userId = req.session.userId;
  // console.log("User ID from session:", req.session.userId);


  // if (!userId) {
  //   return res.status(401).send("Unauthorized");
  // }

  const formattedBirthday = convertDateFormat(birthday);
  const formattedRegistrationDate = convertDateFormat(registrationDate);

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Call the model to insert the patient into the database
    const patientId = await addPatient({
      firstName,
      lastName,
      email,
      contactNumber,
      birthday: formattedBirthday,
      registrationDate: formattedRegistrationDate,
      barangay,
      gender,
      hashedPassword,
      parentFirstName,
      parentLastName
    });

    console.log("Generated patient ID:", patientId);

    // Schedule vaccination dates
    const registrationDateObj = new Date(formattedRegistrationDate);
    const scheduleDates = [
      // Birth vaccinations (0 months)
      { 
        months: 0, 
        vaccines: [
          { name: "BCG", doseInterval: 0 },
          { name: "Hepatitis B", doseInterval: 0 }
        ]
      },
      // 1.5 months (6 weeks) vaccines
      { 
        months: 1.5, 
        vaccines: [
          { name: "(1st dose) Pentavalent Vaccine", doseInterval: 0 },
          { name: "(1st dose) Oral Polio Vaccine", doseInterval: 0 },
          { name: "(1st dose) Pneumococcal Conjugate Vaccine", doseInterval: 0 }
        ]
      },
      // 2.5 months (10 weeks) vaccines
      { 
        months: 2.5, 
        vaccines: [
          { name: "(2nd dose) Pentavalent Vaccine", doseInterval: 0 },
          { name: "(2nd dose) Oral Polio Vaccine", doseInterval: 0 },
          { name: "(2nd dose) Pneumococcal Conjugate Vaccine", doseInterval: 0 }
        ]
      },
      // 3.5 months (14 weeks) vaccines
      { 
        months: 3.5, 
        vaccines: [
          { name: "(3rd dose) Pentavalent Vaccine", doseInterval: 0 },
          { name: "(3rd dose) Oral Polio Vaccine", doseInterval: 0 },
          { name: "(3rd dose) Pneumococcal Conjugate Vaccine", doseInterval: 0 },
          { name: "1st dose Inactivated Polio Vaccine", doseInterval: 0 }
        ]
      },
      // 9 months vaccines
      { 
        months: 9, 
        vaccines: [
          { name: "(1st dose) MMR", doseInterval: 0 }
        ]
      },
      // 12 months vaccines
      { 
        months: 12, 
        vaccines: [
          { name: "(2nd dose) MMR", doseInterval: 0 }
        ]
      }
    ];


    // Fetch and add custom vaccines
  const customVaccines = await allAdditionalVaccines();
  const patientAgeInMonths = calculateAgeInMonths(formattedBirthday, formattedRegistrationDate);

  
   // Add custom vaccines based on patient age and dose interval
   for (const vaccine of customVaccines) {
      scheduleDates.push({
        months: vaccine.min_age_months,
        vaccines: [{
          name: vaccine.vaccine_name,
          doses: vaccine.doses || 1,
          doseInterval: vaccine.dose_interval || 0
        }]
      });
  }


 // Loop through each schedule date and vaccine to create entries for each dose
for (const schedule of scheduleDates) {
  for (const vaccine of schedule.vaccines) {
    let doseDate = new Date(registrationDateObj);
    doseDate.setMonth(registrationDateObj.getMonth() + schedule.months);

    // Get the number of doses, defaulting to 1 if not specified
    const numberOfDoses = vaccine.doses || 1;

    // Determine if this is a custom vaccine
    const isCustomVaccine = customVaccines.some(
      custom => custom.vaccine_name === vaccine.name
    );

    // Loop through each dose and apply the dose interval
    for (let doseNumber = 1; doseNumber <= numberOfDoses; doseNumber++) {
      const nextWednesday = getNextWednesday(doseDate);

      await addVaccinationSchedule({
        patientId,
        scheduleDate: nextWednesday,
        vaccines: [
          isCustomVaccine ? `(${doseNumber} Dose) ${vaccine.name}` : vaccine.name
        ], // Label dose only for custom vaccines
        barangay: barangay
      });

      // Move to the next dose date by adding the dose interval in days
      doseDate.setDate(doseDate.getDate() + vaccine.doseInterval);
    }
  }
}


    res.render("patientReg");
  } catch (error) {
    console.error("Error registering patient", error.stack);
    res.status(500).send("Error registering patient");
  }
}




//fetch patients vaccination schedules (EVERY WEDNESDAY ONLY)
async function fetchVaccinationScheduleByBarangay(req, res) {
  try {
   
      // Ensure user is authenticated
    const userId =  req.session.userSession?.userId;

    if (!userId) {
      return res.status(401).send("Unauthorized");
    }

      // Fetch firstname of authenticated user
      const authenticatedUser = await getUserById(userId);
      const barangay = authenticatedUser.barangay;
      // Fetch patient schedules by barangay
      const result = await getVaccinationSchedules(barangay);
  
        res.render("users/vaccinationSchedules",
           { vaccinationSchedules: result,
              authenticatedUser
           });
      

  } catch (err) {
    console.error("Error fetching Vaccination Schedules :", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

//Fetch All vaccination Schedules of 1 Patient (ALL VACCINATION SCHEDULES FROM BEGINNING TO END)
async function fetchAllVaccinationScheduleByPatientId(req, res) {
  try {
    
          // Ensure user is authenticated
    const userId =  req.session.userSession?.userId;

    if (!userId) {
      return res.status(401).send("Unauthorized");
    }


      // Fetch firstname of authenticated user
      const authenticatedUser = await getUserById(userId);
      // Fetch patient schedules using patientId
      const {patientId} = req.body;
      const result = await getAllVaccinationSchedules(patientId);

      let patientFullname = '';
      let parentFullname = '';
      let patientBirthday = ''; // New variable for birthday
      
      // Check if there is any data in the result array
      if (result.length > 0) {
        patientFullname = result[0].full_name; // Assuming that all schedules belong to the same patient
        parentFullname = result[0].parent_full_name; // Assuming parent info is consistent across the array
        patientBirthday = result[0].birthday; // Retrieve the patient's birthday
      }
      console.log('authenticated user :' , authenticatedUser);
      // Render the view with the schedules data
      if (result.length > 0) {
        res.render("users/allVaccinationSchedule", 
          { vaccinationSchedules: result,
            authenticatedUser,
            patientFullName: patientFullname,
            parentFullname: parentFullname ,
            patientBirthday: patientBirthday });
      } else {
        res.render("users/allVaccinationSchedule");
      }

  } catch (err) {
    console.error("Error fetching Vaccination Schedules :", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
}


//fetch patient schedules (FOR PATIENTS ACCOUNT ONLY)
async function fetchPatientSchedules(req, res) {
  try {

      // Ensure Patient is authenticated
      const patientId = req.session.patientSession?.patientId;

      if (!patientId) {
        return res.status(400).json({ message: "Patient ID is required" });
      }

      const patientIdForChild = req.body.patientId;

      // Fetch patient schedules using patientId
      const result = await getPatientSchedules(patientIdForChild);
      // console.log("Result from getPatientSchedules:", result); // Log the result
      console.log(result);

      const schedules = result;
    
      // Render the view with the schedules data
     
      if (result.length > 0) {
        res.render("Patients/patientSchedules", { schedules: schedules });
      } else {
        res.status(404).json({ message: "No schedules found" });
      }
    
  } catch (err) {
    console.error("Error fetching patient schedules:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
}



//fetch vaccination history (FOR PATIENTS ACCOUNT ONLY)
async function fetchPatientVaccinationHistory(req, res) {

  const patientId = req.body.patientId

  try {
    const history = await fetchVaccinationHistoryByPatientId(patientId);

    if (!history.length) {
      return res
        .status(404)
        .json({ message: "No Vaccination History found for this patient" });
    }

    res.render('patients/patientVaccinationHistory',{ vaccinationHistory: history });
  } catch (error) {
    console.error("Error fetching patient schedules:", error);
    res.status(500).json({ message: "Error fetching patient schedules" });
  }
}


//fetch Children (FOR PATIENTS ACCOUNT ONLY)
async function fetchChildren(req, res) {
  try {

      const email = req.session.email;
      // Ensure Patient is authenticated
      const patientId = req.session.patientSession?.patientId;

      if (!patientId) {
        return res.status(400).json({ message: "Patient ID is required" });
      }

      // Fetch patient schedules using patientId
      const result = await getChildren(email);

     
      if (result.length > 0) {
        res.render("Patients/children", { children: result });
      } else {
        res.status(404).json({ message: "No schedules found" });
      }
    
  } catch (err) {
    console.error("Error fetching patient schedules:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

//Fetch Patient by barangay (ALL PATIENTS REGISTERED BY AUTHENTICATED USERS)
async function fetchPatientsByBarangay(req, res) {
  try {
   
        // Ensure user is authenticated
    const userId =  req.session.userSession?.userId;

    if (!userId) {
      return res.status(401).send("Unauthorized");
    }

      // Fetch firstname of authenticated user
      const authenticatedUser = await getUserById(userId);
      const barangay = authenticatedUser.barangay;

      // Fetch all patients for the user
      const allPatients = await getPatientsByBarangay(barangay);
      // console.log("Result from getPatientsByBarangay:", allPatients); // Log the result

    console.log(allPatients);
    console.log(barangay);

      // Render the view with the sliced patient data
      res.render("users/patients", {
        authenticatedUser,
        patients: allPatients // Pass only the patients for the current page
      });

  } catch (error) {
    console.error("Error fetching patients:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

//Fetch Patient by user_Id (ALL PENDING PATIENTS REGISTERED BY AUTHENTICATED USERS)
async function fetchPendingPatientsByBarangay(req, res) {
  try {
    
        // Ensure user is authenticated
    const userId =  req.session.userSession?.userId;

    if (!userId) {
      return res.status(401).send("Unauthorized");
    }

      // Fetch firstname of authenticated user
      const authenticatedUser = await getUserById(userId);
      const barangay = authenticatedUser.barangay;

      // Fetch all patients for the user
      const allPatients = await getPendingPatientsByBarangay(barangay);
      // console.log("Result from getPatientSchedules:", allPatients); // Log the result


      // Render the view with the sliced patient data
      res.render("users/pendingPatients", {
        authenticatedUser,
        patients: allPatients // Pass only the patients for the current page
      });

  } catch (error) {
    console.error("Error fetching patients:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}
        
//Update Patient data 
async function updatePatientData(req, res) {
  try {
   
      // Ensure user is authenticated
      const userId =  req.session.userSession?.userId;

      if (!userId) {
        return res.status(401).send("Unauthorized");
      }

      const patientId = req.body.patientId;
      const {
        firstName,
        lastName,
        email,
        contactNumber,
        birthday,
        registrationDate,
        barangay,
        gender
      } = req.body;

      const updatedData = {
        firstName,
        lastName,
        email,
        contactNumber,
        birthday,
        registrationDate,
        barangay,
        gender
      };

      if (!patientId) {
        return res.status(400).json({ success: false, message: 'Patient ID is required' });
      }

      const success = await updatePatient(patientId, updatedData);

      if (success) {
        res.json({ success: true, message: 'Patient data updated successfully' });
      } else {
        res.status(404).json({ success: false, message: 'Patient not found' });
      }
 
  } catch (error) {
    console.error('Error updating patient data:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

//Update Vaccination status (EVERY WEDNESDAY ONLY)
async function updateVaccination(req, res) {
  try {
    
        // Ensure user is authenticated
    const userId =  req.session.userSession?.userId;

    if (!userId) {
      return res.status(401).send("Unauthorized");
    }
      
      const { scheduleId, vaccineName, dateAdministered, status , patientId, gender, barangay } = req.body;
  
      if (!scheduleId) {
        return res.status(400).json({ success: false, message: 'Schedule ID is required' });
      }

      const success = await updateVaccinationStatus(status, scheduleId);
                      await insertVaccinationHistory(scheduleId, vaccineName, dateAdministered, status);


      // Get the registration and last vaccination date
      const result = await getBirthdayAndLastVaccineDate(patientId);
      const patientBirthday = result?.birthday || null;
      const lastVaccineDate = result?.date_administered || null;
                    
  
      // Calculate the difference between registration and last vaccine date  
      const oneDay = (1000 * 60 * 60 * 24);
      const diffInMs = lastVaccineDate - patientBirthday;
      const diffInDays = diffInMs / oneDay; // Convert milliseconds to days
  
      const currentYear = new Date().getFullYear();
      const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
      const oneYearAnd28Days = (isLeapYear(currentYear) ? 366 : 365) + 28;
  
      const fullyImmunize = 'Fully Immunized Child';
      const completelyImmunize = 'Completely Immunized Child';

      // If the last vaccine date is less than 1 year and 28 days from the birthday
      if (diffInDays <= oneYearAnd28Days) {
        await insertFullyImmunized(patientId, barangay, fullyImmunize, dateAdministered,  gender);
        
      } else {
        await insertCompletelyImmunized(patientId, barangay, completelyImmunize, dateAdministered, gender);
        
      }

      if (success) {
        res.json({ success: true, message: "Vaccine Marked as Taken" });
      } else {
        res.status(404).json({ success: false, message: 'Patient not found' });
      }

  } catch (error) {
    console.error('Error updating patient data:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

//Update Vaccination status (ALL VACCINATION STATUS FROM BEGINNING TO END)
async function updateAllVaccination(req, res) {
  try {
    
        // Ensure user is authenticated
    const userId =  req.session.userSession?.userId;

    if (!userId) {
      return res.status(401).send("Unauthorized");
    }

      
      const scheduleId = req.body.scheduleId;
      const status = req.body.status;
      const placeOfVaccination = req.body.placeOfVaccination;

      // console.log('Schedule ID:', scheduleId); // Debug log

      if (!scheduleId) {
        return res.status(400).json({ success: false, message: 'Schedule ID is required' });
      }

      const success = await updateVaccinationStatus(status, scheduleId, placeOfVaccination);


      if (success) {
        res.json({ success: true, message: 'Patient data updated successfully' });
      } else {
        res.status(404).json({ success: false, message: 'Patient not found' });
      }

  } catch (error) {
    console.error('Error updating patient data:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

//Update Vaccination Schedule (ALL VACCINATION SCHEDULES FROM BEGINNING TO END)
async function updateSched(req, res) {
  try {
   
        // Ensure user is authenticated
    const userId =  req.session.userSession?.userId;

    if (!userId) {
      return res.status(401).send("Unauthorized");
    }

      const{scheduleId, vaccinationSchedule, newVaccinationSchedule} = req.body;

      // Check if newVaccinationSchedule has a value, if not, use vaccinationSchedule
      const scheduleToUpdate = newVaccinationSchedule || vaccinationSchedule;

      if (!scheduleId) {
        return res.status(400).json({ success: false, message: 'Schedule ID is required' });
      }

      const success = await updateVaccinationSchedule(scheduleId, scheduleToUpdate);

      if (success) {
        res.json({ success: true, message: 'Patient data updated successfully' });
      } else {
        res.status(404).json({ success: false, message: 'Patient not found' });
      }

  } catch (error) {
    console.error('Error updating patient data:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}


//UPDATE patient pending Status (REGISTRATION)
async function updatePendingStatus(req,res) {
  try {
  
        // Ensure user is authenticated
    const userId =  req.session.userSession?.userId;

    if (!userId) {
      return res.status(401).send("Unauthorized");
    }

      
      const { status, patientId } = req.body;

      

      if (!patientId) {
        return res.status(400).json({ success: false, message: 'Patient ID is required' });
      }

      const success = await updatePendingPatientsByBarangay(status, patientId);

      if (success) {
        res.json({ success: true, message: 'Patient Registration Approved' });
      } else {
        res.status(404).json({ success: false, message: 'Patient not found' });
      }

  } catch (error) {
    console.error('Error updating patient data:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

//DELETE patient
async function deletePatient(req, res) {
  const patientId = req.params.id; // Get the patient ID from URL parameters

  try {
     // Ensure user is authenticated
     const userId =  req.session.userSession?.userId;

     if (!userId) {
       return res.status(401).send("Unauthorized");
     }

     await deletePatientById(patientId);

    // Redirect to the patients list page after successful deletion
    res.redirect('/patients');
  } catch (error) {
    console.error("Error deleting patient:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}


async function changeDayOfSchedules(req, res) {

  try {
    
  
       // Ensure user is authenticated
    const userId =  req.session.userSession?.userId;

    if (!userId) {
      return res.status(401).send("Unauthorized");
    }

    const { start_day } = req.body; // Getting day_offset and barangay from the form submission
          // Fetch firstname of authenticated user

          // Define the interval based on the day_offset selected


          const authenticatedUser = await getUserById(userId);
          const barangay = authenticatedUser.barangay;

          const successScheduleUpdate = await changeDayOfSchedule(start_day , barangay)

          if(!successScheduleUpdate){
            res.status(500).send('Internal Server Error');

          }
    // Redirect to the patients list page after successful deletion
    res.redirect('users/patients');
  } catch (error) {
    console.error("Error updating Schedules:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

//fetchVaccine taken for different Vaccine 
async function fetchVaccineTakenCountByGender(req, res) {
  try {
    // Ensure user is authenticated
    const userId = req.session.userSession?.userId;
    if (!userId) {
      return res.status(401).send("Unauthorized");
    }

    const authenticatedUser = await getUserById(userId);
    const barangay = authenticatedUser.barangay;

    // Get eligible population as a single number
    const populationData = await getEligiblePopulation(barangay);
    const eligibleCount = populationData[0].eligible_population;
    const reports = await vaccineTakenCountByGender(barangay);
    const FICorCIC = await fetchFicAndCicByBarangay(barangay);

    // Compute totals for each vaccine
    const totals = reports.reduce((acc, report) => {
      const vaccine = report.vaccine_name;
      if (!acc[vaccine]) {
        acc[vaccine] = { male_count: 0, female_count: 0 };
      }
      acc[vaccine].male_count += report.male_count;
      acc[vaccine].female_count += report.female_count;
      return acc;
    }, {});

    res.render('users/monthlyReports', {
      reports: reports,
      eligibleCount: eligibleCount, // Pass as a simple number
      totals: totals,
      FICorCIC: FICorCIC,
      authenticatedUser
    });

  } catch (error) {
    console.error("Error fetching patients:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

//insert eligible population
async function insertEligiblePopulation(req,res) {
  try {
   
       // Ensure user is authenticated
    const userId =  req.session.userSession?.userId;

    if (!userId) {
      return res.status(401).send("Unauthorized");
    }  

      const {eligiblePopulation,
             dateOfEligiblePopulation
            } = req.body;

      const authenticatedUser = await getUserById(userId);
      const barangay = authenticatedUser.barangay;
      
      await addEligiblePopulation( barangay, eligiblePopulation, dateOfEligiblePopulation );
      res.json({ success: true });

 
  } catch (error) {
    
  }
}

//fetch eligible population
async function fetchEligiblePopulation(req, res) {
  try {
   
       // Ensure user is authenticated
    const userId =  req.session.userSession?.userId;

    if (!userId) {
      return res.status(401).send("Unauthorized");
    }


      const authenticatedUser = await getUserById(userId);
      const barangay = authenticatedUser.barangay;
      
      const eligible_population = await getEligiblePopulation(barangay);
      res.render('users/eligiblePopulation',
        {eligiblePopulation: eligible_population,
         authenticatedUser
        }
      );


  } catch (error) {
    console.error("Error fetching Eligible Population:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}


async function handleUpdateEligiblePopulation(req, res) {

  const { eligibleId, eligiblePopulation, PopulationDate } = req.body;


  try {

        // Ensure user is authenticated
        const userId =  req.session.userSession?.userId;

        if (!userId) {
          return res.status(401).send("Unauthorized");
        }


    const result = await updateEligiblePopulation( eligiblePopulation, PopulationDate, eligibleId);
    if (result) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: "Record not found or update failed." });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}



//delete eligible population
async function destroyEligiblePopulation(req, res) {
  const id = req.params.id;

  try {
      // Ensure user is authenticated
      const userId = req.session.userSession?.userId;
      if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
      }

      // delete query
      await deleteEligiblePopulation(id);
      res.json({ success: true });

  } catch (error) {
      console.error("Error deleting Eligible Population:", error.message);
      res.status(500).json({ message: "Internal server error" });
  }
}


// Insert Monthly Reports
async function saveMonthlyReports(req, res) {

    // Ensure user is authenticated
    const userId =  req.session.userSession?.userId;

    if (!userId) {
      return res.status(401).send("Unauthorized");
    }
  
  const { reportData } = req.body;       // Destructure the body

  // console.log('Parsed reportData:', reportData);  // Check the parsed data

  if (!reportData || !Array.isArray(reportData) || reportData.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid report data provided.' });
  }

  try {
      const result = await addMonthlyReports(reportData);
      res.status(200).json(result);
  } catch (error) {
      console.error('Error saving report:', error);
      res.status(500).json({ success: false, message: 'Error saving report. Please try again later.' });
  }
}


//Fetch monthly reports to admin page 
async function fetchMonthlyReportsToUserPage(req, res) {

   // Ensure user is authenticated
   const userId =  req.session.userSession?.userId;

   if (!userId) {
     return res.status(401).send("Unauthorized");
   }

  try {
  
    const year = req.query.year || new Date().getFullYear();

    // Generate years array
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);


    const authenticatedUser = await getUserById(userId);
    const barangay = authenticatedUser.barangay;
    // Fetch reports
    const reports = await fetchMonthlyReportsToUsers( year, barangay);
 

    // Render with explicit data passing
    res.render('users/historicalReports', {
      reports: reports || [], // Ensure reports is always an array
      years: years,
      selectedYear: parseInt(year),
      authenticatedUser 
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error generating report');
  }
}


//delete reports
async function destroyUserReports(req, res) {
  const {date, barangay} = req.body; // Ensure date is from req.body
 

  try {
      const userId = req.session.userSession?.userId;
      if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
      }

         await deleteMonthlyReportsByDate(date, barangay);
     
         res.redirect('/historicalReports');
         
      
  } catch (error) {
      console.error("Error deleting reports:", error.message);
      res.status(500).json({ message: "Internal server error" });
  }
}


//Dashboard
//fetch data needed to dashboard (for BHW)
async function fetchDataToDashboard(req, res) {
  try {
   
        // Ensure user is authenticated
    const userId =  req.session.userSession?.userId;

    if (!userId) {
      return res.status(401).send("Unauthorized");
    }

      // Fetch firstname of authenticated user
      const authenticatedUser = await getUserById(userId);
      const barangay = authenticatedUser.barangay;
      // Fetch patient schedules by barangay
      const schedules = await getVaccinationSchedules(barangay); //vaccination schedules every wednesday


        // Count unique patients from schedules
      const uniquePatientIds = new Set(
        schedules.map(schedule => schedule.patient_id)
      );
      const uniquePatientsCount = uniquePatientIds.size;
      

      const allPatients = await getPatientsByBarangay(barangay); // all patients for barangay of authenticated users
      const allPendingPatients = await getPendingPatientsByBarangay(barangay); // all pending patients for barangay of authenticated users
      const populationData = await getEligiblePopulation(barangay); //eligible population

      let eligiblePopulationCount = 0;

      if (populationData.length > 0) {
        eligiblePopulationCount = populationData[0].eligible_population; // Access the first object's eligible_population
      }


   
      // Render the view with the schedules data
        res.render("users/userDashboard", 
          { vaccinationSchedulesLength: uniquePatientsCount,
            patientsLength: allPatients,
            pendingPatientsLength: allPendingPatients,
            eligiblePopulation: eligiblePopulationCount,
            authenticatedUser,


          }
                  );

  } catch (err) {
    console.error("Error fetching Vaccination Schedules :", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
}






export {
  registerPatient,
  fetchPatientSchedules,
  fetchPatientVaccinationHistory,
  fetchPatientsByBarangay,
  fetchPendingPatientsByBarangay,
  deletePatient,
  fetchVaccinationScheduleByBarangay,
  updatePatientData,
  updateVaccination,
  updateAllVaccination,
  fetchAllVaccinationScheduleByPatientId,
  updateSched,
  updatePendingStatus,
  changeDayOfSchedules,
  fetchVaccineTakenCountByGender,
  insertEligiblePopulation,
  saveMonthlyReports,
  fetchDataToDashboard,
  fetchEligiblePopulation,
  destroyEligiblePopulation,
  handleUpdateEligiblePopulation,
  fetchMonthlyReportsToUserPage,
  destroyUserReports,
  fetchChildren
};
