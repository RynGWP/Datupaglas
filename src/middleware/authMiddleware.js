import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import {db, connectDatabase} from "../../config/db.js";
import { findUserByEmail} from "../models/userModel.js";

// Database connection
connectDatabase(); // Call the function to connect to the database

function ensureAuthenticated(req, res, next) {
  if (req.session.patientId) {
    // Patient is authenticated
    req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7; // 1 week
    return next();

  } else if (req.session.userId) {
    // User is authenticated
    req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7; // 1 week
    return next();
  } else if (req.session.adminId) {
    // admin is authenticated
    req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7; // 1 week
    return next();
    
  } else {
    // Not authenticated
    res.status(401).send('User not authenticated');
  }
}
  
passport.use(
  new LocalStrategy(async (email, password, done) => {
    try {
      const user = await findUserByEmail(email);

      if (!user) {
        return done(null, false, { message: "Invalid email address" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return done(null, false, { message: "Invalid password" });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user, done) => {
  if (user.role === 'patient') {
    done(null, { patientId: user.patient_id, role: 'patient' });
  } 
  else if (user.role === 'admin') {
    done(null, { adminId: user.admin_id, role: 'admin' });
  } else if (user.role === 'users') {
    done(null, { userId: user.user_id, role: 'users' });
  }
});

passport.deserializeUser(async (serializedUser, done) => {
  try {
    let user;

    if (serializedUser.role === 'patient') {
      const result = await db.query('SELECT * FROM patients WHERE patient_id = $1', [serializedUser.patientId]);
      user = result.rows[0];
    } else if (serializedUser.role === 'admin') {
      const result = await db.query('SELECT * FROM admin WHERE patient_id = $1', [serializedUser.adminId]);
      user = result.rows[0];
    } else if (serializedUser.role ==='users') {
      const result = await db.query('SELECT * FROM users WHERE user_id = $1', [serializedUser.userId]);
      user = result.rows[0];
    }

    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error);
  }
});





export { passport, ensureAuthenticated };
