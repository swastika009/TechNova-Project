
const express = require('express');
const router = express.Router();

const analyticsController = require('../controllers/analyticsController');
const { protect, restrictTo } = require('../middlewares/authMiddleware'); 

router.use(protect); 

router.get(
    '/summary', 
    restrictTo('Super Admin', 'Delivery Manager'), 
    analyticsController.getAnalyticsSummary
);

module.exports = router;