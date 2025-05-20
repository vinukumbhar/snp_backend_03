
const { mongoose } = require('mongoose');


const contactSchema = new mongoose.Schema({
    firstName: {
        type: String
    },
    middleName: {
        type: String
    },
    lastName: {
        type: String
    },
    contactName: {
        type: String,
        required: [true, 'Contact name is required'],
    },
    companyName: {
        type: String
    },
    note: {
        type: String
    },
    ssn: {
        type: Number
    },
    email: {
        // type: String,
        // validate: {
        //     validator: (value) => /\S+@\S+\.\S+/.test(value),
        //     message: 'Invalid email format',
        // },
        type: String,
        // trim: true,
        validate: {
            validator: function (value) {
                // Allow empty email (optional) or validate proper email format
                return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message: "Invalid email format",
        },
    },
    login: {
        type: Boolean,
    //    default : false
    },
    notify: {
        type: Boolean,
        // default : false
    },
    emailSync: {
        type: Boolean,
        // default : false
    },
    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        
        ref: 'tag',
        // required: true
    }],


    country: {
        name: {
            type: String,
      
        },
        code: {
            type: String,
           
        }
    },
    
    streetAddress: {
        type: String,
    
    },
    city: {
        type: String,
      
    },
    state: {
        type: String,
       
    },
    postalCode: {
        type: Number,
       
    },
    // phoneNumbers: [
    //     {
    //         type: Array,


    //     }
    // ],
phoneNumbers: [
  {
    phone: {
      type: Number,
    
    },
    country: {
      type: String,
      
    },
    countryCode:{
        type:Number
    }
 
  }
],
    accountid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Accounts',
        // required: true
    },
    
    description: {
        type: String
    },
    
    active: {
        type: Boolean,
        default: true,
    },

}, { timestamps: true })

// collection
const Contacts = new mongoose.model("Contacts", contactSchema)
module.exports = Contacts;