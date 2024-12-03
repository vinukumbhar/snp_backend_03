const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const clientSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
    trim: true,
  },
  middleName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
    trim: true,
  },
  accountName: {
    type: String,
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    min: 1000000000, // Minimum 10-digit number
    max: 9999999999, // Maximum 10-digit number
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure email is unique
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/, "Please fill a valid email address"], // Email format validation
  },
  password: {
    type: String,
    minlength: 6, // Minimum length of 6 characters
  },
  cpassword: {
    type: String,
     validate: {
      validator: function (v) {
        return this.password === v; // Ensure cpassword matches password
      },
      message: "Passwords do not match",
    },
  }
});

// Hash the password before saving
clientSchema.pre("save", async function (next) {
  if (!this.isModified("password", "cpassword")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.cpassword = await bcrypt.hash(this.cpassword, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const clientModel = mongoose.model("client", clientSchema);
module.exports = clientModel;