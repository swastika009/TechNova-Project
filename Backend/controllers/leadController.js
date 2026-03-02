const leadService = require('../services/leadService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

exports.createLead = async (req, res, next) => {
    try {
        const newLead = await leadService.createLead(req.body);
        return successResponse(res, 201, 'Lead created successfully', newLead);
    } catch (error) {
        next(error);
    }
};

exports.getAllLeads = async (req, res, next) => {
    try {
        const leads = await leadService.getAllLeads();
        
        return successResponse(res, 200, 'Leads fetched successfully', {
            results: leads.length,
            leads: leads
        });
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/v1/leads/:id/convert
exports.convertLeadToProject = async (req, res, next) => {
    try {
        const newProject = await leadService.convertLeadToProject(req.params.id, req.body);
        
        return successResponse(res, 201, 'Lead successfully converted to a Project.', newProject);
    } catch (error) {
        // If our service threw a custom error (404 or 400), catch it and use our error formatter
        if (error.statusCode) {
            return errorResponse(res, error.statusCode, error.message);
        }
        // Otherwise, send it to the global error handler
        next(error);
    }
};