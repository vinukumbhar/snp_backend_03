// const mongoose = require("mongoose");

// const permissionSchema = new mongoose.Schema({
//   canView: { type: Boolean, default: true },
//   canDownload: { type: Boolean, default: true },
//   canDelete: { type: Boolean, default: false },
//   canUpdate: { type: Boolean, default: false },
// }, { _id: false });  // Prevents auto-generation of _id for permission subdocument

// const FileSchema = new mongoose.Schema(
//   {
//     filename: { type: String, required: true },
//     filePath: { type: String, required: true },
    
//     permissions: { 
//       type: permissionSchema, 
//       required: true, 
//       default: () => ({})  // Sets default permissions if not provided
//     },
//   },
//   { timestamps: true }  // Automatically adds createdAt and updatedAt fields
// );

// module.exports = mongoose.model("File", FileSchema);


const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
  canView: { type: Boolean, default: true },
  canDownload: { type: Boolean, default: true },
  canDelete: { type: Boolean, default: false },
  canUpdate: { type: Boolean, default: false },
}, { _id: false });

const FileSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    filePath: { type: String, required: true },
    
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },

    permissions: { 
      type: permissionSchema, 
      required: true, 
      default: () => ({})
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("File", FileSchema);
