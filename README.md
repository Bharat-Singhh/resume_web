# 🚀 Bharat Singh's Portfolio Website

Welcome to my **cloud-hosted, full-stack DevOps-ready portfolio website** built to showcase my projects, experience, and real-world infrastructure skills.

<div align="center">
  <img src="https://bharatsingh.cloud/assets/images/my-avatar.png" width="140" alt="Logo" />
</div>

### 🌐 Live Demo → [bharatsingh.cloud](https://bharatsingh.cloud)

---

## 📌 Features

✅ Responsive and modern UI  
✅ Working contact form (email + database logging)  
✅ Visitor counter 
✅ Admin panel with login + message management  
✅ CI/CD with Jenkins  
✅ Cloud-native hosting (AWS EC2 + RDS)  
✅ Reverse proxy with SSL (Nginx + Let's Encrypt)

---

## 🧑‍💻 Tech Stack

| Frontend     | Backend      | DevOps / Cloud     |
|--------------|--------------|--------------------|
| HTML/CSS/JS  | Node.js + Express | AWS EC2 (Ubuntu)     |
| Responsive Design | MySQL (AWS RDS) | AWS RDS (MySQL DB)  |
| Animated Cards | Nodemailer        | Jenkins CI/CD       |
| Dashboard (admin) | RESTful APIs   | Nginx + SSL         |

---

## 🏗️ Architecture Overview

```plaintext
User ↔️ EC2 (Nginx reverse proxy)
        ├── /api/contact  ➝  Node.js ➝ RDS ➝ Email
        ├── /api/views    ➝  JSON file tracker
        └── /admin        ➝  Secure admin panel
