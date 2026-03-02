const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ticket = sequelize.define('Ticket', {
    Ticket_ID: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    Title: {
        type: DataTypes.STRING,
        allowNull: true 
    },
    Description: {
        type: DataTypes.TEXT,
        allowNull: true 
    },
    Status: {
        type: DataTypes.ENUM('Open', 'In Progress', 'Resolved', 'Closed'),
        defaultValue: 'Open'
    },
    Priority: {
        type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
        defaultValue: 'Medium'
    },
    Issue_Type: { 
        type: DataTypes.STRING,
        allowNull: true
    },
    Resolution_Time_Hours: { 
        type: DataTypes.FLOAT,
        allowNull: true
    }
}, {
    timestamps: true, 
    tableName: 'tickets'
});

module.exports = Ticket;