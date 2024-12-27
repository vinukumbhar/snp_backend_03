// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./database/db');
const automationRoutes = require('./routes/automationRoutes');

dotenv.config();
const app = express();

// Connect to database
connectDB();
app.use(cors());
app.use(express.json()); 

// Routes
app.use('/automations', automationRoutes);

// Server setup
const PORT = process.env.PORT || 8011;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
