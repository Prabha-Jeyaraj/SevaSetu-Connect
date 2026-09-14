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

    // REQUIREMENT 1: 10% Total Platform Fee broken into 3 tracked components
    // 90% Direct Worker payment
    // 6% Platform Operations
    // 2% Government Insurance Premium Fund (PMSBY/PMJJBY)
    // 2% Training & Quality Fund
    const workerDirectPayout = Math.round(totalEarnings * 0.90);
    const platformOpsFund = Math.round(totalEarnings * 0.06);
    const insuranceFund = Math.round(totalEarnings * 0.02);
    const trainingQualityFund = Math.round(totalEarnings * 0.02);
    const totalPlatformFee = Math.round(totalEarnings * 0.10);

    // REQUIREMENT 5: Aggregate worker metrics for Society Admin Internal Leaderboard
    const workerStatsMap = {};
    bookings.filter(b => b.status === 'completed').forEach(b => {
      if (!workerStatsMap[b.worker_id]) {
        workerStatsMap[b.worker_id] = { completedJobs: 0, totalEarned: 0 };
      }
      workerStatsMap[b.worker_id].completedJobs += 1;
      workerStatsMap[b.worker_id].totalEarned += (b.total_amount || 0);
    });

    const leaderboardWorkers = workers.map(w => {
      const wStat = workerStatsMap[w.id] || { completedJobs: 0, totalEarned: 0 };
      return {
        ...w,
        completed_jobs_count: wStat.completedJobs,
        total_gross_earnings: wStat.totalEarned,
        total_net_payout: Math.round(wStat.totalEarned * 0.90),
        is_retraining_flagged: (w.rating < 3.8 && w.retraining_status !== 'Completed') || w.retraining_status === 'Assigned' || w.retraining_status === 'Still Below Threshold',
        requires_manual_review: w.retraining_status === 'Still Below Threshold'
      };
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
          workerDirectPayout,
          totalPlatformFee,
          platformOpsFund,      // 6%
          insuranceFund,        // 2% (PMSBY/PMJJBY)
          trainingQualityFund   // 2%
        },
        skillBreakdown: skillCounts,
        pendingWorkers,
        allWorkers: workers,
        leaderboardWorkers,
        recentBookings: bookings
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
