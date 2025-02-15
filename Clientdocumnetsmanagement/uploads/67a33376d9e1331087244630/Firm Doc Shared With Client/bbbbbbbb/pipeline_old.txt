import React, { useState, useEffect } from 'react';
import Select from "react-select";
import Switch from "react-switch";
import { LuPlusCircle } from "react-icons/lu";
import { RiDeleteBin6Line } from "react-icons/ri";
import { SlQuestion } from "react-icons/sl";
import DatePicker from 'react-datepicker'; // Import date picker
import 'react-datepicker/dist/react-datepicker.css'; // Import date picker stylesheet
import { RxDragHandleDots2 } from "react-icons/rx";
import './createpipeline.css';
import makeAnimated from 'react-select/animated';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight } from "react-icons/md";
import ReactPaginate from 'react-paginate';
import { RxCross2 } from "react-icons/rx";
import { IoMdFolderOpen } from "react-icons/io";
import './automation.css';
import SendEmail from '../Automations/SendEmail';
import ApplyFolder from '../Automations/ApplyFolder';
import UpdateAccountTags from '../Automations/UpdateAccountTags';

const CreatePipeline = () => {

    const API_KEY = process.env.REACT_APP_API_IP;
    const [singleSwitch, setSingleSwitch] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [dueDate, setDueDate] = useState(null);
    const [autoMoveJob, setAutoMovejob] = useState(false)
    const [stages, setStages] = useState([]);
    const navigate = useNavigate();

    const handleStartDateChange = (date) => {
        setStartDate(date);
    };

    const handleDueDateChange = (date) => {
        setDueDate(date);
    };
    const handleSingleSwitchChange = (checked) => {
        setSingleSwitch(checked);
    };
    const handleAutoMoveChange = (checked) => {
        setAutoMovejob(checked)
    }
    const [Account_id, setAccount_id] = useState(false);
    const [Priority, setPriority] = useState(false);
    const [Days_on_stage, setDays_on_stage] = useState(false);
    const [Account_tags, setAccount_tags] = useState(false);

    const [Name, setName] = useState(false);
    const [Due_date, setDue_date] = useState(false);
    const [Description, setDescription] = useState(false);
    const [Assignees, setAssignees] = useState(false);


    const handleAccount_idChange = (checked) => {
        setAccount_id(checked);
    };

    const handlePriorityChange = (checked) => {
        setPriority(checked);
    };
    const handleDays_on_stageChange = (checked) => {
        setDays_on_stage(checked);
    };

    const handleAccount_tagsChange = (checked) => {
        setAccount_tags(checked);
    };
    const handleNameSwitchChange = (checked) => {
        setName(checked);
    };
    const handleDue_dateChange = (checked) => {
        setDue_date(checked);
    };
    const handleDescriptionChange = (checked) => {
        setDescription(checked);
    };
    const handleAssigneesChange = (checked) => {
        setAssignees(checked);
    };

    const handleAddStage = () => {
        // Duplicate the last stage and add it to the stages array
        // const lastStage = stages[stages.length - 1];
        // const newStage = { ...lastStage };
        const newStage = { name: '', conditions: [], automations: [], autoMove: false };
        setStages([...stages, newStage]);
    };
    useState(() => {
        handleAddStage();
    }, []);
    const handleDeleteStage = (index) => {
        const updatedStages = [...stages];
        updatedStages.splice(index, 1);
        setStages(updatedStages);
    };

    //integration 
    //   react Select =>
    const animatedComponents = makeAnimated();
    const [userdata, setUserData] = useState([]);
    const [selecteduser, setSelectedUser] = useState();
    const [combinedValues, setCombinedValues] = useState([]);

    const handleuserChange = (selectedOptions) => {
        setSelectedUser(selectedOptions);
        // Map selected options to their values and send as an array
        const selectedValues = selectedOptions.map((option) => option.value);

        // Send selectedValues array to your backend
        console.log("Selected Values:", selectedValues);
        setCombinedValues(selectedValues);
    }

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // const url = `${API_KEY}/common/user/`;
            const url = `${API_KEY}/common/users/roles?roles=Admin,TeamMember`;
            const response = await fetch(url);
            const data = await response.json();
            setUserData(data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    // console.log(userdata);
    const options = userdata.map((user) => ({
        value: user._id,
        label: user.username

    }));

    //SORTS Jobs by get

    const [sortbyjobs, setSortbyJobs] = useState([]);
    const [selectedssortbyjob, setselectedsortbyjob] = useState();

    const handlesortingbyJobs = (selectedOptions) => {
        setselectedsortbyjob(selectedOptions);
    }

    useEffect(() => {
        fetchsortbbyjob();
    }, []);

    const fetchsortbbyjob = async () => {
        try {

            const url = `${API_KEY}/common/sortjobby/`;
            const response = await fetch(url);
            const data = await response.json();
            setSortbyJobs(data.sortJobsBy);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const optionsort = sortbyjobs.map((sort) => ({
        value: sort._id,
        label: sort.description

    }));

    //Default Jobt template get 
    const [Defaulttemp, setDefaultTemp] = useState([]);
    const [selectedtemp, setselectedTemp] = useState();
    const handletemp = (selectedOptions) => {
        setselectedTemp(selectedOptions);
    }
    useEffect(() => {
        fetchtemp();
    }, []);

    const fetchtemp = async () => {
        try {
            const url = `${API_KEY}/workflow/jobtemplate/`;
            const response = await fetch(url);
            const data = await response.json();
            setDefaultTemp(data.JobTemplates);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    const optiontemp = Defaulttemp.map((temp) => ({
        value: temp._id,
        label: temp.templatename

    }));
    //all data const 
    const [piplineName, setPipeLineName] = useState("");

    const handleClearForm = () => {
        setPipeLineName('');
        setSelectedUser([]);
        setselectedsortbyjob();
        setselectedTemp();
        setAccount_id(false);
        setDays_on_stage(false);
        setAccount_tags(false);
        setStartDate(false);
        setName(false);
        setDue_date(false);
        setDescription(false);
        setAssignees(false);
        setPriority(false);
        setStages([]);

    }
    //data send 
    const createPipe = () => {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            pipelineName: piplineName,
            availableto: combinedValues,
            sortjobsby: selectedssortbyjob.value,
            defaultjobtemplate: selectedtemp.value,
            accountId: Account_id,
            description: Description,
            duedate: Due_date,
            accounttags: Account_tags,
            priority: Priority,
            days_on_Stage: Days_on_stage,
            assignees: Assignees,
            name: Name,
            startdate: startDate,
            stages: stages,


        });
        console.log(raw);
        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };
        const url = `${API_KEY}/workflow/pipeline/`;
        fetch(url, requestOptions)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then((result) => {
                // Display success toast
                toast.success("Pipeline created successfully");
                // setTimeout(() => window.location.reload(), 1000);
                setShowForm(false);
                fetchPipelineData();
                handleClearForm();
            })
            .catch((error) => {
                // Display error toast
                toast.error("Failed to create pipeline");
            });

    }


    const [showForm, setShowForm] = useState(false);
    const handleClose = () => {
        setShowForm(false);
    }
    //get all templateName Record 
    const [pipelineData, setPipelineData] = useState([]);

    useEffect(() => {
        fetchPipelineData();
    }, []);

    const fetchPipelineData = async () => {
        try {

            const url = `${API_KEY}/workflow/pipeline/`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch pipeline data');
            }
            const data = await response.json();
            setPipelineData(data.pipeline);
        } catch (error) {
            console.error('Error fetching pipeline data:', error);
        }
    };



    // console.log(pipelineData)



    const handleCreateTemplate = () => {
        setShowForm(true);
    };
    const handleEdit = (_id) => {
        // Implement logic for editing here
        // console.log("Edit action triggered for template id: ", templateId);
        navigate('PipelineTemplateUpdate/' + _id)
    };

    const [openMenuId, setOpenMenuId] = useState(null);
    const toggleMenu = (_id) => {
        setOpenMenuId(openMenuId === _id ? null : _id);
    };


    //delete template
    const handleDelete = (_id) => {
        const requestOptions = {
            method: "DELETE",
            redirect: "follow"
        };
        const url = `${API_KEY}/workflow/pipeline/`;
        fetch(url + _id, requestOptions)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to delete item');
                }
                return response.text();
            })
            .then((result) => {
                console.log(result);
                toast.success('Item deleted successfully');
                fetchPipelineData();
                setOpenMenuId(false);
            })
            .catch((error) => {
                console.error(error);
                toast.error('Failed to delete item');
            })
            .finally(() => {
                setTimeout(() => {
                    // window.location.reload();
                }, 1000);
            });
    };

    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(pipelineData.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, pipelineData.length);
    const currentTemplates = pipelineData.slice(startIndex, endIndex);

    //for pagination

    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected);
    };

    const handleStageNameChange = (e, index) => {
        const newStages = [...stages]; // Create a copy of the stages array
        newStages[index].name = e.target.value; // Update the name of the specific stage
        setStages(newStages); // Update the state with the modified stages array
    };

    const handleStageAutomation = (e, index, saveAutomation) => {
        console.log(saveAutomation)
        const newStages = [...stages]; // Create a copy of the stages array
        newStages[index].automations = saveAutomation; // Update the name of the specific stage
        setStages(newStages); // Update the state with the modified stages array
        console.log(newStages)
    };


    // automations
    const [activeAction, setActiveAction] = useState(null);
    const [isAutoFormOpen, setAutoFormOpen] = useState(false);
    const [showAutoMoveDropdown, setShowAutoMoveDropdown] = useState(false);
    const automoveActions = ['Apply folder template', 'Update account tags', 'Send invoice', 'Create organozer', 'Create task', 'Send proposal/EL', 'Send email', 'Send message', 'Update account access', 'Update job assignees', 'Add wiki page'];
    const handleActionSelect = (action) => {
        setActiveAction(action);
        toggleForm();
        const newItemNumber = items.length + 1;
        const newItem = { id: newItemNumber, action };
        setItems([...items, newItem]);
        setShowAutoMovesDropdown(false);
    };
    const handleFormClose = () => {
        setAutoFormOpen(false);
        setActiveAction(null);
        setItems([]);
    };

    const [saveAutomation, setSaveAutomation] = useState(false);

    const handleSaveAutomation = (selectedEmailTemp, selectedTags) => {
        // setSaveAutomation(!saveAutomation);
        setSaveAutomation({ selectedEmailTemp, selectedTags });
        setAutoFormOpen(false);
        // console.log('Selected Email Template:', selectedEmailTemp);
        // console.log('Selected Tags:', selectedTags);
    }

    const toggleForm = () => {
        setAutoFormOpen(!isAutoFormOpen);
        setShowAutoMoveDropdown(false);
    };




    const [items, setItems] = useState([]);
    const [showAutoMovesDropdown, setShowAutoMovesDropdown] = useState(false);
    const automoveActionsForm = [
        'Apply folder template',
        'Update account tags',
        'Send invoice',
        'Create organizer',
        'Create task',
        'Send proposal/EL',
        'Send email',
        'Send message',
        'Update account access',
        'Update job assignees',
        'Add wiki page'
    ];
    const handleAddItems = (action) => {
        const newItemNumber = items.length + 1;
        const newItem = { id: newItemNumber, action };
        setItems([...items, newItem]);
        setShowAutoMovesDropdown(false);

    };




    // Function to render content based on action
    const renderActionContent = (action) => {
        switch (action) {
            case 'Apply folder template':
                return (
                    <>

                        <ApplyFolder />
                    </>);
            case 'Update account tags':
                return (
                    <>
                        <UpdateAccountTags />

                    </>
                );
            case 'Send email':
                return (
                    <div>
                        <SendEmail handleFormClose={handleFormClose} handleSaveAutomation={handleSaveAutomation} />


                    </div>
                );
            // Add cases for other actions here
            default:
                return null;
        }
    };
    const handleDeleteItems = (id) => {
        // Filter out the folder with the given id
        const updatedItems = items.filter(item => item.id !== id);
        // Update the ids of remaining folders
        const updatedItemsWithIds = updatedItems.map((item, index) => ({ ...item, id: index + 1 }));
        setItems(updatedItemsWithIds);
    };
    // Function to render header content based on action
    const renderHeaderContent = (action) => {
        switch (action) {
            case 'Apply folder template':
                return (
                    <div style={{ color: 'blue', cursor: 'pointer', display: 'flex', gap: '5px' }}>
                        <IoMdFolderOpen /> <h5>New template</h5>
                    </div>
                );
            case 'Update account tags':
                return (
                    <></>
                );
            case 'Send email':
                return (
                    <div>


                    </div>
                );
            // Add cases for other actions here
            default:
                return null;
        }
    };
    const calculateWidth = (label) => {
        const textWidth = label.length * 8;
        return Math.min(textWidth, 200);
    };

    return (

        <div className='create-pipeline-container ' >
            {!showForm &&
                <div>
                    <h3 style={{ fontSize: "25px" }} className='pipeline-heading'>Pipelines</h3>
                    <button className='btn1' style={{ marginLeft: "0px" }} onClick={handleCreateTemplate}>Create Pipeline</button>
                    <table style={{ marginTop: "10px", width: '100%' }} >
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentTemplates && currentTemplates.map(pipeline => (
                                <tr key={pipeline._id}>
                                    <td onClick={() => handleEdit(pipeline._id)} style={{ cursor: "pointer", color: 'var( --text-color)', }}>{pipeline.pipelineName}</td>
                                    <td>
                                        <div className="ci-menu-kebab" onClick={() => toggleMenu(pipeline._id)} style={{ cursor: 'pointer', fontSize: '20px' }}>
                                            &#8942;
                                        </div>
                                        {openMenuId === pipeline._id && (
                                            <div className="pipeline-menu-options">
                                                <div className="menu-option edit-option" onClick={() => handleEdit(pipeline._id)}>Edit</div>
                                                <div className="menu-option delete-option" onClick={() => handleDelete(pipeline._id)}>Delete</div>
                                            </div>
                                        )}

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div>
                        <ReactPaginate
                            pageCount={totalPages}
                            pageRangeDisplayed={5} // Adjust this value as needed
                            marginPagesDisplayed={2} // Adjust this value as needed
                            onPageChange={handlePageChange}
                            containerClassName={'pagination'}
                            activeClassName={'active'}
                            previousLabel={<MdKeyboardDoubleArrowLeft style={{ cursor: 'pointer' }} />}
                            nextLabel={<MdKeyboardDoubleArrowRight style={{ cursor: 'pointer' }} />}

                        />
                    </div>
                </div>
            }
            <>
                {showForm && (
                    <div>
                        <div className='pipelines-form col-12'>
                            <div className='form-header'>
                                <h3>Create Pipeline</h3>
                                <hr />
                            </div>
                            <div className='form-area'>
                                <div className='create-form col-6'>
                                    <div className='pipeline-name' >
                                        <label style={{ fontSize: '14px' }}>Pipeline Name</label>
                                        <input type='text' value={piplineName} id="pipelineName" onChange={(e) => setPipeLineName(e.target.value)} placeholder='Pipeline Name' className='pipeline-input' style={{ padding: '8px 12px', width: '100%', border: "2px solid rgb(100, 149, 237)", borderRadius: '10px', margin: '10px 0' }} />
                                    </div>
                                    <div className='select-container'>
                                        <div className='label-container'>
                                            <label>Available to</label>
                                        </div>
                                        <Select
                                            className='select-dropdown'
                                            placeholder="Available to "
                                            options={options}
                                            components={animatedComponents}
                                            isMulti // Enable multi-select
                                            value={selecteduser}
                                            onChange={handleuserChange}
                                            isSearchable // Enable search     
                                        />
                                    </div>
                                    <div className='select-container'>
                                        <div className='label-container'>
                                            <label>Sort jobs by</label>
                                        </div>
                                        <Select
                                            className='select-dropdown'
                                            placeholder="Sort jobs by"
                                            options={optionsort}
                                            value={selectedssortbyjob}
                                            components={animatedComponents}
                                            isMulti={false} // Single selection
                                            isSearchable // Enable search
                                            onChange={handlesortingbyJobs}
                                            isClearable
                                        />
                                    </div>
                                    <div className='select-container'>
                                        <div className='label-container'>
                                            <label>Default job template</label>
                                        </div>
                                        <Select
                                            className='select-dropdown'
                                            placeholder="Default job template"
                                            options={optiontemp}
                                            components={animatedComponents}
                                            isSearchable // Enable search
                                            isClearable
                                            onChange={handletemp}
                                            value={selectedtemp}
                                        />
                                    </div>
                                    <div className='job-cards-fields col-10'>
                                        <div className='job-card-header' style={{ textAlign: 'center', padding: '10px 8px' }}>
                                            <h3>Job card fields</h3>
                                        </div>
                                        <div className='pipeline-switches' style={{ display: 'flex', marginLeft: '35px', }}>
                                            <div className='pipeline-switch-container'>
                                                <div style={{ marginTop: "10px", marginLeft: '10px' }}>
                                                    <Switch
                                                        onColor="#3A91F5"
                                                        onHandleColor="#FFF"
                                                        onChange={handleAccount_idChange}
                                                        checked={Account_id}
                                                        handleDiameter={10}
                                                        uncheckedIcon={false}
                                                        checkedIcon={false}
                                                        height={20}
                                                        width={32}
                                                        className="react-switch"
                                                    />
                                                    <span className="switch-label" style={{ cursor: "pointer", marginLeft: '7px', marginRight: '2px' }}>Account ID</span>
                                                </div>

                                                <div style={{ marginTop: "10px", marginLeft: '10px' }}>
                                                    <Switch
                                                        onChange={handleDays_on_stageChange}
                                                        checked={Days_on_stage}
                                                        onColor="#3A91F5"
                                                        onHandleColor="#FFF"
                                                        handleDiameter={10}
                                                        uncheckedIcon={false}
                                                        checkedIcon={false}
                                                        height={20}
                                                        width={32}
                                                        className="react-switch"
                                                    />
                                                    <span className="switch-label" style={{ cursor: "pointer" }}>Days on stage</span>
                                                </div>

                                                <div style={{ marginTop: "10px", marginLeft: '10px' }}>
                                                    <Switch
                                                        onChange={handleAccount_tagsChange}
                                                        checked={Account_tags}
                                                        onColor="#3A91F5"
                                                        onHandleColor="#FFF"
                                                        handleDiameter={10}
                                                        uncheckedIcon={false}
                                                        checkedIcon={false}
                                                        height={20}
                                                        width={32}
                                                        className="react-switch"
                                                    />
                                                    <span className="switch-label" style={{ cursor: "pointer" }}>Account tags</span>
                                                </div>

                                                <div style={{ marginTop: "10px", marginLeft: '10px' }}>
                                                    <Switch
                                                        onChange={handleStartDateChange}
                                                        checked={startDate}
                                                        onColor="#3A91F5"
                                                        onHandleColor="#FFF"
                                                        handleDiameter={10}
                                                        uncheckedIcon={false}
                                                        checkedIcon={false}
                                                        height={20}
                                                        width={32}
                                                        className="react-switch"
                                                    />
                                                    <span className="switch-label" style={{ cursor: "pointer" }}>Start  date</span>
                                                </div>


                                            </div>

                                            {/*  */}

                                            <div className='pipeline-switch-container'>
                                                <div style={{ marginTop: "10px", marginLeft: '20px' }}>
                                                    <Switch
                                                        onChange={handleNameSwitchChange}
                                                        checked={Name}
                                                        onColor="#3A91F5"
                                                        onHandleColor="#FFF"
                                                        handleDiameter={10}
                                                        uncheckedIcon={false}
                                                        checkedIcon={false}
                                                        height={20}
                                                        width={32}
                                                        className="react-switch"
                                                    />
                                                    <span className="switch-label" style={{ cursor: "pointer" }}>Name</span>
                                                </div>
                                                <div style={{ marginTop: "10px", marginLeft: '20px' }}>
                                                    <Switch
                                                        onChange={handleDue_dateChange}
                                                        checked={Due_date}
                                                        onColor="#3A91F5"
                                                        onHandleColor="#FFF"
                                                        handleDiameter={10}
                                                        uncheckedIcon={false}
                                                        checkedIcon={false}
                                                        height={20}
                                                        width={32}
                                                        className="react-switch"
                                                    />
                                                    <span className="switch-label" style={{ cursor: "pointer" }}>Due date</span>
                                                </div>

                                                <div style={{ marginTop: "10px", marginLeft: '20px' }}>
                                                    <Switch
                                                        onChange={handleDescriptionChange}
                                                        checked={Description}
                                                        onColor="#3A91F5"
                                                        onHandleColor="#FFF"
                                                        handleDiameter={10}
                                                        uncheckedIcon={false}
                                                        checkedIcon={false}
                                                        height={20}
                                                        width={32}
                                                        className="react-switch"
                                                    />
                                                    <span className="switch-label" style={{ cursor: "pointer" }}>Description</span>
                                                </div>

                                                <div style={{ marginTop: "10px", marginLeft: '20px' }}>
                                                    <Switch
                                                        onChange={handleAssigneesChange}
                                                        checked={Assignees}
                                                        onColor="#3A91F5"
                                                        onHandleColor="#FFF"
                                                        handleDiameter={10}
                                                        uncheckedIcon={false}
                                                        checkedIcon={false}
                                                        height={20}
                                                        width={32}
                                                        className="react-switch"
                                                    />
                                                    <span className="switch-label" style={{ cursor: "pointer" }}>Assignees</span>
                                                </div>
                                            </div>


                                            <div style={{ marginTop: "10px", marginLeft: '20px' }} >
                                                <Switch
                                                    onChange={handlePriorityChange}
                                                    checked={Priority}
                                                    onColor="#3A91F5"
                                                    onHandleColor="#FFF"
                                                    handleDiameter={10}
                                                    uncheckedIcon={false}
                                                    checkedIcon={false}
                                                    height={20}
                                                    width={32}
                                                    className="react-switch"

                                                />
                                                <span className="switch-label" style={{ cursor: "pointer", marginRight: '1px' }}>Priority</span>
                                            </div>

                                        </div>

                                    </div>

                                </div>

                                <div className="vl"></div>
                                <div className="col-6" style={{ margin: '10px 0 0 10px', }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div className='col-6' style={{ display: 'flex', alignItems: 'center', gap: '20px', }} >
                                            <p>Default recurrence setting</p>
                                            <SlQuestion style={{ cursor: 'pointer', color: 'blue' }} />
                                        </div>
                                        <div className="switch-container" >
                                            <Switch
                                                onChange={handleSingleSwitchChange}
                                                checked={singleSwitch}
                                                onColor="#3A91F5"
                                                onHandleColor="#FFF"
                                                handleDiameter={10}
                                                uncheckedIcon={false}
                                                checkedIcon={false}
                                                height={20}
                                                width={32}
                                                className="react-switch"
                                            />
                                            <span className="switch-label" style={{ cursor: "pointer" }}>Enable recurrence</span>
                                        </div>
                                    </div>
                                    {/* Conditional rendering for additional options */}
                                    {singleSwitch && (
                                        <div >
                                            <ul style={{ display: 'flex', gap: '20px', }} >
                                                <li style={{ color: 'blue', fontWeight: 'bold', listStyle: 'none', cursor: 'pointer' }}>Every year</li>
                                                <li style={{ color: 'blue', fontWeight: 'bold', listStyle: 'none', cursor: 'pointer' }}>Every 3 months</li>
                                                <li style={{ color: 'blue', fontWeight: 'bold', listStyle: 'none', cursor: 'pointer' }}>Every month</li>
                                                <li style={{ color: 'blue', fontWeight: 'bold', listStyle: 'none', cursor: 'pointer' }}>Every week</li>
                                                <li style={{ color: 'blue', fontWeight: 'bold', listStyle: 'none', cursor: 'pointer' }}>Every day</li>
                                            </ul>

                                            <div style={{ marginTop: '20px' }}>
                                                <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Recurrence period</h2>
                                                <div className='col-12' style={{ display: 'flex', gap: '5px' }}>
                                                    <div className='col-6' >
                                                        <label style={{ fontSize: '14px' }}>Start Date</label>
                                                        <div>
                                                            <DatePicker
                                                                selected={startDate}
                                                                onChange={handleStartDateChange}
                                                                className="date-picker-input "
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className='col-6'>
                                                        <label style={{ fontSize: '14px' }}>Due Date</label>
                                                        <div>
                                                            <DatePicker selected={dueDate} onChange={handleDueDateChange} className="date-picker-input " />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className='col-6' style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '20px 0 10px 0', }}>
                                                    <h2 style={{ fontSize: '18px' }}>Repeats every</h2>
                                                    <SlQuestion style={{ cursor: 'pointer', color: 'blue' }} />
                                                </div>
                                                <div className='col-12' style={{ display: 'flex', gap: '5px' }}>
                                                    <input type='text' className='col-3 day-input' />
                                                    <Select className='col-3' />
                                                    <p style={{ marginTop: '10px', textAlign: 'center' }} className='col-2'>on the</p>
                                                    <Select className='col-4' />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>


                        </div>
                        <div className='create-stages col-10' style={{ margin: '20px 0 10px 10px' }}>
                            <div className='stages-header' style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <h3>Stages</h3>

                                {/* <button onClick={handleAddStage} className=' col-2'  > */}
                                <div onClick={handleAddStage} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'blue', fontSize: '15px', cursor: 'pointer', }}>
                                    <LuPlusCircle />
                                    <span>Add stages</span>
                                </div>
                                {/* </button> */}

                            </div>
                            <hr />
                            <div className='stages col-12' style={{ display: 'flex', gap: '10px', overflowX: 'auto', }}>
                                {stages.map((stage, index) => (
                                    <div key={index} className='stage-board col-3' style={{ height: 'auto', marginTop: '20px', borderRadius: '10px', boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)", marginLeft: '10px', marginBottom: '40px' }}>
                                        {/* Render stage content */}
                                        <div style={{ margin: '10px' }}>
                                            <div className='board-header' style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <RxDragHandleDots2 />
                                                <div className="input-icon">
                                                    {/* <LuPenLine className="edit-icon" /> */}
                                                    <input type="text" value={stage.name} onChange={(e) => handleStageNameChange(e, index)} placeholder="Stage Name" style={{ border: 'none', padding: '10px' }} />
                                                </div>
                                                <RiDeleteBin6Line style={{ color: 'red', cursor: 'pointer' }} onClick={() => handleDeleteStage(index)} />
                                            </div>
                                            <hr />
                                            <div className='stage-body'>
                                                <h3 style={{ fontSize: '15px', margin: '5px 0 5px 0' }}>Stage conditions</h3>
                                                <p style={{ fontSize: '14px' }}>First stage can't have conditions</p>
                                                <br />
                                                <h3 style={{ fontSize: '15px', margin: '5px 0 5px 0' }}>Automations</h3>
                                                <p style={{ fontSize: '14px' }}>Triggered when job enters stage</p>
                                                <br />
                                                <div> <li style={{ listStyle: 'none', cursor: 'pointer', color: 'blue', fontWeight: 'bold' }} onClick={() => setShowAutoMoveDropdown(!showAutoMoveDropdown)}>add automation</li></div>
                                                <br />

                                                {saveAutomation && (
                                                    <div className='automations-list'>
                                                        <div>
                                                            {items.map((item, index) => (
                                                                <div key={item.id} >
                                                                    <div className='item-card-header' style={{ display: 'flex', gap: '10px', fontSize: '20px', fontWeight: '550' }}>
                                                                        {item.id}. {item.action}
                                                                    </div>
                                                                </div>
                                                            ))}

                                                        </div>
                                                        <div>
                                                            {saveAutomation.selectedEmailTemp ? saveAutomation.selectedEmailTemp.label : 'None'}
                                                        </div>
                                                        <div style={{ margin: '10px 0' }}>
                                                            <strong>conditions</strong>
                                                            <ul>
                                                                {console.log(saveAutomation)}
                                                                {/* onChange={(e) => handleStageAutomation(e, index, saveAutomation)} */}
                                                                {/*  */}
                                                                {saveAutomation.selectedTags.length > 0 ? (
                                                                    saveAutomation.selectedTags.map(tag => (
                                                                        <li
                                                                            key={tag._id}
                                                                            style={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: '8px',
                                                                                backgroundColor: tag.tagColour,
                                                                                borderRadius: '20px',
                                                                                color: '#fff',
                                                                                fontSize: '12px',
                                                                                fontWeight: '600',
                                                                                textAlign: 'center',
                                                                                border: 'none',
                                                                                padding: '3px',
                                                                                marginBottom: '5px',
                                                                                marginRight: '5px',
                                                                                display: 'inline-block',
                                                                                width: `${calculateWidth(tag.tagName)}px`
                                                                            }}
                                                                        >
                                                                            {tag.tagName}
                                                                        </li>
                                                                    ))
                                                                ) : (
                                                                    <li>No tags selected</li>
                                                                )}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                )}


                                                <h3 style={{ fontSize: '15px', margin: '5px 0 5px 0' }}>Automove</h3>
                                                <p style={{ fontSize: '14px' }}>Move jobs automatically when linked actions are completed</p>


                                                {showAutoMoveDropdown && (
                                                    <div className='automovedrop-down'>
                                                        <ul>
                                                            {automoveActions.map((action, index) => (
                                                                <li key={index} onClick={() => handleActionSelect(action)}>{action}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}


                                                <div className="switch-container" style={{ marginTop: '10px' }}>
                                                    <Switch
                                                        onChange={handleAutoMoveChange}
                                                        checked={autoMoveJob}
                                                        onColor="#3A91F5"
                                                        onHandleColor="#FFF"
                                                        handleDiameter={10}
                                                        uncheckedIcon={false}
                                                        checkedIcon={false}
                                                        height={20}
                                                        width={32}
                                                        className="react-switch"
                                                    />
                                                    <span className="switch-label" style={{ cursor: "pointer" }}>Automove jobs</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}



                                <div className='add-stage-btn col-3' style={{ marginTop: '20px' }}>
                                    <button className='col-12' onClick={handleAddStage}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'blue', padding: '15px', fontSize: '15px', cursor: 'pointer' }}>
                                            <LuPlusCircle />
                                            <span>Add stages</span>
                                        </div>
                                    </button>
                                </div>


                            </div>


                            <div className='pipeline-btn'>
                                <button className='btn1' onClick={createPipe} style={{ marginRight: '10px' }}>Save</button>

                                <button className='btn2' onClick={handleClose}>cancel</button>

                            </div>

                        </div>
                    </div>
                )}
            </>
            <ToastContainer />
            {isAutoFormOpen && activeAction && (
                <div className={`autoform-container ${isAutoFormOpen ? "autoform-open" : ""}`}>
                    <div className='auto_header'>
                        <div className="auto_header_title">
                            <div className="auto_title"><h3>Automations</h3></div>
                            <button type="button" onClick={handleFormClose}>
                                <RxCross2 />
                            </button>
                        </div>
                    </div>
                    <div className="auto_content">

                        <div className='item-content col-12' style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                            <div className='item-template col-12' style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {items.map((item, index) => (
                                    <div>
                                        <div key={item.id} className="item-card" style={{ border: '1px solid #B2BEB5', borderRadius: '10px', padding: '10px' }}>
                                            <div className='item-card-header' style={{ display: 'flex', gap: '10px', fontSize: '20px', fontWeight: '550' }}>
                                                <RxDragHandleDots2 /> {item.id}. {item.action}

                                                <div className='item-header' style={{ marginLeft: 'auto' }}>

                                                    <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                                                        {renderHeaderContent(item.action)}
                                                    </p>
                                                </div>
                                                <RiDeleteBin6Line onClick={() => handleDeleteItems(item.id)} />
                                            </div>
                                            {renderActionContent(item.action)}

                                        </div>

                                    </div>
                                ))}
                            </div>

                            <div style={{
                                display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer', border: 'none', margin: '15px 0'
                            }}>
                                <LuPlusCircle style={{ color: 'blue' }} />
                                <li style={{ listStyle: 'none', cursor: 'pointer', color: 'blue', fontWeight: 'bold' }} onClick={() => setShowAutoMovesDropdown(!showAutoMovesDropdown)} >add automove</li>
                                {showAutoMovesDropdown && (
                                    <div className='contditions-automovedrop-down'>
                                        <ul>
                                            {automoveActionsForm.map((action, index) => (
                                                <li key={index} onClick={() => handleAddItems(action)}>{action}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div >

    );

}

export default CreatePipeline;