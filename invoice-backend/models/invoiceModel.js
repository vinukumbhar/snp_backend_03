const mongoose = require('mongoose');

// Define the lineItems Schema 
const lineItemsSchema = new mongoose.Schema({
    productorService: {
        type: String,
        // required: [true, 'Notification description is required'], // Validation for required notification description
    },
    description: {
        type: String,
    },
    rate: {
        type: Number,
    },
    quantity: {
        type: Number,
    },
    amount: {
        type: Number,
    },
    tax: {
        type: Boolean,
    }
});


// Define the lineItems Schema 
const summarySchema = new mongoose.Schema({
    subtotal: {
        type: Number,
    },
    taxRate: {
        type: Number,
    },
    taxTotal: {
        type: Number,
    },
    total: {
        type: Number,
    },
  
});



const invoiceSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Accounts',
    },
    invoicenumber: {
        type: Number,
    },
    invoicedate: {
        type: Date,
    },
    description: {
        type: String,
    },

    invoicetemplate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InvoiceTemplate',
    },
    
    paymentMethod: {
        type: String,
    },

    teammember: {
        type: mongoose.Schema.Types.ObjectId,
        // ref: 'User',
    },
    payInvoicewithcredits: {
        type: Boolean,
    },

    emailinvoicetoclient: {
        type: Boolean,
    },
    reminders: {
        type: Boolean,
    },
    daysuntilnextreminder: {
        type: Number,
    },

    numberOfreminder: {
        type: Number,
    },
    scheduleinvoice: {
        type: Boolean,
    },
  
    scheduleinvoicedate: {
        type: Date,
    },

    scheduleinvoicetime: {
        type: String,
    },

    lineItems: {
        type: [lineItemsSchema]
    },

    summary: {
        type: summarySchema,
    },

}, { timestamps: true });

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;
