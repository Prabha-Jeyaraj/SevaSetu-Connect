/**
 * Customers Router - Registration and Profile Management
 * SevaSetu Connect - Customers Route
 */

const express = require('express');
const router = express.Router();
const db = require('../db');

// List customers
router.get('/', async (req, res) => {
  try {
    const customers = await db.all(`SELECT * FROM customers ORDER BY id ASC`);
    res.json({ success: true, count: customers.length, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get customer by ID with their active and past bookings
router.get('/:id', async (req, res) => {
  try {
    const customer = await db.get(`SELECT * FROM customers WHERE id = ?`, [req.params.id]);
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    const bookings = await db.all(
      `SELECT b.*, w.name as worker_name, w.skill_type as worker_skill, w.phone as worker_phone,
              s.name as society_name, w.is_cooperative_member, w.verification_status
       FROM bookings b
       JOIN workers w ON b.worker_id = w.id
       LEFT JOIN cooperative_societies s ON w.society_id = s.id
       WHERE b.customer_id = ?
       ORDER BY b.created_at DESC`,
      [req.params.id]
    );

    res.json({ success: true, data: { ...customer, bookings } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Register new customer
router.post('/', async (req, res) => {
  try {
    const { name, phone, location, district, email } = req.body;

    if (!name || !phone || !location) {
      return res.status(400).json({
        success: false,
        error: 'Name, phone number, and location are required.'
      });
    }

    // Check if phone already registered
    const existing = await db.get(`SELECT * FROM customers WHERE phone = ?`, [phone]);
    if (existing) {
      return res.json({
        success: true,
        message: 'Welcome back! Existing profile loaded.',
        data: existing
      });
    }

    const parsedDistrict = district || location.split(',').pop().trim() || 'General';

    const result = await db.run(
      `INSERT INTO customers (name, phone, location, district, email)
       VALUES (?, ?, ?, ?, ?)`,
      [name, phone, location, parsedDistrict, email || null]
    );

    const newCustomer = await db.get(`SELECT * FROM customers WHERE id = ?`, [result.lastID]);

    res.status(201).json({
      success: true,
      message: 'Customer registration successful!',
      data: newCustomer
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
