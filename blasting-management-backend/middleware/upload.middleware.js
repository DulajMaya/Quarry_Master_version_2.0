// upload.middleware.js

/*const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the upload directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`); // Generate a unique filename
  }
});

const fileFilter = (req, file, cb) => {
  // Only allow image files
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Only image files are allowed'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB file size limit
  }
});

module.exports = upload;*/

/*const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createStorage = (folderName) => {
    // Ensure upload directory exists
    const uploadDir = `uploads/${folderName}`;
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    return multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            // Get permit ID from request body or generate temporary one
            const timestamp = Date.now();
            const extension = path.extname(file.originalname);
            cb(null, `permit_${timestamp}${extension}`);
        }
    });
};

const fileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
};

const permitUpload = multer({
    storage: createStorage('permits'),
    fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB
    }
});

const quotaSealUpload = multer({
  storage: createStorage('quota-seals'),
  fileFilter,
  limits: {
      fileSize: 1024 * 1024 * 5 // 5MB
  }
});

const upload = multer({
  storage : createStorage('quotas'),
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB file size limit
  }
});

module.exports = {
    permitUpload,
    upload,
    quotaSealUpload
};*/


const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createStorage = (folderName) => {
    const uploadDir = `uploads/${folderName}`;
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    return multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const timestamp = Date.now();
            const extension = path.extname(file.originalname);
            const filename = `${folderName}_${timestamp}${extension}`;
            cb(null, filename);
        }
    });
};

const fileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
};

// Create separate upload instances for different types of files
const permitUpload = multer({
    storage: createStorage('permits'),
    fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB
    }
});

const quotaSealUpload = multer({
    storage: createStorage('quota-seals'),
    fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB
    }
});

const upload = multer({
  storage : createStorage('quotas'),
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB file size limit
  }
});

const paymentProofUpload = multer({
  storage: createStorage('payment-proofs'),
  fileFilter,
  limits: {
      fileSize: 1024 * 1024 * 5 // 5MB limit
  }
});

const patternDiagramUpload = multer({
  storage: createStorage('pattern-diagrams'),
  fileFilter,
  limits: {
      fileSize: 1024 * 1024 * 5 // 5MB
  }
});


const delayPatternUpload = multer({
  storage: createStorage('delay-pattern'),
  fileFilter,
  limits: {
      fileSize: 1024 * 1024 * 5 // 5MB
  }
});

module.exports = {
    permitUpload,
    quotaSealUpload,
    upload,
    paymentProofUpload,
    patternDiagramUpload,
    delayPatternUpload 
};