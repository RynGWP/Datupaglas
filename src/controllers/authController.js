import bcrypt from "bcryptjs";
import { findUserByEmail } from "../models/userModel.js";

async function postLogin(req, res) {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      // Invalid email
      return res.status(400).json({ message: "Invalid email address" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid || !password.trim()) {
      // Invalid password
      return res.status(400).json({ message: "The password you entered is incorrect" });
    }

    // Set session based on the user role
    if (user.role === 'patient') {
      req.session.patientId = user.patient_id;
      req.session.userId = null; // Set to null for patients
      req.session.adminId = null;
  } else if(user.role === 'users') {
      req.session.userId = user.user_id;
      req.session.patientId = null; // Set to null for non-patients
      req.session.adminId = null;
  } else if(user.role === 'admin') {
    req.session.adminId = user.admin_id;
    req.session.patientId = null;
    req.session.userId = null;
  }
  
  console.log('Session ID:', req.sessionID);
  console.log('Session after setting:', req.session);
  
    req.session.role = user.role;

    // Log session variables
    console.log("Role set in session:", req.session.role);
    console.log("Admin ID:", req.session.adminId || "N/A");
    console.log("Patient ID:", req.session.patientId || "N/A");
    console.log("User ID:", req.session.userId || "N/A");

    // Redirect based on role
    const redirectUrl = getRedirectUrl(user.role);
    res.status(200).json({ redirectUrl });

  } catch (err) {
    console.error("Error during user authentication:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

function getRedirectUrl(role) {
  switch (role) {
    case "admin":
      return "/adminDashboard";
    case "users":
      return "/userDashboard";
    case "patient":
      return "/patientSchedules";
    default:
      throw new Error("Invalid role");
  }
}

export { postLogin };
