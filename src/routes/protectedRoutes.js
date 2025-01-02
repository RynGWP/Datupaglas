import express from "express";
import passport from 'passport';
import { ensureAuthenticated,  upload, } from "../middleware/authMiddleware.js";
import multer from 'multer';


import {
  createTaxPayer,
  readTaxPayers,
  readTaxPayerProfile,
  updateTaxPayerProfile,
  editTaxPayerProfile,
  deleteTaxPayer,
  createFiles,
  deleteFile,
  addProperty,
  deleteProperty,
  updateProperty,


  // for authenticated taxpayer
  readTaxPayerDashboardByEmail,
  readTaxPayerProfileByEmail,
  readTaxPayerPropertyByEmail,
  readTaxPayerDocumentsByEmail,
  readStatementOfAccountForAuthenticatedTaxpayer,
  readPaymentHistoryById,
  downloadFile,

    //for treasurer
  readTaxPayersForTreasurer,  //fetch all taxpayers
  readTaxPayerProfileForTreasurer,
  insertStatementOfAccount,
  readStatementOfAccount,
  insertPayment,
  readPaymentHistory

} from "../controllers/taxPayerController.js";

import {
  assessorDashboard,
  createUsers,
  readUsers,
  updateUsers,
  deleteUsers
} from "../controllers/usersController.js";

const router = express.Router();

// Public routes

// ************************** LOGIN ROUTES ***********************************
router.get("/", (req, res) => res.render("usersLogin"));
router.get("/Login", (req, res) => res.render("usersLogin"));
router.get("/bhwRegistration", (req, res) => res.render("bhwRegistration"));
router.get("/patientRegistration", (req, res) => res.render("patientReg"));


router.post('/login', (req, res, next) => {               //passport local auth
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.status(401).json({ message: info.message });
    }

    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);

      // Redirect based on user type
      if (user.usertype === 'assessor') {
        return res.redirect('/adminDashboard');
      } else if (user.usertype === 'treasurer') {
        return res.redirect('/TaxPayerDashboard');
      } else {
        return res.status(403).json({ message: 'Access Denied' });
      }
    });
  })(req, res, next);
});


// change password
// router.get('/changePassword', ensureAuthenticated, (req,res) => res.render('changePassword'));
// router.post('/updatePassword' , ensureAuthenticated, changePassword);



//--------------------------------------------Assessor routes sidebar navigations ----------------------------------
//Read Dashboard
router.get("/adminDashboard", assessorDashboard);
//read Tax payers
router.get("/taxPayer", readTaxPayers);
// READ users (Assessor and treasurer)
router.get("/userlist", readUsers); 



//**********************************ASSESSOR ROUTES FOR TAX PAYER **************************************

//create file for taxpayer
router.post('/uploadFile', (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: 'File upload error',
        error: err.message
      });
    } else if (err) {
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: err.message
      });
    }
    
    await createFiles(req, res);
  });
});

// Create Tax payers information
router.post("/addTaxPayer", createTaxPayer);
router.post("/addProperty", addProperty);


//read Tax payers profile
router.post("/taxPayerProfile", readTaxPayerProfile);



//edit and update Tax payers profile
router.post("/editTaxPayerProfile", editTaxPayerProfile);
router.post("/updateTaxPayerProfile", updateTaxPayerProfile);

//Delete tax payer
router.post("/taxpayer/delete/:id", deleteTaxPayer);

//Update property by property id
router.post('/updateProperty', updateProperty );

// delete file
router.post('/deleteFile', deleteFile);
router.post('/deleteProperty', deleteProperty);


// ************************************* FOR ASSESSOR AND TREASURER ROUTES *************************

// CREATE users (Assessor and Treasurer)
router.post("/registerUser", createUsers); 
// UPDATE users (Assessor and treasurer)
router.post("/updateUser", updateUsers); 
// DELETE users (Assessor and treasurer)
router.post("/deleteUser/:id", deleteUsers); 

// ************************************* FOR ASSESSOR AND TREASURER ROUTES *************************




// ************************************** FOR TAXPAYER ROUTES *************************************
//Navigation routes

// Passport Google authentication routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

//callback
router.get('/auth/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/login' 
  }),
  (req, res) => {
    // Log authentication details
    console.log('Authentication successful');
    console.log('User:', req.user);
    console.log('Session:', req.session);
    
    if (req.user.usertype === 'treasurer') {
      res.redirect('/TaxPayerDashboard');
    } else if (req.user.usertype === 'assessor') {
      res.redirect('/adminDashboard');
    } else if (req.user.taxpayer_id)  {
       // Redirect or render dashboard
       res.redirect('/Dashboard');
    }

  
  }
);



// READ DASHBOARD
router.get('/Dashboard',  readStatementOfAccountForAuthenticatedTaxpayer,);
// READ PROFILE
router.get('/Profile', readTaxPayerProfileByEmail);
// READ PROPERTY
router.get('/Property', readTaxPayerPropertyByEmail);
// READ DOCUMENTS
router.get('/Documents', readTaxPayerDocumentsByEmail);
// download documents
router.get('/files/download/:id', downloadFile);                     //dipa ito tapos
// READ payment history
router.get('/paymentHistoryForTaxPayer', readPaymentHistoryById);


//******************************************** /FOR TAX PAYER ROUTES ****************************************//




//********************************************FOR TREASURER ROUTES ************************************//

// Dashboard
router.get('/TaxPayerDashboard', (req,res) => res.render('treasurer/dashboard', {session:req.user}));

// create statement of account
router.post('/insertStatementOfAccount', insertStatementOfAccount);

// insert payment to payment history table
router.post('/insertPayment', insertPayment);

// read Tax payers list 
router.get('/TaxPayerList', readTaxPayersForTreasurer);

// read payment history
router.get('/paymentHistory', readPaymentHistory);

// read Tax payers profile
router.post("/viewTaxPayerProfileForTreasurer", readTaxPayerProfileForTreasurer);

// read statement of account
router.get('/statementOfAccount', readStatementOfAccount);

//********************************************FOR TREASURER ROUTES ************************************//





// logout route

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err); // Handle any errors during logout
    }

    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
      } else {
        console.log("Session destroyed");
      }

      // Optionally, you can clear the cookie as well
      res.clearCookie("connect.sid", { path: "/" });

      // Redirect to login page or home after logout
      res.redirect("/login");
    });
  });
});

export default router;
