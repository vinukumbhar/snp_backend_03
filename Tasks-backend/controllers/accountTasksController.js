const mongoose = require("mongoose");
const User = require("../models/userModel");
const Tags = require("../Models/tagsModel");
const Accounts = require("../Models/AccountModel");
const Task = require("../models/accountTasksModel");
const Pipeline = require("../models/pipelineTemplateModel");
const Job = require("../models/JobModel")



//get all JobTemplate
const getAllTasks = async (req, res) => {
  try {
    const task = await Task.find({}).sort({ createdAt: -1 });
    res.status(200).json({ message: "Task retrieved successfully", task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//POST a new task 
const createTask = async (req, res) => {
  const {
    accounts,
    job,
    templatename,
    taskname,
    status,
    taskassignees,
    priority,
    description,
    tasktags,
    issubtaskschecked,
    startdate,
    enddate,
    subtasks,
    active,
  } = req.body;

  try {
    
      const newTask = await Task.create({
        accounts,
        job,
        templatename,
        taskname,
        status,
        taskassignees,
        priority,
        description,
        tasktags,
        issubtaskschecked,
        startdate,
        enddate,
        subtasks,
        active,
        
      });
   
    return res.status(201).json({ message: "Task created successfully",newTask });
  } catch (error) {
    console.error("Error creating Job:", error);
    return res.status(500).json({ error: "Error creating Job" });
  }
};

// gets tasks list
const getTaskList = async (req, res) => {
    try {
      const { isActive } = req.params;
      
      const tasks = await Task.find({ active: isActive })
        .populate({ path: "accounts", model: "Accounts" })
        .populate({
          path: "job",
          model: "Job",
          populate: {
            path: "pipeline",
            model: "pipeline",
            populate: { path: "stages", model: "Stage" },
          },
        })
        .populate({ path: "taskassignees", model: "User" })
        .sort({ createdAt: -1 });
  
      const taskList = [];
  
      for (const task of tasks) {
        const job = task.job;
        if (!job) continue;
  
        const pipeline = await Pipeline.findById(job.pipeline);
        if (!pipeline) continue;
  
        const assigneeNames = task.taskassignees.map((assignee) => assignee.username);
        let stageNames = null;
        if (Array.isArray(job.stageid)) {
          stageNames = job.stageid
            .map((stageId) =>
              pipeline.stages.find((stage) => stage._id.equals(stageId))
            )
            .filter(Boolean)
            .map((stage) => stage.name);
        } else {
          const matchedStage = pipeline.stages.find((stage) =>
            stage._id.equals(job.stageid)
          );
          stageNames = matchedStage ? [matchedStage.name] : null;
        }
  
        taskList.push({
          id: task._id,
          Name: task.taskname,
          Job:task.job,
          Assignees: assigneeNames,
        //   Pipeline: pipeline ? pipeline.pipelineName : null,
          Stage: stageNames,
          Account: task.accounts,
          StartDate: task.startdate,
          EndDate: task.enddate,
          Priority: task.priority,
          Description: task.description,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        });
      }
  
      res.status(200).json({ message: "Tasks retrieved successfully", taskList });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };


module.exports = {
    getAllTasks,
   createTask,
   getTaskList
  };