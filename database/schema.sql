-- SevaSetu Connect - Database Schema
-- Cooperative-Owned Gig-Work Marketplace Platform

-- 1. Cooperative Society Table
CREATE TABLE IF NOT EXISTS cooperative_societies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    registration_number TEXT NOT NULL UNIQUE,
    contact_phone TEXT,
    contact_email TEXT,
    approval_status TEXT DEFAULT 'approved', -- 'approved', 'pending', 'suspended'
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Worker Table
CREATE TABLE IF NOT EXISTS workers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    skill_type TEXT NOT NULL, -- e.g. Electrician, Plumber, Carpenter, Caregiver, Painter
    phone TEXT NOT NULL UNIQUE,
    email TEXT,
    location TEXT NOT NULL,
    district TEXT NOT NULL,
    society_id INTEGER NULL, -- Nullable for independent workers
    is_cooperative_member BOOLEAN DEFAULT 0,
    verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
    hourly_rate REAL DEFAULT 250.0,
    experience_years INTEGER DEFAULT 3,
    rating REAL DEFAULT 4.8,
    review_count INTEGER DEFAULT 12,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (society_id) REFERENCES cooperative_societies(id) ON DELETE SET NULL
);

-- 3. Customer Table
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    location TEXT NOT NULL,
    district TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. User Accounts Table (Authentication & Role-Based Access)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer', -- 'customer', 'worker', 'society_admin', 'super_admin'
    society_id INTEGER NULL,
    worker_id INTEGER NULL,
    customer_id INTEGER NULL,
    is_verified BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (society_id) REFERENCES cooperative_societies(id) ON DELETE SET NULL,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- 5. Booking Table
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    worker_id INTEGER NOT NULL,
    service_type TEXT NOT NULL,
    booking_type TEXT DEFAULT 'one-time', -- 'one-time', 'recurring', 'fixed-term'
    recurrence_detail TEXT, -- e.g. "Repeat every 7 days" or "3 weeks duration"
    status TEXT DEFAULT 'requested', -- 'requested', 'accepted', 'in_progress', 'completed', 'cancelled'
    scheduled_date TEXT NOT NULL,
    location TEXT NOT NULL,
    notes TEXT,
    total_amount REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
);

-- 6. Community Posts Table (Bidirectional Job & Availability Feed)
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    posted_by_type TEXT NOT NULL, -- 'customer' or 'worker'
    posted_by_id INTEGER NOT NULL, -- worker_id or customer_id
    posted_by_name TEXT NOT NULL,
    post_type TEXT NOT NULL, -- 'job_request', 'availability_offer', 'worker_collab'
    service_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    district TEXT NOT NULL,
    preferred_date TEXT,
    budget_or_rate TEXT,
    recurrence_type TEXT DEFAULT 'one-time',
    status TEXT DEFAULT 'open', -- 'open', 'fulfilled', 'closed'
    applications_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Post Applications Table
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
