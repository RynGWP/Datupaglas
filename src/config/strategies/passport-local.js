
import passport from 'passport';
import { User } from '../../models/userModel.js';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';

// Local Strategy - Passport login authentication
passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
      try {
        const user = await User.findByEmail(email);
        if (!user) {
        }
    
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return done(null, false, { message: "Invalid password"});
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);