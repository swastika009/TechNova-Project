const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lead = sequelize.define('Lead', {
    Lead_ID: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    Client_Name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Email: {
        type: DataTypes.STRING,
        allowNull: true 
    },
    Contact_Number: {
        type: DataTypes.STRING,
        allowNull: true 
    },
    Lead_Source: {
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
    Budget: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    Currency: {
        type: DataTypes.STRING,
        allowNull: true 
    },
    Status: {
        type: DataTypes.ENUM('New', 'Qualified', 'Lost', 'Converted'),
        defaultValue: 'New'
    }
}, {
    timestamps: true,
    tableName: 'leads'
});

module.exports = Lead;