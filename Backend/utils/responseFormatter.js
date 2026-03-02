
exports.successResponse = (res, statusCode, message, data = {}) => {
    return res.status(statusCode).json({
        status: 'success',
        message: message,
        data: data
    });
};


exports.errorResponse = (res, statusCode, message, errors = null) => {
    const response = {
        status: 'error',
        message: message
    };

    if (errors) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
};