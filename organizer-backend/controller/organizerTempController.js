const OrganizerTemplate = require('../models/organizerTempModel');
const mongoose = require("mongoose");

//get all OrganizerTemplate
const getOrganizerTemplates = async (req, res) => {
  try {
    const OrganizerTemplates =  await OrganizerTemplate.find({}).sort({ createdAt: -1 });

    res.status(200).json({ message: "Organizer Template retrieved successfully", OrganizerTemplates })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
};

//Get a single OrganizerTemplate
const getOrganizerTemplate = async (req, res) => {
  try {
    const organizerTemplate = await OrganizerTemplate.findById(req.params.id);
    if (!organizerTemplate) {
      return res.status(404).send();
    }
    res.status(200).json({ message: "Organizer Template retrieved successfully", organizerTemplate })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
};

//POST a new OrganizerTemplate 
const createOrganizerTemplate = async (req, res) => {
  try {
    const { templatename, organizerName, sections,organizersettings, active } = req.body;
    try {
      // Check if a task template with similar properties already exists
      const existingTemplate = await OrganizerTemplate.findOne({ templatename });

      if (existingTemplate) {
        return res.status(200).json({ error: "Organizer Template already exists" });
      }
      // If no existing template is found, create a new one
      const newOrganizerTemplate = await OrganizerTemplate.create({ templatename, organizerName, sections, organizersettings,active });

      return res.status(200).json({ message: "Organizer Template created successfully", newOrganizerTemplate });
    } catch (error) {
      console.error("Error creating Organizer Template:", error);
      return res.status(500).json({ error: "Error creating Organizer Template" });
    }

  } catch (error) {
    res.status(400).send(error);
  }
};

//delete a OrganizerTemplate

const deleteOrganizerTemplate = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid OrganizerTemplate ID" });
  }

  try {
    const deletedOrganizerTemplate = await OrganizerTemplate.findByIdAndDelete({ _id: id });
    if (!deletedOrganizerTemplate) {
      return res.status(404).json({ error: "No such OrganizerTemplate" });
    }
    res.status(200).json({ message: "OrganizerTemplate deleted successfully", deletedOrganizerTemplate });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};



//update a new OrganizerTemplate 
const updateOrganizerTemplate = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Invalid TaskTemplate ID" });
  }

  try {
      const updatedOrganizerTemplate = await OrganizerTemplate.findOneAndUpdate(
          { _id: id },
          { ...req.body },
          { new: true }
      );

      if (!updatedOrganizerTemplate) {
          return res.status(404).json({ error: "No such OrganizerTemplate" });
      }

      res.status(200).json({ message: "OrganizerTemplate Updated successfully", updatedOrganizerTemplate });
  } catch (error) {
      return res.status(500).json({ error: error.message });
  }
};


module.exports = {
  createOrganizerTemplate,
  getOrganizerTemplate,
  getOrganizerTemplates,
  deleteOrganizerTemplate,
  updateOrganizerTemplate,
  // getJobTemplateList
}