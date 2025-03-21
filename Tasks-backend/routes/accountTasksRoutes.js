const express = require("express");
const router = express.Router();
const { getAllTasks,createTask,getTaskList,getsTaskById,deleteTask,updateTasks,
    getsTaskListById,getCompleteTaskList,getTaskListByAccountId,getCompleteTaskListByAccount
 } = require("../controllers/accountTasksController");


router.get("/", getAllTasks)
router.post("/newtask", createTask);
router.get("/tasklist/:isActive",getTaskList)
router.get("/taskbyid/:id",getsTaskById)
router.delete("/taskdelete/:id",deleteTask)
router.patch("/updatatasks/:id",updateTasks)
router.get("/task/listbyid/:id",getsTaskListById)
router.get("/tasks/tasklist/completed",getCompleteTaskList)
router.get("/tasks/taskslist/byaccount/:accountId",getTaskListByAccountId)
router.get("/tasks/tasklist/byaccount/completed/:accountId",getCompleteTaskListByAccount)
module.exports = router;
// getActiveJobList
