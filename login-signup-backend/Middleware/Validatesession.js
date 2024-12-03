const validateSession = (req, res, next) => {
    req.session.signupData = req.session.signupData || {};
    next();
};

const passwordresetvalid = (req, res, next) => {
    req.session.resetPassword = req.session.resetPassword || {};
    next();
};

module.exports = validateSession ,passwordresetvalid;
