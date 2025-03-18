const express = require("express");
const router = express.Router();
const { getAllTasks,createTask,getTaskList,getsTaskListById,deleteTask,updateTasks } = require("../controllers/accountTasksController");


router.get("/", getAllTasks)
router.post("/newtask", createTask);
router.get("/tasklist/:isActive",getTaskList)
router.get("/taskbyid/:id",getsTaskListById)
router.delete("/taskdelete/:id",deleteTask)
router.patch("/updatatasks/:id",updateTasks)
module.exports = router;
// getActiveJobList
