/**
 * Bookings Router - Lifecycle: requested -> accepted -> in_progress -> completed -> cancelled
 * SevaSetu Connect - SIH26089
 */

const express = require('express');
const router = express.Router();
const db = require('../db');

// List bookings with optional customer, worker, or society filters
router.get('/', async (req, res) => {
  try {
    const { customer_id, worker_id, society_id, status } = req.query;

    let sql = `
      SELECT b.*, 
             w.name as worker_name, w.skill_type as worker_skill, w.phone as worker_phone, 
             w.is_cooperative_member, w.verification_status as worker_verification,
             s.name as society_name, s.id as society_id,
             c.name as customer_name, c.phone as customer_phone
      FROM bookings b
      JOIN workers w ON b.worker_id = w.id
      JOIN customers c ON b.customer_id = c.id
      LEFT JOIN cooperative_societies s ON w.society_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (customer_id) {
      sql += ` AND b.customer_id = ?`;
      params.push(customer_id);
    }

    if (worker_id) {
      sql += ` AND b.worker_id = ?`;
      params.push(worker_id);
    }

    if (society_id) {
      sql += ` AND w.society_id = ?`;
      params.push(society_id);
    }

    if (status) {
      sql += ` AND b.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY b.created_at DESC`;

    const bookings = await db.all(sql, params);
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single booking
router.get('/:id', async (req, res) => {
  try {
    const booking = await db.get(
      `SELECT b.*, 
              w.name as worker_name, w.skill_type as worker_skill, w.phone as worker_phone, w.hourly_rate,
              s.name as society_name,
              c.name as customer_name, c.phone as customer_phone
       FROM bookings b
       JOIN workers w ON b.worker_id = w.id
       JOIN customers c ON b.customer_id = c.id
       LEFT JOIN cooperative_societies s ON w.society_id = s.id
       WHERE b.id = ?`,
      [req.params.id]
    );

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create new booking
router.post('/', async (req, res) => {
  try {
    const {
      customer_id,
      worker_id,
      service_type,
      booking_type,
      recurrence_detail,
      scheduled_date,
      location,
      notes,
      total_amount
    } = req.body;

    if (!customer_id || !worker_id || !scheduled_date || !location) {
      return res.status(400).json({
        success: false,
        error: 'customer_id, worker_id, scheduled_date, and location are required.'
      });
    }

    // Verify worker exists
    const worker = await db.get(`SELECT * FROM workers WHERE id = ?`, [worker_id]);
    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }

    const calculatedAmount = total_amount || (worker.hourly_rate * 2); // Default 2 hours estimate

    const result = await db.run(
      `INSERT INTO bookings 
       (customer_id, worker_id, service_type, booking_type, recurrence_detail, status, scheduled_date, location, notes, total_amount)
       VALUES (?, ?, ?, ?, ?, 'requested', ?, ?, ?, ?)`,
      [
        customer_id,
        worker_id,
        service_type || worker.skill_type,
        booking_type || 'one-time',
        recurrence_detail || null,
        scheduled_date,
        location,
        notes || '',
        calculatedAmount
      ]
    );

    const newBooking = await db.get(
      `SELECT b.*, 
              w.name as worker_name, w.skill_type as worker_skill,
              s.name as society_name,
              c.name as customer_name
       FROM bookings b
       JOIN workers w ON b.worker_id = w.id
       JOIN customers c ON b.customer_id = c.id
       LEFT JOIN cooperative_societies s ON w.society_id = s.id
       WHERE b.id = ?`,
      [result.lastID]
    );

    res.status(201).json({
      success: true,
      message: 'Booking request created successfully! The worker and society have been notified.',
      data: newBooking
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update booking status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body; // 'requested', 'accepted', 'in_progress', 'completed', 'cancelled'
    const validStatuses = ['requested', 'accepted', 'in_progress', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const booking = await db.get(`SELECT * FROM bookings WHERE id = ?`, [req.params.id]);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    await db.run(`UPDATE bookings SET status = ? WHERE id = ?`, [status, req.params.id]);

    const updated = await db.get(
      `SELECT b.*, 
              w.name as worker_name, w.skill_type as worker_skill,
              c.name as customer_name
       FROM bookings b
       JOIN workers w ON b.worker_id = w.id
       JOIN customers c ON b.customer_id = c.id
       WHERE b.id = ?`,
      [req.params.id]
    );

    res.json({
      success: true,
      message: `Booking #${req.params.id} marked as '${status}'.`,
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
