const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');

dotenv.config();

// Connect to MongoDB
connectDB().then(() => {
  ensureDemoManager();
});

const ensureDemoManager = async () => {
  if (mongoose.connection.readyState !== 1) {
    console.warn('MongoDB not connected; skipping demo manager bootstrap.');
    return;
  }

  try {
    const existingManager = await User.findOne({ email: 'manager@example.com' });
    if (!existingManager) {
      await User.create({
        name: 'Demo Manager',
        email: 'manager@example.com',
        passwordHash: 'Manager123!',
        role: 'manager'
      });
      console.log('Demo manager account created');
    }
  } catch (error) {
    console.error('Unable to create demo manager account:', error.message);
  }
};

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/reports',   require('./routes/reportRoutes'));
app.use('/api/projects',  require('./routes/projectRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/assistant', require('./routes/assistantRoutes'));

// Health check
app.get('/', (req, res) => res.json({ message: 'API is running' }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
