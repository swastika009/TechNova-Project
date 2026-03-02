const analyticsService = require('../services/analyticsService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

exports.getAnalyticsSummary = async (req, res) => {
    try {
        const stats = await analyticsService.getDashboardStats();

        return successResponse(res, 200, 'Analytics summary fetched successfully', stats);

    } catch (error) {
        console.error('Analytics Error:', error);
        return errorResponse(res, 500, 'Failed to generate analytics summary');
    }
};