const mongoose = require('mongoose');

const messageschema = new mongoose.Schema({
    message: {
        type: String,
    },
    fromwhome : {
        type: String
    },
    time: {
        type: Date,
        default: Date.now, // Automatically set the current time when the document is created
    },
});

const AccountwiseChatSchema = new mongoose.Schema({
    accountid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
    },

    chattemplateid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatTemplate',
    },

    templatename: {
        type: String,
        // required: [true, 'Template name is required'],
        // trim: true
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
    },

    chatsubject: {
        type: String,
    },

    description : [ messageschema ],

    sendreminderstoclient: {
        type: Boolean,
    },

    daysuntilnextreminder: {
        type: Number,
    },

    numberofreminders: {
        type: Number,
    },

    clienttasks: [{
        type: Array
    }],
    
    active: {
        type: Boolean,
        default: true
    },
  
}, { timestamps: true });

const AccountwiseChat = mongoose.model('AccountwiseChat', AccountwiseChatSchema);
module.exports = AccountwiseChat;