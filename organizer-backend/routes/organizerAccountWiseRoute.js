const express = require("express");
const router = express.Router();

const { getPendingOrganizersByAccountId,getActiveOrganizerByAccountId,createOrganizerAccountWise, getOrganizerAccountWise, getOrganizerAccountWises, deleteOrganizerAccountWise,updateOrganizerAccountWiseStatus, getOrganizerByAccountId, updateOrganizerAccountWise } = require("../controller/organizerAccountWiseController");

//******organizer Accountwise Start******** */

router.get("/organizeraccountwise", getOrganizerAccountWises);
router.get("/organizeraccountwise/:id", getOrganizerAccountWise);
router.post("/organizeraccountwise/org", createOrganizerAccountWise);
router.delete("/organizeraccountwise/:id", deleteOrganizerAccountWise);
router.get("/organizeraccountwise/organizerbyaccount/:id", getOrganizerByAccountId);
router.get("/organizeraccountwise/organizerbyaccount/:id/:isactive", getActiveOrganizerByAccountId);
router.patch("/organizeraccountwise/:id", updateOrganizerAccountWise);
router.patch("/organizeraccountwise/organizeraccountwisestatus/:id/:issubmited", updateOrganizerAccountWiseStatus);
router.get("/organizer/pending/:id", getPendingOrganizersByAccountId);

//******organizer Accountwise ENd******** */

module.exports = router;
