const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { createFolderTemplate, getFolders, getFolder, deleteFolderTemplate, updateFolderTemplate, deleteFile, downloadfile, deleteFolder, downloadfolder, getFolderStructure, createfolder, defaultfolderStructure ,} = require("../controller/folderTemplateController");

router.get("/folder", getFolders);
router.post("/folder", createFolderTemplate);
router.get("/folder/:id", getFolder);
router.delete("/deleteFile", deleteFile);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = req.params.folder || "";
    const subfolder1 = req.params.subfolder1 || "";
    const subfolder2 = req.params.subfolder2 || "";
    const subfolder3 = req.params.subfolder3 || "";

    let uploadPath = "";
    if (subfolder3 === "blank") {
      // If subfolder2 is blank, use only folder and subfolder1
      uploadPath = path.join("uploads", folder, subfolder1, subfolder2);
    } else {
      // If subfolder2 is not blank, use folder, subfolder1, and subfolder2
      uploadPath = path.join("uploads", folder, subfolder1, subfolder2, subfolder3);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
// Initialize upload
const upload = multer({
  storage: storage,
});

// Handle POST request for file upload
router.post("/upload/:folder/:subfolder1/:subfolder2/:subfolder3", upload.single("file"), (req, res) => {
  res.send("File uploaded successfully!");
});

// folder upload

// Endpoint for renaming a file
router.put("/renameFile/:templateId/:folder/:oldFileName", (req, res) => {
  const templateId = req.params.templateId;
  const folder = req.params.folder;
  const oldFileName = req.params.oldFileName;
  const newFileName = req.body.newFileName;
  console.log(templateId);

  fs.rename(`uploads/FolderTemplates/${templateId}/${folder}/${oldFileName}, uploads/FolderTemplates/${templateId}/${folder}/${newFileName}`, (err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to rename file" });
    }
    res.json({ message: "File renamed successfully", folder, oldFileName, newFileName });
  });
});

router.post("/createFolder", async (req, res) => {
  const folderName = req.body.folderName;
  const selectedFolder = req.body.selectedFolder;
  const templateId = req.body.templateId;
  const subfolder = req.body.subfolder;

  let path;

  if (subfolder === "blank") {
    path = ` ${templateId}/${selectedFolder}/`;
  } else {
    path = `${templateId}/${selectedFolder}/${folderName}/${subfolder}`;
    console.log(path);
  }
  console.log(path);

  try {
    await fs.promises.mkdir(`uploads/FolderTemplates/${templateId}/${selectedFolder}/${folderName}`, { recursive: true });
    res.status(200).json({ message: "Folder created successfully" });
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//delete single Folder
router.post("/deleteFolder/:templateId/:folderName/:subfolder", deleteFolder);

// download file
router.get("/download/:folder/:filename", downloadfile);

// download folder
router.get("/downloadfolder/:templateId/:folderName/:subfolder", downloadfolder);

// delete Folder Template
router.delete("/folder/:id", deleteFolderTemplate);

//  update Folder Template
router.patch("/folder/:id", updateFolderTemplate);

//  getFolderStructure
router.get("/folder-structure/:folderTemplateId", getFolderStructure);

//get defaultfolderstructure
router.get("/folder-structure", defaultfolderStructure);

//POST a new Folder
router.post("/folder/createfolder", createfolder);

module.exports = router;
