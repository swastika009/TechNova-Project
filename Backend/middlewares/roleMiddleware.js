exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                status: 'error', 
                message: `Role (${req.user ? req.user.role : 'Unknown'}) is not allowed to access this resource.` 
            });
        }
        next();
    };
};