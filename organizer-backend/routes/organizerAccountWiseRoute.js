const express = require("express");
const router = express.Router();

const { createOrganizerAccountWise, getOrganizerAccountWise, getOrganizerAccountWises, deleteOrganizerAccountWise, getOrganizerByAccountId, updateOrganizerAccountWise } = require("../controller/organizerAccountWiseController");

//******organizer Accountwise Start******** */

router.get("/organizeraccountwise", getOrganizerAccountWises);
router.get("/organizeraccountwise/:id", getOrganizerAccountWise);
router.post("/organizeraccountwise/org", createOrganizerAccountWise);
router.delete("/organizeraccountwise/:id", deleteOrganizerAccountWise);
router.get("/organizeraccountwise/organizerbyaccount/:id", getOrganizerByAccountId);
router.patch("/organizeraccountwise/:id", updateOrganizerAccountWise);

//******organizer Accountwise ENd******** */

module.exports = router;
