/**
 * SQLite Database Connection and Promise Wrapper
 * SevaSetu Connect
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'sevasetu.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Error opening SQLite database:', err.message);
  } else {
    console.log(`Connected to SQLite database at: ${DB_PATH}`);
  }
});

// Promisified helper methods
const query = {
  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },

  exec: (sql) => {
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },

  initSchema: async () => {
    const schemaSql = `
      CREATE TABLE IF NOT EXISTS cooperative_societies (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          district TEXT NOT NULL,
          state TEXT NOT NULL,
          registration_number TEXT NOT NULL UNIQUE,
          contact_phone TEXT,
          contact_email TEXT,
          approval_status TEXT DEFAULT 'approved',
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS workers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          skill_type TEXT NOT NULL,
          phone TEXT NOT NULL UNIQUE,
          email TEXT,
          location TEXT NOT NULL,
          district TEXT NOT NULL,
          society_id INTEGER NULL,
          is_cooperative_member BOOLEAN DEFAULT 0,
          verification_status TEXT DEFAULT 'pending',
          hourly_rate REAL DEFAULT 250.0,
          experience_years INTEGER DEFAULT 3,
          rating REAL DEFAULT 4.8,
          review_count INTEGER DEFAULT 12,
          bio TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (society_id) REFERENCES cooperative_societies(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS customers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          phone TEXT NOT NULL UNIQUE,
          location TEXT NOT NULL,
          district TEXT NOT NULL,
          email TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          phone TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'customer',
          society_id INTEGER NULL,
          worker_id INTEGER NULL,
          customer_id INTEGER NULL,
          is_verified BOOLEAN DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (society_id) REFERENCES cooperative_societies(id) ON DELETE SET NULL,
          FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE SET NULL,
          FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS bookings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_id INTEGER NOT NULL,
          worker_id INTEGER NOT NULL,
          service_type TEXT NOT NULL,
          booking_type TEXT DEFAULT 'one-time',
          recurrence_detail TEXT,
          status TEXT DEFAULT 'requested',
          scheduled_date TEXT NOT NULL,
          location TEXT NOT NULL,
          notes TEXT,
          total_amount REAL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
          FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          posted_by_type TEXT NOT NULL,
          posted_by_id INTEGER NOT NULL,
          posted_by_name TEXT NOT NULL,
          post_type TEXT NOT NULL,
          service_type TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          location TEXT NOT NULL,
          district TEXT NOT NULL,
          preferred_date TEXT,
          budget_or_rate TEXT,
          recurrence_type TEXT DEFAULT 'one-time',
          status TEXT DEFAULT 'open',
          applications_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS post_applications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          post_id INTEGER NOT NULL,
          worker_id INTEGER NOT NULL,
          worker_name TEXT NOT NULL,
          worker_skill TEXT NOT NULL,
          worker_phone TEXT NOT NULL,
          message TEXT,
          status TEXT DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
          FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
      );
    `;
    await query.exec(schemaSql);
  }
};

module.exports = query;
