/**
 * Cooperative Societies Router
 * Multi-tenancy endpoint and society information
 */

const express = require('express');
const router = express.Router();
const db = require('../db');

// List all registered cooperative societies
router.get('/', async (req, res) => {
  try {
    const societies = await db.all(
      `SELECT s.*, 
              (SELECT COUNT(*) FROM workers WHERE society_id = s.id) as total_workers,
              (SELECT COUNT(*) FROM workers WHERE society_id = s.id AND verification_status = 'verified') as verified_workers,
              (SELECT COUNT(*) FROM workers WHERE society_id = s.id AND verification_status = 'pending') as pending_workers
       FROM cooperative_societies s
       ORDER BY s.id ASC`
    );
    res.json({ success: true, count: societies.length, data: societies });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single society by ID
router.get('/:id', async (req, res) => {
  try {
    const society = await db.get(
      `SELECT * FROM cooperative_societies WHERE id = ?`,
      [req.params.id]
    );
    if (!society) {
      return res.status(404).json({ success: false, error: 'Cooperative society not found' });
    }
    res.json({ success: true, data: society });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Multi-tenant Admin Dashboard for a specific society
router.get('/:id/dashboard', async (req, res) => {
  const societyId = req.params.id;
  try {
    const society = await db.get(
      `SELECT * FROM cooperative_societies WHERE id = ?`,
      [societyId]
    );

    if (!society) {
      return res.status(404).json({ success: false, error: 'Cooperative society not found' });
    }

    // Tenant-isolated workers
    const workers = await db.all(
      `SELECT * FROM workers WHERE society_id = ? ORDER BY created_at DESC`,
      [societyId]
    );

    // Tenant-isolated pending verifications
    const pendingWorkers = workers.filter(w => w.verification_status === 'pending');
    const verifiedWorkers = workers.filter(w => w.verification_status === 'verified');

    // Tenant-isolated bookings for this society's workers
    const bookings = await db.all(
      `SELECT b.*, 
              w.name as worker_name, w.skill_type as worker_skill,
              c.name as customer_name, c.phone as customer_phone
       FROM bookings b
       JOIN workers w ON b.worker_id = w.id
       JOIN customers c ON b.customer_id = c.id
       WHERE w.society_id = ?
       ORDER BY b.created_at DESC`,
      [societyId]
    );

    // Aggregate statistics
    const totalEarnings = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.total_amount || 0), 0);

    const activeBookingsCount = bookings.filter(b => b.status === 'requested' || b.status === 'accepted').length;

    // Breakdown by skill
    const skillCounts = {};
    workers.forEach(w => {
      skillCounts[w.skill_type] = (skillCounts[w.skill_type] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        society,
        stats: {
          totalMembers: workers.length,
          verifiedMembers: verifiedWorkers.length,
          pendingVerifications: pendingWorkers.length,
          totalBookings: bookings.length,
          activeBookings: activeBookingsCount,
          completedBookings: bookings.filter(b => b.status === 'completed').length,
          totalCooperativeGmv: totalEarnings,
          cooperativeWelfarePool: Math.round(totalEarnings * 0.05) // 5% fair cooperative dividend/welfare pool
        },
        skillBreakdown: skillCounts,
        pendingWorkers,
        allWorkers: workers,
        recentBookings: bookings
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
