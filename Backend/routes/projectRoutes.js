const express = require('express');
const router = express.Router();

const { 
    getAllProjects, 
    getProjectById, 
    updateProject 
} = require('../controllers/projectController');

const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

router.use(protect);

router.get('/', authorizeRoles('Super Admin', 'Delivery Manager', 'Sales/Admin'), getAllProjects);

router.get('/:id', authorizeRoles('Super Admin', 'Delivery Manager', 'Client'), getProjectById);

router.put('/:id', authorizeRoles('Super Admin', 'Delivery Manager'), updateProject);

module.exports = router;