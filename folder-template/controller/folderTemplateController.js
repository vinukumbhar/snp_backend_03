const FolderTemplate = require("../models/folderTemplate");

const fs = require("fs");
const fsPromises = require("fs").promises;
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const AdmZip = require("adm-zip");

// Helper function to add files to zip
const addFilesToZip = async (zip, folderPath, folderName) => {
  const items = await fsPromises.readdir(folderPath, { withFileTypes: true });

  for (let item of items) {
    const itemPath = path.join(folderPath, item.name);

    if (item.isDirectory()) {
      // Recursively add subfolder to zip
      const subfolder = folderName ? path.join(folderName, item.name) : item.name;
      await addFilesToZip(zip, itemPath, subfolder);
    } else {
      // Add file to zip
      const filePathInZip = folderName ? path.join(folderName, item.name) : item.name;
      zip.addLocalFile(itemPath, path.dirname(filePathInZip));
    }
  }
};

// Create folder
const createFolderTemplate = async (req, res) => {
  const { clientFolder, firmFolder, privateFolder, folderName, selectedFolderOption } = req.body;
  const { templatename, active } = req.body;
  console.log(req.body);

  try {
    let newFolderTemplate;

    const existingFolderTemplate = await FolderTemplate.findOne({ templatename });

    if (existingFolderTemplate) {
      return res.status(400).json({ message: "Folder Template already exists" });
    }

    newFolderTemplate = await FolderTemplate.create({ templatename, active });

    // Create folder based on newAccount._id
    const folderTemplateIdFolder = `uploads/FolderTemplates/${newFolderTemplate._id}`;
    // if (!fs.existsSync(folderTemplateIdFolder)) {
    //   fs.mkdirSync(folderTemplateIdFolder, { recursive: true });
    //   fs.mkdirSync(folderTemplateIdFolder + `/${clientFolder}`, { recursive: true });
    //   fs.mkdirSync(folderTemplateIdFolder + `/${firmFolder}`, { recursive: true });
    //   fs.mkdirSync(folderTemplateIdFolder + `/${privateFolder}`, { recursive: true });
    //   // fs.mkdirSync(folderTemplateIdFolder + `/${selectedFolderOption}` + `/${folderName}`, { recursive: true });
    // }

    if (!fs.existsSync(folderTemplateIdFolder)) {
  fs.mkdirSync(folderTemplateIdFolder, { recursive: true });

  // Create client folder with subfolders sealed and unsealed
  const clientFolderPath = path.join(folderTemplateIdFolder, clientFolder);
  fs.mkdirSync(clientFolderPath, { recursive: true });
  fs.mkdirSync(path.join(clientFolderPath, "sealed"), { recursive: true });
  fs.mkdirSync(path.join(clientFolderPath, "unsealed"), { recursive: true });

  // Firm folder
  fs.mkdirSync(path.join(folderTemplateIdFolder, firmFolder), { recursive: true });

  // Private folder
  fs.mkdirSync(path.join(folderTemplateIdFolder, privateFolder), { recursive: true });

  // Optional nested structure (uncomment and customize as needed)
  // fs.mkdirSync(path.join(folderTemplateIdFolder, selectedFolderOption, folderName), { recursive: true });
}

    console.log(newFolderTemplate._id);
    res.status(200).json({ id: newFolderTemplate._id });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// get all folder
const getFolders = async (req, res) => {
  try {
    const folderTemplates = await FolderTemplate.find().sort({ createdAt: -1 });
    res.status(200).json({ message: "Folder Templates retrieved successfully", folderTemplates });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// get folder
const getFolder = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid Folder Template ID" });
  }

  try {
    const folderTemplate = await FolderTemplate.findById(id);

    if (!folderTemplate) {
      return res.status(404).json({ error: "No such Folder Template" });
    }

    res.status(200).json({ message: "Folder Templates retrieved successfully", folderTemplate });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

//delete a FolderTemplate

const deleteFolderTemplate = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid Folder Template ID" });
  }

  try {
    const deletedFolderTemplate = await FolderTemplate.findByIdAndDelete({ _id: id });
    if (!deletedFolderTemplate) {
      return res.status(404).json({ error: "No such Folder Template" });
    }
    res.status(200).json({ message: " Folder Template deleted successfully", deletedFolderTemplate });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// update a FolderTemplate
const updateFolderTemplate = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid  Folder Template ID" });
  }

  try {
    const updatedFolderTemplate = await FolderTemplate.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true } // This option ensures that the updated document is returned
    );

    if (!updatedFolderTemplate) {
      return res.status(404).json({ error: "No such Folder Template" });
    }

    res.status(200).json({ message: "Folder Template updated successfully", FolderTemplate: updatedFolderTemplate });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
//rename file

// Delete file

const deleteFile = async (req, res) => {
  const folderName = req.body.folderName;
  const fileName = req.body.fileName;
  const templateId = req.body.templateId;

  console.log(req.body.folderName);

  try {
    // Check if both folder and filename parameters are present
    if (!folderName || !fileName) {
      return res.status(400).json({ error: "Both folder and filename parameters are required" });
    }

    const filePath = path.join(`uploads/FolderTemplates/${templateId}`, folderName, fileName);

    // Check if the file exists before attempting to delete it
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found", details: `The file ${filePath} does not exist` });
    }

    // File exists, proceed with deletion
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        return res.status(500).json({ error: "Internal Server Error", details: err.message });
      }
      res.status(200).json({ message: "File deleted successfully" });
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

// Delete Folder
const deleteFolder = async (req, res) => {
  const { templateId, folderName, subfolder } = req.params;
  console.log(templateId, folderName, subfolder);
  try {
    const folderPath = path.join("uploads/FolderTemplates", templateId, folderName, subfolder);
    // Use recursive option to delete the folder and its contents
    await fs.rm(folderPath, { recursive: true }, (err) => {
      if (err) {
        console.error("Error deleting folder:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
        return;
      }
      res.status(200).json({ message: "Folder deleted successfully" });
    });
  } catch (error) {
    console.error("Error deleting folder:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

// download file
const downloadfile = async (req, res) => {
  try {
    const fileName = req.params.filename;
    const folder = req.params.folder;

    // Sanitize file and folder names
    const sanitizedFileName = path.basename(fileName);
    const sanitizedFolder = path.basename(folder);

    const filePath = path.join("uploads", sanitizedFolder, sanitizedFileName);
    console.log(filePath);
    res.download(filePath, (err) => {
      if (err) {
        // Handle errors (e.g., file not found)
        res.status(404).send("File not found");
      }
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).send("Internal Server Error");
  }
};

// download folder
const downloadfolder = async (req, res) => {
  const { templateId, folderName, subfolder } = req.params;
  console.log(templateId, folderName, subfolder);

  const folderPath = path.join(__dirname, "uploads/FolderTemplates/66efe96db8c106fab73b2775/", templateId, folderName);
  try {
    const zipFilePath = path.join(__dirname, "temp", `${subfolder}.zip`);
    const zip = new AdmZip();
    await addFilesToZip(zip, folderPath, subfolder);
    zip.writeZip(zipFilePath);
    res.download(zipFilePath, `${subfolder}.zip`, async () => {
      await fs.unlink(zipFilePath);
    });
  } catch (error) {
    console.error("Error creating zip file:", error);
    res.status(500).send("Internal Server Error");
  }
};

const getFolderStructure = async (req, res) => {
  const { folderTemplateId } = req.params;

  try {
    // Find the folder template by its ID
    const folderTemplate = await FolderTemplate.findById(folderTemplateId);

    if (!folderTemplate) {
      return res.status(404).json({ message: "Folder Template not found" });
    }

    // Define the root folder path
    const rootFolder = `uploads/FolderTemplates/${folderTemplateId}`;

    // Define a function to recursively list the contents of a directory
    const listDirectory = (folderPath) => {
      const contents = fs.readdirSync(folderPath, { withFileTypes: true });

      return contents.map((item) => {
        const fullPath = path.join(folderPath, item.name);
        return item.isDirectory() ? { name: item.name, children: listDirectory(fullPath) } : { name: item.name };
      });
    };

    // Get the folder structure recursively starting from the root folder
    const folderStructure = listDirectory(rootFolder);

    res.json({ folderTemplate, folderStructure });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const defaultfolderStructure = async (req, res) => {
  try {
    // Define the default folder path
    const defaultFolderPath = "uploads/FolderTemplates/Default_Folders";

    // Define a function to recursively list the contents of a directory
    const listDirectory = (folderPath) => {
      const contents = fs.readdirSync(folderPath, { withFileTypes: true });

      return contents.map((item) => {
        const fullPath = path.join(folderPath, item.name);
        return item.isDirectory() ? { name: item.name, children: listDirectory(fullPath) } : { name: item.name };
      });
    };

    // Get the folder structure recursively starting from the default folder
    const folderStructure = listDirectory(defaultFolderPath);

    res.json({ folderStructure });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// Endpoint to create a folder
const createfolder = async (req, res) => {
  const foldername = req.body.foldername; // Assuming folderName is sent in the request body
  const folderpath = req.body.folderpath;
  //console.log(vinayak);

  if (!foldername || !folderpath) {
    return res.status(400).json({ message: "Folder name and path are required" });
  }

  const fullFolderPath = path.join(`uploads/FolderTemplates/${folderpath}/`, foldername);

  // Check if the folder already exists
  if (fs.existsSync(fullFolderPath)) {
    return res.status(400).json({ message: "Folder already exists" });
  }

  // Create the folder
  fs.mkdir(fullFolderPath, { recursive: true }, (err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to create folder", error: err });
    }
    res.status(201).json({ message: "Folder created successfully" });
  });
};

module.exports = {
  createFolderTemplate,
  getFolders,
  getFolder,
  deleteFolderTemplate,
  updateFolderTemplate,
  deleteFile,
  deleteFolder,
  downloadfile,
  downloadfolder,
  getFolderStructure,
  createfolder,
  defaultfolderStructure,
};
