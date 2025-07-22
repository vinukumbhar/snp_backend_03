const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dbconnect = require('./database/db');
const cors = require('cors');
app.use(express.json());
app.use(cors());




const internalChatRoutes = require("./routes/internalChatRoutes");
app.use("/api/internalchat", internalChatRoutes);


// database connect
dbconnect()

// Start the server
const port = process.env.PORT || 8017;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
