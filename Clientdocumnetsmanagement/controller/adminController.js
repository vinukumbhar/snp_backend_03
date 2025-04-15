const path = require("path");
const fs = require("fs/promises");
const File = require("../models/FileModel")
const getsClientUploadedDocsUnsealed = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing folder ID in request params." });
    }

    const baseRelativePath = `uploads/AccountId/${id}/Client Uploaded Documents/unsealed`;
    const uploadsPath = path.join(__dirname, `../${baseRelativePath}`);

    // Utility to normalize path to forward slashes
    const toForwardSlash = (p) => p.replace(/\\/g, "/");

    // Recursive function
    const getAllItems = async (dir, relativePath = "") => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const items = await Promise.all(entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);
        const itemRelativePath = toForwardSlash(path.join(baseRelativePath, relativePath, entry.name));
        if (entry.isDirectory()) {
          const subItems = await getAllItems(fullPath, path.join(relativePath, entry.name));
          return {
            folder: entry.name,
            path: itemRelativePath,
            contents: subItems
          };
        } else {
          return {
            file: entry.name,
            path: itemRelativePath
          };
        }
      }));
      return items;
    };

    await fs.access(uploadsPath);

    const folderData = await getAllItems(uploadsPath);
    res.status(200).json({ folders: folderData });
  } catch (error) {
    console.error("Error fetching client uploaded documents:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const getsClientUploadedDocssealed = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing folder ID in request params." });
    }

    const baseRelativePath = `uploads/AccountId/${id}/Client Uploaded Documents/sealed`;
    const uploadsPath = path.join(__dirname, `../${baseRelativePath}`);

    const toForwardSlash = (p) => p.replace(/\\/g, "/");

    const getAllItems = async (dir, relativePath = "") => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const items = await Promise.all(entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);
        const itemRelativePath = toForwardSlash(path.join(baseRelativePath, relativePath, entry.name));
        if (entry.isDirectory()) {
          const subItems = await getAllItems(fullPath, path.join(relativePath, entry.name));
          return {
            folder: entry.name,
            path: itemRelativePath,
            contents: subItems
          };
        } else {
          return {
            file: entry.name,
            path: itemRelativePath
          };
        }
      }));
      return items;
    };

    await fs.access(uploadsPath);

    const folderData = await getAllItems(uploadsPath);
    res.status(200).json({ folders: folderData });
  } catch (error) {
    console.error("Error fetching client uploaded sealed documents:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// const getsClientUploadedDocsUnsealed = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       return res.status(400).json({ error: "Missing folder ID in request params." });
//     }

//     const uploadsPath = path.join(__dirname, `../uploads/FolderTemplates/${id}/Client Uploaded Documents/unsealed`);

//     // Recursive function to get all files and subfolders
//     const getAllItems = async (dir) => {
//       const entries = await fs.readdir(dir, { withFileTypes: true });
//       const items = await Promise.all(entries.map(async (entry) => {
//         const fullPath = path.join(dir, entry.name);
//         if (entry.isDirectory()) {
//           const subItems = await getAllItems(fullPath);
//           return { folder: entry.name, contents: subItems };
//         } else {
//           return { file: entry.name };
//         }
//       }));
//       return items;
//     };

//     // Check if directory exists
//     await fs.access(uploadsPath);

//     const folderData = await getAllItems(uploadsPath);
//     res.status(200).json({ folders: folderData });
//   } catch (error) {
//     console.error("Error fetching client uploaded documents:", error.message);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };
// const getsClientUploadedDocssealed = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       return res.status(400).json({ error: "Missing folder ID in request params." });
//     }

//     const uploadsPath = path.join(__dirname, `../uploads/FolderTemplates/${id}/Client Uploaded Documents/sealed`);

//     // Recursive function to get all files and subfolders
//     const getAllItems = async (dir) => {
//       const entries = await fs.readdir(dir, { withFileTypes: true });
//       const items = await Promise.all(entries.map(async (entry) => {
//         const fullPath = path.join(dir, entry.name);
//         if (entry.isDirectory()) {
//           const subItems = await getAllItems(fullPath);
//           return { folder: entry.name, contents: subItems };
//         } else {
//           return { file: entry.name };
//         }
//       }));
//       return items;
//     };

//     // Check if directory exists
//     await fs.access(uploadsPath);

//     const folderData = await getAllItems(uploadsPath);
//     res.status(200).json({ folders: folderData });
//   } catch (error) {
//     console.error("Error fetching client uploaded documents:", error.message);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

const moveBetweenSealedUnsealed = async (req, res) => {
  try {
    const { id, itemPath, direction } = req.body;
console.log(req.body)
    if (!id || !itemPath || !direction) {
      return res.status(400).json({ 
        error: "Missing required parameters: id, itemPath, or direction" 
      });
    }

    if (direction !== 'toSealed' && direction !== 'toUnsealed') {
      return res.status(400).json({ 
        error: "Invalid direction. Must be 'toSealed' or 'toUnsealed'" 
      });
    }

    const basePath = `uploads/AccountId/${id}/Client Uploaded Documents`;
    const sourceBase = direction === 'toSealed' ? 'unsealed' : 'sealed';
    const targetBase = direction === 'toSealed' ? 'sealed' : 'unsealed';

    // Construct full paths
    const fullSourcePath = path.join(__dirname, `../${basePath}/${sourceBase}`, itemPath);
    const fullTargetPath = path.join(__dirname, `../${basePath}/${targetBase}`, itemPath);

    // Ensure target directory exists
    await fs.mkdir(path.dirname(fullTargetPath), { recursive: true });

    // Move the file/folder
    await fs.rename(fullSourcePath, fullTargetPath);

    res.status(200).json({ 
      message: `Successfully moved item ${direction === 'toSealed' ? 'to sealed' : 'to unsealed'}` 
    });
  } catch (error) {
    console.error("Error moving item:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const getsClientUploadedDocs = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing folder ID in request params." });
    }

    const uploadsPath = path.join(__dirname, `../uploads/AccountId/${id}/Client Uploaded Documents/unsealed`);

    // Recursive function to get all files and subfolders
    const getAllItems = async (dir) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const items = await Promise.all(entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          const subItems = await getAllItems(fullPath);
          return { folder: entry.name, contents: subItems };
        } else {
          return { file: entry.name };
        }
      }));
      return items;
    };

    // Check if directory exists
    await fs.access(uploadsPath);

    const folderContents = await getAllItems(uploadsPath);

    // Wrap with only "Client Uploaded Documents"
    const result = {
      folders: [
        {
          folder: "Client Uploaded Documents",
          contents: folderContents
        }
      ]
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching client uploaded documents:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const getsPrivateDocs = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing folder ID in request params." });
    }

    const baseRelativePath = `uploads/AccountId/${id}/Private`;
    const uploadsPath = path.join(__dirname, `../${baseRelativePath}`);

    const toForwardSlash = (p) => p.replace(/\\/g, "/");

    const getAllItems = async (dir, relativePath = "") => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const items = await Promise.all(entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);
        const itemRelativePath = toForwardSlash(path.join(baseRelativePath, relativePath, entry.name));
        if (entry.isDirectory()) {
          const subItems = await getAllItems(fullPath, path.join(relativePath, entry.name));
          return {
            folder: entry.name,
            path: itemRelativePath,
            contents: subItems
          };
        } else {
          return {
            file: entry.name,
            path: itemRelativePath
          };
        }
      }));
      return items;
    };

    await fs.access(uploadsPath);

    const folderData = await getAllItems(uploadsPath);

    res.status(200).json({
      folders: [
        {
          folder: "Private",
          path: toForwardSlash(baseRelativePath),
          contents: folderData
        }
      ]
    });
  } catch (error) {
    console.error("Error fetching private documents:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// const getsPrivateDocs = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       return res.status(400).json({ error: "Missing folder ID in request params." });
//     }

//     const uploadsPath = path.join(__dirname, `../uploads/FolderTemplates/${id}/Private`);

//     // Recursive function to get all files and subfolders
//     const getAllItems = async (dir) => {
//       const entries = await fs.readdir(dir, { withFileTypes: true });
//       const items = await Promise.all(entries.map(async (entry) => {
//         const fullPath = path.join(dir, entry.name);
//         if (entry.isDirectory()) {
//           const subItems = await getAllItems(fullPath);
//           return { folder: entry.name, contents: subItems };
//         } else {
//           return { file: entry.name };
//         }
//       }));
//       return items;
//     };

//     // Check if directory exists
//     await fs.access(uploadsPath);

//     const folderData = await getAllItems(uploadsPath);

//     // Wrap with "Private" folder
//     const result = {
//       folders: [
//         {
//           folder: "Private",
//           contents: folderData
//         }
//       ]
//     };

//     res.status(200).json(result);
//   } catch (error) {
//     console.error("Error fetching client uploaded documents:", error.message);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };
// const getsFirmDocs = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       return res.status(400).json({ error: "Missing folder ID in request params." });
//     }

//     const uploadsPath = path.join(__dirname, `../uploads/FolderTemplates/${id}/Firm Docs Shared With Client`);

//     // Recursive function to get all files and subfolders
//     const getAllItems = async (dir) => {
//       const entries = await fs.readdir(dir, { withFileTypes: true });
//       const items = await Promise.all(entries.map(async (entry) => {
//         const fullPath = path.join(dir, entry.name);
//         if (entry.isDirectory()) {
//           const subItems = await getAllItems(fullPath);
//           return { folder: entry.name, contents: subItems };
//         } else {
//           return { file: entry.name };
//         }
//       }));
//       return items;
//     };

//     // Check if directory exists
//     await fs.access(uploadsPath);

//     const folderData = await getAllItems(uploadsPath);

//     // Wrap with "Private" folder
//     const result = {
//       folders: [
//         {
//           folder: "Firm Docs Shared With Client",
//           contents: folderData
//         }
//       ]
//     };

//     res.status(200).json(result);
//   } catch (error) {
//     console.error("Error fetching client uploaded documents:", error.message);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };


// const getsFirmDocs = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       return res.status(400).json({ error: "Missing folder ID in request params." });
//     }

//     // Find all files matching this folder ID under 'Firm Docs Shared With Client'
//     const dbFiles = await File.find({
//       filePath: { $regex: new RegExp(`FolderTemplates/${id}/Firm Docs Shared With Client`) }
//     });

//     // Map to desired format
//     const contents = dbFiles.map(file => ({
//       file: file.filename,
//       metadata: file
//     }));

//     const result = {
//       folder: "Firm Docs Shared With Client",
//       contents
//     };

//     res.status(200).json(result);
//   } catch (error) {
//     console.error("Error fetching firm docs:", error.message);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };
const getsFirmDocs = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing folder ID in request params." });
    }

    const dbFiles = await File.find({
      filePath: { $regex: new RegExp(`AccountId/${id}/Firm Docs Shared With Client`) }
    });

    const contents = [];
    const folderMap = new Map();

    dbFiles.forEach(file => {
      const relativePath = file.filePath.split(`AccountId/${id}/Firm Docs Shared With Client`)[1] || "";
      const cleanPath = relativePath.replace(/^\/+/, ""); // Remove leading slash
      const pathSegments = cleanPath.split("/");

      if (pathSegments.length === 1 && pathSegments[0] === "") {
        // Direct file inside "Firm Docs Shared With Client"
        if (file.filename !== "#$default.txt") {
          contents.push({
            file: file.filename,
            metadata: file
          });
        }
      } else {
        // It's in a subfolder like "100/"
        const folderName = pathSegments[0];
        if (file.filename === "#$default.txt") {
          folderMap.set(folderName, {
            folder: folderName,
            contents: [] // we won't show the file
          });
        }
      }
    });

    const folderList = Array.from(folderMap.values());

    const result = {
      folder: "Firm Docs Shared With Client",
      contents: [...folderList, ...contents] // folders first, then files
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching firm docs:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {getsFirmDocs,getsClientUploadedDocsUnsealed ,getsClientUploadedDocssealed,getsPrivateDocs,getsClientUploadedDocs,moveBetweenSealedUnsealed};
