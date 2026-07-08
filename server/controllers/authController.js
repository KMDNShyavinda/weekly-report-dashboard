const jwt = require('jsonwebtoken');
const User = require('../models/User');

const DEMO_USERS = {
  'admin@example.com': { name: 'Demo Admin', role: 'admin', password: 'Admin123!' },
  'manager@example.com': { name: 'Demo Manager', role: 'manager', password: 'Manager123!' }
};

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'dev-secret-key', { expiresIn: '7d' });

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const user = await User.create({ name, email, passwordHash: password, role });
    res.status(201).json({ user, token: generateToken(user._id) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const demoUser = DEMO_USERS[email];
    if (demoUser && demoUser.password === password) {
      const user = { _id: `demo-${email}`, name: demoUser.name, email, role: demoUser.role };
      return res.json({ user, token: generateToken(user._id) });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({ user, token: generateToken(user._id) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { register, login, getMe };
