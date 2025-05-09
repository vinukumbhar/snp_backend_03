const express = require("express");
const router = express.Router();
const {renameItem,deleteItem,getsFirmDocs,moveBetweenSealedUnsealed, getsClientUploadedDocsUnsealed,getsClientUploadedDocssealed,getsPrivateDocs,getsClientUploadedDocs} = require("../controller/adminController");

router.get("/unsealed/:id", getsClientUploadedDocsUnsealed);
router.get("/sealedFolders/:id",getsClientUploadedDocssealed)
router.get("/privateDocs/:id",getsPrivateDocs)
router.get("/firmDocs/:id",getsFirmDocs)
router.get("/clientDocs/:id",getsClientUploadedDocs)
router.post('/moveBetweenSealedUnsealed', moveBetweenSealedUnsealed);
router.delete('/delete-item', deleteItem)
router.patch('/rename-item', renameItem)


module.exports = router;
