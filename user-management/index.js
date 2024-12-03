const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/userRoutes');
const dbconnect = require('./database/dbConnect');
const app = express();
require('dotenv').config();
app.use(express.json());


app.use(cors());

app.use('/api/auth/users', authRoutes);

// database connect
dbconnect()

const PORT = process.env.PORT || 8080;
app.listen(PORT, ()=>{
    console.log(`connection is live at port no. ${PORT}`);
})

// const express = require('express');
// const nodemailer = require('nodemailer');
// const bodyParser = require('body-parser');
// const crypto = require('crypto');
// const cors = require('cors');

// const app = express();
// const port = process.env.PORT || 8080;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // In-memory store for OTPs (consider using a database in production)
// const otps = {};

// // Email configuration using Nodemailer
// const transporter = nodemailer.createTransport({
//   service: 'gmail', // You can use other services like Outlook, Yahoo, etc.
//   auth: {
//     user: 'janavijpatil0406@gmail.com', // Replace with your email
//     pass: 'lelc dmva pafa yrzk',  // Replace with your email password
//   },
// });

// // Generate a 6-digit OTP
// const generateOtp = () => {
//   return crypto.randomInt(100000, 999999).toString();
// };

// // Route to send OTP
// app.post('/api/auth/users/send-otp', async (req, res) => {
//   const { email } = req.body;

//   if (!email) {
//     return res.status(400).json({ message: 'Email is required' });
//   }

//   // Generate OTP and store it
//   const otp = generateOtp();
//   otps[email] = otp;

//   // Setup email data
//   const mailOptions = {
//     from: 'janavijpatil0406@gmail.com', // Replace with your email
//     to: email,
//     subject: 'Your OTP Code',
//     text: `Your OTP is ${otp}`,
//   };

//   try {
//     // Send OTP via email
//     await transporter.sendMail(mailOptions);
//     console.log(`OTP sent to ${email}: ${otp}`);
//     res.status(200).json({ message: 'OTP sent successfully' });
//   } catch (error) {
//     console.error('Error sending OTP:', error);
//     res.status(500).json({ message: 'Failed to send OTP' });
//   }
// });

// // Route to verify OTP
// app.post('/api/auth/users/verify-otp', (req, res) => {
//   const { email, otp } = req.body;

//   if (!email || !otp) {
//     return res.status(400).json({ message: 'Email and OTP are required' });
//   }

//   // Check if the OTP matches
//   if (otps[email] === otp) {
//     // OTP is valid, proceed with signup logic
//     return res.status(200).json({ message: 'OTP verified successfully' });
//   } else {
//     return res.status(400).json({ message: 'Invalid OTP' });
//   }
// });

// // Signup route (after OTP verification)
// app.post('/api/auth/users/signup', (req, res) => {
//   const { email } = req.body;

//   // Here you would handle saving the user to the database
//   // This is just a placeholder for actual signup logic
//   console.log(`User signed up with email: ${email}`);
//   res.status(201).json({ message: 'Signup successful' });
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });
