const mongoose = require("mongoose");
const User = require("../models/userModel");
const Tags = require("../Models/tagsModel");
const Accounts = require("../Models/AccountModel");
const Task = require("../models/accountTasksModel");
const Pipeline = require("../models/pipelineTemplateModel");
const Job = require("../models/JobModel");
const Contacts = require('../models/contactsModel')





// Get the current date
const currentDate = new Date();
const lastDay = new Date(currentDate);
lastDay.setDate(lastDay.getDate() - 1); // Subtract 1 day to get the last day
const nextDay = new Date(currentDate);
nextDay.setDate(nextDay.getDate() + 1); // Add 1 day to get the next day

// Define options for formatting date
const options = {
    weekday: 'long',          // Full name of the day of the week (e.g., "Monday")
    day: '2-digit',          // Two-digit day of the month (01 through 31)
    month: 'long',           // Full name of the month (e.g., "January")
    year: 'numeric',         // Four-digit year (e.g., 2022)
    week: 'numeric',         // ISO week of the year (1 through 53)
    monthNumber: '2-digit',  // Two-digit month number (01 through 12)
    quarter: 'numeric',      // Quarter of the year (1 through 4)
};


// Format the last day using options
const lastDayFullDate = lastDay.toLocaleDateString('en-US', options);
const lastDayNumber = lastDay.getDate();
const lastDayName = lastDay.toLocaleDateString('en-US', { weekday: 'long' });
const lastWeek = lastDay.toLocaleDateString('en-US', { week: 'numeric' });
const lastMonthNumber = lastDay.getMonth() + 1; // Months are zero-based, so add 1
const lastMonthName = lastDay.toLocaleDateString('en-US', { month: 'long' });
const lastQuarter = Math.floor((lastDay.getMonth() + 3) / 3); // Calculate the quarter
const lastYear = lastDay.getFullYear();

// Format the next day using options
const nextDayFullDate = nextDay.toLocaleDateString('en-US', options);
const nextDayNumber = nextDay.getDate();
const nextDayName = nextDay.toLocaleDateString('en-US', { weekday: 'long' });
const nextWeek = nextDay.toLocaleDateString('en-US', { week: 'numeric' });
const nextMonthNumber = nextDay.getMonth() + 1; // Months are zero-based, so add 1
const nextMonthName = nextDay.toLocaleDateString('en-US', { month: 'long' });
const nextQuarter = Math.floor((nextDay.getMonth() + 3) / 3); // Calculate the quarter
const nextYear = nextDay.getFullYear();


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

    return res
      .status(201)
      .json({ message: "Task created successfully", newTask });
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
      .populate({ path: "tasktags", model: "Tags" })
      .populate({ path: "taskassignees", model: "User" })
      .sort({ createdAt: -1 });

    const taskList = [];

    for (const task of tasks) {
      const job = task.job;
      if (!job) continue;

      const pipeline = await Pipeline.findById(job.pipeline);
      if (!pipeline) continue;

;

      // Extract Pipeline details (Separate fields)
      const pipelineId = task.job.pipeline._id;
      const pipelineName = task.job.pipeline.pipelineName || "";

      const assigneeNames = task.taskassignees
        .flat()
        .map((assignee) => assignee.username);

      // Extract tags data
      const tagsData = task.tasktags.map((tag) => ({
        id: tag._id,
        tagName: tag.tagName,
        tagColour: tag.tagColour,
      }));

      // Extract Stage Names & IDs (Separate fields)
      let stageIds = [];
      let stageNames = [];
      if (task.job.stageid) {
        if (Array.isArray(task.job.stageid)) {
          task.job.stageid.forEach((stageId) => {
            const matchedStage = task.job.pipeline.stages.find((stage) =>
              stage._id.equals(stageId)
            );
            if (matchedStage) {
              stageIds.push(matchedStage._id);
              stageNames.push(matchedStage.name);
            }
          });
        } else {
          const matchedStage = task.job.pipeline.stages.find((stage) =>
            stage._id.equals(task.job.stageid)
          );
          if (matchedStage) {
            stageIds.push(matchedStage._id);
            stageNames.push(matchedStage.name);
          }
        }
      }
      // Get subtasks count
      const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
      const checkedSubtasks = task.subtasks
        ? task.subtasks.filter((subtask) => subtask.checked).length
        : 0;
      const subtaskCount = `${checkedSubtasks}/${totalSubtasks}`; // Format checked/total



       // Fetch account and associated contacts
    const account = await Accounts.findById(
      job.accounts
    ).populate("contacts");

// console.log(account)
const validContact = account.contacts.filter(contact => contact.login);
        // console.log(validContact)
                   // Define placeholder values
        const placeholderValues = {
            ACCOUNT_NAME: account?.accountName || '',
            FIRST_NAME: validContact[0]?.firstName || '',
            MIDDLE_NAME: validContact[0]?.middleName || '',
            LAST_NAME: validContact[0]?.lastName || '',
            CONTACT_NAME: validContact[0]?.contactName || '',
            COMPANY_NAME: validContact[0]?.companyName || '',
            COUNTRY: validContact[0]?.country || '',
            STREET_ADDRESS: validContact[0]?.streetAddress || '',
            STATEPROVINCE: validContact[0]?.state || '',
            PHONE_NUMBER: validContact[0]?.phoneNumbers || '',
            ZIPPOSTALCODE: validContact[0]?.postalCode || '',
            CITY: validContact[0]?.city || '',
            CURRENT_DAY_FULL_DATE: currentDate.toLocaleDateString(),
            CURRENT_DAY_NUMBER: currentDate.getDate(),
            CURRENT_DAY_NAME: currentDate.toLocaleString('default', { weekday: 'long' }),
            CURRENT_MONTH_NUMBER: currentDate.getMonth() + 1,
            CURRENT_MONTH_NAME: currentDate.toLocaleString('default', { month: 'long' }),
            CURRENT_YEAR: currentDate.getFullYear(),
            LAST_DAY_FULL_DATE: lastDayFullDate,
            LAST_DAY_NUMBER: lastDayNumber,
            LAST_DAY_NAME: lastDayName,
            LAST_WEEK: lastWeek,
            LAST_MONTH_NUMBER: lastMonthNumber,
            LAST_MONTH_NAME: lastMonthName,
            LAST_QUARTER: lastQuarter,
            LAST_YEAR: lastYear,
            NEXT_DAY_FULL_DATE: nextDayFullDate,
            NEXT_DAY_NUMBER: nextDayNumber,
            NEXT_DAY_NAME: nextDayName,
            NEXT_WEEK: nextWeek,
            NEXT_MONTH_NUMBER: nextMonthNumber,
            NEXT_MONTH_NAME: nextMonthName,
            NEXT_QUARTER: nextQuarter,
            NEXT_YEAR: nextYear,
            // Add other dynamic placeholders as required
        };
  
        // Function to replace placeholders in text
        const replacePlaceholders = (template, data) => {
            return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
                return data[placeholder.trim()] || '';
            });
        };


              // // Extract Job details (Separate fields)
      const jobId = task.job._id;
      const jobName = replacePlaceholders(task.job.jobname || '', placeholderValues);
      // task.job.jobname || ""
        // job.jobname = replacePlaceholders(job.jobname || '', placeholderValues);
      
      taskList.push({
        id: task._id,
        Name: task.taskname,
        JobID: jobId, // Job ID (Separate)
        JobName: jobName, // Job Name (Separate)
        PipelineId: pipelineId, // Pipeline ID (Separate)
        PipelineName: pipelineName, // Pipeline Name (Separate)
        StageIds: stageIds, // Array of Stage IDs
        StageNames: stageNames, // Array of Stage Names/ Includes array of Stage IDs and Names
        Assignees: assigneeNames,
        TaskTags: tagsData,
        AccountName: task.accounts.accountName,
        AccountId: task.accounts._id,
        StartDate: task.startdate,
        EndDate: task.enddate,
        Priority: task.priority,
        Description: task.description,
        Status: task.status,
        SubtaskCount: subtaskCount,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      });
    }

    res.status(200).json({ message: "Tasks retrieved successfully", taskList });
    console.log("tasks list",taskList)
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//Get a single ServiceTemplate
const getsTaskListById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Invalid Task ID" });
  }
  try {
      const accountTasks = await Task.findById(id);
      if (!accountTasks) {
          return res.status(404).json({ error: "No such Task" });
      }

      res.status(200).json({ message: "Task retrieved successfully", accountTasks });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

// delete task

const deleteTask = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid Job ID" });
  }

  try {
    const deletedTask = await Task.findByIdAndDelete({ _id: id });
    if (!deletedTask) {
      return res.status(404).json({ error: "No such Task" });
    }
    res.status(200).json({ message: "Task deleted successfully", deletedTask });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllTasks,
  createTask,
  getTaskList,
  getsTaskListById,
  deleteTask
};
