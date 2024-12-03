const express = require("express");
const router = express.Router();

const { createContact, getAllContacts, getSingleContact, deleteContact, updateContact, getContactsList, getContactsByAccountId } = require("../controller/contactController");

// get all contacts
router.get("/", getAllContacts);

// get single contact
router.get("/:id", getSingleContact);

// post new contact
router.post("/", createContact);

// delete contact
router.delete("/:id", deleteContact);

// update contact
router.patch("/:id", updateContact);

//get all contacts
router.get("/contactlist/list", getContactsList);

router.get("/contactaccount/:accountid", getContactsByAccountId);

module.exports = router;
