const express = require('express');
const fs = require('fs');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const auth = require('basic-auth');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// === STATIC FILE SERVING - ADD THIS SECTION ===
// Serve static files from the parent directory (where index.html is located)
app.use(express.static(path.join(__dirname, '..')));

// Serve assets directory explicitly
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

// === MySQL RDS Connection ===
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// === Health Check Endpoints (Required for Kubernetes) ===
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/ready', (req, res) => {
  // Check database connection
  db.query('SELECT 1', (err) => {
    if (err) {
      console.error('Database readiness check failed:', err);
      return res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed'
      });
    }
    
    // Check if views file exists and is accessible
    try {
      const viewFile = 'views.json';
      if (!fs.existsSync(viewFile)) {
        fs.writeFileSync(viewFile, JSON.stringify({ count: 0 }));
      }
      
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        services: {
          database: 'connected',
          filesystem: 'accessible'
        }
      });
    } catch (fileError) {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: 'File system access failed'
      });
    }
  });
});

// === Metrics Endpoint (for Prometheus monitoring) ===
app.get('/metrics', (req, res) => {
  const memUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  let metrics = `# HELP nodejs_memory_usage_bytes Memory usage in bytes
# TYPE nodejs_memory_usage_bytes gauge
nodejs_memory_usage_bytes{type="rss"} ${memUsage.rss}
nodejs_memory_usage_bytes{type="heapTotal"} ${memUsage.heapTotal}
nodejs_memory_usage_bytes{type="heapUsed"} ${memUsage.heapUsed}
nodejs_memory_usage_bytes{type="external"} ${memUsage.external}

# HELP nodejs_uptime_seconds Process uptime in seconds
# TYPE nodejs_uptime_seconds gauge
nodejs_uptime_seconds ${uptime}

# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
`;

  // Add view count metric if available
  try {
    const viewFile = 'views.json';
    if (fs.existsSync(viewFile)) {
      const views = JSON.parse(fs.readFileSync(viewFile));
      metrics += `http_requests_total{method="GET",endpoint="/api/views"} ${views.count}\n`;
    }
  } catch (err) {
    console.error('Error reading views for metrics:', err);
  }

  res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  res.send(metrics);
});

// === Basic Auth Middleware for Admin Panel ===
const adminAuth = (req, res, next) => {
  const user = auth(req);
  const username = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASS;

  if (user && user.name === username && user.pass === password) {
    return next();
  }

  res.set('WWW-Authenticate', 'Basic realm="Admin Area"');
  return res.status(401).send('Authentication required.');
};

// === Serve Admin Panel with Auth ===
app.use('/admin', adminAuth, express.static(path.join(__dirname, '../admin')));

// === Contact Form Endpoint ===
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  const sql = 'INSERT INTO messages (name, email, message) VALUES (?, ?, ?)';
  db.query(sql, [name, email, message], async (err, result) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).send('Database error');
    }

    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    const mailOptions = {
      from: 'india.indraq@gmail.com',
      to: '99bharat77@gmail.com',
      subject: `Message from ${name}`,
      text: `You received a message from:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      replyTo: email
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).send('Message saved and email sent');
    } catch (err) {
      res.status(500).send('Saved to DB, but email failed: ' + err.message);
    }
  });
});

// === Visitor Counter ===
const viewFile = 'views.json';
if (!fs.existsSync(viewFile)) fs.writeFileSync(viewFile, JSON.stringify({ count: 0 }));

app.get('/api/views', (req, res) => {
  let views = JSON.parse(fs.readFileSync(viewFile));
  views.count += 1;
  fs.writeFileSync(viewFile, JSON.stringify(views));
  const formattedViews = views.count.toLocaleString('en-IN');
  res.json({ views: formattedViews });
});

// === API to Fetch Messages (used by admin panel) ===
app.get('/api/messages', adminAuth, (req, res) => {
  db.query('SELECT * FROM messages ORDER BY timestamp DESC', (err, results) => {
    if (err) {
      console.error('Fetch error:', err);
      return res.status(500).send('Failed to fetch messages');
    }
    res.json(results);
  });
});

// === Graceful Shutdown Handling ===
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  
  db.end(() => {
    console.log('Database connections closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  
  db.end(() => {
    console.log('Database connections closed');
    process.exit(0);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Access your app at: http://localhost:${PORT}`);
});

// Export app for testing
module.exports = app;