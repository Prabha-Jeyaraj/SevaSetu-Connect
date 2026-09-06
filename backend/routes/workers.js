/**
 * Workers Router - Registration, Verification, Search & Profile
 * SevaSetu Connect - SIH26089
 */

const express = require('express');
const router = express.Router();
const db = require('../db');

// List workers with rich filtering (Skill, District/Location, Society, Verification status, Search keyword)
router.get('/', async (req, res) => {
  try {
    const { skill, district, status, society_id, is_cooperative, search } = req.query;
    
    let sql = `
      SELECT w.*, s.name as society_name, s.registration_number as society_reg_no, s.district as society_district
      FROM workers w
      LEFT JOIN cooperative_societies s ON w.society_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (skill && skill !== 'all') {
      sql += ` AND LOWER(w.skill_type) = LOWER(?)`;
      params.push(skill);
    }

    if (district && district !== 'all') {
      sql += ` AND (LOWER(w.district) = LOWER(?) OR LOWER(w.location) LIKE LOWER(?))`;
      params.push(district, `%${district}%`);
    }

    if (status) {
      sql += ` AND w.verification_status = ?`;
      params.push(status);
    }

    if (society_id) {
      sql += ` AND w.society_id = ?`;
      params.push(society_id);
    }

    if (is_cooperative !== undefined && is_cooperative !== '') {
      sql += ` AND w.is_cooperative_member = ?`;
      params.push(is_cooperative === 'true' || is_cooperative === '1' ? 1 : 0);
    }

    if (search) {
      sql += ` AND (LOWER(w.name) LIKE LOWER(?) OR LOWER(w.skill_type) LIKE LOWER(?) OR LOWER(w.location) LIKE LOWER(?) OR LOWER(w.bio) LIKE LOWER(?))`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY w.is_cooperative_member DESC, w.verification_status = 'verified' DESC, w.rating DESC, w.created_at DESC`;

    const workers = await db.all(sql, params);
    res.json({ success: true, count: workers.length, data: workers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single worker profile
router.get('/:id', async (req, res) => {
  try {
    const worker = await db.get(
      `SELECT w.*, s.name as society_name, s.registration_number as society_reg_no
       FROM workers w
       LEFT JOIN cooperative_societies s ON w.society_id = s.id
       WHERE w.id = ?`,
      [req.params.id]
    );

    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }

    // Worker's recent reviews / bookings
    const bookings = await db.all(
      `SELECT b.*, c.name as customer_name
       FROM bookings b
       JOIN customers c ON b.customer_id = c.id
       WHERE b.worker_id = ?
       ORDER BY b.created_at DESC LIMIT 5`,
      [req.params.id]
    );

    res.json({ success: true, data: { ...worker, recent_bookings: bookings } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Register a new worker
router.post('/', async (req, res) => {
  try {
    const {
      name,
      skill_type,
      phone,
      location,
      district,
      society_id,
      is_cooperative_member,
      hourly_rate,
      experience_years,
      bio
    } = req.body;

    if (!name || !skill_type || !phone || !location) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, skill_type, phone, and location are required.'
      });
    }

    // Check if phone already registered
    const existing = await db.get(`SELECT id FROM workers WHERE phone = ?`, [phone]);
    if (existing) {
      return res.status(400).json({ success: false, error: 'A worker with this phone number is already registered.' });
    }

    const isMember = is_cooperative_member ? 1 : (society_id ? 1 : 0);
    // If cooperative member, status is 'pending' until society admin approves.
    // If independent worker, basic verification is 'verified' or 'pending'.
    const initialStatus = isMember ? 'pending' : 'verified';
    const parsedDistrict = district || location.split(',').pop().trim() || 'General';

    const result = await db.run(
      `INSERT INTO workers 
       (name, skill_type, phone, location, district, society_id, is_cooperative_member, verification_status, hourly_rate, experience_years, rating, review_count, bio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        skill_type,
        phone,
        location,
        parsedDistrict,
        society_id || null,
        isMember,
        initialStatus,
        hourly_rate || 250,
        experience_years || 2,
        5.0, // New worker start rating
        0,   // Review count
        bio || `Experienced ${skill_type} providing dedicated services.`
      ]
    );

    const newWorker = await db.get(
      `SELECT w.*, s.name as society_name
       FROM workers w
       LEFT JOIN cooperative_societies s ON w.society_id = s.id
       WHERE w.id = ?`,
      [result.lastID]
    );

    res.status(201).json({
      success: true,
      message: isMember
        ? 'Worker registration submitted! Pending approval by your cooperative society.'
        : 'Independent worker registration successful!',
      data: newWorker
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin toggle / flip verification status
router.patch('/:id/verify', async (req, res) => {
  try {
    const { status } = req.body; // 'verified', 'pending', 'rejected'
    const newStatus = status || 'verified';

    const worker = await db.get(`SELECT * FROM workers WHERE id = ?`, [req.params.id]);
    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }

    await db.run(
      `UPDATE workers SET verification_status = ? WHERE id = ?`,
      [newStatus, req.params.id]
    );

    const updatedWorker = await db.get(
      `SELECT w.*, s.name as society_name
       FROM workers w
       LEFT JOIN cooperative_societies s ON w.society_id = s.id
       WHERE w.id = ?`,
      [req.params.id]
    );

    res.json({
      success: true,
      message: `Worker ${updatedWorker.name} verification status updated to '${newStatus}'.`,
      data: updatedWorker
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
