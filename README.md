# 🧠 FocusFlow Task Manager

A full-stack Flask app with a secure backend and a custom-built JavaScript frontend for managing tasks between users. Supports HTTPS (via mkcert), user auth, CRUD, and clean API design.

---

## Intro

FocusFlow is a simple but secure task management app built from scratch with Flask and vanilla JS. Whether you’re managing your to-dos or learning how full-stack apps work, this project shows how to build clean APIs, session-based auth, and a custom frontend—all without using frameworks.

---

## ✨ Features

- 🔐 Secure user login with hashed passwords and session cookies
- 📋 Add, edit, and delete tasks in real time (no page reloads)
- 🌐 HTTPS and CORS setup for secure local dev
- 🧪 Unit-tested API endpoints and validation
- 🧼 Custom script to export clean code dumps for review

---

## 📸 Screenshots

Screenshots coming soon:

- Login page
- Task dashboard
- Task creation modal
- Mobile layout (if applicable)

---

## 🛠️ Tech Stack

- **Backend**: Flask, Flask-Login, Flask-Migrate, SQLAlchemy
- **Database**: SQLite
- **Frontend**: Vanilla JavaScript, HTML, CSS
- **Auth**: Session-based with hashed passwords
- **HTTPS**: mkcert-enabled with `.env` cert paths
- **CORS**: Configurable via environment variable
- **Testing**: Python `unittest`

---

## 🚀 Setup Guide

### 0. Install dependencies

```bash
pip install -r requirements.txt
```

---

### 1. Generate a secret key

```bash
python -c "import secrets; print(secrets.token_hex())"
```

Copy it into your `.env`:

```env
SECRET_KEY=your-generated-key
```

---

### 2. Create HTTPS certs (recommended)

**Option A** – Quick localhost dev mode:

```bash
mkcert -install
mkcert localhost
```

Add to `.env`:

```env
SSL_CERT=localhost.pem
SSL_KEY=localhost-key.pem
DOMAIN=localhost
```

**Option B** – Custom local domain (optional advanced):

1. Edit your `/etc/hosts` or `C:\Windows\System32\drivers\etc\hosts`:

```
127.0.0.1 awa.com
```

2. Run:

```bash
mkcert awa.com "*.awa.com" 127.0.0.1
```

3. Add to `.env`:

```env
DOMAIN=awa.com
SSL_CERT=awa.com.pem
SSL_KEY=awa.com-key.pem
CORS_ORIGINS=https://awa.com:5000
```

---

### 3. CORS Config

Set your expected frontend origin in `.env`:

```env
CORS_ORIGINS=https://localhost:5000
```

---

### 4. Database Migrations

This app uses **Flask-Migrate** to manage database schema changes.

#### 🛠 First-time DB Setup:

```bash
flask --app run.py db init
flask --app run.py db migrate -m "initial"
flask --app run.py db upgrade
```

#### 📈 After updating `models.py`:

```bash
flask --app run.py db migrate -m "updated schema"
flask --app run.py db upgrade
```

You can commit your `migrations/` folder or let users generate it from models.

---

### 5. Run it

```bash
python run.py
```

---

### 6. Testing

```bash
python -m unittest
```

---

## 📸 Screenshot

_Coming soon: a visual preview of the app in action._

---

## 💬 Contact

Built by **Kyle Brougham-Cook**
💻 [LinkedIn](https://linkedin.com/in/kyle-brougham-cook-718b672a4)
📬 Open to freelance work, contracts, backend, or remote full-stack roles.

---

## 🗂️ .env.example

```env
SECRET_KEY=your-secret-key-here
DOMAIN=localhost
SSL_CERT=localhost.pem
SSL_KEY=localhost-key.pem
CORS_ORIGINS=https://localhost:5000
```
