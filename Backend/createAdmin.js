// createAdmin.js
const sequelize = require('./config/database');
const User = require('./models/User'); 

const createSuperAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        // Create the Super Admin directly. The User model hook will hash 'password123' automatically!
        const adminUser = await User.create({
            name: 'TechNova Admin',
            email: 'admin@technova.com',
            password: 'password123', // <-- Plain text! The hook handles the hash.
            role: 'Super Admin'      // <-- Ensure this matches your ENUM exactly
        });

        console.log('✅ Super Admin successfully created!');
        console.log(`Name: ${adminUser.name}`);
        console.log(`Email: ${adminUser.email}`);
        console.log(`Role: ${adminUser.role}`);
        
        process.exit(0);
    } catch (error) {
        // If the email already exists, it will throw a validation error
        if (error.name === 'SequelizeUniqueConstraintError') {
            console.error('⚠️ Error: A user with admin@technova.com already exists in the database.');
        } else {
            console.error('❌ Error creating Admin:', error);
        }
        process.exit(1);
    }
};

createSuperAdmin();