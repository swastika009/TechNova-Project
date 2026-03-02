const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
    Project_ID: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    Client_Name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Country: {
        type: DataTypes.STRING,
        allowNull: true
    },
    Industry: {
        type: DataTypes.STRING,
        allowNull: true 
    },
    Service_Interested: {
        type: DataTypes.STRING,
        allowNull: true 
    },
    Project_Value: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    Currency: {
        type: DataTypes.STRING,
        allowNull: true
    },
    Start_Date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    Deadline: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    Actual_Completion_Date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    Project_Status: {
        type: DataTypes.ENUM('Not Started', 'In Progress', 'Completed', 'Delayed'),
        defaultValue: 'Not Started'
    },
    Assigned_Team_Size: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    Total_Hours_Logged: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    Overtime_Hours: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    Total_Hours: {
        type: DataTypes.FLOAT,
        defaultValue: 0 
    },
    Resource_Overallocated: {
        type: DataTypes.STRING, 
        defaultValue: 'No'
    },
    Client_Satisfaction: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'projects'
});

module.exports = Project;