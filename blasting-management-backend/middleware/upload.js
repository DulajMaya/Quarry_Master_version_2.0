/*// middleware/upload.js
const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/licenses')  // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-originalname
    cb(null, Date.now() + '-' + file.originalname)
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
    req.fileValidationError = 'Only image files are allowed!';
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Create upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: fileFilter
});

const blastSketchUpload = multer({
  storage: multer.diskStorage({
      destination: function (req, file, cb) {
          cb(null, 'uploads/blast-sketches');
      },
      filename: function (req, file, cb) {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
  }),
  fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
          cb(null, true);
      } else {
          cb(new Error('Invalid file type'), false);
      }
  },
  limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
  }
});

module.exports = {upload,
  blastSketchUpload: blastSketchUpload.single('holes_sketch')} */

  // middleware/upload.js

// middleware/upload.js
const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/licenses')  // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-originalname
    cb(null, Date.now() + '-' + file.originalname)
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
    req.fileValidationError = 'Only image files are allowed!';
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

module.exports = upload;