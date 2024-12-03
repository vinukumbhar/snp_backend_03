// const mongoose = require('mongoose');

// const accountSchema = new mongoose.Schema({
//     clientType: {
//         type: String,
//         required: [true, 'Client type is required'],

//     },
//     accountName: {
//         type: String,
//         required: [true, 'Account name is required'],
//     },

//     tags: [{
//         type: mongoose.Schema.Types.ObjectId,
//         type: Array,
//         ref: 'Tags',
//        // required: true
// }],

// teamMember: [{
//         type: Array,
//         type: mongoose.Schema.Types.ObjectId, ref: 'User',
//         required: [true, 'Team members are required'],
//     }],

//     // foldertemplate: {
//     //     type: String
//     // },

// }, { timestamps: true });

// // Collection
// const Accounts = mongoose.model('Accounts', accountSchema);
// module.exports = Accounts;

const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    clientType: {
      type: String,
      required: [true, "Client type is required"],
    },
    accountName: {
      type: String,
      required: [true, "Account name is required"],
    },

    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        // type: Array,
        ref: "Tags",
        // required: true
      },
    ],

    teamMember: [
      {
        type: Array,
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Team members are required"],
      },
    ],

    // foldertemplate: {
    //     type: String
    // },
    contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contacts",
        // required    : [true, 'Contacts are required'],
      },
    ],
    description: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },

    companyAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companyAddress", // Ensure this matches your CompanyAddresses model
    },
  },
  { timestamps: true }
);

// Collection
const Accounts = mongoose.model("Accounts", accountSchema);
module.exports = Accounts;
