

const Invoice = require("../models/invoiceModel");
const mongoose = require("mongoose");
const Accounts = require("../models/AccountModel"); // Ensure the path is correct
const User = require("../models/userModel"); // Import User if not already imported
const InvoiceTemplate = require("../models/invoiceTemplateModel"); // Import if used
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const Contacts = require("../models/contactsModel")
const fs = require("fs");
const puppeteer = require("puppeteer");
const path = require("path");
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
// const { constants } = require('buffer');




 // Get the current date
 const currentDate = new Date();
 const lastDay = new Date(currentDate);
 lastDay.setDate(lastDay.getDate() - 1); // Subtract 1 day to get the last day
 const nextDay = new Date(currentDate);
 nextDay.setDate(nextDay.getDate() + 1); // Add 1 day to get the next day

 // Define options for formatting date
 const options = {
     weekday: 'long',          // Full name of the day of the week (e.g., "Monday")
     day: '2-digit',          // Two-digit day of the month (01 through 31)
     month: 'long',           // Full name of the month (e.g., "January")
     year: 'numeric',         // Four-digit year (e.g., 2022)
     week: 'numeric',         // ISO week of the year (1 through 53)
     monthNumber: '2-digit',  // Two-digit month number (01 through 12)
     quarter: 'numeric',      // Quarter of the year (1 through 4)
 };

 // Format the current date using options
 const currentFullDate = currentDate.toLocaleDateString('en-US', options);
 const currentDayNumber = currentDate.getDate();
 const currentDayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
 const currentWeek = currentDate.toLocaleDateString('en-US', { week: 'numeric' });
 const currentMonthNumber = currentDate.getMonth() + 1; // Months are zero-based, so add 1
 const currentMonthName = currentDate.toLocaleDateString('en-US', { month: 'long' });
 const currentQuarter = Math.floor((currentDate.getMonth() + 3) / 3); // Calculate the quarter
 const currentYear = currentDate.getFullYear();

 // Format the last day using options
 const lastDayFullDate = lastDay.toLocaleDateString('en-US', options);
 const lastDayNumber = lastDay.getDate();
 const lastDayName = lastDay.toLocaleDateString('en-US', { weekday: 'long' });
 const lastWeek = lastDay.toLocaleDateString('en-US', { week: 'numeric' });
 const lastMonthNumber = lastDay.getMonth() + 1; // Months are zero-based, so add 1
 const lastMonthName = lastDay.toLocaleDateString('en-US', { month: 'long' });
 const lastQuarter = Math.floor((lastDay.getMonth() + 3) / 3); // Calculate the quarter
 const lastYear = lastDay.getFullYear();

 // Format the next day using options
 const nextDayFullDate = nextDay.toLocaleDateString('en-US', options);
 const nextDayNumber = nextDay.getDate();
 const nextDayName = nextDay.toLocaleDateString('en-US', { weekday: 'long' });
 const nextWeek = nextDay.toLocaleDateString('en-US', { week: 'numeric' });
 const nextMonthNumber = nextDay.getMonth() + 1; // Months are zero-based, so add 1
 const nextMonthName = nextDay.toLocaleDateString('en-US', { month: 'long' });
 const nextQuarter = Math.floor((nextDay.getMonth() + 3) / 3); // Calculate the quarter
 const nextYear = nextDay.getFullYear();
//get all Invoice
// const getInvoices = async (req, res) => {
//   try {
//     const invoice = await Invoice.find({}).sort({ createdAt: -1 });
//     res.status(200).json({ message: "Invoices retrieved successfully", invoice });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

const getInvoices = async (req, res) => {
  try {
    const invoice = await Invoice.find({})
      .sort({ createdAt: -1 })
      .populate('account'); // populates the 'account' field with data from Account collection

    res.status(200).json({ message: "Invoices retrieved successfully", invoice });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getInvoiceSummary = async (req, res) => {
  try {
    const summary = await Invoice.aggregate([
      {
        $group: {
          _id: "$invoiceStatus",
          totalAmount: { $sum: "$summary.total" },
          paidAmount: { $sum: { $ifNull: ["$paidAmount", 0] } },
          balanceDueAmount: { 
            $sum: { 
              $subtract: ["$summary.total", { $ifNull: ["$paidAmount", 0] }] 
            }
          }
        }
      }
    ]);

    res.status(200).json({ message: "Invoice summary retrieved", summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getInvoiceCountByStatus = async (req, res) => {
  try {
    const invoiceCounts = await Invoice.aggregate([
      {
        $group: {
          _id: "$invoiceStatus",
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({ message: "Invoice count retrieved successfully", invoiceCounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Get a single Invoice
const getInvoice = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid Invoice ID" });
  }

  try {
    const invoice = await Invoice.findById(id).populate({
      path: "account",
      model: "Accounts",
    });

    if (!invoice) {
      return res.status(404).json({ error: "No such Invoice" });
    }

    res.status(200).json({ message: "Invoice retrieved successfully", invoice });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error.message);
  }
};


// Get job count
const getInvoicesCount = async (req, res) => {
  try {
    const invoiceCount = await Invoice.countDocuments(); // Get count of all jobs
    res.status(200).json({ message: "Job count retrieved successfully", count: invoiceCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//POST a new Invoice
// const createInvoice = async (req, res) => {
//   const { account, invoicenumber, invoicedate, description, invoicetemplate, paymentMethod, teammember, emailinvoicetoclient, reminders, daysuntilnextreminder, numberOfreminder, scheduleinvoice, scheduleinvoicedate, scheduleinvoicetime, payInvoicewithcredits, lineItems, summary, active } = req.body;

//   try {
//     const existingInvoice = await Invoice.findOne({
//       invoicenumber,
//     });

//     if (existingInvoice) {
//       return res.status(201).json({ message: "Invoice already exists" });
//     }
//     const newInvoice = await Invoice.create({
//       account,
//       invoicenumber,
//       invoicedate,
//       description,
//       invoicetemplate,
//       paymentMethod,
//       teammember,
//       emailinvoicetoclient,
//       reminders,
//       daysuntilnextreminder,
//       numberOfreminder,
//       scheduleinvoice,
//       scheduleinvoicedate,
//       scheduleinvoicetime,
//       payInvoicewithcredits,
//       lineItems,
//       summary,
//       active,
//     });

//     return res.status(201).json({ message: "Invoice created successfully", newInvoice });
//   } catch (error) {
//     console.error("Error creating Invoice:", error);
//     return res.status(500).json({ error: "Error creating Invoice", error });
//   }
// };

// sends email

const createInvoice = async (req, res) => {
  const {
      account, invoicedate, description, invoicetemplate, paymentMethod, teammember, emailinvoicetoclient,
      reminders, daysuntilnextreminder, numberOfreminder, scheduleinvoice, scheduleinvoicedate, scheduleinvoicetime,
      payInvoicewithcredits, lineItems, summary, active,paidAmount,invoiceStatus,balanceDueAmount
  } = req.body;

  try {
 

      // Create a new invoice
      const newInvoice = await Invoice.create({
          account, invoicedate, description, invoicetemplate, paymentMethod, teammember, emailinvoicetoclient,
          reminders, daysuntilnextreminder, numberOfreminder, scheduleinvoice, scheduleinvoicedate, scheduleinvoicetime,
          payInvoicewithcredits, lineItems, summary, active,paidAmount,invoiceStatus,balanceDueAmount
      });

      console.log(newInvoice)

      const accountinv = await Accounts.findById(account).populate("contacts");
      if (!accountinv) {
          return res.status(404).json({ status: 404, message: "Account not found." });
      }

     

      // Filter valid contacts
      const validContacts = accountinv.contacts.filter(contact => contact.emailSync);
      if (validContacts.length === 0) {
          return res.status(400).json({ status: 400, message: "No contacts with emailSync enabled." });
      }

      const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false, // Use STARTTLS
          auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false
        },
      });

      // // Ensure the invoices directory exists
      // const invoicesDir = path.resolve(__dirname, "invoices");
      // if (!fs.existsSync(invoicesDir)) {
      //     fs.mkdirSync(invoicesDir, { recursive: true });
      // }

      // // Generate PDF for the invoice
      // const pdfPath = path.join(invoicesDir, `invoice_${newInvoice.invoicenumber}.pdf`);

      // console.log("PDF successfully written to:", pdfPath);
      const replacePlaceholders = (template, data) => {
        return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
            return data[placeholder.trim()] || '';
        });
    };
      const emailPromises = validContacts.map(async (contact) => {

          const newdescription = replacePlaceholders(description, {
              ACCOUNT_NAME: accountinv.accountName,
              FIRST_NAME: contact.firstName,
              MIDDLE_NAME: contact.middleName,
              LAST_NAME: contact.lastName,
              CONTACT_NAME: contact.contactName,
              COMPANY_NAME: contact.companyName,
              COUNTRY: contact.country,
              STREET_ADDRESS: contact.streetAddress,
              STATEPROVINCE: contact.state,
              PHONE_NUMBER: contact.phoneNumbers,
              ZIPPOSTALCODE: contact.postalCode,
              CITY: contact.city,
              CURRENT_DAY_FULL_DATE: currentFullDate,
              CURRENT_DAY_NUMBER: currentDayNumber,
              CURRENT_DAY_NAME: currentDayName,
              CURRENT_WEEK: currentWeek,
              CURRENT_MONTH_NUMBER: currentMonthNumber,
              CURRENT_MONTH_NAME: currentMonthName,
              CURRENT_QUARTER: currentQuarter,
              CURRENT_YEAR: currentYear,
              LAST_DAY_FULL_DATE: lastDayFullDate,
              LAST_DAY_NUMBER: lastDayNumber,
              LAST_DAY_NAME: lastDayName,
              LAST_WEEK: lastWeek,
              LAST_MONTH_NUMBER: lastMonthNumber,
              LAST_MONTH_NAME: lastMonthName,
              LAST_QUARTER: lastQuarter,
              LAST_YEAR: lastYear,
              NEXT_DAY_FULL_DATE: nextDayFullDate,
              NEXT_DAY_NUMBER: nextDayNumber,
              NEXT_DAY_NAME: nextDayName,
              NEXT_WEEK: nextWeek,
              NEXT_MONTH_NUMBER: nextMonthNumber,
              NEXT_MONTH_NAME: nextMonthName,
              NEXT_QUARTER: nextQuarter,
              NEXT_YEAR: nextYear,
              
          });

          const printContent = `
          <html>
          <head>
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      padding: 35px;
                  }
                  h1 {
                      color: #333;
                  }
                  p {
                      color: #555;
                  }
                  table {
                      width: 100%;
                      border-collapse: collapse;
                      margin-top: 20px;
                  }
                  th, td {
                      border: 1px solid #ddd;
                      padding: 8px;
                      text-align: left;
                  }
                  th {
                      background-color: #f2f2f2;
                  }
                  .summary-table {
                      width: 50%;
                      margin-left: auto;
                      margin-top: 20px;
                  }
                  .total-row td {
                      font-weight: bold;
                  }
              </style>
          </head>
          <body>
              <h1>Invoice Number #${newInvoice.invoicenumber}</h1>
              <p><strong>Date:</strong> ${new Date(newInvoice.invoicedate).toLocaleDateString()}</p>
              <p><strong>${accountinv.accountName}</strong></p>
              <p><strong>Description:</strong> ${newdescription}</p>
              <table>
                  <thead>
                      <tr>
                          <th>Product/Service</th>
                          <th>Rate</th>
                          <th>Quantity</th>
                          <th>Amount</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${newInvoice.lineItems
                  .map(item => `
                              <tr>
                                  <td>${item.productorService}</td>
                                  <td>$${item.rate}</td>
                                  <td>${item.quantity}</td>
                                  <td>$${item.amount}</td>
                              </tr>
                          `)
                  .join("")}
                  </tbody>
              </table>
              <table class="summary-table">
                  <tr>
                      <td><strong>Subtotal</strong></td>
                      <td>$${newInvoice.summary.subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                      <td><strong>Tax</strong></td>
                      <td>$${newInvoice.summary.taxTotal.toFixed(2)}</td>
                  </tr>
                  <tr class="total-row">
                      <td><strong>Total</strong></td>
                      <td>$${newInvoice.summary.total.toFixed(2)}</td>
                  </tr>
              </table>
          </body>
          </html>
      `;

          // Generate PDF with Puppeteer
          // const browser = await puppeteer.launch();
          // const page = await browser.newPage();
          // await page.setContent(printContent, { waitUntil: "networkidle0" });
          // await page.pdf({ path: pdfPath, format: "A4" });
          // await browser.close();

          console.log(`Preparing to send email to: ${contact.email}`);
          const mailOptions = {
              from: process.env.EMAIL, // Sender's email
              to: contact.email, // Recipient's email
              subject: "Invoice Created", // Subject of the email
              text: `Dear ${accountinv.accountName},\n\nYour invoice has been created.\n\nBest regards,`, // Plain text content
              // html: printContent, // HTML content of the email
              attachments: [
                  {
                      filename: `invoice_${newInvoice.invoicenumber}.pdf`, // Filename for the attachment
                      // path: pdfPath // Path to the P.DF file
                  }
              ]
          };

          try {
              const result = await transporter.sendMail(mailOptions);
              return result;
          } catch (error) {
              console.error(`Failed to send email to ${contact.email}:`, error.message);
              throw error;
          }
      });

      console.log("Waiting for all emails to complete...");
      await Promise.all(emailPromises);

      console.log("All emails sent successfully.");
      return res.status(201).json({ message: "Invoice created successfully", newInvoice });
  } catch (error) {
      console.error("Error creating Invoice:", error);
      return res.status(500).json({ error: "Error creating Invoice", details: error.message });
  }
};


//delete a Invoice
const deleteInvoice = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid Invoice ID" });
  }

  try {
    const deletedInvoice = await Invoice.findByIdAndDelete({ _id: id });
    if (!deletedInvoice) {
      return res.status(404).json({ error: "No such Invoice" });
    }
    res.status(200).json({ message: "Invoice deleted successfully", deletedInvoice });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//update a new Invoice
const updateInvoice = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid Invoice ID" });
  }

  try {
    const updatedInvoice = await Invoice.findOneAndUpdate({ _id: id }, { ...req.body }, { new: true });

    if (!updatedInvoice) {
      return res.status(404).json({ error: "No such Invoice" });
    }

    res.status(200).json({ message: "Invoice Updated successfully", updatedInvoice });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
// Update invoice by invoiceStatus
const updateInvoiceByStatus = async (req, res) => {
  const { invoicenumber } = req.params;
  const { invoiceStatus } = req.body;

  if (!invoiceStatus) {
    return res.status(400).json({ error: "Invoice status is required." });
  }

  try {
    const updatedInvoice = await Invoice.findOneAndUpdate(
      { invoicenumber },
      { invoiceStatus },
      { new: true }
    );

    if (!updatedInvoice) {
      return res.status(404).json({ error: "No such Invoice" });
    }

    res.status(200).json({ message: "Invoice status updated successfully", updatedInvoice });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Get a single InvoiceList List
const getInvoiceList = async (req, res) => {
  const invoiceList = [];
  try {
    const invoice = await Invoice.find().populate({ path: "account", model: "account" }).populate({ path: "teammember", model: "User" });

    const account = invoice.account.map(accountname);
    const Assignee = invoice.teammember.map(teammember);

    invoiceList.push({
      clientname: account.accountname,
      clientid: account._id,
      invoice: invoice.invoicenumber,
      status: "",
      assigneename: Assignee.username,
      assigneeid: Assignee._id,
      posted: "",
      amount: invoice.amount,
      paid: "",
      description: invoice.description,
    });

    res.status(200).json({ message: "Invoice retrieved successfully", invoiceList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Get a single InvoiceList List
const getInvoiceListbyid = async (req, res) => {
  const { id } = req.params;

  try {
    const invoice = await Invoice.findById(id)
      .populate({ path: "account", model: "Accounts" }) // Ensure model name matches exactly
      .populate({ path: "invoicetemplate", model: "InvoiceTemplate" })
      .populate({ path: "teammember", model: "User" });

    res.status(200).json({ message: "Invoice retrieved successfully", invoice });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single InvoiceList by Account ID

const getInvoiceListbyAccountid = async (req, res) => {
  const { id } = req.params; // Destructuring the account ID

  try {
      const invoice = await Invoice.find({ account: id }).sort({ createdAt: -1 }).populate('account'); // Fetch invoices for the account

      if (!invoice || invoice.length === 0) {
          return res.status(404).json({ message: "No invoices found for this account." });
      }

      // Fetch additional data for placeholders
      const account = await Accounts.findById(id).populate("contacts");
 
      const validContact = account.contacts.filter(contact => contact.emailSync);

      const currentDate = new Date();

      // Define placeholder values
      const placeholderValues = {
          ACCOUNT_NAME: account?.accountName || '',
          FIRST_NAME: validContact[0]?.firstName || '',
          MIDDLE_NAME: validContact[0]?.middleName || '',
          LAST_NAME: validContact[0]?.lastName || '',
          CONTACT_NAME: validContact[0]?.contactName || '',
          COMPANY_NAME: validContact[0]?.companyName || '',
          COUNTRY: validContact[0]?.country || '',
          STREET_ADDRESS: validContact[0]?.streetAddress || '',
          STATEPROVINCE: validContact[0]?.state || '',
          PHONE_NUMBER: validContact[0]?.phoneNumbers || '',
          ZIPPOSTALCODE: validContact[0]?.postalCode || '',
          CITY: validContact[0]?.city || '',
          CURRENT_DAY_FULL_DATE: currentDate.toLocaleDateString(),
          CURRENT_DAY_NUMBER: currentDate.getDate(),
          CURRENT_DAY_NAME: currentDate.toLocaleString('default', { weekday: 'long' }),
          CURRENT_MONTH_NUMBER: currentDate.getMonth() + 1,
          CURRENT_MONTH_NAME: currentDate.toLocaleString('default', { month: 'long' }),
          CURRENT_YEAR: currentDate.getFullYear(),
          // Add other dynamic placeholders as required
      };

      // Function to replace placeholders in text
      const replacePlaceholders = (template, data) => {
          return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
              return data[placeholder.trim()] || '';
          });
      };

      // Update each invoice's description with placeholders replaced
      const updatedInvoices = invoice.map((inv) => {
          const updatedDescription = replacePlaceholders(inv.description || '', placeholderValues);
          return {
              ...inv.toObject(),
              description: updatedDescription, // Replace description with the updated version
          };
      });

      res.status(200).json({
          message: "Invoices retrieved successfully",
          invoice: updatedInvoices,
      });

  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};
const getInvoiceforPrint = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Invalid Invoice ID" });
  }

  try {
      const invoice = await Invoice.findById(id);
   
      const account = await Accounts.findById(invoice.account).populate("contacts");

      const validContact = account.contacts.filter(contact => contact.emailSync);
                 // Define placeholder values
      const placeholderValues = {
          ACCOUNT_NAME: account?.accountName || '',
          FIRST_NAME: validContact[0]?.firstName || '',
          MIDDLE_NAME: validContact[0]?.middleName || '',
          LAST_NAME: validContact[0]?.lastName || '',
          CONTACT_NAME: validContact[0]?.contactName || '',
          COMPANY_NAME: validContact[0]?.companyName || '',
          COUNTRY: validContact[0]?.country || '',
          STREET_ADDRESS: validContact[0]?.streetAddress || '',
          STATEPROVINCE: validContact[0]?.state || '',
          PHONE_NUMBER: validContact[0]?.phoneNumbers || '',
          ZIPPOSTALCODE: validContact[0]?.postalCode || '',
          CITY: validContact[0]?.city || '',
          CURRENT_DAY_FULL_DATE: currentDate.toLocaleDateString(),
          CURRENT_DAY_NUMBER: currentDate.getDate(),
          CURRENT_DAY_NAME: currentDate.toLocaleString('default', { weekday: 'long' }),
          CURRENT_MONTH_NUMBER: currentDate.getMonth() + 1,
          CURRENT_MONTH_NAME: currentDate.toLocaleString('default', { month: 'long' }),
          CURRENT_YEAR: currentDate.getFullYear(),
          LAST_DAY_FULL_DATE: lastDayFullDate,
          LAST_DAY_NUMBER: lastDayNumber,
          LAST_DAY_NAME: lastDayName,
          LAST_WEEK: lastWeek,
          LAST_MONTH_NUMBER: lastMonthNumber,
          LAST_MONTH_NAME: lastMonthName,
          LAST_QUARTER: lastQuarter,
          LAST_YEAR: lastYear,
          NEXT_DAY_FULL_DATE: nextDayFullDate,
          NEXT_DAY_NUMBER: nextDayNumber,
          NEXT_DAY_NAME: nextDayName,
          NEXT_WEEK: nextWeek,
          NEXT_MONTH_NUMBER: nextMonthNumber,
          NEXT_MONTH_NAME: nextMonthName,
          NEXT_QUARTER: nextQuarter,
          NEXT_YEAR: nextYear,
          // Add other dynamic placeholders as required
      };

      // Function to replace placeholders in text
      const replacePlaceholders = (template, data) => {
          return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
              return data[placeholder.trim()] || '';
          });
      };

      // Update each invoice's description with placeholders replaced
      invoice.description = replacePlaceholders(invoice.description || '', placeholderValues);

      if (!invoice) {
          return res.status(404).json({ error: "No such Invoice" });
      }

      res.status(200).json({ message: "Invoice retrieved successfully", invoice });
  } catch (error) {
      res.status(500).json({ error: error.message });
      console.log(error.message)
    }
};

const deleteInvoicesByAccountId = async (req, res) => {
  const { id } = req.params;

  try {
    const deleteResult = await Invoice.deleteMany({ account: id });

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ message: "No invoices found for this account." });
    }

    res.status(200).json({
      message: "Invoices deleted successfully",
      deletedCount: deleteResult.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getPendingInvoicesByAccountId = async (req, res) => {
  const { id } = req.params; // Account ID from params

  try {
    // Fetch only pending invoices for the given account ID
    const invoices = await Invoice.find({ account: id, invoiceStatus: "Pending" }).sort({ createdAt: -1 }).populate('account');

    if (!invoices || invoices.length === 0) {
      return res.status(404).json({ message: "No pending invoices found for this account." });
    }

    // Fetch account and related contacts
    const account = await Accounts.findById(id).populate("contacts");
    const validContact = account.contacts.filter(contact => contact.emailSync);

    const currentDate = new Date();

    // Placeholder values
    const placeholderValues = {
      ACCOUNT_NAME: account?.accountName || '',
      FIRST_NAME: validContact[0]?.firstName || '',
      MIDDLE_NAME: validContact[0]?.middleName || '',
      LAST_NAME: validContact[0]?.lastName || '',
      CONTACT_NAME: validContact[0]?.contactName || '',
      COMPANY_NAME: validContact[0]?.companyName || '',
      COUNTRY: validContact[0]?.country || '',
      STREET_ADDRESS: validContact[0]?.streetAddress || '',
      STATEPROVINCE: validContact[0]?.state || '',
      PHONE_NUMBER: validContact[0]?.phoneNumbers || '',
      ZIPPOSTALCODE: validContact[0]?.postalCode || '',
      CITY: validContact[0]?.city || '',
      CURRENT_DAY_FULL_DATE: currentDate.toLocaleDateString(),
      CURRENT_DAY_NUMBER: currentDate.getDate(),
      CURRENT_DAY_NAME: currentDate.toLocaleString('default', { weekday: 'long' }),
      CURRENT_MONTH_NUMBER: currentDate.getMonth() + 1,
      CURRENT_MONTH_NAME: currentDate.toLocaleString('default', { month: 'long' }),
      CURRENT_YEAR: currentDate.getFullYear(),
    };

    // Function to replace placeholders
    const replacePlaceholders = (template, data) => {
      return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
        return data[placeholder.trim()] || '';
      });
    };

    // Replace placeholders in invoice descriptions
    const updatedInvoices = invoices.map((inv) => {
      const updatedDescription = replacePlaceholders(inv.description || '', placeholderValues);
      return {
        ...inv.toObject(),
        description: updatedDescription,
      };
    });

    res.status(200).json({
      message: "Pending invoices retrieved successfully",
      invoice: updatedInvoices,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const cron = require('node-cron');

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Function to check overdue invoices and send reminders
async function checkOverdueInvoicesAndSendReminders() {
    try {
        const now = new Date();
        
        // Find all pending invoices where due date has passed
        const overdueInvoices = await Invoice.find({
            invoiceStatus: 'Pending',
            invoicedate: { $lt: now }
        });

        for (const invoice of overdueInvoices) {
            const dueDate = new Date(invoice.invoicedate);
            const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
            
            // Check if it's time to send a reminder based on daysuntilnextreminder
            if (daysOverdue > 0 && daysOverdue % invoice.daysuntilnextreminder === 0) {
                // Check if we haven't exceeded the numberOfreminder
                const remindersSent = invoice.remindersSent || 0;
                if (remindersSent < invoice.numberOfreminder) {
                    await sendReminderEmail(invoice, daysOverdue, remindersSent + 1);
                    
                    // Update the invoice with the number of reminders sent
                    invoice.remindersSent = remindersSent + 1;
                    await invoice.save();
                }
            }
        }
    } catch (error) {
        console.error('Error processing overdue invoices:', error);
    }
}

// Function to send reminder emails
// async function sendReminderEmail(invoice, daysOverdue, reminderNumber) {
//     const totalAmount = invoice.summary.total;
//     const dueDate = new Date(invoice.invoicedate).toLocaleDateString();
    
//     // Email content
//     const mailOptions = {
//         from: process.env.EMAIL,
//         to: [process.env.ADMIN_EMAIL], // Client and admin emails
//         subject: `#Reminder ${reminderNumber}: Invoice #${invoice.invoicenumber} Overdue`,
//         html: `
//             <h2>Invoice Overdue Reminder</h2>
//             <p>This is a reminder that Invoice #${invoice.invoencumber} is overdue.</p>
//             <p><strong>Due Date:</strong> ${dueDate}</p>
//             <p><strong>Days Overdue:</strong> ${daysOverdue}</p>
//             <p><strong>Amount Due:</strong> $${totalAmount.toFixed(2)}</p>
//             <p><strong>Description:</strong> ${invoice.description}</p>
//             <p>Please make the payment at your earliest convenience.</p>
//             <p>This is reminder ${reminderNumber} of ${invoice.numberOfreminder}.</p>
//         `
//     };

//     try {
//         await transporter.sendMail(mailOptions);
//         console.log(`Reminder ${reminderNumber} sent for invoice #${invoice.invoicenumber}`);
//     } catch (error) {
//         console.error(`Error sending reminder for invoice #${invoice.invoicenumber}:`, error);
//     }
// }

// // Schedule the job to run daily at 9 AM
// // cron.schedule('0 9 * * *', checkOverdueInvoicesAndSendReminders, {
// //     scheduled: true,
// //     timezone: "America/New_York" // Set your timezone
// // });

// // Schedule the job to run daily at 5:05 PM India Time (IST)
// cron.schedule('52 17 * * *', checkOverdueInvoicesAndSendReminders, {
//     scheduled: true,
//     timezone: "Asia/Kolkata"  // India's timezone
// });
// console.log('Invoice reminder scheduler started...');

// Verify email connection
transporter.verify()
    .then(() => console.log('✅ Email service ready'))
    .catch(err => console.error('❌ Email setup failed:', err));

async function checkAndNotifyOverdueInvoices() {
    const now = new Date();
    console.log(`\n[${now.toLocaleString()}] Checking overdue invoices...`);

    try {
        // Find invoices that are pending and past due
        const overdueInvoices = await Invoice.find({
            invoiceStatus: 'Overdue',
            // invoicedate: { $lt: now }
        }).populate({
      path: "account",
      model: "Accounts",
    }); // Get account name

        console.log(`Found ${overdueInvoices.length} overdue invoices`);

        // Group by account for consolidated email
        const accountsWithOverdueInvoices = {};
        overdueInvoices.forEach(invoice => {
            const accountName = invoice.account?.accountName || 'Unknown Account';
            if (!accountsWithOverdueInvoices[accountName]) {
                accountsWithOverdueInvoices[accountName] = [];
            }
            accountsWithOverdueInvoices[accountName].push({
                number: invoice.invoicenumber,
                amount: invoice.summary.total.toFixed(2),
                dueDate: new Date(invoice.invoicedate).toLocaleDateString()
            });
        });

        // Send one consolidated email to admin
        if (Object.keys(accountsWithOverdueInvoices).length > 0) {
            await sendOverdueAlertToAdmin(accountsWithOverdueInvoices);
        } else {
            console.log('No overdue invoices to notify');
        }
    } catch (error) {
        console.error('Error processing invoices:', error);
    }
}

async function sendOverdueAlertToAdmin(accountsWithInvoices) {
    if (!process.env.ADMIN_EMAIL) {
        console.error('ADMIN_EMAIL not configured');
        return;
    }

    // Build email content
    // let emailHtml = `
    //     <h2>Overdue Invoices Report</h2>
    //     <p>The following invoices are currently overdue:</p>
    //     <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse;">
    //         <tr>
    //             <th>Account</th>
    //             <th>Invoice #</th>
    //             <th>Amount</th>
                
    //         </tr>
    // `;

    // for (const [accountName, invoices] of Object.entries(accountsWithInvoices)) {
    //     invoices.forEach(invoice => {
    //         emailHtml += `
    //             <tr>
    //                 <td>${accountName}</td>
    //                 <td>${invoice.number}</td>
    //                 <td>$${invoice.amount}</td>
                   
    //             </tr>
    //         `;
    //     });
    // }

    // emailHtml += `</table>`;
let emailHtml = `
    <h2>Overdue Invoices Report</h2>
    <p>The following invoices are currently overdue:</p>
`;

for (const [accountName, invoices] of Object.entries(accountsWithInvoices)) {
    invoices.forEach(invoice => {
        emailHtml += `
            <p>
                <strong>Account:</strong> ${accountName}<br>
                <strong>Invoice #:</strong> ${invoice.number}<br>
                <strong>Amount:</strong> $${invoice.amount}
            </p>
            <hr>
        `;
    });
}
    const mailOptions = {
        from: `"Billing System" <${process.env.EMAIL}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `#Overdue Invoices Alert (${Object.keys(accountsWithInvoices).length} accounts)`,
        html: emailHtml,
        text: `Overdue invoices report is available in HTML format`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Overdue invoice alert sent to admin');
    } catch (error) {
        console.error('Failed to send alert:', error);
    }
}

// Run daily at 9 AM (adjust time as needed)
cron.schedule('05 5 * * *', checkAndNotifyOverdueInvoices, {
    timezone: "Asia/Kolkata"
});
module.exports = {
  getInvoiceCountByStatus,
  getInvoiceSummary,
  createInvoice,
  getInvoices,
  getInvoice,
  getInvoicesCount,
  deleteInvoice,
  updateInvoice,
  updateInvoiceByStatus,
  getInvoiceList,
  getInvoiceListbyid,
  getInvoiceListbyAccountid,
  getInvoiceforPrint,
  deleteInvoicesByAccountId,getPendingInvoicesByAccountId
};
