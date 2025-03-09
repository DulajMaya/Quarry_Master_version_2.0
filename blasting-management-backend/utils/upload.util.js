// upload.util.js

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;
    switch (file.fieldname) {
      case 'quotaSeal':
        uploadPath = 'uploads/quota-seals/';
        break;
      case 'blastingReport':
        uploadPath = 'uploads/blasting-reports/';
        break;
      case 'safetyChecklist':
        uploadPath = 'uploads/safety-checklists/';
        break;
      default:
        uploadPath = 'uploads/';
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only certain file types based on the field name
  switch (file.fieldname) {
    case 'quotaSeal':
    case 'blastingReport':
    case 'safetyChecklist':
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed'), false);
      }
      break;
    default:
      return cb(null, true);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB file size limit
  }
}).fields([
  { name: 'quotaSeal', maxCount: 1 },
  { name: 'blastingReport', maxCount: 1 },
  { name: 'safetyChecklist', maxCount: 1 }
]);

module.exports = { upload };