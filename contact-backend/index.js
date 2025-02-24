const express = require('express');
const dbconnect = require('./database/dbconnect');
const app = express();
const cors = require('cors');
const contactRoutes = require('./routers/contactRoutes');
const AccountsRoutes = require('./routers/AccountsRoutes');
const AssignTags = require('./middleware/assignbulktags')
const manageTeamMember = require("./middleware/manageTeamMember");
const mongoose = require('mongoose');

// Middleware
app.use(cors());
// app.use(express.json());
app.use(express.json({ limit: '50mb' })); 
//   Routes for contacts
app.use('/contacts', contactRoutes)

app.use('/accounts', AccountsRoutes)

// app.use('/', AssignTags)

//! assignbulktags Routes
const assignbulktags = require("./middleware/assignbulktags");
app.use("/assignbulktags", assignbulktags);


//! sendBulkEmails Routes
const sendBulkEmails = require("./middleware/sendBulkEmails");
app.use("/sendemails", sendBulkEmails);


const  editloginnotifyemailsync = require("./middleware/editloginnotifyemailsync")
app.use('/editloginnotifyemail', editloginnotifyemailsync)

//Cors Polycy 
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true'); // Set the header to 'true' to allow credentials
    next();
  });

// database connect
dbconnect()


app.use("/manageteammember", manageTeamMember);
app.use('/assigntags', AssignTags)
const port = process.env.PORT || 8004;

app.listen(port, ()=>{
    console.log(`connection is live at port no. ${port}`);
})