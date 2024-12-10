import express from "express";
import {
  userRegistration,
  fetchFirstnameToDashboard,
  fetchFirstnameToPatientRegistration,
  fetchUsers,
  fetchPendingUsers,
  deleteUser,
  updatePendingUsersById,
  changePassword
       } from "../controllers/userController.js";

import {
  registerPatient,
  fetchPatientSchedules,
  fetchPatientsByBarangay,
  fetchPendingPatientsByBarangay,
  deletePatient,
  fetchVaccinationScheduleByBarangay,
  updatePatientData,
  updateVaccination,
  updateAllVaccination,
  fetchAllVaccinationScheduleByPatientId,
  fetchPatientVaccinationHistory,
  updateSched,
  updatePendingStatus,
  changeDayOfSchedules,
  fetchVaccineTakenCountByGender,
  saveMonthlyReports,
  fetchDataToDashboard,
  insertEligiblePopulation,
  fetchEligiblePopulation,
  destroyEligiblePopulation,
  handleUpdateEligiblePopulation,
  fetchMonthlyReportsToUserPage,
  destroyUserReports,
  fetchChildren
        } from "../controllers/patientController.js";

import { ensureAuthenticated } from '../middleware/authMiddleware.js';

import { postLogin } from "../controllers/authController.js";

import { fetchMonthlyReportsToAdminPage, getTotalFICandCIC } from '../controllers/adminController.js';

import { addCustomVaccinesForPatients,
         fetchAllVaccines,
         updateVaccineData,
         destroyVaccines
       } from '../controllers/vaccineController.js'

const router = express.Router();


// Public routes
router.get("/", (req, res) => res.render("users/usersLogin"));
router.get("/bhwRegistration", (req, res) => res.render("bhwRegistration"));
router.get("/patientRegistration", (req, res) => res.render("patientReg"));
router.post("/bhwRegistration", userRegistration);
router.get("/Login", (req, res) => res.render("Users/usersLogin"));

// change password
router.get('/changePassword', ensureAuthenticated, (req,res) => res.render('changePassword'));
router.post('/updatePassword' , ensureAuthenticated, changePassword);


//--------------------------------------------Admin routes----------------------------------
router.get("/adminDashboard", ensureAuthenticated, getTotalFICandCIC);

//Create new Vaccines
router.post('/createVaccines', ensureAuthenticated, addCustomVaccinesForPatients);

//Read vaccines
router.get("/readVaccines", ensureAuthenticated, fetchAllVaccines); 

//update vaccines
router.post('/updateVaccines', ensureAuthenticated, updateVaccineData);

//delete vaccines
router.post('/deleteVaccines/:id', ensureAuthenticated, destroyVaccines);

//Read users
router.get("/usersOfAdmin", ensureAuthenticated, fetchUsers);   //Read users
router.get("/pendingUsers", ensureAuthenticated, fetchPendingUsers); //Read pending users


//Read Reports
router.get('/reports' , ensureAuthenticated, fetchMonthlyReportsToAdminPage); // Read monthly reports

//Update Pending Users
router.post('/pendingUsers/update', ensureAuthenticated, updatePendingUsersById ); //update or approved pending users

//delete user
router.post('/user/delete/:id', ensureAuthenticated, deleteUser); // delete users by id





// ----------------------------------------- Patient routes---------------------------------------
router.post("/VaccinationHistory", ensureAuthenticated, fetchPatientVaccinationHistory); // read
router.post('/childSchedules', ensureAuthenticated, fetchPatientSchedules);
router.get('/children', ensureAuthenticated, fetchChildren);




//------------------------------------------ User routes ---------------------------------------
router.get("/userDashboard", ensureAuthenticated, fetchDataToDashboard); // fetch first name of authenticated user

//Create Patients
router.post('/patientRegistration', registerPatient );
router.post('/reports/saveMonthlyReport', ensureAuthenticated, saveMonthlyReports); // SEND_REPORT
router.post('/eligiblePopulation/insert', ensureAuthenticated, insertEligiblePopulation); //INSERT eligiblePopulation

// Read Patients
router.get("/patients", ensureAuthenticated, fetchPatientsByBarangay);
router.get("/vaccinationSchedules", ensureAuthenticated, fetchVaccinationScheduleByBarangay);
router.post("/allVaccinationStatus", ensureAuthenticated, fetchAllVaccinationScheduleByPatientId);
router.get("/pendingPatients", ensureAuthenticated,   fetchPendingPatientsByBarangay);
router.get("/bhwReports", ensureAuthenticated, fetchVaccineTakenCountByGender);
router.get("/eligiblePopulation", ensureAuthenticated,  fetchEligiblePopulation);
router.get("/historicalReports", ensureAuthenticated, fetchMonthlyReportsToUserPage);

//Update Patients
router.post('/patients/update', ensureAuthenticated, updatePatientData);
router.post('/vaccinationStatus/update/', ensureAuthenticated, updateVaccination);
router.post('/allVaccinationStatus/update/', ensureAuthenticated, updateAllVaccination);
router.post('/allVaccinationSched/update/', ensureAuthenticated, updateSched);
router.post('/pendingPatients/update', ensureAuthenticated, updatePendingStatus );
router.post('/update/ChangeOFSchedules', ensureAuthenticated, changeDayOfSchedules );
router.post('/eligiblePopulation/update', ensureAuthenticated, handleUpdateEligiblePopulation);


//Delete Patients
router.post('/patients/delete/:id', ensureAuthenticated, deletePatient);
//Delete eligiblePopulation
router.post('/eligiblePopulation/delete/:id', ensureAuthenticated, destroyEligiblePopulation );
router.post('/reports/delete', ensureAuthenticated,  destroyUserReports );

// Authentication routes
router.post("/login", postLogin);
router.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) {
      return next(err);  // Handle any errors during logout
    }

    req.session.destroy(err => {
      if (err) {
        console.error("Error destroying session:", err);
      } else {
        console.log("Session destroyed");
      }

      // Optionally, you can clear the cookie as well
      res.clearCookie('connect.sid', { path: '/' });
      
      // Redirect to login page or home after logout
      res.redirect('/login');
    });
  });
});

export default router;





