import passport from 'passport';
import { User } from '../models/userModel.js';

import './strategies/passport-local.js'
import './strategies/passport-google.js';

passport.serializeUser((user, done) => done(null, user.email));  //the purpose of this serializeUser is to store the email to the session.

passport.deserializeUser(async (email, done) => {    //  Whereas, the deserializeUser is to retrieve the users info in the database using email stored in the serializedUser.
  try {
    const user = await User.findByEmail(email);    // By using this query you can retrieve the information by using users email.
    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  } catch (err) {
    done(err);
  }
});

export default passport;
