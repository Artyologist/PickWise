const jwt = require('jsonwebtoken');
const User = require('../models/User');
const LoginEvent = require('../models/LoginEvent');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// 🔐 Register
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ ok: false, error: 'All fields required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ ok: false, error: 'Email already registered' });
    }

    const user = await User.create({ username, email, password });

    // 🛡️ Log Register Event
    await LoginEvent.create({
      userId: user._id,
      email,
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      ok: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Register failed' });
  }
};

// 🔐 Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      // 🛡️ Log Failed Attempt
      await LoginEvent.create({
        email,
        status: 'failed',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    }

    // 🛡️ Log Success Event
    await LoginEvent.create({
      userId: user._id,
      email,
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      ok: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Login failed' });
  }
};
