const EmailTemplate = require('../models/emailTemplateModel');
const mongoose = require("mongoose");

//get all JobTemplate
const getEmailTemplates = async (req, res) => {
    try {
        const emailTemplate = await EmailTemplate.find({}).sort({ createdAt: -1 });
        res.status(200).json({ message: "EmailTemplate retrieved successfully", emailTemplate });

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
};

//Get a single JobTemplate
const getEmailTemplate = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid Emailtemplate ID" });
    }

    try {
        const emailTemplate = await EmailTemplate.findById(id)


        if (!emailTemplate) {
            return res.status(404).json({ error: "No such EmailTemplate" });
        }

        res.status(200).json({ message: "EmailTemplate retrieved successfully", emailTemplate });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



//Get a single JobTemplate List
const getEmailTemplateList = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid EmailTemplate ID" });
    }

    try {
        const emailTemplate = await EmailTemplate.findById(id)
            .populate({ path: 'from', model: 'User' });


        if (!emailTemplate) {
            return res.status(404).json({ error: "No such emailTemplate" });
        }

        res.status(200).json({ message: "emailTemplate retrieved successfully", emailTemplate });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



// //POST a new JobTemplate 
// const createEmailTemplate = async (req, res) => {
//     const { templatename, from, emailsubject, emailbody, active } = req.body;

//     // Handle file uploads
//     const files = req.files ? req.files.map(file => ({
//         filename: file.originalname,
//         path: file.path
//     })) : [];

//     try {
//         // Check if a task template with similar properties already exists
//         const existingTemplate = await EmailTemplate.findOne({
//             templatename
//         });

//         if (existingTemplate) {
//             return res.status(400).json({ error: "EmailTemplate  already exists" });
//         }
//         // If no existing template is found, create a new one
//         const newEmailTemplate = await EmailTemplate.create({
//             templatename, from, emailsubject, emailbody, files, active
//         });
//         return res.status(201).json({ message: "EmailTemplate created successfully", newEmailTemplate });
//     } catch (error) {
//         console.error("Error creating EmailTemplate:", error);
//         return res.status(500).json({ error: "Error creating EmailTemplate" });
//     }
// };

// const createEmailTemplate = async (req, res) => {
//     const { templatename, from, emailsubject, emailbody, active } = req.body;
//     const files = req.files; // Assuming req.files is populated with the uploaded files

//     try {
//         const existingTemplate = await EmailTemplate.findOne({ templatename });
//         if (existingTemplate) {
//             return res.status(400).json({ error: "EmailTemplate already exists" });
//         }

//         // Map to create an array of file objects
//         const fileDetails = files.map(file => ({
//             filename: file.originalname, // Adjust as needed
//             path: file.path // Adjust as needed
//             // Add more fields if necessary
//         }));

//         const newEmailTemplate = await EmailTemplate.create({
//             templatename,
//             from,
//             emailsubject,
//             emailbody,
//             active,
//             files: fileDetails // Assign the array of objects
//         });

//         return res.status(201).json({ message: "EmailTemplate created successfully", newEmailTemplate });
//     } catch (error) {
//         console.error("Error creating EmailTemplate:", error);
//         return res.status(500).json({ error: "Error creating EmailTemplate" });
//     }
// };


const createEmailTemplate = async (req, res) => {
    const { templatename, from, emailsubject, emailbody, active } = req.body;
    const files = req.files; // Assuming req.files contains file information

    try {
        const existingTemplate = await EmailTemplate.findOne({ templatename });
        if (existingTemplate) {
            return res.status(400).json({ error: "EmailTemplate already exists" });
        }

        // Map to create an array of file objects with size
        const fileDetails = files.map(file => ({
            filename: file.originalname,  // File name
            path: file.path,              // File path
            size: file.size               // File size
        }));

        const newEmailTemplate = await EmailTemplate.create({
            templatename,
            from,
            emailsubject,
            emailbody,
            active,
            files: fileDetails // Assign the array of file objects
        });

        return res.status(201).json({ message: "EmailTemplate created successfully", newEmailTemplate });
    } catch (error) {
        console.error("Error creating EmailTemplate:", error);
        return res.status(500).json({ error: "Error creating EmailTemplate" });
    }
};


//delete a JobTemplate

const deleteEmailTemplate = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid EmailTemplate ID" });
    }

    try {
        const deletedEmailTemplate = await EmailTemplate.findByIdAndDelete({ _id: id });
        if (!deletedEmailTemplate) {
            return res.status(404).json({ error: "No such EmailTemplate" });
        }
        res.status(200).json({ message: "EmailTemplate deleted successfully", deletedEmailTemplate });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

//update a new tasktemplate 
// const updateEmailTemplate = async (req, res) => {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//         return res.status(404).json({ error: "Invalid EmailTemplate ID" });
//     }

//     try {
//         const updatedEmailTemplate = await EmailTemplate.findOneAndUpdate(
//             { _id: id },
//             { ...req.body },
//             { new: true }
//         );

//         if (!updatedEmailTemplate) {
//             return res.status(404).json({ error: "No such EmailTemplate" });
//         }

//         res.status(200).json({ message: "EmailTemplate Updated successfully", updatedEmailTemplate });
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// };

// const updateEmailTemplate = async (req, res) => {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//         return res.status(404).json({ error: "Invalid EmailTemplate ID" });
//     }

//     try {
//         // Process files if they exist in the request
//         const files = req.files ? req.files.map(file => ({
//             filename: file.filename,
//             path: file.path,
//             size: file.size
//         })) : [];

//         // Build the update object
//         const updateData = {
//             ...req.body,
//             files: files.length ? files : req.body.files  // Keep existing files if none are uploaded
//         };

//         const updatedEmailTemplate = await EmailTemplate.findOneAndUpdate(
//             { _id: id },
//             updateData,
//             { new: true }
//         );

//         if (!updatedEmailTemplate) {
//             return res.status(404).json({ error: "No such EmailTemplate" });
//         }

//         res.status(200).json({ message: "EmailTemplate Updated successfully", updatedEmailTemplate });
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// };

// const updateEmailTemplate = async (req, res) => {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//         return res.status(404).json({ error: "Invalid EmailTemplate ID" });
//     }

//     try {
//         // Process files if they exist in the request
//         const files = req.files ? req.files.map(file => ({
//             filename: file.filename,
//             path: file.path,
//             size: file.size
//         })) : [];

//         // Build the update object
//         const updateData = {
//             ...req.body,
//             files: files.length ? files : req.body.files  // Keep existing files if none are uploaded
//         };

//         const updatedEmailTemplate = await EmailTemplate.findOneAndUpdate(
//             { _id: id },
//             updateData,
//             { new: true }
//         );

//         if (!updatedEmailTemplate) {
//             return res.status(404).json({ error: "No such EmailTemplate" });
//         }

//         res.status(200).json({ message: "EmailTemplate Updated successfully", updatedEmailTemplate });
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// };


const updateEmailTemplate = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid EmailTemplate ID" });
    }
    console.log('Received body:', req.body);
console.log('Received files:', req.files);


    try {
        // Process files if they exist in the request
        const files = req.files ? req.files.map(file => ({
            filename: file.originalname,  // File name
            path: file.path,              // File path
            size: file.size               // File size
        })) : [];

        // Build the update object
        const updateData = {
            ...req.body,  // Spread the incoming fields
            files: files.length ? files : req.body.files  // Keep existing files if none are uploaded
        };

        const updatedEmailTemplate = await EmailTemplate.findOneAndUpdate(
            { _id: id },
            updateData,
            { new: true }
        );

        if (!updatedEmailTemplate) {
            return res.status(404).json({ error: "No such EmailTemplate" });
        }

        res.status(200).json({ message: "EmailTemplate Updated successfully", updatedEmailTemplate });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createEmailTemplate,
    getEmailTemplates,
    getEmailTemplate,
    deleteEmailTemplate,
    updateEmailTemplate,
    getEmailTemplateList
}