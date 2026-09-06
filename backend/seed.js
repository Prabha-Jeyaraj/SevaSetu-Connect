/**
 * Database Seed Script - SevaSetu Connect
 * Populates realistic cooperative societies, workers, customers, users, bookings, and community posts.
 */

const db = require('./db');

async function seedDatabase() {
  console.log('🌱 Starting database seeding for SevaSetu Connect...');

  try {
    // Drop existing tables to apply updated schema column definitions
    await db.exec(`
      DROP TABLE IF EXISTS post_applications;
      DROP TABLE IF EXISTS posts;
      DROP TABLE IF EXISTS bookings;
      DROP TABLE IF EXISTS users;
      DROP TABLE IF EXISTS workers;
      DROP TABLE IF EXISTS customers;
      DROP TABLE IF EXISTS cooperative_societies;
    `);

    await db.initSchema();
    console.log('🧹 Cleared existing tables and initialized fresh schema.');

    // 1. Seed Cooperative Societies (Approved + 1 Pending for Super Admin workflow)
    const societies = [
      {
        id: 1,
        name: 'Pune Shramik Sahakari Sanstha',
        district: 'Pune',
        state: 'Maharashtra',
        registration_number: 'MH/PUN/COOP/2021/8892',
        contact_phone: '+91 98220 11445',
        contact_email: 'admin@puneshramik.coop',
        approval_status: 'approved',
        description: 'Pioneering multi-trade cooperative federation covering Western Maharashtra with 450+ skilled technicians.'
      },
      {
        id: 2,
        name: 'Bengaluru Kaushalya Karmik Sangha',
        district: 'Bengaluru',
        state: 'Karnataka',
        registration_number: 'KA/BLR/COOP/2020/4112',
        contact_phone: '+91 94480 33211',
        contact_email: 'admin@kaushalya.coop',
        approval_status: 'approved',
        description: 'Tech-enabled workers collective providing certified electrical, plumbing, and home care services across South & East Bengaluru.'
      },
      {
        id: 3,
        name: 'Delhi Karmik Vikas Samiti',
        district: 'Delhi',
        state: 'Delhi NCR',
        registration_number: 'DL/DEL/COOP/2019/1054',
        contact_phone: '+91 98110 55998',
        contact_email: 'admin@delhikarmik.org',
        approval_status: 'approved',
        description: 'Government registered cooperative society focusing on fair wages, vocational certifications, and artisan support.'
      },
      {
        id: 4,
        name: 'Jaipur Hastakala Sahakari Sanstha',
        district: 'Jaipur',
        state: 'Rajasthan',
        registration_number: 'RJ/JAI/COOP/2023/5521',
        contact_phone: '+91 94140 77112',
        contact_email: 'contact@jaipurhastakala.coop',
        approval_status: 'pending', // Pending approval for Super Admin demo
        description: 'Newly organized artisan and technician union applying to join the national federation.'
      }
    ];

    for (const s of societies) {
      await db.run(
        `INSERT INTO cooperative_societies (id, name, district, state, registration_number, contact_phone, contact_email, approval_status, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [s.id, s.name, s.district, s.state, s.registration_number, s.contact_phone, s.contact_email, s.approval_status, s.description]
      );
    }
    console.log(`✅ Seeded ${societies.length} Cooperative Societies.`);

    // 2. Seed Workers
    const workers = [
      // Pune Society Workers (Society 1)
      {
        name: 'Ramesh Shinde',
        skill_type: 'Electrician',
        phone: '+91 98221 00101',
        email: 'ramesh.shinde@example.com',
        location: 'Kothrud, Pune',
        district: 'Pune',
        society_id: 1,
        is_cooperative_member: 1,
        verification_status: 'verified',
        hourly_rate: 350,
        experience_years: 8,
        rating: 4.9,
        review_count: 38,
        bio: 'Certified master electrician with 8+ years experience in domestic wiring, 3-phase systems, and inverter setups.'
      },
      {
        name: 'Santosh Deshmukh',
        skill_type: 'Plumber',
        phone: '+91 98221 00102',
        email: 'santosh.deshmukh@example.com',
        location: 'Hadapsar, Pune',
        district: 'Pune',
        society_id: 1,
        is_cooperative_member: 1,
        verification_status: 'verified',
        hourly_rate: 300,
        experience_years: 6,
        rating: 4.8,
        review_count: 29,
        bio: 'Specialist in bathroom fittings, pipe leak detection, water tank cleaning, and overhead pressure pumps.'
      },
      {
        name: 'Sunita Patil',
        skill_type: 'Caregiver',
        phone: '+91 98221 00103',
        email: 'sunita.patil@example.com',
        location: 'Aundh, Pune',
        district: 'Pune',
        society_id: 1,
        is_cooperative_member: 1,
        verification_status: 'verified',
        hourly_rate: 280,
        experience_years: 5,
        rating: 4.95,
        review_count: 42,
        bio: 'Trained elderly care and post-surgery patient assistance with certified basic nursing and physiotherapy support.'
      },
      {
        name: 'Manoj Kulkarni',
        skill_type: 'Carpenter',
        phone: '+91 98221 00104',
        email: 'manoj.kulkarni@example.com',
        location: 'Baner, Pune',
        district: 'Pune',
        society_id: 1,
        is_cooperative_member: 1,
        verification_status: 'pending', // Pending verification for admin demo
        hourly_rate: 320,
        experience_years: 4,
        rating: 4.6,
        review_count: 14,
        bio: 'Furniture assembly, modular kitchen fitting, door lock installation, and custom wooden repairs.'
      },

      // Bengaluru Society Workers (Society 2)
      {
        name: 'Anand Gowda',
        skill_type: 'Electrician',
        phone: '+91 94480 00201',
        email: 'anand.gowda@example.com',
        location: 'Indiranagar, Bengaluru',
        district: 'Bengaluru',
        society_id: 2,
        is_cooperative_member: 1,
        verification_status: 'verified',
        hourly_rate: 400,
        experience_years: 7,
        rating: 4.85,
        review_count: 31,
        bio: 'Home automation expert, smart light setups, appliance troubleshooting, and commercial wiring.'
      },
      {
        name: 'Suresh Reddy',
        skill_type: 'Plumber',
        phone: '+91 94480 00202',
        email: 'suresh.reddy@example.com',
        location: 'Koramangala, Bengaluru',
        district: 'Bengaluru',
        society_id: 2,
        is_cooperative_member: 1,
        verification_status: 'verified',
        hourly_rate: 350,
        experience_years: 10,
        rating: 4.9,
        review_count: 55,
        bio: 'Expert in drainage systems, geyser installation, RO purification line setup, and sanitary plumbing.'
      },
      {
        name: 'Priya Nair',
        skill_type: 'Caregiver',
        phone: '+91 94480 00203',
        email: 'priya.nair@example.com',
        location: 'Whitefield, Bengaluru',
        district: 'Bengaluru',
        society_id: 2,
        is_cooperative_member: 1,
        verification_status: 'pending', // Pending verification
        hourly_rate: 300,
        experience_years: 4,
        rating: 4.7,
        review_count: 19,
        bio: 'Compassionate caregiver for geriatric care, mobility support, and medication management.'
      },
      {
        name: 'Naveen Kumar',
        skill_type: 'Painter',
        phone: '+91 94480 00204',
        email: 'naveen.kumar@example.com',
        location: 'Jayanagar, Bengaluru',
        district: 'Bengaluru',
        society_id: 2,
        is_cooperative_member: 1,
        verification_status: 'verified',
        hourly_rate: 270,
        experience_years: 5,
        rating: 4.75,
        review_count: 22,
        bio: 'Interior wall putty, waterproof texture coating, stencil wall designs, and exterior weather-coat painting.'
      },

      // Delhi Society Workers (Society 3)
      {
        name: 'Rajesh Sharma',
        skill_type: 'Electrician',
        phone: '+91 98110 00301',
        email: 'rajesh.sharma@example.com',
        location: 'Rohini, Delhi',
        district: 'Delhi',
        society_id: 3,
        is_cooperative_member: 1,
        verification_status: 'verified',
        hourly_rate: 380,
        experience_years: 9,
        rating: 4.9,
        review_count: 47,
        bio: 'High-voltage domestic repairs, AC stabilizing, modular switchboards, and fault finding.'
      },
      {
        name: 'Vikram Yadav',
        skill_type: 'Carpenter',
        phone: '+91 98110 00302',
        email: 'vikram.yadav@example.com',
        location: 'Dwarka, Delhi',
        district: 'Delhi',
        society_id: 3,
        is_cooperative_member: 1,
        verification_status: 'verified',
        hourly_rate: 340,
        experience_years: 6,
        rating: 4.8,
        review_count: 26,
        bio: 'Wardrobe restoration, sofa cushioning, wooden partition structures, and hinge repairs.'
      },
      {
        name: 'Pooja Jadhav',
        skill_type: 'Caregiver',
        phone: '+91 98110 00303',
        email: 'pooja.jadhav@example.com',
        location: 'Lajpat Nagar, Delhi',
        district: 'Delhi',
        society_id: 3,
        is_cooperative_member: 1,
        verification_status: 'pending', // Pending verification
        hourly_rate: 290,
        experience_years: 3,
        rating: 4.65,
        review_count: 11,
        bio: 'Child and senior care, dedicated day-shift assistance, and special nutritional meal preparation.'
      },

      // Independent Workers (Non-cooperative)
      {
        name: 'Amit Verma',
        skill_type: 'Plumber',
        phone: '+91 97110 00401',
        email: 'amit.verma@example.com',
        location: 'Viman Nagar, Pune',
        district: 'Pune',
        society_id: null,
        is_cooperative_member: 0,
        verification_status: 'verified',
        hourly_rate: 250,
        experience_years: 3,
        rating: 4.3,
        review_count: 9,
        bio: 'Independent freelance plumber handling tap leaks and bathroom clogs.'
      },
      {
        name: 'Deepak Joshi',
        skill_type: 'Electrician',
        phone: '+91 97110 00402',
        email: 'deepak.joshi@example.com',
        location: 'HSR Layout, Bengaluru',
        district: 'Bengaluru',
        society_id: null,
        is_cooperative_member: 0,
        verification_status: 'pending',
        hourly_rate: 260,
        experience_years: 2,
        rating: 4.2,
        review_count: 5,
        bio: 'Independent electrician for small household wiring fixes.'
      },
      {
        name: 'Harish Chawla',
        skill_type: 'Painter',
        phone: '+91 97110 00403',
        email: 'harish.chawla@example.com',
        location: 'Karol Bagh, Delhi',
        district: 'Delhi',
        society_id: null,
        is_cooperative_member: 0,
        verification_status: 'verified',
        hourly_rate: 240,
        experience_years: 4,
        rating: 4.4,
        review_count: 8,
        bio: 'Independent wall painter and whitewashing services.'
      }
    ];

    for (const w of workers) {
      await db.run(
        `INSERT INTO workers (name, skill_type, phone, email, location, district, society_id, is_cooperative_member, verification_status, hourly_rate, experience_years, rating, review_count, bio)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [w.name, w.skill_type, w.phone, w.email, w.location, w.district, w.society_id, w.is_cooperative_member, w.verification_status, w.hourly_rate, w.experience_years, w.rating, w.review_count, w.bio]
      );
    }
    console.log(`✅ Seeded ${workers.length} Workers.`);

    // 3. Seed Customers
    const customers = [
      {
        id: 1,
        name: 'Arjun Mehta',
        phone: '+91 98900 12345',
        location: 'Kothrud, Pune',
        district: 'Pune',
        email: 'arjun.mehta@example.com'
      },
      {
        id: 2,
        name: 'Sneha Rao',
        phone: '+91 98800 67890',
        location: 'Indiranagar, Bengaluru',
        district: 'Bengaluru',
        email: 'sneha.rao@example.com'
      },
      {
        id: 3,
        name: 'Vikramaditya Singhania',
        phone: '+91 98100 45678',
        location: 'Dwarka, Delhi',
        district: 'Delhi',
        email: 'vikram.singh@example.com'
      },
      {
        id: 4,
        name: 'Meera Iyer',
        phone: '+91 98230 98765',
        location: 'Aundh, Pune',
        district: 'Pune',
        email: 'meera.iyer@example.com'
      }
    ];

    for (const c of customers) {
      await db.run(
        `INSERT INTO customers (id, name, phone, location, district, email)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [c.id, c.name, c.phone, c.location, c.district, c.email]
      );
    }
    console.log(`✅ Seeded ${customers.length} Customers.`);

    // 4. Seed User Accounts for Authentication (Customers, Workers, Society Admins, Super Admin)
    const users = [
      // Super Admin
      {
        name: 'Federation Super Admin',
        email: 'superadmin@sevasetu.coop',
        phone: '+91 98000 00001',
        password: 'superadmin123',
        role: 'super_admin',
        society_id: null,
        worker_id: null,
        customer_id: null
      },
      // Society 1 Admin (Pune)
      {
        name: 'Pune Society Admin',
        email: 'admin@puneshramik.coop',
        phone: '+91 98220 11445',
        password: 'society123',
        role: 'society_admin',
        society_id: 1,
        worker_id: null,
        customer_id: null
      },
      // Society 2 Admin (Bengaluru)
      {
        name: 'Bengaluru Society Admin',
        email: 'admin@kaushalya.coop',
        phone: '+91 94480 33211',
        password: 'society123',
        role: 'society_admin',
        society_id: 2,
        worker_id: null,
        customer_id: null
      },
      // Society 3 Admin (Delhi)
      {
        name: 'Delhi Society Admin',
        email: 'admin@delhikarmik.org',
        phone: '+91 98110 55998',
        password: 'society123',
        role: 'society_admin',
        society_id: 3,
        worker_id: null,
        customer_id: null
      },
      // Seeded Customer User
      {
        name: 'Arjun Mehta',
        email: 'arjun.mehta@example.com',
        phone: '+91 98900 12345',
        password: 'customer123',
        role: 'customer',
        society_id: null,
        worker_id: null,
        customer_id: 1
      },
      // Seeded Worker User
      {
        name: 'Ramesh Shinde',
        email: 'ramesh.shinde@example.com',
        phone: '+91 98221 00101',
        password: 'worker123',
        role: 'worker',
        society_id: 1,
        worker_id: 1,
        customer_id: null
      }
    ];

    for (const u of users) {
      await db.run(
        `INSERT INTO users (name, email, phone, password, role, society_id, worker_id, customer_id, is_verified)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [u.name, u.email, u.phone, u.password, u.role, u.society_id, u.worker_id, u.customer_id]
      );
    }
    console.log(`✅ Seeded ${users.length} User Auth Accounts.`);

    // 5. Seed Bookings
    const bookings = [
      {
        customer_id: 1,
        worker_id: 1, // Ramesh Shinde (Electrician)
        service_type: 'Electrician',
        booking_type: 'one-time',
        recurrence_detail: null,
        status: 'accepted',
        scheduled_date: '2026-09-10 10:00 AM',
        location: 'Flat 402, Green Meadows, Kothrud, Pune',
        notes: 'Inverter connection tripping frequently when heavy appliances run.',
        total_amount: 700
      },
      {
        customer_id: 4,
        worker_id: 3, // Sunita Patil (Caregiver)
        service_type: 'Caregiver',
        booking_type: 'recurring',
        recurrence_detail: 'Daily morning 8 AM to 12 PM (Repeat every 1 day)',
        status: 'accepted',
        scheduled_date: '2026-09-08 08:00 AM',
        location: 'Plot 12, Sindh Society, Aundh, Pune',
        notes: 'Assistance required for senior citizen post knee-replacement mobility.',
        total_amount: 5600
      },
      {
        customer_id: 2,
        worker_id: 5, // Anand Gowda (Electrician)
        service_type: 'Electrician',
        booking_type: 'one-time',
        recurrence_detail: null,
        status: 'requested',
        scheduled_date: '2026-09-12 02:30 PM',
        location: '100ft Road, Indiranagar, Bengaluru',
        notes: 'Install 4 smart downlights in the living room and check circuit breaker.',
        total_amount: 800
      },
      {
        customer_id: 3,
        worker_id: 9, // Rajesh Sharma (Electrician)
        service_type: 'Electrician',
        booking_type: 'fixed-term',
        recurrence_detail: '2 weeks site supervision',
        status: 'completed',
        scheduled_date: '2026-08-20 09:00 AM',
        location: 'Sector 10, Dwarka, Delhi',
        notes: 'Full house rewiring after renovation.',
        total_amount: 14500
      },
      {
        customer_id: 1,
        worker_id: 2, // Santosh Deshmukh (Plumber)
        service_type: 'Plumber',
        booking_type: 'one-time',
        recurrence_detail: null,
        status: 'completed',
        scheduled_date: '2026-08-28 11:00 AM',
        location: 'Kothrud, Pune',
        notes: 'Monsoon terrace drainage blockage clearing.',
        total_amount: 600
      }
    ];

    for (const b of bookings) {
      await db.run(
        `INSERT INTO bookings (customer_id, worker_id, service_type, booking_type, recurrence_detail, status, scheduled_date, location, notes, total_amount)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [b.customer_id, b.worker_id, b.service_type, b.booking_type, b.recurrence_detail, b.status, b.scheduled_date, b.location, b.notes, b.total_amount]
      );
    }
    console.log(`✅ Seeded ${bookings.length} Bookings.`);

    // 6. Seed Community Posts
    const posts = [
      {
        posted_by_type: 'customer',
        posted_by_id: 1,
        posted_by_name: 'Arjun Mehta',
        post_type: 'job_request',
        service_type: 'Plumber',
        title: 'Urgent: Kitchen sink pipe leak repair needed',
        description: 'Under-sink PVC drainage pipe has developed a crack. Water leaking onto the floor. Need a verified cooperative plumber tomorrow morning.',
        location: 'Kothrud, Pune',
        district: 'Pune',
        preferred_date: '2026-09-08',
        budget_or_rate: '₹400 - ₹600',
        recurrence_type: 'one-time',
        status: 'open',
        applications_count: 1
      },
      {
        posted_by_type: 'customer',
        posted_by_id: 2,
        posted_by_name: 'Sneha Rao',
        post_type: 'job_request',
        service_type: 'Carpenter',
        title: 'Custom bookshelves and balcony planter rack',
        description: 'Need a carpenter to assemble and mount 2 wooden bookshelves and custom polish a balcony plant stand.',
        location: 'Indiranagar, Bengaluru',
        district: 'Bengaluru',
        preferred_date: '2026-09-14',
        budget_or_rate: '₹2,000 - ₹3,500',
        recurrence_type: 'one-time',
        status: 'open',
        applications_count: 2
      },
      {
        posted_by_type: 'worker',
        posted_by_id: 2,
        posted_by_name: 'Santosh Deshmukh (Cooperative Plumber)',
        post_type: 'worker_collab',
        service_type: 'Electrician',
        title: 'Plumber seeking Electrician partner for 3-BHK bathroom remodel',
        description: 'I am executing a full bathroom renovation in Kothrud. Need a trusted cooperative electrician for wiring geyser, exhaust fan, and LED vanity mirror.',
        location: 'Kothrud / Karve Nagar, Pune',
        district: 'Pune',
        preferred_date: '2026-09-15',
        budget_or_rate: '₹350/hr profit-share',
        recurrence_type: 'fixed-term',
        status: 'open',
        applications_count: 1
      },
      {
        posted_by_type: 'worker',
        posted_by_id: 8,
        posted_by_name: 'Naveen Kumar (Bengaluru Society)',
        post_type: 'availability_offer',
        service_type: 'Painter',
        title: 'Available for pre-festive wall texture & interior painting slots',
        description: 'Cooperative society certified painter with professional equipment available for bookings across East Bengaluru.',
        location: 'Indiranagar & Whitefield, Bengaluru',
        district: 'Bengaluru',
        preferred_date: '2026-09-10 to 2026-09-30',
        budget_or_rate: '₹270/hr or per sq.ft package',
        recurrence_type: 'one-time',
        status: 'open',
        applications_count: 0
      }
    ];

    for (const p of posts) {
      const res = await db.run(
        `INSERT INTO posts (posted_by_type, posted_by_id, posted_by_name, post_type, service_type, title, description, location, district, preferred_date, budget_or_rate, recurrence_type, status, applications_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.posted_by_type, p.posted_by_id, p.posted_by_name, p.post_type, p.service_type, p.title, p.description, p.location, p.district, p.preferred_date, p.budget_or_rate, p.recurrence_type, p.status, p.applications_count]
      );

      if (p.post_type === 'job_request' && p.title.includes('Kitchen sink')) {
        await db.run(
          `INSERT INTO post_applications (post_id, worker_id, worker_name, worker_skill, worker_phone, message, status)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [res.lastID, 2, 'Santosh Deshmukh', 'Plumber', '+91 98221 00102', 'I am available in Kothrud with replacement pipes and tools. Can visit at 9 AM.', 'pending']
        );
      }
    }
    console.log(`✅ Seeded ${posts.length} Community Posts & Applications.`);
    console.log('🎉 Database seeding completed successfully!');
  } catch (err) {
    console.error('❌ Error during database seeding:', err);
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
