const express = require('express');
const fs = require('fs');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// === Contact Form Endpoint ===
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'india.indraq@gmail.com',
      pass: 'crbh bnec phpr xpra'  // generate from https://myaccount.google.com/apppasswords
    }
  });

  const mailOptions = {
    from: email,
    to: '99bharat77@gmail.com',
    subject: `Message from ${name}`,
    text: message
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('Message sent successfully!');
  } catch (err) {
    res.status(500).send('Error sending email: ' + err.message);
  }
});

// === Visitor Counter Endpoint ===
const viewFile = 'views.json';
if (!fs.existsSync(viewFile)) fs.writeFileSync(viewFile, JSON.stringify({ count: 0 }));

app.get('/api/views', (req, res) => {
  let views = JSON.parse(fs.readFileSync(viewFile));
  views.count += 1;
  fs.writeFileSync(viewFile, JSON.stringify(views));
  res.json({ views: views.count });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
