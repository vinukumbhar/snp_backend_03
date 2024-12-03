const express=require('express')
const router = express.Router()

const { loginuser,  signupEmail,
    verifyOTP,
    acceptUserDetails,
    acceptFirmInfo,
    acceptFirmSizeServices,
    acceptServicesProvided,
    passwordreset,
    acceptRoleInFirm,
    passresetotp,
    passwordchange,
    acceptWebUrlCurrency,
    setPassword} = require('../Controller/usercontroller')
const validateSession  =require('../Middleware/Validatesession')
const passwordresetvalid  =require('../Middleware/Validatesession')
//login
router.post('/login', loginuser)

router.post('/login/resetpassword',passwordresetvalid, passwordreset)

router.post('/login/resetpassword/otp',passwordresetvalid, passresetotp)

router.patch('/login/resetpassword/changep',passwordresetvalid, passwordchange)
//sign up 



router.post('/signup/email', signupEmail);


router.post('/signup/verify-otp', validateSession, verifyOTP);

router.post('/signup/details', validateSession, acceptUserDetails);

router.post('/signup/firm-info', validateSession, acceptFirmInfo);

router.post('/signup/firm-size-services', validateSession, acceptFirmSizeServices);

router.post('/signup/services-provided', validateSession, acceptServicesProvided);

router.post('/signup/role', validateSession, acceptRoleInFirm);

router.post('/signup/web-url-currency', validateSession, acceptWebUrlCurrency);

router.post('/signup/set-password', validateSession, setPassword);

// router.patch('/signup/')

module.exports = router