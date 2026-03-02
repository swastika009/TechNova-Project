const { errorResponse } = require('../utils/responseFormatter');


const validateData = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const formattedErrors = error.details.map((err) => ({
                field: err.path[0],
                message: err.message
            }));

            return errorResponse(res, 400, 'Validation Failed', formattedErrors);
        }

        next();
    };
};

module.exports = validateData;