const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { protect, restrictTo } = require('../middlewares/authMiddleware'); 

//  User must be logged in
router.use(protect);

router.use(restrictTo('Super Admin', 'Delivery Manager', 'Sales/Admin'));

router.post('/', leadController.createLead);
router.get('/', leadController.getAllLeads);
router.post('/:id/convert', leadController.convertLeadToProject);

module.exports = router;