const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ status: 'error', message: 'Not authorized to access this route. Please log in.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const currentUser = await User.findByPk(decoded.id);
        
        if (!currentUser) {
            return res.status(401).json({ status: 'error', message: 'The user belonging to this token no longer exists.' });
        }

        req.user = currentUser;
        next(); 
    } catch (error) {
        return res.status(401).json({ status: 'error', message: 'Invalid or expired token.' });
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                status: 'error', 
                message: 'You do not have permission to perform this action.' 
            });
        }
        
        next();
    };
};