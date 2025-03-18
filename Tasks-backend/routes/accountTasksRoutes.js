const express = require("express");
const router = express.Router();
const { getAllTasks,createTask,getTaskList,getsTaskById,deleteTask,updateTasks,
    getsTaskListById,getCompleteTaskList
 } = require("../controllers/accountTasksController");


router.get("/", getAllTasks)
router.post("/newtask", createTask);
router.get("/tasklist/:isActive",getTaskList)
router.get("/taskbyid/:id",getsTaskById)
router.delete("/taskdelete/:id",deleteTask)
router.patch("/updatatasks/:id",updateTasks)
router.get("/task/listbyid/:id",getsTaskListById)
router.get("/tasks/tasklist/completed",getCompleteTaskList)
module.exports = router;
// getActiveJobList
