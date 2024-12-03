const express = require('express');
const { createClient, getClientsByAccount ,folderTemplate,getFoldersAndFilesByAccountId,} = require('../controller/clientController');
const {getClientsFoldersAndFiles} = require('../controller/showclientdocs')

const router = express.Router();

// Create a new client
router.post('/clients', createClient);

// Get all clients for a specific account
router.get('/clients/account/:accountId', getClientsByAccount);
router.post('/accountfoldertemp', folderTemplate);
router.get('/folders/:accountId', getFoldersAndFilesByAccountId);
router.get('/clinetsfolders/:_id', getClientsFoldersAndFiles);
// getClientsFoldersAndFiles

module.exports = router;
