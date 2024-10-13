import bcrypt from "bcryptjs";
import { addUser, getUserById } from "../models/userModel.js";

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

export { userRegistration,
   fetchFirstnameToDashboard,
   fetchFirstnameToVaccinationSchedules,
   fetchFirstnameToPatientRegistration,
   fetchFirstnameToMyPatients};
