const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Display environment variables for debugging
console.log('Environment variables:');
console.log('MONGO_URI:', process.env.MONGO_URI);

// Import User model
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Admin user details
const adminUser = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin'
};

const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const userExists = await User.findOne({ email: adminUser.email });
    
    if (userExists) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminUser.password, salt);
    
    // Create user
    const user = await User.create({
      name: adminUser.name,
      email: adminUser.email,
      password: hashedPassword,
      role: adminUser.role
    });
    
    console.log('Admin user created successfully');
    console.log('Email:', adminUser.email);
    console.log('Password:', adminUser.password);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }
};

// Run the function
createAdminUser(); 