const express = require('express');
const cors = require('cors');
const app = express();
const clientRoutes = require('./routes/clientsRoutes');
const dbconnect = require('./mogodb/db');
const doclistRoutes = require('./routes/doclistRoutes')
const path = require('path');
const fileRoutes = require('./routes/organizerFileRoutes')
// Middleware
app.use(cors());
app.use(express.json());


// database connect
dbconnect()

app.use('/clientdocs', clientRoutes);

app.use('/clientlist/documents', doclistRoutes)




// Static folder to serve uploaded files (optional)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use routes
app.use('/api/files', fileRoutes);

const port = process.env.PORT || 8002;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

