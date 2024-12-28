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


// Configure multer middleware
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Define allowed file types
    const allowedMimes = [
      'image/jpeg', 'image/png', 'image/gif',
      'video/mp4', 'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
}).single('file'); // Handle single file upload


// Export Passport and Authentication Middleware
export {  ensureAuthenticated, upload } ;

