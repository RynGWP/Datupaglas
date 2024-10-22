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
  fetchFicAndCicByBarangay
} from "../models/patientModel.js"; // Import model functions
import { ensureAuthenticated } from '../middleware/authMiddleware.js';
import { convertDateFormat, getNextWednesday } from "../utils/utils.js";
import bcrypt from "bcryptjs";
import { getUserById } from "../models/userModel.js";
import {
  insertFullyImmunized,
  insertCompletelyImmunized,
  getBirthdayAndLastVaccineDate,
  vaccineTakenCountByGender
} from '../models/FICorCICModel.js';



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
      { months: 0, vaccines: ["BCG", "Hepatitis B"] },
      {
        months: 1.5,
        vaccines: [
          "(1st dose) Pentavalent Vaccine",
          "(1st dose) Oral Polio Vaccine",
          "(1st dose) Pneumococcal Conjugate Vaccine",
        ],
      },
      {
        months: 2.5,
        vaccines: [
          "(2nd dose) Pentavalent Vaccine",
          "(2nd dose) Oral Polio Vaccine",
          "(2nd dose) Pneumococcal Conjugate Vaccine",
        ],
      },
      {
        months: 3.5,
        vaccines: [
          "(3rd dose) Pentavalent Vaccine",
          "(3rd dose) Oral Polio Vaccine",
          "(3rd dose) Pneumococcal Conjugate Vaccine",
          "1st dose Inactivated Polio Vaccine",
        ],
      },
      { months: 9, vaccines: ["(1st dose) MMR"] },
      { months: 12, vaccines: ["(2nd dose) MMR"] },
    ];

    for (const schedule of scheduleDates) {
      const scheduleDate = new Date(registrationDateObj);
      scheduleDate.setMonth(registrationDateObj.getMonth() + schedule.months);
      const nextWednesday = getNextWednesday(scheduleDate);
    
      // Call the model to insert the vaccination schedule
      await addVaccinationSchedule({
        patientId,
        scheduleDate: nextWednesday,
        vaccines: schedule.vaccines
      });
    }

    res.render("patientReg");
  } catch (error) {
    console.error("Error registering patient", error.stack);
    res.status(500).send("Error registering patient");
  }
}

//fetch patient schedules (FOR PATIENTS ACCOUNT ONLY)
async function fetchPatientSchedules(req, res) {
  try {
    ensureAuthenticated(req, res, async () => {
      
      // Ensure user is authenticated
      const patientId = req.query.patientId || req.session.patientId;

      if (!patientId) {
        return res.status(400).json({ message: "Patient ID is required" });
      }

      // Fetch patient schedules using patientId
      const result = await getPatientSchedules(patientId);
      // console.log("Result from getPatientSchedules:", result); // Log the result


      const schedules = result;
    
      // Render the view with the schedules data
     
      if (result.length > 0) {
        res.render("Patients/patientSchedules", { schedules: schedules });
      } else {
        res.status(404).json({ message: "No schedules found" });
      }
    });
  } catch (err) {
    console.error("Error fetching patient schedules:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

//fetch patients vaccination schedules (EVERY WEDNESDAY ONLY)
async function fetchVaccinationScheduleByBarangay(req, res) {
  try {
    ensureAuthenticated(req, res, async () => {
      // Ensure user is authenticated
      const userId =  req.session.userId;

      if (!userId) {
        return res.status(401).send("Unauthorized");
      }

      // Fetch firstname of authenticated user
      const authenticatedUser = await getUserById(userId);
      const barangay = authenticatedUser.barangay;
      // Fetch patient schedules by barangay
      const result = await getVaccinationSchedules(barangay);
    

      // Render the view with the schedules data
      if (result.length > 0) {
        res.render("users/vaccinationSchedules", { vaccinationSchedules: result, user: authenticatedUser  });
      } else {
        res.render("users/vaccinationSchedules");
      }
    });
  } catch (err) {
    console.error("Error fetching Vaccination Schedules :", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

//Fetch All vaccination Schedules of 1 Patient (ALL VACCINATION SCHEDULES FROM BEGINNING TO END)
async function fetchAllVaccinationScheduleByPatientId(req, res) {
  try {
    ensureAuthenticated(req, res, async () => {
      // Ensure user is authenticated
      const userId = req.query.userId || req.session.userId;
    
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
            user: authenticatedUser,
            patientFullName: patientFullname,
            parentFullname: parentFullname ,
            patientBirthday: patientBirthday });
      } else {
        res.render("users/allVaccinationSchedule");
      }
    });
  } catch (err) {
    console.error("Error fetching Vaccination Schedules :", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
}


//fetch vaccination history (FOR PATIENTS ACCOUNT ONLY)
async function fetchPatientVaccinationHistory(req, res) {

  const patientId = req.query.patientId || req.session.patientId;

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

//Fetch Patient by barangay (ALL PATIENTS REGISTERED BY AUTHENTICATED USERS)
async function fetchPatientsByBarangay(req, res) {
  try {
    ensureAuthenticated(req, res, async () => {
      // Ensure user is authenticated
      const userId = req.query.userId || req.session.userId;

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
        user: authenticatedUser,
        patients: allPatients // Pass only the patients for the current page
      });
    });
  } catch (error) {
    console.error("Error fetching patients:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

//Fetch Patient by user_Id (ALL PENDING PATIENTS REGISTERED BY AUTHENTICATED USERS)
async function fetchPendingPatientsByBarangay(req, res) {
  try {
    ensureAuthenticated(req, res, async () => {
      // Ensure user is authenticated
      const userId = req.query.userId || req.session.userId;

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
        user: authenticatedUser,
        patients: allPatients // Pass only the patients for the current page
      });
    });
  } catch (error) {
    console.error("Error fetching patients:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}
        
//Update Patient data 
async function updatePatientData(req, res) {
  try {
    ensureAuthenticated(req, res, async () => {
      // Ensure user is authenticated
      const userId = req.query.userId || req.session.userId;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
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
    });
  } catch (error) {
    console.error('Error updating patient data:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

//Update Vaccination status (EVERY WEDNESDAY ONLY)
async function updateVaccination(req, res) {
  try {
    ensureAuthenticated(req, res, async () => {
      // Ensure user is authenticated
      const userId = req.query.userId || req.session.userId;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
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
  
      const oneYearAnd28Days = 365 + 28;  
  
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
    });
  } catch (error) {
    console.error('Error updating patient data:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

//Update Vaccination status (ALL VACCINATION STATUS FROM BEGINNING TO END)
async function updateAllVaccination(req, res) {
  try {
    ensureAuthenticated(req, res, async () => {
      // Ensure user is authenticated
      const userId = req.query.userId || req.session.userId;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      
      const scheduleId = req.body.scheduleId;
      const status = req.body.status;


      // console.log('Schedule ID:', scheduleId); // Debug log

      if (!scheduleId) {
        return res.status(400).json({ success: false, message: 'Schedule ID is required' });
      }

      const success = await updateVaccinationStatus(status, scheduleId);

      if (success) {
        res.json({ success: true, message: 'Patient data updated successfully' });
      } else {
        res.status(404).json({ success: false, message: 'Patient not found' });
      }
    });
  } catch (error) {
    console.error('Error updating patient data:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

//Update Vaccination Schedule (ALL VACCINATION SCHEDULES FROM BEGINNING TO END)
async function updateSched(req, res) {
  try {
    ensureAuthenticated(req, res, async () => {
      // Ensure user is authenticated
      const userId = req.query.userId || req.session.userId;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
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
    });
  } catch (error) {
    console.error('Error updating patient data:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}


//UPDATE patient pending Status (REGISTRATION)
async function updatePendingStatus(req,res) {
  try {
    ensureAuthenticated(req, res, async () => {
      // Ensure user is authenticated
      const userId = req.query.userId || req.session.userId;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
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
    });
  } catch (error) {
    console.error('Error updating patient data:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

//DELETE patient
async function deletePatient(req, res) {
  const patientId = req.params.id; // Get the patient ID from URL parameters

  try {
    // Execute the delete query
    ensureAuthenticated(req,res, async() =>{
      const userId = req.query.userId || req.session.userId;
      if(!userId){
        return res.status(401).send("Unauthorized");
      }
    });

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
    
    ensureAuthenticated(req,res, async() =>{
      const userId = req.query.userId || req.session.userId;
      if(!userId){
        return res.status(401).send("Unauthorized");
      }
    });

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
    ensureAuthenticated(req, res, async () => {
      const userId = req.query.userId || req.session.userId;
      if (!userId) {
        return res.status(401).send("Unauthorized");
      }

      const authenticatedUser = await getUserById(userId);
      const barangay = authenticatedUser.barangay;
      const reports = await vaccineTakenCountByGender(barangay);
      const FICorCIC = await fetchFicAndCicByBarangay(barangay);


      console.log(FICorCIC);
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

      res.render('users/monthlyReports',
         {reports: reports, 
          totals: totals ,
          FICorCIC: FICorCIC
         });
    });
  } catch (error) {
    console.error("Error fetching patients:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}


async function insertEligiblePopulation(req,res) {
  try {
    ensureAuthenticated(req, res, async () => {
      const userId = req.query.userId || req.session.userId;
      if (!userId) {
        return res.status(401).send("Unauthorized");
      }

      const {eligiblePopulation
        , dateOfEligiblePopulation
      } = req.body;
      const insertEligiblePopulation = await addEligiblePopulation(userId, barangay, eligiblePopulation, dateOfEligiblePopulation, );


    });
  } catch (error) {
    
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
  insertEligiblePopulation
};
