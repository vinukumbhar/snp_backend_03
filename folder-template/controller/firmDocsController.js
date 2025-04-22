const File = require("../models/FileModel"); // Adjust path if needed
const path = require("path");
const fs = require("fs/promises");
// GET /api/files/:accountId
// const getFilesByAccountId = async (req, res) => {
//   const { accountId } = req.params;

//   try {
//     const files = await File.find({ accountId });
//     res.status(200).json(files);
//   } catch (error) {
//     console.error("Error fetching files by accountId:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

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
  
// const getFilesByAccountId = async (req, res) => {
//     const { accountId } = req.params;
//     const rootFolder = "Firm Docs Shared With Client";
  
//     try {
//       const files = await File.find({
//         accountId,
//         filePath: { $regex: rootFolder, $options: "i" },
//       });
  
//       const root = {
//         name: rootFolder,
//         files: [],
//         subfolders: {}
//       };
  
//       // Track folders that should be added even if they only contain #$default.txt
//       const foldersWithOnlyDefault = new Set();
  
//       files.forEach((file) => {
//         const relativePath = file.filePath.split(`/${accountId}/`)[1];
//         const pathSegments = relativePath.split("/");
  
//         const rootIndex = pathSegments.indexOf(rootFolder);
//         const folderPath = pathSegments.slice(rootIndex); // from "Firm Docs Shared With Client"
  
//         let current = root;
  
//         for (let i = 1; i < folderPath.length; i++) {
//           const segment = folderPath[i];
//           const isLast = i === folderPath.length - 1;
  
//           // Intermediate folder
//           if (!current.subfolders[segment]) {
//             current.subfolders[segment] = {
//               name: segment,
//               files: [],
//               subfolders: {}
//             };
//           }
  
//           if (isLast) {
//             if (file.filename === "#$default.txt") {
//               // Remember this folder must be shown even without file
//               foldersWithOnlyDefault.add(segment);
//             } else {
//               current.subfolders[segment].files.push(file.filename);
//             }
//           }
  
//           current = current.subfolders[segment];
//         }
  
//         // If file is directly inside root folder
//         if (folderPath.length === 1 && file.filename !== "#$default.txt") {
//           root.files.push(file.filename);
//         }
//       });
  
//       // Add empty folders that only had #$default.txt
//       foldersWithOnlyDefault.forEach((folderName) => {
//         if (!root.subfolders[folderName]) {
//           root.subfolders[folderName] = {
//             name: folderName,
//             files: [],
//             subfolders: {}
//           };
//         }
//       });
  
//       // Helper to convert subfolders object to array recursively
//       const formatStructure = (folderNode) => {
//         return Object.values(folderNode.subfolders).map((folder) => ({
//           name: folder.name,
//           files: folder.files,
//           subfolders: formatStructure(folder)
//         }));
//       };
  
//       res.status(200).json({
//         folderName: rootFolder,
//         structure: [
//           {
//             // name: root.name,
//             files: root.files,
//             subfolders: formatStructure(root)
//           }
//         ]
//       });
//     } catch (error) {
//       console.error("Error fetching files by accountId and folder:", error);
//       res.status(500).json({ message: "Server error" });
//     }
//   };
  
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
  console.log("janavi", targetPath)
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
      const accountId = req.body.accountId;
      if (!folderName || !folderPath) {
        return res.status(400).send({ error: "Both folder name and path are required" });
      }
  
      if (folderPath.includes("..")) {
        return res.status(400).send({ error: "Invalid folder path" });
      }
  
      // Normalize and construct final folder path
      const relativeSubPath = folderPath.replace(/^.*AccountId\//, "");
      const basePath = path.join("uploads", "AccountId");
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
        accountId,
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
