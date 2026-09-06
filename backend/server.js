/**
 * SevaSetu Connect - Unified Express REST API & Static Frontend Server
 * Single deployable service (1 server, 1 port)
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'SevaSetu Connect Unified Server',
    timestamp: new Date().toISOString(),
    version: '1.3.0'
  });
});

// Register API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/societies', require('./routes/societies'));
app.use('/api/workers', require('./routes/workers'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/forecast', require('./routes/forecast'));
app.use('/api/admin/platform', require('./routes/superAdmin'));

// Re-seed Database endpoint (only resets sample data rows without touching active client sessions)
app.post('/api/admin/reseed', async (req, res) => {
  try {
    const seed = require('./seed');
    await seed();
    res.json({ 
      success: true, 
      message: 'Database reseeded successfully with fresh sample data! (User sessions remain intact)' 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve built static React frontend from frontend/dist (Unified Single-Deployable Service)
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  console.log(`📦 Serving React frontend from: ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));

  // Client-side routing fallback (for non-API requests)
  app.get('*', (req, res) => {
    if (!req.url.startsWith('/api')) {
      res.sendFile(path.join(frontendDistPath, 'index.html'));
    } else {
      res.status(404).json({ success: false, error: 'API endpoint not found' });
    }
  });
} else {
  console.log(`ℹ️ Frontend build not found at ${frontendDistPath}. Run "npm run build" to generate static assets.`);
}

// Initialize DB and start server
async function startServer() {
  try {
    await db.initSchema();
    
    // Check if societies exist, if not seed automatically
    const count = await db.get('SELECT COUNT(*) as count FROM cooperative_societies');
    if (!count || count.count === 0) {
      console.log('Database is empty. Automatically running initial seed...');
      const seed = require('./seed');
      await seed();
    }

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 SevaSetu Connect Unified Server running on http://localhost:${PORT}`);
      console.log(`📡 Both React Frontend & REST API served from port ${PORT}`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
  }
}

startServer();
