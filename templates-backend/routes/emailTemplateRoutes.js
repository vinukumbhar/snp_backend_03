const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadfile'); // Adjust the path as necessary
const { getEmailTemplates,createEmailTemplate,getEmailTemplate,deleteEmailTemplate, updateEmailTemplate,getEmailTemplateList } = require('../controller/emailTemplateController')

router.get('/emailtemplate', getEmailTemplates)
router.get('/emailtemplate/:id', getEmailTemplate)
router.get('/emailtemplate/emailtemplateList/:id', getEmailTemplateList)
// router.post('/emailtemplate', createEmailTemplate)
// router.delete('/emailtemplate/:id', deleteEmailTemplate)
// router.patch('/emailtemplate/:id', updateEmailTemplate)
router.post('/emailtemplate', upload.array('files'), createEmailTemplate);
router.delete('/emailtemplate/:id', deleteEmailTemplate)
router.patch('/emailtemplate/:id', upload.array('files', 10), updateEmailTemplate)

module.exports = router;