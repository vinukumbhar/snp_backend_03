const express = require('express')
const User = require('../Models/user')
const jqwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { check, validationResult } = require('express-validator');
const validator = require('validator')
const bcrypt = require('bcrypt');




const createToken = (_id, timeout) => {
    return jqwt.sign({ _id }, process.env.SECRET, { expiresIn: timeout })
}


function generateOTP() {
    return Math.floor(10000 + Math.random() * 90000).toString()
}

async function sendOTP(email, otp) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'tanmay3048@gmail.com',
            pass: 'fmmptucyjmwhvnpq',
        },
        tls: { rejectUnauthorized: false }
    });

    const mailOptions = {
        from: '"Your Name" <your-email@gmail.com>',
        to: email,
        subject: 'Your OTP for Verification',
        text: `Your OTP for verification is: ${otp}`,
        html: `<p>Your OTP for verification is: <strong>${otp}</strong></p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent');
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send OTP');
    }
}

//loginnnn
const loginuser = async (req, res) => {

    const { email, usrpassword, timeout, checkbox } = req.body

    try {
        const user = await User.login(email, usrpassword)
        if (!timeout) {
            throw new Error('Select Stay Signed in')
        }
        if (!checkbox) {
            throw new Error('Agree to terms and conditons')
        }
        //create a tken
        const token = createToken(user._id, timeout)

         res.status(200).json({email,token})
        // setTimeout(async () => { res.status(200).json({ email, token }); }, 8000)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }


}
//first step password reset send otp
const passwordreset =async (req,res)=>{

    const{email}=req.body
    
    try {
       
        const user = await User.findOne({ email })
  if (!user) {
    throw new Error('Account not found')
  }
      

       
        const otp = generateOTP();
        // const otp = 12345;

        req.session.resetPassword = { email, otp };

        await sendOTP(email, otp)
       res.status(200).json({ message: 'OTP sent to email' }) 

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}
//check otp 

const passresetotp = (req, res) => {


    const { otp } = req.body;
    try {
        if (!otp) {
            throw new Error('Enter An OTP')
        }
       
        if (parseInt(req.session.resetPassword.otp) === parseInt(otp)) {
            delete req.session.resetPassword.otp;
            res.status(200).json({ message: 'OTP verified' });
        } else {
            throw new Error('Invalid OTP')
        }
    
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

//change password
const passwordchange =async (req,res)=>{

    const{newpassword,confirmPassword}=req.body
    
    try {
        if (!newpassword && !confirmPassword) {
            throw new Error('Enter Both Passwords')
        }else{
            if (!newpassword ) {
                throw new Error('Enter A Password')
            }
            if ( !confirmPassword) {
                throw new Error('Enter Confirm Password')
            }
        }

        if(!validator.isStrongPassword(newpassword))
            {
                throw new Error('Create a Strong Password')
            }
            if(newpassword != confirmPassword)
                {
                    throw new Error('Wrong Confirm Password')
                }

        const resetPassword = req.session.resetPassword;
        const { email} = resetPassword;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const hashedPassword = await bcrypt.hash(newpassword, 10);
      
        user.usrpassword = hashedPassword;
        await user.save()

        res.json({ message: 'Password updated successfully'  });

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}


/////signup
const signupEmail = async (req, res) => {


    const { email, checkbox } = req.body;
    try {


        if (!email && !checkbox) {
            throw new Error('Enter the Required Fields')
        }
        else {
            if (!email) {
                throw new Error('Enter an Email')
            }
            if (!checkbox) {
                throw new Error('Check the checkbox')
            }
        }

        if (!validator.isEmail(email)) {
            throw new Error('Not Valid Email')
        }

        if (await User.findOne({ email })) {
            throw new Error('Email already in use');
        }


        const otp = generateOTP();
        // const otp = 12345;

        req.session.signupData = { email, otp };

      await sendOTP(email, otp)
       res.status(200).json({ message: 'OTP sent to email' }) 
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



//VERIFY OTP
const verifyOTP = (req, res) => {


    const { otp } = req.body;
    try {
        if (!otp) {
            throw new Error('Enter An OTP')
        }

        if (parseInt(req.session.signupData.otp) === parseInt(otp)) {
            delete req.session.signupData.otp;
            res.status(200).json({ message: 'OTP verified' });
        } else {
            throw new Error('Invalid OTP')
        }
        res.status(200).json({ message: 'OTP verified' })
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


//YOUR INFORMATION
const acceptUserDetails = async (req, res) => {


    const { firstname, lastname, phoneno } = req.body;
    try {
        if (!firstname && !lastname && !phoneno) {
            throw new Error('Fill All the Fields')
        } else {
            if (!firstname ) {
                throw new Error('Enter First Name')
            }
            if (!lastname ) {
                throw new Error('Enter Last Name ')
            }
            if ( !phoneno) {
                throw new Error('Enter Phone Number')
            }
        }
        const isValid = phoneno.length > 10 
        if(!isValid)
            {
                throw new Error('Enter a Valid Phone number')
            }
        if (await User.findOne({ phoneno })) {
            throw new Error('Phone Number Already Exists')
        }
        parseInt(phoneno)
        req.session.signupData = { ...req.session.signupData, firstname, lastname, phoneno };
        res.status(200).json({ message: 'Details accepted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



//FIRM INFORMATION
const acceptFirmInfo = async (req, res) => {

    const { firmname, country, state } = req.body;

    try {
        if (!firmname && !country && !state) {
            throw new Error('Fill All the Fields')
        }else{
            if (!firmname ) {
                throw new Error('Enter Firm Name')
            }
            if ( !country ) {
                throw new Error('Select Country')
            }
            if (!state) {
                throw new Error('Select State')
            }
        }

        if (await User.findOne({ firmname })) {
            throw new Error('Firm Already Exists')
        }
        req.session.signupData = { ...req.session.signupData, firmname, country, state };
        res.status(200).json({ message: 'Firm info accepted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


//FIRM DETAILS
const acceptFirmSizeServices = (req, res) => {


    const { firmsize, referal } = req.body;


    try {
        if (!firmsize && !referal) {
            throw new Error('Select all Fields')
        }
        else{
            if (!firmsize ) {
                throw new Error('Select firm size')
            }
            if ( !referal) {
                throw new Error('Select atleast one')
            }
        }

        parseInt(firmsize)
        req.session.signupData = { ...req.session.signupData, firmsize, referal };
        res.status(200).json({ message: 'Firm size and services accepted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



//FIRM SERVICES 
const acceptServicesProvided = (req, res) => {


    const { firmservices } = req.body;

    try {
        if (!Array.isArray(firmservices) || firmservices.length === 0) {
            throw new Error('Select at least one field');
        }
        req.session.signupData = { ...req.session.signupData, firmservices };
        res.status(200).json({ message: 'Services provided accepted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



//YOUR ROLE IN FIRM
const acceptRoleInFirm = (req, res) => {


    const { roleinfirm } = req.body;
    try {
        if (!roleinfirm) {
            throw new Error('Select One Fields')
        }
        req.session.signupData = { ...req.session.signupData, roleinfirm };
        res.status(200).json({ message: 'Role in firm accepted' });
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
};



//FIRM SETTINGS
const acceptWebUrlCurrency = async (req, res) => {


    const { weburl, currency,url } = req.body;
    try {
        if (!url && !currency) {
            throw new Error('Enter All Fields')
        }
        else{
            if (!url ) {
              
                throw new Error('Enter Web url' + url)
            }
            if (!currency) {
                throw new Error('Select Currency')
            }
        }
        if (await User.findOne({ weburl })) {
            throw new Error('WebUrl Already exists choose a different one')
        }

        req.session.signupData = { ...req.session.signupData, weburl, currency };
        res.status(200).json({ message: 'Web URL and currency accepted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};




//SET FIRM PASSWORD
const setPassword = async (req, res) => {


    const { usrpassword,confirmPassword } = req.body;
    try {
        if (!usrpassword && !confirmPassword) {
            throw new Error('Enter Both Passwords')
        }else{
            if (!usrpassword ) {
                throw new Error('Enter A Password')
            }
            if ( !confirmPassword) {
                throw new Error('Enter Confirm Password')
            }
        }

        if(!validator.isStrongPassword(usrpassword))
            {
                throw new Error('Create a Strong Password')
            }
            if(usrpassword != confirmPassword)
                {
                    throw new Error('Wrong Confirm Password')
                }
        const hashedPassword = await bcrypt.hash(usrpassword, 10);

        const signupData = req.session.signupData;
        const { email, firstname, lastname, phoneno, firmname, country, state, firmsize, referal, firmservices, roleinfirm, weburl, currency } = signupData;

        const user = new User({
            email, firstname, lastname, phoneno, firmname, country, state, firmsize, referal, firmservices, roleinfirm, weburl, currency, usrpassword: hashedPassword
        });

        await user.save();

        res.status(200).json({ message: 'Sucessfully Signedup' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

//-----------------------------------------------------------------------------------------


module.exports = {

    loginuser, signupEmail,
    verifyOTP,
    acceptUserDetails,
    acceptFirmInfo,
    acceptFirmSizeServices,
    acceptServicesProvided,
    acceptRoleInFirm,
    acceptWebUrlCurrency,
    setPassword,
    passresetotp,
    passwordreset,
    passwordchange
}