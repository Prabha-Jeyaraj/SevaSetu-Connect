/**
 * Community Posts Router - Bidirectional Job Requirements, Availability Offers, and Worker Collabs
 * SevaSetu Connect - Posts Route
 */

const express = require('express');
const router = express.Router();
const db = require('../db');

// List community posts with filters
router.get('/', async (req, res) => {
  try {
    const { post_type, service_type, district, posted_by_type, status } = req.query;

    let sql = `SELECT * FROM posts WHERE 1=1`;
    const params = [];

    if (post_type && post_type !== 'all') {
      sql += ` AND post_type = ?`;
      params.push(post_type);
    }

    if (service_type && service_type !== 'all') {
      sql += ` AND LOWER(service_type) = LOWER(?)`;
      params.push(service_type);
    }

    if (district && district !== 'all') {
      sql += ` AND (LOWER(district) = LOWER(?) OR LOWER(location) LIKE LOWER(?))`;
      params.push(district, `%${district}%`);
    }

    if (posted_by_type) {
      sql += ` AND posted_by_type = ?`;
      params.push(posted_by_type);
    }

    if (status) {
      sql += ` AND status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY created_at DESC`;

    const posts = await db.all(sql, params);
    res.json({ success: true, count: posts.length, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single post with its applications
router.get('/:id', async (req, res) => {
  try {
    const post = await db.get(`SELECT * FROM posts WHERE id = ?`, [req.params.id]);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const applications = await db.all(
      `SELECT a.*, w.rating as worker_rating, w.is_cooperative_member, w.verification_status
       FROM post_applications a
       JOIN workers w ON a.worker_id = w.id
       WHERE a.post_id = ?
       ORDER BY a.created_at DESC`,
      [req.params.id]
    );

    res.json({ success: true, data: { ...post, applications } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create new post (Customer Job Request, Worker Availability, or Worker-to-Worker Collab)
router.post('/', async (req, res) => {
  try {
    const {
      posted_by_type,
      posted_by_id,
      posted_by_name,
      post_type,
      service_type,
      title,
      description,
      location,
      district,
      preferred_date,
      budget_or_rate,
      recurrence_type
    } = req.body;

    if (!posted_by_type || !post_type || !service_type || !title || !description || !location) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: posted_by_type, post_type, service_type, title, description, and location are required.'
      });
    }

    const parsedDistrict = district || location.split(',').pop().trim() || 'General';

    const result = await db.run(
      `INSERT INTO posts 
       (posted_by_type, posted_by_id, posted_by_name, post_type, service_type, title, description, location, district, preferred_date, budget_or_rate, recurrence_type, status, applications_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', 0)`,
      [
        posted_by_type,
        posted_by_id || 1,
        posted_by_name || 'Community Member',
        post_type,
        service_type,
        title,
        description,
        location,
        parsedDistrict,
        preferred_date || 'Flexible',
        budget_or_rate || 'Negotiable',
        recurrence_type || 'one-time'
      ]
    );

    const newPost = await db.get(`SELECT * FROM posts WHERE id = ?`, [result.lastID]);

    res.status(201).json({
      success: true,
      message: 'Post published successfully to the SevaSetu community board!',
      data: newPost
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Worker applies to a post
router.post('/:id/apply', async (req, res) => {
  try {
    const postId = req.params.id;
    const { worker_id, message } = req.body;

    if (!worker_id) {
      return res.status(400).json({ success: false, error: 'worker_id is required' });
    }

    const post = await db.get(`SELECT * FROM posts WHERE id = ?`, [postId]);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const worker = await db.get(`SELECT * FROM workers WHERE id = ?`, [worker_id]);
    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }

    // Check if worker already applied
    const existing = await db.get(
      `SELECT id FROM post_applications WHERE post_id = ? AND worker_id = ?`,
      [postId, worker_id]
    );
    if (existing) {
      return res.status(400).json({ success: false, error: 'You have already applied for this post.' });
    }

    // Insert application
    await db.run(
      `INSERT INTO post_applications (post_id, worker_id, worker_name, worker_skill, worker_phone, message, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [postId, worker.id, worker.name, worker.skill_type, worker.phone, message || 'I am available for this assignment.']
    );

    // Increment application count
    await db.run(
      `UPDATE posts SET applications_count = applications_count + 1 WHERE id = ?`,
      [postId]
    );

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! The poster has been notified.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
