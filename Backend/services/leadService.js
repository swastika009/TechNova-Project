const { Lead, Project, sequelize } = require('../models');

exports.createLead = async (leadData) => {
    return await Lead.create({
        Lead_ID: `LD-${Date.now()}`, 
        Client_Name: leadData.Client_Name,
        Email: leadData.Email,
        Budget: leadData.Budget,
        Source: leadData.Source,
        Conversion_Time_Days: leadData.Conversion_Time_Days
    });
};

exports.getAllLeads = async () => {
    return await Lead.findAll();
};

exports.convertLeadToProject = async (leadId, projectData) => {
    const t = await sequelize.transaction();

    try {
        const lead = await Lead.findByPk(leadId);
        
        if (!lead) {
            await t.rollback();
            const error = new Error('Lead not found.');
            error.statusCode = 404; 
            throw error;
        }

        if (lead.Status === 'Converted') {
            await t.rollback();
            const error = new Error('This lead has already been converted into a project.');
            error.statusCode = 400;
            throw error;
        }

        const newProject = await Project.create({
            Project_ID: `PRJ-${Date.now()}`, 
            Client_Name: lead.Client_Name,
            Country: projectData.Country || 'Pending', 
            Project_Value: lead.Budget || 0,
            Start_Date: new Date(),
            Deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)), 
            Project_Status: 'Not Started',
            Lead_ID: lead.Lead_ID,
            Technology: projectData.Technology,
            Assigned_Team_Size: projectData.Assigned_Team_Size || 1
        }, { transaction: t });

        lead.Status = 'Converted';
        await lead.save({ transaction: t });

        await t.commit();
        return newProject;

    } catch (error) {
        if (!t.finished) await t.rollback();
        throw error; 
    }
};