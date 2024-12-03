const Job = require("../Models/JobModel");
const Pipeline = require("../Models/pipelineTemplateModel");
const mongoose = require("mongoose");
const Accounts = require("../Models/AccountModel");
const User = require("../Models/userModel");
const Tags = require("../Models/tagsModel");
const ClientFacingjobStatus = require("../Models/clientfacingjobstatusesModel.js");
//get all JobTemplate
const getJobs = async (req, res) => {
  try {
    const job = await Job.find({}).sort({ createdAt: -1 });
    res.status(200).json({ message: "Job retrieved successfully", job });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Get a single JobTemplate
const getJob = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid Job ID" });
  }

  try {
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ error: "No such Job" });
    }

    res.status(200).json({ message: "Job retrieved successfully", job });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error.message);
  }
};

//POST a new JobTemplate
const createJob = async (req, res) => {
  const { accounts, pipeline, stageid, templatename, jobname, addShortCode, jobassignees, priority, description, absolutedates, startsin, startsinduration, duein, dueinduration, startdate, enddate, comments, showinclientportal, jobnameforclient, clientfacingstatus, clientfacingDescription, active } = req.body;

  try {
    // Check if a task template with similar properties already exists

    // const existingJob = await Job.findOne({
    //     jobname
    // });

    // if (existingJob) {
    //     return res.status(400).json({ error: "Job already exists" });
    // }

    // Find the pipeline associated with the job
    const jobPipeline = await Pipeline.findById(pipeline);

    // Get the ID of the first stage in the pipeline
    const defaultStageId = jobPipeline.stages.length > 0 ? jobPipeline.stages[0]._id : null;

    // Use the provided stageid or defaultStageId if not provided
    const selectedStageId = stageid || defaultStageId;

    for (const accountid of accounts) {
      const newJob = await Job.create({
        accounts: accountid,
        pipeline,
        stageid: selectedStageId,
        templatename,
        jobname,
        addShortCode,
        jobassignees,
        priority,
        description,
        absolutedates,
        startsin,
        startsinduration,
        duein,
        dueinduration,
        startdate,
        enddate,
        comments,
        showinclientportal,
        jobnameforclient,
        clientfacingstatus,
        clientfacingDescription,
        active,
      });
    }
    return res.status(201).json({ message: "Job created successfully" });
  } catch (error) {
    console.error("Error creating Job:", error);
    return res.status(500).json({ error: "Error creating Job" });
  }
};

//delete a JobTemplate

const deleteJob = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid Job ID" });
  }

  try {
    const deletedJob = await Job.findByIdAndDelete({ _id: id });
    if (!deletedJob) {
      return res.status(404).json({ error: "No such Job" });
    }
    res.status(200).json({ message: "Job deleted successfully", deletedJob });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//update a new tasktemplate
const updateJob = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid Job ID" });
  }

  try {
    const updatedJob = await Job.findOneAndUpdate({ _id: id }, { ...req.body }, { new: true });

    if (!updatedJob) {
      return res.status(404).json({ error: "No such Job" });
    }

    res.status(200).json({ message: "Job Updated successfully", updatedJob });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getJobList = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate({ path: "accounts", model: "Accounts" })
      .populate({ path: "pipeline", model: "pipeline", populate: { path: "stages", model: "stage" } })
      .populate({ path: "jobassignees", model: "User" })
      .populate({ path: "clientfacingstatus", model: "ClientFacingjobStatus" });

    const jobList = [];

    for (const job of jobs) {
      // Fetching the pipeline document for each job
      const pipeline = await Pipeline.findById(job.pipeline);

      if (!pipeline) {
        // If pipeline is not found, skip this job
        continue;
      }

      const jobAssigneeNames = job.jobassignees.map((assignee) => assignee.username);

      const accountsname = job.accounts.map((account) => account.accountName);
      const accountId = job.accounts.map((account) => account._id);

      let stageNames = null;

      if (Array.isArray(job.stageid)) {
        // Iterate over each stage ID and find the corresponding stage name
        stageNames = [];
        for (const stageId of job.stageid) {
          const matchedStage = pipeline.stages.find((stage) => stage._id.equals(stageId));
          if (matchedStage) {
            stageNames.push(matchedStage.name);
          }
        }
      } else {
        // If job.stageid is not an array, convert it to an array containing a single element
        const matchedStage = pipeline.stages.find((stage) => stage._id.equals(job.stageid));
        if (matchedStage) {
          stageNames = [matchedStage.name];
        }
      }
      const clientFacingStatus = job.clientfacingstatus
        ? {
          statusId: job.clientfacingstatus._id,
          statusName: job.clientfacingstatus.clientfacingName,
          statusColor: job.clientfacingstatus.clientfacingColour,
          // description: job.clientfacingstatus.description,
          // Include other fields from clientfacingstatus as needed
        }
        : null;
      jobList.push({
        id: job._id,
        Name: job.jobname,
        JobAssignee: jobAssigneeNames,
        Pipeline: pipeline ? pipeline.pipelineName : null,
        Stage: stageNames,
        Account: accountsname,
        AccountId: accountId,
        ClientFacingStatus: clientFacingStatus,
        StartDate: job.startdate,
        DueDate: job.enddate,
        Priority: job.priority,
        Description: job.description,
        StartsIn: job.startsin ? `${job.startsin} ${job.startsinduration}` : null,
        DueIn: jobs.duein ? `${jobs.duein} ${jobs.dueinduration}` : null,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      });
    }

    res.status(200).json({ message: "JobTemplate retrieved successfully", jobList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getActiveJobList = async (req, res) => {
  try {
    const { isActive } = req.params;
    const jobs = await Job.find({ active: isActive })
      .populate({ path: "accounts", model: "Accounts" })
      .populate({ path: "pipeline", model: "pipeline", populate: { path: "stages", model: "stage" } })
      .populate({ path: "jobassignees", model: "User" })
      .populate({ path: "clientfacingstatus", model: "ClientFacingjobStatus" });
    const jobList = [];

    for (const job of jobs) {
      // Fetching the pipeline document for each job
      const pipeline = await Pipeline.findById(job.pipeline);

      if (!pipeline) {
        // If pipeline is not found, skip this job
        continue;
      }

      const jobAssigneeNames = job.jobassignees.map((assignee) => assignee.username);

      const accountsname = job.accounts.map((account) => account.accountName);
      const accountId = job.accounts.map((account) => account._id);

      let stageNames = null;

      if (Array.isArray(job.stageid)) {
        // Iterate over each stage ID and find the corresponding stage name
        stageNames = [];
        for (const stageId of job.stageid) {
          const matchedStage = pipeline.stages.find((stage) => stage._id.equals(stageId));
          if (matchedStage) {
            stageNames.push(matchedStage.name);
          }
        }
      } else {
        // If job.stageid is not an array, convert it to an array containing a single element
        const matchedStage = pipeline.stages.find((stage) => stage._id.equals(job.stageid));
        if (matchedStage) {
          stageNames = [matchedStage.name];
        }
      }
      const clientFacingStatus = job.clientfacingstatus
        ? {
          statusId: job.clientfacingstatus._id,
          statusName: job.clientfacingstatus.clientfacingName,
          statusColor: job.clientfacingstatus.clientfacingColour,
          // description: job.clientfacingstatus.description,
          // Include other fields from clientfacingstatus as needed
        }
        : null;
      jobList.push({
        id: job._id,
        Name: job.jobname,
        JobAssignee: jobAssigneeNames,
        Pipeline: pipeline ? pipeline.pipelineName : null,
        Stage: stageNames,
        Account: accountsname,
        AccountId: accountId,
        ClientFacingStatus: clientFacingStatus,
        StartDate: job.startdate,
        DueDate: job.enddate,
        Priority: job.priority,
        Description: job.description,
        StartsIn: job.startsin ? `${job.startsin} ${job.startsinduration}` : null,
        DueIn: jobs.duein ? `${jobs.duein} ${jobs.dueinduration}` : null,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      });
    }

    res.status(200).json({ message: "JobTemplate retrieved successfully", jobList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getActiveJobListbyAccountId = async (req, res) => {
  try {
    const { isActive, accountid } = req.params;

    // Fetch jobs filtered by isActive and accountid
    const jobs = await Job.find({ active: isActive, accounts: accountid })
      .populate({ path: "accounts", model: "Accounts" })
      .populate({
        path: "pipeline",
        model: "pipeline",
        populate: { path: "stages", model: "Stage" },
      })
      .populate({ path: "jobassignees", model: "User" })
      .populate({ path: "clientfacingstatus", model: "ClientFacingjobStatus" });

    // Transform job data into the desired structure
    const jobList = jobs.map((job) => {
      // Extract pipeline and stages
      const pipeline = job.pipeline;
      const stageNames = Array.isArray(job.stageid)
        ? job.stageid.map((stageId) => {
          const matchedStage = pipeline?.stages?.find((stage) =>
            stage._id.equals(stageId)
          );
          return matchedStage ? matchedStage.name : null;
        }).filter(Boolean)
        : job.stageid
          ? [pipeline?.stages?.find((stage) => stage._id.equals(job.stageid))?.name || null]
          : null;

      // Extract job assignee names and account names
      const jobAssigneeNames = job.jobassignees.map((assignee) => assignee.username);
      const accountsname = job.accounts.map((account) => account.accountName);
      const accountId = job.accounts.map((account) => account._id);

      // Extract client-facing status
      const clientFacingStatus = job.clientfacingstatus
        ? {
          statusId: job.clientfacingstatus._id,
          statusName: job.clientfacingstatus.clientfacingName,
          statusColor: job.clientfacingstatus.clientfacingColour,
        }
        : null;

      // Construct the job object
      return {
        id: job._id,
        Name: job.jobname,
        JobAssignee: jobAssigneeNames,
        Pipeline: pipeline?.pipelineName || null,
        PipelineId: pipeline?._id,
        Stage: stageNames,
        Account: accountsname,
        AccountId: accountId,
        ClientFacingStatus: clientFacingStatus,
        StartDate: job.startdate,
        DueDate: job.enddate,
        Priority: job.priority,
        Description: job.description,
        StartsIn: job.startsin ? `${job.startsin} ${job.startsinduration}` : null,
        DueIn: job.duein ? `${job.duein} ${job.dueinduration}` : null,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      };
    });

    res.status(200).json({ message: "JobTemplate retrieved successfully", jobList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getJobListbyid = async (req, res) => {
  const { id } = req.params;
  try {
    const jobs = await Job.findById(id)
      .populate({
        path: "accounts",
        model: "Accounts",
        populate: {
          path: "tags",
          model: "Tags",
        },
      })
      .populate({ path: "pipeline", model: "pipeline", populate: { path: "stages", model: "stage" } })
      .populate({ path: "jobassignees", model: "User" })
      .populate({ path: "clientfacingstatus", model: "ClientFacingjobStatus" });
    const pipeline = await Pipeline.findById(jobs.pipeline);

    let stageNames = null;

    if (Array.isArray(jobs.stageid)) {
      stageNames = [];
      for (const stageId of jobs.stageid) {
        const matchedStage = pipeline.stages.find((stage) => stage._id.equals(stageId));
        if (matchedStage) {
          stageNames.push({ name: matchedStage.name, _id: matchedStage._id });
        }
      }
    } else {
      const matchedStage = pipeline.stages.find((stage) => stage._id.equals(jobs.stageid));
      if (matchedStage) {
        stageNames = [{ name: matchedStage.name, _id: matchedStage._id }];
      }
    }

    const jobList = {
      id: jobs._id,
      Name: jobs.jobname,
      JobAssignee: jobs.jobassignees,
      Pipeline: {
        _id: pipeline._id,
        Name: pipeline.pipelineName,
      },
      Stage: stageNames,
      Account: jobs.accounts,
      StartDate: jobs.startdate,
      DueDate: jobs.enddate,
      StartsIn: jobs.startsin ? `${jobs.startsin} ${jobs.startsinduration}` : null,
      DueIn: jobs.duein ? `${jobs.duein} ${jobs.dueinduration}` : null,
      Priority: jobs.priority,
      ClientFacingStatus: jobs.clientfacingstatus,
      ClientFacingDecription: jobs.clientfacingDescription,
      jobClientName: jobs.jobnameforclient,
      ShowinClientPortal: jobs.showinclientportal,
      Description: jobs.description,
      createdAt: jobs.createdAt,
      updatedAt: jobs.updatedAt,
    };

    res.status(200).json({ message: "Job retrieved successfully", jobList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatestgeidtojob = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid Job ID" });
  }

  try {
    const updatedJob = await Job.findOneAndUpdate({ _id: id }, { ...req.body }, { new: true });

    if (!updatedJob) {
      return res.status(404).json({ error: "No such Job" });
    }

    res.status(200).json({ message: "Stage Id Updated successfully", updatedJob });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createJob,
  getJobs,
  getJob,
  deleteJob,
  updateJob,
  getJobList,
  getJobListbyid,
  updatestgeidtojob,
  getActiveJobList,
  getActiveJobListbyAccountId
};
