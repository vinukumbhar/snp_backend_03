const File = require("../models/FolderTempFileModel"); // Adjust path if needed
const path = require("path");
const fs = require("fs/promises");


const getFilesByAccountId = async (req, res) => {
    const { templateId } = req.params;
    const folderName = "Firm Docs Shared With Client";
  
    try {
      const files = await File.find({
        templateId,
        filePath: { $regex: folderName, $options: "i" },
      });
  
      res.status(200).json({
        folderName,
        files,
      });
    } catch (error) {
      console.error("Error fetching files by templateId and folder:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

const uploadFileInFirm = async (req, res) => {
    let targetPath = req.body.destinationPath;
    const templateId = req.body.accountId;
  console.log("temp id", templateId)
    if (!targetPath) {
      return res.status(400).send({ message: "Path is required in the request body." });
    }
  
    if (!req.file) {
      return res.status(400).send({ message: "No file uploaded." });
    }
  
    if (!templateId) {
      return res.status(400).send({ message: "templateId is required." });
    }
  
    // Clean path
    targetPath = targetPath.replace(/\/\//g, "/");
 
    // Default permissions
    const defaultPermissions = {
      canView: true,
      canDownload: true,
      canDelete: false,
      canUpdate: false,
    };
  
    // Parse permissions
    let permissions;
    try {
      permissions = req.body.permissions ? JSON.parse(req.body.permissions) : defaultPermissions;
    } catch (err) {
      return res.status(400).send({ message: "Invalid permissions format." });
    }
  
    const newFile = new File({
      filename: req.file.filename,
      filePath: targetPath,
      templateId,
      permissions: {
        canView: permissions.canView,
        canDownload: permissions.canDownload,
        canDelete: permissions.canDelete,
        canUpdate: permissions.canUpdate,
      },
    });
  
    try {
      await newFile.save();
      res.status(200).send({
        message: "File uploaded successfully!",
        filePath: `/${targetPath}/${req.file.filename}`,
        permissions: newFile.permissions,
        templateId: newFile.templateId,
      });
    } catch (error) {
      res.status(500).send({ message: "Error saving file to database.", error: error.message });
    }
  };

  const createFolderInFirm = async (req, res) => {
    try {
      const folderName = req.query.foldername;
      const folderPath = req.query.path;
      const templateId = req.body.accountId;
      if (!folderName || !folderPath) {
        return res.status(400).send({ error: "Both folder name and path are required" });
      }
  
      if (folderPath.includes("..")) {
        return res.status(400).send({ error: "Invalid folder path" });
      }
  
      // Normalize and construct final folder path
      const relativeSubPath = folderPath.replace(/^.*FolderTemplates\//, "");
      const basePath = path.join("uploads", "FolderTemplates");
      const finalFolderPath = path.join(basePath, relativeSubPath, folderName);
      const normalizedFolderPath = finalFolderPath.replace(/\\/g, "/");
  
      // Create the folder recursively
      await fs.mkdir(normalizedFolderPath, { recursive: true });
  
      // Create a default placeholder file in the folder
      const defaultFileName = "#$default.txt";
      const fullFilePath = path.join(normalizedFolderPath, defaultFileName);
      await fs.writeFile(fullFilePath, "");
  
      // Clean up for DB storage
      const relativeFilePath = fullFilePath
        .replace(path.join(__dirname, "../"), "")
        .replace(/\\/g, "/");
  
      const defaultPermissions = {
        canView: true,
        canDownload: true,
        canDelete: false,
        canUpdate: false,
      };
  
      const permissions = req.body.permissions || defaultPermissions;
  
      const newFile = new File({
        filename: defaultFileName,
        filePath: normalizedFolderPath,
        permissions,
        templateId,
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
  };

module.exports = { getFilesByAccountId,uploadFileInFirm,createFolderInFirm };
