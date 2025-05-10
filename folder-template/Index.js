

// Backend (server/index.js)
const express = require("express");
const multer = require("multer");
const fs = require("fs-extra");
const path = require("path");
const unzipper = require("unzipper");
const cors = require("cors");  // Import CORS middleware
const app = express();
const dbconnect = require("./database/db");
const folderTemplateRoutes = require('./routes/folderTemplateRoutes');
const firmDocsRoutes = require('./routes/firmDocsRouter')
const File = require("./models/FolderTempFileModel")
// const clientDocRoutes = require("./Routes.js/ClientRoutes")
const adminRoutes = require("./routes/AdminRoutes")
// app.use(cors({ origin: "http://localhost:3000" })); // Allow frontend to access API
app.use(cors());
app.use(express.json()); // Allows parsing JSON body
app.use(express.urlencoded({ extended: true })); // Allows parsing form data


// Middleware to dynamically store files
// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // // Log and get destination path from the request body
    const destinationPath = req.body.destinationPath || "uploads"; // Default to 'uploads' if not provided
    console.log("janavi",destinationPath);

    // Set the destination path
    cb(null, destinationPath);

  },
  
  filename: (req, file, cb) => {
    if (!file.originalname) {
      return cb(new Error("Invalid file"), false);
    }
    cb(null, `${file.originalname}`);
  }
});

// const upload = multer({ storage: storage });
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname) {
      console.log("Skipping empty file...");
      return cb(null, false);
    }
    cb(null, true);
  }
});
dbconnect();



app.post("/uploadfolderintemplate", upload.single("folderZip"), async (req, res) => {
  if (!req.file || !req.body.folderName || !req.body.destinationPath) {
    return res.status(400).json({ error: "Missing file, folder name, or destination path" });
  }

  const folderName = req.body.folderName;
  const destinationPath = req.body.destinationPath;
  const zipPath = req.file.path;
  const extractPath = path.join(  destinationPath, folderName);
console.log(extractPath)
  try {
    console.log("Extracting:", zipPath, "to", extractPath);
    await fs.ensureDir(extractPath);

    const zipStream = fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: extractPath }));

    zipStream.on("close", async () => {
      try {
        await fs.unlink(zipPath);
        console.log("Deleted ZIP file:", zipPath);
        res.json({ 
          message: "Folder extracted successfully!", 
          path: extractPath,
          destination: destinationPath 
        });
      } catch (unlinkError) {
        console.error("Error deleting ZIP:", unlinkError);
        res.status(500).json({ error: "Extraction completed, but ZIP deletion failed" });
      }
    });

    zipStream.on("error", async (err) => {
      console.error("Extraction error:", err);
      await fs.unlink(zipPath);
      res.status(500).json({ error: "Extraction failed, ZIP deleted" });
    });

  } catch (error) {
    console.error("Server error:", error);
    await fs.unlink(zipPath);
    res.status(500).json({ error: "Server error, ZIP deleted" });
  }
});
app.get("/getFolders", async (req, res) => {
  try {
    const uploadsPath = path.join(__dirname, "uploads");

    // Check if the directory exists
    if (!fs.existsSync(uploadsPath)) {
      return res.status(404).send({ message: "Uploads directory not found" });
    }

    // Read the directory contents and filter out only folders
    const items = await fs.readdir(uploadsPath, { withFileTypes: true });
    const folders = items
      .filter((item) => item.isDirectory())
      .map((folder) => folder.name);

    res.status(200).send({ folders });
  } catch (error) {
    console.error("Error getting folders:", error);
    res.status(500).send({ error: "Failed to retrieve folders" });
  }
});
app.get("/getFoldersWithContents", async (req, res) => {
  try {
    const uploadsPath = path.join(__dirname, "uploads", "FolderTemplates");

    if (!fs.existsSync(uploadsPath)) {
      return res.status(404).send({ message: "Uploads directory not found" });
    }

    // Function to get folder structure
    const getFolderContents = (dirPath) => {
      const items = fs.readdirSync(dirPath, { withFileTypes: true });

      return items.map((item) => {
        const fullPath = path.join(dirPath, item.name);

        if (item.isDirectory()) {
          return {
            id: fullPath, // Unique ID
            folder: item.name,
            isOpen: false, // Default closed
            contents: getFolderContents(fullPath), // Recursively fetch contents
          };
        } else {
          return { id: fullPath, file: item.name };
        }
      });
    };

    const folders = getFolderContents(uploadsPath);

    res.status(200).json({ folders });
  } catch (error) {
    console.error("Error retrieving folders:", error);
    res.status(500).json({ error: "Failed to retrieve folders and files" });
  }
});




app.get("/allFolders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const uploadsPath = path.join(__dirname, `./uploads/FolderTemplates/${id}/Client Uploaded Documents/unsealed`);

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

app.post("/uploadfile", upload.single("file"), (req, res) => {
  // Extract path from the form data
  let targetPath = req.body.destinationPath;
  // Replace all occurrences of '//' with '/'
  targetPath = targetPath.replace(/\/\//g, "/");
console.log(targetPath)
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
    // filePath: `${targetPath}/${req.file.filename}`,
  });
});


app.post("/uploadfileinfirm", upload.single("file"), async (req, res) => {
  // Extract the file path and permissions from the request
  let targetPath = req.body.destinationPath;
  console.log("jjjj",targetPath)
  // Default permissions if not provided by user
  const defaultPermissions = {
    canView: true,
    canDownload: true,
    canDelete: false,
    canUpdate: false,
  };

  // Use user-provided permissions or fall back to defaults
  const permissions = req.body.permissions || defaultPermissions;

  // Replace all occurrences of '//' with '/'
  targetPath = targetPath.replace(/\/\//g, "/");

  console.log("Vinayak");

  if (!targetPath) {
    return res.status(400).send({ message: "Path is required in the request body." });
  }

  if (!req.file) {
    return res.status(400).send({ message: "No file uploaded." });
  }

  // Create a new file document with permissions
  const newFile = new File({
    filename: req.file.filename,
    filePath: targetPath,
    permissions: {
      canView: permissions.canView,
      canDownload: permissions.canDownload,
      canDelete: permissions.canDelete,
      canUpdate: permissions.canUpdate,
    },
  });

  try {
    // Save the file and permissions to MongoDB
    await newFile.save();
    res.status(200).send({
      message: "File uploaded successfully!",
      filePath: `/${targetPath}/${req.file.filename}`,
      permissions: newFile.permissions,
    });
  } catch (error) {
    res.status(500).send({ message: "Error saving file to database.", error: error.message });
  }
});
app.post("/createFolderinfirm", async (req, res) => {
  try {
    const folderName = req.query.foldername;
    const folderPath = req.query.path;

    if (!folderName || !folderPath) {
      return res.status(400).send({ error: "Both folder name and path are required" });
    }

    if (folderPath.includes("..")) {
      return res.status(400).send({ error: "Invalid folder path" });
    }

    const relativeSubPath = folderPath.replace(/^.*FolderTemplates\//, "");
    const basePath = path.join(__dirname, "uploads", "FolderTemplates");
    const finalFolderPath = path.join(basePath, relativeSubPath, folderName);
    const normalizedFolderPath = finalFolderPath.replace(/\\/g, "/");

    // Create folder recursively
    await fs.mkdir(normalizedFolderPath, { recursive: true });

    // Create empty default file inside folder
    const defaultFileName = "#$default.txt";
    const fullFilePath = path.join(normalizedFolderPath, defaultFileName);
    const filePath = normalizedFolderPath;
    await fs.writeFile(fullFilePath, "");

    // Relative path to store in DB
    const relativeFilePath = fullFilePath.replace(path.join(__dirname, "/"), "").replace(/\\/g, "/");

    const defaultPermissions = {
      canView: true,
      canDownload: true,
      canDelete: false,
      canUpdate: false,
    };

    const permissions = req.body.permissions || defaultPermissions;

    const newFile = new File({
      filename: defaultFileName,
      filePath: filePath,
      permissions,
    });

    await newFile.save();

    return res.status(200).send({
      message: "Folder and default.txt file created successfully!",
      folderPath: relativeFilePath.replace(`/${defaultFileName}`, ""),
      permissions: newFile.permissions,
    });

  } catch (error) {
    console.error("Error creating folder:", error);
    return res.status(500).send({ error: "Failed to create folder" });
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

// Serve files from 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Helper function to recursively get directory contents
async function getDirectoryContents(dirPath) {
  const items = await fs.readdir(dirPath, { withFileTypes: true });
  
  const contents = await Promise.all(items.map(async (item) => {
    const itemPath = path.join(dirPath, item.name);
    const itemInfo = {
      name: item.name,
      type: item.isDirectory() ? 'folder' : 'file',
      path: itemPath.replace(__dirname, '') // Relative path for security
    };

    if (item.isDirectory()) {
      itemInfo.contents = await getDirectoryContents(itemPath);
    }

    return itemInfo;
  }));

  return contents;
}

app.get("/getSealedContent/:clientId", async (req, res) => {
  try {
    const { clientId } = req.params;
    const sealedPath = path.join(
      __dirname,
      "uploads",
      "FolderTemplates",
      clientId,
      "Client Uploaded Documents",
      "sealed"
    );

    // Check if the directory exists
    try {
      await fs.access(sealedPath);
    } catch {
      return res.status(404).json({ 
        success: false,
        message: "Sealed directory not found" 
      });
    }

    const contents = await getDirectoryContents(sealedPath);
    
    res.status(200).json({
      success: true,
      path: sealedPath.replace(__dirname, ''),
      contents
    });
  } catch (error) {
    console.error("Error getting sealed content:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to retrieve sealed content",
      details: error.message 
    });
  }
});

app.get("/getUnsealedContent/:clientId", async (req, res) => {
  try {
    const { clientId } = req.params;
    const unsealedPath = path.join(
      __dirname,
      "uploads",
      "FolderTemplates",
      clientId,
      "Client Uploaded Documents",
      "unsealed"
    );

    // Check if the directory exists
    try {
      await fs.access(unsealedPath);
    } catch {
      return res.status(404).json({ 
        success: false,
        message: "Unsealed directory not found" 
      });
    }

    const contents = await getDirectoryContents(unsealedPath);
    
    res.status(200).json({
      success: true,
      path: unsealedPath.replace(__dirname, ''),
      contents
    });
  } catch (error) {
    console.error("Error getting unsealed content:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to retrieve unsealed content",
      details: error.message 
    });
  }
});


// Route to get all files
app.get('/api/files', async (req, res) => {
  
  try {
    const files = await File.find({}); // Fetch all files

    res.status(200).json({
      success: true,
      count: files.length,
      data: files,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

app.get('/api/files/account/:templateId', async (req, res) => {
  const { templateId } = req.params;

  try {
    const files = await File.find({ templateId }); // Match files with the provided accountId

    res.status(200).json({
      success: true,
      count: files.length,
      data: files,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});


app.use("/foldertemplates", adminRoutes)
app.use("/foldertemp", folderTemplateRoutes);
app.use('/firmClientDocs',firmDocsRoutes)
app.listen(8005, () => console.log("Server running on port 8005"));
