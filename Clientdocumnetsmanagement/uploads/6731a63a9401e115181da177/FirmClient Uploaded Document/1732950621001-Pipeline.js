import React, { useEffect, useState } from "react";
import "./pipeline.css";
import { useDrag, DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { RiDeleteBin5Line } from "react-icons/ri";
import axios from "axios";
import { useTheme } from "@mui/material/styles";
import EditJobCard from "./updateJobCard";
import useMediaQuery from "@mui/material/useMediaQuery";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import { Box, Button, CircularProgress, Drawer, TextField, Autocomplete, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
// import Select from 'react-select';
import { differenceInMinutes, differenceInHours, differenceInDays } from "date-fns";
import Priority from "../Templates/Priority/Priority";
import AddJobs from "./AddJobs";
const Pipeline = () => {
  const PIPELINE_API = process.env.REACT_APP_PIPELINE_TEMP_URL;
  const JOBS_API = process.env.REACT_APP_ADD_JOBS_URL;

  const [pipelineData, setPipelineData] = useState([]);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [selectedPipelineOption, setSelectedPipelineOption] = useState(null);
  const [stages, setStages] = useState([]);
  const [pipelineId, setPipelineId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const handleDrawerOpen = () => {
    setIsDrawerOpen(true);
  };
  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };
  const handleEditDrawerOpen = () => {
    setIsEditDrawerOpen(true);
  };
  const handleEditDrawerClose = () => {
    setIsEditDrawerOpen(false);
  };

  useEffect(() => {
    fetchPipelineData();
    fetchJobData();
  }, []);

  const fetchPipelineData = async () => {
    setLoading(true);
    try {
      const url = `${PIPELINE_API}/workflow/pipeline/pipelines`;
      const response = await fetch(url);
      const data = await response.json();
      setPipelineData(data.pipeline);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobData = async () => {
    try {
      const url = `${JOBS_API}/workflow/jobs/job/joblist/list`;
      const response = await fetch(url);
      const data = await response.json();
      console.log("Job Data:", data); // Log the response to inspect it
      setJobs(data.jobList);
    } catch (error) {
      console.error("Error fetching job data:", error);
    }
  };

  const fetchStages = async (pipelineId) => {
    try {
      const url = `${PIPELINE_API}/workflow/pipeline/pipeline/${pipelineId}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch stages");
      }
      const data = await response.json();
      return data.pipeline.stages;
    } catch (error) {
      console.error("Error fetching stages:", error);
      return [];
    }
  };

  // const handleSelectChange = (option) => {
  //   setSelectedPipelineOption(option);
  //   if (option) {
  //     const pipeline = pipelineData.find(p => p.pipelineName === option.label);
  //     if (pipeline) {
  //       handleBoardsList(pipeline);
  //     }
  //   } else {
  //     handleBackToPipelineList();
  //   }
  // };
  const handleSelectChange = (event, option) => {
    setSelectedPipelineOption(option);

    if (option) {
      const pipeline = pipelineData.find((p) => p.pipelineName === option.label);
      if (pipeline) {
        handleBoardsList(pipeline);
      }
    }
  };

  const handleBoardsList = async (pipeline) => {
    setSelectedPipeline(pipeline);
    setSelectedPipelineOption({ value: pipeline._id, label: pipeline.pipelineName });
    setPipelineId(pipeline._id);

    const fetchedStages = await fetchStages(pipeline._id);
    setStages(fetchedStages);
  };

  const handleBackToPipelineList = () => {
    setSelectedPipeline(null);
    setSelectedPipelineOption(null);
    setStages([]);
  };

  const updateJobStage = async (stage, item) => {
    let data = JSON.stringify({ stageid: stage._id });
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${JOBS_API}/workflow/jobs/job/jobpipeline/updatestageid/${item.id}`,
      headers: { "Content-Type": "application/json" },
      data: data,
    };
    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const JobCard = ({ job }) => {
    const [{ isDragging }, drag] = useDrag({
      type: "JOB_CARD",
      item: { id: job.id },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    });
    const [lastUpdatedTime, setLastUpdatedTime] = useState(new Date(job.createdAt));

    useEffect(() => {
      if (job.updatedAt) {
        setLastUpdatedTime(new Date(job.updatedAt));
      }
    }, [job.updatedAt]);

    useEffect(() => {
      const intervalId = setInterval(() => {
        setLastUpdatedTime((prevTime) => new Date(prevTime));
      }, 1000);

      return () => clearInterval(intervalId);
    }, []);

    const updateLastUpdatedTime = () => {
      setLastUpdatedTime(new Date());
      console.log(new Date());
    };

    const timeAgo = () => {
      const currentTime = new Date();
      const jobTime = lastUpdatedTime;

      const minutesDiff = differenceInMinutes(currentTime, jobTime);
      const hoursDiff = differenceInHours(currentTime, jobTime);
      const daysDiff = differenceInDays(currentTime, jobTime);

      if (minutesDiff < 1) {
        return "just now";
      } else if (minutesDiff < 60) {
        return `${minutesDiff} minute${minutesDiff === 1 ? "" : "s"} ago`;
      } else if (hoursDiff < 24) {
        return `${hoursDiff} hour${hoursDiff === 1 ? "" : "s"} ago`;
      } else {
        return `${daysDiff} day${daysDiff === 1 ? "" : "s"} ago`;
      }
    };

    const stripHtmlTags = (html) => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      return doc.body.textContent || "";
    };

    const truncateDescription = (description, maxLength = 30) => {
      if (description.length > maxLength) {
        return description.slice(0, maxLength) + "...";
      }
      return description;
    };

    const getPriorityStyle = (priority) => {
      switch (priority.toLowerCase()) {
        case "urgent":
          return { color: "white", backgroundColor: "#0E0402", fontSize: "12px", borderRadius: "50px", padding: "3px 7px" };
        case "high":
          return { color: "white", backgroundColor: "#fe676e", fontSize: "12px", borderRadius: "50px", padding: "3px 7px" }; // light red background
        case "medium":
          return { color: "white", backgroundColor: "#FFC300", fontSize: "12px", borderRadius: "50px", padding: "3px 7px" }; // light orange background
        case "low":
          return { color: "white", backgroundColor: "#56c288", fontSize: "12px", borderRadius: "50px", padding: "3px 7px" }; // light green background
        default:
          return {};
      }
    };

    const truncateName = (name) => {
      const maxLength = 12;
      if (name.length > maxLength) {
        return name.substring(0, maxLength) + "...";
      }
      return name;
    };

    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      const options = { month: "short", day: "2-digit", year: "numeric" };
      return date.toLocaleDateString("en-US", options);
    };

    const startDateFormatted = formatDate(job.StartDate);
    const dueDateFormatted = formatDate(job.DueDate);

    const [isHovered, setIsHovered] = useState(false);
    const handleDelete = (_id) => {
      const requestOptions = {
        method: "DELETE",
        redirect: "follow",
      };

      fetch(`${JOBS_API}/workflow/jobs/job/` + _id, requestOptions)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to delete item");
          }
          return response.json();
        })
        .then((result) => {
          // console.log(result);
          toast.success("Job deleted successfully");
          fetchJobData();
        })
        .catch((error) => {
          console.error(error);
          toast.error("Failed to delete item");
        });
    };
    const JOBS_API = process.env.REACT_APP_ADD_JOBS_URL;
    const [jobid, setjobid] = useState();
    const [JobsData, setJobsData] = useState([]);
    const [selectedStage, setSelectedStage] = useState();
    const stagesoptions = stages.map((stage) => ({ value: stage._id, label: stage.name }));
    const handleStageChange = (event, newValue) => {
      setSelectedStage(newValue);
    };
    const handleEditJobCard = async (jobid) => {
      handleEditDrawerOpen();
      setjobid(jobid);
      const response = await fetch(`${JOBS_API}/workflow/jobs/job/joblist/listbyid/` + jobid);

      if (!response.ok) {
        throw new Error("Failed to fetch job data");
      }
      const data = await response.json();
      setJobsData(data.jobList);
      console.log(data.jobList);
      setPriority(data.jobList.Priority);
      console.log(data.jobList.Priority);
    };
    // console.log(selectedStage);
    const [priority, setPriority] = useState("");
    const handlePriorityChange = (priority) => {
      setPriority(priority);
    };
    return (
      <Box className={`job-card ${isDragging ? "dragging" : ""}`} ref={drag} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onDrop={updateLastUpdatedTime}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "10px" }}>
          <Typography color={"black"}>{job.Account.join(", ")}</Typography>
          {isHovered ? <RiDeleteBin5Line onClick={() => handleDelete(job.id)} style={{ cursor: "pointer" }} /> : <span className="automation-batch">1</span>}
        </Box>

        <Typography sx={{ fontWeight: "bold", marginBottom: "8px", cursor: "pointer" }} color={"black"} onClick={() => handleEditJobCard(job.id)}>
          {truncateName(job.Name)}
        </Typography>
        <Typography color={"black"} variant="body2" sx={{ marginBottom: "8px" }}>
          {job.JobAssignee.join(", ")}
        </Typography>
        <Typography color={"black"} variant="body2" sx={{ marginBottom: "8px" }}>
          {truncateDescription(stripHtmlTags(job.Description))}
        </Typography>

        <span style={getPriorityStyle(job.Priority)}>{job.Priority}</span>

        <br />

        <Typography color={"black"} sx={{ marginBottom: "4px", mt: 2 }} variant="body2">
          Starts : {startDateFormatted}
        </Typography>
        <Typography color={"black"} variant="body2">
          Due : {dueDateFormatted}
        </Typography>
        <Typography color={"black"} variant="body2" sx={{ marginBottom: "5px", mt: 2 }}>
          {timeAgo()}
        </Typography>

        <Drawer
          anchor="right"
          open={isEditDrawerOpen}
          onClose={handleEditDrawerClose}
          PaperProps={{
            id: "tag-drawer",
            sx: {
              borderRadius: isSmallScreen ? "0" : "10px 0 0 10px",
              width: isSmallScreen ? "100%" : 600,
              maxWidth: "100%",
              [theme.breakpoints.down("sm")]: {
                width: "100%",
              },
            },
          }}
        >
          <Box sx={{ borderRadius: isSmallScreen ? "0" : "15px" }} role="presentation">
            <Box>
              <Box style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px", background: "#EEEEEE" }}>
                <Typography variant="h6">Edit job card</Typography>
                <IoClose onClick={handleEditDrawerClose} style={{ cursor: "pointer" }} />
              </Box>
              <Box sx={{ pr: 2, pl: 2, pt: 2 }}>
                <Typography>{job.Name}</Typography>
                <Box>
                  <label className="job-input-label">Stage</label>
                  <Autocomplete size="small" options={stagesoptions} getOptionLabel={(option) => option.label} value={selectedStage} onChange={handleStageChange} renderInput={(params) => <TextField {...params} placeholder="Stages" variant="outlined" className="add-jobs-select-dropdown" />} sx={{ width: "100%", marginTop: "8px" }} />
                </Box>
                <Box mt={2}>
                  <Priority onPriorityChange={handlePriorityChange} selectedPriority={priority} />
                </Box>
              </Box>
            </Box>
          </Box>
        </Drawer>
      </Box>
    );
  };

  const Stage = ({ stage, selectedPipeline, handleDrop }) => {
    const [{ isOver }, drop] = useDrop({
      accept: "JOB_CARD",
      drop: (item, monitor) => {
        handleDrop(item.id, stage.name);
        console.log(item.id);
        console.log(stage.name);
        console.log(stage._id);
        updateJobStage(stage, item);
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    });

    const stageJobs = jobs.filter((job) => job.Pipeline === selectedPipeline.pipelineName && job.Stage.includes(stage.name));
    const [displayCount, setDisplayCount] = useState(3);
    const displayedJobs = stageJobs.slice(0, displayCount);
    const truncatedStageName = stage.name.length > 20 ? `${stage.name.slice(0, 20)}...` : stage.name;
    return (
      <Box ref={drop} className={`stage ${isOver ? "drag-over" : ""}`}>
        <Typography sx={{ marginBottom: "12px" }} className="stage-name">
          {/* {stage.name} */}
          {truncatedStageName}
        </Typography>
        <Typography variant="body2" sx={{ marginBottom: "12px" }}>
          {stageJobs.length > 0 && <span>({stageJobs.length})</span>}
        </Typography>
        {displayedJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
        {stageJobs.length > displayCount && (
          <Button variant="outlined" onClick={() => setDisplayCount(displayCount + 5)} sx={{ marginTop: "16px", alignSelf: "center" }}>
            Load More
          </Button>
        )}
      </Box>
    );
  };

  const optionpipeline = pipelineData.map((pipeline) => ({
    value: pipeline._id,
    label: pipeline.pipelineName,
  }));
  const handleDrop = (jobId, stageName) => {
    const updatedJobs = jobs.map((job) => {
      if (job.id === jobId) {
        return { ...job, Stage: [stageName] };
      }
      return job;
    });
    setJobs(updatedJobs);

    setTimeout(() => {
      fetchJobData();
    }, 1000);
  };
  return (
    <DndProvider backend={HTML5Backend}>
      <Box p={3}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
            <CircularProgress />
          </Box>
        ) : selectedPipeline ? (
          <>
            <Box mb={2}>
              <Autocomplete
                value={selectedPipelineOption}
                onChange={handleSelectChange}
                options={optionpipeline}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.value === value?.value}
                renderOption={(props, option) => (
                  <Box
                    component="li"
                    {...props}
                    sx={{ cursor: "pointer", margin: "5px 10px" }} // Add cursor pointer style
                  >
                    {option.label}
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    // label="Search pipelines..."
                    placeholder="Search pipelines..."
                    sx={{ backgroundColor: "#fff" }}
                  />
                )}
                // isClearable
                className="pipeline-select"
              />
              <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
                <Button variant="outlined" color="primary" onClick={handleBackToPipelineList} sx={{ mt: 2 }}>
                  Back to Pipeline List
                </Button>
                <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleDrawerOpen}>
                  Add Jobs
                </Button>
              </Box>
            </Box>
            <Box>
              <Box className="stage-container" display="flex" gap={2}>
                {stages.map((stage, index) => (
                  <Stage key={index} stage={stage} selectedPipeline={selectedPipeline} handleDrop={handleDrop} />
                ))}
              </Box>
            </Box>
            <Drawer
              anchor="right"
              open={isDrawerOpen}
              onClose={handleDrawerClose}
              PaperProps={{
                id: "tag-drawer",
                sx: {
                  borderRadius: isSmallScreen ? "0" : "10px 0 0 10px",
                  width: isSmallScreen ? "100%" : 600,
                  maxWidth: "100%",
                  [theme.breakpoints.down("sm")]: {
                    width: "100%",
                  },
                },
              }}
            >
              <Box sx={{ borderRadius: isSmallScreen ? "0" : "15px" }} role="presentation">
                <Box>
                  <Box style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px", background: "#EEEEEE" }}>
                    <Typography variant="h6">Add Job to {selectedPipeline ? selectedPipeline.pipelineName : ""}</Typography>
                    <IoClose onClick={handleDrawerClose} style={{ cursor: "pointer" }} />
                  </Box>
                  <Box>
                    <AddJobs stages={stages} pipelineId={pipelineId} handleDrawerClose={handleDrawerClose} fetchJobData={fetchJobData} />
                  </Box>
                </Box>
              </Box>
            </Drawer>
          </>
        ) : (
          <>
            <Typography variant="h4" gutterBottom>
              Pipeline List
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>PIPELINE NAME</TableCell>
                    <TableCell>JOBS</TableCell>
                    <TableCell>SCHEDULE</TableCell>
                    <TableCell>START DATE</TableCell>
                    <TableCell>END DATE</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pipelineData.map((pipeline, index) => (
                    <TableRow key={index} hover>
                      <TableCell onClick={() => handleBoardsList(pipeline)} sx={{ color: "primary.main", cursor: "pointer", fontWeight: "bold" }}>
                        {pipeline.pipelineName}
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>
    </DndProvider>
  );
};

export default Pipeline;
