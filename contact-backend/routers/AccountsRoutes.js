const express = require("express");
const router = express.Router();
const {checkTemplateNameExists,getAccountsByUserId,getAllAccounts,updateAccountTags,getAccountsByTeamMember,getAccountsUserId,getAccountsIdAndName, updateContactsForMultipleAccounts, getActiveAccountList, getAccountListByUserId,createAccount, getAccount, getAccounts, updateAccount, deleteAccount, getAccountsList, getAccountsListById, getAccountsbyContactId, updateContactsForAccounts, removeContactFromAccount, getAccountbyIdAll } = require("../controller/AccountController"); // Adjust the path to your actual controller

router.get("/accountdetails", getAccounts);
router.get("/nameandid/accountdetails", getAccountsIdAndName);
router.get("/accountsdata",getAllAccounts)
router.get("/accountsuserid/:id",getAccountsUserId)
router.get("/accountdetails/:id", getAccount);
router.get('/accountdetails/user/:userid', getAccountsByUserId);

router.post("/accountdetails", createAccount);

router.delete("/accountdetails/:id", deleteAccount);

router.patch("/accountdetails/:id", updateAccount);
// updateAccountTags
router.patch("/accountdetails/updateaccounttags/:id", updateAccountTags);
router.get("/account/accountdetailslist/", getAccountsList);

router.get("/accountdetails/accountdetailslist/listbyid/:id", getAccountsListById);
router.get('/accountdetails/accountdetailslist/listbyuserid/:id',getAccountListByUserId);
router.get("/accountdetails/accountbycontactid/:contactId", getAccountsbyContactId);

router.patch("/accountdetails/updatecontacts/byaccountIds", updateContactsForAccounts);

router.delete("/accountdetails/removecontactfromaccount/:accountId/:contactId", removeContactFromAccount);

router.get("/accountdetails/getAccountbyIdAll/:id", getAccountbyIdAll);
router.get("/account/accountdetailslist/:isActive", getActiveAccountList);
// getAccountsByTeamMember
router.get("/getaccounts/:userid/:isActive", getAccountsByTeamMember);
router.post("/accounts/update-contacts", updateContactsForMultipleAccounts);

router.get('/check-name', checkTemplateNameExists);

module.exports = router;
