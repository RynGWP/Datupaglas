




// To implement an OTP system alongside your Google OAuth strategy, follow these steps:

// 1. Add OTP Generation Logic
// Use a library like otp-generator or speakeasy for generating OTPs.

// npm install otp-generator

// const otpGenerator = require('otp-generator');
// const sendOTP = require('./sendOTP'); // Function to send OTP via email/SMS

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.CLIENT_ID,
//       clientSecret: process.env.CLIENT_SECRET,
//       callbackURL: "http://localhost:3000/auth/google/callback",
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       console.log("Google Auth Profile:", profile);
//       try {
//         const user = await User.findOrCreateGoogleUser(profile);

//         // Generate and save OTP
//         const otp = otpGenerator.generate(6, {
//           upperCase: false,
//           specialChars: false,
//         });
//         await User.saveOTP(user.email, otp); // Save OTP in DB

//         // Send OTP to user
//         await sendOTP(user.email, otp);

//         return done(null, { email: user.email, requiresOTP: true });
//       } catch (err) {
//         return done(err);
//       }
//     }
//   )
// );


// 2. OTP Verification Route
// Create a route for OTP verification.

// javascript
// Copy code
// app.post('/auth/verify-otp', async (req, res) => {
//   const { email, otp } = req.body;

//   try {
//     const user = await User.findByEmail(email);

//     if (user && user.otp === otp) {
//       // Clear OTP after verification
//       await User.clearOTP(email);

//       req.login(user, (err) => {
//         if (err) return res.status(500).send("Login error");
//         res.redirect('/dashboard'); // Successful login
//       });
//     } else {
//       res.status(400).send("Invalid OTP");
//     }
//   } catch (err) {
//     res.status(500).send("Server error");
//   }
// });



// 3. Update Serialization/Deserialization
// Ensure only fully verified users are serialized/deserialized:


// passport.serializeUser((user, done) => {
//   if (user.requiresOTP) {
//     done(null, { email: user.email, requiresOTP: true });
//   } else {
//     done(null, user.email);
//   }
// });

// passport.deserializeUser(async (data, done) => {
//   try {
//     const user = await User.findByEmail(data.email);

//     if (user && !data.requiresOTP) {
//       done(null, user);
//     } else {
//       done(null, false);
//     }
//   } catch (err) {
//     done(err);
//   }
// });

// 4. Frontend Logic
// Create an OTP input page after Google OAuth login and before the dashboard.