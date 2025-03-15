const express = require("express");
const router = express.Router();
const { getAllTasks,createTask,getTaskList } = require("../controllers/accountTasksController");


router.get("/", getAllTasks)
router.post("/newtask", createTask);
router.get("/tasklist/:isActive",getTaskList)

module.exports = router;
// getActiveJobList
