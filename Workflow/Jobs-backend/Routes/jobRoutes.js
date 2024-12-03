const express = require("express");
const router = express.Router();
const { getActiveJobList, createJob, getJobs, getJob, deleteJob, updateJob, getJobList, getJobListbyid, updatestgeidtojob, getActiveJobListbyAccountId } = require("../Controller/jobController");
router.get("/job", getJobs);
router.get("/job/:id", getJob);
router.post("/newjob", createJob);
router.delete("/job/:id", deleteJob);
router.patch("/job/:id", updateJob);
router.get("/job/joblist/list", getJobList);
router.get("/job/joblist/list/:isActive", getActiveJobList);
router.get("/job/joblist/listbyid/:id", getJobListbyid);
router.post("/job/jobpipeline/updatestageid/:id", updatestgeidtojob);
router.get("/job/joblist/list/:isActive/:accountid", getActiveJobListbyAccountId);

module.exports = router;
// getActiveJobList
