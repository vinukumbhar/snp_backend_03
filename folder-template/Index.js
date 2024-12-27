const express = require('express');
const cors = require('cors');
const app = express();
const folderTemplateRoutes = require('./routes/folderTemplateRoutes')
const dbconnect = require('./database/db');
const multer = require("multer");
const path = require('path');
const fs=require('fs').promises;
const AdmZip = require('adm-zip')
// Middleware
app.use(cors());
app.use(express.json());


// database connect
dbconnect()

app.use('/foldertemp', folderTemplateRoutes)

app.get("/allFolders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.data);
    const uploadsPath = path.join(__dirname,`./uploads/FolderTemplates/${id}`);

    // Function to recursively get all files and folders in a directory
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

    // Fetch all files and folders recursively
    const folderData = await getAllItems(uploadsPath);

    res.status(200).json({ folders: folderData });
  } catch (error) {
    console.error("Error fetching all folders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/uploadFolder', upload.single('folder'), async (req, res) => {
  const folderName = req.file.originalname.replace('.zip', ''); // Extract folder name from zip file name
  const folderZipBuffer = req.file.buffer;
  const templateId =req.body.templateId;
  const subFolder =req.body.subFolder;
  console.log(req.body.subFolder);
  
  try {
  
    const unzipDestination = path.join(__dirname, `uploads/FolderTemplates/${templateId}/${subFolder}/`); // Adjusted destination path
    console.log("Unzip Destination:", unzipDestination);
    const zip = new AdmZip(folderZipBuffer);
    zip.extractAllTo(unzipDestination, true);

    res.status(200).json({ message: 'Folder uploaded and extracted successfully' });
  } catch (error) {
    console.error('Error uploading and extracting folder:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


const port = process.env.PORT || 8005;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

