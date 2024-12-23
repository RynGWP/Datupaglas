import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../../models/userModel.js';
import dotenv from 'dotenv';
dotenv.config();


// Google OAuth Strategy Registration
passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log("Google Auth Profile:", profile);
        try {
          const user = await User.findByEmail(profile.emails[0].value);
           await User.updatePictureByEmail(profile.emails[0].value, profile.photos[0].value);
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );