const express = require("express");
const router = express.Router();

const { createOrganizerAccountWise, getOrganizerAccountWise, getOrganizerAccountWises, deleteOrganizerAccountWise,updateOrganizerAccountWiseStatus, getOrganizerByAccountId, updateOrganizerAccountWise } = require("../controller/organizerAccountWiseController");

//******organizer Accountwise Start******** */

router.get("/organizeraccountwise", getOrganizerAccountWises);
router.get("/organizeraccountwise/:id", getOrganizerAccountWise);
router.post("/organizeraccountwise/org", createOrganizerAccountWise);
router.delete("/organizeraccountwise/:id", deleteOrganizerAccountWise);
// router.get("/organizeraccountwise/organizerbyaccount/:id", getOrganizerByAccountId);
router.get("/organizeraccountwise/organizerbyaccount/:id/:isactive", getOrganizerByAccountId);
router.patch("/organizeraccountwise/:id", updateOrganizerAccountWise);
router.patch("/organizeraccountwise/organizeraccountwisestatus/:id/:issubmited", updateOrganizerAccountWiseStatus);
//******organizer Accountwise ENd******** */

module.exports = router;
