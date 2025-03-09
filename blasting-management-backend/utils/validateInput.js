const validateSignupData = ({ username, password, email }) => {
    // Validate username
    if (!username || username.length < 3) {
        throw { 
            status: 400, 
            message: 'Username must be at least 3 characters long' 
        };
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        throw { 
            status: 400, 
            message: 'Please provide a valid email address' 
        };
    }

    // Validate password (basic validation - detailed in passwordValidator)
    if (!password || password.length < 8) {
        throw { 
            status: 400, 
            message: 'Password must be at least 8 characters long' 
        };
    }
};

module.exports = {
    validateSignupData
};
