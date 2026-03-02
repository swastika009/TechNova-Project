const { Project, sequelize } = require('../models'); 

exports.getDashboardStats = async () => {
    const [totalProjects, avgSatisfaction, techStackBreakdown] = await Promise.all([
        Project.count(),
        Project.findOne({
            attributes: [
                [sequelize.fn('AVG', sequelize.col('Client_Satisfaction')), 'averageRating']
            ],
            raw: true
        }),
        Project.findAll({
            attributes: [
                'Technology',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['Technology'],
            raw: true
        })
    ]);

    return {
        totalProjects,
        averageClientSatisfaction: avgSatisfaction?.averageRating 
            ? parseFloat(avgSatisfaction.averageRating).toFixed(1) 
            : 0,
        techStackBreakdown
    };
};