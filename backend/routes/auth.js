/**
 * Authentication & User Management Router
 * SevaSetu Connect
 */

const express = require('express');
const router = express.Router();
const db = require('../db');

// Simulated token generator
const generateToken = (userId, role) => {
  return `sevasetu_token_${userId}_${role}_${Date.now()}`;
};

// Register new Customer or Worker
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role = 'customer',
      location = 'Pune',
      district = 'Pune',
      skill_type,
      hourly_rate,
      experience_years,
      society_id,
      is_cooperative_member,
      bio
    } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, phone number, and password are required.'
      });
    }

    // Check if user already exists
    const existingUser = await db.get(
      `SELECT id FROM users WHERE email = ? OR phone = ?`,
      [email.toLowerCase(), phone]
    );
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email or phone number already exists. Please sign in.'
      });
    }

    let customerId = null;
    let workerId = null;

    if (role === 'worker') {
      if (!skill_type) {
        return res.status(400).json({ success: false, error: 'Skill/Trade is required for worker registration.' });
      }

      const isCoop = is_cooperative_member || Boolean(society_id);
      const initialVerification = isCoop ? 'pending' : 'verified';

      const workerRes = await db.run(
        `INSERT INTO workers (name, skill_type, phone, email, location, district, society_id, is_cooperative_member, verification_status, hourly_rate, experience_years, rating, review_count, bio)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          skill_type,
          phone,
          email.toLowerCase(),
          location,
          district,
          society_id || null,
          isCoop ? 1 : 0,
          initialVerification,
          hourly_rate || 300,
          experience_years || 2,
          5.0,
          0,
          bio || `Skilled ${skill_type} providing dedicated services.`
        ]
      );
      workerId = workerRes.lastID;
    } else {
      // Customer
      const customerRes = await db.run(
        `INSERT INTO customers (name, phone, location, district, email)
         VALUES (?, ?, ?, ?, ?)`,
        [name, phone, location, district, email.toLowerCase()]
      );
      customerId = customerRes.lastID;
    }

    // Create User record
    const userRes = await db.run(
      `INSERT INTO users (name, email, phone, password, role, society_id, worker_id, customer_id, is_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        name,
        email.toLowerCase(),
        phone,
        password,
        role,
        society_id || null,
        workerId,
        customerId
      ]
    );

    const user = await db.get(`SELECT id, name, email, phone, role, society_id, worker_id, customer_id FROM users WHERE id = ?`, [userRes.lastID]);
    const token = generateToken(user.id, user.role);

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Simulated OTP Verification
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    // Development fixed OTP: 123456
    if (otp === '123456' || otp === '999999') {
      const user = await db.get(`SELECT id, name, email, phone, role, society_id, worker_id, customer_id FROM users WHERE phone = ?`, [phone]);
      if (user) {
        const token = generateToken(user.id, user.role);
        return res.json({ success: true, message: 'OTP verified successfully!', token, user });
      }
      return res.json({ success: true, message: 'OTP verified!' });
    }
    return res.status(400).json({ success: false, error: 'Invalid verification code. Please use demo OTP: 123456' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// User Login (Email or Phone + Password)
router.post('/login', async (req, res) => {
  try {
    const { emailOrPhone, password, requiredPortal } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email/Phone and password are required.'
      });
    }

    const user = await db.get(
      `SELECT u.*, 
              s.name as society_name, s.district as society_district, s.approval_status as society_status
       FROM users u
       LEFT JOIN cooperative_societies s ON u.society_id = s.id
       WHERE LOWER(u.email) = LOWER(?) OR u.phone = ?`,
      [emailOrPhone.trim(), emailOrPhone.trim()]
    );

    if (!user) {
      return res.status(401).json({ success: false, error: 'No account found with these credentials.' });
    }

    if (user.password !== password) {
      return res.status(401).json({ success: false, error: 'Incorrect password. Please try again.' });
    }

    // Role enforcement based on portal if requested
    if (requiredPortal === 'society_admin' && user.role !== 'society_admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: This login is reserved for Cooperative Society Administrators.'
      });
    }

    if (requiredPortal === 'super_admin' && user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: This login is reserved for Platform Super Administrators.'
      });
    }

    const token = generateToken(user.id, user.role);
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Current User Profile (Session check)
router.get('/me', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthenticated session' });
    }

    const user = await db.get(
      `SELECT u.id, u.name, u.email, u.phone, u.role, u.society_id, u.worker_id, u.customer_id,
              s.name as society_name, s.district as society_district
       FROM users u
       LEFT JOIN cooperative_societies s ON u.society_id = s.id
       WHERE u.id = ?`,
      [userId]
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
