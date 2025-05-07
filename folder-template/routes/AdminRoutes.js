const express = require("express");
const router = express.Router();
const {deleteItem,getsFirmDocs,moveBetweenSealedUnsealed, getsClientUploadedDocsUnsealed,getsClientUploadedDocssealed,getsPrivateDocs,getsClientUploadedDocs} = require("../controller/adminController");

router.get("/unsealed/:id", getsClientUploadedDocsUnsealed);
router.get("/sealedFolders/:id",getsClientUploadedDocssealed)
router.get("/privateDocs/:id",getsPrivateDocs)
router.get("/firmDocs/:id",getsFirmDocs)
router.get("/clientDocs/:id",getsClientUploadedDocs)
router.post('/moveBetweenSealedUnsealed', moveBetweenSealedUnsealed);
router.delete('/delete-item', deleteItem)
// MOVE from unsealed to sealed
// router.post("/client-docs/move-to-sealed/:id", moveClientUploadedDocsToSealed);

// router.get("/clientFolders/:id",getClientPublicFolders)
// router.get("/unsealeddocuments/:id",getUnsealedClientDocuments)
// router.get("/filtereddocs/:id",getFilteredClientFolders)

module.exports = router;
