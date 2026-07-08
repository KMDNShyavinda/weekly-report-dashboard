const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');

dotenv.config();

// Connect to MongoDB
connectDB();

const ensureDemoAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (!existingAdmin) {
      await User.create({
        name: 'Demo Admin',
        email: 'admin@example.com',
        passwordHash: 'Admin123!',
        role: 'admin'
      });
      console.log('Demo admin account created');
    }
  } catch (error) {
    console.error('Unable to create demo admin account:', error.message);
  }
};

ensureDemoAdmin();

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
