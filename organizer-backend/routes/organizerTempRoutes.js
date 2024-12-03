const express = require('express')
const router = express.Router()
const { getOrganizerTemplate, getOrganizerTemplates, createOrganizerTemplate, deleteOrganizerTemplate, updateOrganizerTemplate } = require('../controller/organizerTempController')

router.get('/organizertemplate', getOrganizerTemplates)
router.get('/organizertemplate/:id', getOrganizerTemplate)
router.post('/organizertemplate', createOrganizerTemplate)
router.delete('/organizertemplate/:id', deleteOrganizerTemplate)
router.patch('/organizertemplate/:id', updateOrganizerTemplate)






module.exports = router