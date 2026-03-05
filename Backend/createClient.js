// createClient.js
const sequelize = require('./config/database');
const User = require('./models/User'); 

const createJohn = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        // 🚨 Just pass the raw password! Your User model's "beforeCreate" hook will hash it automatically!
        const clientUser = await User.create({
            name: 'John Davidson',
            email: 'john.davidson@retailmax.co.uk',
            password: 'Client@2026!', // <-- Plain text here!
            role: 'Client'
        });

        console.log('Client successfully created!');
        console.log(`Name: ${clientUser.name}`);
        console.log(`Role: ${clientUser.role}`);
        
        process.exit(0);
    } catch (error) {
        console.error(' Error creating client:', error);
        process.exit(1);
    }
};

createJohn();