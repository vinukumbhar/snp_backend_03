const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const AdmZip = require('adm-zip');

const app = express();
const folderTemplateRoutes = require('./routes/folderTemplateRoutes');
const dbconnect = require('./database/db');

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
dbconnect();

// Folder Template Routes
app.use('/foldertemp', folderTemplateRoutes);

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
      return res.status(400).send({ error: "Both folder name and path are required" });
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


// 
// Start the server
const port = process.env.PORT || 8005;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
