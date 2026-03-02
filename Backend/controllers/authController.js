const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};


exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ status: 'error', message: 'Email already in use' });
        }

        
        const user = await User.create({
            name,
            email,
            password: password, 
            role: role || 'Client' 
        });

        // Send response with token
        const token = generateToken(user.id, user.role);
        res.status(201).json({
            status: 'success',
            token,
            data: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        next(error); 
    }
};

// POST /api/v1/auth/login
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ status: 'error', message: 'Please provide email and password' });
        }

        //  Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
        }

        //  Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
        }

        // Send token
        const token = generateToken(user.id, user.role);
        res.status(200).json({
            status: 'success',
            token,
            data: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        next(error);
    }
};