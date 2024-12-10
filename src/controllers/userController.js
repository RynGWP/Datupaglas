import bcrypt from "bcryptjs";
import { 
    addUser,
    findUserByEmail,
    getUserById,
    getUsers,
    getPendingUsers,
    updatePendingUsers,
    deleteUserById,
    updatePassword
  } from "../models/userModel.js";

import { ensureAuthenticated } from '../middleware/authMiddleware.js';

import {getAdminById} from '../models/adminModel.js';


async function userRegistration(req, res) {
  const {
    firstName,
    lastName,
    email,
    contactNumber,
    barangay,
    password
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password,10);
    const userId = await addUser({
        firstName,
        lastName,
        email,
        contactNumber,
        barangay,
        hashedPassword     
    });

    res.json({
      success: true,
      message: "Account created successfully.",
      userId: userId,
    });
  } catch (error) {
    console.error("Error User Registration", error.stack);
    res.status(500).send("User Registration error");
  }
}

async function fetchFirstnameToDashboard(req, res) {
  try {
  const userId = req.session.userId;
  const authenticatedUser = await getUserById(userId);
  
  console.log('Result from getUser:', authenticatedUser);
    res.render( 'users/userDashboard', {user: authenticatedUser} );
  } catch (error) {
    console.log("Error fetching user", error.message);     
    res.status(500).json({ message: "Internal server error" });
  }
}
async function fetchFirstnameToVaccinationSchedules(req, res) {
  try {
  const userId = req.session.userId;
  const authenticatedUser = await getUserById(userId);
  
  console.log('Result from getUser:', authenticatedUser);
    res.render( 'users/vaccinationSchedules', {user: authenticatedUser} );
  } catch (error) {
    console.log("Error fetching user", error.message);     
    res.status(500).json({ message: "Internal server error" });
  }
}

async function fetchFirstnameToPatientRegistration(req, res) {
  try {
  const userId = req.session.userId;
  const authenticatedUser = await getUserById(userId);
  
  console.log('Result from getUser:', authenticatedUser);
    res.render( 'users/patientRegistration', {user: authenticatedUser} );
  } catch (error) {
    console.log("Error fetching user", error.message);     
    res.status(500).json({ message: "Internal server error" });
  }
}

async function fetchFirstnameToMyPatients(req, res) {
  try {
  const userId = req.session.userId;
  const authenticatedUser = await getUserById(userId);
  
  console.log('Result from getUser:', authenticatedUser);
    res.render( 'users/userPatients', {user: authenticatedUser} );
  } catch (error) {
    console.log("Error fetching user", error.message);     
    res.status(500).json({ message: "Internal server error" });
  }
}




//----------------------------------------ADMIN USER MANAGEMENT----------------------------------------------

//fetch pending users to ejs admin/pendingUsers
async function fetchPendingUsers(req, res) {
  try {
    ensureAuthenticated(req, res, async () => {

      
      // Ensure admin is authenticated
      const adminId =  req.session.adminSession?.adminId;
      
      const authenticatedUser = await getAdminById(adminId);

    if (!adminId) {
      return res.status(401).send("Unauthorized");
    }


      // Fetch all patients for the user
      const users = await getPendingUsers();
      // console.log("Result from getPatientSchedules:", allPatients); // Log the result


      // Render the view with the sliced patient data
      res.render("admin/pendingUsers", {
        authenticatedUser,
        users:users // Pass only the patients for the current page
      });
    });
  } catch (error) {
    console.error("Error fetching patients:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

//fetch registered users to ejs admin/usersOfAdmin
async function fetchUsers(req,res) {
  try {
    
    // Ensure admin is authenticated
    const adminId =  req.session.adminSession?.adminId;

    if (!adminId) {
      return res.status(401).send("Unauthorized");
    }



    const authenticatedUser = await getAdminById(adminId);
      // Fetch all patients for the user
      const users = await getUsers();

      // console.log("Result from getPatientsByBarangay:", allPatients); // Log the result
    console.log(users);

      // Render the view with the sliced patient data
      res.render("admin/usersOfAdmin", {
        authenticatedUser,
        users: users
      });
   
  } catch (error) {
    console.error("Error fetching patients:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

//Approve users by user_id
async function updatePendingUsersById(req,res) {
  
  try {
    
      // Ensure admin is authenticated
    const adminId =  req.session.adminSession?.adminId;

    if (!adminId) {
      return res.status(401).send("Unauthorized");
    }
      
      const { status, userId } = req.body; 

      if (!userId) {
        return res.status(400).json({ success: false, message: 'Patient ID is required' });
      }

      const success = await updatePendingUsers(status, userId);

      if (success) {
        res.json({ success: true, message: 'User Registration Approved' });
      } else {
        res.status(404).json({ success: false, message: 'User not found' });
      }
    
  } catch (error) {
    console.error('Error updating patient data:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}


async function deleteUser(req, res) {
  const userId = req.params.id; // Get the user ID from URL parameters

  try {
    // Execute the delete query
   
     // Ensure admin is authenticated
    const adminId =  req.session.adminSession?.adminId;

    if (!adminId) {
      return res.status(401).send("Unauthorized");
    }
    

     await deleteUserById(userId);

    // Redirect to the users list page after successful deletion
    res.redirect('/usersOfAdmin');
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}


async function changePassword(req, res) {
  const userId = req.session.userSession?.userId;
  const patientId = req.session.patientSession?.patientId;
  const adminId = req.session.adminSession?.adminId;

  // Check if any session exists
  if (!userId && !patientId && !adminId) {
      return res.status(401).json({ message: "Unauthorized" });
  }

  try {
      let authenticatedUser;
      let updatePasswordQuery;

      // Determine which type of user is authenticated
      if (userId) {
          authenticatedUser = await getUserById(userId);
          updatePasswordQuery = async (hashedPassword) => {
              await updatePassword('users', userId, hashedPassword);
          };
      } else if (patientId) {
          authenticatedUser = await getPatientById(patientId);
          updatePasswordQuery = async (hashedPassword) => {
              await updatePassword('patients', patientId, hashedPassword);
          };
      } else if (adminId) {
          authenticatedUser = await getAdminById(adminId);
          updatePasswordQuery = async (hashedPassword) => {
              await updatePassword('admin', adminId, hashedPassword);
          };
      }

      // Check if user exists
      if (!authenticatedUser) {
          return res.status(404).json({ message: "User not found" });
      }

      const { newPasswordInput, currentPasswordInput, confirmPassword } = req.body;

      if (!newPasswordInput || !currentPasswordInput || !confirmPassword) {
          return res.status(400).json({ message: "All password fields are required" });
      }

      const currentPasswordHash = authenticatedUser.password;

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPasswordInput, currentPasswordHash);
      if (!isPasswordValid) {
          return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Confirm new passwords match
      if (newPasswordInput !== confirmPassword) {
          return res.status(400).json({ message: "New passwords do not match" });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPasswordInput, 10);

      // Update the password in the database based on user type
      try {
          await updatePasswordQuery(hashedNewPassword);
      } catch (updateError) {
          console.error('Error updating password:', updateError);
          return res.status(500).json({
              success: false,
              message: "Failed to update password. Please try again."
          });
      }

      // Destroy session to require re-login
      req.session.destroy((err) => {
          if (err) {
              console.error('Session destruction error:', err);
          }
          // Send success response
          return res.status(200).json({
              success: true,
              message: "Password successfully updated. Please login with your new password."
          });
      });

  } catch (error) {
      console.error('Error changing password:', error.message);
      return res.status(500).json({
          success: false,
          message: "Internal server error. Please try again later."
      });
  }
}






export { userRegistration,
   fetchFirstnameToDashboard,
   fetchFirstnameToVaccinationSchedules,
   fetchFirstnameToPatientRegistration,
   fetchFirstnameToMyPatients,
   fetchUsers,
   fetchPendingUsers,
   deleteUser,
   updatePendingUsersById,


   //change password
   changePassword
  };
