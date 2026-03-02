// Load Environment Variables First
require('dotenv').config();

// Core Dependencies
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Database & Models Hub
const { sequelize } = require('./models');

const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadRoutes');
const projectRoutes = require('./routes/projectRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const ticketRoutes = require('./routes/ticketRoutes');


const app = express();
const PORT = process.env.PORT || 5000;

// Global Middlewares
app.use(helmet()); 

app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/tickets', ticketRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'success', 
        message: 'TechNova Global API is up and running smoothly.' 
    });
});

// 404 Handler for Unmatched Routes
app.use((req, res, next) => {
    res.status(404).json({
        status: 'error',
        message: `Route ${req.originalUrl} not found on this server.`
    });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack); 
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
    });
});

//  Database Connection & Server Startup
sequelize.authenticate()
    .then(() => {
        console.log(' Database connection has been established successfully.');
        return sequelize.sync({ alter: true }); 
    })
    .then(() => {
        console.log('All models were synchronized successfully.');
        app.listen(PORT, () => {
            console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
        process.exit(1); 
    });