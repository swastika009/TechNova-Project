const leadService = require('../services/leadService');
const { Lead } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

exports.createLead = async (req, res) => {
    try {
        // 🚨 Grab ALL fields from the frontend request
        const { 
            Client_Name, 
            Email, 
            Contact_Number, 
            Country, 
            Industry, 
            Service_Interested, 
            Budget, 
            Lead_Source, 
            Status 
        } = req.body;

        const leadId = `LD-${Date.now()}`;

        const newLead = await Lead.create({
            Lead_ID: leadId,
            Client_Name,
            Email: Email || null,
            Contact_Number: Contact_Number || null,
            Country: Country || 'Unknown',
            Industry: Industry || 'Unknown',
            Service_Interested: Service_Interested || 'Unknown',
            Budget: Budget || 0,
            Lead_Source: Lead_Source || 'Direct',
            Currency: 'USD', 
            Status: Status || 'New'
        });

        res.status(201).json({
            status: 'success',
            data: newLead
        });

    } catch (error) {
        console.error('Error creating lead:', error);
        res.status(400).json({
            status: 'error',
            message: error.message
        });
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

exports.deleteLead = async (req, res) => {
    try {
        const lead = await Lead.findByPk(req.params.id);
        
        if (!lead) {
            return res.status(404).json({ status: 'error', message: 'Lead not found' });
        }
        
        await lead.destroy();
        
        res.status(200).json({ 
            status: 'success', 
            message: 'Lead permanently deleted.' 
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};