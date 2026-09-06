/**
 * Platform Super Admin Router - Cooperative Federation Authority
 * SevaSetu Connect
 */

const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware to check super admin header/param
const requireSuperAdmin = async (req, res, next) => {
  const userId = req.headers['x-user-id'] || req.query.admin_id;
  // If user ID provided, verify role
  if (userId) {
    const user = await db.get(`SELECT role FROM users WHERE id = ?`, [userId]);
    if (user && user.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized: Requires Platform Super Admin privileges' });
    }
  }
  next();
};

router.use(requireSuperAdmin);

// Federation-Wide Platform Overview
router.get('/overview', async (req, res) => {
  try {
    const societiesCount = await db.get(`SELECT COUNT(*) as total, 
      SUM(CASE WHEN approval_status = 'approved' THEN 1 ELSE 0 END) as approved,
      SUM(CASE WHEN approval_status = 'pending' THEN 1 ELSE 0 END) as pending
      FROM cooperative_societies`);

    const workersCount = await db.get(`SELECT COUNT(*) as total,
      SUM(CASE WHEN verification_status = 'verified' THEN 1 ELSE 0 END) as verified,
      SUM(CASE WHEN is_cooperative_member = 1 THEN 1 ELSE 0 END) as cooperative_members
      FROM workers`);

    const customersCount = await db.get(`SELECT COUNT(*) as total FROM customers`);

    const bookingsStats = await db.get(`SELECT COUNT(*) as total,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status = 'requested' OR status = 'accepted' THEN 1 ELSE 0 END) as active,
      COALESCE(SUM(total_amount), 0) as total_volume
      FROM bookings`);

    const totalVolume = bookingsStats.total_volume || 0;
    const welfarePool = Math.round(totalVolume * 0.05);

    // Distribution by district
    const districtBreakdown = await db.all(
      `SELECT district, COUNT(*) as count FROM workers GROUP BY district ORDER BY count DESC`
    );

    // Distribution by trade
    const tradeBreakdown = await db.all(
      `SELECT skill_type, COUNT(*) as count FROM workers GROUP BY skill_type ORDER BY count DESC`
    );

    res.json({
      success: true,
      stats: {
        totalSocieties: societiesCount.total || 0,
        approvedSocieties: societiesCount.approved || 0,
        pendingSocieties: societiesCount.pending || 0,
        totalWorkers: workersCount.total || 0,
        verifiedWorkers: workersCount.verified || 0,
        cooperativeMembers: workersCount.cooperative_members || 0,
        totalCustomers: customersCount.total || 0,
        totalBookings: bookingsStats.total || 0,
        activeBookings: bookingsStats.active || 0,
        completedBookings: bookingsStats.completed || 0,
        platformGmv: totalVolume,
        federationWelfarePool: welfarePool
      },
      districtBreakdown,
      tradeBreakdown
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// List All Societies with Federation Approval Statuses
router.get('/societies', async (req, res) => {
  try {
    const societies = await db.all(
      `SELECT s.*, 
              (SELECT COUNT(*) FROM workers WHERE society_id = s.id) as total_workers,
              (SELECT COUNT(*) FROM workers WHERE society_id = s.id AND verification_status = 'verified') as verified_workers
       FROM cooperative_societies s
       ORDER BY s.approval_status = 'pending' DESC, s.id ASC`
    );
    res.json({ success: true, count: societies.length, data: societies });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Register New Society into Federation (Super Admin creation or self-application)
router.post('/societies', async (req, res) => {
  try {
    const { name, district, state, registration_number, contact_phone, contact_email, description } = req.body;
    if (!name || !district || !state || !registration_number) {
      return res.status(400).json({ success: false, error: 'Society name, district, state, and registration number are required.' });
    }

    const existing = await db.get(`SELECT id FROM cooperative_societies WHERE registration_number = ?`, [registration_number]);
    if (existing) {
      return res.status(400).json({ success: false, error: 'A cooperative society with this registration number already exists.' });
    }

    const result = await db.run(
      `INSERT INTO cooperative_societies (name, district, state, registration_number, contact_phone, contact_email, approval_status, description)
       VALUES (?, ?, ?, ?, ?, ?, 'approved', ?)`,
      [name, district, state, registration_number, contact_phone, contact_email, description || '']
    );

    const newSoc = await db.get(`SELECT * FROM cooperative_societies WHERE id = ?`, [result.lastID]);
    res.status(201).json({ success: true, message: 'Cooperative society registered successfully!', data: newSoc });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Approve, Reject, or Suspend Society
router.patch('/societies/:id/status', async (req, res) => {
  try {
    const { status } = req.body; // 'approved', 'rejected', 'suspended', 'pending'
    const valid = ['approved', 'rejected', 'suspended', 'pending'];
    if (!valid.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${valid.join(', ')}` });
    }

    const society = await db.get(`SELECT * FROM cooperative_societies WHERE id = ?`, [req.params.id]);
    if (!society) {
      return res.status(404).json({ success: false, error: 'Cooperative society not found' });
    }

    await db.run(`UPDATE cooperative_societies SET approval_status = ? WHERE id = ?`, [status, req.params.id]);
    const updated = await db.get(`SELECT * FROM cooperative_societies WHERE id = ?`, [req.params.id]);

    res.json({
      success: true,
      message: `Society ${updated.name} approval status updated to '${status}'.`,
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Cross-Platform Global Worker Directory
router.get('/workers', async (req, res) => {
  try {
    const workers = await db.all(
      `SELECT w.*, s.name as society_name, s.approval_status as society_approval_status
       FROM workers w
       LEFT JOIN cooperative_societies s ON w.society_id = s.id
       ORDER BY w.created_at DESC`
    );
    res.json({ success: true, count: workers.length, data: workers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Cross-Platform Global Customer Directory
router.get('/customers', async (req, res) => {
  try {
    const customers = await db.all(
      `SELECT c.*, 
              (SELECT COUNT(*) FROM bookings WHERE customer_id = c.id) as total_bookings
       FROM customers c
       ORDER BY c.created_at DESC`
    );
    res.json({ success: true, count: customers.length, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
