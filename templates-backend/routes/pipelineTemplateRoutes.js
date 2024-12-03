const express = require('express')
const router = express.Router()
const { getPipelines, getPipeline, createPipeline, updatePipeline, deletePipeline, getPipelineTemplateList} = require('../controller/pipelineTemplateController')
router.get('/pipelines', getPipelines)
router.get('/pipeline/:id', getPipeline)
router.post('/createpipeline', createPipeline)
router.delete('/pipeline/:id', deletePipeline)
router.patch('/pipeline/:id', updatePipeline)
router.get('/pipeline/pipelinelist/:id', getPipelineTemplateList)


module.exports = router