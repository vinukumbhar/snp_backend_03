const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const dbconnect = require("./database/connectDb");
const app = express();

const fs = require('fs');
require("dotenv").config();
const multer = require('multer');
app.use(express.json());

app.use(cors());

// database connect
dbconnect();

// Serve static files from the 'uploads' folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure the 'uploads' directory exists
  },
  filename: (req, file, cb) => {
    cb(null, `avatar_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// Route to upload the cropped image
app.post('/userprofilepic', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.status(200).json({ imageUrl: `/uploads/${req.file.filename}` }); // Return URL path for image
});

// Route to retrieve the last uploaded image
app.get('/lastimage', (req, res) => {
  const uploadsDir = path.join(__dirname, 'uploads');
  fs.readdir(uploadsDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Unable to fetch files' });

    const avatarFiles = files.filter(file => file.startsWith('avatar_'));
    if (avatarFiles.length === 0) {
      return res.status(404).json({ error: 'No image found' });
    }

    // Return the latest uploaded file
    avatarFiles.sort((a, b) => fs.statSync(path.join(uploadsDir, b)).mtime - fs.statSync(path.join(uploadsDir, a)).mtime);
    // res.status(200).json({ imageUrl: `http://127.0.0.1:${PORT}/uploads/${avatarFiles[0]}` }); // Return the path for the latest image
  });
});

//! Common Routes
const userRoutes = require("./routes/userRoute");
app.use("/common", userRoutes);

//! otp
// const otpController = require("../../backend/Admin-signup-backend/middleware/otpController");
const otpController = require("../Admin-signup-backend/middleware/otpController");
app.use("/", otpController);
// snp_backend_01
// !client
// const clientsignupOTPmail = require("../../backend/Admin-signup-backend/middleware/clientsignupOTPmail");
const clientsignupOTPmail = require("../Admin-signup-backend/middleware/clientsignupOTPmail");
app.use("/", clientsignupOTPmail);
// ! admin
// const adminRoutes = require("../../backend/Admin-signup-backend/routes/adminRoutes");
const adminRoutes = require("../Admin-signup-backend/routes/adminRoutes");
app.use("/admin", adminRoutes);

// const usersavedemail = require("../../backend/Admin-signup-backend/middleware/usersavedemail");
const usersavedemail = require("../Admin-signup-backend/middleware/usersavedemail");
app.use("/", usersavedemail);

//! resetpassword
const resetpassword = require("./controller/resetPasswordController");
app.use("/", resetpassword);

//! resetpassword
const teammemberpasswordupdate = require("../Admin-signup-backend/middleware/teammemberpasswordupdate");
app.use("/", teammemberpasswordupdate);

//!  Routes
const passwordupdateemail = require("../Admin-signup-backend/middleware/passwordupdatemail");
app.use("/", passwordupdateemail);

//! EmailTemplate Routes
const clientsavedemail = require("../Admin-signup-backend/middleware/clientsavedEmail");
app.use("/", clientsavedemail);

//! EmailTemplate Routes
const teammembersavedemail = require("../Admin-signup-backend/middleware/teamMembersendInviteEmail");
app.use("/", teammembersavedemail);

const emailsync = require("../Admin-signup-backend/middleware/emailsync");
app.use("/", emailsync);

app.use("/uploads", express.static("middleware/uploads"));
// app.use('/uploads', express.static(path.join(__dirname, 'middleware/uploads')));
// app.use("/uploads", express.static("middleware/uploads"));
// app.use('/uploads', express.static(path.join(__dirname, 'middleware/uploads')));

// firmsettinga
const firmsetting = require("./routes/firmsettingRoutes");
app.use("/", firmsetting);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`connection is live at port no. ${PORT}`);
});
