const User = require('../models/user.model');
const Artist = require('../models/artist.model'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendPasswordResetOtpEmail } = require('../utils/mail');

const configuredResetTtl = Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES);
const RESET_OTP_TTL_MINUTES = Number.isFinite(configuredResetTtl) && configuredResetTtl > 0
  ? configuredResetTtl
  : 15;

const hashResetOtp = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

const generateResetOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const register = async (req, res) => {
  try {
    const { name, password, role } = req.body;
    const email = req.body.email?.toLowerCase().trim();
    const normalizedRole = role === 'artist' ? 'artist' : 'user';

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role: normalizedRole });
    await user.save();
    if (normalizedRole === 'artist') {
      await Artist.create({
        name,
        userId: user._id,
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar || '' } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.body.email?.toLowerCase().trim();

    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar || '' } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const logout = async (req, res) => {
  try {
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`Password reset requested for unknown email: ${email}`);
      return res.json({ message: 'If this email exists, a reset OTP has been sent' });
    }

    const resetOtp = generateResetOtp();
    user.passwordResetToken = hashResetOtp(resetOtp);
    user.passwordResetExpires = new Date(Date.now() + RESET_OTP_TTL_MINUTES * 60 * 1000);
    await user.save();

    await sendPasswordResetOtpEmail({
      to: user.email,
      name: user.name,
      otp: resetOtp,
      expiresInMinutes: RESET_OTP_TTL_MINUTES
    });
    console.log(`Password reset OTP sent to ${user.email}`);

    res.json({
      message: 'If this email exists, a reset OTP has been sent',
      expiresInMinutes: RESET_OTP_TTL_MINUTES
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const { otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ message: 'Email, OTP and password are required' });
    }

    const normalizedOtp = String(otp).trim();
    if (!/^\d{6}$/.test(normalizedOtp)) {
      return res.status(400).json({ message: 'OTP must be 6 digits' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({
      email,
      passwordResetToken: hashResetOtp(normalizedOtp),
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'OTP is invalid or expired' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = '';
    user.passwordResetExpires = null;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, logout, forgotPassword, resetPassword };
