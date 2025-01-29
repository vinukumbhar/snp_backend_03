// const express = require('express');
// const cors = require('cors');
// const path = require('path');
// const fs = require('fs').promises;
// const AdmZip = require('adm-zip');

// const app = express();
// const folderTemplateRoutes = require('./routes/folderTemplateRoutes');
// const dbconnect = require('./database/db');

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Database connection
// dbconnect();

// // Folder Template Routes
// app.use('/foldertemp', folderTemplateRoutes);

// // Fetch all folders and files
// app.get("/allFolders/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const uploadsPath = path.join(__dirname, `./uploads/FolderTemplates/${id}`);

//     const getAllItems = async (dir) => {
//       const items = await fs.readdir(dir);
//       const itemsPromises = items.map(async (item) => {
//         const itemPath = path.join(dir, item);
//         const stats = await fs.stat(itemPath);
//         if (stats.isDirectory()) {
//           const subItems = await getAllItems(itemPath);
//           return { folder: item, contents: subItems };
//         } else {
//           return { file: item };
//         }
//       });
//       return Promise.all(itemsPromises);
//     };

//     const folderData = await getAllItems(uploadsPath);
//     res.status(200).json({ folders: folderData });
//   } catch (error) {
//     console.error("Error fetching all folders:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });


// // API to create a folder
// app.get("/createFolder", async (req, res) => {
//   try {
//     const folderName = req.query.foldername; // Folder name
//     const folderPath = req.query.path; // Path

//     if (!folderName || !folderPath) {
//       return res.status(400).send({ error: "Both folder name and path are required" });
//     }

//     // Resolve the full path safely
//     const fullPath = path.resolve(__dirname, folderPath, folderName);

//     // Create the folder (recursive: true allows nested folder creation)
//     await fs.mkdir(fullPath, { recursive: true });

//     console.log("Folder created at:", fullPath);
//     res.send({ message: "Folder created successfully", fullPath });
//   } catch (error) {
//     console.error("Error creating folder:", error);
//     res.status(500).send({ error: "Failed to create folder" });
//   }
// });


// // 
// // Start the server
// const port = process.env.PORT || 8005;
// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });




const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs").promises;
const AdmZip = require("adm-zip");

const app = express();
const folderTemplateRoutes = require("./routes/folderTemplateRoutes");
const dbconnect = require("./database/db");
const multer = require("multer");

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
dbconnect();

// Folder Template Routes
app.use("/foldertemp", folderTemplateRoutes);

// Fetch all folders and files
app.get("/allFolders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const uploadsPath = path.join(__dirname, `./uploads/FolderTemplates/${id}`);

    const getAllItems = async (dir) => {
      const items = await fs.readdir(dir);
      const itemsPromises = items.map(async (item) => {
        const itemPath = path.join(dir, item);
        const stats = await fs.stat(itemPath);
        if (stats.isDirectory()) {
          const subItems = await getAllItems(itemPath);
          return { folder: item, contents: subItems };
        } else {
          return { file: item };
        }
      });
      return Promise.all(itemsPromises);
    };

    const folderData = await getAllItems(uploadsPath);
    res.status(200).json({ folders: folderData });
  } catch (error) {
    console.error("Error fetching all folders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API to create a folder
app.get("/createFolder", async (req, res) => {
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

// Start the server
const port = process.env.PORT || 8005;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
