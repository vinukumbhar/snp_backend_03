const express = require("express");
const router = express.Router();
const { updateContactsForMultipleAccounts, getActiveAccountList, createAccount, getAccount, getAccounts, updateAccount, deleteAccount, getAccountsList, getAccountsListById, getAccountsbyContactId, updateContactsForAccounts, removeContactFromAccount, getAccountbyIdAll } = require("../controller/AccountController"); // Adjust the path to your actual controller

router.get("/accountdetails", getAccounts);

router.get("/accountdetails/:id", getAccount);

router.post("/accountdetails", createAccount);

router.delete("/accountdetails/:id", deleteAccount);

router.patch("/accountdetails/:id", updateAccount);

router.get("/account/accountdetailslist/", getAccountsList);

router.get("/accountdetails/accountdetailslist/listbyid/:id", getAccountsListById);

router.get("/accountdetails/accountbycontactid/:contactId", getAccountsbyContactId);

router.patch("/accountdetails/updatecontacts/byaccountIds", updateContactsForAccounts);

router.delete("/accountdetails/removecontactfromaccount/:accountId/:contactId", removeContactFromAccount);

router.get("/accountdetails/getAccountbyIdAll/:id", getAccountbyIdAll);
router.get("/account/accountdetailslist/:isActive", getActiveAccountList);
router.post("/accounts/update-contacts", updateContactsForMultipleAccounts);

module.exports = router;
