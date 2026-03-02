const { Ticket, Project } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseFormatter');


// POST /api/v1/tickets
exports.createTicket = async (req, res, next) => {
    try {
        const { Title, Description, Priority, Project_ID } = req.body;

        const project = await Project.findByPk(Project_ID);
        if (!project) {
            return errorResponse(res, 404, 'Project not found. Cannot attach ticket.');
        }

        
        const newTicket = await Ticket.create({
            Ticket_ID: `TKT-${Date.now()}`,
            Title,
            Description,
            Priority: Priority || 'Medium',
            Project_ID,
            Client_ID: req.user.id 
        });

        return successResponse(res, 201, 'Support ticket created successfully', newTicket);
    } catch (error) {
        next(error);
    }
};


// GET /api/v1/tickets
exports.getAllTickets = async (req, res, next) => {
    try {
        let tickets;

        if (req.user.role === 'Client') {
            tickets = await Ticket.findAll({ 
                where: { Client_ID: req.user.id },
                order: [['createdAt', 'DESC']]
            });
        } else {
            tickets = await Ticket.findAll({
                order: [['createdAt', 'DESC']]
            });
        }
        
        return successResponse(res, 200, 'Tickets fetched successfully', {
            results: tickets.length,
            tickets
        });
    } catch (error) {
        next(error);
    }
};


//  PUT /api/v1/tickets/:id
exports.updateTicket = async (req, res, next) => {
    try {
        const ticket = await Ticket.findByPk(req.params.id);
        
        if (!ticket) {
            return errorResponse(res, 404, 'Ticket not found.');
        }

        ticket.Status = req.body.Status || ticket.Status;
        ticket.Priority = req.body.Priority || ticket.Priority;
        
        await ticket.save();

        return successResponse(res, 200, 'Ticket updated successfully', ticket);
    } catch (error) {
        next(error);
    }
};