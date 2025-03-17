const express = require("express");
const router = express.Router();
const { getAllTasks,createTask,getTaskList,getsTaskListById,deleteTask } = require("../controllers/accountTasksController");


router.get("/", getAllTasks)
router.post("/newtask", createTask);
router.get("/tasklist/:isActive",getTaskList)
router.get("/taskbyid/:id",getsTaskListById)
router.delete("/taskdelete/:id",deleteTask)

module.exports = router;
// getActiveJobList
