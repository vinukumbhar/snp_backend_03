// multerConfig.js
const multer = require('multer');
const path = require('path');

// Set up storage engine for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    // Use the original file name
    cb(null, file.originalname);
  },
});

// Initialize Multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
}).array('attachments', 5); // Allow up to 5 files in the 'attachments' field

module.exports = upload;