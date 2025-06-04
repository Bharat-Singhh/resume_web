const express = require('express');
const fs = require('fs');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const auth = require('basic-auth');
const path = require('path');

const app = express();
const PORT = port;

app.use(cors());
app.use(bodyParser.json());

// === MySQL RDS Connection ===
// const db = mysql.createConnection({
//   host: 'rdsendpoint',
//   user: 'user',
//   password: 'pswd', // Use your actual password securely
//   database: 'db_name'
// });

db.connect(err => {
  if (err) console.error('MySQL connection error:', err);
  else console.log('Connected to MySQL RDS');
});

// === Basic Auth Middleware for Admin Panel ===
// const adminAuth = (req, res, next) => {
//   const user = auth(req);
//   const username = 'admin';
//   const password = 'pswd'; // Change this to your secure password

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

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'email@gmail.com',
        pass: 'pswd' // Gmail app password
      }
    });

    const mailOptions = {
      from: 'gmail.com',
      to: 'gmail.com',
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
