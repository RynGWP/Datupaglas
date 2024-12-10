import bcrypt from "bcryptjs";
import { findUserByEmail } from "../models/userModel.js";

async function postLogin(req, res) {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      // Invalid email
      return res.status(400).json({ message: "Your Account is not Approved." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid || !password.trim()) {
      // Invalid password
      return res.status(400).json({ message: "The password you entered is incorrect" });
    }

// Set session based on the user role
if (user.role === 'patient') {
  req.session.email = email;
  req.session.patientSession = { patientId: user.patient_id };
  req.session.userSession = null; // Clear other sessions
  req.session.adminSession = null;
} else if (user.role === 'users') {
  req.session.userSession = { userId: user.user_id };
  req.session.patientSession = null;
  req.session.adminSession = null;
} else if (user.role === 'admin') {
  req.session.adminSession = { adminId: user.admin_id };
  req.session.patientSession = null;
  req.session.userSession = null;
}


  
  console.log('Session ID:', req.sessionID);
  console.log('Session after setting:', req.session);
  
    req.session.role = user.role;

    // Log session variables
console.log("Role set in session:", req.session.role);
console.log("Admin ID:", req.session.adminSession?.adminId || "N/A");
console.log("Patient ID:", req.session.patientSession?.patientId || "N/A");
console.log("User ID:", req.session.userSession?.userId || "N/A");


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
      return "/children";
    default:
      throw new Error("Invalid role");
  }
}

export { postLogin };
