const Accounts = require('../models/AccountModel'); // Adjust the path to your actual model
const Tags = require('../models/tagModel');
const Contacts = require('../models/contactsModel');
const User = require('../models/userModel');
const companyAddress = require('../models/companyAddressModel');

// POST a new account
const createAccount = async (req, res) => {
    try {
        let newAccount;
        let newCompanyAccount;

        const { clientType, accountName, tags, teamMember, contacts,  active } = req.body;

        newAccount = await Accounts.create({ clientType, accountName, tags, teamMember, contacts,  active });

        if (clientType === 'Company') {
            const { companyName, country, streetAddress, city, state, postalCode, active } = req.body;

            newCompanyAccount = await companyAddress.create({ companyName, country, streetAddress, city, state, postalCode, companyId: newAccount._id, active });
        }

      

        res.status(200).json({
            message: "Account created successfully",
            newAccount,
            newCompanyAccount: newCompanyAccount ? {
                companyId: newCompanyAccount.companyId,
                companyName: newCompanyAccount.companyName,
                country: newCompanyAccount.country,
                streetAddress: newCompanyAccount.streetAddress,
                city: newCompanyAccount.city,
                state: newCompanyAccount.state,
                postalCode: newCompanyAccount.postalCode,
                active: newCompanyAccount.active
            } : null
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



//get all accounts
const getAccounts = async (req, res) => {
    try {
        const accounts = await Accounts.find({})
            .populate({ path: 'tags', model: 'Tags' })
            .populate({ path: 'teamMember', model: 'User' })
            .populate({ path: 'contacts', model: 'Contacts' });
        //sort({ createdAt: -1 });
        res.status(200).json({ message: "Accounts retrieved successfully", accounts })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}; 
//Get a single Account
const getAccount = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid Account ID" });
    }
    try {
        const account = await Accounts.findById(id);

        if (!account) {
            return res.status(404).json({ error: "No such Account" });
        }

        res.status(200).json({ message: "Account retrieved successfully", account });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//delete a Account

const deleteAccount = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid Account ID" });
    }

    try {
        const deletedAccount = await Accounts.findByIdAndDelete({ _id: id });
        if (!deletedAccount) {
            return res.status(404).json({ error: "No such Account" });
        }
        res.status(200).json({ message: "Account deleted successfully", deletedAccount });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

//update a new Account 
const updateAccount = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid Account ID" });
    }

    try {
        const updatedAccount = await Accounts.findOneAndUpdate(
            { _id: id },
            { ...req.body },
            { new: true }
        );

        if (!updatedAccount) {
            return res.status(404).json({ error: "No such Account" });
        }

        res.status(200).json({ message: "Account Updated successfully", updatedAccount });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
//get all accounts List
const getAccountsList = async (req, res) => {
    try {
        const accounts = await Accounts.find({})
            .populate({ path: 'tags', model: 'Tags' })
            .populate({ path: 'teamMember', model: 'User' })
            .populate({ path: 'contacts', model: 'Contacts' });


        const accountlist = accounts.map(account => {

            return {
                id: account._id,
                Name: account.accountName,
                Follow: "",
                Type: account.clientType,
                Invoices: "",
                Credits: "",
                Tasks: "",
                Team: account.teamMember,
                Tags: account.tags,
                Proposals: "",
                Unreadchats: "",
                Pendingorganizers: "",
                Pendingsignatures: "",
                Lastlogin: "",
            };
        });


        //sort({ createdAt: -1 });
        res.status(200).json({ message: "Accounts retrieved successfully", accountlist })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
};
//get all accounts List
const getAccountsListById = async (req, res) => {
    const { id } = req.params;
    
    try {
        const accounts = await Accounts.findById(id)
            .populate({ path: 'tags', model: 'Tags' })
            .populate({ path: 'teamMember', model: 'User' })
            .populate({ path: 'contacts', model: 'Contacts' });

            const accountlist = ({
                id: accounts._id,
                Name: accounts.accountName,
                Follow: "",
                Type: accounts.clientType,
                Invoices: "",
                Credits: "",
                Tasks: "",
                Team: accounts.teamMember,
                Tags: accounts.tags,
                Proposals: "",
                Unreadchats: "",
                Pendingorganizers: "",
                Pendingsignatures: "",
                Lastlogin: "",
                Contacts : accounts.contacts,
            });
        

       //sort({ createdAt: -1 });
        res.status(200).json({ message: "Accounts retrieved successfully", accountlist })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
};

module.exports = {
    createAccount,
    getAccount,
    getAccounts,
    updateAccount,
    deleteAccount,
    getAccountsList,
    getAccountsListById
}
