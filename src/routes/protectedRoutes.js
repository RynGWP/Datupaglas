import express from "express";
import {
  userRegistration,
  fetchFirstnameToDashboard,
  fetchFirstnameToPatientRegistration} from "../controllers/userController.js";
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
  fetchVaccineTakenCountByGender
} from "../controllers/patientController.js";
import { ensureAuthenticated } from '../middleware/authMiddleware.js';
import { postLogin } from "../controllers/authController.js";


const router = express.Router();


// Public routes
router.get("/", (req, res) => res.render("users/usersLogin"));
router.get("/bhwRegistration", (req, res) => res.render("bhwRegistration"));
router.get("/patientRegistration", (req, res) => res.render("patientReg"));
router.post("/bhwRegistration", userRegistration);
router.get("/Login", (req, res) => res.render("Users/usersLogin"));

router.get("/newDashboard", (req,res) => res.render("newDashboard"));

//--------------------------------------------Admin routes----------------------------------
router.get("/adminDashboard", ensureAuthenticated, (req, res) => res.render("admin/adminDashboard"));
router.get("/reports", ensureAuthenticated, (req, res) => res.render("admin/reports"));
router.get("/usersOfAdmin", ensureAuthenticated, (req, res) => res.render("admin/usersOfAdmin"));

// ----------------------------------------- Patient routes---------------------------------------
router.get("/patientVaccinationHistory", ensureAuthenticated, fetchPatientVaccinationHistory); // read
router.get('/patientSchedules', ensureAuthenticated, fetchPatientSchedules);

//------------------------------------------ User routes ---------------------------------------
router.get("/userDashboard", ensureAuthenticated, fetchFirstnameToDashboard);
router.get("/bhwReports", ensureAuthenticated, fetchVaccineTakenCountByGender);


//Create Patients
router.post('/patientRegistration', registerPatient );


// Read Patients
router.get("/patients", ensureAuthenticated, fetchPatientsByBarangay);
router.get("/vaccinationSchedules", ensureAuthenticated, fetchVaccinationScheduleByBarangay);
router.post("/allVaccinationStatus", ensureAuthenticated, fetchAllVaccinationScheduleByPatientId);
router.get("/pendingPatients", ensureAuthenticated,   fetchPendingPatientsByBarangay);

//Update Patients
router.post('/patients/update', ensureAuthenticated, updatePatientData);
router.post('/vaccinationStatus/update/', ensureAuthenticated, updateVaccination);
router.post('/allVaccinationStatus/update/', ensureAuthenticated, updateAllVaccination);
router.post('/allVaccinationSched/update/', ensureAuthenticated, updateSched);
router.post('/pendingPatients/update', ensureAuthenticated, updatePendingStatus );
router.post('/update/ChangeOFSchedules', ensureAuthenticated, changeDayOfSchedules );


//Delete Patients
router.post('/patients/delete/:id', ensureAuthenticated, deletePatient);

//view Individual patient by Id
// router.get('/patients/view/:id', ensureAuthenticated, viewPatient);

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





