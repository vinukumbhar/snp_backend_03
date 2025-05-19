const express = require('express')
const router = express.Router()

const { createProposalsAndElsAccounts,
    getProposalesAndElsAccountswise,
    getProposalesAndElsAccountwise,
    deleteProposalesAndElsAccountwise,
    updateProposalesandelsAccountwise,
    getProposalandElsListbyid,
    getProposalandElsListbyAccountid,
    getProposalandElsList,getProposalesAndElsAccountwisePrint,getPendingProposalesAndElsAccountswise } = require('../controller/proposalAccountwiseController')

//******organizer Accountwise Start******** */

router.get('/proposalaccountwise', getProposalesAndElsAccountswise)
router.get('/proposalaccountwise/:id', getProposalesAndElsAccountwise)
router.post('/proposalaccountwise', createProposalsAndElsAccounts)
router.delete('/proposalaccountwise/:id', deleteProposalesAndElsAccountwise)
router.get('/proposalaccountwise/proposalbyaccount/:id', getProposalandElsListbyAccountid)
router.patch('/proposalaccountwise/:id', updateProposalesandelsAccountwise)
router.get('/proposalaccountwise/proposallist/:id', getProposalandElsListbyid)
router.get('/proposalaccountwise/allproposallist/list', getProposalandElsList)
router.get('/proposalaccountwise/proposalaccountwiseforprint/:id', getProposalesAndElsAccountwisePrint)
router.get('/pending', getPendingProposalesAndElsAccountswise);
//******organizer Accountwise ENd******** */

module.exports = router