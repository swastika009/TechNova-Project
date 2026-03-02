const sequelize = require('../config/database');

const User = require('./User');
const Lead = require('./Lead');
const Project = require('./Project');
const Ticket = require('./Tickets');


Lead.hasOne(Project, { foreignKey: 'Lead_ID', as: 'convertedProject' });
Project.belongsTo(Lead, { foreignKey: 'Lead_ID' });

User.hasMany(Project, { foreignKey: 'managerId' });
Project.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });

User.hasMany(Ticket, { foreignKey: 'Client_ID' });
Ticket.belongsTo(User, { foreignKey: 'Client_ID' });

Project.hasMany(Ticket, { foreignKey: 'Project_ID' });
Ticket.belongsTo(Project, { foreignKey: 'Project_ID' });

module.exports = { User, Project, Lead, Ticket, sequelize };