const mongoose = require("mongoose");
const Contacts = require("../models/contactsModel");
const Tags = require("../models/tagModel");

// Get all contacts
const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contacts.find({}).sort({ createdAt: -1 });
    res.status(200).json({ message: "Contacts retrieved successfully", contacts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching contacts", error: error.message });
  }
};
const getContactsIdAndName = async (req, res) => {
  try {
    const contacts = await Contacts.find({})
      // .select("accountName")  // Only include the 'name' field
     

    // Map the accounts to only include id and name
    const contactData = contacts.map(contact => ({
      _id: contact._id,     // Include the account ID
      contactName: contact.contactName,   // Include the account namec
     email:contact.email
    }));

    res.status(200).json({ message: "Accounts retrieved successfully", contacts: contactData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Get single contact
const getSingleContact = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid Contact ID" });
  }

  try {
    const contact = await Contacts.findById(id).populate({ path: "tags", model: "Tags" });

    if (!contact) {
      return res.status(404).json({ error: "No such TaskTemplate" });
    }

    res.status(200).json({ message: "Contacts retrieved successfully", contact });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createContact = async (req, res) => {
  const contacts = req.body;

  // if (!Array.isArray(contacts) || contacts.some((contact) => !contact.firstName || !contact.lastName || !contact.email)) {
  //   return res.status(400).json({ error: "Each contact must have first name, last name, and email" });
  // }

  try {
    const newContacts = await Promise.all(contacts.map((contact) => Contacts.create(contact)));
    res.status(201).json({ newContacts });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// Delete a contact
const deleteContact = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid Contact ID" });
  }

  try {
    const deletedContact = await Contacts.findByIdAndDelete(id);
    if (!deletedContact) {
      return res.status(404).json({ error: "No such contact" });
    }
    res.status(200).json({ message: "Contact deleted successfully", deletedContact });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Update contact
const updateContact = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid Contact ID" });
  }

  try {
    const updatedContact = await Contacts.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedContact) {
      return res.status(404).json({ error: "No such contact" });
    }
    res.status(200).json({ message: "Contact updated successfully", updatedContact });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Get contacts list
const getContactsList = async (req, res) => {
  try {
    const contacts = await Contacts.find({}).populate({ path: "tags", model: "Tags" }).sort({ createdAt: -1 }); // Ensure correct model name
    const contactlist = contacts.map((contact) => {
      return {
        id: contact._id,
        name: contact.contactName,
        email: contact.email,
        phoneNumbers: contact.phoneNumbers,
        companyName: contact.companyName,
        tags: contact.tags,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
      };
    });

    res.status(200).json({ message: "Contacts list retrieved successfully", contactlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getContactsByAccountId = async (req, res) => {
  try {
    const { accountid } = req.params; // Assuming accountid is passed as a URL parameter

    // Validate the accountid
    if (!accountid) {
      return res.status(400).json({ error: "Account ID is required" });
    }

    // Query the database for contacts with the given accountid
    const contacts = await Contacts.find({ accountid });

    // If no contacts found
    if (!contacts.length) {
      return res.status(404).json({ message: "No contacts found for this account ID" });
    }

    // Return the contacts
    res.status(200).json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createContact,
  getAllContacts,
  getSingleContact,
  deleteContact,
  updateContact,
  getContactsList,
  getContactsByAccountId,
  getContactsIdAndName
};

// Create new contact
// const createContact = async (req, res) => {
//     const {
//         firstName, middleName, lastName, contactName, companyName, note, ssn, email,
//         tags, country, streetAddress, city, state, postalCode, phoneNumbers, active
//     } = req.body;

//     if (!firstName || !lastName || !email) {
//         return res.status(400).json({ error: 'First name, last name, and email are required' });
//     }

//     try {
//         const newContact = await Contacts.create({
//             firstName, middleName, lastName, contactName, companyName, note, ssn, email,
//             tags, country, streetAddress, city, state, postalCode, phoneNumbers, active
//         });
//         res.status(201).json({ message: 'Contact created successfully', newContact });
//     } catch (error) {
//         console.error(error);
//         res.status(400).json({ error: error.message });
//     }
// };

// const createContact = async (req, res) => {
//     const {
//         firstName, middleName, lastName, contactName, companyName, note, ssn, email,
//         tags, country, streetAddress, city, state, postalCode, phoneNumbers, active
//     } = req.body;

//     if (!firstName || !lastName || !email) {
//         return res.status(400).json({ error: 'First name, last name, and email are required' });
//     }

//     try {
//         const newContact = await Contacts.create({
//             firstName, middleName, lastName, contactName, companyName, note, ssn, email,
//             tags, country, streetAddress, city, state, postalCode, phoneNumbers, active
//         });
//         res.status(201).json({

//             newContact
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(400).json({ error: error.message });
//     }
// };
