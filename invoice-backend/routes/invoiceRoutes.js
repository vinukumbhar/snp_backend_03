// const express = require('express')
// const router = express.Router()

// const { getInvoices, getInvoice, createInvoice, deleteInvoice, updateInvoice, getInvoiceList, getInvoiceListbyid } = require('../controller/invoiceController')

// router.get('/invoice', getInvoices)
// router.get('/invoice/:id', getInvoice)
// router.post('/invoice', createInvoice)
// router.delete('/invoice/:id', deleteInvoice)
// router.patch('/invoice/:id', updateInvoice)
// router.get('/invoice/invoicelist', getInvoiceList)
// router.get('/invoice/invoicelist/invoicelistbyid/:id', getInvoiceListbyid)

// module.exports = router

const express = require("express");
const router = express.Router();

const { getInvoices, getInvoice, createInvoice, deleteInvoice, updateInvoice, getInvoiceList, getInvoiceListbyid, getInvoiceListbyAccountid } = require("../controller/invoiceController");

router.get("/invoice", getInvoices);
router.get("/invoice/:id", getInvoice);
router.post("/invoice", createInvoice);
router.delete("/invoice/:id", deleteInvoice);
router.patch("/invoice/:id", updateInvoice);
router.get("/invoice/invoicelist", getInvoiceList);
router.get("/invoice/invoicelist/invoicelistbyid/:id", getInvoiceListbyid);
router.get("/invoice/invoicelistby/accountid/:id", getInvoiceListbyAccountid);

module.exports = router;
