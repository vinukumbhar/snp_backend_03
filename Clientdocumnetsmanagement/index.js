const express = require('express');
const cors = require('cors');
const app = express();
const clientRoutes = require('./routes/clientsRoutes');
const dbconnect = require('./mogodb/db');
const doclistRoutes = require('./routes/doclistRoutes')
const path = require("path");
const fs = require("fs").promises;
const multer = require("multer");
const fileRoutes = require('./routes/organizerFileRoutes')
// Middleware
app.use(cors());
app.use(express.json());


// database connect
dbconnect()

app.use('/clientdocs', clientRoutes);

app.use('/clientlist/documents', doclistRoutes)



// API to create a folder
app.get("/createnewFolder", async (req, res) => {
  try {
    const folderName = req.query.foldername; // Folder name
    const folderPath = req.query.path; // Path

    if (!folderName || !folderPath) {
      return res
        .status(400)
        .send({ error: "Both folder name and path are required" });
    }

    // Resolve the full path safely
    const fullPath = path.resolve(__dirname, folderPath, folderName);
console.log(fullPath)
    // Create the folder (recursive: true allows nested folder creation)
    await fs.mkdir(fullPath, { recursive: true });

    console.log("Folder created at:", fullPath);
    res.send({ message: "Folder created successfully", fullPath });
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).send({ error: "Failed to create folder" });
  }
});

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Log and get destination path from the request body
    const destinationPath = req.body.destinationPath || "uploads"; // Default to 'uploads' if not provided
    console.log(destinationPath);

    // Set the destination path
    cb(null, destinationPath);
  },
  filename: (req, file, cb) => {
    // Use the original file name, but ensure it is safe for filenames by handling spaces and special characters
    const fileName = file.originalname.replace(/\s+/g, "_"); // Replace spaces with underscores
    cb(null, fileName); // Save with the original file name
  },
});

const upload = multer({ storage: storage });

// Create an API endpoint to upload files
app.post("/uploadfile", upload.single("file"), (req, res) => {
  // Extract path from the form data
  let targetPath = req.body.destinationPath;
  // Replace all occurrences of '//' with '/'
  targetPath = targetPath.replace(/\/\//g, "/");

  if (!targetPath) {
    return res
      .status(400)
      .send({ message: "Path is required in the request body." });
  }

  if (!req.file) {
    return res.status(400).send({ message: "No file uploaded." });
  }
  res.status(200).send({
    message: "File uploaded successfully!",
    filePath: `/uploads/${req.file.filename}`,
  });
});

// Static folder to serve uploaded files (optional)
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use routes
app.use('/api/files', fileRoutes);





const port = process.env.PORT || 8006;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

