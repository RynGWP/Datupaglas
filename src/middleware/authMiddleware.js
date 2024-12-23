import multer from 'multer';

// Authentication Middleware
function ensureAuthenticated(req, res, next) {
  if (req.session.user_id || req.session.email ){
    req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;  // Extend session expiration
    return next();
  } else {
    res.status(401).send('User not authenticated');
  }
}


// Configure multer to store files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Optional: Set file size limit to 5MB
});


// Export Passport and Authentication Middleware
export {  ensureAuthenticated, upload } ;

