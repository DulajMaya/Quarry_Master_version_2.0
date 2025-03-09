// middleware/blastUpload.js
const multer = require('multer');
const path = require('path');

// Configure storage for blast-related uploads
const blastStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'holes_sketch') {
            cb(null, 'uploads/blast-sketches');
        } else if (file.fieldname === 'monitoring_report') {
            cb(null, 'uploads/monitoring-reports');
        }
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// File filter for blast documents
const blastFileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|pdf|PDF)$/)) {
        req.fileValidationError = 'Only image and PDF files are allowed!';
        return cb(new Error('Only image and PDF files are allowed!'), false);
    }
    cb(null, true);
};

const blastUpload = multer({
    storage: blastStorage,
    fileFilter: blastFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Error handler for uploads
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size is too large. Maximum size is 5MB'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    
    if (req.fileValidationError) {
        return res.status(400).json({
            success: false,
            message: req.fileValidationError
        });
    }

    next(err);
};

module.exports = {
    blastSketch: blastUpload.single('holes_sketch'),
    monitoringReport: blastUpload.single('monitoring_report'),
    multipleFiles: blastUpload.fields([
        { name: 'holes_sketch', maxCount: 1 },
        { name: 'monitoring_report', maxCount: 1 }
    ]),
    handleUploadError
};