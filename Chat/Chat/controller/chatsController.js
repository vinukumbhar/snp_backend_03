
const Chats = require('../models/chatsModel');
const mongoose = require("mongoose");
const AccountwiseChat = require('../models/chatsModel');
const ChatTemplate = require("../models/ChatTempModels")  // Ensure this import is correct
const Accounts = require("../models/AccountModel")

// Get all ChatTemplates
const getAllChats = async (req, res) => {
    try {
        const accountChats = await AccountwiseChat.find()
            .populate({ path: 'accountid', model: 'Accounts' }); // Removed .populate('chattemplateid') since it's redundant
        res.status(200).json({ message: "Chats Accountwise retrieved successfully", accountChats });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single ChatTemplate
const getChats = async (req, res) => {
    try {
        const { id } = req.params;

        const accountChats = await AccountwiseChat.findById(id)
            .populate({ path: 'accountid', model: 'Accounts' })
            .populate({ path: 'chattemplateid', model: 'ChatTemplate' });

        if (!accountChats) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        res.status(200).json({ message: "Chats Accountwise retrieved successfully", accountChats });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST a new ChatTemplate

const createChats = async (req, res) => {
    const {
        accountids,
        chattemplateid,
        templatename,
        from,
        chatsubject,
        description,

        sendreminderstoclient,
        daysuntilnextreminder,
        numberofreminders,
        clienttasks,
        active
    } = req.body;

    if (!Array.isArray(accountids)) {
        return res.status(400).json({ error: "accountids must be an array" });
    }

    try {
        for (const accountid of accountids) {
            await AccountwiseChat.create({
                accountid,
                chattemplateid,
                templatename,
                from,
                chatsubject,
                description,
                sendreminderstoclient,
                daysuntilnextreminder,
                numberofreminders,
                clienttasks,

                active
            });
        }
        return res.status(201).json({ message: "Chats created successfully" });
    } catch (error) {
        console.error("Error creating chats:", error);
        return res.status(500).json({ error: "Error creating chats" });
    }
};

// Delete a ChatTemplate
const deleteChats = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "Invalid Chat Accountwise ID" });
        }
        const deletedChataccountwise = await AccountwiseChat.findByIdAndDelete(id);

        if (!deletedChataccountwise) {
            return res.status(404).json({ error: "No such  Chat Accountwise" });
        }

        res.status(200).json({ message: "Chat Accountwise deleted successfully", deletedChataccountwise });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Update a ChatTemplate
const updateChats = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "Invalid Chat Accountwise ID" });
        }
        const updatedChats = await AccountwiseChat.findByIdAndUpdate(
            { _id: id },
            { ...req.body },
            { new: true }
        );
        if (!updatedChats) {
            return res.status(404).json({ error: "No such Chat Accountwise" });
        }
        res.status(200).json({ message: "Chat Accountwise Updated successfully", updatedChats });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const updateChatDescription = async (req, res) => {
    try {
        const { id } = req.params;
        const { newDescriptions } = req.body; // Assuming newDescriptions is an array of description objects

        // Validate the provided ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "Invalid Chat Accountwise ID" });
        }

        // Validate newDescriptions
        if (!Array.isArray(newDescriptions) || newDescriptions.length === 0) {
            return res.status(400).json({ error: "No new descriptions provided" });
        }

        // Append new descriptions to the existing description array
        const updatedChats = await AccountwiseChat.findByIdAndUpdate(
            { _id: id },
            { $push: { description: { $each: newDescriptions } } }, // Use $push with $each to append multiple descriptions
            { new: true }
        );

        if (!updatedChats) {
            return res.status(404).json({ error: "No such Chat Accountwise" });
        }

        res.status(200).json({
            message: "New descriptions added successfully",
            updatedChats,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Get ChatTemplates with filters (accountid, active)
const getchatAccountwiselist = async (req, res) => {
    try {
        const { id } = req.params;

        const chataccountwise = await AccountwiseChat.find({ accountid: id })
            .populate({ path: 'accountid', model: 'Accounts' })
            .populate({ path: 'chattemplateid', model: 'ChatTemplate' });

        if (!chataccountwise) {
            return res.status(404).json({ error: "No such Chat Accountwise" });
        }

        res.status(200).json({ message: "Chats Accountwise retrieved successfully", chataccountwise });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get ChatTemplates with filters (accountid, active)
const getisactivechatAccountwise = async (req, res) => {
    try {
        const { accountid, isactive } = req.params;

        const chataccountwise = await AccountwiseChat.find({ accountid: accountid, active: isactive })
            .populate({ path: 'accountid', model: 'Accounts' })
            .populate({ path: 'chattemplateid', model: 'ChatTemplate' });

        res.status(200).json({ message: "Chats Accountwise retrieved successfully", chataccountwise });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//update messages
const updateMessage = async (req, res) => {
    console.log(req.body)
    try {
        const { chatId, messageId, newMessage } = req.body;

        // Validate required fields
        if (!chatId || !messageId || !newMessage) {
            return res.status(400).json({ message: "chatId, messageId, and newMessage are required." });
        }

        const updatedChat = await AccountwiseChat.findOneAndUpdate(
            {
                _id: chatId,
                "description._id": messageId, // Match the specific message by its _id in the description array
            },
            {
                $set: {
                    "description.$.message": newMessage, // Update the message field of the matched element
                },
            },
            { new: true } // Return the updated document
        );

        if (updatedChat) {
            return res.status(200).json({
                message: "Message updated successfully",
                updatedChat,
            });
        } else {
            return res.status(404).json({
                message: "Chat or message not found.",
            });
        }
    } catch (error) {
        console.error("Error updating message:", error);
        return res.status(500).json({
            message: "An error occurred while updating the message.",
            error: error.message,
        });
    }
};

//delete messages
const deleteMessage = async (req, res) => {
    try {
        const { chatId, messageId } = req.body;

        // Validate required fields
        if (!chatId || !messageId) {
            return res.status(400).json({ message: "chatId and messageId are required." });
        }

        const updatedChat = await AccountwiseChat.findOneAndUpdate(
            { _id: chatId }, // Match the chat document by chatId
            {
                $pull: {
                    description: { _id: messageId }, // Remove the message with the matching _id
                },
            },
            { new: true } // Return the updated document after deletion
        );

        if (updatedChat) {
            return res.status(200).json({
                message: "Message deleted successfully",
                updatedChat,
            });
        } else {
            return res.status(404).json({
                message: "Chat or message not found.",
            });
        }
    } catch (error) {
        console.error("Error deleting message:", error);
        return res.status(500).json({
            message: "An error occurred while deleting the message.",
            error: error.message,
        });
    }
};



///for resend client task button
const addClientTask = async (req, res) => {
    const { chatId, newTask } = req.body;
    console.log(chatId);

    try {
        // Find the chat document
        const chat = await AccountwiseChat.findById(chatId);
        console.log(chat);

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Clear the previous client tasks
        chat.clienttasks = [];  // This removes all the previous tasks

        // Add the new tasks as a single sub-array in clienttasks
        chat.clienttasks.push(newTask);

        // Save the updated chat document
        const updatedChat = await chat.save();

        console.log('Client tasks updated successfully.');
        res.status(200).json({
            message: 'Client tasks updated successfully',
            updatedChat,
        });
    } catch (error) {
        console.error('Error updating client tasks:', error.message);
        res.status(500).json({ message: 'Error updating client tasks', error: error.message });
    }
};




//update task client
const updateTaskCheckedStatus = async (req, res) => {
    const { chatId, taskUpdates } = req.body;
     console.log(req.body)
    // taskUpdates should be an array of objects, e.g., [{ id: "1", checked: true }, { id: "2", checked: false }]
    try {
        // Find the chat document
        const chat = await AccountwiseChat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Iterate through the clienttasks array and update the checked property
        chat.clienttasks = chat.clienttasks.map(subArray =>
            subArray.map(task => {
                const update = taskUpdates.find(update => update.id === task.id);
                if (update) {
                    return { ...task, checked: update.checked }; // Update the checked property
                }
                return task; // Return the task as is if no update is found
            })
        );

        // Save the updated document
        const updatedChat = await chat.save();

        console.log('Task(s) updated successfully.');
        res.status(200).json({
            message: 'Task(s) updated successfully',
            updatedChat,
        });
    } catch (error) {
        console.error('Error updating task(s):', error.message);
        res.status(500).json({ message: 'Error updating task(s)', error: error.message });
    }
};


module.exports = {
    getAllChats,
    getChats,
    createChats,
    deleteChats,
    updateChats,
    getchatAccountwiselist,
    getisactivechatAccountwise,
    updateChatDescription,
    updateMessage,
    deleteMessage,
    addClientTask,
    updateTaskCheckedStatus
};