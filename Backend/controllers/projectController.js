const { Project } = require('../models');

// @route   GET /api/v1/projects
exports.getAllProjects = async (req, res, next) => {
    try {
        const projects = await Project.findAll();
        
        res.status(200).json({
            status: 'success',
            results: projects.length,
            data: projects
        });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/v1/projects/:id
exports.getProjectById = async (req, res, next) => {
    try {
        const project = await Project.findByPk(req.params.id);
        
        if (!project) {
            return res.status(404).json({ status: 'error', message: 'Project not found.' });
        }

        
        if (req.user.role === 'Client' && project.Client_Name !== req.user.name) {
            return res.status(403).json({ 
                status: 'error', 
                message: 'Access denied. You can only view your own project timelines.' 
            });
        }

        res.status(200).json({
            status: 'success',
            data: project
        });
    } catch (error) {
        next(error);
    }
};

// @route   PUT /api/v1/projects/:id
exports.updateProject = async (req, res, next) => {
    try {
        const project = await Project.findByPk(req.params.id);
        
        if (!project) {
            return res.status(404).json({ status: 'error', message: 'Project not found.' });
        }

        
        if (req.body.Project_Status === 'Completed' && !req.body.Actual_Completion_Date) {
            req.body.Actual_Completion_Date = new Date();
        }

        const updatedProject = await project.update(req.body);

        res.status(200).json({
            status: 'success',
            data: updatedProject
        });
    } catch (error) {
        next(error);
    }
};