const express = require('express');
// Commented out MongoDB connection
// const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Import routes
const authRoutes = require('./routes/auth');
const medicineRoutes = require('./routes/medicines');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Comment out MongoDB connection
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.error('MongoDB connection error:', err));

// Log that we're using mock data
console.log('Using mock data instead of MongoDB connection');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('Medicine Inventory Management System API - Using Mock Data');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('------------------------------------------');
  console.log('Mock Data Enabled:');
  console.log('- Login with username: admin, password: password');
  console.log('- All API endpoints will use mock data');
  console.log('------------------------------------------');
}); 